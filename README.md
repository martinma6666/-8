# Crazy Eights - Card Game

A classic card game built with React, Tailwind CSS, and Motion.

## Features
- Single-player vs AI
- Smooth animations with Motion
- Responsive design (Mobile & Desktop)
- "Crazy 8" wildcard logic
- Confetti celebration on win

## Deployment Instructions

### 1. Sync to GitHub
1. Create a new repository on [GitHub](https://github.com/new).
2. Open your terminal in the project root.
3. Initialize git and push to your repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Crazy Eights game"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### 2. Deploy to Vercel
1. Go to [Vercel](https://vercel.com/new).
2. Import your GitHub repository.
3. Vercel will automatically detect the Vite configuration.
4. Click **Deploy**.

## Environment Variables
If you decide to use Gemini AI features in the future, make sure to add `GEMINI_API_KEY` to your Vercel project settings.

## Local Development
```bash
npm install
npm run dev
```
