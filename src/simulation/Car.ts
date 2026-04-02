import type { CarPose } from './types'

export class Car {
  x: number
  y: number
  angle: number
  width: number
  length: number
  wheelbase: number
  steeringAngle: number
  speed: number

  constructor(x: number, y: number, angle: number) {
    this.x = x
    this.y = y
    this.angle = angle
    this.width = 40
    this.length = 80
    this.wheelbase = 50
    this.steeringAngle = 0
    this.speed = 0
  }

  setSteering(degrees: number) {
    const clamped = Math.max(-45, Math.min(45, degrees))
    this.steeringAngle = (clamped * Math.PI) / 180
  }

  setSpeed(speed: number) {
    this.speed = speed
  }

  update(dt: number) {
    if (Math.abs(this.speed) < 0.01) return

    const distance = this.speed * dt
    const turnAngle = (distance / this.wheelbase) * Math.tan(this.steeringAngle)
    this.angle += turnAngle

    this.x += distance * Math.cos(this.angle)
    this.y += distance * Math.sin(this.angle)
  }

  getPose(): CarPose {
    return {
      x: this.x,
      y: this.y,
      angle: this.angle
    }
  }

  setPose(pose: CarPose) {
    this.x = pose.x
    this.y = pose.y
    this.angle = pose.angle
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.angle)

    const wheelLen = 14
    const wheelWid = 6
    const axleFront = this.wheelbase
    const axleRear = 0

    // ── 1. Räder ──
    ctx.fillStyle = '#111'
    ctx.save()
    ctx.translate(axleFront, -this.width / 2 + 2)
    ctx.rotate(this.steeringAngle)
    ctx.fillRect(-wheelLen / 2, -wheelWid / 2, wheelLen, wheelWid)
    ctx.restore()
    ctx.save()
    ctx.translate(axleFront, this.width / 2 - 2)
    ctx.rotate(this.steeringAngle)
    ctx.fillRect(-wheelLen / 2, -wheelWid / 2, wheelLen, wheelWid)
    ctx.restore()
    ctx.fillRect(axleRear - wheelLen / 2, -this.width / 2 + 2 - wheelWid / 2, wheelLen, wheelWid)
    ctx.fillRect(axleRear - wheelLen / 2, this.width / 2 - 2 - wheelWid / 2, wheelLen, wheelWid)

    // ── 2. Karosserie mit Farbverlauf ──
    const bodyGradient = ctx.createRadialGradient(25, 0, 5, 25, 0, 45)
    bodyGradient.addColorStop(0, '#e5e7eb')
    bodyGradient.addColorStop(0.7, '#d1d5db')
    bodyGradient.addColorStop(1, '#9ca3af')
    ctx.fillStyle = bodyGradient
    ctx.beginPath()
    ctx.moveTo(62, -10)
    ctx.bezierCurveTo(62, -17, 56, -19.5, 45, -19.5)
    ctx.bezierCurveTo(30, -19.5, 25, -17.5, 10, -17.5)
    ctx.bezierCurveTo(-5, -17.5, -5, -19, -10, -18)
    ctx.bezierCurveTo(-15, -17, -16, -10, -16, 0)
    ctx.bezierCurveTo(-16, 10, -15, 17, -10, 18)
    ctx.bezierCurveTo(-5, 19, -5, 17.5, 10, 17.5)
    ctx.bezierCurveTo(25, 17.5, 30, 19.5, 45, 19.5)
    ctx.bezierCurveTo(56, 19.5, 62, 17, 62, 10)
    ctx.bezierCurveTo(65, 5, 65, -5, 62, -10)
    ctx.fill()

    // ── 3. Seitenschweller / Aero-Trim ──
    ctx.fillStyle = '#111'
    ctx.beginPath()
    ctx.moveTo(38, -19); ctx.bezierCurveTo(25, -19, 15, -17.5, 2, -18)
    ctx.lineTo(2, -17); ctx.bezierCurveTo(15, -16.5, 25, -18, 38, -18)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(38, 19); ctx.bezierCurveTo(25, 19, 15, 17.5, 2, 18)
    ctx.lineTo(2, 17); ctx.bezierCurveTo(15, 16.5, 25, 18, 38, 18)
    ctx.fill()

    // ── 4. Frontschürze / Grill ──
    ctx.fillStyle = '#111'
    ctx.beginPath()
    ctx.moveTo(64, -7)
    ctx.bezierCurveTo(61, -7, 60, -4, 60, 0)
    ctx.bezierCurveTo(60, 4, 61, 7, 64, 7)
    ctx.bezierCurveTo(64.5, 4, 64.5, -4, 64, -7)
    ctx.fill()

