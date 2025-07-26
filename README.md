# AI Agent Chat Interface

A modern, responsive chat interface for AI agents with session management and persistent chat history.

## Features

- 💬 Real-time chat interface
- 📂 Session management
- 💾 Persistent chat history
- 🎨 Clean, modern UI with dark/light mode
- ⚡ Built with Vite for fast development

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```sh
   git clone <YOUR_GIT_URL>
   cd session-chat-buddy-main
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Start the development server:
   ```sh
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Technologies Used

- ⚡ Vite - Next Generation Frontend Tooling
- ⚛️ React 18 - A JavaScript library for building user interfaces
- 📝 TypeScript - Type-safe JavaScript
- 🎨 shadcn/ui - Beautifully designed components
- 🎨 Tailwind CSS - A utility-first CSS framework
- 🔄 React Query - For data fetching and state management

## Project Structure

```
src/
  ├── components/    # Reusable UI components
  ├── hooks/        # Custom React hooks
  ├── lib/          # Utility functions
  └── pages/        # Page components
```

## Deployment

### Building for Production

```sh
npm run build
```

This will create a `dist` directory with the production build.

### Deploying to Vercel

1. Install Vercel CLI:
   ```sh
   npm install -g vercel
   ```

2. Deploy:
   ```sh
   vercel
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
