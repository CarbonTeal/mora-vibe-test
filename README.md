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

元素进化分为4层（部分未完成）：

- **Tier 1**（已完成）：6 个基础元素——火、水、土、风、光、暗。
- **Tier 2**（已完成）：45 个有方向或双元素的融合，每个保留一个清晰的主攻击行为，例如 Orbit、Zone、Burst、Beam、Wave 或 Status。
- **Tier 3**（部分已完成）：45 个命定特殊进化。Tier 3 保留 Tier 2 的主行为，并追加由主行为触发的次级行为，形成真正的复合攻击。
- **Tier 4**（本地已完成架构与6个实例，暂未提交到线上版本）

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

# 代表性开发迭代

## 1. Element State 拆分

### 初版

Current Evolution 与未使用 Element 混在同一状态。

### 问题

特殊双元素融合难以理解，也容易发生覆盖。

### 调整

拆成：

- CurrentEvolution
- PendingElements

### 结果

允许玩家：

- 保留当前进化
- 收集新元素
- 等待双 Pending
- 放弃旧路线进行特殊融合

---

## 2. Tier 3 Coupling

### 初版

Secondary 使用独立 Timer。

### 问题

Tier 3 看起来像：

> Tier 2 + 一个无关的小技能。

### 调整

Secondary 改为响应 Primary Event。

### 结果

Tier 3 开始真正改变主体攻击模式，而不是简单叠加效果。

---

## 3. Weapon / Evolution AttackMode

### 初版

部分 Evolution 会直接压掉武器。

### 问题

Fog 等 Utility Build 会让 SMG 等武器失去基础射击。

### 调整

引入：

- WeaponModifier
- WeaponReplacement
- Additive

### 结果

明确了武器 Carrier 与元素技能之间的关系，同时保留 Weapon Build 的价值。

---

## 4. ElementCore RoundEnd

### 初版

RoundEnd 清场可能删除尚未走过去拾取的 Core。

### 问题

玩家已经击杀特殊敌人，却丢失关键成长奖励。

### 调整

统一：

Manual Pickup

和：

RoundEnd Auto Resolution

使用同一条正式 Core 结算路径。

### 结果

「击杀是否成功」决定能否获得 Core，「有没有立刻走过去」只影响结算时机。

---

## 5. Boss 从击杀战改成 Survival

### 初版

Boss 必须死亡才能过关。

### 问题

AoE Build 和 Survival Build 都受到不合理惩罚。

### 调整

Boss Round 改成：

60 秒生存 + 普通敌人压力 + Boss Optional Kill Reward。

### 结果

更多类型的 Build 都可以完成完整 Run。

---

## 6. 商店后期成长

早期 Shop 后期仍然大量出现低价值普通 Buff。

实际试玩中，到了十几轮后频繁刷新商店，却很难获得符合 Build 强度的选择。

因此后来加入：

- Rare
- Epic
- 后期稀有度权重
- Weapon × Tier2 Synergy

使 Shop 的成长速度与战斗阶段更匹配。

---

## 7. RoundEnd 节奏

最初回合结束后的清场停顿较长。

实际试玩感觉更像：

> 游戏卡了一下

而不是：

> 一轮结束。

因此最终将 RoundClear 与 Shop 之间的短暂停顿缩短到约：

**0.6 秒**

保留呼吸感，但降低等待感。

---

## 8. Shop Wallet 可读性

Shop 最早虽然存在 Money 数据，但金额混在状态文字中。

试玩时很难快速判断：

> 我还有多少钱？
>
> 这个 Buff 买完还能不能刷新？

因此最终增加独立：

**金币 $N**

显示，并在购买和刷新后立即更新。

---

## 9. 元素随机公平性

在后期试玩中，我主观感觉：

> 光和暗似乎比火、水、土、风更难遇到。

检查后发现：

Tier 2 配方其实完整存在：

**45 / 45**

光暗并没有人为降低权重，但原随机排序方式并不是严格的均匀洗牌。

因此实验阶段将元素随机顺序改为：

**Fisher–Yates Shuffle**

保证六种基础元素真正等概率，同时继续保持同一阶段的非重复规则。

这一修改来源于玩家体感，而不是预先规划。

---

# Tier 4 实验与未进入正式版本的内容

在最终提交前，还进行了一次 Tier 4 实验。

目标是在：

**Tier 3 Primary + Coupled Secondary**

之上继续加入：

**Signature Extension**

形成最终构筑形态。

实验版本已经完成：

- Tier 4 配置架构
- Tier 4 Pending / Core 流程
- Round 14 Destiny ElementEnemy
- HUD Tier 4 显示
- Recursion / Object Cap 保护
- 6 个代表性 Tier 4

包括：

- 浪：深海潜艇
- 钢：轨道轰炸
- 黑：活动星系核
- 暮：永夜
- 雾：海市蜃楼
- 星：灭绝彗星

例如：

**浪：海啸**

在 Tier 4 实验中可以继续进化为：

**浪：深海潜艇**

保留原有 Tsunami Wave，同时在触发阈值后发射多枚 Homing Torpedo，并在命中时产生 Burst。

这验证了：

> Tier 4 可以在不为每个技能重新编写 Runtime 的情况下，通过现有 Behaviour 的组合产生更复杂的终局攻击模式。

