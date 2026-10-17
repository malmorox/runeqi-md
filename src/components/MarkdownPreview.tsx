import { memo, useDeferredValue, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import { useMarkdown } from "@hooks/useMarkdown";
import { useTheme } from "@hooks/useTheme";
import { useSettings } from "@hooks/useSettings";
import { useScrollSync } from "@hooks/useScrollSync";
import { markdownComponents } from "@constants/markdownComponents";
import { splitMarkdownChunks } from "@utils/markdownChunks";

// Un trozo solo se vuelve a parsear y renderizar si cambia su texto o los plugins (el tema solo cambia estilos)
const MarkdownChunk = memo(ReactMarkdown);

// Interprete del código Markdown que viene del contexto (lo captura del editor). Muestra por pantalla la salida final con el tema seleccionado.
const MarkdownPreview = () => {
    const { markdown } = useMarkdown();
    // Renderizar el preview es lo caro: va con prioridad baja para no bloquear la escritura en el editor
    const deferredMarkdown = useDeferredValue(markdown);
    const { theme } = useTheme();
    const { settings } = useSettings();
    const { registerPreview, invalidateAnchors } = useScrollSync();
    const { gfm, breaks, allowHtml } = settings.interpreter;

    const remarkPlugins = useMemo(() => [
        ...(gfm ? [remarkGfm] : []),
        ...(breaks ? [remarkBreaks] : []),
    ], [gfm, breaks]);

    const rehypePlugins = useMemo(() => allowHtml ? [rehypeRaw] : [], [allowHtml]);

    // El documento se trocea por bloques para que al editar solo se renderice el trozo que cambia
    const chunks = useMemo(() => splitMarkdownChunks(deferredMarkdown), [deferredMarkdown]);

    // Cada render del Markdown puede mover los bloques: las anclas del scroll se recalculan en el siguiente scroll
    useEffect(() => {
        invalidateAnchors();
    }, [deferredMarkdown, invalidateAnchors]);

    return (
        // The theme only toggles the `dark` class: the components are the same in both themes, so switching
        // only changes styles and the Markdown isn't rendered again (images stay loaded)
        <div ref={registerPreview} className={`w-full h-full overflow-auto bg-[#f3f3f3] dark:bg-[#2d2d30] ${
            theme === "vs-dark" ? "dark" : ""
        }`}>
            {/* El primer encabezado del documento no lleva margen superior */}
            <div data-markdown-root className="p-6 max-w-4xl mx-auto wrap-break-word overflow-wrap-anywhere [&>:first-child>:first-child:is(h1,h2,h3,h4,h5,h6)]:mt-0">
                {chunks.map((chunk) => (
                    // `contents`: el envoltorio no genera caja, así que el layout es el mismo que sin trocear
                    <div key={chunk.key} className="contents" data-chunk-line={chunk.line}>
                        <MarkdownChunk
                            remarkPlugins={remarkPlugins}
                            rehypePlugins={rehypePlugins}
                            components={markdownComponents}
                        >
                            {chunk.source}
                        </MarkdownChunk>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default MarkdownPreview
