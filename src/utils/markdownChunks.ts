// Trozo del documento que el preview renderiza (y memoiza) por separado
export type MarkdownChunk = {
    // Estable mientras el texto del trozo no cambie: React reutiliza los trozos que no se han editado
    key: string;
    // Línea (1-based) del documento donde empieza el trozo
    line: number;
    source: string;
};

const BLANK = /^\s*$/;
const FENCE = /^\s*(`{3,}|~{3,})/;
const INDENTED = /^[ \t]/;
const LIST_ITEM = /^ {0,3}([-*+]|\d{1,9}[.)])(\s|$)/;
const INLINE_CODE = /`+[^`]*`+/g;
// Solo cuenta como etiqueta si al nombre le sigue espacio, `/` o `>` (descarta autolinks como <https://...>)
const HTML_TAG = /<(\/?)([a-zA-Z][\w-]*)(?=[\s/>])[^>]*?(\/?)>/g;
// Las definiciones de referencias y notas al pie afectan a todo el documento: con ellas no se trocea
const DEFINITION = /^ {0,3}\[[^\]\n]+\]:/m;
const VOID_TAGS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);

type HtmlState = { inComment: boolean; depth: number };

// Sigue los comentarios y etiquetas HTML abiertos, que pueden abarcar líneas en blanco
function scanHtml(line: string, state: HtmlState) {
    let text = line;
    if (state.inComment) {
        const close = text.indexOf("-->");
        if (close === -1) return;
        state.inComment = false;
        text = text.slice(close + 3);
    }
    if (!text.includes("<")) return;

    text = text.replace(INLINE_CODE, "");
    let open = text.indexOf("<!--");
    while (open !== -1) {
        const close = text.indexOf("-->", open + 4);
        if (close === -1) {
            state.inComment = true;
            text = text.slice(0, open);
            break;
        }
        text = text.slice(0, open) + text.slice(close + 3);
        open = text.indexOf("<!--");
    }

    for (const [, closing, tag, selfClosing] of text.matchAll(HTML_TAG)) {
        if (selfClosing || VOID_TAGS.has(tag.toLowerCase())) continue;
        state.depth = Math.max(0, state.depth + (closing ? -1 : 1));
    }
}

// FNV-1a: clave corta para identificar el texto de cada trozo
function hashString(text: string) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(36);
}

// Parte el documento en bloques que se pueden renderizar por separado sin cambiar el resultado.
// Solo se corta en líneas en blanco y, ante la duda, no se corta: unir trozos siempre es seguro.
export function splitMarkdownChunks(markdown: string): MarkdownChunk[] {
    if (DEFINITION.test(markdown)) return [{ key: hashString(markdown), line: 1, source: markdown }];

    const lines = markdown.split("\n");
    const ranges: { start: number; end: number }[] = [];
    let start = -1;
    let end = -1;
    let fence: string | null = null;
    let hasList = false;
    const html: HtmlState = { inComment: false, depth: 0 };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!fence && BLANK.test(line)) continue;

        const afterBlank = start !== -1 && end < i - 1;
        // No se corta dentro de código, comentarios o HTML abierto, ni ante una línea sangrada
        // (continuación de lista o código indentado) o un nuevo elemento de la misma lista
        const canSplit = afterBlank && !fence && !html.inComment && html.depth === 0
            && !INDENTED.test(line) && !(hasList && LIST_ITEM.test(line));

        if (start === -1) {
            start = i;
        } else if (canSplit) {
            ranges.push({ start, end });
            start = i;
            hasList = false;
        }
        end = i;

        if (fence) {
            const match = FENCE.exec(line);
            const closes = match && match[1][0] === fence[0] && match[1].length >= fence.length && BLANK.test(line.slice(line.indexOf(match[1]) + match[1].length));
            if (closes) fence = null;
            continue;
        }

        const opening = FENCE.exec(line);
        if (opening) {
            fence = opening[1];
            continue;
        }
        if (LIST_ITEM.test(line)) hasList = true;
        scanHtml(line, html);
    }
    if (start !== -1) ranges.push({ start, end });

    const seen = new Map<string, number>();
    return ranges.map(({ start, end }) => {
        const source = lines.slice(start, end + 1).join("\n");
        const hash = hashString(source);
        // Trozos idénticos (p. ej. dos separadores) se distinguen por su orden de aparición
        const occurrence = seen.get(hash) ?? 0;
        seen.set(hash, occurrence + 1);
        return { key: `${hash}-${occurrence}`, line: start + 1, source };
    });
}
