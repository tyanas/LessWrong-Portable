#!/usr/bin/env nodejs

const parser = require('node-html-parser');
const makepub = require('nodepub');
const jetpack = require('fs-jetpack');
const { execSync } = require('child_process');

var version = process.argv.length > 2 ? process.argv[2] : 'default';

const config = JSON.parse(jetpack.read('meta/' + version + '.json'));

var scrapeError = false;

const idxByUrl = {
  "https://lesswrong.ru/w/Предисловие": 2,
  "https://lesswrong.ru/w/Искажения_введение": 3,
  "https://lesswrong.ru/w/Карта_и_территория": 4,
  "https://lesswrong.ru/w/Предсказуемо_неправы": 5,
  "https://lesswrong.ru/w/Что_такое_рациональность": 6,
  "https://lesswrong.ru/w/Мне_сегодня_рационально": 7,
  "https://lesswrong.ru/w/Зачем_нужна_истина": 8,
  "https://lesswrong.ru/w/Что_такое_искажение_ещё_раз": 9,
  "https://lesswrong.ru/w/Доступность": 10,
  "https://lesswrong.ru/w/Обременительные_детали": 11,
  "https://lesswrong.ru/w/Заблуждение_планирования": 12,
  "https://lesswrong.ru/w/Иллюзия_прозрачности_почему_вас_не_понимают": 13,
  "https://lesswrong.ru/w/Ожидая_короткие_понятийные_расстояния": 14,
  "https://lesswrong.ru/w/Линза_видящая_свои_изъяны": 15,
  "https://lesswrong.ru/w/Ложные_убеждения": 16,
  "https://lesswrong.ru/w/Убеждения_должны_окупаться": 17,
  "https://lesswrong.ru/w/Сказ_о_науке_и_политике": 18,
  "https://lesswrong.ru/w/Вера_в_убеждения": 19,
  "https://lesswrong.ru/w/Байесианское_дзюдо": 20,
  "https://lesswrong.ru/w/Притворная_мудрость": 21,
  "https://lesswrong.ru/w/Претензия_религии_на_неопровергаемость": 22,
  "https://lesswrong.ru/w/Провозглашения_и_крики_одобрения": 23,
  "https://lesswrong.ru/w/Убеждение_как_одеяние": 24,
  "https://lesswrong.ru/w/Требование_аплодисментов": 25,
  "https://lesswrong.ru/w/Замечая_замешательство": 26,
  "https://lesswrong.ru/w/Сфокусируй_неуверенность": 27,
  "https://lesswrong.ru/w/Что_такое_свидетельство": 28,
  "https://lesswrong.ru/w/Научное_свидетельство_Правовое_свидетельство_Рациональное_свидетельство": 29,
  "https://lesswrong.ru/w/Сколько_свидетельств_понадобится": 30,
  "https://lesswrong.ru/w/Самоуверенность_Эйнштейна": 31,
  "https://lesswrong.ru/w/Бритва_Оккама": 32,
  "https://lesswrong.ru/w/Сила_рационалиста": 33,
  "https://lesswrong.ru/w/Отсутствие_свидетельств_это_свидетельство_отсутствия": 34,
  "https://lesswrong.ru/w/Закон_сохранения_ожидаемых_свидетельств": 35,
  "https://lesswrong.ru/w/Знание_задним_числом_обесценивает_науку": 36,
  "https://lesswrong.ru/w/Загадочные_ответы": 37,
  "https://lesswrong.ru/w/Лжеобъяснения": 38,
  "https://lesswrong.ru/w/Угадай_слово_задуманное_учителем": 39,
  "https://lesswrong.ru/w/Наука_как_одеяние": 40,
  "https://lesswrong.ru/w/Лжепричинность": 41,
  "https://lesswrong.ru/w/Семантические_стоп-сигналы": 42,
  "https://lesswrong.ru/w/Таинственные_ответы_на_таинственные_вопросы": 43,
  "https://lesswrong.ru/w/Тщетность_эмерджентности": 44,
  "https://lesswrong.ru/w/Скажи_нет_«сложности»": 45,
  "https://lesswrong.ru/w/Подтверждающее_искажение_взгляд_во_тьму": 46,
  "https://lesswrong.ru/w/Закономерная_неуверенность": 47,
  "https://lesswrong.ru/w/Моя_дикая_и_безбашенная_юность": 48,
  "https://lesswrong.ru/w/Неспособность_учиться_у_истории": 49,
  "https://lesswrong.ru/w/Делая_историю_доступной": 50,
  "https://lesswrong.ru/w/Объяснить_поклониться_пренебречь": 51,
  "https://lesswrong.ru/w/«Наука»_—_затычка_для_любопытства": 52,
  "https://lesswrong.ru/w/Поистине_часть_тебя": 53,
  "https://lesswrong.ru/w/Простая_истина": 54,
  "https://lesswrong.ru/w/Как_успешно_менять_свое_мнение": 55,
  "https://lesswrong.ru/w/Рациональность_введение": 56,
  "https://lesswrong.ru/w/Чрезвычайно_удобные_оправдания": 57,
  "https://lesswrong.ru/w/Правильная_скромность": 58,
  "https://lesswrong.ru/w/Третья_альтернатива": 59,
  "https://lesswrong.ru/w/Лотереи_бессмысленная_трата_надежды": 60,
  "https://lesswrong.ru/w/Новая_улучшенная_лотерея": 61,
  "https://lesswrong.ru/w/Но_ведь_шанс_все_равно_есть_не_так_ли": 62,
  "https://lesswrong.ru/w/Софизм_серого": 63,
  "https://lesswrong.ru/w/Абсолютный_авторитет": 64,
  "https://lesswrong.ru/w/Как_убедить_меня_что_2_2_3": 65,
  "https://lesswrong.ru/w/Бесконечная_определенность": 66,
  "https://lesswrong.ru/w/0_и_1_не_являются_вероятностями": 67,
  "https://lesswrong.ru/w/Твоя_рациональность_—_моё_дело": 68,
  "https://lesswrong.ru/w/Политика_и_рациональность": 69,
  "https://lesswrong.ru/w/Политика_убийца_разума": 70,
  "https://lesswrong.ru/w/Не_делайте_политические_споры_однобокими": 71,
  "https://lesswrong.ru/w/Весы_правосудия_блокнот_рациональности": 72,
  "https://lesswrong.ru/w/Фундаментальная_ошибка_атрибуции": 73,
  "https://lesswrong.ru/w/Злые_ли_ваши_враги_от_природы": 74,
  "https://lesswrong.ru/w/Обратное_глупости_не_есть_ум": 75,
  "https://lesswrong.ru/w/Аргумент_затмевает_авторитет": 76,
  "https://lesswrong.ru/w/Ухватить_задачу": 77,
  "https://lesswrong.ru/w/Рациональность_и_английский_язык": 78,
  "https://lesswrong.ru/w/Зло_в_людях_и_неясное_мышление": 79,
  "https://lesswrong.ru/w/Против_рационализации_цепочка": 80,
  "https://lesswrong.ru/w/Знание_искажений_может_вредить": 81,
  "https://lesswrong.ru/w/Обновляй_себя_шаг_за_шагом": 82,
  "https://lesswrong.ru/w/Один_довод_против_армии": 83,
  "https://lesswrong.ru/w/Нижняя_строчка": 84,
  "https://lesswrong.ru/w/О_чём_свидетельствуют_отсеянные_свидетельства": 85,
  "https://lesswrong.ru/w/Рационализация": 86,
  "https://lesswrong.ru/w/Рациональное_обоснование": 87,
  "https://lesswrong.ru/w/Избегая_по-настоящему_слабых_мест_убеждения": 88,
  "https://lesswrong.ru/w/Мотивированная_остановка_и_мотивированное_продолжение": 89,
  "https://lesswrong.ru/w/Фальшивое_оправдание": 90,
  "https://lesswrong.ru/w/Это_ваша_настоящая_причина_отказа": 91,
  "https://lesswrong.ru/w/Связанные_истины_заразная_ложь": 92,
  "https://lesswrong.ru/w/О_лжи_и_Черных_Лебедях": 93,
  "https://lesswrong.ru/w/Эпистемология_темной_стороны": 94,
  "https://lesswrong.ru/w/Против_двоемыслия": 95,
  "https://lesswrong.ru/w/Единомыслие": 96,
  "https://lesswrong.ru/w/Двоемыслие_выбирая_быть_искаженным": 97,
  "https://lesswrong.ru/w/Серьёзно_я_обманул_себя": 98,
  "https://lesswrong.ru/w/Вера_в_самообман": 99,
  "https://lesswrong.ru/w/Парадокс_Мура": 100,
  "https://lesswrong.ru/w/Не_верь_что_самообман_удался": 101,
  "https://lesswrong.ru/w/Свежий_взгляд_на_вещи_цепочка": 102,
  "https://lesswrong.ru/w/Якорение_и_корректировка": 103,
  "https://lesswrong.ru/w/Прайминг_и_контаминация": 104,
  "https://lesswrong.ru/w/Мы_верим_всему_что_нам_говорят": 105,
  "https://lesswrong.ru/w/Кешированные_мысли": 106,
  "https://lesswrong.ru/w/Стандартный_«нестандарт»": 107,
  "https://lesswrong.ru/w/Непосредственный_взгляд": 108,
  "https://lesswrong.ru/w/Страннее_истории": 109,
  "https://lesswrong.ru/w/Ошибка_обобщения_на_основе_вымышленного_свидетельства": 110,
  "https://lesswrong.ru/w/Добродетель_узости": 111,
  "https://lesswrong.ru/w/Как_казаться_и_быть_глубокомысленным": 112,
  "https://lesswrong.ru/w/Мы_меняем_мнение_реже_чем_нам_кажется": 113,
  "https://lesswrong.ru/w/Не_спешите_предлагать_решения": 114,
  "https://lesswrong.ru/w/Генетическая_логическая_ошибка": 115,
  "https://lesswrong.ru/w/Смертельные_спирали_и_аттрактор_культа_цепочка": 116,
  "https://lesswrong.ru/w/Аффективная_эвристика": 117,
  "https://lesswrong.ru/w/Способность_к_оценке_и_недорогой_шоппинг_в_выходные": 118,
  "https://lesswrong.ru/w/Неограниченные_шкалы_ошибки_жюри_и_футуризм": 119,
  "https://lesswrong.ru/w/Эффект_ореола": 120,
  "https://lesswrong.ru/w/Искажение_супергероя": 121,
  "https://lesswrong.ru/w/Просто_Мессии": 122,
  "https://lesswrong.ru/w/Аффективные_смертельные_спирали": 123,
  "https://lesswrong.ru/w/Сопротивление_аффективным_смертельным_спиралям": 124,
  "https://lesswrong.ru/w/Некритичная_сверхкритичность": 125,
  "https://lesswrong.ru/w/Охлаждение_групповых_убеждений_при_помощи_испарения": 126,
  "https://lesswrong.ru/w/Когда_никто_не_смеет_призывать_сдерживаться": 127,
  "https://lesswrong.ru/w/Эксперимент_в_Робберс_Кейв": 128,
  "https://lesswrong.ru/w/Любая_деятельность_хочет_быть_культом": 129,
  "https://lesswrong.ru/w/Хранители_истины": 130,
  "https://lesswrong.ru/w/Хранители_генофонда": 131,
  "https://lesswrong.ru/w/Хранители_Айн_Рэнд": 132,
  "https://lesswrong.ru/w/Два_коана_о_культах": 133,
  "https://lesswrong.ru/w/Эксперимент_Аша_о_конформизме": 134,
  "https://lesswrong.ru/w/Выражая_беспокойство": 135,
  "https://lesswrong.ru/w/Одинокий_инакомыслящий": 136,
  "https://lesswrong.ru/w/Культовая_контркультовость": 137,
  "https://lesswrong.ru/w/Как_отпускать_убеждения_цепочка": 138,
  "https://lesswrong.ru/w/Важно_уметь_сказать_«Упс»": 139,
  "https://lesswrong.ru/w/Предложение_спятить": 140,
  "https://lesswrong.ru/w/Хватит_уже_надеяться": 141,
  "https://lesswrong.ru/w/Как_правильно_сомневаться": 142,
  "https://lesswrong.ru/w/Вы_способны_справиться_с_реальностью": 143,
  "https://lesswrong.ru/w/Размышление_о_любопытстве": 144,
  "https://lesswrong.ru/w/Законы_рациональности_беспристрастны": 145,
  "https://lesswrong.ru/w/Оставь_путь_к_отступлению": 146,
  "https://lesswrong.ru/w/Кризис_веры": 147,
  "https://lesswrong.ru/w/Ритуал": 148,
  "https://lesswrong.ru/node/372": 149,
  "https://lesswrong.ru/w/Сила_интеллекта": 150,
  "https://lesswrong.ru/node/426": 151,
  "https://lesswrong.ru/w/Чуждый_Бог": 152,
  "https://lesswrong.ru/w/Чудо_эволюции": 153,
  "https://lesswrong.ru/w/Эволюции_неразумны_но_всё_равно_работают": 154,
  "https://www.readthesequences.com/No-Evolutions-For-Corporations-Or-Nanodevices": 155,
  "https://lesswrong.ru/w/Эволюция_к_вымиранию": 156,
  "https://lesswrong.ru/w/Трагедия_группового_отбора": 157,
  "https://lesswrong.ru/w/Фальшивый_критерий_оптимизации": 158,
  "https://lesswrong.ru/w/Исполнители_адаптаций_а_не_максимизаторы_приспособленности": 159,
  "https://lesswrong.ru/w/Эволюционная_психология": 160,
  "https://www.readthesequences.com/An-Especially-Elegant-Evolutionary-Psychology-Experiment": 161,
  "https://lesswrong.ru/w/Суперстимулы_и_крах_западной_цивилизации": 162,
  "https://lesswrong.ru/w/Суть_твоя_-_осколки_бога": 163,
  "https://lesswrong.ru/node/457": 164,
  "https://www.readthesequences.com/Belief-In-Intelligence": 165,
  "https://www.readthesequences.com/Humans-In-Funny-Suits": 166,
  "https://www.readthesequences.com/Optimization-And-The-Intelligence-Explosion": 167,
  "https://www.readthesequences.com/Ghosts-In-The-Machine": 168,
  "https://www.readthesequences.com/Artificial-Addition": 169,
  "https://lesswrong.ru/w/Ценности_терминальные_и_инструментальные": 170,
  "https://www.readthesequences.com/Leaky-Generalizations": 171,
  "https://www.readthesequences.com/The-Hidden-Complexity-Of-Wishes": 172,
  "https://www.readthesequences.com/Anthropomorphic-Optimism": 173,
  "https://www.readthesequences.com/Lost-Purposes": 174,
  "https://lesswrong.ru/w/Как_люди_понимают_слова": 175,
  "https://lesswrong.ru/w/Притча_о_кинжале": 176,
  "https://lesswrong.ru/w/Притча_о_болиголове": 177,
  "https://lesswrong.ru/w/Слова_как_скрытые_умозаключения": 178,
  "https://lesswrong.ru/w/Экстенсионалы_и_интенсионалы": 179,
  "https://lesswrong.ru/w/Кластеры_подобия": 180,
  "https://lesswrong.ru/w/Типичность_и_асимметричное_подобие": 181,
  "https://lesswrong.ru/w/Кластерная_структура_пространства_вещей": 182,
  "https://lesswrong.ru/w/Замаскированные_вопросы": 183,
  "https://lesswrong.ru/w/Нейронные_категории": 184,
  "https://lesswrong.ru/w/Как_алгоритм_ощущается_изнутри": 185,
  "https://lesswrong.ru/w/Споры_об_определениях": 186,
  "https://lesswrong.ru/w/Ощути_смысл": 187,
  "https://lesswrong.ru/w/Аргумент_к_традиционному_пониманию": 188,
  "https://lesswrong.ru/w/Пустые_ярлыки": 189,
  "https://lesswrong.ru/w/Табуируй_свои_слова": 190,
  "https://lesswrong.ru/w/Замени_символ_на_суть": 191,
  "https://lesswrong.ru/w/Ошибки_сжатия": 192,
  "https://lesswrong.ru/w/У_классификации_есть_последствия": 193,
  "https://lesswrong.ru/w/Контрабанда_характеристик": 194,
  "https://lesswrong.ru/w/Аргумент_«по_определению»": 195,
  "https://lesswrong.ru/w/Где_проводить_границу": 196,
  "https://lesswrong.ru/w/Энтропия_и_короткие_сообщения": 197,
  "https://lesswrong.ru/w/Общая_информация_и_плотность_в_пространстве_вещей": 198,
  "https://www.readthesequences.com/Superexponential-Conceptspace,-And-Simple-Words": 199,
  "https://www.readthesequences.com/Conditional-Independence,-And-Naive-Bayes": 200,
  "https://lesswrong.ru/w/Слова_как_мысленные_кисти": 201,
  "https://www.readthesequences.com/Variable-Question-Fallacies": 202,
  "https://lesswrong.ru/w/Когда_слова_ошибочны": 203,
  "https://lesswrong.ru/node/373": 204,
  "https://lesswrong.ru/w/Правда_закономерна": 205,
  "https://lesswrong.ru/w/Единый_огонь": 206,
  "https://lesswrong.ru/w/Единый_закон": 207,
  "https://lesswrong.ru/w/Реальность_безобразна": 208,
  "https://lesswrong.ru/w/Прекрасная_вероятность": 209,
  "https://lesswrong.ru/w/Вне_лаборатории": 210,
  "https://lesswrong.ru/w/Второй_закон_термодинамики_и_двигатели_познания": 211,
  "https://www.readthesequences.com/PerpetualMotionBeliefs": 212,
  "https://www.readthesequences.com/SearchingForBayesStructure": 213,
  "https://lesswrong.ru/w/Редукционизм_цепочка": 214,
  "https://lesswrong.ru/w/Распутывание_вопроса": 215,
  "https://lesswrong.ru/w/Неверные_вопросы": 216,
  "https://lesswrong.ru/w/Исправление_неверного_вопроса": 217,
  "https://lesswrong.ru/w/Ошибка_проецирования_ума": 218,
  "https://lesswrong.ru/w/Вероятность_находится_в_голове": 219,
  "https://lesswrong.ru/w/Цитата_—_не_референт": 220,
  "https://lesswrong.ru/w/Качественное_замешательство": 221,
  "https://lesswrong.ru/w/Думай_как_реальность": 222,
  "https://www.readthesequences.com/ChaoticInversion": 223,
  "https://lesswrong.ru/w/Редукционизм": 224,
  "https://lesswrong.ru/w/Объяснение_против_разобъяснения": 225,
  "https://lesswrong.ru/w/Лжередукционизм": 226,
  "https://lesswrong.ru/w/Поэты_саванны": 227,
  "https://www.readthesequences.com/JoyInTheMerelyReal": 228,
  "https://lesswrong.ru/node/411": 229,
  "https://www.readthesequences.com/JoyInDiscovery": 230,
  "https://www.readthesequences.com/BindYourselfToReality": 231,
  "https://www.readthesequences.com/IfYouDemandMagicMagicWontHelp": 232,
  "https://lesswrong.ru/w/Обыденная_магия": 233,
  "https://lesswrong.ru/w/Красота_устоявшейся_науки": 234,
  "https://www.readthesequences.com/AmazingBreakthroughDayAprilFirst": 235,
  "https://www.readthesequences.com/IsHumanismAReligionSubstitute": 236,
  "https://www.readthesequences.com/Scarcity": 237,
  "https://lesswrong.ru/w/Священная_обыденность": 238,
  "https://www.readthesequences.com/ToSpreadScienceKeepItSecret": 239,
  "https://www.readthesequences.com/InitiationCeremony": 240,
  "https://lesswrong.ru/node/412": 241,
  "https://lesswrong.ru/w/Рука_или_пальцы": 242,
  "https://lesswrong.ru/w/Злые_атомы": 243,
  "https://lesswrong.ru/w/Тепло_или_движение": 244,
  "https://www.readthesequences.com/BrainBreakthroughItsMadeOfNeurons": 245,
  "https://lesswrong.ru/w/Когда_антропоморфизм_стал_глупым": 246,
  "https://lesswrong.ru/w/Априори": 247,
  "https://lesswrong.ru/w/Редуктивная_отсылка": 248,
  "https://lesswrong.ru/w/Зомби_Зомби": 249,
  "https://www.readthesequences.com/ZombieResponses": 250,
  "https://www.readthesequences.com/TheGeneralizedAntiZombiePrinciple": 251,
  "https://www.readthesequences.com/GazpVsGlut": 252,
  "https://www.readthesequences.com/BeliefInTheImpliedInvisible": 253,
  "https://lesswrong.ru/w/Зомби_теперь_в_кино": 254,
  "https://lesswrong.ru/w/Исключая_сверхъестественное": 255,
  "https://www.readthesequences.com/PsychicPowers": 256,
  "https://www.readthesequences.com/Quantum-Physics-And-Many-Worlds-Sequence": 257,
  "https://www.readthesequences.com/QuantumExplanations": 258,
  "https://www.readthesequences.com/ConfigurationsAndAmplitude": 259,
  "https://www.readthesequences.com/JointConfigurations": 260,
  "https://www.readthesequences.com/DistinctConfigurations": 261,
  "https://www.readthesequences.com/CollapsePostulates": 262,
  "https://www.readthesequences.com/DecoherenceIsSimple": 263,
  "https://www.readthesequences.com/DecoherenceIsFalsifiableAndTestable": 264,
  "https://www.readthesequences.com/PrivilegingTheHypothesis": 265,
  "https://www.readthesequences.com/LivingInManyWorlds": 266,
  "https://www.readthesequences.com/QuantumNonRealism": 267,
  "https://www.readthesequences.com/IfManyWorldsHadComeFirst": 268,
  "https://www.readthesequences.com/WherePhilosophyMeetsScience": 269,
  "https://www.readthesequences.com/ThouArtPhysics": 270,
  "https://www.readthesequences.com/ManyWorldsOneBestGuess": 271,
  "https://www.readthesequences.com/Science-And-Rationality-Sequence": 272,
  "https://www.readthesequences.com/TheFailuresOfEldScience": 273,
  "https://www.readthesequences.com/TheDilemmaScienceOrBayes": 274,
  "https://www.readthesequences.com/ScienceDoesntTrustYourRationality": 275,
  "https://www.readthesequences.com/WhenScienceCantHelp": 276,
  "https://www.readthesequences.com/ScienceIsntStrictEnough": 277,
  "https://www.readthesequences.com/DoScientistsAlreadyKnowThisStuff": 278,
  "https://www.readthesequences.com/NoSafeDefenseNotEvenScience": 279,
  "https://www.readthesequences.com/ChangingTheDefinitionOfScience": 280,
  "https://www.readthesequences.com/FasterThanScience": 281,
  "https://www.readthesequences.com/EinsteinsSpeed": 282,
  "https://www.readthesequences.com/ThatAlienMessage": 283,
  "https://www.readthesequences.com/MyChildhoodRoleModel": 284,
  "https://www.readthesequences.com/EinsteinsSuperpowers": 285,
  "https://www.readthesequences.com/ClassProject": 286,
  "https://www.readthesequences.com/Fake-Preferences-Sequence": 287,
  "https://www.readthesequences.com/NotForTheSakeOfHappinessAlone": 288,
  "https://www.readthesequences.com/FakeSelfishness": 289,
  "https://www.readthesequences.com/FakeMorality": 290,
  "https://www.readthesequences.com/FakeUtilityFunctions": 291,
  "https://www.readthesequences.com/DetachedLeverFallacy": 292,
  "https://www.readthesequences.com/DreamsOfAIDesign": 293,
  "https://www.readthesequences.com/TheDesignSpaceOfMindsInGeneral": 294,
  "https://lesswrong.ru/node/446": 295,
  "https://www.readthesequences.com/WhereRecursiveJustificationHitsBottom": 296,
  "https://www.readthesequences.com/MyKindOfReflection": 297,
  "https://www.readthesequences.com/NoUniversallyCompellingArguments": 298,
  "https://www.readthesequences.com/CreatedAlreadyInMotion": 299,
  "https://lesswrong.ru/w/Раскладывание_камней_в_правильные_кучи": 300,
  "https://www.readthesequences.com/TwoPlaceAndOnePlaceWords": 301,
  "https://www.readthesequences.com/WhatWouldYouDoWithoutMorality": 302,
  "https://www.readthesequences.com/ChangingYourMetaethics": 303,
  "https://www.readthesequences.com/CouldAnythingBeRight": 304,
  "https://www.readthesequences.com/MoralityAsFixedComputation": 305,
  "https://www.readthesequences.com/MagicalCategories": 306,
  "https://lesswrong.ru/w/Настоящая_дилемма_заключенного": 307,
  "https://www.readthesequences.com/SympatheticMinds": 308,
  "https://www.readthesequences.com/HighChallenge": 309,
  "https://www.readthesequences.com/SeriousStories": 310,
  "https://www.readthesequences.com/ValueIsFragile": 311,
  "https://www.readthesequences.com/TheGiftWeGiveToTomorrow": 312,
  "https://lesswrong.ru/w/node/448": 313,
  "https://lesswrong.ru/w/Пренебрежение_масштабом": 314,
  "https://www.readthesequences.com/OneLifeAgainstTheWorld": 315,
  "https://lesswrong.ru/w/Парадокс_Аллэ": 316,
  "https://www.readthesequences.com/ZutAllais": 317,
  "https://lesswrong.ru/w/Чувство_морали": 318,
  "https://www.readthesequences.com/TheIntuitionsBehindUtilitarianism": 319,
  "https://www.readthesequences.com/EndsDontJustifyMeansAmongHumans": 320,
  "https://www.readthesequences.com/EthicalInjunctions": 321,
  "https://www.readthesequences.com/SomethingToProtect": 322,
  "https://www.readthesequences.com/WhenNotToUseProbabilities": 323,
  "https://lesswrong.ru/w/Парадокс_Ньюкома_сожалея_о_своей_рациональности": 324,
  "https://lesswrong.ru/node/374": 325,
  "https://www.readthesequences.com/Yudkowskys-Coming-Of-Age-Sequence": 326,
  "https://www.readthesequences.com/MyChildhoodDeathSpiral": 327,
  "https://www.readthesequences.com/MyBestAndWorstMistake": 328,
  "https://www.readthesequences.com/RaisedInTechnophilia": 329,
  "https://www.readthesequences.com/AProdigyOfRefutation": 330,
  "https://www.readthesequences.com/TheSheerFollyOfCallowYouth": 331,
  "https://www.readthesequences.com/ThatTinyNoteOfDiscord": 332,
  "https://www.readthesequences.com/FightingARearguardActionAgainstTheTruth": 333,
  "https://www.readthesequences.com/MyNaturalisticAwakening": 334,
  "https://www.readthesequences.com/TheLevelAboveMine": 335,
  "https://www.readthesequences.com/TheMagnitudeOfHisOwnFolly": 336,
  "https://www.readthesequences.com/BeyondTheReachOfGod": 337,
  "https://www.readthesequences.com/MyBayesianEnlightenment": 338,
  "https://lesswrong.ru/w/Бросая_вызов_сложностям_цепочка": 339,
  "https://lesswrong.ru/w/Цуёку_наритаи_«Хочу_стать_сильней»": 340,
  "https://lesswrong.ru/w/Цуёку_против_уравнительского_инстинкта": 341,
  "https://lesswrong.ru/w/Пытаясь_пытаться": 342,
  "https://lesswrong.ru/w/Используй_вторую_попытку_Люк": 343,
  "https://www.readthesequences.com/OnDoingTheImpossible": 344,
  "https://www.readthesequences.com/MakeAnExtraordinaryEffort": 345,
  "https://www.readthesequences.com/ShutUpAndDoTheImpossible": 346,
  "https://www.readthesequences.com/FinalWords": 347,
  "https://lesswrong.ru/w/Создание_сообщества": 348,
  "https://lesswrong.ru/w/Общий_уровень_здравомыслия": 349,
  "https://lesswrong.ru/w/Чувство_что_большее_возможно": 350,
  "https://www.readthesequences.com/EpistemicViciousness": 351,
  "https://www.readthesequences.com/SchoolsProliferatingWithoutEvidence": 352,
  "https://www.readthesequences.com/ThreeLevelsOfRationalityVerification": 353,
  "https://www.readthesequences.com/WhyOurKindCantCooperate": 354,
  "https://www.readthesequences.com/TolerateTolerance": 355,
  "https://www.readthesequences.com/YourPriceForJoining": 356,
  "https://www.readthesequences.com/CanHumanismMatchReligionsOutput": 357,
  "https://www.readthesequences.com/ChurchVsTaskforce": 358,
  "https://www.readthesequences.com/RationalityCommonInterestOfManyCauses": 359,
  "https://www.readthesequences.com/HelplessIndividuals": 360,
  "https://www.readthesequences.com/MoneyTheUnitOfCaring": 361,
  "https://www.readthesequences.com/PurchaseFuzziesAndUtilonsSeparately": 362,
  "https://www.readthesequences.com/BystanderApathy": 363,
  "https://www.readthesequences.com/CollectiveApathyAndTheInternet": 364,
  "https://www.readthesequences.com/IncrementalProgressAndTheValley": 365,
  "https://www.readthesequences.com/BayesiansVsBarbarians": 366,
  "https://www.readthesequences.com/BewareOfOtherOptimizing": 367,
  "https://www.readthesequences.com/PracticalAdviceBackedByDeepTheories": 368,
  "https://www.readthesequences.com/TheSinOfUnderconfidence": 369,
  "https://www.readthesequences.com/GoForthAndCreateTheArt": 370,
}

