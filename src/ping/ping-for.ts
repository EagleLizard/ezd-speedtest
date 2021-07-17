import * as _tcpPing from 'tcp-ping';
import * as math from 'mathjs';
import _chance from 'chance';
const chance = new _chance;

import { getWeightedAverages, PRIMES, WeightedAverages } from '../lib/math-util';
import { Timer } from '../lib/timer';
import { aggregateTcpPingResults, runPingLoop, TcpPingResultAggregate } from './ping';
import { getIntuitiveTimeStr } from '../lib/time-util';
import { sleep } from '../lib/sleep';

export async function pingForHandler(targets: string[]) {
  let timer: Timer, deltaMs: number;
  let pingResultAggregate: TcpPingResultAggregate, uriCountMap: Record<string, number>,
    uriCountTuples: [ string, number ][], totalResultCount: number;
  let uriCounts: number[], uriCountStdDev: number;
  let successfulPings: number, pingsPerSecond: number;
  let results: _tcpPing.Result[], resultsWindow: _tcpPing.Result[], pingForPromises: Promise<void>[];
  let lastMs: number;
  let minutes: number, seconds: number, ms: number;

  // const PER_PING_WAIT_MS = Math.round(3.43642612 * targets.length);
  const PER_PING_WAIT_MS = Math.round(Math.E * targets.length);
  // const PER_PING_WAIT_MS = Math.round(5 * targets.length);
  // const PER_PING_WAIT_MS = 500;

  console.log(`PER_PING_WAIT_MS: ${PER_PING_WAIT_MS}`);

  process.stderr.write('\n'.repeat(24));
  minutes = 1.0;
  minutes = 0.25;
  minutes = 0.375;
  minutes = 5.0;
  minutes = 10.0;
  minutes = 1.5;
  minutes = 0.125;
  minutes = 0.5;
  seconds = minutes * 60;
  ms = Math.round(seconds * 1000);
  console.log(getIntuitiveTimeStr(ms));

  results = [];
  resultsWindow = [];
  pingForPromises = [];
  uriCountMap = {};
  lastMs = Date.now();
  totalResultCount = 0;
  const pingForCb = async (result: _tcpPing.Result): Promise<boolean> => {
    totalResultCount++;
    printByCount(totalResultCount);
    const lastMsMax = 1000;
    const flopRange = Math.round(lastMsMax / 200);
    const coinFlop = chance.integer({
      min: -1 * flopRange,
      max: flopRange,
    });
    if((Date.now() - lastMs) >= (lastMsMax + coinFlop)) {
      lastMs = Date.now();
      const currStamp = (+((timer.current() / 1000).toFixed(1)));
      process.stdout.write(' ');
      process.stdout.write(`${currStamp}`);
      process.stdout.write(' ');
      // console.log(aggregateTcpPingResults(resultsWindow));
      resultsWindow.length = 0;
    }
    if(uriCountMap[result.address] === undefined) {
      uriCountMap[result.address] = 0;
    }
    uriCountMap[result.address]++;
    results.push(result);
    resultsWindow.push(result);
    await sleep(PER_PING_WAIT_MS);
    return false;
  };

  timer = Timer.start();

  for(let i = 0, currTarget: string; currTarget = targets[i], i < targets.length; ++i) {
    let pingForPromise: Promise<void>;
    pingForPromise = pingFor({
      address: currTarget,
      ms,
    }, pingForCb);
    pingForPromises.push(pingForPromise);
  }

  await Promise.all(pingForPromises);
  process.stdout.write('\n');

  deltaMs = timer.stop();
  uriCountTuples = Object.entries(uriCountMap);
  uriCountTuples.sort((a, b) => {
    let aCount: number, bCount;
    aCount = a[1];
    bCount = b[1];
    if(aCount > bCount) {
      return -1;
    }
    if(aCount < bCount) {
      return 1;
    }
    return 0;
  });
  console.log(uriCountTuples.length);
  uriCountTuples.forEach(uriCountTuple => {
    console.error(uriCountTuple);
    // console.error(`${uriCountTuple[0]} => ${uriCountTuple[1]}`);
  });
  pingResultAggregate = aggregateTcpPingResults(results);
  // console.error(uriCountTuples);
  successfulPings = pingResultAggregate.attempts - pingResultAggregate.failed;
  pingsPerSecond = Math.round(successfulPings / (deltaMs / 1000));

  uriCounts = uriCountTuples.map(uriCountTuple => uriCountTuple[1]);
  uriCountStdDev = math.std(uriCounts);

  console.log(pingResultAggregate);
  calculateAverages(results);

  console.log(`\ntook: ${getIntuitiveTimeStr(deltaMs)}`);
  console.log(`ping count diff (high - low) : ${uriCountTuples[0][1] - uriCountTuples[uriCountTuples.length - 1][1]}`);
  console.log(`\n-- StdDev: ${uriCountStdDev.toFixed(1)}`);

  console.log(`\n${pingsPerSecond} pings/second`);
}

