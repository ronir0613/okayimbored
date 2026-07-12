# okayimbored — Project Files & Components List

This document provides a comprehensive list of all the pages, components, and utility files currently present in the project up to V28.

## 📄 Pages (`src/pages/`)
These are the route entry points for the application.

### Core Experience & Deep Building
- **`index.astro`**: The main entry point of the site. Mounts the `Experience.tsx` interview.
- **`after-hours.astro`**: Hidden late-night page with time-gated access (midnight - 5:59 AM).
- **`tonight.astro`**: The logbook page shown after completing the false endings.
- **`lobby.astro`**: The building directory and elevator hub.
- **`archive.astro`**: The forgotten archive of records and memories.
- **`cats.astro`**: The "Cat Department" showcasing employee statuses and memos.
- **`cats-showcase.astro`**: Alternate showcase for the pixel cats.
- **`lost-and-found.astro`**: Dynamic item claiming/arriving system.
- **`maintenance.astro`**: CRT messages and flickering lights.
- **`notices.astro`**: A bulletin board of cryptic notes.
- **`radio.astro`**: Radio frequency tuning component with cryptic broadcasts.
- **`telephone.astro`**: Ringing phone with answering mechanic.

### Secret Rooms
- **`basement.astro`**: Torch mechanic, cats with glowing eyes, and hidden links.
- **`rooftop.astro`**: Starfield canvas and shooting stars.
- **`window.astro`**: Weather animation with live conditions.
- **`quiet.astro`**: Ticking clock and calming sentence.
- **`wait.astro`**: Waiting room, content reveals after 10s.
- **`attic.astro`**: A forgotten index card.
- **`polaroid.astro`**: A polaroid view.

### SEO & Discovery
- **`404.astro`**: Standard page not found.
- **`about.astro`**: About the project.
- **`faq.astro`**: Frequently asked questions.
- **`bored-at-night.astro`**: SEO landing page.
- **`bored-button.astro`**: SEO landing page.
- **`games-to-play-when-bored.astro`**: SEO landing page.
- **`im-bored.astro`**: SEO landing page.
- **`random-websites.astro`**: SEO landing page.
- **`things-to-draw-when-bored.astro`**: SEO landing page.
- **`what-to-do-when-bored.astro`**: SEO landing page.
- **`why-am-i-bored.astro`**: SEO landing page.

---

## 🧩 Components (`src/components/`)
These are the React and Astro components that handle the state, interactivity, and UI rendering.

### Core Interview
- **`Experience.tsx`**: The massive 8-step interview flow. Handles conversational questions, false endings, secret room triggers, and idle events.
- **`TarotCards.tsx`**: The card drawing logic used in Step 6 of the main experience.
- **`ArchaeologyEvent.tsx`**: The rare popup event that randomly interrupts steps 2-6.
- **`CuriosityEvent.tsx`**: Logic for curiosity-driven popups or interventions.
- **`ScreenTransition.tsx`**: Framer Motion wrapper for smooth step transitions.

### Deep Building & Rooms
- **`TheLobby.tsx`**: Handles the building directory, elevator, and ambient lobby events.
- **`TheBasement.tsx`**: Implements the mouse/touch torch mechanic and basement cat logic.
- **`RadioRoom.tsx`**: Radio frequency tuning UI and cryptic broadcasts.
- **`TelephoneRoom.tsx`**: Ringing phone, dialogue trees, and 20s timeout logic.
- **`NoticeBoard.tsx`**: Renders the bulletin board, pins notes, and handles the daily seeded note.
- **`MaintenanceRoom.tsx`**: Cycling CRT messages, flickering CSS animations.
- **`CatDepartment.tsx`**: Office for the cats, with rare sleeping employee events.
- **`LostAndFound.tsx`**: Dynamic item claiming/arriving system with fading animations.
- **`Archive.tsx`**: 7 sections of retired project history with rare text triggers.
- **`TonightLogbook.tsx`**: Displays session stats and echoes after the user finishes the main flow.
- **`RooftopExperience.tsx`**: Canvas rendering for stars, shooting stars, and ambient city skyline.
- **`WindowExperience.tsx`**: Weather animation logic.

### UI & Global
- **`Atmosphere.tsx`**: Global audio and ambient noise manager.
- **`MicroWidget.tsx`**: Small interactive widgets or overlays.
- **`RecordPlayer.tsx`**: Interactive vinyl record player logic.
- **`ShiftAmbience.tsx`**: Visual filters and lighting based on the time of day.
- **`Welcome.astro`**: Entry/welcome screen UI elements.
- **`FAQ.astro`**: FAQ accordion and layout components.

### Living Cats
- **`LivingCats/PixelCat.tsx`**: The core component that handles rendering pixel cats in various states (idle, walking, sleeping) and flipping them based on direction.

---

## 🛠️ Utilities & Logic (`src/lib/` & `src/data/`)

### State & Storage
- **`echoes.ts`**: Manages `sessionStorage` for "Invisible Narrative Journeys", tracking where the user has been and the choices they made (e.g. `tarot_the_moon`, `visited_basement`).
- **`store.ts`**: Zustand state management for local session metrics (restlessness score, curiosity score, and pity timers for secret rooms).
- **`supabase.ts`**: Database connection and queries for recording stats and logging interactions.

### Logic & Content Generation
- **`shift.ts`**: Time-of-day logic (Day, Evening, Night, After Hours) which modifies global behavior and cat appearance chances.
- **`archaeology.ts`**: Generator and data list for the Archaeology Event popups (rare vs standard artifacts).
- **`curiosity.ts`**: Generator for curiosity-driven events or texts.

### Data
- **`src/data/faq.ts`**: Contains the raw question and answer data for the FAQ pages to keep the UI components clean.
