
/*
T ms: [1-9][0-9]{4}
T ms: [1-9]{1}[0-9]{4}
T ms: [1-9][5-9][0-9]{3}
*/

import { Socket } from 'net';
import sourceMapSupport from 'source-map-support';
sourceMapSupport.install();

import  * as _tcpPing from 'tcp-ping';
import { sleep } from '../lib/sleep';
import { getIntuitiveTimeStr } from '../lib/time-util';
import { Timer } from '../lib/timer';

// const MAX_WAIT_FOR_PORT_RETRIES = 46;

// const BACKOFF_BASE = 2;
// const MAX_WAIT_FOR_PORT_RETRIES = 13;
// const BACKOFF_BASE = 1.5;
// const MAX_WAIT_FOR_PORT_RETRIES = 22;
const BACKOFF_BASE = 1.2;
const MAX_WAIT_FOR_PORT_RETRIES = 48;

// const MAX_WAIT_FOR_PORT_RETRIES = 40;

const WAIT_FOR_PORT_TIMEOUT_MS = 4096;
// const MAX_TIMEDOUT_RETRIES = MAX_WAIT_FOR_PORT_RETRIES;
// const MAX_TIMEDOUT_RETRIES = 28;
const MAX_TIMEDOUT_RETRIES = Math.round(MAX_WAIT_FOR_PORT_RETRIES * 0.6);

export function testConnect(port = 80, address = 'localhost', timeoutMs: number): [ () => void, Promise<void> ] {
  let hoistedForceDisconnect: () => void, connectPromise: Promise<void>;

  connectPromise = new Promise((resolve, reject) => {
    let done: boolean;
    const sock = new Socket();
    done = false;
    sock.connect(port, address, () => {
      if(done) {
        return;
      }
      sock.destroy();
      resolve();
      done = true;
    });
    sock.on('error', err => {
      if(done) {
        return;
      }
      reject(err);
      done = true;
    });

    setTimeout(() => {
      forceDisconnect();
    }, timeoutMs);

    hoistedForceDisconnect = forceDisconnect;

    function forceDisconnect() {
      if(done) {
        return;
      }
      reject({
        timeout: true,
      });
      done = true;
      sock.destroy();
    }
  });

  return [ cancelCb, connectPromise ];

  function cancelCb() {
    if(!hoistedForceDisconnect) {
      throw new Error('hoistedForceDisconnect not defined');
    }
    return hoistedForceDisconnect();
  }
}

function getBackoff(retry: number): number {
  let calculated = BACKOFF_BASE ** retry;
  // let calculated = 2 ** retry;
  return Math.round(calculated);
}

export async function waitForPort(port: number, address: string) {
  let unavailable: boolean, numRetries: number, waitForMs: number, timedOut: boolean,
    forcedCancel: boolean;
  let currentRunningMs: number;
  let cancelCb: () => void, testConnectPromise: Promise<void>;
  unavailable = true;
  numRetries = 0;
  timedOut = false;
  forcedCancel = false;
  const timer = Timer.start();
  while(
    unavailable
    && !forcedCancel
  ) {
    if(timedOut && (numRetries >= MAX_TIMEDOUT_RETRIES)) {
      unavailable = false;
      break;
    }
    try {
      [ cancelCb, testConnectPromise ] = testConnect(port, address, WAIT_FOR_PORT_TIMEOUT_MS);
      await testConnectPromise;
      unavailable = false;
    } catch(e) {
      if(e?.timeout) {
        timedOut = true;
      }
      numRetries++;
      waitForMs = getBackoff(numRetries);
      await sleep(waitForMs);
    }
    currentRunningMs = timer.current();
    if(currentRunningMs > 10e3) {
      // forcedCancel = true;
      // cancelCb();
    }
    if(numRetries > MAX_WAIT_FOR_PORT_RETRIES) {
      break;
    }
  }
  const deltaMs = timer.stop();
  if(
    false
    || (timedOut)
    // || (!unavailable && (deltaMs > 1e3) && (numRetries > 1))
    || (unavailable)
    // || (deltaMs > 20e3)
  ) {
    console.error(`\n${address}:${port}`);
    console.error(`numTries: ${numRetries}`);
    console.error(`waitForMs: ${waitForMs}`);
    console.error(`timedOut: ${timedOut}`);
    console.error(`failed: ${unavailable}`);
    console.error(`T ms: ${deltaMs}`);
    console.error(`T: ${getIntuitiveTimeStr(deltaMs)}`);
  }
  // await sleep(2000);
}

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
