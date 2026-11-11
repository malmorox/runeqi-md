import React, { useEffect, useEffectEvent, useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  // Id of the element that names the dialog (usually its title), read by screen readers when it opens
  labelledBy?: string;
}

const Modal = ({ isOpen, onClose, children, labelledBy }: ModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  // The listener reads the latest onClose without the effect running again (parents pass a new one on every render)
  const close = useEffectEvent(() => onClose());

  // While open: Escape closes it, and the focus moves into it so the keyboard doesn't stay on what's behind.
  // On close the focus goes back to what had it (e.g. the menu option that opened the modal)
  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      {/* Overlay con capa oscura semitransparente */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Contenido del modal */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg focus:outline-none"
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;
