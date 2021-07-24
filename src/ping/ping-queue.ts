
import * as _tcpPing from 'tcp-ping';
import { sleep } from '../lib/sleep';
import { ping } from './ping';

const PING_QUEUE_MAX = 50;

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
    this.checkQueue();
  }

  stop() {
    this.doCheck = false;
  }

  private enqueue(pingJob: PingJob) {
    this.pingJobQueue.push(pingJob);
  }

  private startJob() {
    const currPingJob = this.pingJobQueue.shift();
    ping(currPingJob.pingOpts).then(tcpPingResult => {
      let foundJobIdx: number;
      foundJobIdx = this.runningPingJobs.findIndex(pingJob => {
        return pingJob.id === currPingJob.id;
      });
      if(foundJobIdx === -1) {
        const err = new Error(`Running Job Not Found ${currPingJob.id}`);
        console.error(currPingJob);
        throw err;
      }
      currPingJob.resolver(tcpPingResult);
      this.runningPingJobs.splice(foundJobIdx, 1);
    });
    this.runningPingJobs.push(currPingJob);
  }

  private checkQueue() {
    if(this.doCheck) {
      while(
        (this.pingJobQueue.length > 0)
        && (this.runningPingJobs.length <= PING_QUEUE_MAX)
      ) {
        this.startJob();
      }
      sleep(100).then(() => {
        this.checkQueue();
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
