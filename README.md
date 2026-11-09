# Discover Balingasag 🌴 (ZIP 9005, Misamis Oriental, Philippines)

An informational, **100% free-tier-optimized Local Tourism Discovery & LGU CMS Platform** for the coastal municipality of **Balingasag, Misamis Oriental**, powered by **React 18, Vite, TypeScript, Tailwind CSS, Firebase Firestore, and Cloudinary Media Storage**.

> **Strict Non-Commercial Compliance Policy:**  
> This platform is purely informational. In strict compliance with guidelines, there are **NO payments**, **NO booking engines**, **NO service workers**, and **NO pricing fields**.

---

## 🏛️ Authentic Tourism Data & Municipal Profile

- **Municipality:** Balingasag, Misamis Oriental (Region X, Northern Mindanao)
- **ZIP Code:** 9005
- **Founded:** 1842 (Spanish Colonial Settlement)
- **Classification:** 1st Class Coastal Municipality
- **Layout:** Classical Spanish *Bajo de Campana* (under the bell) urban design with central plaza, Jesuit church, and coastal boulevard.

### All 30 Official Barangays Included:
`Balagnan`, `Baliwagan`, `Barangay 1 (Poblacion)`, `Barangay 2 (Poblacion)`, `Barangay 3 (Poblacion)`, `Barangay 4 (Poblacion)`, `Barangay 5 (Poblacion)`, `Barangay 6 (Poblacion)`, `Binitinan`, `Blanco`, `Calawag`, `Camuayan`, `Cogon`, `Dansuli`, `Dumarait`, `Hermano`, `Kibanban`, `Linabu`, `Linggangao`, `Mambayaan`, `Mandangoa`, `Napaliran`, `Quezon`, `Rosario`, `Samay`, `San Francisco`, `San Isidro`, `San Juan`, `Talusan`, and `Waterfall`.

### Top Attractions Pre-Seeded:
1. **Vega Ancestral House (Brgy. 2 Poblacion):** Built circa 1800s; iconic 1st-transition *Bahay na Bato* made of Molave and Narra hardwoods. Famed for its structural *otí-ot* (wooden caryatid supports). Hosted Gen. Emilio Aguinaldo and Pres. Sergio Osmeña.
2. **Santa Rita de Cascia Parish Church (Brgy. 4 Poblacion):** Built 1892–1895 by Spanish Jesuit missionaries. Exposed clay brick façade, heavy timber trusses, anchoring the *Bajo de Campana* town plaza.
3. **Balingasag Coastal Baywalk & Boardwalk (Baliwagan):** Paved seawall boulevard facing Macajalar Bay, offering panoramic sunset views of Camiguin Island.
4. **Camuayan Falls & Cold Springs (Camuayan):** Multi-tiered mountain waterfall and natural spring pools tucked in upland tropical canopies.
5. **Mahayahay Falls & Busay Eco-Trail (Barangay Waterfall):** Forest cascades and mountain streams that gave Barangay Waterfall its namesake.
6. **Punta Gorda Historical Lighthouse (Hermano):** Historic maritime beacon on coastal headland cliffs overlooking Macajalar Bay towards Bohol Sea.
7. **Balagnan Coastal Marine Sanctuary & Mangrove Boardwalk (Balagnan):** Community-protected mangrove nursery and avifauna reserve.
8. **CASA Amante Traditional Tablea & Agro-Heritage Farm (Quezon):** Heritage cacao plantation preserving wood-roasted, stone-ground 100% native tablea for authentic hot *Sikwate*.
9. **Madeline's Park and Botanical Gardens (San Isidro):** Cool upland botanical haven with freshwater ponds and garden terraces.
10. **Balingasag Municipal Plaza & Bajo de Campana Park (Brgy. 1 Poblacion):** Centenary acacia trees and civic heritage monuments.

### Major Cultural Festivals:
- **Lambangus Festival (May 15–22, Peak May 21):** Grand celebration of milkfish (*bangus*) bounty with street dance exhibitions and agro-fairs.
- **Feast Day of Santa Rita de Cascia (May 22):** Solemn patronal festival and religious processions.
- **Sakay-Sakay Fluvial Festival & Sto. Niño Diyandi (3rd Weekend of January):** Sacred fluvial flotilla of decorated bancas across Macajalar Bay.
- **Balingasag Agro-Heritage Fair (December):** Trade fair celebrating CASA Amante tablea, coastal danggit, and upland harvests.

---

## ⚡ Tech Stack & Architecture (100% Free-Tier)

