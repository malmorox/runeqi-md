import ConfirmModal from '@components/ui/ConfirmModal';
import type { ConfirmAction } from '@hooks/files/useTrashActions';

interface ConfirmDeleteModalProps {
    action: ConfirmAction;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDeleteModal = ({ action, onConfirm, onCancel }: ConfirmDeleteModalProps) => (
    <ConfirmModal
        title={
            action.kind === 'empty'
                ? 'Empty Trash?'
                : `Delete "${action.node.name}" permanently?`
        }
        message={
            action.kind === 'empty'
                ? "Everything inside Trash will be permanently deleted. This can't be undone."
                : `This will permanently delete "${action.node.name}". This can't be undone.`
        }
        confirmLabel={action.kind === 'empty' ? 'Empty Trash' : 'Delete'}
        onConfirm={onConfirm}
        onCancel={onCancel}
    />
);

export default ConfirmDeleteModal;
