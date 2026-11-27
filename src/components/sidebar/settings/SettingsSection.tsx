import React from 'react';

interface SettingsSectionProps {
    title: string;
    description: string;
    children: React.ReactNode;
}

const SettingsSection = ({ title, description, children }: SettingsSectionProps) => (
    <section className="settings-section">
        <div>
            <div className="settings-section-title">{title}</div>
            <p className="settings-section-description">{description}</p>
        </div>
        {children}
    </section>
);

export default SettingsSection;
