
export function getIntuitiveTimeFromMs(ms: number): [ number, string ] {
  let seconds: number, minutes: number;
  let label: string;
  if(ms < (1000)) {
    label = 'ms';
    return [ ms, label ];
  }
  seconds = ms / 1000;
  if(seconds < (60)) {
    label = 'seconds';
    return [ seconds, label ];
  }
  minutes = seconds / 60;
  label = 'minutes';
  return [ minutes, label ];
}

export function getIntuitiveTimeStr(ms: number): string {
  let intuitiveTime: [ number, string ];
  intuitiveTime = getIntuitiveTimeFromMs(ms);
  return `${intuitiveTime[0].toFixed(2)} ${intuitiveTime[1]}`;
}
