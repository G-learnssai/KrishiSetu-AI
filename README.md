# KrishiSetu AI — Bridging Farmers to Prosperity
*(ಕೃಷಿಸೇತು AI / कृषिसेतु AI)*

> **A modern, mobile-friendly agricultural platform empowering Indian farmers with equipment rentals, direct crop marketplaces, financial profit calculators, verified buyer directories, and multilingual voice assistance.**

---

## 🌾 Project Overview

**KrishiSetu AI** is a purpose-built digital bridge designed to eliminate middleman exploitation, prevent post-harvest distress sales, and provide affordable mechanization for smallholder and marginal farmers across India.

### 🌟 Core Features

1. **🚜 Agricultural Machinery Rental Marketplace**:
   - Peer-to-peer equipment sharing (Tractors, Combine Harvesters, Rotavators, Seed Drills, Sprayers).
   - Transparent pricing models (per hour, per day, or per acre) with automated cost calculations.
   - Smart booking engine with conflict and double-booking prevention.
   - Owner portal to accept or decline incoming rental requests and toggle equipment status (*Available*, *Booked*, *In Maintenance*).

2. **🌾 Sell Crops & Find Buyers Marketplace**:
   - Direct listing for agricultural harvests (Paddy, Maize, Tomatoes, Onions, Pulses, Spices).
   - Filtering by crop category, variety, price range, and district.
   - Structured buyer enquiry and bidding system allowing commercial buyers to submit offers.
   - Farmer decision dashboard to accept/decline offers and securely reveal verified buyer contact info.

3. **💰 Profit Calculator & Buyer Offer Comparison**:
   - Itemized financial planner for seeds, fertilizer, labor, irrigation, machinery, transport, and packaging.
   - Instant calculation of Total Revenue, Total Cost, Net Profit/Loss, Unit Cost, and Return on Investment (ROI %).
   - Side-by-side comparison of multiple buyer bids against the farmer's cost of cultivation.

4. **🔐 Multi-Role User Authentication & Authorization**:
   - Specialized accounts: **Farmer**, **Machinery Owner**, and **Buyer / Wholesaler**.
   - Dual-role support (e.g., Farmers who also own machinery).
   - Profile management with pre-filled forms and action resumption.
   - One-click demo logins for immediate hackathon evaluation.

5. **🎙️ Multilingual AI Voice Assistant**:
   - Web Speech API voice synthesis and speech recognition.
   - Instantaneous translation across **English**, **Kannada (ಕನ್ನಡ)**, and **Hindi (हिन्दी)**.
   - Contextual spoken advisory for Mandi rates, profit tips, and rental assistance.

6. **🎨 Farmer-Centric High-Contrast Design System**:
   - **Forest Green** (`#174D32`): Sustainability and trust.
   - **Leaf Green** (`#3D8B55`): Growth and positive margins.
   - **Warm Ivory** (`#F4F1E6`): Sunlight-readable, eye-friendly background.
   - **Harvest Gold** (`#E7B85C`): Highlights, buttons, and prosperity badges.

---

## 💻 Prerequisites

To run KrishiSetu AI locally on a Windows, macOS, or Linux machine, you only need:

