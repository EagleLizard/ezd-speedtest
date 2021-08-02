
import { PRIMES } from '../lib/math-util';

export function getPrintByCount(
  numTargets: number,
  primeBase: number,
  primeBaseMod: number,
  transform?: (resultCount: number, charIdx: number, numChars?: number) => boolean
): (resultCount: number) => void {
  let charArr: string[], moduloFactors: number[];
  charArr = [
    '⣀',
    '⣠',
    '⣤',
    '⣴',
    '⣶',
    '⣾',
    '⣿',
  ];

  const visitedPrintCharMap: Record<number, boolean> = {};
  const defaultTransform = (resultCount: number, charIdx: number) => {
    let base: number, baseMod: number, baseIdxMod: number,
      primeIdx: number;
    let modVal: number, doPrint: boolean;

    base = primeBase;
    baseMod = primeBaseMod;

    baseIdxMod = (baseMod * charIdx);
    primeIdx = base + baseIdxMod;
    modVal = PRIMES[primeIdx];
    doPrint = (resultCount % modVal) === 0;
    if(doPrint && !visitedPrintCharMap[charIdx]) {
      visitedPrintCharMap[charIdx] = true;
      console.error(`charIdx: ${charIdx}, primeIdx: ${primeIdx}, primeVal: ${modVal}`);
    }
    return doPrint;
  };
  if(transform === undefined) {
    transform = defaultTransform;
  }

  return (resultCount: number) => {
    for(let i = 0; i < charArr.length; ++i) {
      let doPrint: boolean;
      doPrint = transform(resultCount, i, charArr.length);
      if(doPrint) {
        process.stdout.write(charArr[i]);
      }
    }
  };
}
