
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
    _tcpPing.ping(pingOpts, (err: unknown, data: _tcpPing.Result) => {
      if(err) {
        return reject(err);
      }
      resolve(data);
    });
  });
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
