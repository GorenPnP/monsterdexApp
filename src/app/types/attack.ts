import { Monster } from './monster';
import { Type } from './type';

/**
 * an interface for attacks
 */
export type Attack = {
  /**
   * id; same as the one in db; used for default sorting an fetching
   */
  id: number;
  /**
   * name of the attack
   */
  name: string;
  /**
   * damage dealt
   */
  damage: string;
  /**
   * note on i.e. side effects
   */
  description: string;
  /**
   * list of all types
   */
  types: Type[];
  /**
   * list of all IDs of monsters capable of this attack
   */
  monsters: number[];
  showMonsters: Monster[];
}
