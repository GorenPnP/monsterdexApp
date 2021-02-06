/**
 * interface representing a type. Used in monsters and attacks.
 */
export type Type = {
  /**
   * id, same as the one in db, used for default sorting an fetching
   */
  id: number;
  /**
   * name of type
   */
  name: string;
  /**
   * icon string to represent a uniform ion-icon throughout the app
   */
  icon: string;
}

const conversionMap: {[type_id: number]: string} = {
  6: 'globe',           // Boden
  19: 'flask',          // Chemie
  16: 'snow',           // Eis
  1: 'flash',           // Elektro
  20: 'flame',          // Feuer
  11: 'moon',           // Finsternis
  4: 'airplane',        // Flug
  13: 'logo-snapchat',  // Geist
  ​18: 'hammer',         // Gestein
  10: 'skull',          // Gift
  12: 'bug',            // Insekt
  14: 'git-commit',     // Laser
  9: 'color-wand',      // Magie
  ​7: 'settings',        // Metall
  8: 'body',            // Normal
  5: 'heart-dislike',   // Parasit
  ​15: 'leaf',           // Pflanze
  17: 'eye',            // Psycho
  ​2: 'code-working',    // Schwebe
  ​21: 'speedometer',    // Unsichtbar
  ​3: 'water'            // Wasser
};

export function getIonIcon(type_id: number): string {
  return conversionMap[type_id] || '';
}