import React, { useState } from 'react';
import { X, ChevronLeft } from 'lucide-react';
import type { Business } from '../../types';
import type { PlanType } from '../../types/subscription';
import { StepConfirm } from './StepConfirm';
import { StepPlans } from './StepPlans';
import { StepCheckout } from './StepCheckout';
import { useAuth } from '../../context/AuthContext';

interface ClaimWizardProps {
    business: Business;
    onClose: () => void;
}

export const ClaimWizard: React.FC<ClaimWizardProps> = ({ business, onClose }) => {
    const { user } = useAuth();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [loading, setLoading] = useState(false);

    const [claimData, setClaimData] = useState({
        name: user?.displayName || '',
        email: user?.email || '',
        phone: '',
        plan: 'free' as PlanType,
        billingCycle: 'monthly' as 'monthly' | 'yearly'
    });

    const handleConfirmData = (data: { name: string; email: string; phone: string }) => {
        setClaimData({ ...claimData, ...data });
        setStep(2);
    };

    const handleSelectPlan = (plan: PlanType, billingCycle: 'monthly' | 'yearly') => {
        setClaimData({ ...claimData, plan, billingCycle });
        setStep(3);
    };

    const handleCheckout = async (paymentData: any) => {
        setLoading(true);
        try {
            // 1. Create Claim
            await fetch('/api/claims/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || 'dev-token'}`
                },
                body: JSON.stringify({
                    businessId: business.business_id,
                    userName: claimData.name,
                    userEmail: claimData.email,
                    userPhone: claimData.phone,
                    planSelected: claimData.plan,
                    billingCycle: claimData.billingCycle
                })
            });

            // 2. Process Subscription
            const res = await fetch('/api/subscription/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || 'dev-token'}`
                },
                body: JSON.stringify({
                    business_id: business.business_id,
                    plan: claimData.plan,
                    billing_cycle: claimData.billingCycle,
                    card_details: paymentData // In real app, tokenize this!
                })
            });

            if (res.ok) {
                alert(`🎉 Parabéns! Sua empresa agora está com o plano ${claimData.plan.toUpperCase()}. Recursos liberados imediatamente.`);
                onClose();
                window.location.reload(); // Refresh to show new status
            } else {
                alert('Erro ao processar pagamento. Tente novamente.');
            }
        } catch (error) {
            console.error(error);
            alert('Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-4xl relative shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white rounded-t-3xl z-10">
                    <div className="flex items-center gap-3">
                        {step > 1 && (
                            <button onClick={() => setStep(step - 1 as any)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <ChevronLeft size={24} className="text-gray-600" />
                            </button>
                        )}
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Reivindicar Empresa</h1>
                            <div className="flex gap-2 mt-1">
                                {[1, 2, 3].map(s => (
                                    <div key={s} className={`h-1.5 w-8 rounded-full transition-colors ${s <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto">
                    {step === 1 && (
                        <StepConfirm
                            businessName={business.name}
                            initialData={{ name: claimData.name, email: claimData.email, phone: claimData.phone }}
                            onNext={handleConfirmData}
                        />
                    )}
                    {step === 2 && (
                        <StepPlans onSelect={handleSelectPlan} />
                    )}
                    {step === 3 && (
                        <StepCheckout
                            plan={claimData.plan}
                            billingCycle={claimData.billingCycle}
                            onConfirm={handleCheckout}
                            loading={loading}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
