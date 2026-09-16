export const GAME_CONFIG = {
  arena: {
    halfSize: 24,
    backgroundColor: 0x101820,
    groundColor: 0x24343b,
    gridColor: 0x4b6870,
  },
  player: {
    maxHp: 100,
    moveSpeed: 8,
    radius: 0.65,
    color: 0x66e3c4,
  },
  enemy: {
    maxHp: 50,
    moveSpeed: 2.2,
    radius: 0.55,
    color: 0xef476f,
    xpReward: 20,
    contactDamage: 10,
    contactInterval: 0.9,
  },
  economy: {
    enemyKillMoney: 1,
  },
  rounds: {
    duration: 60,
    difficulty: {
      enemyHpPerRound: 0.12,
      enemySpeedPerRound: 0.04,
      spawnRatePerRound: 0.08,
    },
  },
  shop: {
    itemCount: 3,
    buffCost: 5,
    buffAmount: 0.1,
  },
  spawning: {
    initialCount: 5,
    interval: 1.4,
    minDistance: 11,
    maxDistance: 16,
    maxAlive: 40,
  },
  progression: {
    firstLevelXp: 60,
    xpGrowth: 1.35,
  },
  camera: {
    fov: 48,
    near: 0.1,
    far: 120,
    offset: { x: 10, y: 14, z: 10 },
    followSharpness: 7,
  },
  loop: {
    maxDelta: 0.05,
  },
} as const
