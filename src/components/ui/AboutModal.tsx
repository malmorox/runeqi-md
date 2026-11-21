import { FaGithub, FaBug, FaXTwitter } from 'react-icons/fa6';
import Modal from '@components/Modal';

const REPOSITORY_URL = 'https://github.com/malmorox/runeqi-md';
const TWITTER_URL = 'https://x.com/runeqimd';
const LICENSE_URL = 'https://www.apache.org/licenses/LICENSE-2.0';

const LINKS = [
    { label: 'Source code', href: REPOSITORY_URL, icon: FaGithub },
    { label: 'Issue tracker', href: `${REPOSITORY_URL}/issues`, icon: FaBug },
    { label: '@runeqimd', href: TWITTER_URL, icon: FaXTwitter },
];

const LINK_CLASSES = "text-sky-600 underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-sky-500 rounded-sm";

interface AboutModalProps {
    onClose: () => void;
}

// "About RuneQi" from the menu: what the app is, where to find it, where the files are kept and its license
const AboutModal = ({ onClose }: AboutModalProps) => (
    <Modal isOpen onClose={onClose} labelledBy="about-runeqi-title">
        <div className="flex flex-col items-center text-center">
            {/* Logo and name on one line; the SVG has some empty space around the rune, hence the small gap */}
            <h2 id="about-runeqi-title" className="flex items-center gap-1 text-4xl font-semibold text-[#16161D]">
                <img src="/brand/runeqi-logo-on-light.svg" alt="" width={72} height={72} className="size-18" />
                RuneQi
            </h2>
            <p className="mt-2 text-gray-600">
                A friendly, open-source Markdown editor with real-time preview.
            </p>

            <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2">
                {LINKS.map(({ label, href, icon: Icon }) => (
                    <li key={href}>
                        <a href={href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 ${LINK_CLASSES}`}>
                            <Icon size={15} aria-hidden />
                            {label}
                            <span className="sr-only">(opens in a new tab)</span>
                        </a>
                    </li>
                ))}
            </ul>

            <hr className="my-6 w-24 border-gray-200" />

            <h3 className="font-semibold text-gray-900">Where are my files stored?</h3>
            <p className="mt-1 text-sm text-gray-600">
                In this browser. RuneQi has no accounts or servers where your files are kept, so clearing
                your browser data deletes them: export the ones you want to keep.
            </p>

            <p className="mt-6 text-sm text-gray-500">
                Licensed under the{' '}
                <a href={LICENSE_URL} target="_blank" rel="noopener noreferrer" className={LINK_CLASSES}>
                    Apache License 2.0
                    <span className="sr-only">(opens in a new tab)</span>
                </a>
            </p>
        </div>

        <div className="mt-6 flex justify-end">
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-white rounded bg-sky-400 hover:bg-sky-500 transition-colors cursor-pointer"
            >
                Close
            </button>
        </div>
    </Modal>
);

export default AboutModal;
