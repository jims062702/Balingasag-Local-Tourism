/**
 * Discover Balingasag — Gemini 3.5 Flash Lite Tourism AI Guide Service
 * Token-optimized, spam-buffered, strictly informational.
 * Features an instant deterministic local FAQ cache to save 100% of tokens on basic queries.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

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
      bufferSec = 86400; // 3rd time: 24 hours
    }

    const blockedUntil = now + bufferSec * 1000;
    saveSpamState({
      offenses: newOffenses,
      blockedUntil,
      lastMessageTime: now,
      lastMessageText: trimmed,
    });

    let reasonMsg = `Spam buffer activated: 15s cooldown.`;
    if (newOffenses === 2) {
      reasonMsg = `Second notice: 1 minute cooldown applied.`;
    } else if (newOffenses >= 3) {
      reasonMsg = `Maximum spam limit exceeded: 24-hour buffer applied.`;
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
- Nature & Coast: Camuayan Natural Cold Springs & Mountain Waters (Barangay Camuayan features refreshing natural cold spring basins and mountain spring waters, NOT waterfalls), Balingasag Coastal Baywalk, Balagnan Marine Sanctuary, Del Carmen Mangroves.
- Delicacies: CASA Amante native cacao tablea, fresh dried danggit, regional seafood.
- Hotlines: MDRRM 24/7 OPCEN: 0975-691-0090, PNP: 0998-598-6948, BFP: 0997-568-8288, Coast Guard: 0966-947-7077.
Rules:
1. Strictly informational. NO payments, NO bookings.
2. Max output is strictly concise to save tokens. Keep answers cheerful, polite, and helpful.`;

/**
 * Deterministic Local FAQ Knowledge Base.
 * Catches common / basic questions to reply in < 10ms with ZERO Gemini API token consumption!
 */
export const checkDeterministicFaq = (query: string): string | null => {
  const q = query.toLowerCase().trim();

  // 1. James Gasang Developer Queries
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

  // 2. Emergency Hotlines
  if (
    q.includes('hotline') ||
    q.includes('emergency') ||
    q.includes('police') ||
    q.includes('ambulance') ||
    q.includes('fire department') ||
    q.includes('contact number') ||
    q.includes('rescue')
  ) {
    return `Here are the official 24/7 Emergency Hotlines in Balingasag:\n\n* **MDRRM 24/7 OPCEN:** 0975-691-0090 (TM)\n* **PNP Balingasag:** 0998-598-6948 (SMART) / 0927-512-1838 (TM)\n* **BFP Fire Station:** 0997-568-8288 (TM)\n* **Philippine Coast Guard:** 0966-947-7077 (TM)\n* **Municipal Health Office:** 0963-065-1678 (TNT)\n\nStay safe and keep these numbers on hand!`;
  }

  // 3. Camuayan Cold Springs
  if (
    q.includes('camuayan') ||
    q.includes('cold spring') ||
    q.includes('falls') ||
    q.includes('waterfall')
  ) {
    return `In Barangay Camuayan, visitors enjoy the **Camuayan Natural Cold Springs & Mountain Waters**! Please note: Camuayan features crystal-clear natural mountain cold spring basins and aquifers (not waterfalls). It is a refreshing eco-tourism getaway surrounded by lush foliage.`;
  }

  // 4. Vega Ancestral House
  if (
    q.includes('vega') ||
    q.includes('ancestral house') ||
    q.includes('oti-ot') ||
    q.includes('oti ot')
  ) {
    return `The **Vega Ancestral House** is a 200-year-old Spanish-era bahay-na-bato located at Poblacion, Balingasag. It is renowned for its hand-carved wooden caryatids ('otí-ot') and rich historical role in Misamis Oriental heritage.`;
  }

  // 5. Top Tourism Spots
  if (
    q.includes('top spot') ||
    q.includes('must visit') ||
    q.includes('attractions') ||
    q.includes('places to visit') ||
    q.includes('where to go') ||
    q.includes('what to see') ||
    q.includes('best spot')
  ) {
    return `Here are the top must-visit attractions in Balingasag:\n\n1. **Vega Ancestral House** — 200-year-old Spanish colonial landmark in Poblacion.\n2. **Santa Rita de Cascia Parish Church** — 1892 Jesuit brickwork sanctuary.\n3. **Camuayan Natural Cold Springs** — Pure refreshing mountain cold spring basins.\n4. **Macajalar Coastal Baywalk** — Scenic seaside promenade facing Camiguin.\n5. **Balagnan Marine Sanctuary** — Protected coastal coral and reef haven.\n\nBrowse the 'Tourism spots' section on our portal to view complete guides for all 30 barangays!`;
  }

  // 6. How to Get There / Transportation
  if (
    q.includes('how to get') ||
    q.includes('how to go') ||
    q.includes('commute') ||
    q.includes('direction') ||
    q.includes('bus') ||
    q.includes('van')
  ) {
    return `**How to Reach Balingasag:**\n\n* **From Cagayan de Oro City (Agora Terminal):** Ride any northbound bus (Rural Transit / Bachelor Express) or passenger van bound for Gingoog, Butuan, or Balingasag.\n* **Travel Time:** Approx. 1.5 to 2 hours along the paved Butuan-CDO-Iligan national highway.\n* **Drop-off:** Balingasag Bus Terminal or Poblacion Town Center.`;
  }

  // 7. Town Fiesta & Festivals
  if (
    q.includes('fiesta') ||
    q.includes('festival') ||
    q.includes('feast day') ||
    q.includes('lambangus') ||
    q.includes('sakay-sakay')
  ) {
    return `* **Annual Town Fiesta:** Celebrated every **May 22** in honor of patron saint **Santa Rita de Cascia**.\n* **Lambangus Festival:** Held every January, celebrating Balingasag's thriving milkfish (bangus) aquaculture with vibrant street dancing and culinary festivities!`;
  }

  // 8. Mayor & LGU Officials
  if (
    q.includes('mayor') ||
    q.includes('vice mayor') ||
    q.includes('officials') ||
    q.includes('council')
  ) {
    return `The municipal government of Balingasag is led by:\n\n* **Municipal Mayor:** Hon. Alexis S. Moreno\n* **Vice Mayor:** Hon. John D. Valledor\n* Supported by the 10 members of the Sangguniang Bayan presiding from the Legislative Building at Poblacion.`;
  }

  return null;
};

/**
 * Calls Gemini 3.5 Flash Lite with token-saving constraints.
 * First checks the deterministic local FAQ cache to save 100% of tokens.
 */
export const sendGeminiChatMessage = async (
  userMessage: string,
  history: ChatMessage[]
): Promise<string> => {
  // 1. Instant deterministic answer for basic / FAQ queries (Saves 100% of tokens)
  const deterministicAnswer = checkDeterministicFaq(userMessage);
  if (deterministicAnswer) {
    return deterministicAnswer;
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
      maxOutputTokens: 250, // strictly concise to save tokens
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
