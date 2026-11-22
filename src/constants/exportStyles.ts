// Stylesheet of the exported HTML and PDF. The preview's Tailwind classes are removed on export, so the document is
// styled by its tags plus the rq-* classes the preview components add (see documentExport). Light theme, close to
// the preview's, with print rules for the PDF.
export const EXPORT_STYLES = `
:root { color-scheme: light; }
*, *::before, *::after { box-sizing: border-box; }
body {
    margin: 0;
    background: #fff;
    color: #404040;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, sans-serif;
    font-size: 16px;
    line-height: 1.625;
    -webkit-text-size-adjust: 100%;
}
.rq-document { max-width: 56rem; margin: 0 auto; padding: 2.5rem 1.5rem; overflow-wrap: anywhere; }
.rq-document > :first-child { margin-top: 0; }

h1, h2, h3, h4, h5, h6 { color: #171717; line-height: 1.25; font-weight: 700; }
h1 { font-size: 2.25rem; margin: 2rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #d4d4d4; }
h2 { font-size: 1.875rem; margin: 1.5rem 0 0.75rem; }
h3 { font-size: 1.5rem; margin: 1.25rem 0 0.5rem; }
h4 { font-size: 1.25rem; margin: 1rem 0 0.5rem; font-weight: 600; color: #262626; }
h5 { font-size: 1.125rem; margin: 0.75rem 0 0.5rem; font-weight: 600; color: #262626; }
h6 { font-size: 1rem; margin: 0.5rem 0 0.25rem; font-weight: 600; color: #404040; }

p { margin: 1rem 0; }
a { color: #0284c7; text-decoration: none; }
a:hover { text-decoration: underline; }
strong { color: #171717; }

blockquote {
    margin: 1rem 0;
    padding: 0.5rem 1rem;
    border-left: 4px solid #0ea5e9;
    background: #f0edeb;
    color: #525252;
    font-style: italic;
}
blockquote > :first-child { margin-top: 0; }
blockquote > :last-child { margin-bottom: 0; }

ul, ol { margin: 1rem 0; padding-left: 1.75rem; }
li { margin: 0.25rem 0; }
li p { margin: 0.25rem 0; }
li ul, li ol { margin: 0.25rem 0; }
li.rq-task { list-style: none; }
li.rq-task input { margin: 0 0.5rem 0 -1.5rem; vertical-align: middle; }

code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace; font-size: 0.875em; }
:not(.rq-code) > code { padding: 0.125rem 0.375rem; border-radius: 0.25rem; background: #e5e5e5; color: #404040; }
pre { margin: 1rem 0; }
.rq-code { border: 1px solid #e5e5e5; border-radius: 0.5rem; overflow: auto; }

div:has(> table) { margin: 1rem 0; overflow-x: auto; }
table { border-collapse: collapse; }
th, td { padding: 0.5rem 1rem; border: 1px solid #d4d4d4; text-align: left; vertical-align: top; }
th { color: #171717; font-weight: 600; }
thead { background: #e5e5e5; }

img { max-width: 100%; height: auto; }
hr { margin: 2rem 0; border: 0; border-top: 1px solid #d4d4d4; }

.rq-diagram { margin: 1rem 0; overflow-x: auto; }
.rq-diagram > svg { display: block; margin: 0 auto; }
.rq-math-display { margin: 1rem 0; overflow-x: auto; overflow-y: hidden; }
.rq-math-display .katex-display { margin: 0; }

@page { margin: 18mm 16mm; }
@media print {
    body { font-size: 11pt; }
    .rq-document { max-width: none; padding: 0; }
    a { color: inherit; text-decoration: underline; }
    h1, h2, h3, h4, h5, h6 { break-after: avoid; }
    pre, blockquote, img, tr, .rq-diagram, .rq-math-display { break-inside: avoid; }
    /* On paper nothing scrolls: long code lines wrap instead of being cut off */
    .rq-code, .rq-code code { white-space: pre-wrap !important; overflow: visible !important; }
    thead { background: #f0f0f0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
`;
