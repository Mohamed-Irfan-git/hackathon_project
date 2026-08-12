---
name: Striver Architecture
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#3e484d'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#6e797e'
  outline-variant: '#bdc8ce'
  surface-tint: '#006780'
  primary: '#00647c'
  on-primary: '#ffffff'
  primary-container: '#007f9d'
  on-primary-container: '#fafdff'
  inverse-primary: '#6cd3f7'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#894e00'
  on-tertiary: '#ffffff'
  tertiary-container: '#a86516'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b7eaff'
  primary-fixed-dim: '#6cd3f7'
  on-primary-fixed: '#001f28'
  on-primary-fixed-variant: '#004e61'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#ffdcbf'
  tertiary-fixed-dim: '#ffb873'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#6a3b00'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
typography:
  display:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
  mono:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  gutter: 16px
  sidebar-width: 260px
  max-width-content: 1200px
---

## Brand & Style

This design system is built for a high-performance edtech and SaaS environment, focusing on clarity, focus, and technical precision. The aesthetic is **Modern Minimalist** with a **Linear-inspired** utility. 

The brand personality is authoritative yet accessible, designed to feel like a premium tool for serious learners and professionals. It prioritizes information density without clutter, utilizing generous whitespace and a "structural" visual language. The UI should evoke a sense of organized intelligence, where AI features feel like integrated enhancements rather than distracting novelties.

## Colors

The palette is anchored by **Deep Cyan** for primary navigation and core actions, providing a calm but confident interactive layer. 

- **AI Core:** The Warm Amber (#f59e0b) is reserved exclusively for AI-powered insights, "AI Match" scores, and automated feedback loops. This creates a mental shortcut for the user to identify machine-generated intelligence.
- **Neutrals:** A tight range of grays manages the structural hierarchy. Surfaces utilize `#f9fafb` to distinguish between the canvas and interactive containers.
- **Borders:** Use `#e5e7eb` for standard structural divisions. For high-density data views, borders should be preferred over shadows to maintain a clean, "architectural" feel.

## Typography

The system uses a tri-font strategy to differentiate between intent:
1. **Hanken Grotesk** for headings: A modern, sharp typeface that provides a sophisticated SaaS "edge."
2. **Inter** for body text: The gold standard for readability in dashboard environments.
3. **Geist** for labels and technical data: Its monospaced-leaning proportions are perfect for status badges, AI tags, and code-related content.

For mobile, `display` and `headline-lg` should scale down by 20% to maintain comfortable reading widths.

## Layout & Spacing

This design system utilizes a **Fixed-Fluid Hybrid Grid**. 
- **Navigation:** A permanent left sidebar (260px) for high-level information architecture, paired with a slim top bar for contextual actions.
- **Content:** Central content resides in a container with a max-width of 1200px to ensure line lengths remain readable for educational material.
- **Rhythm:** An 8px linear scale (4px, 8px, 16px, 24px, 32px, 48px, 64px) dictates all margins and padding. 
- **Mobile:** The sidebar collapses into a bottom navigation bar or a hamburger menu, and horizontal container padding reduces from 24px to 16px.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Subtle Outlines** rather than heavy shadows.
- **Level 0 (Canvas):** Pure white `#ffffff`.
- **Level 1 (Sub-navigation/Sidebar):** Gray `#f9fafb` with a 1px right-border of `#e5e7eb`.
- **Level 2 (Cards/Modals):** White background with a 1px border of `#e5e7eb`. 
- **Shadows:** Only used on floating elements (dropdowns, modals). Use a "soft-diffused" shadow: `0 4px 12px rgba(0, 0, 0, 0.05)`. 
- **AI Elevation:** Elements utilizing the secondary Amber color may use a very subtle glow `0 0 8px rgba(245, 158, 11, 0.1)` to differentiate machine-learning components.

## Shapes

The design system uses a **Rounded (8px)** base to strike a balance between professional precision and modern friendliness.

- **Small Components (Buttons, Inputs, Checkboxes):** 8px radius.
- **Medium Components (Cards, Modals):** 12px radius.
- **Large Components (Sections):** 16px radius.
- **Pills (Badges, Status Tags):** Full rounding (999px) to distinguish them from interactive buttons.

## Components

### Buttons & Inputs
- **Primary Action:** Deep Cyan (#0891b2) with white text. No gradient. High-contrast hover state (10% darker).
- **Secondary Action:** Ghost style. Transparent background with a 1px border (#e5e7eb) and Dark Gray text.
- **Inputs:** 1px border (#e5e7eb) with 8px padding. Focus state uses a 2px Deep Cyan ring with 0% offset.

### AI Match Badge
The signature component for AI features. 
- **Styling:** Warm Amber (#f59e0b) background (10% opacity) with a solid Amber border and text. 
- **Iconography:** Must include a 12px "Sparkle" icon prefix.
- **Typography:** Uses `label-sm` (Geist) in uppercase for a technical feel.

### Cards
- **Structure:** White background, 1px border (#e5e7eb), 12px radius.
- **Header:** Optional subtle gray (#f9fafb) top-section for metadata.
- **Interactive Cards:** On hover, the border color shifts to Deep Cyan and a 4px soft shadow is applied.

### Status Badges
- **Verified/Success:** Green background (10% opacity) with solid Green text.
- **Pending:** Amber background (10% opacity) with solid Amber text.
- **Rejected:** Red background (10% opacity) with solid Red text.
- **Shape:** All status badges are pill-shaped (999px).

### Sidebar & Navigation
- **Sidebar:** Light gray background (#f9fafb). Active items use a Deep Cyan left-indicator (3px wide) and a subtle text weight increase.
- **Breadcrumbs:** Use `label-sm` (Geist) with `/` separators to maintain a "pathway" feel suitable for education modules.