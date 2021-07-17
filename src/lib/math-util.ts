
import * as math from 'mathjs';

export const PRIMES = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29,
  31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97, 101, 103, 107, 109, 113,
  127, 131, 137, 139, 149, 151,	157, 163, 167,
];

export interface AvgAccumulator {
  count: number;
  avg: number;
}
export type WeightedAverages = Record<string, AvgAccumulator>;

export function getWeightedAverages(kvTuples: [ string, number ][]): WeightedAverages {
  let valuesMap: Record<string, number[]>, avgMap: WeightedAverages;
  valuesMap = {};
  for(let i = 0, currTuple: [ string, number ]; currTuple = kvTuples[i], i < kvTuples.length; ++i) {
    let key: string, value: number;
    [ key, value ] = currTuple;
    if(valuesMap[key] === undefined) {
      valuesMap[key] = [];
    }
    valuesMap[key].push(value);
  }
  avgMap = Object.keys(valuesMap).reduce((acc, curr) => {
    let avg: number, count: number;
    try {
      avg = math.mean(valuesMap[curr]);
    } catch(e) {
      console.error(e);
      return acc;
    }
    count = valuesMap[curr].length;
    acc[curr] = {
      avg,
      count,
    };
    return acc;
  }, {} as Record<string, AvgAccumulator>);
  return avgMap;
}
