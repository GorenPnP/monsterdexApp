import { Typ } from './typ';

/**
 * an interface for attacken
 */
export interface Attacke {
	/**
	 * id, same as the one in db, used for default sorting an fetching
	 */
	id: number,
	/**
	 * name of the attacke
	 */
	name: string,
	/**
	 * damage dealed
	 */
	schaden: string,
	/**
	 * note on i.e. side effects
	 */
	beschreibung: string,
	/**
	 * list of all types
	 */
	typen: Typ[]
}
