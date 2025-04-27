# Salus AI - Campus Safety Incident Management System

Salus AI is a comprehensive platform designed to help educational institutions manage and analyze campus safety incidents. The system provides tools for reporting, tracking, and analyzing safety incidents, helping campus security teams make data-driven decisions to improve campus safety.

## Features

- **Incident Management**: Create, view, and manage campus safety incidents
- **AI-Powered Analysis**: Automatically analyze incident reports to extract key information
- **Category Management**: Organize incidents by customizable categories
- **Reporting Dashboard**: View trends and statistics about campus incidents

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Testing**: Vitest, React Testing Library
- **Deployment**: Vercel

## Project Structure

```
salus-ai-web/
├── public/
├── src/
│ ├── api/ # API client and resources
│ │ ├── client.ts
│ │ └── resources/
│ ├── components/ # Reusable React components
│ ├── config/ # Configuration files
│ ├── contexts/ # React contexts (Auth, etc.)
│ ├── hooks/ # Custom React hooks
│ ├── integrations/ # Third-party integrations
│ │ └── supabase/ # Supabase client and utilities
│ ├── pages/ # Page components
│ ├── styles/
│ ├── test/
│ ├── types/
│ ├── utils/
│ ├── App.tsx
│ └── main.tsx
├── supabase/ # Supabase edge functions
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/salus-ai.git
   cd salus-ai
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```
   touch .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials and other configuration.

### Development

Start the development server:

```sh
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:8080`.

### Testing

Run tests:

```sh
npm test
```
