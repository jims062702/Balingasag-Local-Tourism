import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Clock,
  Phone,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  ChatMessage,
  sendGeminiChatMessage,
  checkSpamViolation,
  getSpamState,
} from '../services/geminiService';

// Basic FAQ Questions (Instant 0-token answers to save tokens)
const BASIC_QUESTIONS = [
  'Emergency hotlines',
  'Top tourism spots',
  'Tell me about Camuayan Cold Springs',
  'Where is Vega Ancestral House?',
  'How to get to Balingasag',
  'Town fiesta & festival',
  'Who developed this website?',
];

// Dynamic callout messages cycling next to the chatbot icon
const CALLOUT_MESSAGES = [
  'Hi! I am the barangay chatbot.',
  'Need help exploring Balingasag?',
  'Ask me about Camuayan Cold Springs!',
  'Looking for 200-year-old heritage homes?',
  '24/7 Emergency hotlines available.',
  'Discover spots in all 30 barangays!',
];

/**
 * Helper to render markdown bold, phone numbers, links, and bullets cleanly.
 */
const renderFormattedLine = (line: string, keyPrefix: string, isUser: boolean) => {
  const tokenRegex =
    /(\*\*[^*]+\*\*|https?:\/\/[^\s]+|jamesgdev\.vercel\.app|\b09\d{2}[-\s]?\d{3}[-\s]?\d{4}\b|\b\(\d{3}\)\s?\d{3}[-\s]?\d{4}\b)/g;

  const tokens = line.split(tokenRegex);

  return tokens.map((token, i) => {
    if (!token) return null;

    // Bold text: **text**
    if (token.startsWith('**') && token.endsWith('**')) {
      const boldText = token.slice(2, -2);
      return (
        <strong
          key={`${keyPrefix}-${i}`}
          className={isUser ? 'font-black text-white' : 'font-extrabold text-slate-900'}
        >
          {boldText}
        </strong>
      );
    }

    // Portfolio link
    if (token === 'https://jamesgdev.vercel.app' || token === 'jamesgdev.vercel.app') {
      return (
        <a
          key={`${keyPrefix}-${i}`}
          href="https://jamesgdev.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className={`underline font-bold transition-opacity hover:opacity-80 ${
            isUser ? 'text-white' : 'text-blue-600 hover:text-blue-700'
          }`}
        >
          jamesgdev.vercel.app ↗
        </a>
      );
    }

    // Other URLs
    if (token.startsWith('http://') || token.startsWith('https://')) {
      return (
        <a
          key={`${keyPrefix}-${i}`}
          href={token}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline font-semibold break-all ${isUser ? 'text-white' : 'text-blue-600'}`}
        >
          {token}
        </a>
      );
    }

    // Phone numbers (e.g. 0975-691-0090, 0998-598-6948)
    if (/^(09\d{2}[-\s]?\d{3}[-\s]?\d{4}|\(\d{3}\)\s?\d{3}[-\s]?\d{4})$/.test(token.trim())) {
      const rawNumber = token.replace(/[^\d+]/g, '');
      return (
        <a
          key={`${keyPrefix}-${i}`}
          href={`tel:${rawNumber}`}
          className={`inline-flex items-center gap-1 font-mono font-bold px-1.5 py-0.5 rounded transition-colors text-[11px] ${
            isUser
              ? 'bg-blue-700 text-white hover:bg-blue-800'
              : 'bg-blue-100 text-blue-900 border border-blue-300 hover:bg-blue-200'
          }`}
        >
          <Phone className="w-2.5 h-2.5 shrink-0" />
          <span>{token}</span>
        </a>
      );
    }

    return <span key={`${keyPrefix}-${i}`}>{token}</span>;
  });
};

/**
 * Arranges chatbot messages into structured paragraphs, cards, and bullet lists
 */
