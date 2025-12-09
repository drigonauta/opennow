import React, { useState } from 'react';
import { useAds } from '../../context/AdsContext';
import { Trash2, Plus, Clock, ExternalLink, Image as ImageIcon, Loader2 } from 'lucide-react';
import { storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const AdsManager: React.FC = () => {
    const { ads, addAd, removeAd } = useAds();
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [newAd, setNewAd] = useState({
        link: '',
        durationMinutes: 10,
        type: 'admin' as const,
        priority: 10,
        clientName: '',
        neonColor: '#00ff00' // Default green
    });

    const activeAds = ads.filter(a => a.status === 'active');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            // Create local preview
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleAdd = async () => {
        if ((!selectedFile && !previewUrl) || !newAd.clientName) return;

        setUploading(true);
        let finalImageUrl = previewUrl;

        // Upload to Firebase Storage if file selected
        if (selectedFile) {
            try {
                const storageRef = ref(storage, `ads/${Date.now()}_${selectedFile.name}`);
                await uploadBytes(storageRef, selectedFile);
                finalImageUrl = await getDownloadURL(storageRef);
            } catch (error) {
                console.error("Upload failed", error);
                alert("Falha ao fazer upload da imagem.");
                setUploading(false);
                return;
            }
        } else {
            // Validate if it is a text url (legacy fallback)
            if (!previewUrl.startsWith('http')) {
                alert("Selecione uma imagem ou forneça uma URL válida.");
                setUploading(false);
                return;
            }
        }

        await addAd({
            imageUrl: finalImageUrl,
            link: newAd.link || '#',
            durationMinutes: newAd.durationMinutes,
            type: 'admin',
            priority: newAd.priority,
            clientName: newAd.clientName,
            neonColor: newAd.neonColor
        });

        // Reset
        setNewAd({ ...newAd, clientName: '', link: '', neonColor: '#00ff00' });
        setSelectedFile(null);
        setPreviewUrl('');
        setUploading(false);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Gerenciador de Banners (Outdoor LED)</h2>

            {/* Add New Ad */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Plus size={20} className="text-blue-500" />
                    Novo Anúncio Manual
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm text-gray-400 mb-2">Imagem do Banner</label>
                        <div className="flex items-center gap-4">
                            <div className="relative w-32 h-20 bg-gray-900 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center overflow-hidden group">
                                {previewUrl ? (
                                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                ) : (
                                    <ImageIcon className="text-gray-500" />
                                )}
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-300">Clique para selecionar ou arraste uma imagem.</p>
                                <p className="text-xs text-gray-500">Recomendado: 800x200px (JPG, PNG)</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Nome do Cliente</label>
                        <input
                            type="text"
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white"
                            value={newAd.clientName}
                            onChange={e => setNewAd({ ...newAd, clientName: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Cor do Neon (LED)</label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                className="h-10 w-10 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
                                value={newAd.neonColor}
                                onChange={e => setNewAd({ ...newAd, neonColor: e.target.value })}
                            />
                            <input
                                type="text"
                                className="flex-1 bg-gray-900 border border-gray-600 rounded-lg p-2 text-white uppercase font-mono"
                                value={newAd.neonColor}
                                onChange={e => setNewAd({ ...newAd, neonColor: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Link de Destino</label>
                        <input
                            type="text"
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white"
                            placeholder="https://..."
                            value={newAd.link}
                            onChange={e => setNewAd({ ...newAd, link: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Duração (Minutos)</label>
                        <input
                            type="number"
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2 text-white"
                            value={newAd.durationMinutes}
                            onChange={e => setNewAd({ ...newAd, durationMinutes: Number(e.target.value) })}
                        />
                    </div>
                </div>
                <button
                    onClick={handleAdd}
                    disabled={(!selectedFile && !previewUrl) || !newAd.clientName || uploading}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {uploading ? (
                        <><Loader2 className="animate-spin" size={18} /> Publicando...</>
                    ) : (
                        'Publicar Anúncio'
                    )}
                </button>
            </div>

            {/* Active Ads List */}
            <div>
                <h3 className="text-lg font-bold text-white mb-4">Anúncios Ativos ({activeAds.length})</h3>
                <div className="space-y-3">
                    {activeAds.length === 0 && (
                        <p className="text-gray-500 italic">Nenhum anúncio ativo no momento.</p>
                    )}
                    {activeAds.map(ad => (
                        <div key={ad.id} className="bg-gray-800/50 border border-gray-700 p-4 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img
                                    src={ad.imageUrl}
                                    alt={ad.clientName}
                                    className="w-16 h-10 object-cover rounded bg-gray-900"
                                    style={{
                                        boxShadow: `0 0 10px ${ad.neonColor || '#00ff00'}`
                                    }}
                                />
                                <div>
                                    <h4 className="font-bold text-white">{ad.clientName || 'Cliente Autônomo'}</h4>
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} /> {(ad.durationMinutes).toFixed(1)} min
                                        </span>
                                        <span className={`px-2 py-0.5 rounded uppercase text-[10px] font-bold ${ad.type === 'admin' ? 'bg-blue-900 text-blue-300' : 'bg-green-900 text-green-300'}`}>
                                            {ad.type}
                                        </span>
                                        {ad.neonColor && (
                                            <span className="flex items-center gap-1">
                                                <div className="w-3 h-3 rounded-full" style={{ background: ad.neonColor }}></div>
                                                Neon
                                            </span>
                                        )}
                                        <a href={ad.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white">
                                            <ExternalLink size={12} /> Link
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => removeAd(ad.id)}
                                className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                                title="Remover Anúncio"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
