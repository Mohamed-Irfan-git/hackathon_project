import React, { useState, useEffect, useRef } from 'react';
import type { Conversation, DirectMessage } from '../../types';
import { api } from '../../services/api';
import { Modal } from './Modal';
import { parseYouTubeUrls, YouTubePreviewCard } from './YouTubePreview';
import { Send, Clock, CheckCheck, RefreshCw, BookOpen } from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  learnerId: string;
  providerId: string;
  recipientName: string;
  opportunityTitle?: string;
  opportunityId?: string;
  bookingId?: string;
  showToast?: (msg: string) => void;
  onGoToFullChat?: (convId: string) => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  learnerId,
  providerId,
  recipientName,
  opportunityTitle,
  opportunityId,
  bookingId,
  showToast,
  onGoToFullChat,
}) => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !currentUserId || !learnerId || !providerId) return;

    let isMounted = true;
    setIsLoading(true);

    const initChat = async () => {
      try {
        const conv = await api.getOrCreateConversation(
          learnerId,
          providerId,
          opportunityId,
          bookingId
        );
        if (!isMounted) return;
        setConversation(conv);
        const msgs = await api.getMessages(conv.id);
        if (!isMounted) return;
        setMessages(msgs);
        await api.markMessagesRead(conv.id, currentUserId);
      } catch (err) {
        console.error('Failed initializing quick chat:', err);
        showToast?.('Unable to load chat messages.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void initChat();

    return () => {
      isMounted = false;
    };
  }, [isOpen, currentUserId, learnerId, providerId, opportunityId, bookingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent, textOverride?: string) => {
    if (e) e.preventDefault();
    const content = (textOverride || text).trim();
    if (!content || isSending) return;

    // Optimistic message creation
    const tempId = `temp-${Date.now()}`;
    const tempMsg: DirectMessage = {
      id: tempId,
      conversation_id: conversation?.id || '',
      sender_id: currentUserId,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMsg]);
    setText('');
    setIsSending(true);

    try {
      let convId = conversation?.id;
      if (!convId) {
        const conv = await api.getOrCreateConversation(
          learnerId,
          providerId,
          opportunityId,
          bookingId
        );
        setConversation(conv);
        convId = conv.id;
      }

      const sent = await api.sendMessage({
        conversationId: convId,
        recipientId: currentUserId === learnerId ? providerId : learnerId,
        opportunityId,
        bookingId,
        content,
      });

      setMessages((prev) => prev.map((m) => (m.id === tempId ? sent : m)));
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      showToast?.(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const quickOptions = [
    'Is this session still open for enrollment?',
    'What days/times work best for classes?',
    'Can you tell me more about syllabus coverage?',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chat with ${recipientName}`}
      maxWidth="md"
    >
      <div className="flex flex-col h-[480px]">
        {/* Context Banner */}
        {opportunityTitle && (
          <div className="p-3 bg-[#e6eeff] border border-[#d9e3f6] rounded-xl mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 text-xs font-semibold text-[#00647c]">
              <BookOpen size={14} className="shrink-0" />
              <span className="truncate">Opportunity: {opportunityTitle}</span>
            </div>
            {conversation && onGoToFullChat && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoToFullChat(conversation.id);
                }}
                className="text-[11px] text-[#00647c] underline hover:text-[#004e61] font-semibold shrink-0"
              >
                Full Chat
              </button>
            )}
          </div>
        )}

        {/* Message Log */}
        <div className="flex-1 p-4 bg-[#f8f9ff] border border-[#d9e3f6] rounded-xl overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-xs text-[#6e797e] gap-2">
              <RefreshCw size={16} className="animate-spin text-[#00647c]" />
              Loading chat...
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <p className="text-xs font-bold text-[#121c2a] mb-1">Start a Conversation</p>
              <p className="text-[11px] text-[#6e797e] mb-3">
                Send a quick inquiry message to {recipientName}.
              </p>
              <div className="space-y-1.5 w-full max-w-xs">
                {quickOptions.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => void handleSend(undefined, opt)}
                    className="w-full p-2 text-left text-[11px] bg-white border border-[#d9e3f6] hover:border-[#00647c] hover:bg-[#e6eeff]/50 rounded-lg text-[#3e484d] transition-all font-geist"
                  >
                    "{opt}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.sender_id === currentUserId;
              const { videoIds } = parseYouTubeUrls(m.content);
              return (
                <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs font-geist ${
                      isMe
                        ? 'bg-[#00647c] text-white rounded-br-xs'
                        : 'bg-white border border-[#d9e3f6] text-[#121c2a] rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
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
                  <div className="flex items-center gap-1 mt-0.5 text-[10px] text-[#6e797e] px-1 font-geist">
                    <Clock size={10} />
                    <span>
                      {new Date(m.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isMe && (
                      <CheckCheck
                        size={12}
                        className={m.is_read ? 'text-[#00647c]' : 'text-[#6e797e]'}
                      />
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => void handleSend(e)}
          className="mt-3 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isSending}
            className="flex-1 px-3.5 py-2 text-xs bg-[#f8f9ff] border border-[#d9e3f6] rounded-xl text-[#121c2a] placeholder-[#6e797e] focus:outline-none focus:border-[#00647c] focus:bg-white transition-all font-geist"
          />
          <button
            type="submit"
            disabled={isSending || !text.trim()}
            className="px-4 py-2 bg-[#00647c] hover:bg-[#004e61] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs shrink-0"
          >
            <Send size={14} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </Modal>
  );
};
