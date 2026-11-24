import React from 'react';

interface SettingsSectionProps {
    title: string;
    description: string;
    children: React.ReactNode;
}

const SettingsSection = ({ title, description, children }: SettingsSectionProps) => (
    <section className="bg-[#C4C4C4] rounded-md p-3 space-y-2">
        <div>
            <div className="font-semibold text-[#252526]">{title}</div>
            <p className="text-xs text-[#2d2d30] mt-0.5 mb-3">{description}</p>
        </div>
        {children}
    </section>
);

export default SettingsSection;