interface PingForOpts {
  address: string,
  ms: number,
}

async function pingFor(opts: PingForOpts, cb: (result: _tcpPing.Result) => Promise<boolean>) {
  let timer: Timer;
  timer = Timer.start();
  await runPingLoop(opts.address, async (result) => {
    let doStop: boolean, cbDoStopResult: boolean;
    cbDoStopResult = await cb(result);
    doStop = cbDoStopResult || (timer.current() > opts.ms);
    return doStop;
  });
}

function printByCount(resultCount: number) {
  // process.stdout.write('…');
  // process.stdout.write('‥');
  // process.stdout.write('․');

  // if((resultCount % PRIMES[3]) === 0) {
  //   process.stdout.write('⣀');
  // }
  // if((resultCount % PRIMES[6]) === 0) {
  //   process.stdout.write('⣤');
  // }
  // if((resultCount % PRIMES[9]) === 0) {
  //   process.stdout.write('⣶');
  // }
  // if((resultCount % PRIMES[12]) === 0) {
  //   process.stdout.write('⣿');
  // }

  // if((resultCount % PRIMES[5]) === 0) {
  //   process.stdout.write('⣀');
  // }
  // if((resultCount % PRIMES[10]) === 0) {
  //   process.stdout.write('⣤');
  // }
  // if((resultCount % PRIMES[15]) === 0) {
  //   process.stdout.write('⣶');
  // }
  // if((resultCount % PRIMES[20]) === 0) {
  //   process.stdout.write('⣿');
  // }

  if((resultCount % PRIMES[5]) === 0) {
    process.stdout.write('⣀');
  }
  if((resultCount % PRIMES[8]) === 0) {
    process.stdout.write('⣤');
  }
  if((resultCount % PRIMES[10]) === 0) {
    process.stdout.write('⣶');
  }
  if((resultCount % PRIMES[11]) === 0) {
    process.stdout.write('⣿');
  }

}

function calculateAverages(results: _tcpPing.Result[]) {
  let resultTimeTuples: [ string, number ][],
    weightedAverages: WeightedAverages,
    weightedAvgTuples: [ string, number, number ][],
    percentWeightedTuples: [string, number, number][]
  ;
  let unWeightedAvg: number, averages: number[];
  let totalCount: number;
  resultTimeTuples = [];
  results.forEach(result => {
    result.results.forEach(results => {
      if(results.err !== undefined) {
        return;
      }
      resultTimeTuples.push([
        result.address,
        results.time,
      ]);
    });
  });
  weightedAverages = getWeightedAverages(resultTimeTuples);
  weightedAvgTuples = [];
  averages = Object.keys(weightedAverages).map(key => {
    weightedAvgTuples.push([
      key,
      weightedAverages[key].avg,
      weightedAverages[key].count,
    ]);
    return weightedAverages[key].avg;
  });
  totalCount = weightedAvgTuples.reduce((acc, curr) => {
    return acc + curr[2];
  }, 0);
  // console.log(`totalCount: ${totalCount.toLocaleString()}`);
  // weightedAvgTuples.forEach(weightedAvgTuple => {
  //   console.error(weightedAvgTuple);
  // });
  unWeightedAvg = math.mean(averages);
  console.log(`unWeightedAvg: ${unWeightedAvg.toFixed(2)}`);
}
