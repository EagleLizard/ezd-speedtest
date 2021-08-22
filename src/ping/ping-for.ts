import * as _tcpPing from 'tcp-ping';
import * as math from 'mathjs';
import _chance from 'chance';
const chance = new _chance;

import { getWeightedAverages, WeightedAverages } from '../lib/math-util';
import { Timer } from '../lib/timer';
import { getIntuitiveTimeStr } from '../lib/time-util';
import { aggregateTcpPingResults, groupByAddress, TcpPingResultAggregate } from './ping-util';
import { getPrintByCount } from './print-ping';
import { initializePingQueue, runPingLoop, stopPingQueue } from './ping-loop';
import { testConnect, waitForPort } from './ping';

export async function pingForMsHandler(targets: string[]) {
  let timer: Timer, deltaMs: number;
  let pingResultAggregate: TcpPingResultAggregate, uriCountMap: Record<string, number>,
    uriCountTuples: [ string, number ][], totalResultCount: number;
  let uriCounts: number[], uriCountStdDev: number, percentResultsFailed: number,
    uriCountStdDevPercent: number, avgUriCount: number, eaddrnotavailPercent: number;
  let successfulPings: number, pingsPerSecond: number;
  let results: _tcpPing.Result[], resultsWindow: _tcpPing.Result[], pingForPromises: Promise<void>[];
  let lastMs: number;
  let minutes: number, seconds: number, ms: number;
  console.log(`num targets: ${targets.length}`);
  console.error(`num targets: ${targets.length}`);
  targets = chance.shuffle(targets);

  await initializePingQueue(targets.length);

  // await waitForPort(80);
  // await waitForPort(443);

  minutes = 0.75;
  minutes = 15.0;
  minutes = 40.0;
  minutes = 0.125;
  minutes = 3.0;
  minutes = 1.0;
  minutes = 10.0;
  minutes = 2.0;
  minutes = 5.0;
  minutes = 60.0;
  minutes = 20.0;
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

  const printByCount = getPrintByCount(targets.length, 30, 20);

  const pingForCb = async (result: _tcpPing.Result): Promise<boolean> => {
    totalResultCount++;

    printByCount(totalResultCount);

    const lastMsMax = 5e3;
    const flopRange = Math.round(lastMsMax / 500);
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

  await stopPingQueue();
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

  const groupedResultsMap = groupByAddress(results);
  const uriAggregateMap = Object.keys(groupedResultsMap).reduce((acc, groupedResultsKey) => {
    let groupedAgg: TcpPingResultAggregate;
    const groupedResults = groupedResultsMap[groupedResultsKey];
    try {
      groupedAgg = aggregateTcpPingResults(groupedResults);
      acc[groupedResultsKey] = groupedAgg;
    } catch(e) {
      console.error(e);
    }
    return acc;
  }, {} as Record<string, TcpPingResultAggregate>);
  const uriAggregates = Object.entries(uriAggregateMap);
  uriAggregates.sort((a, b) => {
    let aAgg: TcpPingResultAggregate, bAgg: TcpPingResultAggregate;
    aAgg = a[1];
    bAgg = b[1];
    if(aAgg.avg > bAgg.avg) {
      return 1;
    }
    if(aAgg.avg < bAgg.avg) {
      return -1;
    }
    return 0;
  });
  console.log(uriCountTuples.length);

  const COUNT_TUPLE_SLICE_WINDOW = 6;

  [
    ...uriCountTuples.slice(0, COUNT_TUPLE_SLICE_WINDOW),
    [],
    ...uriCountTuples.slice(-1 * COUNT_TUPLE_SLICE_WINDOW),

    // ...uriCountTuples,

  ].forEach(uriCountTuple => {
    console.error(uriCountTuple);
  });
  [
    ...uriAggregates.slice(0, COUNT_TUPLE_SLICE_WINDOW),
    [],
    ...uriAggregates.slice(-1 * COUNT_TUPLE_SLICE_WINDOW),
  ].forEach(uriAggregateTuple => {
    const [ uri, tcpAggregate ] = uriAggregateTuple;
    if(uriAggregateTuple.length === 0) {
      console.error('!'.repeat(20));
      return;
    }
    console.error();
    console.error(uri);
    // console.error(tcpAggregate);
    [
      `attempts: ${tcpAggregate.attempts}`,
      `failed: ${tcpAggregate.failed}`,
      `avg: ${tcpAggregate.avg.toFixed(2)}`,
      `min: ${tcpAggregate.min.toFixed(2)}`,
      `max: ${tcpAggregate.max.toFixed(2)}`,
    ].forEach(aggStr => {
      console.error(`${' '.repeat(2)}${aggStr}`);
    });
    console.error('_'.repeat(5));
  });
  // uriAggregates.forEach(uriAggregateTuple => {
  //   const [ uri, tcpAggregate ] = uriAggregateTuple;
  //   console.error();
  //   console.error(uri);
  //   [
  //     `avg: ${tcpAggregate.avg.toFixed(1)}`,
  //     `attempts: ${tcpAggregate.attempts}`,
  //   ].forEach(aggStr => {
  //     console.error(`${' '.repeat(2)}${aggStr}`);
  //   });
  //   console.error('_'.repeat(5));
  // });
  pingResultAggregate = aggregateTcpPingResults(results);
  // console.error(uriCountTuples);
  successfulPings = (pingResultAggregate.attempts - pingResultAggregate.failed) - pingResultAggregate.eaddrnotavailCount;
  pingsPerSecond = Math.round(successfulPings / (deltaMs / 1000));

  uriCounts = uriCountTuples.map(uriCountTuple => uriCountTuple[1]);
  uriCountStdDev = math.std(uriCounts);
  avgUriCount = math.mean(uriCounts);
  uriCountStdDevPercent = (uriCountStdDev / avgUriCount) * 100;
  percentResultsFailed = (pingResultAggregate.failed / pingResultAggregate.attempts) * 100;
  eaddrnotavailPercent = (pingResultAggregate.eaddrnotavailCount / pingResultAggregate.attempts) * 100;

  console.log(pingResultAggregate);
  console.error(pingResultAggregate);
  calculateAverages(results);

  console.log(`\ntook: ${getIntuitiveTimeStr(deltaMs)}`);
  console.log(`ping count diff (high - low) : ${uriCountTuples[0][1] - uriCountTuples[uriCountTuples.length - 1][1]}`);

  const stdDevStr = `-- StdDev: ${uriCountStdDev.toFixed(2)}`;
  const stdDevPercentStr = `-- StdDev %: ${uriCountStdDevPercent.toFixed(3)} %`;
  const percentResultsFailedStr = `-- Failed:: ${percentResultsFailed.toFixed(4)} %`;
  const percentEaddrnotavailStr = `-- EADDRNOTAVAIL: ${eaddrnotavailPercent.toFixed(4)} %`;
  const econnrefusedCountStr = `-- econnrefused: ${pingResultAggregate.econnrefusedCount.toLocaleString()}`;
  const eaddrnotavailCountStr = `-- eaddrnotavail: ${pingResultAggregate.eaddrnotavailCount.toLocaleString()}`;
  const enotfoundCountStr = `-- enotfound: ${pingResultAggregate.enotfoundCount.toLocaleString()}`;
  console.log(`\n${stdDevStr}`);
  console.log(stdDevPercentStr);
  console.log(econnrefusedCountStr);
  console.log(eaddrnotavailCountStr);
  console.log(enotfoundCountStr);
  console.log('\n');
  console.log(percentResultsFailedStr);
  console.log(percentEaddrnotavailStr);
  console.log(`\n${pingsPerSecond} pings/second`);

  console.error(stdDevStr);
  console.error(stdDevPercentStr);
  console.error(econnrefusedCountStr);
  console.error(eaddrnotavailCountStr);
  console.error(enotfoundCountStr);
  console.error('\n');
  console.error(percentResultsFailedStr);
  console.error(percentEaddrnotavailStr);
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
