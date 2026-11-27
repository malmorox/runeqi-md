import { useEffect, useState } from 'react';
import { useSettings } from '@hooks/useSettings';
import { getLoadedKatex, loadKatex, renderFormula } from '@utils/math';
import PreviewCodeBlock from '@components/ui/PreviewCodeBlock';

interface MathFormulaProps {
    tex: string;
    // A $$ (or ```math) block on its own lines, instead of a $...$ formula inside the text
    display?: boolean;
}

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
            ? <pre className="formula-source-block preview-embed">{tex}</pre>
            : <code className="formula-source preview-embed">{tex}</code>;
    }

    // KaTeX's HTML (with MathML for screen readers), escaped by KaTeX
    const html = { __html: renderFormula(katex, tex, display) };

    return display ? (
        // Long formulas scroll sideways instead of overflowing the preview. Outside a paragraph nothing gives them a text
        // color, so they take the paragraphs' one (KaTeX draws with the current color)
        <div
            className="formula-block preview-embed"
            dangerouslySetInnerHTML={html}
        />
    ) : (
        <span className="formula preview-embed" dangerouslySetInnerHTML={html} />
    );
};

export default MathFormula;
