
export enum Efficiency {
    VERY_EFFECTIVE,
    NOT_EFFECTIVE,
    DOES_NOT_HIT,
    NORMAL_EFFECTIVE
}

export interface TypeEfficiency {
    readonly fromType: number;
    readonly toType: number;
    readonly efficiency?: Efficiency;
    readonly efficiencyValue?: number;
  }