1. **A Modern Web Browser**: Google Chrome, Microsoft Edge, Mozilla Firefox, or Brave.
2. **Python 3.x** *(recommended for running the local server)*:
   - Check if installed by opening terminal/PowerShell and running:
     ```bash
     python --version
     ```
   - If not installed, download from [python.org](https://www.python.org/) or install via Microsoft Store.
3. *(Alternative)* **Node.js** *(optional, only if you prefer using `npx serve`)*.

---

## 🚀 Quick Start Guide (Windows)

### Option 1: Double-Click Launcher (Easiest for Beginners)
1. Navigate to the project folder in Windows File Explorer.
2. Double-click **`start_website.bat`**.
3. A terminal window will open, start the local server, and automatically launch your browser at `http://localhost:8000`.

---

### Option 2: Running via Python Terminal (Standard)
1. Open PowerShell or Command Prompt.
2. Navigate to the cloned folder:
   ```bash
   cd Krishisetu-AI
   ```
3. Start the built-in zero-dependency server:
   ```bash
   python server.py
   ```
4. Open your browser and go to:
   ```
   http://localhost:8000
   ```

---

### Option 3: Python Built-in HTTP Server
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser.

---

## 🗄️ Backend Architecture: Local Mode vs. Supabase Cloud

KrishiSetu AI is engineered with a **dual-engine architecture** so you can run it immediately without setting up third-party services, while also supporting full multi-user cloud synchronization when needed:

| Feature | Local Mode (Default) | Supabase Cloud Mode (Optional) |
|---|---|---|
| **Setup Required** | **Zero setup** (Runs right out of the box) | Free Supabase account + running SQL migration |
| **Storage Location** | Browser `localStorage` (Isolated to each laptop) | Cloud PostgreSQL Database (Real-time sync) |
| **Authentication** | Browser `WebCrypto` SHA-256 salted hashing | Supabase Cloud Auth (JWT + Session persistence) |
| **Cross-Device Sharing** | No (data remains on the local laptop) | **Yes** (all friends see listings and bids in real time) |
| **Internet Required** | **No** (works completely offline) | Yes (for cloud database synchronization) |

---

## ☁️ Optional: Connecting Supabase Cloud Database

If you and your teammates want to share data in real-time across different laptops:

1. **Create a Free Project**:
   - Go to [supabase.com](https://supabase.com/) and create a free project.
2. **Run the Database Migration**:
   - Open your Supabase Dashboard → **SQL Editor**.
   - Copy the entire contents of [`supabase-schema.sql`](supabase-schema.sql) and paste it into the SQL Editor.
   - Click **Run**. This creates all tables (`profiles`, `crop_listings`, `crop_enquiries`, `machinery_listings`, `machinery_bookings`) with Row Level Security (RLS) policies.
3. **Connect Your App**:
   - In KrishiSetu AI, click the **"Log In"** button on the top right.
   - Click the **"Cloud Setup (Supabase)"** tab.
   - Enter your **Project URL** and **Public Anon Key** (found in Supabase Dashboard → *Project Settings* → *API*).
   - Click **"Connect to Supabase"**.
   - *Alternatively, copy `.env.example` to `.env` and fill in the values.*

> [!IMPORTANT]
> **Security Notice**: Only use the **Public `anon` key** on the frontend. Never use or share the **`service_role` secret key**.

---

## 🧪 Testing the Main Features

### 1. Instant 1-Click Demo Personas
Click **"Log In"** in the top navigation bar to test pre-configured accounts:
- **👨‍🌾 Farmer Demo**: `farmer@krishisetu.ai` (Password: `farmer123`) — Has listings and crop management.
- **🚜 Machinery Owner Demo**: `owner@krishisetu.ai` (Password: `owner123`) — Owns tractors and manages rental requests.
- **🏢 Buyer / Wholesaler Demo**: `buyer@krishisetu.ai` (Password: `buyer123`) — Submits crop purchase bids.

### 2. Renting Machinery
1. Click the **"Rent Machinery"** card on the homepage.
2. Browse available tractors and harvesters. Use the filter to select equipment type or district.
3. Click **"Book Now"**, select rental dates, and submit the booking request.
4. Check the **"My Bookings"** tab to see your pending confirmation.

### 3. Selling Crops & Buyer Bidding
1. Click **"Sell Crops"** → **"List a New Crop"**.
2. If logged in as a Farmer, your details are pre-filled. Enter crop specifications and click publish.
3. Switch accounts to the **Buyer Demo** and submit a purchase offer on the crop.
4. Switch back to the **Farmer Demo** to review, accept, or decline the offer.

### 4. Profit Calculator
1. Click **"Calculate Profit"** on the homepage.
2. Select a crop preset (e.g., Tomato or Paddy) or enter custom expenses.
3. Adjust selling prices to see instant gross revenue, net profit, break-even price, and ROI percentage.

### 5. Multilingual Voice Assistant
1. Tap the harvest-gold **AI Voice Assistant** button at the bottom right.
2. Switch languages between English, Kannada, and Hindi using the top-bar selector.
3. Tap the microphone icon or type an agricultural question to receive voice feedback.

---

## 🛠️ Common Setup Issues & Troubleshooting

### 1. `python` is not recognized as an internal or external command
- **Cause**: Python is not installed or not added to your Windows PATH.
- **Fix**: Re-run the Python installer, check the box **"Add Python to PATH"**, and restart your terminal. Alternatively, use `py server.py` or double-click `start_website.bat`.

### 2. Port 8000 is already in use (`Address already in use`)
- **Cause**: Another application or a previously running server instance is using port 8000.
- **Fix**:
  - Close the existing terminal running `server.py`.
  - Or run Python on a different port:
    ```bash
    python -m http.server 8080
    ```
    Then visit `http://localhost:8080`.

### 3. Microphone doesn't work in the Voice Assistant
- **Cause**: The Web Speech API requires permission and a secure context (`localhost` or `https://`).
- **Fix**: When prompted by your browser, click **"Allow"** for microphone access. Ensure you are accessing via `http://localhost:8000` (not `file://`).

---

## 📄 Repository Structure

```
Krishisetu-AI/
├── .env.example            # Safe template for cloud backend credentials
├── .gitignore              # Ignores sensitive keys, node_modules, and cache
├── README.md               # Complete project documentation and guide
├── index.html              # Main single-page application markup & modals
├── server.py               # Lightweight standard-library Python HTTP server
├── start_website.bat       # Windows 1-click double-click launcher
├── supabase-schema.sql     # PostgreSQL database schema with RLS policies
├── css/
│   └── styles.css          # Responsive design system & components
└── js/
    ├── app.js              # Marketplace, calculator, and booking logic
    ├── auth.js             # Dual-engine authentication & role authorization
    ├── supabase-config.js  # Supabase client initializer & config manager
    ├── translations.js     # Trilingual dictionary (English, Kannada, Hindi)
    └── voice-assistant.js  # Speech synthesis & AI advisory logic
```

---

## 📜 License & Credits

Built with pride for Indian Agriculture during the **Krishi Innovation Hackathon**.  
*Empowering Annadatas with Accessible Technology.*
