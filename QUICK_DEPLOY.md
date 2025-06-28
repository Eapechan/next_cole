# 🚀 Quick Deploy - NextCoal Initiative

## ⚡ Fastest Deployment (Vercel)

### Option 1: One-Click Deploy (Easiest)

1. **Click the button below to deploy to Vercel:**
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/nextcoal-initiative)

2. **Or use the deployment script:**

   ```bash
   # Windows
   deploy.bat

   # Then select option 1 (Vercel)
   ```

### Option 2: Manual Vercel Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## 🎯 Recommended Deployment Flow

### Step 1: Choose Your Platform

| Platform         | Difficulty    | Cost   | Best For                     |
| ---------------- | ------------- | ------ | ---------------------------- |
| **Vercel**       | ⭐ Easy       | Free   | Quick deployment, React apps |
| **Netlify**      | ⭐⭐ Easy     | Free   | Static sites, forms          |
| **GitHub Pages** | ⭐⭐ Easy     | Free   | GitHub integration           |
| **Docker**       | ⭐⭐⭐ Medium | Varies | Custom infrastructure        |

### Step 2: Deploy

#### Vercel (Recommended)

```bash
deploy.bat
# Select option 1
```

#### Netlify

```bash
deploy.bat
# Select option 2
```

#### GitHub Pages

```bash
deploy.bat
# Select option 3
```

#### Docker

```bash
deploy.bat
# Select option 4
```

## 🔧 Pre-Deployment Checklist

- [ ] ✅ Application builds successfully (`npm run build`)
- [ ] ✅ All dependencies installed (`npm install`)
- [ ] ✅ Google Maps integration tested
- [ ] ✅ Backend service considerations (maps-expander)

## 🌐 Post-Deployment

### 1. Test Your Application

- Verify all pages load correctly
- Test user registration and login
- Check Google Maps integration
- Validate PDF report generation

### 2. Configure Custom Domain (Optional)

- **Vercel**: Settings → Domains
- **Netlify**: Site settings → Domain management
- **GitHub Pages**: Repository settings → Pages

### 3. Set Up Monitoring

- Enable error tracking (Sentry, LogRocket)
- Set up analytics (Google Analytics, Plausible)
- Configure uptime monitoring

## 🚨 Important Notes

### Backend Service (maps-expander)

The Google Maps backend service runs locally on port 3001. For production:

1. **Deploy separately** to a cloud service:

   - Heroku: `heroku create your-maps-service`
   - Railway: Connect GitHub repo
   - Render: Deploy from GitHub

2. **Update the URL** in your frontend code:

   ```typescript
   // Change from localhost:3001 to your deployed URL
   const res = await fetch(
     `https://your-maps-service.herokuapp.com/expand?url=${encodeURIComponent(
       link
     )}`
   );
   ```

3. **Or disable** the backend service and rely on direct URL parsing (already implemented as fallback)

### Environment Variables

If you need to configure environment variables:

```env
VITE_API_URL=https://your-api-domain.com
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_APP_NAME=NextCoal Initiative
```

## 📞 Troubleshooting

### Common Issues

1. **Build Fails**

   ```bash
   npm install
   npm run build
   ```

2. **Google Maps Not Working**

   - Check if backend service is running
   - Test with Admin → Google Maps Test
   - Verify URL formats

3. **Routing Issues**
   - Ensure SPA routing is configured
   - Check for 404 errors on refresh

### Get Help

1. Check the browser console for errors
2. Review deployment platform logs
3. Test locally first: `npm run dev`
4. Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions

## 🎉 Success!

Once deployed, your NextCoal Initiative will be available at:

- **Vercel**: `https://your-app.vercel.app`
- **Netlify**: `https://your-app.netlify.app`
- **GitHub Pages**: `https://yourusername.github.io/your-repo-name`

Share your deployed application and start tracking carbon emissions! 🌱
