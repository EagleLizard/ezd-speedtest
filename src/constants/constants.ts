
import {
  ALEXA_GLOBAL,
  ALEXA_US,
  ALEXA_MEXICO,
  ALEXA_CA,
  ALEXA_BRAZIL,
  ALEXA_AU,
  ALEXA_HK,
  ALEXA_CHINA,
  ALEXA_JP,
  ALEXA_UK,
  ALEXA_PUERTO_RICO,
  ALEXA_GUATEMALA,
  ALEXA_EL_SALVADOR,
  ALEXA_PANAMA,
  ALEXA_CHILE,
  ALEXA_COSTA_RICA,
  ALEXA_COLOMBIA,
  ALEXA_VENEZUELA,
  ALEXA_BOLIVIA,
  ALEXA_FRANCE,
  ALEXA_GERMANY,
  ALEXA_POLAND,
  ALEXA_ITALY,
  ALEXA_UKRAINE,
  ALEXA_RUSSIA,
  ALEXA_SINGAPORE,
  ALEXA_GREECE,
  ALEXA_INDIA,
} from './alexa-addresses';
import {
  SEMRUSH_US,
} from './topsites';

const DEFAULT_TARGETS = [
  'www.qualtrics.com',
  'www.github.com',
  'news.ycombinator.com',
  'www.microsoft.com',
  'www.amazon.com',
  'www.salesforce.com',
  'www.npr.org',
  'www.yahoo.com',

  'www.hbo.com',
  'www.hulu.com',
  'www.stackoverflow.com',
  'www.baidu.com',
  'www.usa.gov',
  'www.medium.com',
  'www.bloomberg.com',
  'www.reddit.com',

  'www.cnn.com',
  'www.instagram.com',
  'www.facebook.com',
  'www.twitch.tv',
  'www.office.com',
  'www.live.com',
  'www.instructure.com',
  'www.bing.com',
  'www.etsy.com',

  'www.adobe.com',
  'www.apple.com',
  'www.linkedin.com',
  'www.dropbox.com',
  'www.nytimes.com',
  'www.okta.com',
  'www.espn.com',
  'www.walmart.com',

  'www.twitter.com',
  'www.force.com',
  'www.indeed.com',
  'www.salesforce.com',
  'www.aliexpress.com',
  'www.imgur.com',
  'www.quizlet.com',
  'www.usps.com',
  'www.weather.com',
  'www.ca.gov',
];

const XXX_BLOCKLIST: string[] = [
  'xvideos',
  'xhamster',
  'pornhub',
  'chaturbate',
  'xnxx',
  'mileroticos',
  'livejasmin',
  'onlyfans',
  'youporn',
  'spankbang'
];
const ECONNREFUSED_BLOCKLIST: string[] = [
  'www.diario1.com',
  'www.amazonaws.com',
  'www.ues.edu.sv',
  'www.newsauto.gr',
  'www.terra.com.br',
  'www.rakuten-sec.co.jp',
  'www.scotiabank.fi.cr',
  'www.lifo.gr',
  'www.reclameaqui.com.br',
  'www.protothema.gr',
];
const ENOTFOUND_BLOCKLIST: string[] = [
  'www.bing.com',
  'www.office.com',
  'www.services.gov.gr',
  'www.amazon.sg',
  'www.nur.edu',
  'www.marca.com',
  'www.patria.org.ve',
  'www.google.com.bo',
];

const ALL_PING_TARGETS = [

  ...DEFAULT_TARGETS,
  ...SEMRUSH_US,
  ...ALEXA_US,

  ...ALEXA_MEXICO,
  ...ALEXA_CA,

  ...ALEXA_PUERTO_RICO,
  ...ALEXA_GUATEMALA,
  ...ALEXA_EL_SALVADOR,
  ...ALEXA_COSTA_RICA,
  ...ALEXA_PANAMA,

  ...ALEXA_COLOMBIA,
  ...ALEXA_VENEZUELA,
  ...ALEXA_BOLIVIA,
  ...ALEXA_CHILE,
  ...ALEXA_BRAZIL,

  ...ALEXA_UK,
  ...ALEXA_FRANCE,
  ...ALEXA_POLAND,
  ...ALEXA_GERMANY,
  ...ALEXA_ITALY,
  ...ALEXA_GREECE,

  ...ALEXA_AU,
  ...ALEXA_JP,
  ...ALEXA_SINGAPORE,

  ...ALEXA_HK,

  ...ALEXA_UKRAINE,
  ...ALEXA_RUSSIA,

  ...ALEXA_INDIA,
  ...ALEXA_CHINA,

  ...ALEXA_GLOBAL,

].filter(uri => {
  return !XXX_BLOCKLIST.some(xxxUri => {
    return uri.includes(xxxUri);
  });
}).filter(uri => {
  return !ECONNREFUSED_BLOCKLIST.some(xxxUri => {
    return uri.includes(xxxUri);
  });
}).filter(uri => {
  return !ENOTFOUND_BLOCKLIST.some(xxxUri => {
    return uri.includes(xxxUri);
  });
});

const DEDUPED_PING_TARGETS = Array.from(new Set(ALL_PING_TARGETS));

export const PING_TARGETS = [
  ...DEDUPED_PING_TARGETS,
];
