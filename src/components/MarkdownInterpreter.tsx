import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import { useMarkdown } from "@hooks/useMarkdown";
import { useTheme } from "@hooks/useTheme";
import { useSettings } from "@hooks/useSettings";
import { getMarkdownComponents } from "@constants/markdownComponents";

// Interprete del código Markdown que viene del contexto (lo captura del editor). Muestra por pantalla la salida final con el tema seleccionado.
const MarkdownInterpreter = () => {
    const { markdown } = useMarkdown();
    const { theme } = useTheme();
    const { settings } = useSettings();
    // Dependiendo si es claro u oscuro los componentes de salida del markdown seran de un color u otro, que se lo pasamos a la libreria que interpreta.
    const components = getMarkdownComponents(theme)
    const isDark = theme === "vs-dark";


    const remarkPlugins = [
        ...(settings.interpreter.gfm ? [remarkGfm] : []),
        ...(settings.interpreter.breaks ? [remarkBreaks] : []),
    ];
    
    const rehypePlugins = settings.interpreter.allowHtml ? [rehypeRaw] : [];

    return (
        <div className={`w-full h-full overflow-auto ${
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

export default MarkdownInterpreter