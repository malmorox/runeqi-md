import { useState } from 'react';
import { useActiveFileEntry } from '@hooks/files/useActiveFileEntry';
import { renameFileSystemEntry } from '@helpers/renameEntry';

// Shared by the name and its rename input, so switching between them doesn't change the size or move the text
const NAME_TEXT = "text-xl font-semibold text-center px-2 py-1 rounded";

const ActiveFileName = () => {
    const activeEntry = useActiveFileEntry();
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState('');

    if (!activeEntry) return null;

    const startEditing = () => {
        setDraft(activeEntry.name);
        setIsEditing(true);
    };

    const commitRename = async (rawName: string) => {
        const name = rawName.trim();
        if (name && name !== activeEntry.name) {
            await renameFileSystemEntry(activeEntry.id, name);
        }
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            // An input doesn't grow with its text: an invisible copy of the text in the same grid cell gives it its width
            <span className="inline-grid max-w-lg min-w-12">
                <span aria-hidden className={`${NAME_TEXT} invisible col-start-1 row-start-1 whitespace-pre overflow-hidden`}>
                    {draft || ' '}
                </span>
                <input
                    autoFocus
                    // Without it the input's default width (~20 characters) would also size the grid
                    size={1}
                    aria-label="File name"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onFocus={(e) => e.currentTarget.select()}
                    className={`${NAME_TEXT} col-start-1 row-start-1 w-full min-w-0 bg-[#3c3c3c] text-white outline-none ring-1 ring-[#666] focus:ring-sky-500`}
                    onBlur={(e) => commitRename(e.currentTarget.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            commitRename(e.currentTarget.value);
                        }
                        if (e.key === 'Escape') {
                            e.preventDefault();
                            setIsEditing(false);
                        }
                    }}
                />
            </span>
        );
    }

    return (
        <button
            onClick={startEditing}
            title="Rename file"
            className={`${NAME_TEXT} text-[#bbbbbb] hover:text-white hover:bg-[#4d4d4d] transition-colors cursor-pointer truncate max-w-lg`}
        >
            {activeEntry.name}
        </button>
    );
};

export default ActiveFileName;
