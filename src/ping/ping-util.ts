
import  * as _tcpPing from 'tcp-ping';
import * as math from 'mathjs';

export function groupByAddress(results: _tcpPing.Result[]) {
  let resultMap: Record<string, _tcpPing.Result[]>;
  resultMap = results.reduce((acc, curr) => {
    if(acc[curr.address] === undefined) {
      acc[curr.address] = [];
    }
    acc[curr.address].push(curr);
    return acc;
  }, {} as Record<string, _tcpPing.Result[]>);
  return resultMap;
}

export interface TcpPingResultAggregate {
  attempts: number;
  avg: number;
  min: number;
  max: number;
  median: number;
  timed_out: number;
  failed: number;
  econnrefusedCount: number;
  eaddrnotavailCount: number;
  enotfoundCount: number;
  hasSuccesses: boolean;
}

export function aggregateTcpPingResults(tcpPingResults: _tcpPing.Result[]): TcpPingResultAggregate {
  let resultAggregate: TcpPingResultAggregate;
  let attempts: number, sum: number, min: number, max: number,
    avg: number, median: number, timed_out: number, failed: number,
    econnrefusedCount: number, eaddrnotavailCount: number, enotfoundCount: number,
    hasSuccesses: boolean;
  let timeVals: number[];
  attempts = 0;
  sum = 0;
  min = Infinity;
  max = -1;
  timed_out = 0;
  failed = 0;
  econnrefusedCount = 0;
  eaddrnotavailCount = 0;
  enotfoundCount = 0;
  hasSuccesses = false;

  timeVals = [];
  for(let i = 0, currResult: _tcpPing.Result; currResult = tcpPingResults[i], i < tcpPingResults.length; ++i) {
    // console.log(`\n${currResult.address}`);
    // try {
    //   console.log(`avg: ${currResult.avg?.toFixed(2) ?? NaN}`);
    //   console.log(`min: ${currResult.min?.toFixed(2) ?? NaN}`);
    //   console.log(`max: ${currResult.max?.toFixed(2) ?? NaN}`);
    // } catch(e) {
    //   console.error(currResult);
    //   throw e;
    // }
    for(let k = 0, currSeqResult: _tcpPing.Results; currSeqResult = currResult.results[k], k < currResult.results.length; ++k) {
      attempts++;
      if(currSeqResult.err) {
        const error = new Error(`${currSeqResult.err.message} ${currResult.address}`);
        if(
          !(
            currSeqResult.err.message.includes('timeout')
            // || currSeqResult.err.message.includes('ECONNREFUSED')
            || currSeqResult.err.message.includes('EADDRNOTAVAIL')
          )
        ) {
          // console.error('error:');
          // console.error(error);
          console.error(currResult.address);
          console.error(currSeqResult.err.message.split('\n')[0]);
        }
        // console.error(currResult.address);
        // console.error(currSeqResult.err.message.split('\n')[0]);
        if(currSeqResult.err.message.includes('ECONNREFUSED')) {
          econnrefusedCount++;
        }
        if(currSeqResult.err.message.includes('EADDRNOTAVAIL')) {
          eaddrnotavailCount++;
        }
        if(currSeqResult.err.message.includes('ENOTFOUND')) {
          enotfoundCount++;
        }
        // console.log(currSeqResult.err);
        if(currSeqResult.err.message.includes('timeout')) {
          timed_out++;
        } else if(!currSeqResult.err.message.includes('EADDRNOTAVAIL')) {
          failed++;
        }
        continue;
      }
      timeVals.push(currSeqResult.time);
      sum += currSeqResult.time;
      if(currSeqResult.time < min) {
        min = currSeqResult.time;
      }
      if(currSeqResult.time > max) {
        max = currSeqResult.time;
      }
    }
  }
  hasSuccesses = timeVals.length > 0;
  median = hasSuccesses
    ? math.median(timeVals)
    : NaN
  ;
  // median = math.median(timeVals);
  avg = sum / attempts;
  resultAggregate = {
    attempts,
    avg,
    median,
    max,
    min,
    timed_out,
    failed,
    econnrefusedCount,
    eaddrnotavailCount,
    enotfoundCount,
    hasSuccesses,
  };
  return resultAggregate;
}
