import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import { useMarkdown } from "@hooks/useMarkdown";
import { useTheme } from "@hooks/useTheme";
import { useSettings } from "@hooks/useSettings";
import { useScrollSync } from "@hooks/useScrollSync";
import { getMarkdownComponents } from "@constants/markdownComponents";

// Interprete del código Markdown que viene del contexto (lo captura del editor). Muestra por pantalla la salida final con el tema seleccionado.
const MarkdownPreview = () => {
    const { markdown } = useMarkdown();
    const { theme } = useTheme();
    const { settings } = useSettings();
    const { setPreviewScroll, onPreviewScroll } = useScrollSync();
    // Dependiendo si es claro u oscuro los componentes de salida del markdown seran de un color u otro, que se lo pasamos a la libreria que interpreta.
    const components = getMarkdownComponents(theme)
    const isDark = theme === "vs-dark";

    const remarkPlugins = [
        ...(settings.interpreter.gfm ? [remarkGfm] : []),
        ...(settings.interpreter.breaks ? [remarkBreaks] : []),
    ];
    
    const rehypePlugins = settings.interpreter.allowHtml ? [rehypeRaw] : [];

    const previewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = previewRef.current;
        if (!el) return;

        let isSyncing = false;

        onPreviewScroll((percentage) => {
            if (!el || !settings.workspace.syncScroll) return;
            isSyncing = true;
            el.scrollTop = percentage * (el.scrollHeight - el.clientHeight);
            setTimeout(() => isSyncing = false, 50);
        });

        const handleScroll = () => {
            if (isSyncing || !settings.workspace.syncScroll) return;
            const percentage = el.scrollTop / (el.scrollHeight - el.clientHeight);
            setPreviewScroll(percentage);
        };

        el.addEventListener('scroll', handleScroll);
        return () => el.removeEventListener('scroll', handleScroll);
    }, [onPreviewScroll, setPreviewScroll, settings.workspace.syncScroll]);

    return (
        <div ref={previewRef} className={`w-full h-full overflow-auto ${
            isDark ? "bg-[#2d2d30]" : "bg-[#f3f3f3]"
        }`}>
            <div className="p-6 max-w-4xl mx-auto wrap-break-word overflow-wrap-anywhere">
                <ReactMarkdown
                    remarkPlugins={remarkPlugins}
                    rehypePlugins={rehypePlugins}
                    components={components}
                >
                    {markdown}
                </ReactMarkdown>
            </div>
        </div>
    );
}

export default MarkdownPreview