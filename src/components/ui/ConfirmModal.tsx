import Modal from "@components/Modal";

interface ConfirmModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
}

const ConfirmModal = ({
    title,
    message,
    onConfirm,
    onCancel,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel"
}: ConfirmModalProps) => {
    return (
        <Modal isOpen onClose={onCancel}>
            <h2 className="text-xl font-semibold text-gray-900">
                {title}
            </h2>

            <p className="mt-2 text-gray-600">
                {message}
            </p>

            <div className="mt-6 flex justify-end gap-2">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 rounded text-[#2d2d30] bg-[#D4D4D4] hover:bg-[#bbbbbb] transition-colors cursor-pointer"
                >
                    {cancelLabel}
                </button>

                <button
                    onClick={onConfirm}
                    className="px-4 py-2 text-white rounded bg-sky-400 hover:bg-sky-500 transition-colors cursor-pointer"
                >
                    {confirmLabel}
                </button>
            </div>
        </Modal>
    );
}

export default ConfirmModal;