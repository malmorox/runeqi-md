import Modal from "@components/Modal";

interface ClearMarkdownModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ClearMarkdownModal({
    isOpen,
    onClose,
    onConfirm,
}: ClearMarkdownModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-xl font-semibold text-gray-900">
                Delete content?
            </h2>

            <p className="mt-2 text-gray-600">
                All markdown content in the editor will be deleted. This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-2">
                <button
                    onClick={onClose}
                    className="px-4 py-2 rounded text-[#2d2d30] bg-[#D4D4D4] hover:bg-[#bbbbbb] transition-colors cursor-pointer"
                >
                    Cancel
                </button>

                <button
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                    className="px-4 py-2 text-white rounded bg-sky-400 hover:bg-sky-500 transition-colors cursor-pointer"
                >
                    Confirm
                </button>
            </div>
        </Modal>
    );
}