function makeToc(links) {
  const tableOfContents = ['<h2>Table Of Contents</h2>', '<ul class="contents">'];

  links.forEach(link => {
    // console.log(`${link.link}#${link.title}`)
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
  let newDoc = parser.parse(base_content);
  newDoc
    .querySelector('body')
    .set_content(`<div id="${safe_title}" class="chapter"><h1>${prettyTitle}</h1>${content}</div>`);
  newDoc.querySelector('div').appendChild(content);

  let section = newDoc
    .querySelector('body')
    .toString()
    .replace(/>&</g, '>&amp;<')
    .replace(/nisbett&wilson.pdf/g, 'nisbett&amp;wilson.pdf')
    .replace(/ < /g, ' &lt; ')
    .replace(/ > /g, ' &gt; ')
    .replace(/http:\/\/lesswrong.ru/g, 'https://lesswrong.ru') // http --> https
    .replace(/<a href="\/w\//g, '<a href="https://lesswrong.ru/w/')
    .replace(/<a href="\/node\//g, '<a href="https://lesswrong.ru/node/')
    ;


  // set relative links

  Object.keys(idxByUrl).forEach(url => {
    const regex = new RegExp(url, "g");
    section = section.replace(regex, `s${idxByUrl[url]}.xhtml`);

    // replace urls written without cyrillic letters
    const lrw = 'https://lesswrong.ru/w/'
    if (url.indexOf(lrw) === -1) {
      return;
    }
    const encPath = encodeURIComponent(url.replace(lrw, ''))
    const encUrl = `${lrw}${encPath}`
    if (url !== encUrl) {
      const regex2 = new RegExp(encUrl, "g");
      section = section.replace(regex2, `s${idxByUrl[url]}.xhtml`);
    }
  })

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

  addChapterToBook(jetpack.read(cache_path), url, cache_path);
});

if (scrapeError) {
  console.log('Scrape errors occurred: No book produced.');
} else {
  epub.writeEPUB(console.error, 'output', config.shorttitle, () => {
    console.log('Book successfully written to output/' + config.shorttitle + '.epub');
  });

  // DEBUG
  // Also write the structure both for debugging purposes and also to provide sample output in GitHub.
  // epub.writeFilesForEPUB('./example-EPUB-files', function() {
  //   console.log('Done!');
  // });
}
