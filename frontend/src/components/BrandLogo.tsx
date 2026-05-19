import type { ReactNode } from 'react';

interface BrandLogoProps {
    children?: ReactNode;
    className?: string;
    compact?: boolean;
}

export const BrandLogo = ({ children = 'Polyglot Space', className = '', compact = false }: BrandLogoProps) => {
    const classes = ['brand-lockup', compact ? 'compact' : '', className].filter(Boolean).join(' ');

    return (
        <span className={classes}>
            <span className="brand-logo-mark" aria-hidden="true">
                <img src="/polyglot-logo.jpg" alt="" />
            </span>
            <span className="brand-logo-text">{children}</span>
        </span>
    );
};
