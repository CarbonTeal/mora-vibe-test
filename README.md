# 元素魔导士

《元素魔导士》是一款运行在浏览器中的 3D 俯视角 Roguelike 原型。

玩家从一套最基础的自动攻击开始，在 20 个短回合中选择武器、击败敌人、购买强化，并通过元素敌人获得 Element Core。元素之间不仅存在组合关系，**获得顺序、是否立即进化、当前武器以及已有元素状态都会影响最终 Build**。

本次 Demo 的重点并不是堆叠内容数量，而是验证一套可以持续扩展的元素构筑循环：

**Weapon → Element → Tier 1 → Tier 2 → Tier 3 → Synergy → Elite / Boss Survival**

并通过 AI Coding 快速实现、试玩、发现问题，再反过来调整玩法和系统结构。

---

## 在线游玩 / Play

**Play**

https://carbonteal.github.io/mora-vibe-test/

**GitHub**

https://github.com/CarbonTeal/mora-vibe-test

无需下载或配置开发环境，可以直接在浏览器中游玩。

---

## 操作

- `WASD`：移动
- `E`：确认元素进化 / 特殊融合
- 攻击：自动攻击附近目标

游戏中的射击不需要鼠标操作，玩家主要关注：

- 走位
- 元素 Core
- 进化时机
- 武器与元素 Build
- 商店取舍
- 精英与 Boss 生存压力

---

# 核心玩法循环

每局从最基础的中性攻击开始。

Round 1 结束后，玩家从三种 Starter Weapon 中选择一把武器，之后通过：

**战斗 → 获取金钱 / Element Core → 主动进化 → 商店强化 → 更高强度战斗**

不断形成自己的 Build。

Element Core 不会自动让玩家进化。

玩家需要主动按 `E` 确认，因此会产生一个重要取舍：

> 现在立即获得一个稳定的进化，还是暂时保留元素，等待另一枚 Core 形成特殊融合？

这种「立即成长」和「等待组合」之间的选择，是元素系统的核心之一。

---

# 元素进化系统

游戏包含六种基础元素：

- 火 Fire
- 水 Water
- 土 Earth
- 风 Wind
- 光 Light
- 暗 Dark

当前正式版本包含三层进化。

---

## Tier 1：基础元素

获得一枚基础 Element Core 后，可以将中性攻击进化为对应元素。

不同元素提供不同的基础战斗倾向，例如：

- 火：Burn
- 水：Splash
- 土：Slow
- 风：Knockback / Projectile Speed
- 光：Pierce
- 暗：Life Steal / Heal

Tier 1 更像是第一次确定 Build 的方向。

---

## Tier 2：顺序决定结果

Tier 2 是本 Demo 最重要的组合层。

6 个基础元素两两组合共有：

**15 个无序元素对**

对于每一对元素，都存在：

- A → B
- B → A
- A + B 特殊融合

三种结果。

因此完整 Tier 2 数量为：

**15 × 3 = 45 个 Tier 2 Evolution**

例如：

- 火 → 土：**爆**
- 土 → 火：**熔**
- 火 + 土：**灰**

虽然使用的是同一对元素，但获得顺序不同，攻击 Carrier 和战斗形态也会发生变化。

---

## Current Evolution 与 Pending Element

早期版本中，已经完成的进化与尚未使用的元素混在同一套状态中。

实际试玩后发现这会产生一个问题：

玩家很难理解自己当前到底是：

- 已经完成某条进化路线
- 还是正在保存元素准备融合

因此后续将其拆成：

- `CurrentEvolution`
- `PendingElements`

这样玩家即使已经有 Tier 1，也仍可以保存两枚新元素，放弃当前路线并进行特殊融合。

这也是项目中第一次由实际试玩直接推动底层状态结构调整。

---

# Tier 2 Attack Behaviour

Tier 2 并不是简单的属性加成，而是开始改变攻击行为。

目前可复用的行为包含：

- Projectile
- Burst
- Zone
- Cone
- Beam
- Wave
- Orbit
- Player Aura
- Homing
- Rain
- Trail
- PullField
- Split
- Ricochet
- Blink
- Delayed Echo
- Status
- Summon

例如：

**星**

以围绕玩家旋转的 Orbit 作为主要攻击行为。

**黑**

