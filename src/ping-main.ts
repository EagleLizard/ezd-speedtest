
import * as _tcpPing from 'tcp-ping';

import { PING_TARGETS } from './constants/constants';
import { Timer } from './lib/timer';
import {
  TcpPingResultAggregate,
} from './ping/ping';
import {
  runPingTest,
} from './ping/ping-test';

import { pingForHandler } from './ping/ping-for';

enum PING_MODULES {
  RUN_PING_TEST = 'RUN_PING_TEST',
  PING_FOR = 'PING_FOR',
  PING_FOR_PORT = 'PING_FOR_PORT',
}

// const PING_MODULE: PING_MODULES = PING_MODULES.PING_FOR_PORT;
const PING_MODULE: PING_MODULES = PING_MODULES.PING_FOR;

export async function pingMain() {
  switch(PING_MODULE) {
    case PING_MODULES.RUN_PING_TEST:
      await runPingTestHandler();
      break;
    case PING_MODULES.PING_FOR:
      await pingForHandler(PING_TARGETS);
      break;
    case PING_MODULES.PING_FOR_PORT:
      await pingForPort(PING_TARGETS);
      break;
  }

}

async function pingForPort(targets: string[]) {
  for(let i = 0, currTarget: string; currTarget = targets[i], i < targets.length; ++i) {
    // process.stdout.write(`${currTarget}, `);

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
