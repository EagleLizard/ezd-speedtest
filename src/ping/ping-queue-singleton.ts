
import { PingQueue } from './ping-queue';
import { getIntuitiveTimeStr } from '../lib/time-util';

let pingQueue: PingQueue;

export function getPingQueueSingleton() {
  if(pingQueue === undefined) {
    throw new Error('Attempted to get pingQueueSingleton instance before initialization');
  }
  return pingQueue;
}

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
