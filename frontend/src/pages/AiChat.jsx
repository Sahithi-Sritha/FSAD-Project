import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import api from '../services/api';
import { FiSend, FiTrash2, FiCpu, FiWifiOff, FiZap } from 'react-icons/fi';

const SUGGESTED_PROMPTS = [
  '🍛 Healthy Indian breakfast ideas',
  '💪 High protein vegetarian meals',
  '🔥 How to reduce belly fat with diet?',
  '🥗 Low calorie dinner recipes',
  '📊 Explain macronutrients simply',
  '🫘 Best iron-rich Indian foods',
];

export default function AiChat({ user, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [ollamaOnline, setOllamaOnline] = useState(null);
  const chatEnd = useRef(null);
  const inputRef = useRef(null);

  /* Check Ollama status */
  useEffect(() => {
    api.get('/api/ai/status')
      .then((res) => setOllamaOnline(res.data?.available ?? false))
      .catch(() => setOllamaOnline(false));
  }, []);

  /* Auto-scroll */
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || sending) return;
    setInput('');

    const userMsg = { role: 'user', content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    try {
      const conversationContext = [...messages.slice(-10), userMsg]
        .map((m) => `${m.role === 'user' ? 'User' : 'NutriBot'}: ${m.content}`)
        .join('\n');

      const res = await api.post('/api/ai/chat', {
        message: msg,
        userId: user.id,
        conversationContext,
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data?.response || res.data?.message || 'No response.' },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ Sorry, I couldn\'t connect. Make sure Ollama is running.' },
      ]);
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="flex flex-col h-[calc(100vh-6rem)] lg:h-[calc(100vh-4rem)]">
        {/* ── Header ──────────────────────────────── */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center shadow-glow-sm">
              <FiCpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">NutriBot AI</h1>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${ollamaOnline ? 'bg-emerald-500' : ollamaOnline === false ? 'bg-rose-500' : 'bg-amber-500'} animate-pulse`} />
                <span className="text-[11px] text-slate-400">
                  {ollamaOnline ? 'Online' : ollamaOnline === false ? 'Offline' : 'Checking…'}
                </span>
              </div>
            </div>
          </div>
          {messages.length > 0 && (
            <button onClick={clearChat} className="btn-ghost text-xs text-slate-400 hover:text-rose-500">
              <FiTrash2 className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        {/* ── Offline banner ──────────────────────── */}
        {ollamaOnline === false && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/50 dark:border-amber-500/20 flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs flex-shrink-0"
          >
            <FiWifiOff className="w-4 h-4" />
            <span>Ollama is offline. Start it with <code className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 font-mono text-[11px]">ollama serve</code> and pull model <code className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 font-mono text-[11px]">llama3.2:1b</code></span>
          </motion.div>
        )}

        {/* ── Chat Area ───────────────────────────── */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4">
          {messages.length === 0 && !sending && (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/10 to-purple-500/10 flex items-center justify-center mb-4">
                <FiZap className="w-7 h-7 text-brand-500" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Ask me anything about nutrition</h3>
              <p className="text-xs text-slate-400 mb-6 text-center max-w-sm">
                I can help with meal planning, nutrient info, Indian food suggestions, and dietary advice.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="text-left px-4 py-3 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-sm transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`
                    max-w-[80%] px-4 py-3 text-sm leading-relaxed
                    ${msg.role === 'user'
                      ? 'chat-bubble-user bg-gradient-to-r from-brand-600 to-purple-600 text-white'
                      : 'chat-bubble-ai glass-card text-slate-700 dark:text-slate-200'}
                  `}
                >
                  <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {sending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="chat-bubble-ai glass-card px-5 py-3.5 flex items-center gap-1.5 text-brand-500">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </motion.div>
          )}

          <div ref={chatEnd} />
        </div>

        {/* ── Input ───────────────────────────────── */}
        <div className="flex-shrink-0">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about nutrition, meals, or health…"
              className="flex-1 input-glass py-3.5"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="btn-primary px-5 py-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FiSend className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