const FormattedChatMessage: React.FC<{ text: string; isUser: boolean }> = ({ text, isUser }) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];

  const flushList = (listIndex: number) => {
    if (currentList.length === 0) return;
    elements.push(
      <ul
        key={`list-${listIndex}`}
        className={`my-2 space-y-1.5 pl-1 rounded-xl p-2 border ${
          isUser
            ? 'bg-blue-700/50 border-blue-500/30 text-white'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}
      >
        {currentList.map((item, itemIdx) => (
          <li key={itemIdx} className="flex items-start gap-2">
            <span
              className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                isUser ? 'bg-white' : 'bg-blue-600'
              }`}
            />
            <span className="flex-1 leading-relaxed text-xs">
              {renderFormattedLine(item, `li-${listIndex}-${itemIdx}`, isUser)}
            </span>
          </li>
        ))}
      </ul>
    );
    currentList = [];
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const content = trimmed.replace(/^[\*\-\•]\s+/, '');
      currentList.push(content);
    } else {
      flushList(lineIdx);
      if (trimmed) {
        elements.push(
          <p key={`p-${lineIdx}`} className="leading-relaxed my-1">
            {renderFormattedLine(trimmed, `p-${lineIdx}`, isUser)}
          </p>
        );
      }
    }
  });

  flushList(lines.length);

  return <div className="space-y-1">{elements}</div>;
};

