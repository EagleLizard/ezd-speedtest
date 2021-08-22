
import * as _tcpPing from 'tcp-ping';
import { sleep } from '../lib/sleep';
import { Timer } from '../lib/timer';
import { ping, waitForPort } from './ping';

const _PING_QUEUE_MIN = 10;
const _PING_QUEUE_MAX = 30;
// const _PING_QUEUE_MAX = 31;
const PING_QUEUE_CHECK_INTERVAL = 1000;
const QUEUE_CLEAR_MS = 10;

// const POST_QUEUE_CLEAR_MS = 100;
const POST_QUEUE_CLEAR_MS = 100;

// const PING_QUEUE_SHRINK_DIVISOR = 128;
// const PING_QUEUE_SHRINK_DIVISOR = 64;
// const PING_QUEUE_SHRINK_DIVISOR = 32;
const PING_QUEUE_SHRINK_DIVISOR = 24;
// const PING_QUEUE_SHRINK_DIVISOR = 16;
// const PING_QUEUE_SHRINK_DIVISOR = 12;
// const PING_QUEUE_SHRINK_DIVISOR = 8;
// const PING_QUEUE_SHRINK_DIVISOR = 4;

type pingJobData = _tcpPing.Result;

interface PingJob<T = pingJobData> {
  id: number;
  pingOpts: _tcpPing.Options;
  resolver: (data: T) => void;
}

export class PingQueue {
  pingJobQueue: PingJob[];
  runningPingJobs: PingJob[];

  private PING_QUEUE_MAX: number;

  private doCheck: boolean;
  private doClearRunQueue: boolean;
  private uniqueJobId: number;
  private queueClearPromise: Promise<void>;
  private portFlip: boolean;

  numQueueClears: number;
  clearQueueTimeMs: number;

  constructor(numTargets: number) {

    this.pingJobQueue = [];
    this.runningPingJobs = [];
    this.doCheck = false;
    this.doClearRunQueue = false;
    this.uniqueJobId = 0;
    this.portFlip = false;

    this.numQueueClears = 0;
    this.clearQueueTimeMs = 0;

    const queueSizeFromTargets = numTargets / 1.5;
    if(queueSizeFromTargets <= _PING_QUEUE_MIN) {
      this.PING_QUEUE_MAX = _PING_QUEUE_MIN;
    } else if(queueSizeFromTargets > _PING_QUEUE_MAX) {
      this.PING_QUEUE_MAX = _PING_QUEUE_MAX;
    } else {
      this.PING_QUEUE_MAX = Math.round(queueSizeFromTargets);
    }
    /*
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    */
    const pingQueueMaxStr = `PING_QUEUE_MAX: ${this.PING_QUEUE_MAX}`;
    const pingQueueCheckIntervalStr = `PING_QUEUE_CHECK_INTERVAL: ${PING_QUEUE_CHECK_INTERVAL}`;
    const queueClearMsStr = `QUEUE_CLEAR_MS: ${QUEUE_CLEAR_MS}`;
    const postQueueClearMsStr = `POST_QUEUE_CLEAR_MS: ${POST_QUEUE_CLEAR_MS}`;
    const pingQueueShrinkDivisorStr = `PING_QUEUE_SHRINK_DIVISOR: ${PING_QUEUE_SHRINK_DIVISOR}`;
    console.log(pingQueueMaxStr);
    console.log(pingQueueCheckIntervalStr);
    console.log(queueClearMsStr);
    console.log(postQueueClearMsStr);
    console.log(pingQueueShrinkDivisorStr);
    console.error();
    console.error(pingQueueMaxStr);
    console.error(pingQueueCheckIntervalStr);
    console.error(queueClearMsStr);
    console.error(postQueueClearMsStr);
    console.error(pingQueueShrinkDivisorStr);
    console.error();
  }

