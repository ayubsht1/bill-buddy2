# Bill Buddy - Frontend

A full-stack expense splitting and bill sharing application built with Next.js, React, and Tailwind CSS.

## Prerequisites

- Node.js (v18 or higher)
- npm, yarn, pnpm, or bun

## Installation

1. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

2. **Environment setup**

   Copy the example environment file and update the values:

   ```bash
   cp .env.example .env
   ```

   Update the following environment variables in `.env`:

   - `NEXT_PUBLIC_API_URL` - Backend API URL (e.g., `http://localhost:8000/api`)
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth client ID
   - Any other variables as needed

3. **Running the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

   The page will auto-reload as you edit files. You can start editing the page by modifying `app/page.tsx`.

## Available Scripts

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the production application
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check for code issues

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about styling
- [Framer Motion Documentation](https://framer.com/motion) - learn about animations

## Project Structure

- `app/` - Next.js app router pages and layouts
- `components/` - Reusable React components
- `src/lib/` - Utility functions and API clients
- `src/store/` - State management stores
- `src/hooks/` - Custom React hooks

## Deploying

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js. Push your changes to GitHub and connect your repository to Vercel for automatic deployments.
