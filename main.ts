
import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import { pingMain } from './src/ping-main';

(async () => {
  try {
    await main();
  } catch(e) {
    console.error(e);
  }
})();

async function main() {
  await pingMain();
}

