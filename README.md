
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/cacd56d9-98e1-44ab-bb41-d3214434b57e

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/cacd56d9-98e1-44ab-bb41-d3214434b57e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Running Tests

This project uses Vitest for testing React components and Deno for testing edge functions.

### Frontend Tests

To run frontend tests, you need to add a test script to your package.json:

```sh
npm pkg set scripts.test="vitest run"
npm pkg set scripts.test:watch="vitest"
npm pkg set scripts.test:coverage="vitest run --coverage"
```

Then you can run the tests with:

```sh
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Edge Function Tests

To run edge function tests, you need to have Deno installed. You can run the tests with:

```sh
# Navigate to the edge function directory
cd supabase/functions/process-incident

# Run tests
deno test --allow-net --allow-read --allow-env
```

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Vitest (Testing)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/cacd56d9-98e1-44ab-bb41-d3214434b57e) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
