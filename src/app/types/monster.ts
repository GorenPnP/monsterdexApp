import { SafeUrl } from '@angular/platform-browser';
import { Attack } from './attack';
import { Type } from './type';

/**
 * interface for a monster
 */
export type Monster = {
  /**
   * size suited for thumbnails, is a base64 png image
   */
  thumbnail?: string;
  showThumbnail?: SafeUrl;
  /**
   * size suited for larger formats, is a base64 png image
   */
  image?: string;
  showImage?: SafeUrl;
  /**
   * id; same as the one in db; used for default sorting an fetching
   */
  id: number;
  /**
   * name of the monster species
   */
  name?: string;
  /**
   * rank; th higher the (absolute) value; the stronger
   */
  rank?: number;
  /**
   * body height as decimal in meters
   */
  height?: number;
  /**
   * body weight as decimal in kilograms
   */
  weight?: number;
  /**
   * (max) health
   */
  hp?: number;
  /**
   * typical location where the species would be met
   */
  habitat?: string;
  /**
   * resistance against attacks
   */
  damagePrevention?: string;
  /**
   * note on the monster
   */
  description?: string;
  /**
   * list of all types
   */
  types?: Type[];
  /**
   * list of all ids of attacks of the monster
   */
  attacks?: Attack[];
  /**
   * list of all 'Gegenteilmonsters' to a monster
   */
  opposite?: number[];
  oppositeMonsters?: Monster[];
  /**
   * similar forms between which the monster can switch at will
   */
  forms?: number[];
  formMonsters?: Monster[];
  /**
   * ids of monsters this one could have developed from
   */
  evolutionPre?: number[];
  preMonsters?: Monster[];
  /**
   * ids of monsters this one can develop into
   */
  evolutionAfter?: number[];
  afterMonsters?: Monster[];
}
