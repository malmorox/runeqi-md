import Modal from "@components/Modal";

interface AlertModalProps {
    title: string;
    message: string;
    onClose: () => void;
}

const AlertModal = ({ title, message, onClose }: AlertModalProps) => {
    return (
        <Modal isOpen onClose={onClose}>
            <h2 className="text-xl font-semibold text-gray-900">
                {title}
            </h2>

            <p role="alert" className="mt-2 text-gray-600 whitespace-pre-line">
                {message}
            </p>

            <div className="mt-6 flex justify-end">
                <button
                    autoFocus
                    onClick={onClose}
                    className="px-4 py-2 text-white rounded bg-sky-400 hover:bg-sky-500 transition-colors cursor-pointer"
                >
                    OK
                </button>
            </div>
        </Modal>
    );
}

export default AlertModal;
