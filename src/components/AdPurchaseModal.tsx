import React, { useState } from 'react';
import { useAds } from '../context/AdsContext';
import { Zap, Upload, Image as ImageIcon } from 'lucide-react';

export interface AdPurchaseModalProps {
    onClose: () => void;
    onPreviewImage?: (url: string) => void;
}

export const AdPurchaseModal: React.FC<AdPurchaseModalProps> = ({ onClose, onPreviewImage }) => {
    const { ads } = useAds();
    const [minutes, setMinutes] = useState(10);
    const [customer, setCustomer] = useState({ name: '', email: '', cpf: '' });
    const [step, setStep] = useState(1); // 1: Config, 2: Payment, 3: Success
    const [loading, setLoading] = useState(false);
    const [paymentData, setPaymentData] = useState<any>(null);
    const [currentAdId, setCurrentAdId] = useState<string | null>(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Watch for ad activation
    React.useEffect(() => {
        if (currentAdId && step === 2) {
            const ad = ads.find(a => a.id === currentAdId);
            if (ad && ad.status === 'active') {
                setStep(3);
                setTimeout(onClose, 3000);
            }
        }
    }, [ads, currentAdId, step]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const res = await fetch('/api/uploads/ad-image', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Upload failed');

            setUploadedImageUrl(data.url);
            if (onPreviewImage) onPreviewImage(data.url);

        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Erro ao fazer upload da imagem. Tente novamente.');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleCreateOrder = async () => {
        if (!customer.name || !customer.email || !customer.cpf) {
            alert('Por favor, preencha todos os dados.');
            return;
        }

        if (!uploadedImageUrl) {
            alert('Por favor, faça upload de uma imagem para o anúncio.');
            return;
        }

        setLoading(true);

        try {
            const adData = {
                imageUrl: uploadedImageUrl,
                link: '#',
                durationMinutes: minutes,
                type: 'automated',
                priority: 1,
                neonColor: '#00ff00'
            };

            const res = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    adData,
                    amount: minutes,
                    description: `Painel LED (${minutes} min) - TáAberto`,
                    customer
                })
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Erro no pagamento');

            setCurrentAdId(data.adId);
            setPaymentData(data);
            setStep(2);

        } catch (error: any) {
            console.error(error);
            alert(`Erro: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">✕</button>

                {step === 1 && (
                    <>
                        <h2 className="text-2xl font-bold text-white mb-4">Painel LED - Anuncie Agora</h2>
                        <p className="text-gray-400 mb-6">Sua marca no topo da cidade, instantaneamente.</p>

                        <div className="space-y-4 mb-6">
                            <div className="bg-gray-800 border-2 border-dashed border-gray-700 rounded-xl p-4 text-center hover:border-green-500 transition-colors cursor-pointer relative group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    disabled={uploadingImage}
                                />
                                {uploadingImage ? (
                                    <div className="flex flex-col items-center justify-center py-4">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-2"></div>
                                        <span className="text-gray-400 text-sm">Enviando imagem...</span>
                                    </div>
                                ) : uploadedImageUrl ? (
                                    <div className="relative">
                                        <img src={uploadedImageUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                            <span className="text-white font-medium flex items-center gap-2"><Upload size={16} /> Trocar Imagem</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-6 text-gray-400 group-hover:text-green-400 transition-colors">
                                        <ImageIcon size={32} className="mb-2" />
                                        <span className="font-medium">Clique para enviar sua arte</span>
                                        <span className="text-xs text-gray-500 mt-1">Recomendado: 1920x600px (JPG/PNG)</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Duração (Minutos)</label>
                                <input
                                    type="number"
                                    value={minutes}
                                    onChange={e => setMinutes(Number(e.target.value))}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white text-xl font-bold text-center focus:ring-2 focus:ring-green-500 outline-none"
                                    min="1"
                                />
                                <p className="text-right text-gray-500 text-sm mt-1">1 Minuto = R$ 1,00</p>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <input
                                    type="text"
                                    placeholder="Seu Nome Completo"
                                    value={customer.name}
                                    onChange={e => setCustomer({ ...customer, name: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <input
                                    type="email"
                                    placeholder="Seu Email"
                                    value={customer.email}
                                    onChange={e => setCustomer({ ...customer, email: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <input
                                    type="text"
                                    placeholder="CPF (apenas números)"
                                    value={customer.cpf}
                                    onChange={e => setCustomer({ ...customer, cpf: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between items-center bg-gray-800 p-4 rounded-xl mb-6 border border-gray-700">
                            <span className="text-gray-400">Total a Pagar</span>
                            <span className="text-2xl font-bold text-green-400">R$ {minutes.toFixed(2)}</span>
                        </div>

                        <button
                            onClick={handleCreateOrder}
                            disabled={loading || uploadingImage}
                            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center gap-2"
                        >
                            {loading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : <><Zap /> Gerar Pix</>}
                        </button>
                    </>
                )}

                {step === 2 && paymentData && (
                    <div className="text-center py-8">
                        <h3 className="text-xl font-bold text-white mb-2">Escaneie para Pagar</h3>
                        <p className="text-gray-400 text-sm mb-6">Seu anúncio será ativado assim que o pagamento for confirmado.</p>

                        <div className="bg-white p-3 rounded-lg inline-block mb-6 shadow-lg">
                            <img src={paymentData.qr_code.image_url} alt="QR Code Pix" className="w-48 h-48" />
                        </div>

                        <div className="bg-gray-800 p-3 rounded-lg mb-6 break-all">
                            <p className="text-xs text-gray-500 mb-1">Copia e Cola:</p>
                            <code className="text-xs text-green-400 select-all">{paymentData.qr_code.text}</code>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-yellow-500 animate-pulse text-sm font-medium">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            Aguardando confirmação do banco...
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center py-10">
                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <Zap size={40} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Pagamento Confirmado!</h2>
                        <p className="text-gray-300">Seu banner já está ativo e iluminando a cidade.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
