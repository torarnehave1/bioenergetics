# Body Experience App

A bioenergetic analysis application for instructors and students, built with Vue 3 and Cloudflare Workers.

## Features

### Student Features
- **UC1: Log Body Experiences** - Record sensations before/after exercises
- **UC2: Guided Grounding Exercises** - Access exercises to connect with the body
- **UC3: Breathing Exercises** - Breath awareness and regulation practices
- **UC4: Explore Reich's 7 Body Segments** - Learn about body segments and their significance
- **UC5: View Progress Over Time** - Visualize patterns with charts

### Instructor Features
- **UC6: Manage Exercise Library** - Create, edit, and organize exercises
- **UC7: Track Student Progress** - View student data (with consent)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vue 3 + Vite |
| Backend | Cloudflare Workers |
| Database | Cloudflare D1 |
| Auth | Magic Link |
| Hosting | Cloudflare Pages |

## Project Structure

```
bioenergetics/
├── src/                    # Vue 3 frontend
│   ├── components/         # Reusable components
│   │   ├── BodyMap.vue     # Interactive body segment mapping
│   │   ├── NavBar.vue      # Navigation
│   │   ├── RatingScale.vue # Rating input component
│   │   └── SafetyBanner.vue # Safety resources
│   ├── views/              # Page components
│   │   ├── Home.vue
│   │   ├── Login.vue
│   │   ├── Dashboard.vue
│   │   ├── LogExperience.vue
│   │   ├── Exercises.vue
│   │   ├── Progress.vue
│   │   ├── BodySegments.vue
│   │   └── InstructorDashboard.vue
│   ├── stores/             # Pinia stores
│   │   ├── auth.js
│   │   ├── experiences.js
│   │   ├── exercises.js
│   │   ├── segments.js
│   │   └── progress.js
│   ├── router/             # Vue Router
│   ├── styles/             # Global CSS
│   └── utils/              # API utilities
├── worker/                 # Cloudflare Worker backend
│   ├── src/
│   │   ├── index.ts        # Main entry point
│   │   ├── auth.ts         # Magic link authentication
│   │   ├── exercises.ts    # Exercise CRUD
│   │   ├── experiences.ts  # Body experience logging
│   │   ├── segments.ts     # Body segments
│   │   ├── users.ts        # User management
│   │   └── progress.ts     # Progress analytics
│   └── schema.sql          # D1 database schema
├── package.json
├── vite.config.js
└── wrangler.toml
```

## Getting Started

### Prerequisites
- Node.js 18+
- Wrangler CLI (`npm install -g wrangler`)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create D1 database:
```bash
wrangler d1 create body-experience-db
```

3. Update `wrangler.toml` with your database ID

4. Run migrations:
```bash
npm run db:migrate:local
```

### Development

Start the frontend:
```bash
npm run dev
```

Start the worker (in another terminal):
```bash
npm run worker:dev
```

### Deployment

Build frontend:
```bash
npm run build
```

Deploy worker:
```bash
npm run worker:deploy
```

## API Endpoints

### Authentication
- `POST /api/auth/check-email` - Check if email exists
- `POST /api/auth/magic-link` - Request magic link
- `POST /api/auth/verify` - Verify magic link token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Exercises
- `GET /api/exercises` - List exercises
- `GET /api/exercises/:id` - Get exercise
- `POST /api/exercises` - Create exercise (instructor)
- `PUT /api/exercises/:id` - Update exercise
- `DELETE /api/exercises/:id` - Delete exercise

### Body Experiences
- `GET /api/experiences` - List experiences
- `POST /api/experiences` - Log experience
- `GET /api/experiences/:id` - Get experience
- `DELETE /api/experiences/:id` - Delete experience
- `POST /api/experiences/safety-checkin` - Submit safety check

### Progress
- `GET /api/progress` - Get summary
- `GET /api/progress/trends` - Get rating trends
- `GET /api/progress/segments` - Get segment data
- `GET /api/progress/comparisons` - Get before/after comparisons

## Reich's 7 Body Segments

1. **Ocular** - Eyes, forehead, scalp
2. **Oral** - Mouth, jaw, throat
3. **Cervical** - Neck and upper shoulders
4. **Thoracic** - Chest, arms, hands
5. **Diaphragmatic** - Diaphragm, solar plexus
6. **Abdominal** - Abdomen, lower back
7. **Pelvic** - Pelvis, legs, feet

## Safety Features

- Safety banner with crisis resources
- Safety check-ins after exercises
- Grounding techniques accessible anytime
- Consent-based instructor tracking

## License

MIT
