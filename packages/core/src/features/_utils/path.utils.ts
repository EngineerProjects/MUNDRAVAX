const ILLEGAL_CHARACTERS = /[<>:"/\\|?*]/g;

const RESERVED_NAMES = new Set([
	"con", "prn", "aux", "nul",
	"com1", "com2", "com3", "com4", "com5", "com6", "com7", "com8", "com9",
	"lpt1", "lpt2", "lpt3", "lpt4", "lpt5", "lpt6", "lpt7", "lpt8", "lpt9",
]);

function isReservedName(name: string): boolean {
	const baseName = name.split(".")[0].toLowerCase();
	return RESERVED_NAMES.has(baseName);
}

function hasControlCharacter(name: string): boolean {
	for (let index = 0; index < name.length; index++) {
		if (name.charCodeAt(index) < 0x20)
			return true;
	}
	return false;
}

/**
 * Returns whether `name` can be used as-is as a single file/folder name
 * component on disk (no directory separators, no Windows-illegal characters,
 * not a reserved device name, no trailing dot/space). Used to reject invalid
 * names at creation time - see {@link sanitizePathSegment} for turning an
 * already-accepted (possibly older, pre-validation) name into a safe one.
 */
export function isValidName(name: string): boolean {
	if (name.length === 0 || name === "." || name === "..")
		return false;

	if (ILLEGAL_CHARACTERS.test(name) || hasControlCharacter(name))
		return false;

	if (/[ .]$/.test(name))
		return false;

	return !isReservedName(name);
}

/**
 * Turns any string into a value that's always safe to use as a single
 * filesystem path component - unlike {@link isValidName}, this never fails,
 * it transforms. Used when computing an on-disk path for a virtual file,
 * including ones created before name validation existed.
 */
export function sanitizePathSegment(name: string): string {
	let result = "";
	for (let index = 0; index < name.length; index++) {
		const character = name[index];
		result += name.charCodeAt(index) < 0x20 ? "_" : character;
	}

	result = result.replace(ILLEGAL_CHARACTERS, "_").replace(/[ .]+$/, "");

	if (isReservedName(result))
		result = `_${result}`;

	if (result.length === 0 || result === "." || result === "..")
		result = "_";

	return result;
}
