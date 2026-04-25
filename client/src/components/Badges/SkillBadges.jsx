// Professional Badge icon components for skill levels
import React from 'react';

// Entry Badge - Shield with checkmark (Green)
export const EntryBadge = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2L28 8V14C28 21 23 27 16 30C9 27 4 21 4 14V8L16 2Z" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" />
        <path d="M12 16L15 19L21 13" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Mid Badge - Medal with ribbon (Blue)
export const MidBadge = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4L12 10L16 12L20 10L16 4Z" fill="#dbeafe" stroke="#2563eb" strokeWidth="1.5" />
        <circle cx="16" cy="19" r="8" fill="#dbeafe" stroke="#2563eb" strokeWidth="2" />
        <path d="M12 10L10 28L16 24L22 28L20 10" fill="#3b82f6" opacity="0.3" />
        <circle cx="16" cy="19" r="4" fill="#2563eb" />
        <path d="M14 19L15.5 20.5L18 18" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Senior Badge - Crown with gems (Purple)
export const SeniorBadge = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 22L8 12L12 16L16 8L20 16L24 12L26 22H6Z" fill="#f3e8ff" stroke="#9333ea" strokeWidth="2" />
        <circle cx="8" cy="12" r="2" fill="#9333ea" />
        <circle cx="16" cy="8" r="2" fill="#9333ea" />
        <circle cx="24" cy="12" r="2" fill="#9333ea" />
        <rect x="6" y="22" width="20" height="4" fill="#9333ea" rx="1" />
    </svg>
);

// Expert Badge - Trophy with star (Orange/Gold)
export const ExpertBadge = ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 8C10 6 11 4 13 4H19C21 4 22 6 22 8V16C22 20 19 22 16 22C13 22 10 20 10 16V8Z"
            fill="#fed7aa" stroke="#ea580c" strokeWidth="2" />
        <path d="M16 4L17.5 8.5L22 9L18.5 12L19.5 16.5L16 14L12.5 16.5L13.5 12L10 9L14.5 8.5L16 4Z"
            fill="#fb923c" />
        <rect x="12" y="22" width="8" height="2" fill="#ea580c" rx="1" />
        <rect x="10" y="24" width="12" height="3" fill="#ea580c" rx="1.5" />
        <ellipse cx="8" cy="10" rx="3" ry="4" fill="#fbbf24" opacity="0.5" />
        <ellipse cx="24" cy="10" rx="3" ry="4" fill="#fbbf24" opacity="0.5" />
    </svg>
);

export const getBadgeComponent = (level) => {
    switch (level) {
        case "Entry": return EntryBadge;
        case "Mid": return MidBadge;
        case "Senior": return SeniorBadge;
        case "Expert": return ExpertBadge;
        default: return EntryBadge;
    }
};
