/**
 * representation of an image entry
 */
export interface Image {
	/**
	 * permit searching via string index
	 */
	readonly [index: string]: number|string;
	/**
	 * unique key to an image entry
	 */
	id: number,
	/**
	 * address readable in html template to display image
	 */
	resLocation: string,
}
