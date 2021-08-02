
import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import  * as _tcpPing from 'tcp-ping';

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
