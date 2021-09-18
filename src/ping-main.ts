
import { PING_TARGETS } from './constants/constants';
import { Timer } from './lib/timer';
import {
  runPingTest,
} from './ping/ping-test';

import { pingForMsHandler } from './ping/ping-for';
import { TcpPingResultAggregate } from './ping/ping-util';
import { pingQueueTestHandler } from './ping/ping-queue';
import { pingBlastHandler } from './ping/ping-blast';

enum PING_MODULES {
  RUN_PING_TEST = 'RUN_PING_TEST',
  PING_FOR_MS = 'PING_FOR_MS',
  PING_QUEUE = 'PING_QUEUE',
  PING_BLAST = 'PING_BLAST',
}

let PING_MODULE: PING_MODULES;

PING_MODULE = PING_MODULES.PING_FOR_MS;
// PING_MODULE = PING_MODULES.PING_QUEUE;
// PING_MODULE = PING_MODULES.PING_BLAST;

export async function pingMain() {
  switch(PING_MODULE) {
    case PING_MODULES.RUN_PING_TEST:
      await runPingTestHandler();
      break;
    case PING_MODULES.PING_FOR_MS:
      await pingForMsHandler(PING_TARGETS);
      break;
    case PING_MODULES.PING_QUEUE:
      await pingQueueTestHandler(PING_TARGETS, 7);
      break;
    case PING_MODULES.PING_BLAST:
      await pingBlastHandler(PING_TARGETS);
      break;
  }

}

async function runPingTestHandler() {
  let timer: Timer, deltaMs: number;
  let pingResultAggregate: TcpPingResultAggregate;
  let successfulPings: number, pingsPerSecond: number;
  process.stderr.write('\n'.repeat(40));

  timer = Timer.start();
  pingResultAggregate = await runPingTest(PING_TARGETS);
  deltaMs = timer.stop();

  console.log(`\ntook: ${deltaMs} ms`);
  successfulPings = pingResultAggregate.attempts - pingResultAggregate.failed;
  pingsPerSecond = Math.round(successfulPings / (deltaMs / 1000));
  console.log(`\n ${pingsPerSecond} pings/second`);
}
