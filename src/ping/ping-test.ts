
import * as _tcpPing from 'tcp-ping';
import {
  TcppErrorResult,
  tcppHasError,
} from './ping';
import { runPingLoop } from './ping-loop';
import { aggregateTcpPingResults, TcpPingResultAggregate } from './ping-util';

const MAX_PINGS = 50;
const PING_THROTTLE_MS = 5;

export async function runPingTest(targets: string[]) {
  let runPingPromises: Promise<void>[], pingCountMap: Record<string, number>;
  let pingResults: _tcpPing.Result[], pingResultAggregate: TcpPingResultAggregate;

  const PING_STAGGER_MS = Math.round(targets.length * 0.0005);
  const PRINT_FACTOR = Math.round((MAX_PINGS * targets.length) / 666);
  console.log(`PING_STAGGER_MS: ${PING_STAGGER_MS}`);
  console.log(`PRINT_FACTOR: ${PRINT_FACTOR}`);

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
      // if((pingCountMap[result.address] % Math.round(MAX_PINGS / 6)) === 0) {
      //   process.stdout.write('.');
      // }
      if((pingCountMap[result.address] % PRINT_FACTOR) === 0) {
        process.stdout.write('.');
      }

      for(let k = 0, tcpPingResults: _tcpPing.Results; tcpPingResults = result.results[k], k < result.results.length; ++k) {
        let code: string, addr: string;
        let tcppErrorResult: TcppErrorResult | undefined;
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
    // await sleep(PING_STAGGER_MS);
  }

  await Promise.all(runPingPromises);
  process.stdout.write('\n');
  pingResultAggregate = aggregateTcpPingResults(pingResults);
  console.log(pingResultAggregate);
  return pingResultAggregate;
}
