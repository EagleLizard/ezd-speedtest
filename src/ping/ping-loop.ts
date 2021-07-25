
import  * as _tcpPing from 'tcp-ping';
import { ping } from './ping';
import { PingQueue } from './ping-queue';

const pingQueue = new PingQueue;

export function stopPingQueue() {
  pingQueue.stop();
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
    // pingResult = await ping({
    //   address,
    //   attempts: 1,
    //   port,
    // });
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
