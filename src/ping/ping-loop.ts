
import  * as _tcpPing from 'tcp-ping';
import { sleep } from '../lib/sleep';
import { Timer } from '../lib/timer';
import { PingQueue } from './ping-queue';
import { getPingQueueSingleton } from './ping-queue-singleton';

export async function runPingLoop(address: string, waitMs: number, cb: (result: _tcpPing.Result) => Promise<boolean>): Promise<void> {
  let pingResult: _tcpPing.Result, doStop: boolean;
  let pingQueue: PingQueue;
  pingQueue = getPingQueueSingleton();

  if(!pingQueue.isRunning()) {
    pingQueue.start();
  }
  for(;;) {
    let timer: Timer, waitDiff: number;
    timer = Timer.start();
    pingResult = await pingQueue.queuePing({
      address,
      attempts: 1,
    });
    waitDiff = waitMs - timer.current();
    if(waitDiff > 0) {
      await sleep(waitDiff);
    }
    doStop = await cb(pingResult);
    if(doStop) {
      break;
    }
  }
}
