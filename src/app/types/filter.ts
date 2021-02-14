import { RankOrdering } from "./rank-ordering";

export interface Filter {
    pageNr?: number,
    typeAnd?: boolean,
    types?: number[],
    name?: string,
    rankOrdering?: RankOrdering,
    ids?: number[]
  }