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

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

This serves the built application from the `dist/` directory, allowing you to test the production build before deployment.

### Linting

To check for code quality issues:

```bash
npm run lint
```

To automatically fix many linting issues:

```bash
npm run lint -- --fix
```

## Chakra UI

[Chakra UI](https://chakra-ui.com/) is already set up and ready to use. The `ChakraProvider` is configured in `src/main.tsx`, so you can use any Chakra UI components throughout your application.

### Example Usage

```tsx
import { Button, Box, Heading } from '@chakra-ui/react'

function MyComponent() {
  return (
    <Box p={4}>
      <Heading>Hello Chakra UI</Heading>
      <Button colorScheme="blue">Click me</Button>
    </Box>
  )
}
```

### Customizing the Theme

You can customize the Chakra UI theme by creating a theme configuration and passing it to `ChakraProvider`:

```tsx
import { ChakraProvider, extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  colors: {
    brand: {
      500: '#your-color',
    },
  },
})

<ChakraProvider theme={theme}>
  <App />
</ChakraProvider>
```

## Zustand

[Zustand](https://zustand-demo.pmnd.rs/) is configured for state management. An example store is available at `src/store/useStore.ts`.

### Example Store

```tsx
import { create } from 'zustand'

interface StoreState {
  count: number
  increment: () => void
  decrement: () => void
}

export const useStore = create<StoreState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}))
```

### Using the Store

```tsx
import { useStore } from './store/useStore'

function MyComponent() {
  const { count, increment, decrement } = useStore()
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  )
}
```

## Linter Setup

ESLint is already configured and ready to use. The project includes:

- **ESLint 9** with flat config format
- **TypeScript ESLint** for TypeScript-specific rules
- **React Hooks** plugin for React Hooks rules
- **React Refresh** plugin for Vite HMR compatibility

### Running the Linter

To check for linting errors in your code:

```bash
npm run lint
```

This will scan all TypeScript and TSX files in your project and report any linting issues.

### IDE Integration

Most modern IDEs (VS Code, WebStorm, etc.) will automatically detect and use the ESLint configuration. Make sure you have the ESLint extension installed in your IDE to see linting errors in real-time as you code.

### Auto-fixing Issues

To automatically fix many linting issues:

```bash
npm run lint -- --fix
```

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
