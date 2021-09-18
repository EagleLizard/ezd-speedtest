
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
import {
  ALEXA_1M, ALEXA_1M_SLOW, ALEXA_1M_SLOW_B, ALEXA_1M_TIMEDOUT, ALEXA_1M_TIMEDOUT_B,
} from './alexa_1m';
import {
  FAST_100,
  FAST_200,
  FAST_200_TO_400,
  FAST_400,
  FAST_500,
} from './custom-uri-lists';

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

const ALL_TARGETS_GLOBAL = [
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
  ...ALEXA_GERMANY,
  ...ALEXA_POLAND,
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
];

const XXX_BLOCKLIST: string[] = [
  // 'xvideos',
  // 'xhamster',
  // 'pornhub',
  // 'chaturbate',
  // 'xnxx',
  // 'mileroticos',
  // 'livejasmin',
  // 'onlyfans',
  // 'youporn',
  // 'spankbang'
];
const ENETUNREACH_BLOCKLIST: string[] = [
  'www.beian.gov.cn',
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
  'www.ih5.cn',
  'www.photofans.cn',
  'www.chinagate.cn',
  'www.bbwhf.com',
  'www.cfsbcn.com',
  'www.livekoora.online',
  'www.hea.cn',
  'www.woshipm.com',
  'www.pinimg.com',
  'www.cnad.com',
  'www.chinanetrank.com',
  'www.d1net.com',
  'www.mojifen.com',
  'www.uol.com.br',
  'www.byrenjia.com',
  'www.fy169.net',
  'www.freedogecoin.win',
  'www.toyokeizai.net',
  'www.cps.com.cn',
  'www.isams.cloud',
  'www.51ade.com',
  'www.cocoachina.com',
  'www.bbvanet.com.mx',
  'www.chuansong.me',
  'www.niuche.com',
  'www.paypal-account.info',
  'www.monbin.site',
  'www.btkitty.bid',

];
const ENOTFOUND_BLOCKLIST: string[] = [
  'www.bing.com', 'www.office.com', 'www.services.gov.gr', 'www.amazon.sg', 'www.nur.edu', 'www.marca.com', 'www.patria.org.ve', 'www.google.com.bo', 'www.srvtrck.com', 'www.realsrv.com', 'www.baiducontent.com', 'www.rotabol.com', 'www.microsoftonline.com', 'www.ggpht.com', 'www.livedoor.jp', 'www.iqbroker.com', 'www.madrasati.sa', 'www.myworkdayjobs.com', 'www.9lianmeng.com', 'www.morningpost.com.cn', 'www.eshkol.io', 'www.9384.com', 'www.media-amazon.com', 'www.1x001.com', 'www.ibanking-services.com', 'www.anightsregalia.cam', 'www.dilatelyjb.xyz', 'www.poshukach.com', 'www.wangdaidongfang.com', 'www.panda.tv', 'www.akamaized.net', 'www.buenotraffic.com', 'www.onmarshtompor.com', 'www.secureinternetbank.com', 'www.poocoin.app', 'www.digitalcaptcha.top', 'www.sq.cn', 'www.agacelebir.com', 'www.crjugate.com', 'www.live.net', 'www.givemenbastreams.com', 'www.blackboardcdn.com', 'www.note.com', 'www.twimg.com', 'www.dv37.com', 'www.sepe.gob.es', 'www.topfo.com', 'www.linksynergy.com', 'www.redd.it', 'www.eee114.com',
  'www.detik.com', 'www.office.net', 'www.cloudfront.net', 'www.bbcollab.com', 'www.banvenez.com', 'www.lordfilms-s.biz', 'www.nearbyme.io', 'www.51yes.com', 'www.bloomberg.com', 'www.bodybuilding.com', 'www.ytimg.com', 'www.bestbuy.com', 'www.pikiran-rakyat.com', 'www.abema.tv', 'www.humisnee.com', 'www.transaccionesbancolombia.com', 'www.your-bestprize.life', 'www.ssl-images-amazon.com', 'www.btt.network', 'www.optnx.com', 'www.xsrv.jp', 'www.onetag-sys.com', 'www.acceptww.com', 'www.rutor.info', 'www.cafis-paynet.jp', 'www.shopifyapps.com', 'www.utl.pt', 'www.quicklisti.com', 'www.lilureem.com', 'www.cloud-office.co.kr', 'www.tokyo.lg.jp', 'www.hetaruwg.com', 'www.coolicias.ao', 'www.etsystatic.com', 'www.snammar-jumntal.com', 'www.plswinners.click', 'www.rarible.com', 'www.webhostbox.net', 'www.deref-web.de', 'www.swiftln.click', 'www.greenadblocker.com', 'www.luckyforbet.com', 'www.nordaccount.com', 'www.clareityiam.net', 'www.admissions.nic.in', 'www.sbps.jp', 'www.redirectto.fun', 'www.aikapool.com', 'www.en-gage.net', 'www.opoxv.com',
  'www.reserva.be',
  'www.googlesyndication.com',
  'www.exirbroker.com',
  'www.forflygonom.com',
  'www.findandfound.ga',
  'www.sips-services.com',
  'www.moppy.jp',
  'www.my-best.com',
  'www.campaign-archive.com',
  'www.mxhichina.com',
  'www.cdninstagram.com',
  'www.nsdl.com',
  'www.poweradblocker.com',
  'www.ebanking-services.com',
  'www.theonlygames.com',
  'www.phhitgjxsit.com',
  'www.nicsorts-accarade.com',
  'www.premiumbros.com',
  'www.phhitgjxsit.com',
  'www.nicsorts-accarade.com',
  'www.yandex.net',
  'www.ichijishienkin.go.jp',
  'www.dnvt.gv.ao',
];

const ONLY_TIMEDOUT_BLOCKLIST: string[] = [
  ...ALEXA_1M_TIMEDOUT,
  ...ALEXA_1M_TIMEDOUT_B,

  ...ALEXA_1M_SLOW,
  ...ALEXA_1M_SLOW_B,
];

const ALL_PING_TARGETS = [
  ...ALEXA_1M,
  // ...ALEXA_1M_SLOW,
  // ...ALEXA_1M_SLOW_B,

  // ...ALEXA_1M_TIMEDOUT,
  // ...ALEXA_1M_TIMEDOUT_B,

  // ...FAST_500,
  // ...FAST_400,
  // ...FAST_200,
  // ...FAST_100,
  // ...FAST_200_TO_400,

  // ...ALL_TARGETS_GLOBAL,

].filter(uri => {
  return !XXX_BLOCKLIST.some(xxxUri => {
    return uri.includes(xxxUri);
  });
})
  .filter(uri => {
    return !ENETUNREACH_BLOCKLIST.some(xxxUri => {
      return uri.includes(xxxUri);
    });
  })
  .filter(uri => {
    return !ECONNREFUSED_BLOCKLIST.some(xxxUri => {
      return uri.includes(xxxUri);
    });
  })
  .filter(uri => {
    return !ENOTFOUND_BLOCKLIST.some(xxxUri => {
      return uri.includes(xxxUri);
    });
  })
  .filter(uri => {
    return !ONLY_TIMEDOUT_BLOCKLIST.some(xxxUri => {
      return uri.includes(xxxUri);
    });
  });

const DEDUPED_PING_TARGETS = Array.from(new Set(ALL_PING_TARGETS));

export const PING_TARGETS = [
  ...DEDUPED_PING_TARGETS,
];
