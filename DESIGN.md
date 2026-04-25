# Design System Strategy: The Focused Editorial

## 1. Overview & Creative North Star
**Creative North Star: "The Cognitive Sanctuary"**

This design system is not a utility; it is an environment. To facilitate "educational interception," the UI must transition from a tool into a headspace. We move away from the "Dashboard-as-a-Service" trope by adopting a **High-End Editorial** aesthetic. This is achieved through aggressive whitespace, intentional asymmetry, and a "No-Line" philosophy. 

The system rejects the rigid, boxed-in nature of standard SaaS. Instead, it treats the screen as a series of physical layers—fine paper and frosted glass—where the user’s focus is curated through tonal depth and typographic authority rather than structural noise.

---

## 2. Colors & Tonal Depth
The palette is built on psychological triggers: **Obsidian (#0F172A)** for grounding, **Emerald (#10B981)** for dopamine-driven achievement, and **Slate (#64748B)** for sophisticated accents, all resting on a **Cloud (#F8FAFC)** neutral base for cognitive breathing room.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to define sections or containers. 
*   **Containment via Shift:** Use the transition between `surface` and `surface-container-low` to define regions. 
*   **Containment via Space:** Use the Spacing Scale (Level 2: Normal) to let white space act as the boundary.

### Surface Hierarchy & Nesting
Treat the interface as a physical stack. The hierarchy is defined by "Lifting through Lightness" in Light Mode:
1.  **Base Layer:** `surface` (The foundation).
2.  **Sectional Layer:** `surface-container-low` (Subtle grouping of content).
3.  **Actionable Layer:** `surface-container-lowest` (Cards or interactive elements that "pop" forward).

### The "Glass & Gradient" Rule
To elevate the experience, use **Glassmorphism** for floating headers or navigation overlays. Apply `surface` at 70% opacity with a `24px` backdrop blur. 
*   **Signature Textures:** For primary calls-to-action or hero highlights, use a linear gradient: `primary-container` (top-left) to `primary` (bottom-right). This adds a "soul" to the obsidian focus areas that a flat hex code cannot achieve.

---

## 3. Typography: The Editorial Voice
We use **Plus Jakarta Sans** as a singular, powerful voice across headlines, body text, and labels. The hierarchy is intentionally dramatic to create an authoritative, premium feel.

*   **Display (lg/md):** Used for "Focus Moments" and achievement milestones. Tighten letter-spacing by `-0.02em` for a custom, high-fashion impact.
*   **Headline & Title:** Use `headline-lg` for section headers. Ensure there is significantly more "top-room" than "bottom-room" to create an editorial flow.
*   **Body (lg/md):** The workhorse. Set `body-lg` with a generous line-height (1.6) to ensure the educational content feels approachable, not academic.
*   **Labels:** Always uppercase with `+0.05em` letter spacing when used as category tags to provide a sophisticated contrast to the bold headlines.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering**, not shadows.

*   **The Layering Principle:** A card does not need a shadow if it is `surface-container-lowest` sitting on a `surface-container`. The 2% shift in value is enough for the human eye to perceive a layer change.
*   **Ambient Shadows:** If a component must "float" (e.g., a modal or floating action button), use a multi-layered "Ghost Shadow":
    *   *Shadow 1:* 0px 4px 20px (on-surface at 4% opacity).
    *   *Shadow 2:* 0px 10px 40px (on-surface at 2% opacity).
*   **The Ghost Border Fallback:** If accessibility requirements demand a border, use `outline-variant` at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons: The "Soft-Tactile" Interaction
*   **Primary:** High-contrast `primary` (Obsidian) background with `on-primary` text. Use **Moderate (Level 2)** rounded corners to make them feel organic yet structured.
*   **Success (Secondary):** Use `secondary` (Emerald) for growth-related actions (e.g., "Complete Lesson"). Apply a subtle inner-glow (1px white at 10% opacity) to give the emerald a "gem-like" quality.
*   **Tertiary:** No background. Use `title-sm` typography with a `primary` color.

### Interactive Cards & Lists
*   **The Card Rule:** No borders. Cards must use `surface-container-low` with Moderate (Level 2) rounding.
*   **Lists:** Forbid divider lines. Use consistent vertical padding according to the **Normal (Level 2)** spacing scale between items and a hover state that transitions the background to `surface-container-high`.

### Input Fields
*   **Structure:** Bottom-heavy padding. The label (`label-md`) should sit 8px above the field.
*   **State:** The field itself is `surface-container`. On focus, it transitions to `surface-container-lowest` with a subtle `primary` ghost-border (20% opacity).

### Focus-Specific Components
*   **The Interception Overlay:** A full-screen `surface` (70% opacity) with a heavy `backdrop-blur`. This "blinds" the user from distractions, leaving only the educational prompt in a `display-md` headline.
*   **The Progress Nebula:** A soft, blurred gradient using `secondary` (Emerald) and `tertiary-container` (Slate-based) to visualize growth without using clinical bar charts.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Asymmetry:** Place your headers slightly off-center or use varying column widths to make the app feel like a premium magazine.
*   **Use Tonal Transitions:** Separate the "Study" area from the "Navigation" area using a shift from `surface` to `surface-container-low`.
*   **Focus on Negative Space:** If a screen feels "busy," increase the padding (using Spacing Level 2) rather than adding a border or divider.

### Don’t:
*   **Don't use pure black:** Use the Obsidian `primary` (#0F172A) or `on-surface` tokens to maintain the premium, soft-dark feel.
*   **Don't use standard icons:** Use "light" or "thin" weight iconography to match the sophisticated Plus Jakarta Sans profile. 
*   **Don't use 100% opaque borders:** They break the "Cognitive Sanctuary" by creating visual "cages" for the content.