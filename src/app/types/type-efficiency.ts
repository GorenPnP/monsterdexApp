
export enum Efficiency {
    VERY_EFFECTIVE,
    NOT_EFFECTIVE,
    DOES_NOT_HIT,
    NORMAL_EFFECTIVE
}

export interface TypeEfficiency {
    fromType: number;
    toType: number;
    efficiency?: Efficiency;
    efficiencyValue?: number;
  }