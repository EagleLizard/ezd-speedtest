
import * as _tcpPing from 'tcp-ping';
import waitOn from 'wait-on';

import { PING_TARGETS } from './constants/constants';
import { Timer } from './lib/timer';
import { sleep } from './lib/sleep';
import {
  aggregateTcpPingResults,
  ping,
  TcppErrorResult,
  tcppHasError,
  TcpPingResultAggregate,
} from './ping/ping';

const MAX_PINGS = 50;
const PING_STAGGER_MS = Math.round(PING_TARGETS.length * 0.5);
// const PING_THROTTLE_MS = 25;
const PING_THROTTLE_MS = 5;

console.log(`PING_STAGGER_MS: ${PING_STAGGER_MS}`);

interface DoPingOpts {
  attempts?: number;
}

export async function pingMain() {
  let timer: Timer, deltaMs: number;
  let pingResultAggregate: TcpPingResultAggregate;
  let successfulPings: number, pingsPerSecond: number;
  process.stderr.write('\n'.repeat(40));
  timer = Timer.start();
  // await doPingTest(PING_TARGETS, {
  //   attempts: 1,
  // });
  pingResultAggregate = await runPingTest(PING_TARGETS);
  deltaMs = timer.stop();
  console.log(`\ntook: ${deltaMs} ms`);
  successfulPings = pingResultAggregate.attempts - pingResultAggregate.failed;
  pingsPerSecond = Math.round(successfulPings / (deltaMs / 1000));
  console.log(`\n ${pingsPerSecond} pings/second`);
}

async function runPingTest(targets: string[]) {
  let runPingPromises: Promise<void>[], pingCountMap: Record<string, number>;
  let pingResults: _tcpPing.Result[], pingResultAggregate: TcpPingResultAggregate;

  runPingPromises = [];
  pingResults = [];
  pingCountMap = targets.reduce((acc, curr) => {
    acc[curr] = 0;
    return acc;
  }, {} as Record<string, number>);

  process.stdout.write('\n');
  for(let i = 0, currTarget: string; currTarget = targets[i], i < targets.length; ++i) {
    let runPingPromise: Promise<void>;
    runPingPromise = runPingLoop(currTarget, async (result) => {
      let doStop: boolean;
      pingResults.push(result);
      doStop = ++pingCountMap[result.address] >= MAX_PINGS;
      if((pingCountMap[result.address] % Math.round(MAX_PINGS / 6)) === 0) {
        process.stdout.write('.');
      }

      for(let k = 0, tcpPingResults: _tcpPing.Results; tcpPingResults = result.results[k], k < result.results.length; ++k) {
        let code: string, addr: string;
        let tcppErrorResult: TcppErrorResult | undefined, waitOnOpts: waitOn.WaitOnOptions;
        tcppErrorResult = tcppHasError(tcpPingResults);
        if(tcppErrorResult) {
          code = tcppErrorResult.code;
          addr = `${result.address}:${tcppErrorResult.port}`;
          process.stdout.write('x');
          console.error(result.address);
          console.error(tcppErrorResult.message);
          console.error(tcppErrorResult.err);
          console.error(`err.code - ${code}`);
          if(
            (code === 'EADDRNOTAVAIL')
          ) {
            console.error(`addr - ${addr}`);
            // waitOnOpts = {
            //   resources: [
            //     addr,
            //   ],
            // };
            // await waitOn(waitOnOpts);
            // await sleep(50);
          }

        }
      }

      // await sleep(PING_THROTTLE_MS);
      if(doStop) {
        process.stdout.write(`${pingCountMap[result.address]} `);
        return true;
      } else {
        return false;
      }
    });
    runPingPromises.push(runPingPromise);
    await sleep(PING_STAGGER_MS);
  }

  await Promise.all(runPingPromises);
  process.stdout.write('\n');
  pingResultAggregate = aggregateTcpPingResults(pingResults);
  console.log(pingResultAggregate);
  return pingResultAggregate;
}

async function runPing(address: string, cb: (result: _tcpPing.Result) => Promise<boolean>): Promise<void> {
  let pingCount: number;
  pingCount = 0;

  await runPingLoop(address, async (pingResult) => {
    let doStop: boolean;
    console.log(pingResult);
    doStop = pingCount++ > 10;
    return doStop;
  });
}

async function runPingLoop(address: string, cb: (result: _tcpPing.Result) => Promise<boolean>): Promise<void> {
  let pingResult: _tcpPing.Result, doStop: boolean;
  for(;;) {
    pingResult = await ping({
      address,
      attempts: 1,
    });
    doStop = await cb(pingResult);
    if(doStop) {
      break;
    }
  }
}

async function doPingTest(pingTargets: string[], opts?: DoPingOpts) {
  let tcpPingPromises: Promise<_tcpPing.Result>[], tcpPingResults: _tcpPing.Result[];
  let resultAggregate: TcpPingResultAggregate;

  opts = (opts === undefined) ? {} : opts;

  tcpPingPromises = [];
  process.stdout.write('\n');
  for(let i = 0, currPingTarget: string; currPingTarget = pingTargets[i], i < pingTargets.length; ++i) {
    let pingOpts: _tcpPing.Options, tcpPingPromise: Promise<_tcpPing.Result>;
    pingOpts = {
      address: currPingTarget,
    };
    if(opts?.attempts) {
      pingOpts.attempts = opts.attempts;
    }
    tcpPingPromise = ping(pingOpts).then(res => {
      process.stdout.write('.');
      return res;
    });
    tcpPingPromises.push(tcpPingPromise);
    await sleep(PING_STAGGER_MS);
  }
  tcpPingResults = await Promise.all(tcpPingPromises);
  resultAggregate = aggregateTcpPingResults(tcpPingResults);
  console.log(resultAggregate);
}
