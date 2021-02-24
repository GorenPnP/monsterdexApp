import { Monster } from './monster';
import { Type } from './type';

/**
 * an interface for attacks
 */
export type Attack = {
  /**
   * id; same as the one in db; used for default sorting an fetching
   */
  readonly id: number;
  /**
   * name of the attack
   */
  readonly name: string;
  /**
   * damage dealt
   */
  readonly damage: string;
  /**
   * note on i.e. side effects
   */
  readonly description: string;
  /**
   * list of all types
   */
  readonly types: Type[];
  /**
   * list of all IDs of monsters capable of this attack
   */
  readonly monsters: number[];
  showMonsters: Monster[];
}
