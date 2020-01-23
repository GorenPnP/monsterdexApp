import { Typ } from './typ';

export interface Attacke {
	id: number,
	name: string,
	schaden: string,
	beschreibung: string,
	typen: Typ[]
}
