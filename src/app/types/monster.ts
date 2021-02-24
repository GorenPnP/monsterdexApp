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
  readonly thumbnail?: string;
  showThumbnail?: SafeUrl;
  /**
   * size suited for larger formats, is a base64 png image
   */
  readonly image?: string;
  showImage?: SafeUrl;
  /**
   * id; same as the one in db; used for default sorting an fetching
   */
  readonly id: number;
  /**
   * name of the monster species
   */
  readonly name?: string;
  /**
   * rank; th higher the (absolute) value; the stronger
   */
  readonly rank?: number;
  /**
   * body height as decimal in meters
   */
  readonly height?: number;
  /**
   * body weight as decimal in kilograms
   */
  readonly weight?: number;
  /**
   * (max) health
   */
  readonly hp?: number;
  /**
   * typical location where the species would be met
   */
  readonly habitat?: string;
  /**
   * resistance against attacks
   */
  readonly damagePrevention?: string;
  /**
   * note on the monster
   */
  readonly description?: string;
  /**
   * list of all types
   */
  types?: Type[];
  /**
   * list of all ids of attacks of the monster
   */
  readonly attacks?: Attack[];
  /**
   * list of all 'Gegenteilmonsters' to a monster
   */
  readonly opposite?: number[];
  oppositeMonsters?: Monster[];
  /**
   * similar forms between which the monster can switch at will
   */
  readonly forms?: number[];
  formMonsters?: Monster[];
  /**
   * ids of monsters this one could have developed from
   */
  readonly evolutionPre?: number[];
  preMonsters?: Monster[];
  /**
   * ids of monsters this one can develop into
   */
  readonly evolutionAfter?: number[];
  afterMonsters?: Monster[];
}
