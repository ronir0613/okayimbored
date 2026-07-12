# okayimbored - Detailed Content & File Flowchart

This document maps out the current architecture, files, and user journeys of the `okayimbored` project after recent simplifications.

## 📁 Directory Structure & File Roles

### `src/pages/` (Routes)
- **`index.astro`**: The main entry point. Mounts the `Experience.tsx` component.
- **`tonight.astro`**: The logbook page shown after the main flow ends.
- **Secret Rooms**: `window.astro`, `basement.astro`, `rooftop.astro`, `radio.astro`, `telephone.astro`, `quiet.astro`, `wait.astro`, `attic.astro`.
- **Deep Building**: `lobby.astro`, `archive.astro`, `maintenance.astro`, `notices.astro`, `cats.astro`, `lost-and-found.astro`.
- **SEO/Discovery**: `im-bored.astro`, `about.astro`, `faq.astro`, `games-to-play-when-bored.astro`, `things-to-draw-when-bored.astro`, etc.

### `src/components/` (Interactive Logic)
- **`Experience.tsx`**: The core 8-step interview flow. Handles state, questions, rare events, and transitions.
- **`TheLobby.tsx`**: The building directory and elevator hub.
- **`TheBasement.tsx`**: Interactive torch mechanic, cats, hidden fuse box.
- **`RadioRoom.tsx`**: Radio frequency tuning and cryptic audio.
- **`TelephoneRoom.tsx`**: Ringing phone with answering mechanic.
- **`TonightLogbook.tsx`**: Displays session stats and echoes after the user finishes the main flow.
- **`TarotCards.tsx`**: The card drawing logic used in the main experience.
- **`ArchaeologyEvent.tsx`**: The rare popup event in the main flow.
- **`WindowExperience.tsx` / `RooftopExperience.tsx` / `Archive.tsx` / etc**: Specialized logic for individual secret rooms.

### `src/lib/` (Core Utilities)
- **`echoes.ts`**: Manages `sessionStorage` for invisible narrative journeys (tracking where the user has been and choices they made).
- **`store.ts`**: Zustand state management for local metrics like restlessness, curiosity, and pity timers for secret rooms.
- **`supabase.ts`**: Database connection for stats and logging interactions.
- **`shift.ts`**: Time-of-day logic (Day, Evening, Night, After Hours).

---

## 🗺️ User Journey Flowchart

```mermaid
flowchart TD
    %% Main Flow
    ENTRY["🌐 / (index.astro)\nMounts Experience.tsx"] --> STEP1["Step 1: Opening Question"]
    
    subgraph "The Experience (8-Step Interview Flow)"
        STEP1 --> STEP2["Step 2: Live Stats"]
        STEP2 --> STEP3["Step 3: Time Observation"]
        STEP3 --> STEP4["Step 4: Question 1"]
        STEP4 --> STEP5["Step 5: Reaction 1"]
        STEP5 --> STEP6["Step 6: Question 2"]
        STEP6 --> STEP7["Step 7: Reaction 2 & Cat"]
        STEP7 --> STEP8["Step 8: Question 3"]
        STEP8 --> TAROT["Tarot Card Draw"]
        TAROT --> FALSE_ENDING["False Endings (1-11)"]
        
        %% Rare Events during steps
        STEP2 -.->|Secret Room Chance| SECRET_ROOMS
        STEP3 -.->|Secret Room Chance| SECRET_ROOMS
        STEP4 -.->|Secret Room Chance| SECRET_ROOMS
        STEP5 -.->|Secret Room Chance| SECRET_ROOMS
        
        STEP3 -.->|5% Chance| ARCHAEOLOGY["Archaeology Popup"]
    end

    FALSE_ENDING -->|Delay| TONIGHT["/tonight\nTonightLogbook.tsx"]

    subgraph "Secret Rooms (Randomly Accessed)"
        SECRET_ROOMS{"Random Secret Room\n(Triggered during Interview)"}
        SECRET_ROOMS -->|Navigate| WINDOW["/window\n(Weather)"]
        SECRET_ROOMS -->|Navigate| BASEMENT["/basement\n(Torch & Cat)"]
        SECRET_ROOMS -->|Navigate| ROOFTOP["/rooftop\n(Stars)"]
        SECRET_ROOMS -->|Navigate| RADIO["/radio\n(Frequencies)"]
        SECRET_ROOMS -->|Navigate| QUIET["/quiet"]
        SECRET_ROOMS -->|Navigate| WAIT["/wait"]
        SECRET_ROOMS -->|Navigate| ATTIC["/attic"]
    end
    
    subgraph "Deep Building (Hidden Links & Hubs)"
        BASEMENT -.->|Hidden Fuse Box| MAINTENANCE["/maintenance"]
        RADIO -.->|Tune past 106.2| TELEPHONE["/telephone"]
        TELEPHONE -.->|Missed Call Trapdoor| BASEMENT
        
        LOBBY["/lobby\n(Directory & Elevator)"] -->|Elevator| WINDOW
        LOBBY -->|Elevator| RADIO
        LOBBY -->|Directory| ARCHIVE["/archive"]
        LOBBY -->|Directory| CATS["/cats"]
        LOBBY -->|Directory| MAINTENANCE
    end
```

## 🔄 Core Mechanics Explained

1. **The Interview (`Experience.tsx`)**: The user goes through conversational prompts. Their `restlessness` and `curiosity` scores are tracked via Zustand. If they click too quickly, restlessness increases. 
2. **Secret Rooms Chance**: Between steps 2-9, there is a small chance (augmented by a pity timer and curiosity score) to interrupt the interview and redirect the user to a secret room (e.g., `/window`, `/basement`).
3. **Echoes (`sessionStorage`)**: Actions (like answering the phone, choosing honesty, or visiting the basement) are logged as "echoes" which subtly alter text and probabilities in other rooms across the site.
4. **False Endings**: At the end of the interview, the user is presented with one of 11 "false endings". Which ending they get is heavily determined by their echoes and scores. They are eventually redirected to `/tonight` to read their customized logbook.
