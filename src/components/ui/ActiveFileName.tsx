import { useState } from 'react';
import { useActiveFileEntry } from '@hooks/files/useActiveFileEntry';
import { renameFileSystemEntry } from '@helpers/renameEntry';
import { useAlerts } from '@hooks/useAlerts';
import { storageErrorMessage } from '@utils/alertMessages';

const ActiveFileName = () => {
    const activeEntry = useActiveFileEntry();
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState('');
    const alerts = useAlerts();

    if (!activeEntry) return null;

    const startEditing = () => {
        setDraft(activeEntry.name);
        setIsEditing(true);
    };

    const commitRename = async (rawName: string) => {
        const name = rawName.trim();
        try {
            if (name && name !== activeEntry.name) {
                await renameFileSystemEntry(activeEntry.id, name);
            }
        } catch (error) {
            alerts.error({ title: "The file couldn't be renamed", message: storageErrorMessage(error) });
        } finally {
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            // An input doesn't grow with its text: an invisible copy of the text in the same grid cell gives it its width
            <span className="active-file-name-editor">
                <span aria-hidden className="active-file-name active-file-name-sizer">
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
                    className="active-file-name active-file-name-input"
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
            className="active-file-name active-file-name-button"
        >
            {activeEntry.name}
        </button>
    );
};

export default ActiveFileName;
