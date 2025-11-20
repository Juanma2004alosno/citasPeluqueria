import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, Sparkles, X, Send } from 'lucide-react';
import { SALON_SERVICES } from '../constants';

interface GeminiAssistantProps {
  onRecommend: (serviceId: string) => void;
}

const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ onRecommend }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    {role: 'model', text: '¡Hola! Soy tu estilista virtual. Descríbeme tu tipo de cabello o qué cambio buscas, y te recomendaré el mejor servicio.'}
  ]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        setMessages(prev => [...prev, { role: 'model', text: 'Error: API Key no configurada.' }]);
        setLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const model = 'gemini-2.5-flash';
      
      // Include price in context for the AI
      const servicesList = SALON_SERVICES.map(s => `${s.name} (ID: ${s.id}) - Precio: ${s.price}€ - ${s.description}`).join('\n');
      const prompt = `
        Eres un experto estilista en una peluquería de lujo llamada LuxeCuts.
        Aquí está la lista de servicios disponibles con sus precios en Euros (€):
        ${servicesList}

        El usuario te dirá qué necesita o cuál es su presupuesto. Tu trabajo es:
        1. Dar un consejo breve y amable sobre estilo.
        2. Recomendar UN servicio de la lista que mejor se adapte.
        3. Al final de tu respuesta, incluye el ID del servicio recomendado en este formato exacto: [RECOMMEND:SERVICE_ID].

        Usuario dice: "${userMsg}"
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      const text = response.text || 'Lo siento, no pude procesar eso.';
      
      // Extract recommendation if present
      const recommendMatch = text.match(/\[RECOMMEND:(.*?)\]/);
      let cleanText = text.replace(/\[RECOMMEND:.*?\]/, '').trim();
      
      setMessages(prev => [...prev, { role: 'model', text: cleanText }]);

      if (recommendMatch && recommendMatch[1]) {
        onRecommend(recommendMatch[1]);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: 'Hubo un error conectando con el estilista virtual.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-amber-600 text-white p-4 rounded-full shadow-xl hover:bg-amber-700 transition-all z-50 animate-bounce"
      >
        <Sparkles size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col z-50 overflow-hidden">
      <div className="bg-amber-600 p-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles size={20} />
          <h3 className="font-bold">Estilista AI</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-amber-700 p-1 rounded">
          <X size={20} />
        </button>
      </div>
      
      <div className="flex-1 h-80 overflow-y-auto p-4 space-y-4 bg-stone-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
              m.role === 'user' 
                ? 'bg-stone-800 text-white rounded-br-none' 
                : 'bg-white border border-stone-200 text-stone-800 rounded-bl-none shadow-sm'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-stone-200 text-stone-500 text-xs p-2 rounded animate-pulse">Pensando...</div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-stone-200 bg-white flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="¿Qué look buscas hoy?"
          className="flex-1 border border-stone-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-amber-600"
        />
        <button 
          onClick={handleSend}
          disabled={loading}
          className="bg-amber-600 text-white p-2 rounded-full hover:bg-amber-700 disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default GeminiAssistant;