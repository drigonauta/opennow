import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Save } from 'lucide-react';

export const BusinessEditor: React.FC = () => {
    const { getMyBusinesses, updateBusiness } = useBusiness();
    const myBusiness = getMyBusinesses()[0];

    const [formData, setFormData] = useState({
        name: myBusiness?.name || '',
        category: myBusiness?.category || 'Food',
        description: myBusiness?.description || '',
        whatsapp: myBusiness?.whatsapp || '',
        open_time: myBusiness?.open_time || '',
        close_time: myBusiness?.close_time || '',
        zip_code: myBusiness?.zip_code || '',
        street: myBusiness?.street || '',
        number: myBusiness?.number || '',
        neighborhood: myBusiness?.neighborhood || '',
        city: myBusiness?.city || '',
        state: myBusiness?.state || '',
        latitude: myBusiness?.latitude || 0,
        longitude: myBusiness?.longitude || 0,
    });

    const handleAddressSearch = async () => {
        const { street, number, city, state } = formData;
        if (!street || !city || !state) {
            alert('Preencha Rua, Cidade e Estado para buscar o endereço.');
            return;
        }

        const query = `${street}, ${number}, ${city}, ${state}, Brazil`;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setFormData(prev => ({
                    ...prev,
                    latitude: parseFloat(lat),
                    longitude: parseFloat(lon)
                }));
                alert(`Endereço encontrado! Latitude: ${lat}, Longitude: ${lon}`);
            } else {
                alert('Endereço não encontrado. Verifique os dados.');
            }
        } catch (error) {
            console.error('Erro ao buscar endereço:', error);
            alert('Erro ao buscar endereço.');
        }
    };

    if (!myBusiness) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateBusiness(myBusiness.business_id, formData as any);
            alert('Informações atualizadas com sucesso!');
        } catch (error) {
            console.error(error);
            alert('Erro ao atualizar. Verifique sua conexão ou login.');
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Editar Empresa</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="Food">Alimentação</option>
                        <option value="Pharmacy">Farmácia</option>
                        <option value="Services">Serviços</option>
                        <option value="Retail">Varejo</option>
                        <option value="Health">Saúde</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Address Section */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                    <h3 className="font-semibold text-gray-800">Endereço e Localização</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                            <input
                                type="text"
                                name="zip_code"
                                value={formData.zip_code}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                placeholder="00000-000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado (UF)</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                                placeholder="MG"
                                maxLength={2}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                            <input
                                type="text"
                                name="neighborhood"
                                value={formData.neighborhood}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rua/Logradouro</label>
                            <input
                                type="text"
                                name="street"
                                value={formData.street}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
                            <input
                                type="text"
                                name="number"
                                value={formData.number}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg"
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleAddressSearch}
                        className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                        📍 Atualizar Localização no Mapa
                    </button>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                        <div>Lat: {formData.latitude}</div>
                        <div>Lng: {formData.longitude}</div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Abre às</label>
                        <input
                            type="time"
                            name="open_time"
                            value={formData.open_time}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha às</label>
                        <input
                            type="time"
                            name="close_time"
                            value={formData.close_time}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                    <input
                        type="tel"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                    <Save size={20} className="mr-2" />
                    Salvar Alterações
                </button>
            </form>
        </div>
    );
};
