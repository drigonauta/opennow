import React, { useState } from 'react';
import { Search, Download, AlertCircle, CheckCircle } from 'lucide-react';

interface GooglePlace {
    google_place_id: string;
    name: string;
    category: string;
    address: string;
    latitude: number;
    longitude: number;
    rating: number;
    user_ratings_total: number;
    business_status: string;
}

export const AdminImport: React.FC = () => {
    // Search State
    const [term, setTerm] = useState('');
    const [city, setCity] = useState('Uberaba');
    const [neighborhood, setNeighborhood] = useState('');
    const radius = '5000';

    // UI State
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Data State
    const [results, setResults] = useState<GooglePlace[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [requirePhone, setRequirePhone] = useState(true); // Default true as requested

    // Category State
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<Record<string, string>>({});

    React.useEffect(() => {
        console.log("Fetching categories...");
        fetch('/api/categories')
            .then(res => {
                console.log("Categories response status:", res.status);
                return res.json();
            })
            .then(data => {
                console.log("Categories data received:", data);
                setCategories(data);
            })
            .catch(err => console.error("Failed to fetch categories", err));
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');
        setResults([]);
        setSelectedIds(new Set());
        setSelectedCategories({});

        try {
            const response = await fetch('/api/admin/google/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer admin-secret-token'
                },
                body: JSON.stringify({
                    term,
                    city,
                    neighborhood,
                    radius: parseInt(radius)
                })
            });

            const data = await response.json();

            if (response.ok) {
                const searchResults = data.results || [];
                setResults(searchResults);

                // Initialize selected categories with the one from Google or default
                // IMPROVEMENT: Auto-select category based on search term
                const initialCats: Record<string, string> = {};

                // Find matching category from our list
                let matchedCategory = 'Outros';
                const lowerTerm = term.toLowerCase();

                // Try to find a category that contains the search term
                const foundCat = categories.find(c =>
                    c.label.toLowerCase().includes(lowerTerm) ||
                    lowerTerm.includes(c.label.toLowerCase())
                );

                if (foundCat) {
                    matchedCategory = foundCat.label;
                }

                searchResults.forEach((r: GooglePlace) => {
                    // If we found a match based on search term, use it. 
                    // Otherwise fall back to what the backend suggested (which might be 'Outros' or a mapped one)
                    // The user requested: "o que digitar ali no que procura, ele vai enquadrar"
                    // So we prioritize the matched category from the search term.
                    if (foundCat) {
                        initialCats[r.google_place_id] = matchedCategory;
                    } else {
                        initialCats[r.google_place_id] = r.category || 'Outros';
                    }
                });
                setSelectedCategories(initialCats);

                if (searchResults.length === 0) {
                    setError('Nenhum resultado encontrado.');
                }
            } else {
                setError(data.error || 'Erro na busca');
            }
        } catch {
            setError('Erro de conexão com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        if (selectedIds.size === 0) return;

        setImporting(true);
        setError('');

        const selectedBusinesses = results
            .filter(r => selectedIds.has(r.google_place_id))
            .map(r => ({
                ...r,
                category: selectedCategories[r.google_place_id] || 'Outros' // Use selected category
            }));

        try {
            const response = await fetch('/api/admin/google/import', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer admin-secret-token'
                },
                body: JSON.stringify({
                    businesses: selectedBusinesses,
                    requirePhone // Pass the flag
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMsg(`Importação concluída! ${data.imported} empresas adicionadas. ${data.skipped} duplicadas puladas.`);
                // Clear selection
                setSelectedIds(new Set());
            } else {
                setError(data.error || 'Erro na importação');
            }
        } catch {
            alert('Erro ao buscar detalhes. Verifique o console.');
        } finally {
            setImporting(false);
        }
    };

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const toggleAll = () => {
        if (selectedIds.size === results.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(results.map(r => r.google_place_id)));
        }
    };

    const handleCategoryChange = (id: string, newCategory: string) => {
        setSelectedCategories(prev => ({
            ...prev,
            [id]: newCategory
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">Importação Avançada</h2>
                    <p className="mt-2 text-gray-600">Busque no Google Maps e selecione o que deseja importar.</p>
                </div>

                {/* Search Form */}
                <div className="bg-white p-6 shadow sm:rounded-lg mb-8 relative z-10">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
                        <div className="sm:col-span-2 lg:col-span-1 relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">O que procura?</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                    <Search className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={term}
                                    onChange={(e) => setTerm(e.target.value)}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-9 sm:text-sm border-gray-300 rounded-md py-2 border relative z-20 bg-white text-gray-900"
                                    placeholder="Ex: Padaria, Oficina"
                                    autoComplete="off"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                            <input
                                type="text"
                                required
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 border px-3 relative z-20 bg-white text-gray-900"
                                placeholder="Ex: Uberaba"
                                autoComplete="off"
                            />
                        </div>

                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bairro (Opcional)</label>
                            <input
                                type="text"
                                value={neighborhood}
                                onChange={(e) => setNeighborhood(e.target.value)}
                                className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 border px-3 relative z-20 bg-white text-gray-900"
                                placeholder="Ex: Centro"
                                autoComplete="off"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 items-center gap-2 h-[38px] relative z-20"
                        >
                            {loading ? 'Buscando...' : (
                                <>
                                    <Search size={16} />
                                    Buscar
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Messages */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start">
                        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}

                {successMsg && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                        <p>{successMsg}</p>
                    </div>
                )}

                {/* Results Table */}
                {results.length > 0 && (
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">Resultados Encontrados</h3>
                                <p className="mt-1 max-w-2xl text-sm text-gray-500">{results.length} empresas encontradas.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500">{selectedIds.size} selecionados</span>

                                {/* Batch Category Update */}
                                <div className="flex items-center gap-2 border-l pl-3 ml-3 border-gray-300">
                                    <select
                                        className="block w-40 pl-3 pr-8 py-1.5 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                                        onChange={(e) => {
                                            if (!e.target.value) return;
                                            const newCat = e.target.value;
                                            const newCats = { ...selectedCategories };
                                            selectedIds.forEach(id => {
                                                newCats[id] = newCat;
                                            });
                                            setSelectedCategories(newCats);
                                            // Reset select
                                            e.target.value = '';
                                        }}
                                    >
                                        <option value="">Alterar Lote...</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.label}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-2 border-l pl-3 ml-3 border-gray-300">
                                    <input
                                        id="requirePhone"
                                        type="checkbox"
                                        checked={requirePhone}
                                        onChange={(e) => setRequirePhone(e.target.checked)}
                                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                    <label htmlFor="requirePhone" className="text-sm text-gray-700 select-none">
                                        Só com Telefone
                                    </label>
                                </div>

                                <button
                                    onClick={handleImport}
                                    disabled={selectedIds.size === 0 || importing}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                >
                                    {importing ? 'Importando...' : (
                                        <>
                                            <Download className="mr-2 h-4 w-4" />
                                            Importar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.size === results.length && results.length > 0}
                                                onChange={toggleAll}
                                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                            />
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Empresa
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Endereço
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Categoria
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Avaliação
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {results.map((place) => (
                                        <tr key={place.google_place_id} className={selectedIds.has(place.google_place_id) ? 'bg-blue-50' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(place.google_place_id)}
                                                    onChange={() => toggleSelection(place.google_place_id)}
                                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{place.name}</div>
                                                <div className="text-xs text-gray-500">{place.business_status}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500 truncate max-w-xs" title={place.address}>{place.address}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={selectedCategories[place.google_place_id] || 'Outros'}
                                                    onChange={(e) => handleCategoryChange(place.google_place_id, e.target.value)}
                                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {categories.map((cat) => (
                                                        <option key={cat.id} value={cat.label}>
                                                            {cat.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                ⭐ {place.rating} ({place.user_ratings_total})
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
