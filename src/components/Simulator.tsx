import { useEffect, useRef, useState } from 'react'

class Car {
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

    ctx.restore()
  }
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function drawStaticCar(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, length: number, color: string, angle = 0) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)

  ctx.fillStyle = color
  drawRoundedRect(ctx, -length / 2, -width / 2, length, width, 6)
  ctx.fill()

  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  drawRoundedRect(ctx, -length / 4, -width / 2 + 2, length / 2, width - 4, 4)
  ctx.fill()

  ctx.restore()
}

const Simulator: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const carRef = useRef(new Car(180, 220, 0))
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef(0)

  const [steerAngle, setSteerAngle] = useState(0)
  const [throttle, setThrottle] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const [status, setStatus] = useState('Halt')
  const [success, setSuccess] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [parkPhase, setParkPhase] = useState(0)

  const target = { x: 600, y: 290, w: 90, h: 50 }

  const parkPhases = [
    { title: 'Anfahren', text: 'Fahre am Parkplatz vorbei, halte dich in der Fahrspur und richte dich längs aus.' },
    { title: 'Vorpositionieren', text: 'Halte an parallel zum Parkplatz und positioniere dich hinter dem linken parkenden Auto.' },
    { title: 'Rückwärts einleiten', text: 'Schalte in den Rückwärtsgang, lenke rechts voll und fahre langsam ein.' },
    { title: 'Finale Ausrichtung', text: 'Gerade ausfahren / korrigieren, damit das Auto zentriert in der Lücke steht.' }
  ]

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent))
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    carRef.current.setSteering(steerAngle)
  }, [steerAngle])

  useEffect(() => {
    if (throttle === 1) {
      carRef.current.setSpeed(90)
      setStatus('Vorwärts')
    } else if (throttle === -1) {
      carRef.current.setSpeed(-40)
      setStatus('Rückwärts')
    } else {
      carRef.current.setSpeed(0)
      setStatus('Halt')
    }
  }, [throttle])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawScene = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#f0f3f8'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#4b5563'
      ctx.fillRect(0, 100, canvas.width, 190)

      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 4
      ctx.setLineDash([18, 18])
      ctx.beginPath()
      ctx.moveTo(0, 190)
      ctx.lineTo(canvas.width, 190)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = '#dbeafe'
      ctx.fillRect(0, 290, canvas.width, 20)

      drawStaticCar(ctx, 120, 150, 36, 72, '#1d4ed8')
      drawStaticCar(ctx, 680, 150, 36, 72, '#1d4ed8')
      drawStaticCar(ctx, 530, 290, 36, 72, '#2563eb')

      ctx.strokeStyle = '#f59e0b'
      ctx.lineWidth = 2
      ctx.setLineDash([8, 8])
      ctx.strokeRect(target.x - target.w / 2, target.y - target.h / 2, target.w, target.h)
      ctx.setLineDash([])

      ctx.fillStyle = 'rgba(245, 158, 11, 0.18)'
      ctx.fillRect(target.x - target.w / 2, target.y - target.h / 2, target.w, target.h)
      ctx.fillStyle = '#c2410c'
      ctx.font = '18px system-ui'
      ctx.fillText('P', target.x - 6, target.y + 8)

      carRef.current.draw(ctx)

      ctx.fillStyle = '#111827'
      ctx.font = '14px system-ui'
      ctx.fillText(`Speed: ${carRef.current.speed.toFixed(1)} px/s`, 12, 24)
      ctx.fillText(`Steer: ${steerAngle}°`, 12, 44)
      ctx.fillText(`Status: ${status}`, 12, 64)
      ctx.fillText(success ? '✅ Eingeparkt!' : '⛔ Nicht eingeparkt', 12, 84)
    }

    const frame = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time
      const dt = Math.min(0.05, (time - lastTimeRef.current) / 1000)
      lastTimeRef.current = time

      const car = carRef.current
      car.update(dt)
      car.x = Math.max(40, Math.min(canvas.width - 40, car.x))
      car.y = Math.max(50, Math.min(canvas.height - 50, car.y))

      const dist = Math.hypot(car.x - target.x, car.y - target.y)
      const carAngleNorm = ((car.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
      const goalAngle = 0
      const angleDiff = Math.min(Math.abs(carAngleNorm - goalAngle), 2 * Math.PI - Math.abs(carAngleNorm - goalAngle))

      const phaseDone = [
        () => car.x > 240 && car.x < 260 && Math.abs(car.y - 220) < 24,
        () => dist < 180 && Math.abs(car.angle) < 0.8,
        () => dist < 120 && Math.abs(car.angle) < 0.6,
        () => dist < 40 && angleDiff < 0.3 && Math.abs(car.speed) < 15
      ][parkPhase]

      if (phaseDone()) {
        setParkPhase(prev => {
          const next = Math.min(prev + 1, parkPhases.length - 1)
          if (next === parkPhases.length - 1) {
            setSuccess(true)
          }
          return next
        })
      }

      drawScene()
      animationRef.current = requestAnimationFrame(frame)
    }

    animationRef.current = requestAnimationFrame(frame)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') setThrottle(1)
      if (e.key === 'ArrowDown') setThrottle(-1)
      if (e.key === 'ArrowLeft') setSteerAngle(prev => Math.max(-45, prev - 3))
      if (e.key === 'ArrowRight') setSteerAngle(prev => Math.min(45, prev + 3))
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') setThrottle(0)
      if (e.key === 'Escape') {
        setThrottle(0)
        setSteerAngle(0)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const reset = () => {
    const car = carRef.current
    car.x = 180
    car.y = 220
    car.angle = 0
    car.speed = 0
    car.steeringAngle = 0
    setThrottle(0)
    setSteerAngle(0)
    setVelocity(0)
    setStatus('Halt')
    setParkPhase(0)
    setSuccess(false)
  }

  useEffect(() => {
    reset()
  }, [])

  return (
    <div className="simulator-page">
      <h2>Simulator (Old App Physik)</h2>
      <div className="simulator-tip">
        <span>💡</span>
        <p>Steuern: Pfeiltasten. Vorwärts/Rückwärts & Lenken. Ziel: Markierten Parkplatz erreichen.</p>
      </div>
      <div className="simulator-canvas-wrapper">
        <canvas ref={canvasRef} width={900} height={420} />
      </div>
      <div className="simulator-control-wrap">
        <div className="simulator-control-card">
          <strong>Lenkwinkel</strong> {steerAngle}°
          <input type="range" min={-45} max={45} value={steerAngle} onChange={e => setSteerAngle(Number(e.target.value))} />
        </div>
        <div className="simulator-control-card">
          <strong>Geschwindigkeit</strong> {velocity.toFixed(1)} px/s
          <div>{status}</div>
        </div>
        <div className="simulator-control-card simulator-action-buttons">
          <button
            onPointerDown={() => setThrottle(1)}
            onPointerUp={() => setThrottle(0)}
            onPointerLeave={() => setThrottle(0)}
            onTouchEnd={() => setThrottle(0)}
          >Vorwärts</button>
          <button
            onPointerDown={() => setThrottle(-1)}
            onPointerUp={() => setThrottle(0)}
            onPointerLeave={() => setThrottle(0)}
            onTouchEnd={() => setThrottle(0)}
          >Rückwärts</button>
          <button onClick={() => setThrottle(0)}>Stop</button>
          <button onClick={reset}>Reset</button>
        </div>
      </div>
      <div className="simulator-step-list">
        <h3>Parkvorgang</h3>
        <ol>
          {parkPhases.map((phase, idx) => (
            <li key={idx} className={idx === parkPhase ? 'active' : ''}>
              <strong>{idx + 1}. {phase.title}</strong>
              <p>{phase.text}</p>
            </li>
          ))}
        </ol>
        <div className="step-controls">
          <button onClick={() => setParkPhase(prev => Math.max(0, prev - 1))} disabled={parkPhase === 0}>Zurück</button>
          <button onClick={() => setParkPhase(prev => Math.min(parkPhases.length - 1, prev + 1))} disabled={parkPhase === parkPhases.length - 1}>Weiter</button>
        </div>
      </div>

      <div className="simulator-footer">
        <p>{success ? '✅ Erfolgreich eingeparkt!' : '🚗 Versuche einzuparken'}</p>
      </div>
      {isMobile && <p className="mobile-hint">Touch: Steuerbuttons verwenden.</p>}
    </div>
  )
}

export default Simulator
