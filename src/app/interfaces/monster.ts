import { Typ } from "./typ";

export interface Monster {
	id: number,
	name: string,
	rang: number,
	groesse: number,
	gewicht: number,
	hp: number,
	habitat: string,
	schadensverhinderung: string,

	typen: Typ[],
	attacken: number[],

	isSelected: boolean,
}
