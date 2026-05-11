export function normalizeText(text: string): string {
    // Remove accents using method described in
    // https://listiak.dev/blog/removing-diacritics-in-javascript-universal-solution
    return text
        .trim() // remove leading/trailing whitespace
        .normalize("NFD") // decompose characters into base + diacritics
        .replace(/[\u0300-\u036f]/g, "") // remove diacritics
        .toLowerCase(); // convert to lowercase for case-insensitive comparison
}
