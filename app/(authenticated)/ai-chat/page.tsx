import React, { useState, useRef, useEffect } from 'react';

const AI_MODELS = [
  { label: 'OpenAI', value: 'openai' },
  { label: 'Groq', value: 'groq' },
  { label: 'OpenRouter', value: 'openrouter' },
];

function ChatMessage({ message }: { message: { role: string; content: string } }) {
  return (
    <div className={`mb-2 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`rounded-lg px-4 py-2 max-w-[70%] break-words ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-100'}`}>
        {message.content}
      </div>
    </div>
  );
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState(AI_MODELS[0].value);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage], model }),
      });
      const data = await res.json();
      if (data && data.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error: Unable to get response.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#181A20] flex flex-col items-center justify-center relative px-2">
      {/* Logo and Title */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 mb-4 flex items-center justify-center rounded-full bg-[#23242b]">
          {/* Placeholder SVG logo */}
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Logo">
            <circle cx="24" cy="24" r="22" stroke="#fff" strokeWidth="3" />
            <path d="M16 32C24 16 32 32 24 32" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Grok</h1>
      </div>

      {/* Chat Window */}
      <div className="w-full max-w-xl flex-1 flex flex-col justify-end">
        <div className="flex-1 overflow-y-auto bg-[#23242b] rounded-2xl border border-[#23242b] p-6 mb-6 min-h-[300px] max-h-[50vh] shadow-lg transition-all">
          {messages.length === 0 && <div className="text-gray-500 text-center mt-20">What do you want to know?</div>}
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} message={msg} />
          ))}
          {loading && <div className="text-gray-500">AI is typing...</div>}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="w-full flex flex-col items-center">
          <div className="flex items-center w-full bg-[#23242b] rounded-2xl px-4 py-3 shadow-lg border border-[#23242b]">
            {/* Attach Button */}
            <button
              className="mr-2 p-2 rounded-full hover:bg-[#23242b]/70 transition"
              title="Attach file"
              aria-label="Attach file"
              type="button"
              tabIndex={-1}
            >
              <svg width="20" height="20" fill="none" stroke="#aaa" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M17 7v6a5 5 0 01-10 0V7a3 3 0 016 0v6a1 1 0 01-2 0V7"/></svg>
            </button>
            {/* DeepSearch Button */}
            <button
              className="mr-2 px-3 py-1 rounded-full bg-[#23242b] border border-[#333] text-gray-200 text-sm font-medium hover:bg-[#23242b]/80 transition"
              type="button"
              aria-label="DeepSearch"
              tabIndex={-1}
            >DeepSearch</button>
            {/* Think Button */}
            <button
              className="mr-2 px-3 py-1 rounded-full bg-[#23242b] border border-[#333] text-gray-200 text-sm font-medium hover:bg-[#23242b]/80 transition"
              type="button"
              aria-label="Think"
              tabIndex={-1}
            >Think</button>
            {/* Input */}
            <input
              type="text"
              className="flex-1 bg-transparent outline-none text-white px-3 py-2 text-lg placeholder-gray-400"
              placeholder="What do you want to know?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
              disabled={loading}
              aria-label="Type your message"
              autoFocus
            />
            {/* Model Selector */}
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="ml-2 bg-[#23242b] text-gray-200 border border-[#333] rounded-lg px-2 py-1 text-sm focus:outline-none"
              aria-label="Select AI model"
            >
              {AI_MODELS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            {/* Send Button */}
            <button
              className="ml-2 p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              title="Send"
              aria-label="Send message"
              type="button"
            >
              <svg width="22" height="22" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

          {/* Extra Bar (Digest/Schedule) */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between mt-4 bg-[#23242b] rounded-xl px-4 py-2 border border-[#23242b] gap-2">
            <button className="text-gray-200 text-sm font-medium flex items-center gap-1" type="button" aria-label="Receive a Daily Tech Digest">
              Receive a Daily Tech Digest
              <svg width="16" height="16" fill="none" stroke="#aaa" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <button className="text-gray-200 text-sm font-medium flex items-center gap-1" type="button" aria-label="Schedule Task">
              <svg width="16" height="16" fill="none" stroke="#aaa" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              Schedule Task
            </button>
          </div>
        </div>
      </div>

      {/* Floating Upgrade Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-white text-black px-6 py-3 rounded-2xl shadow-lg font-semibold text-lg flex items-center gap-2 hover:bg-gray-100 transition" type="button" aria-label="Upgrade to SuperGrok">
          <span>SuperGrok</span>
          <span className="bg-black text-white rounded-xl px-3 py-1 text-sm">Upgrade</span>
        </button>
      </div>
    </div>
  );
} 