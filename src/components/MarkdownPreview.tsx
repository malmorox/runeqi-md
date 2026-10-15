import { memo, useDeferredValue, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import { useMarkdown } from "@hooks/useMarkdown";
import { useTheme } from "@hooks/useTheme";
import { useSettings } from "@hooks/useSettings";
import { useScrollSync } from "@hooks/useScrollSync";
import { markdownComponentsDark, markdownComponentsLight } from "@constants/markdownComponents";
import { splitMarkdownChunks } from "@utils/markdownChunks";

// Un trozo solo se vuelve a parsear y renderizar si cambia su texto, los plugins o el tema
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
    const isDark = theme === "vs-dark";
    // Dependiendo si es claro u oscuro los componentes de salida del markdown seran de un color u otro, que se lo pasamos a la libreria que interpreta.
    // Son mapas precalculados: mantienen la referencia entre renders, que es lo que compara el memo de cada trozo.
    const components = isDark ? markdownComponentsDark : markdownComponentsLight;

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
        <div ref={registerPreview} className={`w-full h-full overflow-auto ${
            isDark ? "bg-[#2d2d30]" : "bg-[#f3f3f3]"
        }`}>
            {/* El primer encabezado del documento no lleva margen superior */}
            <div data-markdown-root className="p-6 max-w-4xl mx-auto wrap-break-word overflow-wrap-anywhere [&>:first-child>:first-child:is(h1,h2,h3,h4,h5,h6)]:mt-0">
                {chunks.map((chunk) => (
                    // `contents`: el envoltorio no genera caja, así que el layout es el mismo que sin trocear
                    <div key={chunk.key} className="contents" data-chunk-line={chunk.line}>
                        <MarkdownChunk
                            remarkPlugins={remarkPlugins}
                            rehypePlugins={rehypePlugins}
                            components={components}
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
