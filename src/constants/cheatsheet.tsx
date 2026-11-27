import type { CheatsheetRequirement, CheatsheetSection } from '@/types/cheatsheet';
import { Line, Marker } from '@components/sidebar/CheatsheetLine';
import { imageAlt, imageMarkdown, imageMarkdownPath } from '@utils/imagePaths';

const LOCAL_IMAGE = 'photo.png';

// Only syntax the preview really draws: anything listed here has to look right there too.
// The lines are drawn by hand: the preview components carry the preview's sizes, margins and scroll sync
export const CHEATSHEET: CheatsheetSection[] = [
    {
        id: 'headings',
        title: 'Headings',
        entries: [
            {
                label: 'Heading 1',
                syntax: '# Heading 1',
                // Paragraphs, not headings: they'd become part of the sidebar's outline
                line: <p className="cheatsheet-h1"><Marker># </Marker>Heading 1</p>,
            },
            {
                label: 'Heading 2',
                syntax: '## Heading 2',
                line: <p className="cheatsheet-h2"><Marker>## </Marker>Heading 2</p>,
            },
            {
                label: 'Heading 3',
                syntax: '### Heading 3',
                line: <p className="cheatsheet-h3"><Marker>### </Marker>Heading 3</p>,
            },
        ],
    },
    {
        id: 'styling',
        title: 'Styling',
        entries: [
            {
                label: 'Italic',
                syntax: '*italic text*',
                line: (
                    <>
                        <Marker>*</Marker><em>italic text</em><Marker>*</Marker>{' '}
                        <Marker>_</Marker><em>italic text</em><Marker>_</Marker>
                    </>
                ),
            },
            {
                label: 'Bold',
                syntax: '**bold text**',
                line: (
                    <>
                        <Marker>**</Marker><strong>bold text</strong><Marker>**</Marker>{' '}
                        <Marker>__</Marker><strong>bold text</strong><Marker>__</Marker>
                    </>
                ),
            },
            {
                label: 'Bold italic',
                syntax: '***bold italic***',
                line: <><Marker>***</Marker><strong><em>bold italic</em></strong><Marker>***</Marker></>,
            },
            {
                label: 'Strikethrough',
                syntax: '~~struck text~~',
                requires: 'gfm',
                line: <><Marker>~~</Marker><del>struck text</del><Marker>~~</Marker></>,
            },
            {
                label: 'Inline code',
                syntax: '`inline code`',
                line: <><Marker>`</Marker><code className="cheatsheet-code">inline code</code><Marker>`</Marker></>,
            },
            {
                label: 'Escaped symbol',
                syntax: '\\*not italic\\*',
                line: <><Marker>\</Marker>*not italic<Marker>\</Marker>*</>,
            },
            {
                label: 'Line break',
                syntax: 'First line\\\nSecond line',
                line: (
                    <>
                        <Line>First line<Marker>\</Marker></Line>
                        <Line>Second line</Line>
                    </>
                ),
            },
        ],
    },
    {
        id: 'lists',
        title: 'Lists',
        entries: [
            {
                label: 'Unordered list',
                syntax: '- Item\n- Item\n  - Nested item',
                line: (
                    <>
                        <Line><Marker>- </Marker>Item</Line>
                        <Line><Marker>- </Marker>Item</Line>
                        <Line className="cheatsheet-indent"><Marker>- </Marker>Nested item</Line>
                    </>
                ),
            },
            {
                label: 'Ordered list',
                syntax: '1. First\n2. Second\n3. Third',
                line: (
                    <>
                        <Line><Marker>1. </Marker>First</Line>
                        <Line><Marker>2. </Marker>Second</Line>
                        <Line><Marker>3. </Marker>Third</Line>
                    </>
                ),
            },
            {
                label: 'Task list',
                syntax: '- [ ] To do\n- [x] Done',
                requires: 'gfm',
                line: (
                    <>
                        <Line><Marker>- [ ] </Marker>To do</Line>
                        <Line><Marker>- [</Marker><strong>x</strong><Marker>] </Marker>Done</Line>
                    </>
                ),
            },
        ],
    },
    {
        id: 'links',
        title: 'Links',
        entries: [
            {
                label: 'Link',
                syntax: '[link text](https://example.com)',
                // Not a real link: the line isn't meant to be followed
                line: (
                    <>
                        <Marker>[</Marker>
                        <span className="cheatsheet-link">link text</span>
                        <Marker>](https://example.com)</Marker>
                    </>
                ),
            },
            {
                label: 'Link to a heading',
                syntax: '[Go to Lists](#lists)',
                line: (
                    <>
                        <Marker>[</Marker>
                        <span className="cheatsheet-link">Go to Lists</span>
                        <Marker>](#lists)</Marker>
                    </>
                ),
            },
            {
                label: 'Image',
                syntax: '![Description](https://example.com/image.jpg)',
                line: <><Marker>![</Marker>Description<Marker>](https://example.com/image.jpg)</Marker></>,
            },
            {
                label: 'Image from your files',
                syntax: imageMarkdown(LOCAL_IMAGE),
                line: (
                    <>
                        <Marker>![</Marker>{imageAlt(LOCAL_IMAGE)}<Marker>]({imageMarkdownPath(LOCAL_IMAGE)})</Marker>
                    </>
                ),
            },
        ],
    },
    {
        id: 'blocks',
        title: 'Blocks',
        entries: [
            {
                label: 'Quote',
                syntax: '> Quoted text',
                line: <span className="cheatsheet-quote"><Marker>&gt; </Marker>Quoted text</span>,
            },
            {
                label: 'Code block',
                syntax: '```js\nconsole.log("Hello");\n```',
                line: (
                    <span className="cheatsheet-code-block">
                        <Line><Marker>```js</Marker></Line>
                        <Line>console.log("Hello");</Line>
                        <Line><Marker>```</Marker></Line>
                    </span>
                ),
            },
            {
                label: 'Mermaid diagram',
                syntax: '```mermaid\nflowchart LR\n    A[Write] --> B[Preview]\n```',
                line: (
                    <span className="cheatsheet-code-block">
                        <Line><Marker>```mermaid</Marker></Line>
                        <Line>flowchart LR</Line>
                        <Line className="cheatsheet-indent">A[Write] --&gt; B[Preview]</Line>
                        <Line><Marker>```</Marker></Line>
                    </span>
                ),
            },
            {
                label: 'Table',
                syntax: '| Name | Role |\n| --- | --- |\n| Ana | Editor |',
                requires: 'gfm',
                line: (
                    <>
                        <Line>
                            <Marker>| </Marker><strong>Name</strong><Marker> | </Marker>
                            <strong>Role</strong><Marker> |</Marker>
                        </Line>
                        <Line><Marker>| --- | --- |</Marker></Line>
                        <Line><Marker>| </Marker>Ana<Marker> | </Marker>Editor<Marker> |</Marker></Line>
                    </>
                ),
            },
            {
                label: 'Horizontal rule',
                syntax: '---',
                line: <Marker>---</Marker>,
            },
            {
                label: 'Footnote',
                syntax: 'Text with a note.[^1]\n\n[^1]: The note itself.',
                requires: 'gfm',
                line: (
                    <>
                        <Line>Text with a note.<Marker>[^1]</Marker></Line>
                        <Line><Marker>[^1]: </Marker>The note itself.</Line>
                    </>
                ),
            },
        ],
    },
    {
        id: 'math',
        title: 'Math',
        entries: [
            {
                label: 'Inline formula',
                syntax: '$E = mc^2$',
                requires: 'math',
                line: <><Marker>$</Marker><span className="cheatsheet-formula">E = mc<sup>2</sup></span><Marker>$</Marker></>,
            },
            {
                label: 'Formula block',
                syntax: '$$\nx^2 + y^2 = z^2\n$$',
                requires: 'math',
                line: (
                    <>
                        <Line><Marker>$$</Marker></Line>
                        <Line className="cheatsheet-formula">x<sup>2</sup> + y<sup>2</sup> = z<sup>2</sup></Line>
                        <Line><Marker>$$</Marker></Line>
                    </>
                ),
            },
        ],
    },
    {
        id: 'html',
        title: 'HTML',
        entries: [
            {
                label: 'Highlight',
                syntax: '<mark>highlighted text</mark>',
                requires: 'allowHtml',
                line: (
                    <>
                        <Marker>&lt;mark&gt;</Marker>
                        <mark className="cheatsheet-mark">highlighted text</mark>
                        <Marker>&lt;/mark&gt;</Marker>
                    </>
                ),
            },
            {
                label: 'Subscript',
                syntax: 'H<sub>2</sub>O',
                requires: 'allowHtml',
                line: <>H<Marker>&lt;sub&gt;</Marker><sub>2</sub><Marker>&lt;/sub&gt;</Marker>O</>,
            },
            {
                label: 'Superscript',
                syntax: '2<sup>10</sup>',
                requires: 'allowHtml',
                line: <>2<Marker>&lt;sup&gt;</Marker><sup>10</sup><Marker>&lt;/sup&gt;</Marker></>,
            },
            {
                label: 'Keyboard key',
                syntax: 'Press <kbd>Enter</kbd>',
                requires: 'allowHtml',
                line: (
                    <>
                        Press <Marker>&lt;kbd&gt;</Marker>
                        <kbd className="cheatsheet-kbd">Enter</kbd>
                        <Marker>&lt;/kbd&gt;</Marker>
                    </>
                ),
            },
            {
                label: 'Collapsible section',
                syntax: '<details>\n<summary>Show more</summary>\n\nHidden until opened.\n\n</details>',
                requires: 'allowHtml',
                line: (
                    <>
                        <Line><Marker>&lt;details&gt;</Marker></Line>
                        <Line>
                            <Marker>&lt;summary&gt;</Marker><strong>Show more</strong><Marker>&lt;/summary&gt;</Marker>
                        </Line>
                        <Line>Hidden until opened.</Line>
                        <Line><Marker>&lt;/details&gt;</Marker></Line>
                    </>
                ),
            },
            {
                label: 'Hidden comment',
                syntax: '<!-- Only in the editor -->',
                line: <Marker>&lt;!-- Only in the editor --&gt;</Marker>,
            },
        ],
    },
];

// Preview settings by the name the Settings view gives them
export const REQUIREMENT_SETTING_LABELS: Record<CheatsheetRequirement, string> = {
    gfm: 'Enable tables and task lists',
    math: 'Render math formulas',
    allowHtml: 'Allow embedded HTML',
};
