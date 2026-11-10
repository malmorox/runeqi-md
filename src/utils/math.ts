type Katex = typeof import('katex').default;

// KaTeX and its stylesheet (with the fonts) are only downloaded the first time the preview shows a formula
let katex: Katex | null = null;
let katexLoad: Promise<Katex> | null = null;

// KaTeX once it's loaded: from then on formulas are drawn while rendering, without waiting
export const getLoadedKatex = () => katex;

export const loadKatex = () => {
    katexLoad ??= Promise.all([import('katex'), import('katex/dist/katex.min.css')]).then(
        ([module]) => (katex = module.default),
        (error) => {
            // A failed download (e.g. offline) is tried again with the next formula
            katexLoad = null;
            throw error;
        },
    );
    return katexLoad;
};

// HTML of a formula. Invalid TeX comes back as its source in red, with the error as tooltip, instead of throwing: a
// formula being typed shows what's wrong
export const renderFormula = (loaded: Katex, tex: string, display: boolean) =>
    loaded.renderToString(tex, {
        displayMode: display,
        throwOnError: false,
        // Non-standard LaTeX (e.g. Unicode letters in a formula) is drawn without console warnings
        strict: false,
        // `trust` stays off: \href, \url and the \html... commands can't add links or HTML to the preview
    });
