export enum Efficiency {
    VERY_EFFECTIVE = 'VERY_EFFECTIVE',
    NOT_EFFECTIVE = 'NOT_EFFECTIVE',
    DOES_NOT_HIT = 'DOES_NOT_HIT',
    NORMAL_EFFECTIVE = 'NORMAL_EFFECTIVE'
}

export function efficiencyFromValue(value: number): Efficiency {
    if (value === 0) { return Efficiency.DOES_NOT_HIT; }
    if (value === 1) { return Efficiency.NORMAL_EFFECTIVE; }
    return value < 1 ? Efficiency.NOT_EFFECTIVE : Efficiency.VERY_EFFECTIVE;
}

export interface TypeEfficiency {
    readonly fromType: number;
    readonly toType: number;
    readonly efficiency?: Efficiency;
    readonly efficiencyValue?: number;
  }