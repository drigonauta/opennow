import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    message?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess, message }) => {
    const { loginWithGoogle, loginWithEmail, registerLead } = useAuth();
    const [loading, setLoading] = React.useState(false);
    const [view, setView] = React.useState<'login' | 'register'>('register');

    // Form States
    const [name, setName] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    if (!isOpen) return null;

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await loginWithGoogle();
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Erro ao fazer login com Google.');
        } finally {
            setLoading(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await loginWithEmail(email, password);
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Email ou senha inválidos.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!name || !phone || !email || !password) {
                alert('Preencha todos os campos!');
                return;
            }
            await registerLead({
                name,
                phone,
                email,
                password,
                city: 'Indefinido', // Can be updated later
                state: 'MG',
                referral_source: 'modal_gate'
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Erro ao criar conta: ' + error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                {/* Background Glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
                >
                    <X size={20} />
                </button>

                <div className="p-6 overflow-y-auto">
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3 ring-1 ring-blue-500/50">
                            <ShieldCheck size={24} className="text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">
                            {view === 'register' ? 'Criar Conta de Visitante' : 'Entrar na sua Conta'}
                        </h3>
                        <p className="text-gray-400 text-xs">
                            {message || "Identifique-se para acessar recursos exclusivos."}
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-gray-800 rounded-lg mb-6">
                        <button
                            onClick={() => setView('register')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${view === 'register' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            Criar Conta
                        </button>
                        <button
                            onClick={() => setView('login')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${view === 'login' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                        >
                            Já tenho conta
                        </button>
                    </div>

                    {view === 'register' ? (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Nome Completo</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="Seu nome"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">WhatsApp / Telefone</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="(00) 00000-0000"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Senha</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="Escolha uma senha"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-900/20 mt-2"
                            >
                                {loading ? 'Criando...' : 'Criar Conta e Continuar'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Senha</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    placeholder="Sua senha"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 mt-2"
                            >
                                {loading ? 'Entrando...' : 'Entrar'}
                            </button>
                        </form>
                    )}

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-gray-900 text-gray-500">ou continue com</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full bg-white text-gray-900 font-bold py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-all active:scale-[0.98]"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                        Google
                    </button>
                </div>
            </div>
        </div>
    );
};
