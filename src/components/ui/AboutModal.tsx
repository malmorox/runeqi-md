import { FaGithub, FaBalanceScale } from 'react-icons/fa';
import Modal from '@components/Modal';

const REPOSITORY_URL = 'https://github.com/malmorox/runeqi-md';
const TITLE_ID = 'about-runeqi-title';

// Same look as the Cancel button of ConfirmModal
const LINK_CLASSES = "inline-flex items-center gap-2 px-4 py-2 rounded text-[#2d2d30] bg-[#D4D4D4] hover:bg-[#bbbbbb] transition-colors focus-visible:outline-2 focus-visible:outline-sky-500";

interface AboutModalProps {
    onClose: () => void;
}

// "About RuneQi" from the menu: what the app is, and where its source code and license are
const AboutModal = ({ onClose }: AboutModalProps) => (
    <Modal isOpen onClose={onClose} labelledBy={TITLE_ID}>
        <h2 id={TITLE_ID} className="text-xl font-semibold text-gray-900">
            RuneQi – Markdown Editor
        </h2>

        <p className="mt-2 text-gray-600">
            A friendly, powerful, and fully customizable open-source in-browser Markdown editor with real-time preview.
        </p>
        <p className="mt-2 text-sm text-gray-500">
            Built with React, TypeScript, Tailwind CSS and Vite.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2">
            <a href={REPOSITORY_URL} target="_blank" rel="noopener noreferrer" className={LINK_CLASSES}>
                <FaGithub size={16} aria-hidden />
                Source code
                <span className="sr-only">(opens in a new tab)</span>
            </a>
            <a href={`${REPOSITORY_URL}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer" className={LINK_CLASSES}>
                <FaBalanceScale size={16} aria-hidden />
                Apache License 2.0
                <span className="sr-only">(opens in a new tab)</span>
            </a>
            <button
                type="button"
                onClick={onClose}
                className="ml-auto px-4 py-2 text-white rounded bg-sky-400 hover:bg-sky-500 transition-colors cursor-pointer"
            >
                Close
            </button>
        </div>
    </Modal>
);

export default AboutModal;
