# okayimbored - Project Details & Features

This document provides a comprehensive overview of the `okayimbored` project's details, features, and content. It serves as a central reference for understanding the architecture, mechanics, and user journey of the application.

## 🌌 Project Overview
`okayimbored` is an interactive, atmospheric web experience built for people who are bored. It functions as a digital labyrinth, a mood piece, and a storytelling platform. It uses deep probability-driven mechanics to present users with shifting narratives, secret rooms, rare events, and hidden endings based on user interactions, idle time, and real-world time of day.

## 🛠️ Technology Stack
- **Framework:** Astro 7
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4 (via Vite plugin)
- **Animations:** Framer Motion
- **Database / Backend:** Supabase (for logging interactions, stats, and session tracking)
- **Deployment Adapter:** Cloudflare Workers (`@astrojs/cloudflare`)

## ⚙️ Core Mechanics & Themes

1. **Time of Day (Shifts):** 
   The site behavior changes based on the user's local time, dividing the day into 4 shifts (`day`, `evening`, `night`, `afterhours`). This affects cat behavior (sleeping vs wandering), audio volume, and the likelihood of rare events. There is also a specific `/after-hours` page that behaves differently depending on whether it is accessed between midnight and 5:59 AM.

2. **Probability-Driven Events:** 
   The experience is governed heavily by RNG (Random Number Generation). Secret rooms, false endings, "archaeology" popups, and idle events are all probability-based, ensuring every visitor has a unique session.

3. **The Cat Motif:** 
   A recurring narrative and visual motif. Cats appear across various rooms (sometimes sleeping, sometimes walking) and influence the "interview" in the main flow.

4. **Labyrinthine Navigation:** 
   Secret rooms and deep building locations often have no UI back buttons. The user must use browser navigation or find hidden text links to escape, emphasizing the feeling of being lost in a digital building.

## 🧭 The Core Experience (Main Flow)

The main path (`/`) is an interactive "interview" consisting of 8 steps:
- **Step 1:** "Are you bored?"
- **Step 2:** Live stats display ("We don't believe them.")
- **Step 3:** Cat behavior fact.
- **Step 4:** The Interview (3 sub-questions about time, loneliness, and comfort).
- **Step 5:** The cat's intervention (paw print button).
- **Step 6:** Tarot Card Draw.
- **Step 7:** User choice on what they want to hear ("Something nice", "Something honest", etc.).
- **Step 8:** The Outro. Displays personalized content based on step 7, tiny invisible links to secret areas (`/rooftop`, `/wait`, `/polaroid`), and triggers a "False Ending".

## 🚪 Secret Rooms (0.8% trigger chance per step)

During steps 2-7 of the main flow, there is a 0.8% chance per click to be randomly transported to one of these 7 rooms:
1. **`/quiet`**: Ticking clock and calming sentence.
2. **`/window`**: Weather animation with live conditions.
3. **`/attic`**: A forgotten note (index card style).
4. **`/basement`**: Interactive torch mechanic. High chance of finding a cat. Includes rare events like lights going out or a tiny elevator opening.
5. **`/rooftop`**: Starfield canvas, city skyline, ambient wind audio, and shooting stars.
6. **`/wait`**: A waiting room where content reveals after 10 seconds.
7. **`/radio`**: 7 different frequencies broadcasting cryptic messages with static interruptions.

## 🏢 Deep Building Locations

These pages are accessible by URL guessing or via hidden links within the secret rooms:
- **`/lobby`**: Building directory and elevator. Features a 40% chance of a cat appearance and rare events like a ringing phone or flickering directory.
- **`/telephone`**: A ringing phone that must be answered within 20s. Features rare dialogue and standard mysterious messages.
- **`/notices`**: A notice board with random notes and a daily seeded notice. Notes can rarely fall off or pin themselves.
- **`/maintenance`**: Cycling CRT messages, flickering lights, and a toolbox.
- **`/cats`**: The "Cat Department" showcasing employee statuses, memos, and background cats.
- **`/archive`**: 7 sections of retired observations, records, and memories.
- **`/lost-and-found`**: Items arrive and are claimed dynamically over time.

## ✨ Rare & Hidden Events

- **Archaeology Overlay (5% chance):** During steps 2-6, users might find a digital artifact (99.9% standard, 0.1% rare).
- **Idle Event:** Waiting 45 seconds on any step (2-7) triggers a one-time message: "Why did you stay?"
- **API Trace Popup (40% chance):** Sometimes the server sends a trace message that interrupts the flow.
- **False Endings:** At the end of the experience (Step 8), users encounter 1 of 11 "false endings" before unlocking the logbook. Type 11 is an ultra-rare (0.01%) ending that takes 30 seconds to appear.
- **Tonight's Logbook (`/tonight`):** Unlocked after a false ending. Displays observations from the user's session, last visitor stats, and a website note.

## 📖 SEO & Discovery Pages
A collection of content-rich pages designed to capture organic search traffic and bring users into the experience:
- `/im-bored`
- `/what-to-do-when-bored`
- `/why-am-i-bored`
- `/games-to-play-when-bored`
- `/things-to-draw-when-bored`
- `/bored-at-night`
- `/bored-button`
- `/random-websites`
- `/about` & `/faq`

## 🎨 Design System
- **Colors:** Minimalist monochrome design (White/Off-white body, Near-black text).
- **Decoration:** Multi-stop mesh gradient (cyan-blue-magenta-amber) used only at hero scale.
- **Typography:** `Geist` (geometric sans) and `Geist Mono`.
- **Vibe:** Premium, stark, engineered, atmospheric, calm. Stacked, subtle shadows instead of heavy drops. Playful UI elements are avoided to preserve the mysterious tone.
