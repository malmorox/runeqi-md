import EmojiPicker, { Theme, EmojiStyle, type EmojiClickData } from 'emoji-picker-react';
import "../../styles/emoji-picker.css"

interface EmojiSelectorProps {
    onSelect: (emoji: string) => void;
}

const EmojiSelector = ({ onSelect }: EmojiSelectorProps) => {
    const handleEmojiClick = (emojiData: EmojiClickData) => {
        onSelect(emojiData.emoji);
    };

    return (
        <div className="emoji-selector-wrapper">
            <EmojiPicker
                onEmojiClick={handleEmojiClick}
                emojiStyle={EmojiStyle.NATIVE}
                width={320}
                height={400}
                theme={Theme.DARK}
                searchPlaceHolder="Buscar emoji..."
                previewConfig={{
                    showPreview: false
                }}
            />
        </div>
    );
};

export default EmojiSelector;