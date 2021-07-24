
import * as math from 'mathjs';

import { PRIMES } from '../lib/math-util';

export function getPrintByCount(numTargets: number, primeBase: number, primeDiff: number): (resultCount: number) => void {
  let charArr: string[], moduloFactors: number[];
  charArr = [
    '⣀',
    '⣤',
    '⣶',
    '⣾',
    '⣿',
  ];
  moduloFactors = charArr.map((char, idx) => {
    let primeNum: number;
    primeNum = PRIMES[primeBase + (primeDiff * idx)];
    return primeNum;
  });

  console.log('moduloFactors:');
  console.log(moduloFactors);
  return (resultCount: number) => {
    for(let i = 0; i < moduloFactors.length; ++i) {
      if((resultCount % moduloFactors[i]) === 0) {
        process.stdout.write(charArr[i]);
      }
    }
  };
}
