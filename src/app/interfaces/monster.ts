import { Typ } from './typ';

/**
 * interface for a monster
 */
export interface Monster {
  /**
   * id; same as the one in db; used for default sorting an fetching
   */
  id: number;
  /**
   * name of the monster species
   */
  name: string;
  /**
   * rank; th higher the (absolute) value; the stronger
   */
  rang: number;
  /**
   * body height as decimal in meters
   */
  groesse: number;
  /**
   * body weight as decimal in kilograms
   */
  gewicht: number;
  /**
   * (max) health
   */
  hp: number;
  /**
   * typical location where the species would be met
   */
  habitat: string;
  /**
   * resistence against attacks
   */
  schadensverhinderung: string;
  /**
   * note on the monster
   */
  beschreibung: string;
  /**
   * list of all typen
   */
  typen: Typ[];
  /**
   * list of all ids of attacken of the monster
   */
  attacken: number[];
  /**
   * list of all Gegenteilmonster to a monster
   */
  gegenteilmonster: number[];
  /**
   * similar forms between which the monster can switch at will
   */
  aehnlicheFormen: number[];
}
