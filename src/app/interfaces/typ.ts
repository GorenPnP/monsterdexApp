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
	"Normal": {id: 0, icon: "heart-empty", typ: TypEnum.normal},
	"Pflanze": {id: 0, icon: "leaf", typ: TypEnum.pflanze},
	"Wasser": {id: 0, icon: "water", typ: TypEnum.wasser},
	"Feuer": {id: 0, icon: "flame", typ: TypEnum.feuer},
	"Eis": {id: 0, icon: "snow", typ: TypEnum.eis},
	"Gift": {id: 0, icon: "heart-dislike", typ: TypEnum.gift},
	"Finsternis": {id: 0, icon: "moon", typ: TypEnum.finsternis},
	"Geist": {id: 0, icon: "logo-snapchat", typ: TypEnum.geist},
	"Metall": {id: 0, icon: "settings", typ: TypEnum.metall},
	"Chemie": {id: 0, icon: "nuclear", typ: TypEnum.chemie},
	"Parasit": {id: 0, icon: "pie", typ: TypEnum.parasit},
	"Unsichtbar": {id: 0, icon: "speedometer", typ: TypEnum.unsichtbar},
	"Flug": {id: 0, icon: "jet", typ: TypEnum.flug},
	"Schwebe": {id: 0, icon: "code-working", typ: TypEnum.schwebe},
	"Elektro": {id: 0, icon: "flash", typ: TypEnum.elektro},
	"Boden": {id: 0, icon: "globe", typ: TypEnum.boden},
	"Gestein": {id: 0, icon: "hammer", typ: TypEnum.gestein},
	"Insekt": {id: 0, icon: "bug", typ: TypEnum.insekt},
	"Laser": {id: 0, icon: "git-commit", typ: TypEnum.laser},
	"Magie": {id: 0, icon: "color-wand", typ: TypEnum.magie},
	"Psycho": {id: 0, icon: "eye", typ: TypEnum.psycho}
}
