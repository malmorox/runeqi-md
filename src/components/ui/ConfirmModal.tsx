import { useId } from "react";
import Modal from "@components/Modal";

interface ConfirmModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "default" | "danger";
    // The action is running: both buttons are off, and the modal can't be closed meanwhile
    busy?: boolean;
    // Extra content between the message and the buttons (e.g. an option)
    children?: React.ReactNode;
}

const CONFIRM_BUTTON = {
    default: "bg-sky-400 enabled:hover:bg-sky-500",
    // the confirm button is red, for actions that delete things for good
    danger: "bg-red-600 enabled:hover:bg-red-700",
};

const ConfirmModal = ({
    title,
    message,
    onConfirm,
    onCancel,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "default",
    busy = false,
    children
}: ConfirmModalProps) => {
    const titleId = useId();

    return (
        <Modal isOpen onClose={busy ? () => {} : onCancel} labelledBy={titleId}>
            <h2 id={titleId} className="text-xl font-semibold text-gray-900">
                {title}
            </h2>

            <p className="mt-2 text-gray-600">
                {message}
            </p>

            {children}

            <div className="mt-6 flex justify-end gap-2">
                <button
                    onClick={onCancel}
                    disabled={busy}
                    className="px-4 py-2 rounded text-[#2d2d30] bg-[#D4D4D4] enabled:hover:bg-[#bbbbbb] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {cancelLabel}
                </button>

                <button
                    onClick={onConfirm}
                    disabled={busy}
                    className={`px-4 py-2 text-white rounded ${CONFIRM_BUTTON[variant]} transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {confirmLabel}
                </button>
            </div>
        </Modal>
    );
}

export default ConfirmModal;
