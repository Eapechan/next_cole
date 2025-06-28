# 🚀 NextCoal Initiative - Deployment Guide

This guide covers multiple deployment options for the NextCoal Initiative platform.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] All dependencies installed (`npm install`)
- [ ] Application builds successfully (`npm run build`)
- [ ] Environment variables configured (if needed)
- [ ] Google Maps API key (optional, for enhanced features)
- [ ] Backend service considerations (maps-expander)

## 🌐 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

**Best for:** Quick deployment, automatic CI/CD, free hosting

#### Steps:

1. **Install Vercel CLI:**

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**

   ```bash
   vercel login
   ```

3. **Deploy:**

   ```bash
   vercel
   ```

4. **Follow the prompts:**

   - Link to existing project or create new
   - Confirm build settings
   - Deploy

5. **Access your app:**
   - Vercel will provide a URL (e.g., `https://your-app.vercel.app`)
   - Set up custom domain if needed

#### Advantages:

- ✅ Free tier available
- ✅ Automatic deployments from Git
- ✅ Global CDN
- ✅ SSL certificates included
- ✅ Easy custom domain setup

---

### Option 2: Netlify

**Best for:** Static hosting, form handling, serverless functions

#### Steps:

1. **Install Netlify CLI:**

   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**

   ```bash
   netlify login
   ```

3. **Build and deploy:**

   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

4. **Or connect to Git:**
   - Push to GitHub/GitLab
   - Connect repository in Netlify dashboard
   - Automatic deployments on push

#### Advantages:

- ✅ Free tier available
- ✅ Easy Git integration
- ✅ Form handling
- ✅ Serverless functions support

---

### Option 3: GitHub Pages

**Best for:** Free hosting, GitHub integration

#### Steps:

1. **Add GitHub Pages configuration to package.json:**

   ```json
   {
     "homepage": "https://yourusername.github.io/your-repo-name",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

2. **Install gh-pages:**

   ```bash
   npm install --save-dev gh-pages
   ```

3. **Deploy:**

   ```bash
   npm run deploy
   ```

4. **Configure in GitHub:**
   - Go to repository Settings → Pages
   - Select gh-pages branch as source

#### Advantages:

- ✅ Completely free
- ✅ Integrated with GitHub
- ✅ Custom domain support

---

### Option 4: AWS S3 + CloudFront

**Best for:** Enterprise, high traffic, custom infrastructure

#### Steps:

1. **Create S3 bucket:**

   ```bash
   aws s3 mb s3://your-app-name
   ```

2. **Configure for static website:**

   ```bash
   aws s3 website s3://your-app-name --index-document index.html --error-document index.html
   ```

3. **Build and upload:**

   ```bash
   npm run build
   aws s3 sync dist/ s3://your-app-name --delete
   ```

4. **Set up CloudFront distribution:**
   - Create CloudFront distribution
   - Point to S3 bucket
   - Configure custom domain and SSL

#### Advantages:

- ✅ Highly scalable
- ✅ Global CDN
- ✅ Enterprise features
- ✅ Cost-effective for high traffic

---

### Option 5: Docker + Cloud Platform

**Best for:** Containerized deployment, microservices

#### Steps:

1. **Create Dockerfile:**

   ```dockerfile
   FROM node:18-alpine as build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build and deploy:**

   ```bash
   docker build -t nextcoal-app .
   docker run -p 80:80 nextcoal-app
   ```

3. **Deploy to cloud platform:**
   - Google Cloud Run
   - AWS ECS
   - Azure Container Instances

#### Advantages:

- ✅ Consistent environment
- ✅ Easy scaling
- ✅ Cloud-native deployment

---

## 🔧 Environment Configuration

### Environment Variables

Create `.env.production` for production:

```env
VITE_API_URL=https://your-api-domain.com
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_APP_NAME=NextCoal Initiative
VITE_APP_VERSION=1.0.0
```

### Backend Service Considerations

The maps-expander service runs locally on port 3001. For production:

1. **Deploy separately** to a cloud service (Heroku, Railway, etc.)
2. **Update the URL** in the frontend code
3. **Or disable** the backend service and rely on direct URL parsing

---

## 📊 Performance Optimization

### Build Optimization

1. **Enable compression:**

   ```bash
   npm install --save-dev vite-plugin-compression
   ```

2. **Add to vite.config.ts:**

   ```typescript
   import compression from "vite-plugin-compression";

   export default defineConfig({
     plugins: [
       compression({
         algorithm: "gzip",
         ext: ".gz",
       }),
     ],
   });
   ```

### Image Optimization

1. **Use WebP format** for images
2. **Implement lazy loading**
3. **Optimize bundle size**

---

## 🔒 Security Considerations

### Production Checklist

- [ ] Remove console.log statements
- [ ] Set up proper CORS headers
- [ ] Configure Content Security Policy
- [ ] Enable HTTPS
- [ ] Set up monitoring and logging
- [ ] Configure error tracking (Sentry, etc.)

### Environment Variables

Never commit sensitive data:

- API keys
- Database credentials
- Private URLs

---

## 🚀 Quick Deploy Commands

### Vercel (Recommended)

```bash
npm install -g vercel
vercel login
vercel
```

### Netlify

```bash
npm install -g netlify-cli
netlify login
npm run build
netlify deploy --prod --dir=dist
```

### GitHub Pages

```bash
npm install --save-dev gh-pages
npm run deploy
```

---

## 📞 Support

If you encounter issues:

1. Check the build logs
2. Verify environment variables
3. Test locally first (`npm run build && npm run preview`)
4. Check browser console for errors
5. Review deployment platform documentation

---

## 🎯 Recommended Deployment Flow

1. **Start with Vercel** for quick deployment
2. **Test thoroughly** in production
3. **Set up monitoring** and analytics
4. **Configure custom domain** if needed
5. **Set up CI/CD** for automatic deployments

Choose the deployment option that best fits your needs and technical requirements!
