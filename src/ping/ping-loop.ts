
import  * as _tcpPing from 'tcp-ping';
import { getIntuitiveTimeStr } from '../lib/time-util';
import { ping } from './ping';
import { PingQueue } from './ping-queue';

let pingQueue: PingQueue;

export async function initializePingQueue(numTargets: number) {
  if(pingQueue === undefined) {
    pingQueue = new PingQueue(numTargets);
  }
  return pingQueue;
}

export async function stopPingQueue() {
  await pingQueue.stop();
  setTimeout(() => {
    console.error();
    console.error(`pingQueue.PING_QUEUE_MAX (after): ${pingQueue.pingQueueMax}`);
    console.error(`numQueueClears: ${pingQueue.numQueueClears}`);
    console.error(`time spent clearing queue: ${getIntuitiveTimeStr(pingQueue.clearQueueTimeMs)}`);
    console.error();
  });
}

export async function runPingLoop(address: string, cb: (result: _tcpPing.Result) => Promise<boolean>): Promise<void> {
  let pingResult: _tcpPing.Result, doStop: boolean;
  let port: number, portFlip: boolean;
  portFlip = false;
  if(!pingQueue.isRunning()) {
    pingQueue.start();
  }
  for(;;) {
    port = portFlip ? 80 : 443;
    portFlip = !portFlip;
    pingResult = await pingQueue.queuePing({
      address,
      attempts: 1,
      port,
    });
    doStop = await cb(pingResult);
    if(doStop) {
      break;
    }
  }
}
