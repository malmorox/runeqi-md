import type { Components, ExtraProps } from "react-markdown";
import { findAnchorTarget } from "@utils/headingAnchors";
import PreviewImage from "@components/ui/PreviewImage";
import PreviewCodeBlock from "@components/ui/PreviewCodeBlock";

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

// A single set of components for both themes: the dark colors come from `dark:` classes, active inside the
// preview's `dark` container. With one set per theme, switching themes swapped every component, so React rebuilt
// the whole preview (and images went blank while they were loaded again).
export const markdownComponents: Components = {
    h1: ({ children, node }) => (
        <h1 data-line={sourceLine(node)} className="text-4xl font-bold mb-4 border-b pb-2 mt-8 text-neutral-900 border-neutral-300 dark:text-white dark:border-neutral-700">
            {children}
        </h1>
    ),
    h2: ({ children, node }) => (
        <h2 data-line={sourceLine(node)} className="text-3xl font-bold mb-3 mt-6 text-neutral-900 dark:text-white">
            {children}
        </h2>
    ),
    h3: ({ children, node }) => (
        <h3 data-line={sourceLine(node)} className="text-2xl font-bold mb-2 mt-5 text-neutral-900 dark:text-white">
            {children}
        </h3>
    ),
    h4: ({ children, node }) => (
        <h4 data-line={sourceLine(node)} className="text-xl font-semibold mb-2 mt-4 text-neutral-800 dark:text-neutral-200">
            {children}
        </h4>
    ),
    h5: ({ children, node }) => (
        <h5 data-line={sourceLine(node)} className="text-lg font-semibold mb-2 mt-3 text-neutral-800 dark:text-neutral-200">
            {children}
        </h5>
    ),
    h6: ({ children, node }) => (
        <h6 data-line={sourceLine(node)} className="text-base font-semibold mb-1 mt-2 text-neutral-700 dark:text-neutral-300">
            {children}
        </h6>
    ),
    p: ({ children, node }) => (
        <p data-line={sourceLine(node)} className="my-4 leading-relaxed text-neutral-700 dark:text-neutral-200">
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
        <ul data-line={sourceLine(node)} className="list-disc list-inside my-4 space-y-2 text-neutral-700 dark:text-neutral-200">
            {children}
        </ul>
    ),
    ol: ({ children, node }) => (
        <ol data-line={sourceLine(node)} className="list-decimal list-inside my-4 space-y-2 text-neutral-700 dark:text-neutral-200">
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
        <blockquote data-line={sourceLine(node)} className="border-l-4 border-sky-500 pl-4 my-4 italic py-2 text-neutral-600 bg-[#F0EDEB] dark:text-neutral-300 dark:bg-neutral-800/50">
            {children}
        </blockquote>
    ),
    // Solo código inline: los bloques ``` los resuelve `pre`
    code: ({ children }) => (
        <code className="px-1.5 py-0.5 rounded text-sm font-mono bg-neutral-200 text-neutral-700 dark:bg-[#545459] dark:text-white">
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
                <PreviewCodeBlock language={language} content={content} />
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
                <table className="border border-neutral-300 dark:border-neutral-700">
                    {children}
                </table>
            </div>
        );
    },
    thead: ({ children }) => (
        <thead className="bg-neutral-200 dark:bg-[#353538]">
            {children}
        </thead>
    ),
    tbody: ({ children }) => (
        <tbody className="divide-y divide-neutral-300 dark:divide-neutral-700">
            {children}
        </tbody>
    ),
    tr: ({ children, node }) => (
        <tr data-line={sourceLine(node)} className="border-b border-neutral-300 dark:border-neutral-700">
            {children}
        </tr>
    ),
    th: ({ children }) => (
        <th className="px-4 py-2 text-left font-semibold border text-neutral-900 border-neutral-300 dark:text-neutral-200 dark:border-neutral-700">
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className="px-4 py-2 border text-neutral-700 border-neutral-300 dark:text-neutral-300 dark:border-neutral-700">
            {children}
        </td>
    ),
    img: ({ src, alt }) => (
        <PreviewImage
            src={typeof src === "string" ? src : undefined}
            alt={alt}
        />
    ),
    hr: ({ node }) => (
        <hr data-line={sourceLine(node)} className="my-8 border-neutral-300 dark:border-neutral-700" />
    ),
    strong: ({ children }) => (
        <strong className="font-bold text-neutral-900 dark:text-white">
            {children}
        </strong>
    ),
    em: ({ children }) => (
        <em className="italic text-neutral-700 dark:text-neutral-200">
            {children}
        </em>
    ),
};