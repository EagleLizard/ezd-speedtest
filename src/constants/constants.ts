
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
} from './alexa-addresses';

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
  // 'xvideos',
  // 'xhamster',
  // 'pornhub',
  // 'chaturbate',
  // 'xnxx',
  // 'mileroticos',
];

const ALL_PING_TARGETS = [
  // ...DEFAULT_TARGETS,
  ...ALEXA_GLOBAL,
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
  ...ALEXA_GERMANY,

  ...ALEXA_AU,
  ...ALEXA_HK,
  ...ALEXA_JP,

  ...ALEXA_CHINA,
].filter(uri => {
  return !XXX_BLOCKLIST.some(xxxUri => {
    return uri.includes(xxxUri);
  });
});

const DEDUPED_PING_TARGETS = Array.from(new Set(ALL_PING_TARGETS));

export const PING_TARGETS = [
  ...DEDUPED_PING_TARGETS,
];