但由于本次测试最后阶段 Codex 周额度接近耗尽，剩余 39 个 Tier 4 配置没有完成完整填写与回归测试。

因此：

**Tier 4 没有合并进入当前公开提交版本。**

公开版本仍然以完整、验证过的：

**45 Tier 2 + 45 Tier 3**

作为正式内容。

这是一次主动的 Scope Control：

> 不因为已经完成了实验架构，就将未经完整测试的系统放入最终提交版本。

---

# 未完成 / 主动取舍

本次 Demo 没有继续扩展以下内容：

### 完整 Tier 4

Tier 4 Runtime 架构与部分代表案例已经本地验证，但完整 45 条配置未在 Codex 额度结束前完成，因此没有进入正式版本。

### 更复杂的 Boss 差异化

当前已经实现三套 Boss 与阶段变化、生存波次和 Elite / Normal Enemy 压力。

原计划还可以继续加入：

- 更明显的 Arena Mechanic
- 更复杂阶段变化
- Boss 专属场景规则

但优先级低于核心 Build Loop，因此没有继续扩大范围。

### 局外成长 / Meta Progression

当前 Demo 专注单局 20 Round 构筑。

没有加入：

- 永久解锁
- 局外技能树
- 长期货币
- Account Progression

因为本次测试重点是验证单局玩法循环，而不是制作完整商业化 Roguelike 框架。

### 美术 / 音频

没有投入大量时间制作独立美术和音频资源。

视觉主要由：

- Three.js Primitive
- Emissive Material
- Line
- Plane
- Particle-like Geometry

组成。

这是主动取舍，因为题目更关注：

- 玩法设计
- 体验循环
- AI 协作
- 迭代能力

而不是最终美术精度。

---

# 技术实现

- TypeScript
- Three.js
- Vite
- GitHub Actions
- GitHub Pages

主要数据结构包括：

- SkillDefinition
- FusionRecipe
- Tier3Definition
- WeaponDefinition
- Synergy Upgrade
- BossDefinition

Combat Runtime 主要由一组可复用 Behaviour 构成。

因此 45 个 Tier 2 和 45 个 Tier 3 并不是 90 套完全独立硬编码技能，而是通过：

- Trigger
- Carrier / Behaviour
- Parameter
- Effect
- Coupling

进行组合。

这也使后续 Tier 4 实验可以继续基于同一 Runtime 扩展，而不需要重写整个战斗系统。

---

# 实际开发时间

项目从 **9 月 16 日晚至 9 月 19 日上午** 集中完成。

由于 OpenAI Codex 存在单次 / 5 小时 / 周额度限制，开发过程中有相当长的自然时间是在等待模型额度恢复或等待 AI 执行，因此下面统计的是：

> **实际参与设计、编写 Prompt、试玩、验证、调整、部署与整理文档的时间**

而不是从开始到结束的连续墙钟时间。

根据实际操作过程估算：

| 日期 | 主要工作 | 实际投入 |
|---|---|---:|
| 9/16 | 题目分析、玩法方向、核心元素系统设计与原型规划 | 约 2 小时 |
| 9/17 | 基础战斗、Weapon、Tier 1 / Tier 2、元素状态、Shop 与核心循环 | 约 5 小时 |
| 9/18 | Tier 3、Coupling、AttackMode、Elite / Boss、Shop 后期成长、正式化、GitHub Pages 部署 | 约 6 小时 |
| 9/19 | Tier 4 实验、元素随机审计、最终 README 与提交整理 | 约 2 小时 |
| **合计** |  | **约 15 小时** |

**实际开发投入约 15 小时。**

项目跨越约 3 天自然时间，但 Codex 配额等待、模型执行等待以及中间非开发时间没有计入实际开发时长。

> 注：以上时间为根据实际操作过程回顾后的近似统计，并非自动计时工具记录。

---

# AI 工具

### ChatGPT

主要用于：

- 玩法讨论
- 系统设计
- 数值 / 节奏推演
- 问题分析
- Prompt 设计
- 试玩后的设计迭代
- Scope Control
- README / 提交整理

### OpenAI Codex

主要用于：

- TypeScript / Three.js 实现
- 系统重构
- 配置批量生成
- Runtime 扩展
- Build
- Browser Test
- Regression Test
- Git / Deployment

开发过程中会根据任务复杂度选择不同模型处理：

复杂架构优先使用较强推理模型；

大量已经确定的数据配置则尽量交给更轻量模型完成。

---

# Assets / Open Source

本项目主要依赖：

- Three.js
- TypeScript
- Vite

视觉内容主要使用代码生成的 Three.js 基础几何体和材质。

当前正式版本没有依赖外部角色、场景、美术或音频素材包。

---

# DEV MODE

开始界面右下角提供：

**DEV MODE**

用于开发与回归测试。

包括：

- Force Round
- Skill / Evolution Test
- Tier 2 / Tier 3 快速验证
- Boss 测试
- Combat Diagnostic

Normal Mode 不会显示这些开发工具。

DEV MODE 的存在主要用于减少每次修改后的重复人工流程，使 AI 生成的新配置可以更快被实际试玩验证。

---

# Build & Deployment

本地开发：

```bash
npm install
npm run dev
