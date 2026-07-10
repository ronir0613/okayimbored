# okayimbored — AI Assistant Context

## 🌌 Project Overview
`okayimbored` is an interactive, atmospheric web experience built for people who are bored. It functions as a digital labyrinth, a mood piece, and a storytelling platform. It uses deep probability-driven mechanics to present users with shifting narratives, secret rooms, rare events, and hidden endings based on user interactions, idle time, and real-world time of day.

## 🛠️ Technology Stack
- **Framework:** Astro 7
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4 (Vite plugin)
- **Animations:** Framer Motion
- **Database / Backend:** Supabase
- **Deployment & Package Manager:** Node >= 22.12.0, standard npm scripts (`npm run dev`).

## 📁 Architecture & Structure
- **`src/pages/`**: Contains all the routes. 
  - **Core Routes:** `index.astro` (main flow), `tonight.astro` (logbook), `after-hours.astro`.
  - **Secret Rooms:** `basement.astro`, `lobby.astro`, `telephone.astro`, `radio.astro`, `rooftop.astro`, `archive.astro`, etc.
  - **SEO Content:** `/im-bored`, `/why-am-i-bored`, `/random-websites`, etc.
- **`src/components/`**: Heavy lifting is done by React components. 
  - `Experience.tsx`: The main interactive storytelling flow.
  - `TheBasement.tsx`, `TheLobby.tsx`, `RadioRoom.tsx`, `CatDepartment.tsx`, `TelephoneRoom.tsx`: Complex, stateful room components.
- **`src/lib/`**: Core logic utilities.
  - `shift.ts`: Calculates the time of day shift (`day`, `evening`, `night`, `afterhours`).
  - `archaeology.ts`: Logic for dispensing digital artifacts.
  - `supabase.ts`: Database integration for logs and statistics.
- **`flowchart.md`**: CRITICAL REFERENCE. Contains the entire logic tree, probabilities, and user journey for the core experience and secret rooms.
- **`DESIGN.md`**: The design system specification (Vercel-inspired monochrome + mesh gradient).

## 🎨 Design System & Aesthetics
- Documented extensively in `DESIGN.md`.
- **Core Colors:** `{colors.canvas}` (White), `{colors.canvas-soft}` (Off-white body), `{colors.primary}` / `{colors.ink}` (Near-black).
- **Decoration:** A multi-stop mesh gradient (cyan-blue-magenta-amber) used only at hero scale. No generic colorful borders or playful themes.
- **Typography:** Geist (geometric sans) and Geist Mono (for technical/code elements). Negative tracking on headings, sentence-case, period-terminated.
- **Vibe:** Premium, stark, engineered, atmospheric, calm. Stacked, subtle shadows instead of heavy drops.

## ⚙️ Core Mechanics & Themes
- **Time of Day (Shifts):** The site behavior changes based on the user's local time (e.g., higher chance of rare events late at night, audio volume changes, specific `/after-hours` page).
- **Probability-Driven Events:** Secret rooms, false endings, "archaeology" popups, and idle events are governed by RNG (e.g., 0.8% chance per step to fall into a secret room, 40% chance of a sleeping cat in the basement).
- **The Cat:** A recurring narrative and visual motif. Cats appear across various rooms, sometimes sleeping, sometimes walking, influencing the "interview" in the main flow.
- **Secret Nav & No Back Buttons:** Deep rooms (like `/lobby` or `/basement`) often have no UI back buttons. The user must guess URLs or use browser navigation to escape, emphasizing the labyrinthine feel.

## 🤖 AI / Claude Guidelines
1. **Preserve the Mystery:** When editing content or logic, maintain the atmospheric, slightly cryptic tone. Do not make navigation artificially easy.
2. **Respect Probabilities:** Any new event or room should be woven into the existing probability structure without breaking the delicate balance of rare vs. common occurrences (refer to `flowchart.md`).
3. **Follow the Design Language:** Strictly adhere to the Vercel-inspired starkness. Do not inject colorful UI elements, playful fonts, or rounded bubbly buttons unless explicitly instructed.
4. **Development Workflow:** 
   - Start the dev server in background mode: `astro dev --background`
   - Manage it with `astro dev stop`, `astro dev status`, and `astro dev logs`.
5. **Check Key Documents:** Always refer to `flowchart.md` before changing routing/probabilities, and `DESIGN.md` before adding new UI components.