通过 PullField 将敌人拉向中心并持续造成伤害。

**雨**

在战斗区域持续生成 Rain 式攻击。

这些行为不是为单个技能写死，而是由配置组合形成不同 Evolution。

---

# Tier 3：复合行为进化

正式版本中一共实现了：

**45 个 Tier 3**

每个 Tier 2 都拥有一个预先设计的 Tier 3 命定进化。

Round 9 会根据玩家当前 Tier 2 生成对应的 Destiny Element Enemy。

击败后获得指定元素，即可继续进化。

例如：

**光 + 暗 → 暮**

之后在 Round 9 获得命定火元素：

**暮 → 暮：落日**

---

## 从「第二个技能」到真正的复合攻击

Tier 3 的第一次实现中，Secondary Behaviour 使用独立计时器。

实际试玩时出现了非常明显的问题：

> Tier 3 看起来只是 Tier 2，再加一个偶尔自己出现的小技能。

例如早期的「暮：落日」中，落日光束与暮的主体 Wave 没有明显关系。

因此后来将 Tier 3 改造成：

**Primary Behaviour Event → Secondary Behaviour**

Secondary 不再独立计时，而是响应 Primary 的行为事件，例如：

- OnPrimaryCast
- OnPrimaryHit
- OnPrimaryZoneTick
- OnPrimaryBurst
- OnPrimaryOrbitContact
- OnPrimaryKill

改造后：

**暮：落日**

每次主体暮色 Wave 发动时，会同步产生扇形落日 Beam。

Tier 3 因此不再是两个技能同时运行，而是一个真正发生行为变化的复合进化。

---

# Weapon System

目前有一个远程武器槽，并提供三种基础武器。

### Pistol

稳定、精准的单发武器。

特点：

- 平衡
- 自带 Pierce 倾向
- 适合稳定触发元素效果

### SMG

高攻击频率、较低单发伤害。

特点：

- 高频触发
- 更容易触发 Hit / Status 类元素效果
- 与频率型 Evolution 有明显协同

### Shotgun

近距离多弹丸攻击。

特点：

- 多 Pellet
- 较短射程
- 单次攻击覆盖较大
- 能让按 Hit / Pellet 触发的 Build 产生不同体验

---

# Weapon × Evolution

在开发过程中曾遇到一个很典型的问题：

某些 Utility Evolution，例如 **雾**，会错误地把武器本身替换掉。

结果就是：

> 玩家拿着 SMG，但进化成雾以后，SMG 不再射击，只剩一个控制 Aura。

这使辅助流派失去了基础输出。

因此后来将 Weapon 与 Evolution 的关系正式划分为三种 AttackMode：

### WeaponModifier

武器仍然是主要 Carrier。

Evolution 修改其：

- 命中
- 弹道
- 状态
- 爆炸
- 分裂
- 穿透

等行为。

### WeaponReplacement

Evolution 成为完整的主攻击 Carrier。

原始武器弹丸停止显示，但武器的：

- Damage
- Attack Speed
- Upgrade
- Synergy

等构筑价值仍会作用于新的攻击形态。

### Additive

武器继续正常攻击。

Evolution 作为：

- Aura
- Control
- Utility
- Secondary damage

独立运行。

例如雾属于这种类型。

这个分类解决了「武器身份」与「元素攻击形态」互相覆盖的问题。

---

# Weapon × Evolution Synergy

从 Round 6 开始，如果玩家已经拥有：

**Weapon + Tier 2**

商店会开始加入对应的 Synergy Buff。

例如不同武器搭配：

- 星
- 爆
- 熔
- 毒
- 冰
- 黑
- 雨
- 钢

会出现不同的强化方向。

这些强化主要改变参数，而不是创建新的技能系统。

这样可以让同一个 Evolution 在：

**Pistol / SMG / Shotgun**

上形成不同 Build。

---

# Element Core 规则

Element Core 是本 Demo 中另一个经过多次修改的系统。

早期版本中，玩家击败元素敌人后，如果没有在回合结束前走过去拾取 Core，它可能会在清场时直接消失。

这与玩家直觉冲突：

> 明明已经击败了特殊敌人，却因为没有及时踩到掉落物而失去最关键的成长材料。

因此最终采用统一规则：

