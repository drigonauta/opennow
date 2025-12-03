import React from 'react';
import type { Business } from '../types';
import { ClaimWizard } from './claim/ClaimWizard';

interface ClaimBusinessModalProps {
    business: Business;
    onClose: () => void;
}

export const ClaimBusinessModal: React.FC<ClaimBusinessModalProps> = ({ business, onClose }) => {
    return <ClaimWizard business={business} onClose={onClose} />;
};
