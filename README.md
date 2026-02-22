# LinkVerse — Bio-Link Platform for Indian Creators

LinkVerse is a full-stack Linktree-style bio-link platform built for Indian influencers and content creators. Users pay ₹49/month or ₹499/year to get a personalized public profile page.

## 🚀 Features

- **30+ Platform Support** — Instagram, YouTube, Moj, ShareChat, Josh, Chingari, JioSaavn, and more
- **Beautiful Themes** — 10 preset themes + full customization
- **Detailed Analytics** — Page views, link clicks, top links, traffic sources
- **Razorpay Payments** — UPI, Cards, Net Banking, Wallets
- **SEO Settings** — Custom meta title, description, OG image
- **Admin Panel** — User management, payment records, support tickets
- **Mobile-First** — Responsive design optimized for mobile

## 🛠 Tech Stack

- **Frontend:** React 19 + Vite + Tailwind CSS v4
- **Backend:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt
- **Payments:** Razorpay
- **Storage:** Cloudinary

## 📋 Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Razorpay account (test mode)
- Cloudinary account

## ⚡ Quick Start

### 1. Clone/Download the project

```bash
git clone https://github.com/yourusername/linkverse.git
cd linkverse
```

### 2. Frontend Setup

```bash
npm install
npm run dev
# Runs at http://localhost:5173
```

### 3. Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials
npm run seed    # Load demo data
npm run dev     # Runs at http://localhost:5000
```

### 4. Add API Proxy

Edit `vite.config.ts` and add:

```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
```

## 🔐 Environment Variables

Create `server/.env` with:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT tokens |
| `RAZORPAY_KEY_ID` | Razorpay test key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay test key secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `SMTP_HOST` | Email SMTP host |
| `SMTP_PORT` | Email SMTP port |
| `SMTP_USER` | Email username |
| `SMTP_PASS` | Email password |

## 👤 Demo Accounts

After running `npm run seed`:

**Admin:**
- Email: `admin@linkverse.com`
- Password: `Admin@123`

**Demo Users:** (password: `Password@123`)
- `@priya.fashion` — Fashion influencer
- `@techraj` — Tech reviewer  
- `@fitnessguru` — Fitness coach
- `@foodie.delhi` — Food blogger
- `@comedy.king` — Comedy creator

## 📁 Project Structure

```
linkverse/
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── context/            # React context
│   ├── hooks/              # Custom hooks
│   └── utils/              # Utilities
├── server/                 # Express backend
│   ├── controllers/        # Route controllers
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   └── utils/              # Utilities
└── public/                 # Static files
```

## 🚀 Deployment

### Frontend (Vercel)
- Build: `npm run build`
- Output: `dist`

### Backend (Render/Railway)
- Build: `cd server && npm install`
- Start: `node server.js`

## 📄 License

MIT License — see LICENSE file

---

Made with ❤️ in India 🇮🇳
