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

    // Main body
    ctx.fillStyle = '#f5f5dc'
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

    // Glass
    ctx.fillStyle = '#020408'
    ctx.beginPath()
    ctx.moveTo(48, -12)
    ctx.bezierCurveTo(48, -15, 38, -16, 25, -14)
    ctx.bezierCurveTo(10, -12, 0, -11, -8, -10)
    ctx.bezierCurveTo(-12, -7, -12, 7, -8, 10)
    ctx.bezierCurveTo(0, 11, 10, 12, 25, 14)
    ctx.bezierCurveTo(38, 16, 48, 15, 48, 12)
    ctx.bezierCurveTo(51, 6, 51, -6, 48, -12)
    ctx.fill()

    ctx.restore()
  }
}
