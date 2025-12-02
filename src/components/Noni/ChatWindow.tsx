import React, { useState, useRef, useEffect } from 'react';
import { NoniAvatar } from './NoniAvatar';
import { X, Send, MapPin } from 'lucide-react';
import { useChat } from '../../App';
import { useBusiness } from '../../context/BusinessContext';

interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    results?: any[];
    action?: string;
}

export const ChatWindow: React.FC = () => {
    const { setIsChatOpen } = useChat();
    const { userLocation, distances } = useBusiness();
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: 'ai', text: 'Olá! Sou o Nôni 🟣\nEstou procurando os melhores lugares abertos pra você. O que deseja?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.text,
                    userLocation,
                    userId: 'guest' // Replace with real ID if available
                })
            });

            const data = await response.json();

            setTimeout(() => {
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    sender: 'ai',
                    text: data.text,
                    results: data.results,
                    action: data.action
                };
                setMessages(prev => [...prev, aiMsg]);
                setIsTyping(false);
            }, 1000); // Fake delay for "thinking"

        } catch (error) {
            console.error(error);
            setIsTyping(false);
        }
    };

    const handleQuickReply = (text: string) => {
        setInput(text);
        // Optional: auto-send
        // handleSend(); 
    };

    return (
        <div className="fixed bottom-4 right-4 w-full sm:w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-purple-100 overflow-hidden font-sans transition-all duration-300 ease-in-out">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex justify-between items-center text-white shadow-md">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <NoniAvatar size="md" state="happy" showShadow={false} />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-purple-600 rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-base">Nôni IA</h3>
                        <p className="text-xs opacity-90">Online agora</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsChatOpen(false)}
                    className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && (
                            <div className="mr-2 mt-1 scale-75 origin-top-left">
                                <NoniAvatar size="sm" />
                            </div>
                        )}
                        <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${msg.sender === 'user'
                            ? 'bg-purple-600 text-white rounded-tr-none'
                            : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                            }`}>
                            <p className="whitespace-pre-line">{msg.text}</p>

                            {/* Render Results if any */}
                            {msg.results && msg.results.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {msg.results.map((business: any) => (
                                        <div key={business.business_id} className="bg-gray-50 rounded-lg p-2 border border-gray-200">
                                            <p className="font-bold text-gray-900 text-xs">{business.name}</p>
                                            <p className="text-xs text-gray-500">{business.category} • {business.open_time} - {business.close_time}</p>
                                            {distances[business.business_id] && (
                                                <p className="text-[10px] text-blue-600 flex items-center mt-1">
                                                    <MapPin size={10} className="mr-1" />
                                                    {Number(distances[business.business_id]).toFixed(1)} km
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Sales Action Button */}
                            {msg.action === 'sales_pitch' && (
                                <div className="mt-3">
                                    <button
                                        onClick={() => window.location.href = '/register-business'}
                                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2 rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all"
                                    >
                                        🚀 Cadastrar Minha Empresa
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="mr-2 mt-1 scale-75 origin-top-left">
                            <NoniAvatar size="sm" state="thinking" />
                        </div>
                        <div className="bg-white text-gray-500 shadow-sm border border-gray-100 rounded-2xl rounded-tl-none p-3 text-xs italic flex items-center">
                            Digitando...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-4 py-2 bg-gray-50 flex gap-2 overflow-x-auto no-scrollbar">
                <button onClick={() => handleQuickReply('O que tem aberto?')} className="whitespace-nowrap px-3 py-1 bg-white border border-purple-200 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-50">
                    🕒 Aberto agora
                </button>
                <button onClick={() => handleQuickReply('Farmácia perto')} className="whitespace-nowrap px-3 py-1 bg-white border border-purple-200 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-50">
                    💊 Farmácias
                </button>
                <button onClick={() => handleQuickReply('Me indica algo')} className="whitespace-nowrap px-3 py-1 bg-white border border-purple-200 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-50">
                    🎲 Sugestão
                </button>
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Pergunte ao Nôni..."
                        className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className={`ml-2 p-2 rounded-full transition-colors ${input.trim() ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-300 text-gray-500'
                            }`}
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
