# Data-driven skills

Skills are plain `SkillDefinition` objects. Do not add one runtime class per skill.

- Add definitions to `definitions/coreSkills.ts` (or another definition catalog).
- Register catalogs in `SkillRegistry.ts`.
- Reuse Trigger + Carrier + Form to choose runtime behavior.
- Reuse `effects`, `modifiers`, `costs`, and `visual` to tune behavior and presentation.
- Add new generic behavior to the runtime resolvers only when an enum value is not supported yet.

Debug loadouts are selected through the `skills` URL query:

- `?skills=explosion`
- `?skills=magma`
- `?skills=orbit-flame`
- `?skills=explosion,magma,orbit-flame`
- `?skills=all`

`basic-projectile` is always included so hit-triggered test skills have a carrier.
