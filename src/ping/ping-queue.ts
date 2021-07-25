
import * as _tcpPing from 'tcp-ping';
import { sleep } from '../lib/sleep';
import { ping } from './ping';

const PING_QUEUE_MAX = 37;
const PING_QUEUE_CHECK_INTERVAL = 1000;
const pingQueueMaxStr = `PING_QUEUE_MAX: ${PING_QUEUE_MAX}`;
const pingQueueCheckIntervalStr = `PING_QUEUE_CHECK_INTERVAL: ${PING_QUEUE_CHECK_INTERVAL}`;
console.log(pingQueueMaxStr);
console.log(pingQueueCheckIntervalStr);
console.error(pingQueueMaxStr);
console.error(pingQueueCheckIntervalStr);

type pingJobData = _tcpPing.Result;

interface PingJob<T = pingJobData> {
  id: number;
  pingOpts: _tcpPing.Options;
  resolver: (data: T) => void;
}

export class PingQueue {
  pingJobQueue: PingJob[];
  runningPingJobs: PingJob[];

  private doCheck: boolean;
  private uniqueJobId: number;

  constructor() {
    this.pingJobQueue = [];
    this.runningPingJobs = [];
    this.doCheck = false;
    this.uniqueJobId = 0;
  }

  queuePing(opts: _tcpPing.Options): Promise<_tcpPing.Result> {
    return new Promise(resolve => {
      let pingJob: PingJob;
      const resolver = (data: _tcpPing.Result) => {
        resolve(data);
      };
      pingJob = {
        id: this.uniqueJobId++,
        pingOpts: opts,
        resolver,
      };
      this.enqueue(pingJob);
    });
  }

  start() {
    this.doCheck = true;
    this.checkQueueLoop();
  }

  stop() {
    this.doCheck = false;
  }

  isRunning(): boolean {
    return this.doCheck;
  }

  private enqueue(pingJob: PingJob) {
    this.pingJobQueue.push(pingJob);
  }

  private dequeue(pingJob: PingJob) {
    let foundJobIdx: number;
    foundJobIdx = this.runningPingJobs.findIndex(pingJob => {
      return pingJob.id === pingJob.id;
    });
    if(foundJobIdx === -1) {
      const err = new Error(`Running Job Not Found ${pingJob.id}`);
      console.error(pingJob);
      throw err;
    }
    this.runningPingJobs.splice(foundJobIdx, 1);
    this.checkQueue();
  }

  private startJob() {
    const currPingJob = this.pingJobQueue.shift();
    ping(currPingJob.pingOpts).then(tcpPingResult => {
      currPingJob.resolver(tcpPingResult);
      this.dequeue(currPingJob);
    });
    this.runningPingJobs.push(currPingJob);
  }

  private checkQueue() {
    while(
      (this.pingJobQueue.length > 0)
      && (this.runningPingJobs.length <= PING_QUEUE_MAX)
    ) {
      this.startJob();
    }
  }

  private checkQueueLoop() {
    if(this.doCheck) {
      this.checkQueue();
      sleep(PING_QUEUE_CHECK_INTERVAL).then(() => {
        this.checkQueueLoop();
      });
    }
  }
}

export async function pingQueueTestHandler(targets: string[], testRuns = 1) {
  let pingQueue: PingQueue, pingJobPromises: Promise<_tcpPing.Result>[];
  let pingJobResults: _tcpPing.Result[];
  let resultMap: Record<string, _tcpPing.Result[]>;

  resultMap = targets.reduce((acc, curr) => {
    acc[curr] = [];
    return acc;
  }, {} as Record<string, _tcpPing.Result[]>);

  pingQueue = new PingQueue;
  pingQueue.start();
  pingJobPromises = [];

  for(let k = 0; k < testRuns; ++k) {
    for(let i = 0, currTarget: string; currTarget = targets[i], i < targets.length; ++i) {
      let pingPromise: Promise<_tcpPing.Result>;
      pingPromise = pingQueue.queuePing({
        address: currTarget,
        attempts: 1,
      }).then(tcpPingResult => {
        console.error(tcpPingResult.address);
        resultMap[tcpPingResult.address].push(tcpPingResult);
        return tcpPingResult;
      });
      pingJobPromises.push(pingPromise);
    }
  }
  try {
    pingJobResults = await Promise.all(pingJobPromises);
  } catch(e) {
    console.log(e);
  }
  pingQueue.stop();

  console.log('pingJobResults');
  console.log(pingJobResults.length);
  // console.log(resultMap);

}
