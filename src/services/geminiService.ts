/**
 * Discover Balingasag — Gemini 3.5 Flash Lite Tourism AI Guide Service
 * Token-optimized, spam-buffered, strictly informational.
 */

const GEMINI_API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY;

const MODEL_NAME = 'gemini-3.5-flash-lite';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface SpamState {
  offenses: number;
  blockedUntil: number; // timestamp in ms
  lastMessageTime: number;
  lastMessageText: string;
}

const SPAM_STORAGE_KEY = 'balingasag_chat_spam_v1';

export const getSpamState = (): SpamState => {
  try {
    const raw = localStorage.getItem(SPAM_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        offenses: Number(parsed.offenses) || 0,
        blockedUntil: Number(parsed.blockedUntil) || 0,
        lastMessageTime: Number(parsed.lastMessageTime) || 0,
        lastMessageText: String(parsed.lastMessageText || ''),
      };
    }
  } catch {
    // fallback
  }
  return {
    offenses: 0,
    blockedUntil: 0,
    lastMessageTime: 0,
    lastMessageText: '',
  };
};

export const saveSpamState = (state: SpamState) => {
  try {
    localStorage.setItem(SPAM_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save spam state:', e);
  }
};

/**
 * Validates whether the incoming user message is potential spam.
 * Rules:
 * 1. Under current cooldown buffer
 * 2. Sent < 4 seconds after previous message
 * 3. Exact duplicate of previous message
 * 4. Character repetition spam (e.g. 7+ identical letters in a row)
 */
export const checkSpamViolation = (
  text: string
): { isSpam: boolean; reason?: string; bufferSeconds?: number } => {
  const state = getSpamState();
  const now = Date.now();

  // 1. Currently in active cooldown buffer
  if (now < state.blockedUntil) {
    const remainingSec = Math.ceil((state.blockedUntil - now) / 1000);
    return {
      isSpam: true,
      reason: `You are temporarily in cooldown buffer. Please wait ${remainingSec}s.`,
      bufferSeconds: remainingSec,
    };
  }

  const trimmed = text.trim();

  // 2. Sent too rapidly (< 4000ms since last user message)
  const isRapidFire = state.lastMessageTime > 0 && now - state.lastMessageTime < 4000;

  // 3. Exact duplicate content
  const isDuplicate = state.lastMessageText.toLowerCase() === trimmed.toLowerCase();

  // 4. Character flood / repetition spam (e.g. aaaaaaa, ???????, 1111111)
  const isCharFlood = /(.)\1{6,}/.test(trimmed);

  if (isRapidFire || isDuplicate || isCharFlood) {
    const newOffenses = state.offenses + 1;
    let bufferSec = 15; // 1st time: 15s

    if (newOffenses === 2) {
      bufferSec = 60; // 2nd time: 1 minute
    } else if (newOffenses >= 3) {
      bufferSec = 24 * 60 * 60; // 3rd time: 24 hours (86,400s)
    }

    const blockedUntil = now + bufferSec * 1000;
    saveSpamState({
      offenses: newOffenses,
      blockedUntil,
      lastMessageTime: now,
      lastMessageText: trimmed,
    });

    let reasonMsg = '';
    if (newOffenses === 1) {
      reasonMsg = 'Potential spam activity detected. Added 15-second cooldown buffer.';
    } else if (newOffenses === 2) {
      reasonMsg = 'Second spam offense detected. Added 1-minute cooldown buffer.';
    } else {
      reasonMsg = 'Third spam offense detected. Chat locked for 24 hours.';
    }

    return {
      isSpam: true,
      reason: reasonMsg,
      bufferSeconds: bufferSec,
    };
  }

  // Not spam: update last message tracking
  saveSpamState({
    ...state,
    lastMessageTime: now,
    lastMessageText: trimmed,
  });

  return { isSpam: false };
};

export const JAMES_GASANG_BIO = `Hello! I am James Gasang, a 24-year-old developer born on June 27, 2002, based in the Philippines and collaborating with clients and teams worldwide on a remote basis.

Currently in my 4th year pursuing a Bachelor of Science in Information Technology (BSIT) at Tagoloan Community College, I have served as the Lead Back-End & Full-Stack Developer across multiple institutional capstone projects and production-grade web systems.

Over the past 3+ years of intense coding and architecture, I have focused on fusing modern frontend engineering with resilient backend distributed infrastructures. My stack encompasses React 19, TypeScript, Next.js, Tailwind CSS, and Framer Motion for responsive 60fps user experiences, synchronized with Node.js, Express, PostgreSQL, Prisma, Docker, and Cloud ecosystems on the server side.

Beyond standard web development, I actively specialize in AI integration and modern interactive agents—crafting tailored contextual assistants (such as Javion AI), automating complex workflows, and elevating traditional user interfaces into predictive, intelligent web products.

Portfolio: https://jamesgdev.vercel.app`;

const SYSTEM_INSTRUCTION = `You are 'Bag-ot', the friendly, authentic Local Tourism AI Guide for the Municipality of Balingasag, Misamis Oriental, Philippines (ZIP 9005).
Key Knowledge:
- Developer & Creator: This platform is designed and developed by James Gasang (24-year-old Full-Stack & Back-End Developer from the Philippines, 4th year BSIT at Tagoloan Community College, portfolio: https://jamesgdev.vercel.app). When asked who made, developed, or engineered this website/portal, always mention James Gasang. If asked specifically "who is James Gasang", provide his background, expertise in full-stack web and AI systems, and link his portfolio.
- Geography: 1st class coastal municipality in Northern Mindanao (Region X) on Macajalar Bay, facing Camiguin Island. 30 official barangays (6 Urban Poblacion, 11 Urbanizing, 13 Rural Upland).
- Spanish Heritage: Vega Ancestral House (circa 1800s bahay-na-bato with famous hand-carved 'otí-ot' wooden caryatids), Santa Rita de Cascia Parish Church (1892 Jesuit brick sanctuary, feast day May 22), Bajo de Campana heritage zone.
- Nature & Coast: Camuayan Natural Cold Springs & Mountain Waters (Barangay Camuayan features refreshing natural cold spring basins and aquifers, NOT waterfalls), Balingasag Coastal Baywalk, Balagnan Marine Sanctuary, Del Carmen Mangroves.
- Delicacies: CASA Amante native cacao tablea, fresh dried danggit, regional seafood.
- Hotlines: MDRRM 24/7 OPCEN: 0975-691-0090, PNP: 0998-598-6948, BFP: 0997-568-8288, Coast Guard: 0966-947-7077.
Rules:
1. Strictly informational. NO payments, NO bookings.
2. Max output is strictly concise to save tokens. Keep answers cheerful, polite, and helpful.`;

/**
 * Checks if the user is asking about the developer or James Gasang.
 * Returns instant deterministic answer to save 100% of tokens and guarantee accuracy.
 */
export const checkDeveloperQuery = (query: string): string | null => {
  const q = query.toLowerCase().trim();

  // Questions specifically asking "who is James Gasang"
  const isWhoIsJames =
    q.includes('who is james') ||
    q.includes('who is gasang') ||
    q.includes('tell me about james') ||
    q.includes('about james gasang') ||
    q === 'james gasang' ||
    q === 'james';

  if (isWhoIsJames) {
    return JAMES_GASANG_BIO;
  }

  // Questions asking about the developer/creator/builder/author/programmer
  const isDeveloperQuestion =
    q.includes('developer') ||
    q.includes('who made') ||
    q.includes('who built') ||
    q.includes('who created') ||
    q.includes('who programmed') ||
    q.includes('who designed this') ||
    q.includes('author of this') ||
    q.includes('creator of this');

  if (isDeveloperQuestion) {
    return `Discover Balingasag was engineered and developed by James Gasang, a 24-year-old Full-Stack & Back-End Developer from the Philippines pursuing BSIT at Tagoloan Community College.\n\nYou can explore his engineering work and portfolio at: https://jamesgdev.vercel.app`;
  }

  return null;
};

/**
 * Calls Gemini 3.5 Flash Lite with token-saving constraints.
 * Restricts conversation memory to the latest 2 turns.
 */
export const sendGeminiChatMessage = async (
  userMessage: string,
  history: ChatMessage[]
): Promise<string> => {
  // 1. Instant deterministic answer for developer / James Gasang queries (Saves 100% of tokens)
  const developerDirectAnswer = checkDeveloperQuery(userMessage);
  if (developerDirectAnswer) {
    return developerDirectAnswer;
  }

  // Prune history to the last 2 exchanges to preserve tokens
  const recentHistory = history.slice(-4);

  const contents = [
    ...recentHistory.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    })),
    {
      role: 'user',
      parts: [{ text: userMessage.trim().slice(0, 255) }],
    },
  ];

  const payload = {
    systemInstruction: {
      parts: [{ text: SYSTEM_INSTRUCTION }],
    },
    contents,
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 350, // token saving while accommodating full local guidance
      topP: 0.8,
    },
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Gemini API Error:', errText);
    throw new Error(`Gemini API error (${response.status})`);
  }

  const data = await response.json();
  const replyText =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    'Welcome to Balingasag! How may I guide your local journey today?';

  return replyText.trim();
};