> **只要 ElementEnemy 被击败，这枚 Core 就已经被玩家“赚到”。**
>
> 地面拾取只决定它何时进入正式结算。

RoundEnd 会按照掉落顺序自动处理所有剩余 ElementCore，并且使用与手动拾取完全相同的正式处理流程。

因此不会存在：

- 静默覆盖
- RoundEnd 丢 Core
- 自动跳过 Pending 状态
- 自动进化

玩家仍然需要自己按 `E` 做出进化决定。

在已经完成对应进化后，普通 Core 会按照当前规则转换为金钱。

---

# 商店与成长

每轮结束后进入 Shop。

玩家可以使用战斗中取得的 Money 购买 Buff。

商店包含：

- 基础属性强化
- Weapon 强化
- Weapon × Evolution Synergy
- Rare Buff
- Epic Buff

后期稀有度会逐渐提高。

玩家每次 Shop 最多购买一定数量强化，也可以使用：

**刷新**

重新生成当前商品。

刷新费用会在本次 Shop 中逐渐提高，因此：

> 刷新本身也是一个经济决策，而不是无限寻找最优 Buff。

未拾取的普通 MoneyPickup 在 RoundEnd 会按照现有规则结算部分价值。

---

# 20 轮流程

整局目标长度为 20 Round。

## Round 1

30 秒基础战斗。

结束后免费选择：

- Pistol
- SMG
- Shotgun

---

## Round 2

第一只 ElementEnemy 在战斗开始一段时间后出现。

玩家开始建立 Tier 1。

---

## Round 5

生成 **2 只不同的 ElementEnemy**。

这里通常是 Tier 2 构筑真正成型的节点。

---

## Round 6+

Weapon × Tier 2 Synergy 开始进入 Shop 池。

---

## Round 9

根据当前 Tier 2，生成唯一对应的 Tier 3 Destiny ElementEnemy。

击败后可获得 Tier 3 所需材料。

---

## Round 10

**Elite Rush I**

开始明显提高 Elite 敌人比例。

---

## Round 12

**Boss I**

60 秒 Boss Survival Wave。

---

## Round 14

**Elite Rush II**

加入更多中后期 Elite Modifier 与远程压力。

---

## Round 16

**Boss II**

第二次 Boss Survival Wave。

---

## Round 18

**Elite Rush III**

Elite 比例进一步提高，为 Final Boss 做准备。

---

## Round 20

**Final Boss**

坚持到计时结束即可完成整局。

---

# Boss：从 DPS Check 改成 Survival Wave

Boss 系统也经历过一次比较大的设计调整。

早期 Boss Round 的规则接近：

> Boss 出现 → 击杀 Boss → 过关

实际测试后发现，这产生两个问题。

### 1. AoE Build 失去价值

Boss-only 战斗里没有足够普通敌人。

很多原本依赖：

- Chain
- Spread
- Zone
- Rain
- AoE

的 Build 在 Boss Round 中突然失去优势。

### 2. 防御 / 生存 Build 被强制变成 DPS Check

如果必须击杀 Boss 才能继续：

高防御、回复、控制类 Build 即使非常稳定，也会因为输出不足而无法推进。

因此最终 Boss Round 改为：

**60 秒 Survival Wave**

普通敌人仍会持续出现。

大约使用正常波次压力的：

- Round 12：50%
- Round 16：70%
- Round 20：90%

玩家只要生存到计时结束即可过关。

Boss 提前死亡不会立刻结束回合。

作为高输出 Build 的额外奖励：

> 提前击杀 Boss 会立即获得一个免费的 Rare Buff。

这样：

**Survival Build 可以通关**

而：

**High DPS Build 会获得额外成长**

两种玩法都成立。

---

# AI 协作方式

本项目主要使用：

- ChatGPT
- OpenAI Codex

协作开发。

AI 的主要作用并不是一次性生成整个游戏，而是承担：

- 根据设计描述搭建系统
- 批量生成数据配置
- 重构重复代码
- 建立通用 Runtime
- 快速实现测试版本
- 定位 Regression
- 根据试玩反馈继续修改

开发过程更接近：

**设计 → Prompt → AI 实现 → 本地试玩 → 发现问题 → 调整设计 → 再实现**

而不是：

**写一次 Prompt → 完成游戏**

---

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