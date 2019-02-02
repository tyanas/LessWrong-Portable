#!/usr/bin/env nodejs

const parser = require('node-html-parser');
const makepub = require('nodepub');
const jetpack = require('fs-jetpack');
const { execSync } = require('child_process');

var version = process.argv.length > 2 ? process.argv[2] : 'default';

const config = JSON.parse(jetpack.read('meta/' + version + '.json'));

var scrapeError = false;

function makeToc(links) {
  const tableOfContents = ['<h2>Table Of Contents</h2>', '<ul class="contents">'];

  links.forEach(link => {
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

  let title = document.querySelector(titleSelector).text;
  if (title === '') {
    console.log(`Couldn't find the title on the page ${titleSelector} ${path}`);
    jetpack.remove(cache_path);
    scrapeError = true;
    return;
  }

  // then get the content
  let content = document
    .querySelector(contentSelector)
    .toString()
    .replace('');

  if (!content) {
    console.log(`\nCouldn't find the content on the page ${path}\n`);
    // jetpack.remove(cache_path);
    scrapeError = true;
    return;
  }

  let safe_title = title.toLowerCase().replace(/ /g, '-');
  let prettyTitle = title;
  if (typeof urlConfig === 'object' && urlConfig.num) {
    prettyTitle = `${urlConfig.num}. ${title}`;
  }
  let newDoc = parser.parse(base_content);
  newDoc
    .querySelector('body')
    .set_content(`<div id="${safe_title}" class="chapter"><h1>${prettyTitle}</h1></div>`);
  newDoc.querySelector('div').appendChild(content);

  const section = newDoc
    .querySelector('body')
    .toString()
    .replace(/>&</g, '>&amp;<');
  epub.addSection(prettyTitle, section);
}

config.urls.forEach(url => {
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

  addChapterToBook(jetpack.read(cache_path), url, cache_path);
});

if (scrapeError) {
  console.log('Scrape errors occurred: No book produced.');
} else {
  epub.writeEPUB(console.error, 'output', config.shorttitle, () => {
    console.log('Book successfully written to output/' + config.shorttitle + '.epub');
  });

  // Also write the structure both for debugging purposes and also to provide sample output in GitHub.
  epub.writeFilesForEPUB('./example-EPUB-files', function() {
    console.log('Done!');
  });
}
