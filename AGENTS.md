# UI Guidelines

- **UI Design System**: Always follow the strict UI guidelines defined in `design.md` (located in the root of the project: `d:\erp_project\ERP-frontend\design.md`) whenever creating or modifying React components. This includes:
  - Using the 12-column Bento Grid layout with floating cards (`rounded-[32px] border border-slate-200 shadow-sm`).
  - Avoiding heavy fonts (`font-black`, `font-extrabold`) in favor of `font-medium`, `font-semibold`, and `font-bold`.
  - Relying on `primary` color variables (e.g. `text-primary`, `bg-primary/5`) rather than hardcoded hex codes (`#23265b`, `#fd9222`).
  - Flattening 3D effects (use `shadow-sm` or subtle box-shadows, avoid glowing elements unless critical).
  - Checking `design.md` for specific class names and markup before designing any UI.
