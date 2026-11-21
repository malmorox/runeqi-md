import { loader } from "@monaco-editor/react";
// Solo el núcleo del editor y el lenguaje Markdown: el paquete completo incluye decenas de lenguajes que no se usan
import * as monaco from "monaco-editor/esm/vs/editor/edcore.main.js";
import "monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution.js";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker.js?worker";

self.MonacoEnvironment = {
    getWorker: () => new EditorWorker(),
};

// Por defecto @monaco-editor/react descarga Monaco de un CDN al montar el editor, lo que retrasa su aparición
// respecto al resto de la página. Con esto se usa la copia empaquetada con la app y se carga a la vez que ella.
loader.config({ monaco });
