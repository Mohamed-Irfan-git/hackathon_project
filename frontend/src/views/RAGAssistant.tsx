import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage, RAGSource } from '../types';
import { api } from '../services/api';
import { AITag } from '../components/common/AITag';
import { Modal } from '../components/common/Modal';
import { Sparkles, Send, BookOpen, ExternalLink, RefreshCw } from 'lucide-react';

interface RAGAssistantProps {
  initialQuery?: string;
  learnerId?: string;
  onClearInitialQuery?: () => void;
}

export const RAGAssistant: React.FC<RAGAssistantProps> = ({
  initialQuery,
  learnerId,
  onClearInitialQuery,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Hello! I am your AI Opportunity Assistant. I am grounded directly in our verified knowledge base of Sri Lankan government scholarships, ICT diploma courses, free coding workshops, and industry placement programs.\n\nHow can I help your education journey today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState<RAGSource | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendQuery = useCallback(async (queryText: string) => {
    if (!queryText.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.askRAGAssistant(queryText, learnerId);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        sources: res.sources,
        cached: res.cached,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Apologies, we encountered an error while searching the verified knowledge base. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [learnerId, loading]);

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      // This request is intentionally initiated by a navigation handoff.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void handleSendQuery(initialQuery);
      onClearInitialQuery?.();
    }
  }, [initialQuery, handleSendQuery, onClearInitialQuery]);

  const samplePrompts = [
    "I'm an A/L student interested in ICT with a limited budget",
    'Show me government higher education scholarships for 2026',
    'Are there free full-stack web development workshops?',
    'What paid internships exist for computer science school leavers?',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-[#d9e3f6] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#fff7ed] text-[#ea580c] flex items-center justify-center border border-[#fea619]/40 ai-glow">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#121c2a] font-display">
                AI Opportunity RAG Assistant
              </h1>
              <AITag label="Grounded RAG" size="sm" />
            </div>
            <p className="text-xs text-[#6e797e]">
              Answers are generated only from verified knowledge-base citations. If the context is insufficient, the assistant says so.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setMessages([
              {
                id: 'msg-reset',
                sender: 'assistant',
                text: 'Chat reset. How can I assist your educational search?',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          className="p-2 text-[#6e797e] hover:text-[#121c2a] rounded-lg hover:bg-[#e6eeff]"
          title="Reset conversation"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 bg-white rounded-2xl border border-[#d9e3f6] shadow-xs p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm space-y-3 shadow-xs ${
                msg.sender === 'user'
                  ? 'bg-[#00647c] text-white rounded-tr-xs'
                  : 'bg-[#f8f9ff] text-[#121c2a] border border-[#d9e3f6] rounded-tl-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-1.5 mb-1.5">
                <span className="font-bold text-[11px] font-geist opacity-90">
                  {msg.sender === 'user' ? 'You' : 'Striver RAG Assistant'}
                </span>
                <span className="text-[10px] opacity-75 font-geist">{msg.timestamp}</span>
              </div>

              <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
              {msg.sender === 'assistant' && msg.cached && <span className="inline-flex rounded-full bg-[#e6eeff] px-2 py-0.5 text-[10px] font-semibold text-[#00647c]">Fast answer from verified cache</span>}
              {msg.sender === 'assistant' && msg.sources?.length === 0 && msg.text === 'No matching opportunities found in the verified knowledge base.' && <p className="text-[11px] text-[#6e797e]">No relevant verified source was found, so no answer was generated.</p>}

              {/* Source Citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-2 border-t border-[#d9e3f6] mt-2 space-y-1.5">
                  <span className="text-[10px] font-bold text-[#855300] font-geist uppercase tracking-wider block">
                    Verified Sources:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.sources.map((src) => (
                      <button
                        key={src.id}
                        type="button"
                        onClick={() => setSelectedSource(src)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#fff7ed] border border-[#fea619]/40 text-[#c2410c] text-[11px] font-medium font-geist hover:bg-[#ffedd5] transition-colors"
                      >
                        <BookOpen size={12} className="text-[#ea580c]" />
                        <span className="truncate max-w-[200px]">{src.title}</span>
                        <span className="uppercase text-[9px] px-1 bg-[#fea619]/20 rounded font-semibold">
                          {src.category}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#f8f9ff] border border-[#d9e3f6] p-4 rounded-2xl rounded-tl-xs flex items-center gap-2 text-xs text-[#6e797e]">
              <Sparkles size={16} className="text-[#ea580c] animate-spin" />
              <span>Querying verified vector database & generating answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts & Input Bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] font-semibold text-[#6e797e] font-geist shrink-0">
            Suggested:
          </span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendQuery(prompt)}
              className="px-3 py-1 bg-white border border-[#d9e3f6] hover:border-[#00647c] text-[#3e484d] hover:text-[#00647c] rounded-full text-xs font-medium shrink-0 transition-colors shadow-xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery(input);
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about scholarships, tuition, or career pathways..."
            className="flex-1 px-4 py-3 bg-white text-xs sm:text-sm rounded-xl border border-[#d9e3f6] focus:outline-none focus:border-[#00647c] focus:ring-1 focus:ring-[#00647c] shadow-xs"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-5 py-3 bg-[#00647c] hover:bg-[#004e61] disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs font-geist shrink-0"
          >
            <span>Send</span>
            <Send size={14} />
          </button>
        </form>
      </div>

      {/* Source Citation Modal */}
      {selectedSource && (
        <Modal
          isOpen={Boolean(selectedSource)}
          onClose={() => setSelectedSource(null)}
          title={`Verified Knowledge Base Entry`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#eff4ff] pb-2">
              <span className="uppercase text-xs font-bold px-2 py-0.5 rounded bg-[#fff7ed] text-[#c2410c] font-geist">
                Category: {selectedSource.category}
              </span>
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <Sparkles size={12} /> Verified Entry
              </span>
            </div>

            <h3 className="font-bold text-base text-[#121c2a] font-display">
              {selectedSource.title}
            </h3>

            <p className="text-xs text-[#3e484d] leading-relaxed">
              {selectedSource.snippet}
            </p>

            {selectedSource.source_url && (
              <div className="pt-2">
                <a
                  href={selectedSource.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#00647c] hover:underline"
                >
                  <span>Visit Official Source</span>
                  <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
