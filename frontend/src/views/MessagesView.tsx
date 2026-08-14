import React, { useState, useEffect, useRef } from 'react';
import type { Conversation, DirectMessage, UserRole } from '../types';
import { api } from '../services/api';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { parseYouTubeUrls, YouTubePreviewCard } from '../components/common/YouTubePreview';
import {
  MessageSquare,
  Send,
  Search,
  BookOpen,
  Clock,
  CheckCheck,
  RefreshCw,
  Sparkles,
  Inbox,
  ArrowLeft,
} from 'lucide-react';

interface MessagesViewProps {
  currentUserId: string;
  currentRole: UserRole;
  initialConversationId?: string | null;
  showToast?: (msg: string) => void;
  onOpenOpportunity?: (oppId: string) => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  currentUserId,
  currentRole,
  initialConversationId,
  showToast,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConversationId || null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async (keepActive = true) => {
    if (!currentUserId) return;
    try {
      const data = await api.getConversations(currentUserId);
      setConversations(data);
      if (data.length > 0 && (!activeConvId || !keepActive)) {
        setActiveConvId(data[0].id);
      }
    } catch (e) {
      console.error('Failed loading conversations', e);
    } finally {
      setIsLoadingConvs(false);
    }
  };

  const loadMessages = async (convId: string) => {
    setIsLoadingMsgs(true);
    try {
      const data = await api.getMessages(convId);
      setMessages(data);
      await api.markMessagesRead(convId, currentUserId);
      // Update unread count locally
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unread_count: 0 } : c))
      );
    } catch (e) {
      console.error('Failed loading messages', e);
    } finally {
      setIsLoadingMsgs(false);
    }
  };

  useEffect(() => {
    void loadConversations(true);
  }, [currentUserId]);

  useEffect(() => {
    if (initialConversationId) {
      setActiveConvId(initialConversationId);
      setMobileView('chat');
    }
  }, [initialConversationId]);

  useEffect(() => {
    if (!activeConvId) return;
    void loadMessages(activeConvId);

    // Setup realtime channel subscription for messages
    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel(`chat_${activeConvId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConvId}`,
        },
        (payload) => {
          const newMsg = payload.new as DirectMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (newMsg.sender_id !== currentUserId) {
            void api.markMessagesRead(activeConvId, currentUserId);
          }
        }
      )
      .subscribe();

    // Polling fallback every 2 seconds for ultra-fast sync
    const interval = setInterval(() => {
      void api.getMessages(activeConvId).then((data) => {
        setMessages((prev) => {
          if (data.length !== prev.length || JSON.stringify(data) !== JSON.stringify(prev)) {
            return data;
          }
          return prev;
        });
      });
      void api.getConversations(currentUserId).then((convs) => {
        setConversations(convs);
      });
    }, 2000);

    return () => {
      void supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [activeConvId, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent, contentOverride?: string) => {
    if (e) e.preventDefault();
    const textToSend = (contentOverride || newMessageText).trim();
    if (!textToSend || !activeConvId || isSending) return;

    // Optimistic local message
    const tempId = `temp-${Date.now()}`;
    const tempMsg: DirectMessage = {
      id: tempId,
      conversation_id: activeConvId,
      sender_id: currentUserId,
      content: textToSend,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    setNewMessageText('');
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? { ...c, last_message: textToSend, last_message_at: new Date().toISOString() }
          : c
      )
    );

    setIsSending(true);
    try {
      const sent = await api.sendMessage({
        conversationId: activeConvId,
        content: textToSend,
      });

      // Replace temp message with server response
      setMessages((prev) => prev.map((m) => (m.id === tempId ? sent : m)));
      void loadConversations(true);
    } catch (err) {
      // Revert optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      showToast?.(err instanceof Error ? err.message : 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const getOtherPartyName = (c: Conversation) => {
    if (currentUserId === c.learner_id) {
      return c.provider_name && c.provider_name !== 'Provider' ? c.provider_name : 'University Provider';
    }
    if (currentUserId === c.provider_id) {
      return c.learner_name && c.learner_name !== 'Learner' ? c.learner_name : 'Learner User';
    }
    const raw = currentRole === 'provider' ? c.learner_name : c.provider_name;
    if (raw === 'Provider') return 'University Provider';
    if (raw === 'Learner') return 'Learner User';
    return raw || 'University Provider';
  };

  const getOtherPartyRole = () => {
    return currentRole === 'provider' ? 'Learner' : 'University Provider';
  };

  const filteredConversations = conversations.filter((c) => {
    const name = getOtherPartyName(c).toLowerCase();
    const opp = (c.opportunity_title || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || opp.includes(q);
  });

  const quickReplies = [
    'Hi! Is this learning opportunity still available?',
    'When would be a good time to schedule our session?',
    'Could you please share more details about the curriculum?',
    'Thank you so much! Looking forward to learning.',
  ];

  return (
    <div className="h-[calc(100vh-7.5rem)] flex flex-col bg-white rounded-2xl border border-[#d9e3f6] shadow-sm overflow-hidden">
      {/* Top Header Bar */}
      <div className="px-6 py-4 bg-[#f8f9ff] border-b border-[#d9e3f6] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#e6eeff] text-[#00647c] rounded-xl border border-[#d9e3f6]">
            <MessageSquare size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#121c2a] font-display">Messages & Inquiry Hub</h1>
            <p className="text-xs text-[#6e797e]">
              Direct communication between university providers and learners
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void loadConversations(true)}
          className="p-2 text-[#6e797e] hover:text-[#00647c] hover:bg-white rounded-lg border border-transparent hover:border-[#d9e3f6] transition-all text-xs flex items-center gap-1.5 font-medium"
        >
          <RefreshCw size={14} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: Conversation List */}
        <div
          className={`w-full lg:w-[360px] border-r border-[#d9e3f6] bg-[#fdfeff] flex flex-col shrink-0 ${
            mobileView === 'chat' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Search Box */}
          <div className="p-3.5 border-b border-[#d9e3f6] bg-white">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-2.5 text-[#6e797e]" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#f8f9ff] border border-[#d9e3f6] rounded-xl text-[#121c2a] placeholder-[#6e797e] focus:outline-none focus:border-[#00647c] focus:bg-white transition-all font-geist"
              />
            </div>
          </div>

          {/* Conversations Scroll View */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#eff4ff]">
            {isLoadingConvs ? (
              <div className="p-8 text-center text-xs text-[#6e797e] flex flex-col items-center gap-2">
                <RefreshCw size={20} className="animate-spin text-[#00647c]" />
                Loading your conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6e797e] flex flex-col items-center gap-2">
                <Inbox size={32} className="text-[#a0aec0]" />
                <p className="font-semibold text-[#121c2a]">No conversations found</p>
                <p className="text-[11px] text-[#6e797e] max-w-[200px]">
                  Send a message on an opportunity card or booking request to start chatting!
                </p>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = c.id === activeConvId;
                const name = getOtherPartyName(c);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setActiveConvId(c.id);
                      setMobileView('chat');
                    }}
                    className={`w-full p-4 text-left transition-all flex items-start gap-3 hover:bg-[#e6eeff]/60 relative ${
                      isActive ? 'bg-[#e6eeff] border-l-4 border-l-[#00647c]' : 'bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00647c] to-[#004e61] text-white flex items-center justify-center text-sm font-bold shrink-0 font-display shadow-xs">
                      {name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-[#121c2a] truncate font-display">
                          {name}
                        </span>
                        {c.last_message_at && (
                          <span className="text-[10px] text-[#6e797e] shrink-0 font-geist">
                            {new Date(c.last_message_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>

                      {c.opportunity_title && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-[#00647c] mb-1 truncate">
                          <BookOpen size={11} className="shrink-0" />
                          <span className="truncate">{c.opportunity_title}</span>
                        </div>
                      )}

                      <p className="text-xs text-[#6e797e] truncate font-geist">
                        {c.last_message || 'No messages yet'}
                      </p>
                    </div>

                    {Boolean(c.unread_count && c.unread_count > 0) && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#ea580c] text-white shrink-0 font-geist shadow-xs">
                        {c.unread_count}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Active Chat Area */}
        <div
          className={`flex-1 flex flex-col bg-[#fdfeff] ${
            mobileView === 'list' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {activeConv ? (
            <>
              {/* Chat Panel Header */}
              <div className="px-5 py-3.5 bg-white border-b border-[#d9e3f6] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMobileView('list')}
                    className="lg:hidden p-1.5 text-[#6e797e] hover:text-[#121c2a]"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00647c] to-[#004e61] text-white flex items-center justify-center text-xs font-bold font-display">
                    {getOtherPartyName(activeConv).substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-[#121c2a] font-display">
                        {getOtherPartyName(activeConv)}
                      </h2>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#e6eeff] text-[#00647c] font-geist uppercase tracking-wider">
                        {getOtherPartyRole()}
                      </span>
                    </div>
                    {activeConv.opportunity_title && (
                      <p className="text-xs text-[#00647c] font-medium flex items-center gap-1">
                        <BookOpen size={12} />
                        <span>Regarding: {activeConv.opportunity_title}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat Message Scroll */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#f8f9ff]/50">
                {isLoadingMsgs ? (
                  <div className="h-full flex items-center justify-center text-xs text-[#6e797e] gap-2">
                    <RefreshCw size={18} className="animate-spin text-[#00647c]" />
                    Loading message history...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-[#e6eeff] text-[#00647c] flex items-center justify-center">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#121c2a]">Start the Conversation</p>
                      <p className="text-xs text-[#6e797e] mt-1 max-w-sm">
                        Ask questions about class schedules, delivery modes, or syllabus expectations!
                      </p>
                    </div>
                    {/* Quick Starters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md w-full pt-2">
                      {quickReplies.map((starter, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => void handleSendMessage(undefined, starter)}
                          className="p-2.5 text-left text-xs bg-white border border-[#d9e3f6] hover:border-[#00647c] hover:bg-[#e6eeff]/40 rounded-xl text-[#3e484d] transition-all font-geist shadow-xs"
                        >
                          "{starter}"
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === currentUserId;
                    const { videoIds } = parseYouTubeUrls(msg.content);
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed font-geist ${
                            isMe
                              ? 'bg-[#00647c] text-white rounded-br-xs shadow-xs'
                              : 'bg-white border border-[#d9e3f6] text-[#121c2a] rounded-bl-xs shadow-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap font-sans text-xs">{msg.content}</p>
                          {videoIds.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {videoIds.map((vid) => (
                                <YouTubePreviewCard
                                  key={vid}
                                  url={`https://www.youtube.com/watch?v=${vid}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-[#6e797e] px-1 font-geist">
                          <Clock size={10} />
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {isMe && (
                            <CheckCheck
                              size={12}
                              className={msg.is_read ? 'text-[#00647c]' : 'text-[#6e797e]'}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer Footer */}
              <form
                onSubmit={(e) => void handleSendMessage(e)}
                className="p-3.5 bg-white border-t border-[#d9e3f6] flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder={`Write a message to ${getOtherPartyName(activeConv)}...`}
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  disabled={isSending}
                  className="flex-1 px-4 py-2.5 text-xs bg-[#f8f9ff] border border-[#d9e3f6] rounded-xl text-[#121c2a] placeholder-[#6e797e] focus:outline-none focus:border-[#00647c] focus:bg-white transition-all font-geist"
                />
                <button
                  type="submit"
                  disabled={isSending || !newMessageText.trim()}
                  className="px-4 py-2.5 bg-[#00647c] hover:bg-[#004e61] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs shrink-0"
                >
                  <Send size={14} />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center text-[#6e797e] space-y-3">
              <MessageSquare size={48} className="text-[#a0aec0]" />
              <h3 className="text-base font-bold text-[#121c2a]">Select a conversation</h3>
              <p className="text-xs text-[#6e797e] max-w-xs">
                Choose an existing chat from the left panel or initiate a new inquiry from any opportunity card.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
