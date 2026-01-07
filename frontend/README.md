# 🎓 Classroom Gacha (知识召唤阵)

A gamified classroom management tool that turns student selection into an exciting Gacha (summoning) experience. Features rarity levels, experience tracking, and interactive visual effects to make classroom participation fun.

![Classroom Gacha](https://images.unsplash.com/photo-1612306263592-23c2a6327e57?auto=format&fit=crop&q=80&w=1000&ixlib=rb-4.0.3)

## ✨ Features

- **Gacha Summoning System**: Randomly select students with a visually engaging summoning animation.
- **Rarity System**: Students have rarity levels (N, R, SR, SSR, UR, EX) based on their participation/performance.
- **Smart Weighting**: Algorithms automatically balance selection probabilities—students with fewer picks are prioritized, while high-star students appear less frequently to maintain balance.
- **Stats Tracking**:
  - Track pick counts for every student.
  - "Hard Work" Leaderboard (Most picked).
  - "Lucky" Leaderboard (Highest rarity).
- **Interactive UI**:
  - Particle effects and holographic animations for high-rarity cards.
  - Sound effect visual cues (Level Up animations).
  - Responsive design (Works on Desktop & Mobile).

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (Version 16 or higher)
- npm or yarn

### Installation

1.  **Install dependencies**
    Open your terminal in the project directory and run:
    ```bash
    npm install
    ```

2.  **Start the development server**
    ```bash
    npm run dev
    ```

3.  **Open the application**
    Click the link shown in the terminal (usually `http://localhost:5173`) to view the app in your browser.

### Building for Production

To create a production-ready build:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 📂 Project Structure

- `src/components`: Reusable UI components (Card, Particles).
- `src/constants.ts`: Initial student data and configuration.
- `src/types.ts`: TypeScript interfaces.
- `src/App.tsx`: Main application logic.
- `index.html`: Entry HTML file.

## 🎨 Customization

You can modify the initial student list in `src/constants.ts`:

```typescript
export const INITIAL_NAMES = [
  "Student A", "Student B", "Student C", ...
];
```

## 📄 License

MIT
