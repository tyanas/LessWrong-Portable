#!/usr/bin/env nodejs

const parser = require('node-html-parser');
const makepub = require('nodepub');
const jetpack = require('fs-jetpack');
const { execSync } = require('child_process');
const { links: idxByUrl } = require('./links')

var version = process.argv.length > 2 ? process.argv[2] : 'default';

const config = JSON.parse(jetpack.read('meta/' + version + '.json'));

var scrapeError = false;


// LessWrong-Portable/example-EPUB-files/OEBPF/content $ cat *.xhtml|grep https://lesswrong.ru/w/ > ../../../missed.html
// cd -

function makeToc(links) {
  const tableOfContents = ['<h2>Table Of Contents</h2>', '<ul class="contents">'];

  links.forEach(link => {
    // console.log(`${link.link}#${link.title}`) // epub link, title
    if (link.itemType === 'main') {
      if (link.title.indexOf('Book ') !== -1) {
        tableOfContents.push(`<li><h1><a href="${link.link}">${link.title}</a></h1></li>`);
      } else if (link.title.indexOf('Part ') !== -1) {
        tableOfContents.push(`<li><h2><a href="${link.link}">${link.title}</a></h2></li>`);
      } else {
        tableOfContents.push(`<li><a href="${link.link}">${link.title}</a></li>`);
      }
    }
  });

  tableOfContents.push('</ul>');

  return tableOfContents.join('\n');
}

var epub = makepub.document(config.metadata, config.img, makeToc);

epub.addCSS(jetpack.read('style/base.css'));

epub.addSection('Title Page', '<h1>[[TITLE]]</h1><h3>by [[AUTHOR]]</h3>', true, true);

var base_content = jetpack.read('template.xhtml');

function addChapterToBook(html, urlConfig, cache_path) {
  const document = parser.parse(html);
  let path = urlConfig;
  let { titleSelector, contentSelector } = config;

  if (typeof urlConfig === 'object') {
    path = urlConfig.url;
    if (urlConfig.selectorSet) {
      const selectors = config.selectorSets[urlConfig.selectorSet];
      titleSelector = selectors.titleSelector || titleSelector;
      contentSelector = selectors.contentSelector || contentSelector;
    } else {
      titleSelector = urlConfig.titleSelector || titleSelector;
      contentSelector = urlConfig.contentSelector || contentSelector;
    }
  }

  let title
  try {
    // then get the title
    title = document
      .querySelector(titleSelector)
      .text;
  } catch (e) {
    console.error(document
      .querySelector('#wikitext').toString());

    console.error(urlConfig, titleSelector)
  }

  if (title === '') {
    console.error(`Couldn't find the title on the page ${titleSelector} ${path}`);
    jetpack.remove(cache_path);
    scrapeError = true;
    return;
  }

  let content
  try {
    // then get the content
    content = document
      .querySelector(contentSelector)
      .toString();
  } catch (e) {
    console.error(title, contentSelector)
  }

  if (!content) {
    console.error(`\nCouldn't find the content on the page ${path}\n`);
    // jetpack.remove(cache_path);
    scrapeError = true;
    return;
  }



  let safe_title = title.toLowerCase().replace(/ /g, '-');
  let prettyTitle = title;
  if (typeof urlConfig === 'object' && urlConfig.num) {
    prettyTitle = `${urlConfig.num}. ${title}`;
  }
  // console.log(`${prettyTitle}#${path}`);

  let newDoc = parser.parse(base_content);
  newDoc
    .querySelector('body')
    .set_content(`<div id="${safe_title}" class="chapter"><h1>${prettyTitle}</h1>${content}</div>`);

  let section = newDoc
    .querySelector('div.chapter')
    .toString()
    .replace(/>&</g, '>&amp;<')
    .replace(/nisbett&wilson.pdf/g, 'nisbett&amp;wilson.pdf')
    .replace(/' > /g, "'>")
    .replace(/ > /g, ' &gt; ')
    .replace(/ < /g, ' &lt; ')
    .replace(/http:\/\/lesswrong.ru/g, 'https://lesswrong.ru') // http --> https
    .replace(/<a href="\/w\//g, '<a href="https://lesswrong.ru/w/')
    .replace(/<a href="\/node\//g, '<a href="https://lesswrong.ru/node/')
    .replace(/ & /g, ' &amp; ')
    ;

  // set relative links

  Object.keys(idxByUrl).forEach(url => {
    const regex = new RegExp(`['"]${url}['"]`, "g");
    section = section.replace(regex, `"s${idxByUrl[url]}.xhtml"`);

    // replace urls written without cyrillic letters
    if (url.indexOf('https://lesswrong.ru/w/') !== -1) {
      const encUrl = encodeURI(url)
      if (url !== encUrl) {
        const regex2 = new RegExp(`['"]${encUrl}['"]`, "g");
        section = section.replace(regex2, `"s${idxByUrl[url]}.xhtml"`);
      }
    } else if (url.indexOf('readthesequences') === -1) {
      const url2 = url.replace('-', '') // Class-Project --> ClassProject
      const regex3 = new RegExp(`['"]${url2}['"]`, "g");
      section = section.replace(regex3, `"s${idxByUrl[url]}.xhtml"`);
    }
  })

  const matched = section.match(/<img src=["']http([^']+)["']/g)
  if (matched && matched.length) {
    console.log(path, matched)
  }
  epub.addSection(prettyTitle, section);
}

config.urls.forEach((url, idx) => {
  // console.log(`${url.url},${idx}`) // create csv to check urls vs. indexes
  // console.log(`    "${url.url}": ${idx + 2},`) // create object to replace urls with epub local links
  let path;
  if (typeof url === 'string') {
    path = url;
  } else {
    path = url.url;
  }

  let stem = path
    .trim()
    .split('/')
    .pop();
  const cache_path = './cache/' + stem + (stem.split('.').pop() !== 'html' ? '.html' : '');
  const cached = jetpack.exists(cache_path);
  if (cached) {
    // console.info('Getting from cache', config.metadata.source + path);
  } else {
    // console.info('Scraping', config.metadata.source + path);
    try {
      execSync('wget ' + config.metadata.source + path + ' -nc -q -O ' + cache_path);
    } catch (e) {
      console.error(
        'Failed to wget (Check your network connection and the url)',
        config.metadata.source + path
      );
      return;
    }
  }

  addChapterToBook(jetpack.read(cache_path), url, cache_path, idx);
});

if (scrapeError) {
  console.error('Scrape errors occurred: No book produced.');
} else {
  epub.writeEPUB(console.error, 'output', config.shorttitle, () => {
    console.info('Book successfully written to output/' + config.shorttitle + '.epub');
  });

  // DEBUG
  // Also write the structure both for debugging purposes and also to provide sample output in GitHub.
  epub.writeFilesForEPUB('./example-EPUB-files', function(err) {
    if (err) {
      console.error(err);
    } else {
      console.info('Done!');
    }
  });
}
