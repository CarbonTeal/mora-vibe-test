import * as THREE from 'three'
import type { Enemy } from '../../entities/Enemy.ts'
import type { Player } from '../../entities/Player.ts'
import type { SkillDefinition } from '../SkillDefinition.ts'
import { CostType, EffectType } from '../SkillEnums.ts'
import { GAME_CONFIG } from '../../config/gameConfig.ts'
import type { StatusSystem } from './StatusSystem.ts'

export interface EffectContext {
  definition: SkillDefinition
  target: Enemy
  player: Player
  sourcePosition: THREE.Vector3
  damageScale?: number
  durationMultiplier?: number
  tickRateMultiplier?: number
  stackCapBonus?: number
  stackGainBonus?: number
  pullMultiplier?: number
  freezeDurationMultiplier?: number
  freezeBuildupMultiplier?: number
  allowStackingStatus?: boolean
  extraKnockback?: number
}

export class EffectResolver {
  private readonly statuses: StatusSystem

  constructor(statuses: StatusSystem) {
    this.statuses = statuses
  }

  apply(context: EffectContext): boolean {
    const wasAlive = !context.target.health.isDead
    const damageMultiplier = this.getDamageMultiplier(context.definition) *
      context.player.stats.damageMultiplier *
      this.statuses.getDamageTakenMultiplier(context.target) *
      (context.damageScale ?? 1)

    for (const effect of context.definition.effects) {
      if (context.target.health.isDead) break

      switch (effect.type) {
        case EffectType.Damage:
          context.target.health.takeDamage(effect.value * damageMultiplier)
          break
        case EffectType.DamageOverTime:
          this.statuses.applyDamageOverTime(
            context.target,
            context.definition.id,
            effect.value * damageMultiplier,
            (effect.duration ?? 1) * (context.durationMultiplier ?? 1),
            (effect.interval ?? 0.5) * (context.tickRateMultiplier ?? 1),
          )
          break
        case EffectType.Burn:
          this.statuses.applyDamageOverTime(context.target, `${context.definition.id}:burn`, effect.value * damageMultiplier, (effect.duration ?? 2) * (context.durationMultiplier ?? 1), (effect.interval ?? 0.5) * (context.tickRateMultiplier ?? 1))
          break
        case EffectType.Poison:
          if (context.allowStackingStatus !== false) {
            const gains = 1 + Math.max(0, Math.round(context.stackGainBonus ?? 0))
            for (let stack = 0; stack < gains; stack += 1) {
              this.statuses.applyDamageOverTime(context.target, `${context.definition.id}:poison`, effect.value * damageMultiplier, (effect.duration ?? 3) * (context.durationMultiplier ?? 1), (effect.interval ?? 0.5) * (context.tickRateMultiplier ?? 1), true, GAME_CONFIG.skills.poisonStackCap + Math.max(0, Math.round(context.stackCapBonus ?? 0)))
            }
          }
          break
        case EffectType.Slow:
          this.statuses.applySlow(
            context.target,
            context.definition.id,
            effect.value,
            effect.duration ?? 1,
          )
          break
        case EffectType.Knockback:
          this.moveTarget(context, effect.value * (context.pullMultiplier ?? 1))
          break
        case EffectType.Pull:
          this.moveTarget(context, -effect.value * (context.pullMultiplier ?? 1))
          break
        case EffectType.Freeze:
          if (context.allowStackingStatus !== false) {
            this.statuses.applyFreeze(context.target, context.definition.id, effect.value * (context.freezeBuildupMultiplier ?? 1), (effect.duration ?? 1) * (context.freezeDurationMultiplier ?? 1))
          }
          break
        case EffectType.Heal:
          context.player.health.heal(effect.value)
          break
        case EffectType.ArmorBreak:
          this.statuses.applyArmorBreak(context.target, context.definition.id, effect.value, effect.duration ?? 2)
          break
        case EffectType.AttackRateDown:
          this.statuses.applyAttackRateDown(context.target, context.definition.id, effect.value, effect.duration ?? 1)
          break
        case EffectType.DamageDown:
          this.statuses.applyDamageDown(context.target, context.definition.id, effect.value, effect.duration ?? 1)
          break
      }
    }

    if ((context.extraKnockback ?? 0) > 0 && !context.target.health.isDead) {
      this.moveTarget(context, context.extraKnockback ?? 0)
    }

    return wasAlive && context.target.health.isDead
  }

  applyActivationCosts(definition: SkillDefinition, player: Player): void {
    const selfDamage = definition.costs
      .filter((cost) => cost.type === CostType.SelfDamage)
      .reduce((total, cost) => total + cost.value, 0)
    if (selfDamage > 0) player.health.takeDamage(selfDamage)
  }

  getPlayerMoveSpeedMultiplier(
    definitions: readonly SkillDefinition[],
    player: Player,
  ): number {
    const costMultiplier = definitions
      .flatMap((definition) => definition.costs)
      .filter((cost) => cost.type === CostType.MoveSpeedDown)
      .reduce((multiplier, cost) => multiplier * Math.max(0, 1 - cost.value), 1)
    return costMultiplier * player.stats.moveSpeedMultiplier
  }

  getAttackIntervalMultiplier(definition: SkillDefinition, player: Player): number {
    const costMultiplier = definition.costs
      .filter((cost) => cost.type === CostType.AttackSpeedDown)
      .reduce((multiplier, cost) => multiplier * (1 + Math.max(0, cost.value)), 1)
    return costMultiplier / player.stats.attackSpeedMultiplier
  }

  private getDamageMultiplier(definition: SkillDefinition): number {
    return definition.costs
      .filter((cost) => cost.type === CostType.DamageDown)
      .reduce((multiplier, cost) => multiplier * Math.max(0, 1 - cost.value), 1)
  }

  private moveTarget(context: EffectContext, distance: number): void {
    const direction = context.target.object.position.clone().sub(context.sourcePosition)
    direction.y = 0
    if (direction.lengthSq() > 0 && Number.isFinite(distance)) {
      context.target.object.position.addScaledVector(direction.normalize(), distance)
      if (!Number.isFinite(context.target.object.position.x) || !Number.isFinite(context.target.object.position.z)) {
        context.target.object.position.copy(context.sourcePosition)
      }
    }
  }
}
