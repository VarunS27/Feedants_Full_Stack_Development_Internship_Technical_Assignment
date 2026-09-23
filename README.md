# Feedants – Full Stack Internship Assignment

A React Native (Expo Go) mobile app paired with a Node.js/Express/MongoDB backend, built as part of the Feedants Full Stack Development Internship technical assessment.

## Demo

https://github.com/VarunS27/Feedants_Full_Stack_Development_Internship_Technical_Assignment/raw/main/mobile/assets/screen_rec.mp4

> The video shows: browsing the competition listing → opening competition details → registration flow with live seat counter → submission upload.

## Features implemented

- Competition listing and detail screen with live countdown timer
- Multi-language support (English / Hindi)
- Registration flow with Razorpay order creation
- Seat availability counter (updates in real time after registration)
- Submission upload (image / video)
- JWT authentication
- Auto-seed on server startup — competition dates are always live relative to seed time, giving a clean slate on every restart

## Tech stack

| Layer    | Stack                                      |
|----------|--------------------------------------------|
| Mobile   | React Native · Expo SDK 51 · React Query   |
| Backend  | Node.js · Express · Mongoose · MongoDB Atlas |
| Auth     | JWT (access token in AsyncStorage)         |
| Payments | Razorpay (order creation only — sandbox)   |
| Storage  | Local disk (multer) — swap for S3 in prod  |

## Project structure

```
feedants/
├── backend/          Node.js API
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seed/     competitionData.js · autoSeed.js
│   │   └── server.js
│   └── .env.example
└── mobile/           Expo app
    ├── assets/
    │   └── screen_rec.mp4
    └── src/
        ├── api/
        ├── components/
        ├── screens/
        └── i18n/
```

## Running locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster (or local `mongod`)
- Expo Go app on your phone

### Backend

```bash
cd backend
cp .env.example .env          # fill in your MongoDB URI & JWT secret
npm install
npm start                     # auto-seeds competition data on startup
```

### Mobile

```bash
cd mobile
npm install
# For physical device on same Wi-Fi:
echo "EXPO_PUBLIC_API_URL=http://<your-LAN-IP>:5000/api" > .env
npx expo start --tunnel       # or just `npx expo start` on LAN
```

Scan the QR code in Expo Go.

## Demo credentials

| Email                | Password      |
|----------------------|---------------|
| demo@feedants.com    | Feedants@123  |
| guest@feedants.com   | Feedants@123  |
