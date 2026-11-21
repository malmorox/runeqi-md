// Punto de entrada de Monaco sin los lenguajes extra; expone la misma API que el paquete principal
declare module "monaco-editor/esm/vs/editor/edcore.main.js" {
    export * from "monaco-editor";
}

declare module "monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution.js";
