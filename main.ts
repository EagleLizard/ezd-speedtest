
import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import { pingMain } from './src/ping-main';
import { netMain } from './src/net/net-main';

(async () => {
  try {
    await main();
  } catch(e) {
    console.error(e);
  }
})();

async function main() {
  // await pingMain();
  // console.log('pingMain() exit');
  await netMain();
}
