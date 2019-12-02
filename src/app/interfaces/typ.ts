export interface Typ {
	id: number,
	typ: TypEnum,
	icon: string
}

export enum TypEnum {
	normal,
	pflanze,
	wasser,
	feuer,
	eis,
	gift,
	finsternis,
	geist,
	metall,
	chemie,
	parasit,
	unsichtbar,
	flug,
	schwebe,
	elektro,
	boden,
	gestein,
	insekt,
	laser,
	magie,
	psycho
}

export let StrToTyp = {
	"Normal": {id: 0, icon: "heart-empty", typ: TypEnum.psycho},
	"Pflanze": {id: 0, icon: "leaf", typ: TypEnum.psycho},
	"Wasser": {id: 0, icon: "water", typ: TypEnum.psycho},
	"Feuer": {id: 0, icon: "flame", typ: TypEnum.psycho},
	"Eis": {id: 0, icon: "snow", typ: TypEnum.psycho},
	"Gift": {id: 0, icon: "heart-dislike", typ: TypEnum.psycho},
	"Finsternis": {id: 0, icon: "moon", typ: TypEnum.psycho},
	"Geist": {id: 0, icon: "logo-snapchat", typ: TypEnum.psycho},
	"Metall": {id: 0, icon: "settings", typ: TypEnum.psycho},
	"Chemie": {id: 0, icon: "nuclear", typ: TypEnum.psycho},
	"Parasit": {id: 0, icon: "pie", typ: TypEnum.psycho},
	"Unsichtbar": {id: 0, icon: "speedometer", typ: TypEnum.psycho},
	"Flug": {id: 0, icon: "jet", typ: TypEnum.psycho},
	"Schwebe": {id: 0, icon: "code-working", typ: TypEnum.psycho},
	"Elektro": {id: 0, icon: "flash", typ: TypEnum.psycho},
	"Boden": {id: 0, icon: "globe", typ: TypEnum.psycho},
	"Gestein": {id: 0, icon: "hammer", typ: TypEnum.psycho},
	"Insekt": {id: 0, icon: "bug", typ: TypEnum.psycho},
	"Laser": {id: 0, icon: "git-commit", typ: TypEnum.psycho},
	"Magie": {id: 0, icon: "color-wand", typ: TypEnum.psycho},
	"Psycho": {id: 0, icon: "eye", typ: TypEnum.psycho}
}
