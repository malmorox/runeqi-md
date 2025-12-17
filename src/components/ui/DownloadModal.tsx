import { useState } from "react";
import Modal from "@components/Modal";
import { useMarkdown } from "@hooks/useMarkdown";

interface ClearMarkdownModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function DownloadModal({
    isOpen,
    onClose
}: ClearMarkdownModalProps) {
    const [filename, setFilename] = useState("");
    const [filenameError, setFilenameError] = useState<string | null>(null);
    const { markdown } = useMarkdown();

    function validateFilename(value: string): string | null {
        const name = value.trim();

        if (!name) return null;

        if (name.includes(".")) {
            return "No incluyas puntos en el nombre";
        }

        if (/[<>:"/\\|?*\u0000-\u001F]/.test(name)) {
            return "El nombre contiene caracteres no válidos";
        }

        const reserved = [
            "CON", "PRN", "AUX", "NUL",
            "COM1", "COM2", "COM3", "COM4",
            "LPT1", "LPT2", "LPT3", "LPT4"
        ];

        if (reserved.includes(name.toUpperCase())) {
            return "Nombre de archivo no permitido";
        }

        if (name.length > 255) {
            return "El nombre es demasiado largo";
        }

        return null;
    }

    const handleFilenameChange = (value: string) => {
        setFilename(value);
        setFilenameError(validateFilename(value));
    };

    const handleDownload = () => {
        const safeFilename = filename?.trim() || "document";
        const fullFilename = `${safeFilename}.md`;

        const blob = new Blob([markdown], {
            type: "text/markdown;charset=utf-8"
        });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = fullFilename;
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setFilename("");
        setFilenameError(null);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-xl font-semibold text-gray-900">
                Export Markdown
            </h2>

            <div className="mt-2">
                <p className="text-gray-600 mb-1.5">
                    Enter a filename for your markdown file:
                </p>
                <div className="flex items-center gap-2">
                    <input
                        id="filename"
                        type="text"
                        value={filename}
                        onChange={(e) => handleFilenameChange(e.target.value)}
                        className="flex-1 rounded-md border border-[#cccccc] px-3 py-2 text-sm font-mono focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="document"
                        autoFocus
                    />
                    <span className="text-sm text-gray-500 font-mono">.md</span>
                </div>
                {filenameError && (
                    <span className="mt-1 text-sm text-red-500">{filenameError}</span>
                )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
                <button
                    onClick={onClose}
                    className="px-4 py-2 rounded text-[#2d2d30] bg-[#D4D4D4] hover:bg-[#bbbbbb] transition-colors cursor-pointer"
                >
                    Cancel
                </button>

                <button
                    onClick={handleDownload}
                    disabled={!!filenameError}
                    className={`px-4 py-2 rounded transition-colors
                        ${filenameError
                            ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                            : "bg-sky-400 text-white hover:bg-sky-500 cursor-pointer"
                        }`}
                >
                    Download
                </button>
            </div>
        </Modal>
    );
}