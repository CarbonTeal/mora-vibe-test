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





Development Log — 2026-09-17

Today focused on turning the prototype from a skill showcase into a more complete roguelike combat loop.

Element Evolution

\- Finalized 6 Tier 1 elemental evolutions and 45 Tier 2 fusion skills.

\- Kept Tier 2 skills as single primary behaviours such as Orbit, Zone, Burst, Beam, Cone, Wave, PullField and Status.

\- Reworked the evolution flow so CurrentEvolution and PendingElements are separate.

\- Sequential fusion uses CurrentEvolution + Pending.

\- Two unevolved pending elements trigger a special fusion and take priority over the current Tier 1 evolution.

\- Once a Tier 2 evolution is completed, further Element Cores no longer occupy evolution slots.

\- Extra Element Cores collected after Tier 2 are converted into money.

Element Enemies

\- Element enemies now appear on specific progression rounds:

&#x20; - Round 2: 1 element

&#x20; - Round 5: 2 elements

&#x20; - Round 9: 3 elements

\- The six base elements are offered without repetition during a run.

\- Element enemies appear 20 seconds after the relevant round begins instead of spawning immediately.

\- Element enemies are slightly faster than normal enemies and act as priority targets.

\- Round 5 elemental enemy HP was reduced slightly after playtesting to make Tier 2 progression more reliable.

Weapon System

Added three ranged weapon archetypes:

\- Pistol

&#x20; - Balanced fire rate and damage

&#x20; - Built-in penetration

&#x20; - Can later increase penetration count

\- SMG

&#x20; - High attack speed

&#x20; - Lower damage per shot

&#x20; - Naturally effective at triggering elemental effects frequently

\- Shotgun

&#x20; - Fires 3 short-range pellets

&#x20; - High close-range burst potential

&#x20; - Can later increase pellet count and range

Round 1 starts with a neutral basic attack. At the end of Round 1, the player chooses one of the three starter weapons for free.

Weapon behaviour and elemental evolution remain separate systems:

\- Weapon defines shooting rhythm and projectile parameters.

\- Evolution defines the elemental combat behaviour.

This allows all 45 Tier 2 skills to work with all three weapons without creating separate skill implementations for each combination.

Weapon × Tier 2 Synergies

From Round 6 onward, the shop can offer synergy upgrades based on the player’s current weapon and Tier 2 evolution.

The first 24 synergy buffs cover:

\- Star

\- Explosion

\- Magma

\- Poison

\- Ice

\- Black Hole

\- Rain

\- Steel

Each has Pistol / SMG / Shotgun variants.

The key rule is that Tier 2 keeps a single attack behaviour. Synergy upgrades only modify existing parameters such as:

\- damage

\- radius

\- orbit speed

\- tick rate

\- pull strength

\- poison stacks

\- freeze buildup

Compound behaviours are reserved for future Tier 3 evolutions.

Enemy Variety

Added reusable enemy archetypes:

\- Chaser

\- Runner

\- Shooter

\- Charger

Added elite modifiers:

\- Fast

\- Tanky

\- RapidFire

\- MultiShot

\- RadialBurst

Enemy archetypes unlock progressively across rounds.

Combat Feedback

\- Added player Armor, Dodge, HP Regen and Pickup Range.

\- Enemy contact damage and enemy projectiles now use a unified player damage receiver.

\- Dodge gives clear combat feedback.

\- Added hit-triggered circular health indicators for Element Enemies and Elites.

\- Health rings remain hidden until the enemy takes damage.

Economy and Pickups

\- Enemies now drop physical green Money Pickups instead of granting money automatically.

\- Players must move toward money to collect it.

\- Uncollected money is partially recovered at the end of the round at 50% value.

\- Uncollected Element Cores are automatically handled by the evolution system if still relevant.

\- Extra cores after Tier 2 can be actively collected and converted into money.

Shop

\- Added a larger set of stat buffs and trade-off buffs.

\- Buffs can increase one stat while reducing another, encouraging different builds rather than always taking raw damage.

\- Shop weighting can respond to the current weapon and evolution.

\- Added reroll support:

&#x20; - first reroll costs 10

&#x20; - each additional reroll doubles in cost during the current shop

&#x20; - reroll cost resets on the next round

&#x20; - rerolling also resets the purchase limit for the new offer set

Round Flow

\- Round 1 duration reduced to 30 seconds.

\- Later rounds remain 60 seconds.

\- Each new combat round resets the player to the center and clears remaining enemies and temporary combat entities.

\- Added a short grace period before normal enemies begin spawning.

\- Enemies now spawn outside the visible camera area and enter progressively instead of appearing directly around the player.

\- Camera follow state is reset cleanly to avoid visible rotation or snapping during round transitions.

UI / UX

\- Added a start screen titled 元素魔导士.

\- Added clearer pending-element highlighting.

\- First element pickup displays a short tutorial explaining that the player must press E to evolve.

\- Existing large Chinese-character fusion presentation remains the main visual language of the evolution system.

\- Health values are displayed as integers even though regeneration uses floating-point values internally.

Playtesting and Iteration

Several systems were changed after actual browser playtesting rather than being kept as originally planned.

Examples:

\- Element fusion originally relied more heavily on fixed pending slots, but testing showed the difference between “owned evolution” and “unevolved element” was unclear. This led to the current CurrentEvolution + PendingElements structure.

\- Element enemies originally persisted across rounds, but this made round transitions confusing. All enemies are now cleared between rounds.

\- Round 5 element enemies were slightly too difficult, making Tier 2 progression unreliable, so their HP was reduced.

\- Money income and shop prices were repeatedly adjusted after testing kill rates and purchase frequency.

\- Enemy spawning was changed because immediately filling the screen at the start of a round felt unfair and visually noisy.

Technical Notes

\- All 45 Tier 2 skills remain data-driven through SkillDefinition.

\- Weapon/evolution synergies are also data-driven rather than hard-coded as individual weapon-skill combinations.

\- Runtime systems now include reusable handling for Projectile, Zone, Orbit, Aura, Beam, Cone, Wave, PullField, Homing, Split, Ricochet, Trail and status effects.

\- npm run build passes successfully.

\- The current production bundle still triggers Vite’s >500 KB bundle-size warning, which is noted as a later optimization task.

Next

Planned next steps:

\- complete balance testing across the full 20-round run

\- design a smaller set of high-impact Tier 3 special evolutions

\- implement the final boss

\- improve visual polish, audio feedback and presentation

\- final deployment and README cleanup

