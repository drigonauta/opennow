import React from 'react';
import { createPortal } from 'react-dom';
import type { Business } from '../types';
import { ClaimWizard } from './claim/ClaimWizard';

interface ClaimBusinessModalProps {
    business: Business;
    onClose: () => void;
}

export const ClaimBusinessModal: React.FC<ClaimBusinessModalProps> = ({ business, onClose }) => {
    return createPortal(
        <div className="relative z-[9999]"> {/* Ensure high z-index wrapper */}
            <ClaimWizard business={business} onClose={onClose} />
        </div>,
        document.body
    );
};
