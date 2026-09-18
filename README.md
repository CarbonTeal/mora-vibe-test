# 元素魔导士

《元素魔导士》是一款浏览器运行的 3D 俯视角 Roguelike。选择武器、击败元素敌人、收集元素 Core，并通过主动进化把一条基础攻击逐步塑造成复合元素流派。

## 在线游玩 / Play

Play:
https://carbonteal.github.io/mora-vibe-test/

GitHub:
https://github.com/CarbonTeal/mora-vibe-test

## 操作

- `WASD`：移动
- `E`：元素进化 / 特殊进化
- 攻击：自动攻击最近目标

## 核心玩法

每局从基础攻击开始。第 1 轮结束时选择 Pistol、SMG 或 Shotgun；之后击败敌人收集金钱，在回合间商店强化 Build，并击败元素敌人取得 Element Core。元素不会自动改变武器：玩家决定何时按 `E` 进化，因此可以在立即进化与保留元素、等待特殊融合之间取舍。精英突袭、Boss 生存战与第 20 轮胜利共同构成完整的 20 轮循环。

元素进化分为三层：

- **Tier 1**：6 个基础元素——火、水、土、风、光、暗。
- **Tier 2**：45 个有方向或双元素的融合，每个保留一个清晰的主攻击行为，例如 Orbit、Zone、Burst、Beam、Wave 或 Status。
- **Tier 3**：45 个命定特殊进化。Tier 3 保留 Tier 2 的主行为，并追加由主行为触发的次级行为，形成真正的复合攻击。

例如：光 + 暗可以形成 **暮**；在第 9 轮取得命定的火元素后，可进化为 **暮：落日**，让暮色波动同步带出扇形落日光束。

## 武器

当前有一个远程武器槽，包含三把风格不同的基础武器：

- **Pistol**：稳定、精准的单发。
- **SMG**：低单发伤害、高频射击。
- **Shotgun**：近距离多弹丸爆发。

Weapon 决定射击节奏与弹道参数；Evolution 决定元素攻击形态。Evolution 可作为武器攻击修正、替代主攻击 Carrier，或以独立行为与武器并行；两者仍保持独立。第 6 轮起，商店会按当前 Weapon × Tier 2 流派提供可叠加的联动强化。

## 20 轮流程

- **Round 1**：30 秒基础战斗；结束后免费选择 Starter Weapon。
- **Round 2**：第一个元素敌人在战斗约 20 秒后出现。
- **Round 5**：第二个元素敌人在战斗约 20 秒后出现。
- **Round 9**：命定元素敌人在约 20 秒后出现；它对应当前 Tier 2 的唯一 Tier 3 材料。
- **Round 10**：Elite Rush。
- **Round 12**：Boss 生存战。
- **Round 14**：Elite Rush。
- **Round 16**：Boss 生存战。
- **Round 18**：Elite Rush。
- **Round 20**：最终 Boss 生存战；存活即完成本局。

Boss 生存战持续 60 秒。击败 Boss 不是过关条件，但会奖励一项免费的稀有 Buff；因此防御/生存 Build 仍可完成整局，而高输出 Build 会得到额外回报。

其余轮次延续普通敌人、精英、元素 Core 与商店的成长循环。每次进入下一轮，战斗场景会重置，但武器、进化、Buff、金钱与待进化元素会保留。

## AI 协作与迭代

项目使用 **ChatGPT / OpenAI Codex** 进行协作式开发与反复试玩验证。以下是直接影响设计的五次迭代：

1. 将元素状态改为 `CurrentEvolution + PendingElements`：测试后发现“已经拥有的进化”与“尚未进化的元素”混在槽位中难以理解，因而明确拆分。
2. 为 Tier 3 引入 primary-to-secondary coupling trigger：次级行为从独立计时器改为响应主行为的 Cast、Pulse、Hit、Zone Tick、Orbit Contact 等事件，避免像“偶尔附送的小效果”。
3. 将 Weapon 与 Evolution 拆分为 AttackMode：雾等流派曾因武器而错误获得另一种 Carrier；现在武器只改变伤害、数量、半径、速度与频率等参数。
4. 调整全局 Element Core 自动结算：轮末未拾取 Core 会按正式 Pending / discard 流程处理，Tier 2 后的普通 Core 仅在主动拾取时兑换金钱，避免静默覆盖或意外自动进化。
5. 重做 Boss 设计与密度：Boss 轮改为 60 秒生存挑战，并将后期敌人密度设为 Round 12 = 50、Round 16 = 70、Round 20 = 90，避免以单纯高血量造成拖沓。

## 技术实现

- Vite + TypeScript + Three.js
- 数据驱动的 SkillDefinition、FusionRecipe、Tier3Definition 与 Weapon / Synergy Upgrade 定义
- 可复用的运行时行为：Projectile、Zone、Orbit、Aura、Beam、Cone、Wave、PullField、Homing、Trail、Status 等
- GitHub Actions 自动构建并部署到 GitHub Pages

## 取舍与后续方向

当前版本优先保证战斗闭环、可扩展的数据结构与技能行为差异。视觉使用 Three.js 基础几何体、发光材质、线条与透明面构成；没有引入外部美术或音频资源。生产包仍有体积优化空间，后续可围绕模块拆分、资源管理与更完整的音频/美术反馈继续打磨。

实际开发用时：TODO — 提交前填写

## 本地运行与 DEV Mode

```bash
npm install
npm run dev
```

开始界面的 **DEV MODE** 会进入开发测试入口，显示 Debug Panel，便于强制选择进化、推进轮次、生成敌人及验证流派。普通模式不会显示该面板。
