import { FaGithub, FaBug, FaXTwitter } from 'react-icons/fa6';
import Modal from '@components/Modal';
import logoUrl from '@/assets/runeqi-logo-on-light.svg';

const REPOSITORY_URL = 'https://github.com/malmorox/runeqi-md';
const TWITTER_URL = 'https://x.com/runeqimd';
const LICENSE_URL = 'https://www.apache.org/licenses/LICENSE-2.0';

const LINKS = [
    { label: 'Source code', href: REPOSITORY_URL, icon: FaGithub },
    { label: 'Issue tracker', href: `${REPOSITORY_URL}/issues`, icon: FaBug },
    { label: '@runeqimd', href: TWITTER_URL, icon: FaXTwitter },
];

interface AboutModalProps {
    onClose: () => void;
}

// "About RuneQi" from the menu: what the app is, where to find it, where the files are kept and its license
const AboutModal = ({ onClose }: AboutModalProps) => (
    <Modal isOpen onClose={onClose} labelledBy="about-runeqi-title">
        <div className="about-content">
            {/* Logo and name on one line; the SVG has some empty space around the rune, hence the small gap */}
            <h2 id="about-runeqi-title" className="about-title">
                <img src={logoUrl} alt="" width={72} height={72} className="about-logo" />
                RuneQi
            </h2>
            <p className="modal-message">
                A friendly, open-source Markdown editor with real-time preview.
            </p>

            <ul className="about-links">
                {LINKS.map(({ label, href, icon: Icon }) => (
                    <li key={href}>
                        <a href={href} target="_blank" rel="noopener noreferrer" className="about-link about-link-with-icon">
                            <Icon size={15} aria-hidden />
                            {label}
                            <span className="visually-hidden">(opens in a new tab)</span>
                        </a>
                    </li>
                ))}
            </ul>

            <hr className="about-divider" />

            <h3 className="about-subtitle">Where are my files stored?</h3>
            <p className="about-text">
                In this browser. RuneQi has no accounts or servers where your files are kept, so clearing
                your browser data deletes them: export the ones you want to keep.
            </p>

            <p className="about-license">
                Licensed under the{' '}
                <a href={LICENSE_URL} target="_blank" rel="noopener noreferrer" className="about-link">
                    Apache License 2.0
                    <span className="visually-hidden">(opens in a new tab)</span>
                </a>
            </p>
        </div>

        <div className="modal-actions">
            <button
                type="button"
                onClick={onClose}
                className="modal-button-primary"
            >
                Close
            </button>
        </div>
    </Modal>
);

export default AboutModal;