export const TourismChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [offenseCount, setOffenseCount] = useState(0);

  // Callout speech bubble animation states (typing/thinking & changing text)
  const [bubblePhase, setBubblePhase] = useState<'thinking' | 'text'>('text');
  const [messageIndex, setMessageIndex] = useState(0);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      role: 'model',
      text: 'Maayong adlaw! Welcome to Balingasag. I am your AI Tourism Guide. Feel free to click any basic question below for instant guidance, or ask me directly!',
      timestamp: Date.now(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Thinking / typing animation cycle for callout speech bubble
  useEffect(() => {
    if (isOpen) return;

    let timer: ReturnType<typeof setTimeout>;

    if (bubblePhase === 'text') {
      timer = setTimeout(() => {
        setBubblePhase('thinking');
      }, 5500);
    } else {
      timer = setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % CALLOUT_MESSAGES.length);
        setBubblePhase('text');
      }, 1600);
    }

    return () => clearTimeout(timer);
  }, [bubblePhase, isOpen]);

  // Check cooldown buffer on mount & interval
  useEffect(() => {
    const updateCooldown = () => {
      const state = getSpamState();
      setOffenseCount(state.offenses);
      const diff = state.blockedUntil - Date.now();
      if (diff > 0) {
        setCooldownRemaining(Math.ceil(diff / 1000));
      } else {
        setCooldownRemaining(0);
      }
    };

    updateCooldown();
    const timer = setInterval(updateCooldown, 1000);
    return () => clearInterval(timer);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    if (query.length > 255) {
      toast.error('Message exceeds maximum 255 characters limit.');
      return;
    }

    // 1. Spam check
    const spamCheck = checkSpamViolation(query);
    if (spamCheck.isSpam) {
      toast.error(spamCheck.reason || 'Anti-spam buffer triggered.', {
        icon: '⚠️',
      });
      const state = getSpamState();
      setOffenseCount(state.offenses);
      setCooldownRemaining(Math.ceil((state.blockedUntil - Date.now()) / 1000));
      return;
    }

    // 2. Add user message
    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const botReply = await sendGeminiChatMessage(query, messages);
      const botMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        role: 'model',
        text: botReply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      toast.error('Unable to reach AI server. Please try again shortly.');
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          role: 'model',
          text: 'Excuse me, our connection to the tourism server is experiencing a momentary pause. Please feel free to ask again in a moment!',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome_reset',
        role: 'model',
        text: 'Conversation reset. Welcome to Balingasag! How may I assist your travel plans today?',
        timestamp: Date.now(),
      },
    ]);
    toast.success('Chat history cleared');
  };

  const formatCooldown = (seconds: number) => {
    if (seconds >= 3600) {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return `${hrs}h ${mins}m`;
    }
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}m ${secs}s`;
    }
    return `${seconds}s`;
  };

  return (
    <>
      {/* Floating Action Button (Positioned at bottom-4 right-4 on mobile, bottom-6 right-6 on desktop) */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 sm:gap-3">
        {/* Dynamic Animated Speech Bubble with Active Typing Indicator & Callout Tips (Responsive on Mobile POV) */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.85, x: 10 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsOpen(true)}
              className="cursor-pointer select-none flex items-center"
            >
              <div className="relative bg-[#0F172A] text-white px-3 sm:px-4 py-1.5 sm:py-2.5 rounded-2xl border border-slate-700/80 shadow-2xl flex items-center min-h-[36px] sm:min-h-[44px] max-w-[170px] sm:max-w-[280px]">
                {/* Speech Bubble Tail pointing right towards the icon */}
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-l-[8px] border-l-[#0F172A]" />

                {bubblePhase === 'thinking' ? (
                  <div className="flex items-center gap-1.5 px-2 py-0.5">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                ) : (
                  <p className="text-[11px] sm:text-xs font-semibold text-white tracking-tight leading-snug truncate">
                    {CALLOUT_MESSAGES[messageIndex]}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Circular Chatbot Button (Matches ScrollToTop Outer Dimensions Exactly: w-12 h-12 on mobile, w-14 h-14 on desktop) */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          title="Balingasag AI Tourism Guide"
          aria-label="Toggle Tourism Chatbot"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white shadow-2xl border-2 border-blue-300/40 flex items-center justify-center group focus:outline-none shrink-0 relative"
        >
          {/* Glowing pulse ring */}
          <span className="absolute inset-0 rounded-full bg-blue-400 opacity-25 animate-ping pointer-events-none" />

          {/* Modern Bot Icon */}
          <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[2.2] group-hover:scale-110 transition-transform" />
        </motion.button>
      </div>

      {/* Chat Window Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[94vw] sm:w-[390px] md:w-[420px] h-[550px] max-h-[84vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Header (Midnight Slate + Royal Blue Accents) */}
            <div className="bg-slate-950 p-4 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-black tracking-tight text-white">
                      Balingasag AI Guide
                    </h3>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-500/30 font-bold">
                      Gemini 3.5
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Official Local Tourism Assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearChat}
                  title="Clear conversation"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages Stream with Structured Markdown Rendering */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60 text-xs">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs ${
                        isUser ? 'bg-blue-600' : 'bg-slate-900'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-blue-400" />}
                    </div>

                    <div
                      className={`max-w-[82%] p-3.5 rounded-2xl leading-relaxed ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs'
                      }`}
                    >
                      <FormattedChatMessage text={msg.text} isUser={isUser} />
                    </div>
                  </div>
                );
              })}

              {/* Bot Typing Indicator */}
              {loading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center text-blue-400 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 rounded-tl-xs flex items-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Basic FAQ Questions Chips (Token Saver & Instant Answers) */}
            <div className="p-2.5 bg-slate-100/90 border-t border-slate-200 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
                {BASIC_QUESTIONS.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(sug)}
                    disabled={cooldownRemaining > 0}
                    className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-200/90 hover:border-blue-300 transition-all shrink-0 font-medium disabled:opacity-50 shadow-2xs"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar: Buffer Countdown Displayed Directly in the Input Field */}
            <div className="p-3 bg-white border-t border-slate-200 space-y-1.5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    maxLength={255}
                    value={
                      cooldownRemaining > 0
                        ? `Buffer active: wait ${formatCooldown(cooldownRemaining)}...`
                        : input
                    }
                    disabled={cooldownRemaining > 0 || loading}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      cooldownRemaining > 0
                        ? `Locked for ${formatCooldown(cooldownRemaining)}...`
                        : 'Ask about Balingasag'
                    }
                    className={`w-full py-2.5 pl-3.5 pr-20 rounded-2xl text-xs border focus:outline-none transition-all ${
                      cooldownRemaining > 0
                        ? 'border-blue-400 bg-blue-50/80 text-blue-950 font-semibold cursor-not-allowed select-none shadow-inner'
                        : input.length >= 250
                        ? 'bg-slate-50 border-blue-400 focus:border-blue-500 text-slate-800'
                        : 'bg-slate-50 border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-500 text-slate-800'
                    }`}
                  />

                  {/* Right pill: Buffer countdown when active, or character counter */}
                  {cooldownRemaining > 0 ? (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-0.5 rounded-xl bg-blue-600 text-white font-mono font-black text-[11px] shadow-sm animate-pulse flex items-center gap-1 pointer-events-none">
                      <Clock className="w-3 h-3 animate-spin [animation-duration:3s]" />
                      <span>{formatCooldown(cooldownRemaining)}</span>
                    </span>
                  ) : (
                    <span
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono pointer-events-none ${
                        input.length >= 255
                          ? 'text-blue-700 font-bold'
                          : input.length >= 220
                          ? 'text-blue-600 font-bold'
                          : 'text-slate-400'
                      }`}
                    >
                      {input.length}/255
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!input.trim() || cooldownRemaining > 0 || loading}
                  className="p-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:hover:bg-blue-600 transition-all shadow-sm shrink-0"
                  title="Send question"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* Anti-spam rule note */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
