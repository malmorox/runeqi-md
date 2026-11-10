import { use, useEffect, useRef, useState } from 'react';
import { useTheme } from '@hooks/useTheme';
import { ChunkLineContext } from '@contexts/ChunkLineContext';
import { diagramErrorMessage, getCachedDiagram, renderDiagram } from '@utils/mermaid';
import PreviewCodeBlock from '@components/ui/PreviewCodeBlock';

interface MermaidDiagramProps {
    code: string;
    // Line where the diagram's block starts, relative to its preview chunk
    line?: number;
}

// An error only shows once the code stays invalid for a moment, so it doesn't flash while typing
const ERROR_DELAY_MS = 600;

// Last valid code of the diagram at each line of the document. Editing a diagram changes its chunk's key, so every
// edit mounts a new MermaidDiagram: it starts from the previous drawing instead of an empty block while its own one is
// rendered, and keeps it while the code isn't valid
const lastValidCodeAtLine = new Map<number, string>();

// First line of the code, the diagram type (e.g. `classDiagram`): a different diagram written later on the same line
// doesn't start from the old one's drawing
const diagramHeader = (code: string) => code.trimStart().split('\n', 1)[0].trim();

// ```mermaid block of the preview, drawn as a diagram (class, sequence, state, ER, flowchart...)
const MermaidDiagram = ({ code, line }: MermaidDiagramProps) => {
    const { theme } = useTheme();
    const chunkLine = use(ChunkLineContext);
    const documentLine = chunkLine !== null && line !== undefined ? chunkLine + line - 1 : null;

    // Code of the drawing to start with: this one if it's already drawn, or the previous version of the diagram
    const [initialCode] = useState(() => {
        if (getCachedDiagram(code, theme)) return code;
        const previous = documentLine !== null ? lastValidCodeAtLine.get(documentLine) : undefined;
        return previous !== undefined && diagramHeader(previous) === diagramHeader(code) ? previous : null;
    });
    // The drawing shown is always of valid code: while the code isn't valid, it's this one drawn with the current theme
    const lastValidCode = useRef(initialCode);
    const [svg, setSvg] = useState(() => (initialCode !== null ? getCachedDiagram(initialCode, theme) ?? null : null));
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        let errorTimer: number | undefined;

        renderDiagram(code, theme, controller.signal).then(
            (rendered) => {
                if (controller.signal.aborted) return;
                lastValidCode.current = code;
                if (documentLine !== null) lastValidCodeAtLine.set(documentLine, code);
                setSvg(rendered);
                setError(null);
            },
            (reason) => {
                if (controller.signal.aborted) return;
                errorTimer = window.setTimeout(() => setError(diagramErrorMessage(reason)), ERROR_DELAY_MS);

                // Draws the last valid code again, in case the theme changed since its drawing (usually it's cached)
                const previous = lastValidCode.current;
                if (previous === null || previous === code) return;
                renderDiagram(previous, theme, controller.signal).then(
                    (rendered) => { if (!controller.signal.aborted) setSvg(rendered); },
                    () => {},
                );
            },
        );

        return () => {
            controller.abort();
            window.clearTimeout(errorTimer);
        };
    }, [code, theme, documentLine]);

    return (
        <>
            {svg ? (
                // Mermaid's SVG, sanitized (securityLevel 'strict'). Straight on the preview's background: it's a
                // drawing, not code, so it doesn't get the code blocks' card
                <div
                    className="overflow-x-auto [&>svg]:block [&>svg]:mx-auto"
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
            ) : (
                // Until the first drawing is ready, or while the code has never been valid, the code itself
                <PreviewCodeBlock language="mermaid" content={code} />
            )}
            {error && (
                <div className="mt-2 rounded border px-3 py-2 text-sm border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                    <p className="font-semibold">Diagram error</p>
                    {/* Mermaid's context lines are short and keep their ^ marker aligned: only the long "Expecting..." one wraps */}
                    <pre className="mt-1 font-mono text-xs whitespace-pre-wrap wrap-break-word">{error}</pre>
                </div>
            )}
        </>
    );
};

export default MermaidDiagram;
