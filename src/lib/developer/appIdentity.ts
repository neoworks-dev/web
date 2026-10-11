const HUE_SPAN = 360
const HASH_MODULUS = 2147483647

/** Up to two capital letters from the first words of the app's name. */
export function initialsOf(name: string): string {
	const words = name.split(/[^\p{L}\p{N}]+/u).filter((word) => word !== '')
	if (words.length === 0) {
		return '?'
	}
	return words
		.slice(0, 2)
		.map((word) => Array.from(word)[0])
		.join('')
		.toUpperCase()
}

/** A colour derived from the client id, so an app without a logo always shows the same badge. */
export function colourFor(clientId: string): string {
	let hash = 5381
	for (const character of clientId) {
		hash = (hash * 33 + (character.codePointAt(0) as number)) % HASH_MODULUS
	}
	return `hsl(${hash % HUE_SPAN} 55% 38%)`
}
