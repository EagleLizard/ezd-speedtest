
import _chance from 'chance';
const chance = new _chance;
import * as math from 'mathjs';
import * as _tcpPing from 'tcp-ping';


import { getPrintByCount } from './print-ping';
import { PingQueue } from './ping-queue';
import { initializePingQueue, stopPingQueue } from './ping-queue-singleton';
import { sleep } from '../lib/sleep';
import { aggregateTcpPingResults, groupByAddress, TcpPingResultAggregate } from './ping-util';
import { Timer } from '../lib/timer';
import { getIntuitiveTimeStr } from '../lib/time-util';

const NUM_PINGS = 1e4;

const LAST_MS_MAX = 5e3;

export async function pingBlastHandler(targets: string[]) {
  let randIdx: number, randAddr: string;
  let pingQueue: PingQueue;
  let pingQueuePromises: Promise<_tcpPing.Result>[];
  let results: _tcpPing.Result[];
  let timer: Timer, lastMs: number, deltaMs: number;
  let uriCountMap: Record<string, number>;

  console.log(`numTargets: ${targets.length}`);
  console.error(`numTargets: ${targets.length}`);

  pingQueue = await initializePingQueue(targets.length);
  if(!pingQueue.isRunning()) {
    pingQueue.start();
  }

  const printByCount = getPrintByCount(targets.length, 10, 5);

  pingQueuePromises = [];
  results = [];
  uriCountMap = {};

  const resultCb = (result: _tcpPing.Result) => {
    let currStamp: number, msSinceLast: number;
    let resultCount: number, percentDone: number;
    results.push(result);
    resultCount = results.length;
    printByCount(resultCount);
    msSinceLast = (Date.now() - lastMs);
    if(msSinceLast >= LAST_MS_MAX) {
      lastMs = Date.now();
      currStamp = (+((timer.current() / 1000).toFixed(1)));
      process.stdout.write(' ');
      process.stdout.write(`${currStamp}`);
      process.stdout.write(' ');
    }
    const percentModulo = Math.floor(NUM_PINGS / 6);
    if((resultCount % percentModulo) === 0) {
      percentDone = resultCount / NUM_PINGS;
      console.error();
      console.error(`${results.length} / ${NUM_PINGS}`);
      console.error(`${(percentDone * 100).toFixed(2)}%`);
    }
    if(uriCountMap[result.address] === undefined) {
      uriCountMap[result.address] = 0;
    }
    uriCountMap[result.address]++;
  };

  lastMs = Date.now();
  timer = Timer.start();

  for(let i = 0; i < NUM_PINGS; ++i) {
    let pingQueuePromise: Promise<_tcpPing.Result>;
    randIdx = chance.integer({
      min: 0,
      max: targets.length - 1,
    });
    randAddr = targets[randIdx];
    pingQueuePromise = pingQueue.queuePing({
      address: randAddr,
    }).then(result => {
      resultCb(result);
      return result;
    });
    pingQueuePromises.push(pingQueuePromise);
  }
  // await sleep(10);
  await Promise.all(pingQueuePromises);
  deltaMs = timer.stop();

  await stopPingQueue();
  logResults(results, deltaMs, uriCountMap);
}

const COUNT_TUPLE_SLICE_WINDOW = 6;

function logResults(results: _tcpPing.Result[], deltaMs: number, uriCountMap: Record<string, number>) {
  let pingResultAggregate: TcpPingResultAggregate,
    uriCountTuples: [ string, number ][], totalResultCount: number;
  let uriCounts: number[], uriCountStdDev: number, percentResultsFailed: number,
    uriCountStdDevPercent: number, avgUriCount: number, eaddrnotavailPercent: number;
  let groupedResultsMap: Record<string, _tcpPing.Result[]>, uriAggregates: [ string, TcpPingResultAggregate ][];
  let successfulPings: number, pingsPerSecond: number;

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

  groupedResultsMap = groupByAddress(results);
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
  uriAggregates = Object.entries(uriAggregateMap);
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

  pingResultAggregate = aggregateTcpPingResults(results);

  successfulPings = (pingResultAggregate.attempts - pingResultAggregate.failed) - pingResultAggregate.eaddrnotavailCount;
  pingsPerSecond = Math.round(successfulPings / (deltaMs / 1000));

  uriCounts = uriCountTuples.map(uriCountTuple => uriCountTuple[1]);
  uriCountStdDev = math.std(uriCounts);
  avgUriCount = math.mean(uriCounts);
  uriCountStdDevPercent = (uriCountStdDev / avgUriCount) * 100;
  percentResultsFailed = (pingResultAggregate.failed / pingResultAggregate.attempts) * 100;
  eaddrnotavailPercent = (pingResultAggregate.eaddrnotavailCount / pingResultAggregate.attempts) * 100;

  console.log(`\ntook: ${getIntuitiveTimeStr(deltaMs)}`);
  console.log(pingResultAggregate);
  console.error(pingResultAggregate);

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
