import type { Components, ExtraProps } from "react-markdown";
import { findAnchorTarget } from "@utils/headingAnchors";
import PreviewImage from "@components/ui/PreviewImage";
import PreviewCodeBlock from "@components/ui/PreviewCodeBlock";
import MermaidDiagram from "@components/ui/MermaidDiagram";
import MathFormula from "@components/ui/MathFormula";

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
        <h1 data-line={sourceLine(node)}>
            {children}
        </h1>
    ),
    h2: ({ children, node }) => (
        <h2 data-line={sourceLine(node)}>
            {children}
        </h2>
    ),
    h3: ({ children, node }) => (
        <h3 data-line={sourceLine(node)}>
            {children}
        </h3>
    ),
    h4: ({ children, node }) => (
        <h4 data-line={sourceLine(node)}>
            {children}
        </h4>
    ),
    h5: ({ children, node }) => (
        <h5 data-line={sourceLine(node)}>
            {children}
        </h5>
    ),
    h6: ({ children, node }) => (
        <h6 data-line={sourceLine(node)}>
            {children}
        </h6>
    ),
    p: ({ children, node }) => (
        <p data-line={sourceLine(node)}>
            {children}
        </p>
    ),
    a: ({ href, children, id, node }) => {
        // Sin href es un ancla escrita en HTML (<a id="..."> o la antigua <a name="...">): se deja como id para poder enlazarla
        if (!href) {
            const name = node?.properties.name;
            return <a id={id ?? (typeof name === "string" ? name : undefined)}>{children}</a>;
        }

        // Enlaces internos (#seccion): llevan al encabezado dentro del preview en vez de abrir otra pestaña
        if (href?.startsWith('#')) {
            return (
                <a
                    href={href}
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
                target="_blank"
                rel="noopener noreferrer"
            >
                {children}
            </a>
        );
    },
    ul: ({ children, node }) => (
        <ul data-line={sourceLine(node)}>
            {children}
        </ul>
    ),
    ol: ({ children, node }) => (
        <ol data-line={sourceLine(node)}>
            {children}
        </ol>
    ),
    li: ({ children, node }) => {
        const isTaskItem = node?.properties?.className?.toString().includes('task-list-item');
        
        return (
            <li data-line={sourceLine(node)} data-task-item={isTaskItem || undefined}>
                <span>{children}</span>
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
                />
            );
        }
        return <input type={type} />;
    },
    blockquote: ({ children, node }) => (
        <blockquote data-line={sourceLine(node)}>
            {children}
        </blockquote>
    ),
    // Solo código inline: los bloques ``` los resuelve `pre`
    code: ({ children, className, node }) => {
        // Inline formulas ($...$) come from remark-math as code with this class
        if (className?.includes("math-inline")) {
            return <MathFormula tex={node ? getNodeText(node) : String(children)} />;
        }

        return (
            <code>
                {children}
            </code>
        );
    },
    pre: ({ children, node }) => {
        // Los bloques ``` llegan como <pre><code>. Se resuelven aquí porque desde `code` no se puede distinguir
        // un bloque sin lenguaje de un código inline: ninguno de los dos trae className.
        const codeNode = node?.children.find(
            (child): child is HastElement => child.type === "element" && child.tagName === "code"
        );
        if (!codeNode) return <pre data-line={sourceLine(node)}>{children}</pre>;

        const language = LANGUAGE_CLASS.exec(String(codeNode.properties.className ?? ""))?.[1];
        // Solo se quita el salto de línea final que añade el parser, para conservar la sangría de la primera línea
        const content = getNodeText(codeNode).replace(/\n$/, "");
        if (!content.trim()) return null;

        // Mermaid blocks are drawn as diagrams instead of shown as code
        if (language === "mermaid") {
            return (
                <div data-line={sourceLine(node)} className="preview-block">
                    <MermaidDiagram code={content} line={sourceLine(node)} />
                </div>
            );
        }

        // Formula blocks: $$ ... $$ (remark-math) and ```math, the way GitHub draws them
        if (language === "math") {
            return (
                <div data-line={sourceLine(node)} className="preview-block">
                    <MathFormula tex={content} display />
                </div>
            );
        }

        return (
            <pre data-line={sourceLine(node)}>
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
                <div data-line={sourceLine(node)} className="table-scroll">
                    <table {...props} data-html-width>{children}</table>
                </div>
            );
        }
        
        return (
            <div data-line={sourceLine(node)} className="table-scroll">
                <table>
                    {children}
                </table>
            </div>
        );
    },
    thead: ({ children }) => (
        <thead>
            {children}
        </thead>
    ),
    tbody: ({ children }) => (
        <tbody>
            {children}
        </tbody>
    ),
    tr: ({ children, node }) => (
        <tr data-line={sourceLine(node)}>
            {children}
        </tr>
    ),
    th: ({ children }) => (
        <th>
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td>
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
        <hr data-line={sourceLine(node)} />
    ),
    strong: ({ children }) => (
        <strong>
            {children}
        </strong>
    ),
    em: ({ children }) => (
        <em>
            {children}
        </em>
    ),
};