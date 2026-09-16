\# Mora Vibe Coding Test



A browser-based 3D top-down roguelike prototype built with Vite, TypeScript and Three.js.



\## Current Progress



\### Completed

\- Basic 3D top-down movement and camera

\- Automatic attack system

\- Enemy spawn / chase / HP / death

\- XP and level framework

\- Data-driven skill framework

\- Element system:

&#x20; - Fire

&#x20; - Water

&#x20; - Earth

&#x20; - Wind

&#x20; - Light

&#x20; - Dark

\- Fusion system supporting:

&#x20; - A → B

&#x20; - B → A

&#x20; - A + B simultaneous fusion

\- Test fusion skills:

&#x20; - Fire → Earth = Explosion

&#x20; - Earth → Fire = Magma

&#x20; - Fire + Earth = Steel

\- Debug panel for fast testing

\- 60-second round framework

\- Money system

\- Basic shop framework



\## Core Design



The game uses element fusion as its main build system.



Different acquisition orders produce different fusion results.



Example:



Fire → Earth = Explosion



Earth → Fire = Magma



Fire + Earth = Steel



The same two elements can therefore lead to different builds depending on acquisition order and timing.



\## AI Tools



\- ChatGPT

\- Codex



\## Development Log



\### Wednesday

\- Built the basic combat loop

\- Built the modular skill framework

\- Added the 6-element system

\- Added fusion resolver and test recipes

\- Added debug tools

\- Added round, money and shop framework

\- Implemented initial Explosion and Magma effects



\## Planned Next



\- Implement special element-carrying enemies

\- Complete Tier 2 fusion effects

\- Separate combat element acquisition from shop buffs

\- Expand buff pool

\- Begin Tier 3 framework and enemy variety



\## Tech Stack



\- Vite

\- TypeScript

\- Three.js