| Layer | Technology | Free Tier Optimization |
|---|---|---|
| **Frontend Framework** | React 18, TypeScript, Vite | Fast HMR, zero-latency bundles, deployable on Vercel |
| **Styling & Icons** | Tailwind CSS 3, Lucide React | High-performance atomic CSS, custom color palette |
| **Cloud Database** | Firebase Firestore (NoSQL) | 50,000 daily reads, 20,000 daily writes on Spark (Free) plan |
| **Authentication** | Firebase Authentication | Free Email/Password login for LGU Admin |
| **Media Storage** | Cloudinary Free Tier | 25 monthly credits, direct unsigned uploads, auto-thumbnails |
| **Live Weather API** | Open-Meteo API | Free live micro-climate for Lat 8.74° N, Lng 124.77° E (No API key needed) |
| **Hosting** | Vercel Free Hobby Tier | Free global edge CDN, unlimited preview builds |

---

## 🚀 Quick Start Guide

### 1. Clone & Install
```bash
# Navigate to project directory
cd LocalTourismBalingasag

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will launch at `http://localhost:5173/`.

### 2. Immediate Testing (Zero-Config Sandbox Mode)
The platform features an **intelligent local cache fallback**. If you run the app without `.env` variables, it will automatically operate in **Free-Tier Sandbox Mode** pre-loaded with all authentic Balingasag attractions, advisories, and events.

You can log in to the **Admin CMS** with:
- **Email:** `tourism.admin@balingasag.gov.ph`
- **Password:** `Balingasag9005!`
*(Or click the "One-Click Quick Admin Demo Sign In" button on the login screen).*

---

## 🔧 Production Setup (Firebase & Cloudinary Free Tier)

### 1. Configure `.env`
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Fill in your credentials:
```env
# Google Firebase Free Tier
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=balingasag-tourism.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=balingasag-tourism
VITE_FIREBASE_STORAGE_BUCKET=balingasag-tourism.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef

# Cloudinary Free Tier
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=balingasag_preset
```

### 2. Setting up Google Firebase (Spark Free Plan)
1. Go to [Firebase Console](https://console.firebase.google.com/) and click **Add Project** (e.g. `balingasag-tourism`).
2. **Enable Authentication:**
   - Go to **Build** → **Authentication** → **Sign-in method**.
   - Enable **Email/Password**.
   - Go to the **Users** tab and click **Add user** (e.g. `tourism.admin@balingasag.gov.ph` with your secure password).
3. **Enable Cloud Firestore:**
   - Go to **Build** → **Firestore Database** → **Create database**.
   - Select your preferred cloud region (e.g. `asia-southeast1` Singapore).
   - Paste the provided [`firestore.rules`](./firestore.rules) into the **Rules** tab.
4. **Seed Database in 1 Click:**
   - Log into the Admin CMS in the app.
   - Go to **Database & Cloudinary Config** tab.
   - Click **"Seed Firestore with Authentic Balingasag Data"**. This instantly writes all 10 curated destinations, active advisories, and festivals directly into your live Firestore collections!

### 3. Setting up Cloudinary Free Tier
1. Sign up at [Cloudinary](https://cloudinary.com/) (Free Tier: 25 monthly credits).
2. Go to **Settings** (Gear icon) → **Upload**.
3. Scroll to **Upload presets** and click **Add upload preset**.
4. Set **Signing Mode** to **Unsigned** (e.g. named `balingasag_preset`).
5. Save and copy your **Cloud name** and **Upload preset name** into your `.env`.

---

## 🌐 Free Deployment to Vercel

1. Push this repository to GitHub or GitLab.
2. Go to [Vercel](https://vercel.com/) and click **Add New** → **Project**.
3. Import your repository.
4. Framework Preset: **Vite**.
5. Build Command: `npm run build`.
6. Output Directory: `dist`.
7. Add your Environment Variables (`VITE_FIREBASE_*`, `VITE_CLOUDINARY_*`).
8. Click **Deploy**. The included [`vercel.json`](./vercel.json) ensures seamless client-side single-page routing.

---

## 🛡️ Security Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /destinations/{destinationId} {
      allow read: if true;
      allow write, update, delete: if request.auth != null;
    }
    match /advisories/{advisoryId} {
      allow read: if true;
      allow write, update, delete: if request.auth != null;
    }
    match /events/{eventId} {
      allow read: if true;
      allow write, update, delete: if request.auth != null;
    }
  }
}
```

---

## 🏛️ LGU Emergency Contacts (Balingasag, Misamis Oriental)
- **MDRRMO Rescue Hotline:** (088) 333-2111 / 911
- **PNP Balingasag Station:** 0998-598-6925
- **BFP Fire Station:** 0917-814-7268
- **Municipal Tourism & Health Office:** (088) 333-2005
