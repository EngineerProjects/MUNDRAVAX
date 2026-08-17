# Mundravax Project Notes

This folder contains product thinking, architecture notes, roadmap ideas, and design decisions for Mundravax.

Keep implementation code in `packages/`, `demo/`, and `src-tauri/`. Keep public documentation in `docs/`. Use this folder for planning material that explains where the project is going.

## Documents

- `VISION.md` - long-term product direction.
- `MVP.md` - technical foundation and first playable/useful base.
- `IDEAS.md` - feature ideas and possible future directions.
- `DESIGN_PRINCIPLES.md` - UI, UX, and product design rules.
- `NOTES.md` - ongoing discussion notes and rough thinking.

## Suggested Structure

```text
project/
  README.md
  VISION.md
  MVP.md
  IDEAS.md
  DESIGN_PRINCIPLES.md
  NOTES.md
  assets/       # Optional: non-runtime references, mockups, sketches
  decisions/    # Optional: architecture/product decision records
```

Runtime assets that are used by the application should stay in `demo/public/assets/` or the relevant package. Screenshots and public documentation images should stay in `docs/src/public/`.
