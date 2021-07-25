import * as _tcpPing from 'tcp-ping';
import * as math from 'mathjs';
import _chance from 'chance';
const chance = new _chance;

import { getWeightedAverages, WeightedAverages } from '../lib/math-util';
import { Timer } from '../lib/timer';
import { getIntuitiveTimeStr } from '../lib/time-util';
import { aggregateTcpPingResults, TcpPingResultAggregate } from './ping-util';
import { getPrintByCount } from './print-ping';
import { runPingLoop, stopPingQueue } from './ping-loop';

export async function pingForMsHandler(targets: string[]) {
  let timer: Timer, deltaMs: number;
  let pingResultAggregate: TcpPingResultAggregate, uriCountMap: Record<string, number>,
    uriCountTuples: [ string, number ][], totalResultCount: number;
  let uriCounts: number[], uriCountStdDev: number, percentResultsFailed: number,
    uriCountStdDevPercent: number, avgUriCount: number;
  let successfulPings: number, pingsPerSecond: number;
  let results: _tcpPing.Result[], resultsWindow: _tcpPing.Result[], pingForPromises: Promise<void>[];
  let lastMs: number;
  let minutes: number, seconds: number, ms: number;
  console.log(`num targets: ${targets.length}`);
  console.error(`num targets: ${targets.length}`);

  minutes = 0.0625;
  minutes = 5.0;
  minutes = 10.0;
  minutes = 0.75;
  minutes = 1.0;
  minutes = 3.0;
  minutes = 0.5;
  minutes = 0.25;
  seconds = minutes * 60;
  ms = Math.round(seconds * 1000);
  console.log(getIntuitiveTimeStr(ms));
  console.error(getIntuitiveTimeStr(ms));

  results = [];
  resultsWindow = [];
  pingForPromises = [];
  uriCountMap = {};
  lastMs = Date.now();
  totalResultCount = 0;

  const printByCount = getPrintByCount(targets.length, 5, 4);

  const pingForCb = async (result: _tcpPing.Result): Promise<boolean> => {
    totalResultCount++; // 	06/24/2021 03:45:42.798-0600

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
    return false;
  };

  timer = Timer.start();

  for(let i = 0, currTarget: string; currTarget = targets[i], i < targets.length; ++i) {
    let pingForPromise: Promise<void>;
    pingForPromise = pingForMs({
      address: currTarget,
      ms,
    }, pingForCb);
    pingForPromises.push(pingForPromise);
  }

  await Promise.all(pingForPromises);

  stopPingQueue();
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
  const countTupleSliceWindow = 5;
  [
    ...uriCountTuples.slice(0, countTupleSliceWindow),
    [],
    ...uriCountTuples.slice(-1 * countTupleSliceWindow),
  ].forEach(uriCountTuple => {
    console.error(uriCountTuple);
    // console.error(`${uriCountTuple[0]} => ${uriCountTuple[1]}`);
  });
  pingResultAggregate = aggregateTcpPingResults(results);
  // console.error(uriCountTuples);
  successfulPings = pingResultAggregate.attempts - pingResultAggregate.failed;
  pingsPerSecond = Math.round(successfulPings / (deltaMs / 1000));

  uriCounts = uriCountTuples.map(uriCountTuple => uriCountTuple[1]);
  uriCountStdDev = math.std(uriCounts);
  avgUriCount = math.mean(uriCounts);
  uriCountStdDevPercent = (uriCountStdDev / avgUriCount) * 100;
  percentResultsFailed = (pingResultAggregate.failed / pingResultAggregate.attempts) * 100;

  console.log(pingResultAggregate);
  calculateAverages(results);

  console.log(`\ntook: ${getIntuitiveTimeStr(deltaMs)}`);
  console.log(`ping count diff (high - low) : ${uriCountTuples[0][1] - uriCountTuples[uriCountTuples.length - 1][1]}`);

  const stdDevStr = `-- StdDev: ${uriCountStdDev.toFixed(2)}`;
  const stdDevPercentStr = `-- StdDev %: ${uriCountStdDevPercent.toFixed(3)} %`;
  const percentResultsFailedStr = `-- Failed:: ${percentResultsFailed.toFixed(4)} %`;
  const econnrefusedCountStr = `-- econnrefused: ${pingResultAggregate.econnrefusedCount.toLocaleString()}`;
  const eaddrnotavailCountStr = `-- eaddrnotavail: ${pingResultAggregate.eaddrnotavailCount.toLocaleString()}`;
  console.log(`\n${stdDevStr}`);
  console.log(stdDevPercentStr);
  console.log(percentResultsFailedStr);
  console.log(econnrefusedCountStr);
  console.log(eaddrnotavailCountStr);
  console.log(`\n${pingsPerSecond} pings/second`);

  console.error(stdDevStr);
  console.error(stdDevPercentStr);
  console.error(percentResultsFailedStr);
  console.error(econnrefusedCountStr);
  console.error(eaddrnotavailCountStr);
  console.error(`\n${pingsPerSecond} pings/second`);
}

interface PingForOpts {
  address: string,
  ms: number,
}

async function pingForMs(opts: PingForOpts, cb: (result: _tcpPing.Result) => Promise<boolean>) {
  let timer: Timer;
  timer = Timer.start();
  await runPingLoop(opts.address, async (result) => {
    let doStop: boolean, cbDoStopResult: boolean;
    cbDoStopResult = await cb(result);
    doStop = cbDoStopResult || (timer.current() > opts.ms);
    return doStop;
  });
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
