# MERN-Shop

Full-stack MERN e-commerce demo with:
- React + Tailwind (client)
- Express + MongoDB + Stripe (server)

## Monorepo Structure
```
client/   # React front-end
server/   # Express API
```

## Local Development
1. Install dependencies
```
cd client && npm install
cd ../server && npm install
```
2. Create environment files
```
server/.env       # copy from server/.env.example and fill values
client/.env       # copy from client/.env.example and fill values
```
3. Start backend (PORT defaults 5000)
```
cd server
npm start
```
4. Start frontend (in another terminal)
```
cd client
npm start
```
Frontend expects API at http://localhost:5000 unless you set REACT_APP_API_BASE_URL.

## Deployment (Vercel + MongoDB Atlas)
You can deploy client and server separately on Vercel using the monorepo.

### 1. Prepare Environment Variables (DON'T COMMIT SECRETS)
Create `server/.env.example` and `client/.env.example` (already added) and add the real values in Vercel Project Settings -> Environment Variables.

Required server vars:
- MONGO_URI
- JWT_SECRET
- ADMIN_EMAIL
- ADMIN_PASSWORD
- STRIPE_SECRET_KEY
- STRIPE_PUBLISHABLE_KEY (also needed on client)

Client vars:
- REACT_APP_API_BASE_URL (e.g. https://your-api.vercel.app)
- REACT_APP_STRIPE_PUBLISHABLE_KEY

### 2. GitHub Push
Initialize git at repo root (instructions below).

### 3. Vercel Setup
Option A: Two Projects in Vercel
- Project 1 (API): Root directory = `server`, Framework = "Other". Build Command: `npm install` (no build step). Output directory: leave blank. Set `PORT` to `3000` (Vercel will assign) and ensure code uses `process.env.PORT`.
- Project 2 (Web): Root directory = `client`, Build Command: `npm run build`, Output Directory: `build`.

Option B: Single Project Serving API as serverless functions would require refactor (not covered here).

### 4. CORS Config Change
In `server/app.js` replace hardcoded origin with env-based whitelist:
```
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
app.use(cors({ origin: allowedOrigin, credentials: true }));
```
Set CLIENT_ORIGIN in Vercel to deployed frontend URL.

(If not yet changed in code, do so before deploy.)

### 5. Axios Base URL
Client code now uses `REACT_APP_API_BASE_URL`. Set it in Vercel to the deployed API URL.

### 6. Stripe
Add both publishable and secret keys in the appropriate projects.

### 7. MongoDB
Use MongoDB Atlas connection string in `MONGO_URI`.

## Git Commands
```
echo "# MERN-Shop" > README.md
git init
git add .
git commit -m "chore: initial commit"
git branch -M main
git remote add origin https://github.com/Ankit628736/MERN-Shop.git
git push -u origin main
```

## Security Note
NEVER commit real secrets. Only commit the `.env.example` templates.

## License
MIT
