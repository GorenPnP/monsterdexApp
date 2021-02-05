import { Attack } from "./attack";
import { Monster } from "./monster";
import { Type } from "./type";

export type Query = {
    monster: Monster[],
    attack: Attack[],
    type: Type[],
    // typeEfficiency: TypeEfficiency[]
}