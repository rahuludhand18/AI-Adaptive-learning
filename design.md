# Bento Box UI Design System

This document outlines the strict design guidelines for all UI modules in this ERP frontend. All future modules MUST adhere to these exact patterns to maintain consistency with the `Student Directory` module.

## 1. Core Layout (The Bento Grid)
All pages must use a 12-column grid to create distinct, floating "Bento Box" cards. 
- **Wrapper**: Wrap the page content in `<div className="min-h-screen bg-slate-50/60"><div className="mx-auto max-w-7xl space-y-6 p-6">`
- **Grid Container**: `<div className="grid grid-cols-12 gap-5">`
- **Bento Cards**: Every major section (Header, Stats, Filters, Table) must be a floating card with these exact classes:
  `rounded-[32px] border border-slate-200 bg-white shadow-sm`
  *(Do NOT use varying border radiuses like `rounded-xl` or `rounded-lg` for the main outer containers).*

## 2. Color Palette (The Purple Theme)
Do not use hardcoded hex colors (e.g. `#23265b` or `#fd9222`) or raw Tailwind color names for primary accents.
- **Primary Color**: Always use `primary` (e.g., `text-primary`, `bg-primary`, `bg-primary/5`, `border-primary/20`). This maps to the global CSS variable.
- **Neutrals**: Rely heavily on the `slate` palette for text and borders (`slate-50` to `slate-800`).
- **Accent Hover States**: Use `hover:bg-primary/5 hover:text-primary` for subtle interactions.

## 3. Typography Rules
Avoid brutalist or overly heavy fonts. Keep it clean and modern.
- **Headings**: Use `font-semibold` or `font-bold` with `text-slate-800`.
- **Micro-labels (Kick-ers)**: Use `text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70` or `text-slate-400`.
- **Avoid**: DO NOT use `font-black`, `font-extrabold`, or `font-[900]`. DO NOT use extreme letter spacing (`tracking-widest` or `tracking-[0.2em]`) on anything other than tiny uppercase labels.

## 4. Flattening & Shadows
Maintain a flat, clean aesthetic. Do not overuse 3D effects.
- **Tables**: Ensure table containers are flat. 
- **Images/Avatars**: Use subtle drop shadows `shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]`, not `shadow-xl`.
- **Statuses**: Use flat pill badges (`bg-emerald-50 text-emerald-600 border border-emerald-100/50`). Do NOT add glowing box-shadows or animations to status dots unless strictly necessary.
- **Buttons**: Flat backgrounds with subtle hover color shifts. Avoid deep dropdown shadows (`shadow-[0_20px_50px...]`), stick to `shadow-sm` or `shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)]`.

## 5. Table Rows
- **Hover State**: Table rows (`<tr>`) should use a subtle gray hover: `hover:bg-slate-50/50 transition-all duration-300`.
- **Headers**: Table headers (`<th>`) should use `text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em]`.
