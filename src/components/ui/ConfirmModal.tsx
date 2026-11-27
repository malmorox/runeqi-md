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
            <h2 id={titleId} className="modal-title">
                {title}
            </h2>

            <p className="modal-message">
                {message}
            </p>

            {children}

            <div className="modal-actions">
                <button
                    onClick={onCancel}
                    disabled={busy}
                    className="modal-button-secondary"
                >
                    {cancelLabel}
                </button>

                <button
                    onClick={onConfirm}
                    disabled={busy}
                    data-variant={variant}
                    className="modal-button-primary"
                >
                    {confirmLabel}
                </button>
            </div>
        </Modal>
    );
}

export default ConfirmModal;
