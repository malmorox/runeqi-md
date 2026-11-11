import { useEffect, useState } from 'react';
import { useSettings } from '@hooks/useSettings';
import { getLoadedKatex, loadKatex, renderFormula } from '@utils/math';
import PreviewCodeBlock from '@components/ui/PreviewCodeBlock';

interface MathFormulaProps {
    tex: string;
    // A $$ (or ```math) block on its own lines, instead of a $...$ formula inside the text
    display?: boolean;
}

// Invalid TeX: KaTeX colors it inline with a red that's too dark on the dark theme
const ERROR_CLASSES = '[&_.katex-error]:text-red-700! dark:[&_.katex-error]:text-red-400!';

// Formula of the preview, drawn with KaTeX. Once KaTeX is loaded it's drawn while rendering, so editing a formula never
// goes through an empty or loading state
const MathFormula = ({ tex, display = false }: MathFormulaProps) => {
    const { settings } = useSettings();
    const [katex, setKatex] = useState(getLoadedKatex);

    useEffect(() => {
        if (katex) return;
        let active = true;
        loadKatex().then(
            (loaded) => { if (active) setKatex(loaded); },
            // Without KaTeX (e.g. offline) the formula stays as its source
            () => {},
        );
        return () => { active = false; };
    }, [katex]);

    // With math turned off only ```math blocks get here ($ formulas aren't parsed): they're shown as code
    if (!settings.previewer.math) return <PreviewCodeBlock language="latex" content={tex} />;

    if (!katex) {
        // Until KaTeX is loaded, the TeX source
        return display
            ? <pre className="font-mono text-sm text-center text-neutral-600 dark:text-neutral-300">{tex}</pre>
            : <code className="font-mono text-sm text-neutral-600 dark:text-neutral-300">{tex}</code>;
    }

    // KaTeX's HTML (with MathML for screen readers), escaped by KaTeX
    const html = { __html: renderFormula(katex, tex, display) };

    return display ? (
        // Long formulas scroll sideways instead of overflowing the preview. Outside a paragraph nothing gives them a text
        // color, so they take the paragraphs' one (KaTeX draws with the current color)
        <div
            className={`overflow-x-auto overflow-y-hidden text-neutral-700 dark:text-neutral-200 [&_.katex-display]:m-0 ${ERROR_CLASSES}`}
            dangerouslySetInnerHTML={html}
        />
    ) : (
        <span className={ERROR_CLASSES} dangerouslySetInnerHTML={html} />
    );
};

export default MathFormula;
