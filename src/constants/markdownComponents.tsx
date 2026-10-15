import type { Components, ExtraProps } from "react-markdown";
import type { MonacoTheme } from "@/types/monaco";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { findAnchorTarget } from "@utils/headingAnchors";

type HastElement = NonNullable<ExtraProps["node"]>;
type HastChild = HastElement["children"][number];

const LANGUAGE_CLASS = /language-(\w+)/;

// Texto plano de un nodo (un bloque con HTML embebido puede traer elementos anidados)
const getNodeText = (node: HastChild): string => {
    if (node.type === "text") return node.value;
    return "children" in node ? node.children.map(getNodeText).join("") : "";
};

// Línea donde empieza el bloque, relativa al trozo del preview en el que se renderiza (`data-chunk-line`).
// La sincronización de scroll la usa como ancla.
const sourceLine = (node?: HastElement) => node?.position?.start.line;

export const getMarkdownComponents = (theme: MonacoTheme): Components => {
    const isDark = theme === "vs-dark";
    
    return {
        h1: ({ children, node }) => (
            <h1 data-line={sourceLine(node)} className={`text-4xl font-bold mb-4 border-b pb-2 mt-8 ${
                isDark 
                    ? "text-white border-neutral-700" 
                    : "text-neutral-900 border-neutral-300"
            }`}>
                {children}
            </h1>
        ),
        h2: ({ children, node }) => (
            <h2 data-line={sourceLine(node)} className={`text-3xl font-bold mb-3 mt-6 ${
                isDark ? "text-white" : "text-neutral-900"
            }`}>
                {children}
            </h2>
        ),
        h3: ({ children, node }) => (
            <h3 data-line={sourceLine(node)} className={`text-2xl font-bold mb-2 mt-5 ${
                isDark ? "text-white" : "text-neutral-900"
            }`}>
                {children}
            </h3>
        ),
        h4: ({ children, node }) => (
            <h4 data-line={sourceLine(node)} className={`text-xl font-semibold mb-2 mt-4 ${
                isDark ? "text-neutral-200" : "text-neutral-800"
            }`}>
                {children}
            </h4>
        ),
        h5: ({ children, node }) => (
            <h5 data-line={sourceLine(node)} className={`text-lg font-semibold mb-2 mt-3 ${
                isDark ? "text-neutral-200" : "text-neutral-800"
            }`}>
                {children}
            </h5>
        ),
        h6: ({ children, node }) => (
            <h6 data-line={sourceLine(node)} className={`text-base font-semibold mb-1 mt-2 ${
                isDark ? "text-neutral-300" : "text-neutral-700"
            }`}>
                {children}
            </h6>
        ),
        p: ({ children, node }) => (
            <p data-line={sourceLine(node)} className={`my-4 leading-relaxed ${
                isDark ? "text-neutral-200" : "text-neutral-700"
            }`}>
                {children}
            </p>
        ),
        a: ({ href, children, id, node }) => {
            // Sin href es un ancla escrita en HTML (<a id="..."> o la antigua <a name="...">): se deja como id para poder enlazarla
            if (!href) {
                const name = node?.properties.name;
                return <a id={id ?? (typeof name === "string" ? name : undefined)}>{children}</a>;
            }

            const className = "text-sky-500 hover:text-sky-600 hover:underline transition-colors";

            // Enlaces internos (#seccion): llevan al encabezado dentro del preview en vez de abrir otra pestaña
            if (href?.startsWith('#')) {
                return (
                    <a
                        href={href}
                        className={className}
                        onClick={(event) => {
                            event.preventDefault();
                            const root = event.currentTarget.closest<HTMLElement>("[data-markdown-root]");
                            const target = root && findAnchorTarget(root, href.slice(1));
                            const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                            target?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
                        }}
                    >
                        {children}
                    </a>
                );
            }

            const url = href && !href.startsWith('http') && !href.startsWith('mailto')
                ? `https://${href}`
                : href;

            return (
                <a
                    href={url}
                    className={className}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {children}
                </a>
            );
        },
        ul: ({ children, node }) => (
            <ul data-line={sourceLine(node)} className={`list-disc list-inside my-4 space-y-2 ${
                isDark ? "text-neutral-200" : "text-neutral-700"
            }`}>
                {children}
            </ul>
        ),
        ol: ({ children, node }) => (
            <ol data-line={sourceLine(node)} className={`list-decimal list-inside my-4 space-y-2 ${
                isDark ? "text-neutral-200" : "text-neutral-700"
            }`}>
                {children}
            </ol>
        ),
        li: ({ children, node }) => {
            const isTaskItem = node?.properties?.className?.toString().includes('task-list-item');
            
            return (
                <li data-line={sourceLine(node)} className={`ml-4 ${isTaskItem ? 'list-none flex items-center gap-2' : ''}`}>
                    <span className="[&>p]:my-0 [&>p]:inline">{children}</span>
                </li>
            );
        },
        input: ({ type, checked }) => {
            if (type === 'checkbox') {
                return (
                    <input
                        type="checkbox"
                        checked={checked}
                        readOnly
                        className="mr-2 accent-sky-500"
                    />
                );
            }
            return <input type={type} />;
        },
        blockquote: ({ children, node }) => (
            <blockquote data-line={sourceLine(node)} className={`border-l-4 border-sky-500 pl-4 my-4 italic py-2 ${
                isDark 
                    ? "text-neutral-300 bg-neutral-800/50" 
                    : "text-neutral-600 bg-[#F0EDEB]"
            }`}>
                {children}
            </blockquote>
        ),
        // Solo código inline: los bloques ``` los resuelve `pre`
        code: ({ children }) => (
            <code className={`px-1.5 py-0.5 rounded text-sm font-mono ${
                isDark
                    ? "bg-[#545459] text-white"
                    : "bg-neutral-200 text-neutral-700"
            }`}>
                {children}
            </code>
        ),
        pre: ({ children, node }) => {
            // Los bloques ``` llegan como <pre><code>. Se resuelven aquí porque desde `code` no se puede distinguir
            // un bloque sin lenguaje de un código inline: ninguno de los dos trae className.
            const codeNode = node?.children.find(
                (child): child is HastElement => child.type === "element" && child.tagName === "code"
            );
            if (!codeNode) return <pre data-line={sourceLine(node)} className="my-4">{children}</pre>;

            const language = LANGUAGE_CLASS.exec(String(codeNode.properties.className ?? ""))?.[1];
            // Solo se quita el salto de línea final que añade el parser, para conservar la sangría de la primera línea
            const content = getNodeText(codeNode).replace(/\n$/, "");
            if (!content.trim()) return null;

            return (
                <pre data-line={sourceLine(node)} className="my-4">
                    <SyntaxHighlighter
                        style={isDark ? vscDarkPlus : prism}
                        language={language || 'plaintext'}
                        PreTag="div"
                        className="my-4 rounded-lg overflow-hidden"
                        customStyle={{
                            margin: 0,
                            padding: '1rem',
                            fontSize: '0.875rem',
                            backgroundColor: isDark ? '#3C3C40' : 'white'
                        }}
                    >
                        {content}
                    </SyntaxHighlighter>
                </pre>
            );
        },
        table: ({ children, node, ...props }) => {
            // Si la tabla tiene atributo style, es HTML inline
            const style = (node?.properties?.style as string) || '';
            const hasInlineStyle = style.includes('width');
            
            if (hasInlineStyle) {
                return (
                    <div data-line={sourceLine(node)} className="overflow-x-auto my-4">
                        <table {...props}>{children}</table>
                    </div>
                );
            }
            
            return (
                <div data-line={sourceLine(node)} className="overflow-x-auto my-4">
                    <table className={`border ${
                        isDark ? "border-neutral-700" : "border-neutral-300"
                    }`}>
                        {children}
                    </table>
                </div>
            );
        },
        thead: ({ children }) => (
            <thead className={isDark ? "bg-[#353538]" : "bg-neutral-200"}>
                {children}
            </thead>
        ),
        tbody: ({ children }) => (
            <tbody className={`divide-y ${
                isDark ? "divide-neutral-700" : "divide-neutral-300"
            }`}>
                {children}
            </tbody>
        ),
        tr: ({ children, node }) => (
            <tr data-line={sourceLine(node)} className={`border-b ${
                isDark ? "border-neutral-700" : "border-neutral-300"
            }`}>
                {children}
            </tr>
        ),
        th: ({ children }) => (
            <th className={`px-4 py-2 text-left font-semibold border ${
                isDark 
                    ? "text-neutral-200 border-neutral-700" 
                    : "text-neutral-900 border-neutral-300"
            }`}>
                {children}
            </th>
        ),
        td: ({ children }) => (
            <td className={`px-4 py-2 border ${
                isDark 
                    ? "text-neutral-300 border-neutral-700" 
                    : "text-neutral-700 border-neutral-300"
            }`}>
                {children}
            </td>
        ),
        img: ({ src, alt }) => (
            <img
                src={src}
                alt={alt}
                className="my-4 max-w-full inline-block"
            />
        ),
        hr: ({ node }) => (
            <hr data-line={sourceLine(node)} className={`my-8 ${
                isDark ? "border-neutral-700" : "border-neutral-300"
            }`} />
        ),
        strong: ({ children }) => (
            <strong className={`font-bold ${
                isDark ? "text-white" : "text-neutral-900"
            }`}>
                {children}
            </strong>
        ),
        em: ({ children }) => (
            <em className={`italic ${
                isDark ? "text-neutral-200" : "text-neutral-700"
            }`}>
                {children}
            </em>
        ),
    };
};

// Para usar con tema fijo
export const markdownComponentsDark = getMarkdownComponents("vs-dark");
export const markdownComponentsLight = getMarkdownComponents("light");