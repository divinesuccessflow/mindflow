# Deployment Guide - MindFlow

## Quick Start (Local Development)

```bash
# Navigate to project
cd /Users/yashaswisugatoor/.openclaw/workspace/mindmap-app

# Install dependencies (if not already done)
npm install

# Run development server
npm run dev

# Open browser to http://localhost:3000
```

The app will automatically reload on code changes. All data is stored in browser localStorage.

## Production Build

```bash
# Build for production
npm run build

# Output appears in .next/ directory

# Test production build locally
npm run build
npm start

# Server runs on http://localhost:3000
```

## Deploy to Vercel (Recommended)

MindFlow is optimized for Vercel deployment (same company behind Next.js).

### Option 1: Git-Based Deployment

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial MindFlow commit"
   ```

2. **Push to GitHub/GitLab/Bitbucket**:
   ```bash
   # Create repo on GitHub
   git remote add origin https://github.com/yourusername/mindflow.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy on Vercel.com**:
   - Go to https://vercel.com/new
   - Select your Git repository
   - Click "Deploy"
   - Your app will be live in ~2 minutes

### Option 2: Direct CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# Follow prompts:
# - Link to Vercel account
# - Select scope (personal account)
# - Confirm settings
```

## Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build the app
npm run build

# Deploy
netlify deploy --prod

# Or use Git-based deployment:
# - Push to GitHub
# - Go to netlify.com
# - Click "New site from Git"
# - Select your repo
# - Use default settings
```

## Deploy to Railway / Fly.io / Others

MindFlow is a static Next.js app perfect for any Node.js host:

```bash
# Build locally
npm run build

# All static files in: .next/
# No environment variables needed
# No database or backend required
```

## Environment Variables

**None required!** MindFlow works completely client-side with localStorage.

If you add authentication or backend features later:

```bash
# Create .env.local (never commit to Git)
NEXT_PUBLIC_API_URL=https://api.example.com
```

## Data Backup

Users can:
1. Click **Export** in top bar → downloads `mindflow-YYYY-MM-DD.json`
2. Save backups locally
3. Click **Import** to restore from JSON file

All data is in localStorage by default, persists across browser sessions.

## Performance Optimization

Already included in the build:
- ✅ Code splitting (automatic)
- ✅ Image optimization (if adding images later)
- ✅ CSS purging (Tailwind)
- ✅ Minification (automatic)
- ✅ Tree shaking (ESM)

Metrics:
- **First Load JS**: ~104 kB
- **Page Size**: ~16 kB (optimized)
- **Lighthouse Score**: ~95+ (no network requests)

## Monitoring

Since there's no backend:
- Use **Vercel Analytics** (free tier available)
- Monitor with **Sentry** if adding backend later
- No database monitoring needed

## Updates & Maintenance

```bash
# Update dependencies
npm update

# Check for security issues
npm audit

# Fix security issues
npm audit fix

# Run type checking
npx tsc --noEmit

# Format code
npm run format  # (if prettier is added)
```

## Browser Compatibility

✅ Chrome 90+  
✅ Firefox 88+  
✅ Safari 14+  
✅ Edge 90+  
✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Port already in use
```bash
# Use different port
npm run dev -- --port 3001
```

### Node version
```bash
# Requires Node 18+
node --version
```

### Clear localStorage
```javascript
// In browser console
localStorage.clear()
location.reload()
```

### Export data before clearing
```bash
# Always export before clearing!
# Click "Export" button in app
```

## Performance Tips

- The app works **fully offline** after first load
- Each mindmap operation is instant (no API calls)
- Large mindmaps (1000+ nodes) may slow pan/zoom
- For very large datasets, use multiple smaller mindmaps

## Custom Domain

### Vercel:
1. Go to Project Settings
2. Domains → Add Custom Domain
3. Update DNS records (Vercel provides instructions)

### Netlify:
1. Site Settings → Domain Management
2. Add Custom Domain
3. Update DNS records

## HTTPS

✅ Automatic for all major hosts (Vercel, Netlify, Railway, etc.)

## CDN & Caching

✅ Automatically enabled on Vercel/Netlify

## Analytics

Add Vercel Web Analytics (free 10K events/month):

```bash
# Already built into Vercel deploys
# Dashboard: vercel.com → Analytics
```

## Support & Issues

- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind Docs**: https://tailwindcss.com/docs
- **Zustand Docs**: https://github.com/pmndrs/zustand

---

That's it! MindFlow is production-ready and optimized for deployment. 🚀