  get pingQueueMax(): number {
    return this.PING_QUEUE_MAX;
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
      this.enqueuePingJob(pingJob);
    });
  }

  start() {
    this.doCheck = true;
    this.checkQueueLoop();
  }

  async stop() {
    await this.waitForRunQueueClear();
    this.doCheck = false;
  }

  isRunning(): boolean {
    return this.doCheck;
  }

  private async enqueuePingJob(pingJob: PingJob) {
    this.pingJobQueue.push(pingJob);
  }

  private async enqueueRunningPingJob(pingJob: PingJob) {
    this.runningPingJobs.push(pingJob);
  }

  private dequeuePingJob(pingJob: PingJob) {
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

  private async waitForRunQueueClear() {
    if(!this.doClearRunQueue) {
      return;
    }
    if(this.queueClearPromise !== undefined) {
      return this.queueClearPromise;
    }

    this.queueClearPromise = new Promise<void>(resolve => {
      let waitForPort80Promise: Promise<void>, waitForPort443Promise: Promise<void>;

      let queueClearTimer = Timer.start();

      (async () => {
        const ERR_CHAR = '•';
        process.stdout.write('X');

        while(this.runningPingJobs.length > 0) {
          await sleep(QUEUE_CLEAR_MS);
        }
        waitForPort80Promise = waitForPort(80, 'www.google.com');
        waitForPort443Promise = waitForPort(443, 'www.google.com');
        await Promise.all([
          waitForPort80Promise,
          waitForPort443Promise,
        ]);

        if(this.PING_QUEUE_MAX > _PING_QUEUE_MIN) {
          const nextPingDiff = Math.ceil((this.PING_QUEUE_MAX - _PING_QUEUE_MIN) / PING_QUEUE_SHRINK_DIVISOR);

          this.PING_QUEUE_MAX = this.PING_QUEUE_MAX - nextPingDiff;
          console.error();
          console.error(`ping max diff: ${nextPingDiff}`);
          console.error(`this.PING_QUEUE_MAX: ${this.PING_QUEUE_MAX}`);
        }

        process.stdout.write(ERR_CHAR);
        await sleep(POST_QUEUE_CLEAR_MS);
        resolve();
        this.doClearRunQueue = false;
        this.numQueueClears++;
        this.queueClearPromise = undefined;
        this.clearQueueTimeMs += queueClearTimer.stop();
      })();
    });
    return this.queueClearPromise;
  }

  private async startJob() {
    let port: number;
    const currPingJob = this.pingJobQueue.shift();
    port = this.portFlip ? 80 : 443;
    this.portFlip = !this.portFlip;
    currPingJob.pingOpts.port = port;

    ping(currPingJob.pingOpts).then(tcpPingResult => {
      let waitForPortPromise: Promise<void>;
      if(tcpPingResult.results?.length > 0) {
        const tcpPingResultsArr = tcpPingResult.results;
        for(let i = 0, currResults: _tcpPing.Results; currResults = tcpPingResultsArr[i], i < tcpPingResultsArr.length; ++i) {
          if(
            (currResults.err !== undefined)
            && (currResults.err.message.includes('EADDRNOTAVAIL'))
          ) {
            this.doClearRunQueue = true;
            waitForPortPromise = waitForPort(currPingJob.pingOpts.port, currPingJob.pingOpts.address);
            break;
          }
        }
      }
      if(waitForPortPromise === undefined) {
        waitForPortPromise = Promise.resolve();
      }
      waitForPortPromise.then(() => {
        currPingJob.resolver(tcpPingResult);
        this.dequeuePingJob(currPingJob);
      });
    });

    this.enqueueRunningPingJob(currPingJob);
  }

  private async checkQueue() {
    if(this.doClearRunQueue) {
      return await this.waitForRunQueueClear();
    }
    while(
      (this.pingJobQueue.length > 0)
      && (this.runningPingJobs.length <= this.PING_QUEUE_MAX)
    ) {
      await this.startJob();
    }
  }

  private checkQueueLoop() {
    if(this.doCheck) {
      if(!this.doClearRunQueue) {
        this.checkQueue();
      }
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

  pingQueue = new PingQueue(targets.length);
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
  await pingQueue.stop();

  console.log('pingJobResults');
  console.log(pingJobResults.length);
  // console.log(resultMap);

}
