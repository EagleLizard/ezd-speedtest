
import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import  * as _tcpPing from 'tcp-ping';
import * as math from 'mathjs';

import {
  sleep,
} from '../lib/sleep';

let concurrentConnections = 0;

export interface TcpPingResultAggregate {
  attempts: number;
  avg: number;
  min: number;
  max: number;
  median: number;
  timed_out: number;
  failed: number;
}

export function ping(pingOpts: _tcpPing.Options): Promise<_tcpPing.Result> {
  return new Promise((resolve, reject) => {
    (async () => {
      while(concurrentConnections > 25) {
        await sleep(100);
      }
      concurrentConnections++;
      _tcpPing.ping(pingOpts, (err: unknown, data: _tcpPing.Result) => {
        concurrentConnections--;
        if(err) {
          return reject(err);
        }
        resolve(data);
      });
    })();
  });
}

export async function runPingLoop(address: string, cb: (result: _tcpPing.Result) => Promise<boolean>): Promise<void> {
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

export interface TcppErrorResult {
  err: Error;
  message: string;
  code?: string;
  address?: string;
  port?: number;
}

export function tcppHasError(tcppResults: _tcpPing.Results): TcppErrorResult | undefined {
  let err: Error, message: string, code: string, address: string,
    port: number;
  let tcppHasErrorResult: TcppErrorResult;
  if(tcppResults.err) {
    err = tcppResults.err;
    if(
      ((err as any)?.code)
      && ((typeof (err as any)?.code) === 'string')
    ) {
      message = err.message;
      code = (err as any)?.code as string;
      address = (err as any)?.address;
      port = (err as any)?.port;
      tcppHasErrorResult = {
        err,
        message,
        code,
        address,
        port,
      };
    }
  }
  return tcppHasErrorResult;
}

export function aggregateTcpPingResults(tcpPingResults: _tcpPing.Result[]): TcpPingResultAggregate {
  let resultAggregate: TcpPingResultAggregate;
  let attempts: number, sum: number, min: number, max: number,
    avg: number, median: number, timed_out: number, failed: number;
  let timeVals: number[];
  attempts = 0;
  sum = 0;
  min = Infinity;
  max = -1;
  timed_out = 0;
  failed = 0;
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
        console.error(error);
        console.error(currResult);
        console.error(currSeqResult.err);
        // console.log(currSeqResult.err);
        if(currSeqResult.err.message.includes('timeout')) {
          timed_out++;
        } else {
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
  median = math.median(timeVals);
  avg = sum / attempts;
  resultAggregate = {
    attempts,
    avg,
    median,
    max,
    min,
    timed_out,
    failed,
  };
  return resultAggregate;
}