    // ── 5. Glasdach ──
    const glassGrad = ctx.createLinearGradient(-15, 0, 50, 0)
    glassGrad.addColorStop(0, '#020408')
    glassGrad.addColorStop(0.5, '#0a0f1a')
    glassGrad.addColorStop(1, '#1b2333')
    ctx.fillStyle = glassGrad
    ctx.beginPath()
    ctx.moveTo(48, -12)
    ctx.bezierCurveTo(48, -15, 38, -16, 25, -14)
    ctx.bezierCurveTo(10, -12, 0, -11, -8, -10)
    ctx.bezierCurveTo(-12, -7, -12, 7, -8, 10)
    ctx.bezierCurveTo(0, 11, 10, 12, 25, 14)
    ctx.bezierCurveTo(38, 16, 48, 15, 48, 12)
    ctx.bezierCurveTo(51, 6, 51, -6, 48, -12)
    ctx.fill()

    // Glas-Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.beginPath()
    ctx.moveTo(48, -10); ctx.bezierCurveTo(30, -10, 10, -5, -8, -5); ctx.lineTo(-8, -10)
    ctx.bezierCurveTo(0, -11, 10, -12, 25, -14); ctx.bezierCurveTo(38, -16, 48, -15, 48, -12)
    ctx.fill()

    // ── Spoilerlippe ──
    ctx.fillStyle = '#111'
    ctx.beginPath()
    ctx.moveTo(-4, -8)
    ctx.bezierCurveTo(-8, -4, -8, 4, -4, 8)
    ctx.bezierCurveTo(-5, 4, -5, -4, -4, -8)
    ctx.fill()

    // ── 6. Motorhauben-Falzlinien ──
    ctx.strokeStyle = 'rgba(0,0,0,0.15)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(50, -10); ctx.lineTo(60, -4); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(50, 10); ctx.lineTo(60, 4); ctx.stroke()
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'
    ctx.beginPath(); ctx.moveTo(50, -9); ctx.lineTo(59, -3); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(50, 11); ctx.lineTo(59, 5); ctx.stroke()

    // ── 7. Cupra-Logo (Kupfer-Dreieck) ──
    ctx.fillStyle = '#c27b53'
    ctx.shadowColor = '#c27b53'
    ctx.shadowBlur = 4
    ctx.beginPath()
    ctx.moveTo(58, 0)
    ctx.lineTo(54, -3.5)
    ctx.lineTo(54, 3.5)
    ctx.fill()
    ctx.shadowBlur = 0

    // ── 8. Scheinwerfer ──
    ctx.fillStyle = '#0a0a0a'
    ctx.beginPath(); ctx.moveTo(61, -10); ctx.lineTo(60, -17); ctx.lineTo(52, -18); ctx.fill()
    ctx.beginPath(); ctx.moveTo(61, 10); ctx.lineTo(60, 17); ctx.lineTo(52, 18); ctx.fill()
    ctx.fillStyle = '#e0f2fe'
    ctx.shadowColor = '#38bdf8'
    ctx.shadowBlur = 10
    ctx.beginPath(); ctx.moveTo(60.5, -11); ctx.lineTo(59.5, -16); ctx.lineTo(54, -17); ctx.fill()
    ctx.beginPath(); ctx.moveTo(60.5, 11); ctx.lineTo(59.5, 16); ctx.lineTo(54, 17); ctx.fill()
    ctx.shadowBlur = 0

    // ── 9. Durchgehendes Rücklicht (Coast-to-Coast LED) ──
    ctx.strokeStyle = '#dc2626'
    ctx.shadowColor = '#ef4444'
    ctx.shadowBlur = 12
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(-12, -14)
    ctx.bezierCurveTo(-15, -8, -15, 8, -12, 14)
    ctx.stroke()
    ctx.shadowBlur = 0

    // ── 10. Spiegel ──
    ctx.fillStyle = '#0a0a0a'
    ctx.beginPath(); ctx.moveTo(38, -17.5); ctx.lineTo(32, -23); ctx.lineTo(34, -17.5); ctx.fill()
    ctx.beginPath(); ctx.moveTo(38, 17.5); ctx.lineTo(32, 23); ctx.lineTo(34, 17.5); ctx.fill()

    ctx.restore()
  }
}
