# Melody Scope

A modern React application built with TypeScript, Vite, Chakra UI, and Zustand.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Chakra UI** - Component library
- **Zustand** - State management
- **ESLint** - Code linting

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18 or higher recommended)
- **npm** (comes with Node.js) or **yarn** or **pnpm**

You can verify your installation by running:

```bash
node --version
npm --version
```

## Setup Instructions

### 1. Clone the Repository

If you haven't already, clone the repository to your local machine:

```bash
git clone <repository-url>
cd artist-showcase
```

### 2. Install Dependencies

Install all project dependencies using npm:

```bash
npm install
```

This will install all the required packages listed in `package.json`, including React, TypeScript, Vite, Chakra UI, and other dependencies.

### 3. Environment Configuration

The application requires a Last.fm API key to fetch music data. You'll need to set up environment variables:

1. Create a `.env` file in the root directory of the project:

```bash
touch .env
```

2. Add your Last.fm API key to the `.env` file:

```env
VITE_LASTFM_API_KEY=your_api_key_here
```

**Getting a Last.fm API Key:**
- Visit [Last.fm API](https://www.last.fm/api/account/create)
- Sign up for a free API account
- Create a new API application
- Copy your API key and paste it into the `.env` file

> **Note:** Never commit your `.env` file to version control. It should already be in `.gitignore`.

### 4. Verify Setup

After installation, verify that everything is set up correctly by checking for any errors during the installation process. The project structure should look like this:

```
artist-showcase/
├── src/
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
└── .env
```

## Running the Application

### Development Mode

To start the development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is occupied). The terminal will display the exact URL.

The development server includes:
- **Hot Module Replacement (HMR)** - Changes reflect instantly in the browser
- **Fast Refresh** - React components update without losing state
- **TypeScript type checking** - Errors are shown in the terminal

### Production Build

To create an optimized production build:

```bash
npm run build
```

This will:
- Compile TypeScript
- Bundle and minify the code
- Optimize assets
- Generate output in the `dist/` directory

