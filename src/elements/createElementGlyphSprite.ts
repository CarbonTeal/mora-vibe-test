import * as THREE from 'three'

export function createElementGlyphSprite(glyph: string, color: number, size = 1.1): THREE.Sprite {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D is required for element glyphs')

  context.clearRect(0, 0, 128, 128)
  context.fillStyle = 'rgba(7, 12, 16, 0.72)'
  context.beginPath()
  context.arc(64, 64, 50, 0, Math.PI * 2)
  context.fill()
  context.strokeStyle = `#${new THREE.Color(color).getHexString()}`
  context.lineWidth = 7
  context.stroke()
  context.fillStyle = '#ffffff'
  context.font = '700 68px "Microsoft YaHei", "PingFang SC", sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(glyph, 64, 67)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(size, size, size)
  return sprite
}

export function disposeElementGlyphSprite(sprite: THREE.Sprite): void {
  sprite.material.map?.dispose()
  sprite.material.dispose()
}
