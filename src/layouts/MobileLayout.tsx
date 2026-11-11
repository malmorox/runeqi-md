// The editor is desktop only, so small screens get a page describing it. Google indexes the mobile version
// of a site, so this page is also what search engines read: it needs real content, not just a notice
const FEATURES = [
    'Live preview side by side with the editor, with scroll sync',
    'Toolbar and keyboard shortcuts for headings, lists, tables, links, images and more',
    'GitHub Flavored Markdown: tables, task lists and footnotes',
    'Code blocks with syntax highlighting',
    'File explorer with folders, trash and images pasted straight into your notes',
    'Import and export .md files',
    'Light and dark themes',
];

const MobileLayout = () => {
    return (
        <main className="min-h-screen w-full overflow-y-auto bg-[#1e1e1e] text-white px-6 py-12">
            <div className="max-w-xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">RuneQi – Free online Markdown editor</h1>
                <p className="text-neutral-300 mb-6">
                    Write Markdown with a real-time preview, right in your browser.
                    Free, open source and no sign-up: your files are saved in your browser, on your device.
                </p>

                <p className="rounded-md border border-neutral-700 bg-neutral-800 p-4 text-neutral-200 mb-10">
                    RuneQi is designed for desktop. Open <strong>runeqimd.dev</strong> on a computer to start writing.
                </p>

                <h2 className="text-xl font-semibold mb-4">Features</h2>
                <ul className="list-disc pl-5 space-y-2 text-neutral-300 mb-10">
                    {FEATURES.map((feature) => <li key={feature}>{feature}</li>)}
                </ul>

                <a
                    href="https://github.com/malmorox/runeqi-md"
                    className="text-sky-400 underline underline-offset-4"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View the source code on GitHub
                </a>
            </div>
        </main>
    );
}

export default MobileLayout;
