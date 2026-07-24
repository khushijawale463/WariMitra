# Pandharpur Wari - Digital Support Portal

A simple, plain-UI website addressing the problem statement:

> Lack of accessible information, navigation, emergency support, and digital participation
> options reduces the overall experience and inclusiveness of the Pandharpur Wari.

**Solution provided:** nearby facility information, emergency support, and a digital seva
platform for remote devotees.

## Tech Stack
- Frontend: HTML/CSS rendered via EJS templates (plain white background, no heavy UI/UX)
- Backend: Node.js + Express + EJS
- Database: MongoDB (via Mongoose)

## Features
1. **Home** — problem statement, solution overview, navigation to all sections.
2. **Nearby Facilities** — list/filter medical, food, water, toilet, shelter, and parking
   points; add or delete a facility.
3. **Emergency Support** — static helpline numbers + a form to submit an emergency report
   (name, phone, type, location, description) stored in MongoDB.
4. **Digital Seva** — form for remote devotees to register seva (Annadan, medical seva,
   donation, volunteering) and see recent contributions.

## Project Structure
```
pandharpur-wari-app/
├── models/
│   ├── Facility.js
│   ├── EmergencyReport.js
│   └── SevaRequest.js
├── routes/
│   ├── index.js
│   ├── facilities.js
│   ├── emergency.js
│   └── seva.js
├── views/
│   ├── partials/
│   │   ├── header.ejs
│   │   └── footer.ejs
│   ├── index.ejs
│   ├── facilities.ejs
│   ├── emergency.ejs
│   ├── seva.ejs
│   └── 404.ejs
├── public/
│   └── css/style.css
├── server.js
├── package.json
└── .env.example
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   Copy `.env.example` to `.env` and set your MongoDB connection string:
   ```bash
   cp .env.example .env
   ```
   - For local MongoDB: `mongodb://127.0.0.1:27017/pandharpur_wari`
   - For MongoDB Atlas: use your Atlas connection string instead.

3. **Run MongoDB**
   Make sure MongoDB is running locally, or that your Atlas cluster is reachable.

4. **Start the server**
   ```bash
   npm start
   ```
   or, for auto-reload during development:
   ```bash
   npm run dev
   ```

5. Open **http://localhost:3000** in your browser.

## Notes
- The design is intentionally plain (white background, simple tables and forms, minimal
  styling) as requested — no complex UI/UX components.
- Emergency helpline numbers in `routes/emergency.js` are placeholders — replace with
  actual official numbers for deployment.
- This is a functional MVP. Suggested next steps: admin login for managing facilities/
  reports, live map integration for navigation, SMS/WhatsApp alerts for emergencies, and
  a payment gateway for seva donations.
