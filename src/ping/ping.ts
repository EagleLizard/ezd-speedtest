
import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import  * as _tcpPing from 'tcp-ping';

import {
  sleep,
} from '../lib/sleep';

let concurrentConnections = 0;

const CONCURRENT_CONNECTION_MAX = 50;
const CONCURRENT_SLEEP_MS = 200;

console.log(`CONCURRENT_CONNECTION_MAX: ${CONCURRENT_CONNECTION_MAX}`);
console.log(`CONCURRENT_SLEEP_MS: ${CONCURRENT_SLEEP_MS}`);
console.error('');
console.error(`CONCURRENT_CONNECTION_MAX: ${CONCURRENT_CONNECTION_MAX}`);
console.error(`CONCURRENT_SLEEP_MS: ${CONCURRENT_SLEEP_MS}`);

export function ping(pingOpts: _tcpPing.Options): Promise<_tcpPing.Result> {
  return new Promise((resolve, reject) => {
    (async () => {
      while(concurrentConnections > CONCURRENT_CONNECTION_MAX) {
        await sleep(CONCURRENT_SLEEP_MS);
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
  let port: number, portFlip: boolean;
  portFlip = false;
  for(;;) {
    port = portFlip ? 80 : 443;
    portFlip = !portFlip;
    /*
      80
      443
    */
    pingResult = await ping({
      address,
      attempts: 1,
      // port: 80,
      port,
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
