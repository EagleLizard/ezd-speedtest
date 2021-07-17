
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

const DO_RUN_PING_TEST = false;

// const PER_PING_WAIT_MS = 1000;

// console.log(`PER_PING_WAIT_MS: ${PER_PING_WAIT_MS}`);

export async function pingMain() {
  console.log(PING_TARGETS.length);

  if(DO_RUN_PING_TEST) {
    await runPingTestHandler();
    return;
  }

  await pingForHandler(PING_TARGETS);
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
