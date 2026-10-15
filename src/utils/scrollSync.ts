import type { editor } from "monaco-editor";

// Posición de scroll de cada panel en la que la misma línea del Markdown queda arriba del todo
export type ScrollAnchor = { editor: number; preview: number };
type Pane = keyof ScrollAnchor;

// Bloques del preview con su línea en el documento: `data-line` es relativo al trozo (`data-chunk-line`) en el que se renderizó
function* sourceLineElements(preview: HTMLElement) {
    for (const chunk of preview.querySelectorAll<HTMLElement>("[data-chunk-line]")) {
        const offset = Number(chunk.dataset.chunkLine) - 1;
        for (const element of chunk.querySelectorAll<HTMLElement>("[data-line]")) {
            yield { line: offset + Number(element.dataset.line), element };
        }
    }
}

// Construye las anclas a partir de los bloques del preview marcados con su línea de origen.
// Empieza en (0, 0) y termina en el scroll máximo de ambos, para que los dos paneles lleguen a la vez a los extremos.
export function buildScrollAnchors(codeEditor: editor.IStandaloneCodeEditor, preview: HTMLElement): ScrollAnchor[] {
    const lineCount = codeEditor.getModel()?.getLineCount() ?? 0;
    const editorMax = Math.max(0, codeEditor.getScrollHeight() - codeEditor.getLayoutInfo().height);
    const previewMax = Math.max(0, preview.scrollHeight - preview.clientHeight);
    const previewOrigin = preview.getBoundingClientRect().top - preview.scrollTop;

    const anchors: ScrollAnchor[] = [{ editor: 0, preview: 0 }];
    // Solo lecturas de layout dentro del bucle (sin escrituras intercaladas) para no forzar reflows
    for (const { line, element } of sourceLineElements(preview)) {
        // El preview puede ir un render por detrás del editor: las líneas que ya no existen se descartan
        if (line > lineCount) break;

        const anchor = {
            editor: codeEditor.getTopForLineNumber(line),
            preview: element.getBoundingClientRect().top - previewOrigin,
        };
        const last = anchors[anchors.length - 1];
        // Las anclas tienen que crecer en ambos paneles y ser alcanzables con el scroll
        if (anchor.editor > last.editor && anchor.preview > last.preview && anchor.editor < editorMax && anchor.preview < previewMax) {
            anchors.push(anchor);
        }
    }

    anchors.push({ editor: editorMax, preview: previewMax });
    return anchors;
}

// Traduce el scroll de un panel al del otro interpolando linealmente entre las dos anclas que lo rodean
export function mapScroll(anchors: ScrollAnchor[], value: number, from: Pane, to: Pane): number {
    let next = 1;
    while (next < anchors.length - 1 && anchors[next][from] < value) next++;

    const start = anchors[next - 1];
    const end = anchors[next];
    const span = end[from] - start[from];
    const progress = span > 0 ? Math.min(1, Math.max(0, (value - start[from]) / span)) : 0;
    return start[to] + progress * (end[to] - start[to]);
}
