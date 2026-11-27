import { useState } from 'react';
import ConfirmModal from '@components/ui/ConfirmModal';
import { resetWorkspace } from '@helpers/resetWorkspace';
import { isSpecialFolderId } from '@helpers/systemFolders';
import { useFiles } from '@hooks/files/useFiles';
import { useActiveFile } from '@hooks/useActiveFile';
import { useEditor } from '@hooks/useEditor';
import { useSettings } from '@hooks/useSettings';
import { useTheme } from '@hooks/useTheme';
import { useAlerts } from '@hooks/useAlerts';
import { DEFAULT_THEME } from '@contexts/ThemeContext';
import { storageErrorMessage } from '@utils/alertMessages';
import type { FileSystemEntry } from '@/types/file';

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

// "12 files, 3 folders and 5 images": what's about to be deleted, so it's clear how much is lost.
// The system folders don't count, they're created again
function describeEntries(entries: FileSystemEntry[]) {
    const count = (type: FileSystemEntry['type']) =>
        entries.filter((e) => e.type === type && !isSpecialFolderId(e.id)).length;
    const parts = [
        plural(count('file'), 'file'),
        ...(count('folder') ? [plural(count('folder'), 'folder')] : []),
        ...(count('image') ? [plural(count('image'), 'image')] : []),
    ];
    return parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts[0];
}

interface ResetApplicationModalProps {
    onClose: () => void;
}

// Confirmation of "Reset application" (sidebar menu): deletes everything stored in this browser and starts over with
// the welcome file. Settings and theme are reset too unless the user unchecks the box
const ResetApplicationModal = ({ onClose }: ResetApplicationModalProps) => {
    const entries = useFiles();
    const { setActiveFileId } = useActiveFile();
    const { disposeFileModel } = useEditor();
    const { resetSettings } = useSettings();
    const { setTheme } = useTheme();
    const alerts = useAlerts();
    const [resetPreferences, setResetPreferences] = useState(true);
    const [isResetting, setIsResetting] = useState(false);

    const handleConfirm = async () => {
        setIsResetting(true);
        try {
            const { deletedIds, welcomeFile } = await resetWorkspace();
            setActiveFileId(welcomeFile.id);
            // The model on screen is kept until the welcome file's one replaces it (see disposeFileModel)
            deletedIds.forEach(disposeFileModel);
            if (resetPreferences) {
                resetSettings();
                setTheme(DEFAULT_THEME);
            }
            alerts.success({
                title: 'Application reset',
                message: resetPreferences
                    ? 'Your files and preferences were cleared.'
                    : 'Your files were cleared.',
            });
            onClose();
        } catch (error) {
            // The reset is one transaction: if it fails, nothing was deleted
            alerts.error({ title: "The application couldn't be reset", message: storageErrorMessage(error) });
            setIsResetting(false);
        }
    };

    // The file list takes a moment to load: the dialog waits for it, so its message doesn't change once open
    if (!entries) return null;

    return (
        <ConfirmModal
            title="Reset application?"
            message="This will clear your whole workspace stored locally in this browser. Are you sure?"
            confirmLabel={isResetting ? 'Resetting…' : 'Reset application'}
            variant="danger"
            busy={isResetting}
            onConfirm={handleConfirm}
            onCancel={onClose}
        >
            <p className="modal-detail">
                {describeEntries(entries)} will be permanently deleted, Trash included. To keep a copy of a file,
                export it first from <strong>Menu → Import/Export</strong>.
            </p>
            <label className="modal-option">
                <input
                    type="checkbox"
                    checked={resetPreferences}
                    onChange={(e) => setResetPreferences(e.target.checked)}
                    disabled={isResetting}
                    className="modal-option-checkbox"
                />
                Also reset settings and theme to their defaults
            </label>
        </ConfirmModal>
    );
};

export default ResetApplicationModal;
