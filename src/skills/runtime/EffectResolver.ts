import * as THREE from 'three'
import type { Enemy } from '../../entities/Enemy.ts'
import type { Player } from '../../entities/Player.ts'
import type { SkillDefinition } from '../SkillDefinition.ts'
import { CostType, EffectType } from '../SkillEnums.ts'
import type { StatusSystem } from './StatusSystem.ts'

export interface EffectContext {
  definition: SkillDefinition
  target: Enemy
  player: Player
  sourcePosition: THREE.Vector3
}

export class EffectResolver {
  private readonly statuses: StatusSystem

  constructor(statuses: StatusSystem) {
    this.statuses = statuses
  }

  apply(context: EffectContext): boolean {
    const wasAlive = !context.target.health.isDead
    const damageMultiplier = this.getDamageMultiplier(context.definition) * context.player.stats.damageMultiplier

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
            effect.duration ?? 1,
            effect.interval ?? 0.5,
          )
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
          this.moveTarget(context, effect.value)
          break
        case EffectType.Pull:
          this.moveTarget(context, -effect.value)
          break
        case EffectType.Freeze:
          this.statuses.applySlow(context.target, context.definition.id, 0, effect.duration ?? 1)
          break
        case EffectType.Heal:
          context.player.health.heal(effect.value)
          break
      }
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
    if (direction.lengthSq() > 0) {
      context.target.object.position.addScaledVector(direction.normalize(), distance)
    }
  }
}
