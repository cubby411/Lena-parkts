import { useEffect, useRef, useState } from 'react'

type SimulatorProps = {
  tutorialMode?: 'parallel' | 'reverse' | 'diagonal' | null
  tutorialStep?: number
  embedded?: boolean
}

type TutorialCommand = {
  label: string
  speed?: number
  steer?: number
  duration?: number
}

type TutorialModeKey = 'parallel' | 'reverse' | 'diagonal'

type CarPose = {
  x: number
  y: number
  angle: number
}

type TutorialStepPlan = {
  label: string
  startPose: CarPose
  endPose: CarPose
  duration: number
}

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

    // Wheels
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

    // Main Body
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

    // Side Skirts / Aero Trim
    ctx.fillStyle = '#111'
    ctx.beginPath()
    ctx.moveTo(38, -19)
    ctx.bezierCurveTo(25, -19, 15, -17.5, 2, -18)
    ctx.lineTo(2, -17)
    ctx.bezierCurveTo(15, -16.5, 25, -18, 38, -18)
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(38, 19)
    ctx.bezierCurveTo(25, 19, 15, 17.5, 2, 18)
    ctx.lineTo(2, 17)
    ctx.bezierCurveTo(15, 16.5, 25, 18, 38, 18)
    ctx.fill()

    // Black front aero & grille
    ctx.fillStyle = '#111'
    ctx.beginPath()
    ctx.moveTo(64, -7)
    ctx.bezierCurveTo(61, -7, 60, -4, 60, 0)
    ctx.bezierCurveTo(60, 4, 61, 7, 64, 7)
    ctx.bezierCurveTo(64.5, 4, 64.5, -4, 64, -7)
    ctx.fill()

    // Glass Canopy
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

    // Glass highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
    ctx.beginPath()
    ctx.moveTo(48, -10)
    ctx.bezierCurveTo(30, -10, 10, -5, -8, -5)
    ctx.lineTo(-8, -10)
    ctx.bezierCurveTo(0, -11, 10, -12, 25, -14)
    ctx.bezierCurveTo(38, -16, 48, -15, 48, -12)
    ctx.fill()

    // Spoiler lip
    ctx.fillStyle = '#111'
    ctx.beginPath()
    ctx.moveTo(-4, -8)
    ctx.bezierCurveTo(-8, -4, -8, 4, -4, 8)
    ctx.bezierCurveTo(-5, 4, -5, -4, -4, -8)
    ctx.fill()

    // Hood Creases
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(50, -10)
    ctx.lineTo(60, -4)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(50, 10)
    ctx.lineTo(60, 4)
    ctx.stroke()

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.beginPath()
    ctx.moveTo(50, -9)
    ctx.lineTo(59, -3)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(50, 11)
    ctx.lineTo(59, 5)
    ctx.stroke()

    // Cupra Logo
    ctx.fillStyle = '#c27b53'
    ctx.beginPath()
    ctx.moveTo(58, 0)
    ctx.lineTo(54, -3.5)
    ctx.lineTo(54, 3.5)
    ctx.fill()

    // Headlights
    ctx.fillStyle = '#0a0a0a'
    ctx.beginPath()
    ctx.moveTo(61, -10)
    ctx.lineTo(60, -17)
    ctx.lineTo(52, -18)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(61, 10)
    ctx.lineTo(60, 17)
    ctx.lineTo(52, 18)
    ctx.fill()

    ctx.fillStyle = '#e0f2fe'
    ctx.shadowColor = '#38bdf8'
    ctx.shadowBlur = 10
    ctx.beginPath()
    ctx.moveTo(60.5, -11)
    ctx.lineTo(59.5, -16)
    ctx.lineTo(54, -17)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(60.5, 11)
    ctx.lineTo(59.5, 16)
    ctx.lineTo(54, 17)
    ctx.fill()
    ctx.shadowBlur = 0

    // Taillights (LED)
    ctx.strokeStyle = '#dc2626'
    ctx.shadowColor = '#ef4444'
    ctx.shadowBlur = 12
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(-12, -14)
    ctx.bezierCurveTo(-15, -8, -15, 8, -12, 14)
    ctx.stroke()
    ctx.shadowBlur = 0

    // Side Mirrors
    ctx.fillStyle = '#0a0a0a'
    ctx.beginPath()
    ctx.moveTo(38, -17.5)
    ctx.lineTo(32, -23)
    ctx.lineTo(34, -17.5)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(38, 17.5)
    ctx.lineTo(32, 23)
    ctx.lineTo(34, 17.5)
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

const sceneLayout = {
  roadTop: 100,
  roadBottom: 280,
  dashedY: 150,
  curbY: 280,
  parkingTop: 290,
  parkingBottom: 350,
  sidewalkTop: 360,
  parkedCarY: 320,
  parkedCarWidth: 42,
  parkedCarLength: 85,
  rearParkedCarX: 310,
  frontParkedCarX: 640,
  target: { x: 485, y: 320, w: 210, h: 60 },
  startPose: { x: 210, y: 230, angle: 0 }
} as const

const tutorialScripts: Record<TutorialModeKey, { startPose: CarPose; commands: TutorialCommand[] }> = {
  parallel: {
    startPose: sceneLayout.startPose,
    commands: [
      { label: 'Fahre parallel neben das vordere Auto', speed: 100, steer: 0, duration: 2000 },
      { label: 'Bleibe stehen, wenn dein Heck auf gleicher Höhe ist', speed: 100, steer: 0, duration: 2150 },
      { label: 'Lenke komplett nach rechts und fahre rückwärts', speed: -50, steer: 45, duration: 1800 },
      { label: 'Wenn du bei 45 Grad bist, lenke geradeaus', speed: -50, steer: 0, duration: 1100 },
      { label: 'Fahre gerade rückwärts, bis deine Front vorbei ist', speed: -50, steer: 0, duration: 600 },
      { label: 'Lenke komplett nach links und fahre weiter rückwärts', speed: -50, steer: -45, duration: 1800 },
      { label: 'Richte das Auto gerade aus', speed: -20, steer: 0, duration: 500 }
    ]
  },
  reverse: {
    startPose: { x: 120, y: 210, angle: 0 },
    commands: [
      { label: 'Fahre langsam an der Parklücke vorbei', speed: 100, steer: 0, duration: 1500 },
      { label: 'Halte etwa 1,5m seitlichen Abstand', speed: 100, steer: 0, duration: 1500 },
      { label: 'Kontrolliere dein Umfeld', speed: 100, steer: 0, duration: 2000 },
      { label: 'Lenke stark in Richtung der Lücke', speed: -50, steer: 45, duration: 2000 },
      { label: 'Fahre langsam rückwärts in die Lücke', speed: -50, steer: 45, duration: 1200 },
      { label: 'Lenke geradeaus, sobald du parallel bist', speed: -50, steer: 0, duration: 1200 },
      { label: 'Fahre vollständig in die Lücke', speed: -50, steer: 0, duration: 800 }
    ]
  },
  diagonal: {
    startPose: { x: 700, y: 360, angle: 0 },
    commands: [
      { label: 'Setze zurück, um Platz zu gewinnen', speed: -100, steer: 0, duration: 2000 },
      { label: 'Lenke voll links und fahre vorwärts', speed: 80, steer: -45, duration: 2300 },
      { label: 'Lenke im Stand voll nach rechts ein', speed: 0, steer: 45, duration: 1000 },
      { label: 'Fahre rückwärts, um den Winkel zu verkleinern', speed: -80, steer: 45, duration: 2400 },
      { label: 'Lenke wieder links und fahre vorwärts', speed: 80, steer: -45, duration: 2000 },
      { label: 'Ordne dich sauber in die neue Richtung ein', speed: 80, steer: 0, duration: 2200 }
    ]
  }
}

function setCarPose(car: Car, pose: CarPose) {
  car.x = pose.x
  car.y = pose.y
  car.angle = pose.angle
  car.speed = 0
  car.steeringAngle = 0
}

function simulatePose(startPose: CarPose, command: TutorialCommand) {
  const car = new Car(startPose.x, startPose.y, startPose.angle)
  const dt = 1 / 60
  car.setSteering(command.steer ?? 0)
  car.setSpeed(command.speed ?? 0)

  const frameCount = Math.floor((command.duration ?? 0) / (dt * 1000))
  for (let frame = 0; frame < frameCount; frame += 1) {
    car.update(dt)
  }

  return { x: car.x, y: car.y, angle: car.angle }
}

function buildTutorialPlans(script: { startPose: CarPose; commands: TutorialCommand[] }) {
  const plans: TutorialStepPlan[] = []
  let currentPose = script.startPose

  script.commands.forEach(command => {
    const nextPose = simulatePose(currentPose, command)
    plans.push({
      label: command.label,
      startPose: currentPose,
      endPose: nextPose,
      duration: command.duration ?? 0
    })
    currentPose = nextPose
  })

  return plans
}

function easeInOut(progress: number) {
  return progress < 0.5
    ? 4 * progress * progress * progress
    : 1 - Math.pow(-2 * progress + 2, 3) / 2
}

function interpolateAngle(start: number, end: number, progress: number) {
  const diff = Math.atan2(Math.sin(end - start), Math.cos(end - start))
  return start + diff * progress
}

function interpolatePose(startPose: CarPose, endPose: CarPose, progress: number) {
  const eased = easeInOut(progress)
  return {
    x: startPose.x + (endPose.x - startPose.x) * eased,
    y: startPose.y + (endPose.y - startPose.y) * eased,
    angle: interpolateAngle(startPose.angle, endPose.angle, eased)
  }
}

const tutorialPlans: Record<TutorialModeKey, TutorialStepPlan[]> = {
  parallel: [
    {
      label: 'Fahre parallel neben das vordere Auto',
      startPose: sceneLayout.startPose,
      endPose: { x: 560, y: 230, angle: 0 },
      duration: 1600
    },
    {
      label: 'Bleibe stehen, wenn dein Heck auf gleicher Höhe ist',
      startPose: { x: 560, y: 230, angle: 0 },
      endPose: { x: 612, y: 230, angle: 0 },
      duration: 900
    },
    {
      label: 'Lenke komplett nach rechts und fahre rückwärts',
      startPose: { x: 612, y: 230, angle: 0 },
      endPose: { x: 560, y: 262, angle: -0.48 },
      duration: 1400
    },
    {
      label: 'Wenn du bei 45 Grad bist, lenke geradeaus',
      startPose: { x: 560, y: 262, angle: -0.48 },
      endPose: { x: 522, y: 288, angle: -0.78 },
      duration: 900
    },
    {
      label: 'Fahre gerade rückwärts, bis deine Front vorbei ist',
      startPose: { x: 522, y: 288, angle: -0.78 },
      endPose: { x: 475, y: 304, angle: -0.78 },
      duration: 800
    },
    {
      label: 'Lenke komplett nach links und fahre weiter rückwärts',
      startPose: { x: 475, y: 304, angle: -0.78 },
      endPose: { x: 438, y: 320, angle: -0.2 },
      duration: 1300
    },
    {
      label: 'Richte das Auto gerade aus',
      startPose: { x: 438, y: 320, angle: -0.2 },
      endPose: { x: 485, y: 320, angle: 0 },
      duration: 700
    }
  ],
  reverse: buildTutorialPlans(tutorialScripts.reverse),
  diagonal: buildTutorialPlans(tutorialScripts.diagonal)
}

const Simulator: React.FC<SimulatorProps> = ({ tutorialMode, tutorialStep, embedded }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const carRef = useRef(new Car(sceneLayout.startPose.x, sceneLayout.startPose.y, sceneLayout.startPose.angle))
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef(0)
  const tutorialPlaybackRef = useRef<{ startedAt: number; step: TutorialStepPlan } | null>(null)
  const controlsVisible = !embedded
  const stepListVisible = !embedded

  const [steerAngle, setSteerAngle] = useState(0)
  const [throttle, setThrottle] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const [status, setStatus] = useState('Halt')
  const [success, setSuccess] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [parkPhase, setParkPhase] = useState(0)
  const [tutorialHint, setTutorialHint] = useState('')
  const [tutorialActive, setTutorialActive] = useState(false)

  const target = sceneLayout.target

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
    if (throttle > 0) {
      const speed = 90 * throttle
      carRef.current.setSpeed(speed)
      setVelocity(speed)
      setStatus('Vorwärts')
    } else if (throttle < 0) {
      const speed = 40 * throttle
      carRef.current.setSpeed(speed)
      setVelocity(speed)
      setStatus('Rückwärts')
    } else {
      carRef.current.setSpeed(0)
      setVelocity(0)
      setStatus('Halt')
    }
  }, [throttle])

  useEffect(() => {
    if (!tutorialMode) {
      setTutorialHint('')
      setTutorialActive(false)
      tutorialPlaybackRef.current = null
      return
    }

    const steps = tutorialPlans[tutorialMode]
    if (!steps || tutorialStep == null || tutorialStep >= steps.length) {
      setTutorialHint('')
      setTutorialActive(false)
      tutorialPlaybackRef.current = null
      return
    }

    const step = steps[tutorialStep]
    setTutorialHint(step.label)
    setTutorialActive(true)

    const car = carRef.current
    setCarPose(car, step.startPose)
    setThrottle(0)
    setSteerAngle(0)
    setVelocity(0)
    setStatus('Halt')
    tutorialPlaybackRef.current = { startedAt: performance.now(), step }
    lastTimeRef.current = 0

    return () => {
      tutorialPlaybackRef.current = null
    }
  }, [tutorialMode, tutorialStep])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawScene = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#f0f3f8'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#475569'
      ctx.fillRect(0, sceneLayout.roadTop, canvas.width, sceneLayout.roadBottom - sceneLayout.roadTop)

      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 4
      ctx.setLineDash([18, 18])
      ctx.beginPath()
      ctx.moveTo(0, sceneLayout.dashedY)
      ctx.lineTo(canvas.width, sceneLayout.dashedY)
      ctx.stroke()
      ctx.setLineDash([])

      ctx.beginPath()
      ctx.moveTo(0, sceneLayout.curbY)
      ctx.lineTo(canvas.width, sceneLayout.curbY)
      ctx.stroke()

      ctx.fillStyle = '#94a3b8'
      ctx.fillRect(0, sceneLayout.sidewalkTop, canvas.width, 30)

      ctx.fillStyle = '#166534'
      ctx.fillRect(0, sceneLayout.sidewalkTop + 30, canvas.width, canvas.height - sceneLayout.sidewalkTop - 30)

      drawStaticCar(ctx, sceneLayout.rearParkedCarX, sceneLayout.parkedCarY, sceneLayout.parkedCarWidth, sceneLayout.parkedCarLength, '#ef4444')
      drawStaticCar(ctx, sceneLayout.frontParkedCarX, sceneLayout.parkedCarY, sceneLayout.parkedCarWidth, sceneLayout.parkedCarLength, '#64748b')

      ctx.strokeStyle = '#facc15'
      ctx.lineWidth = 2
      ctx.setLineDash([10, 5])
      ctx.strokeRect(target.x - target.w / 2, target.y - target.h / 2, target.w, target.h)
      ctx.setLineDash([])

      ctx.fillStyle = 'rgba(250, 204, 21, 0.4)'
      ctx.fillRect(target.x - target.w / 2, target.y - target.h / 2, target.w, target.h)
      ctx.fillStyle = '#facc15'
      ctx.font = 'bold 18px system-ui'
      ctx.fillText('Ziel', target.x - 16, target.y + 7)

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

      if (embedded && tutorialMode && tutorialPlaybackRef.current) {
        const { startedAt, step } = tutorialPlaybackRef.current
        const duration = Math.max(step.duration, 1)
        const progress = Math.min(1, (time - startedAt) / duration)
        const pose = interpolatePose(step.startPose, step.endPose, progress)
        const prevPose = interpolatePose(step.startPose, step.endPose, Math.max(0, progress - Math.min(0.02, progress)))

        setCarPose(car, pose)
        const distance = Math.hypot(pose.x - prevPose.x, pose.y - prevPose.y)
        const signedVelocity = pose.x >= prevPose.x ? (distance / Math.max(dt, 1 / 60)) : -(distance / Math.max(dt, 1 / 60))
        setVelocity(Number.isFinite(signedVelocity) ? signedVelocity : 0)
        setStatus(Math.abs(signedVelocity) < 1 ? 'Halt' : signedVelocity > 0 ? 'Vorwärts' : 'Rückwärts')

        if (progress >= 1) {
          setCarPose(car, step.endPose)
          setVelocity(0)
          setStatus('Halt')
          tutorialPlaybackRef.current = null
          setTutorialActive(false)
        }
      } else {
        car.update(dt)
      }

      car.x = Math.max(40, Math.min(canvas.width - 40, car.x))
      car.y = Math.max(50, Math.min(canvas.height - 50, car.y))

      const dist = Math.hypot(car.x - target.x, car.y - target.y)
      const carAngleNorm = ((car.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
      const goalAngle = 0
      const angleDiff = Math.min(Math.abs(carAngleNorm - goalAngle), 2 * Math.PI - Math.abs(carAngleNorm - goalAngle))

      const phaseDone = [
        () => car.x > 280 && car.x < 460 && Math.abs(car.y - 230) < 18,
        () => car.x > 560 && car.x < 690 && Math.abs(car.y - 230) < 18,
        () => dist < 150 && Math.abs(car.angle) < 0.9,
        () => dist < 55 && angleDiff < 0.3 && Math.abs(car.speed) < 12
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
      if (e.key === ' ' || e.key === 'Escape') setSteerAngle(0)
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
    const pose = tutorialMode ? tutorialPlans[tutorialMode][0]?.startPose ?? sceneLayout.startPose : sceneLayout.startPose
    setCarPose(car, pose)
    tutorialPlaybackRef.current = null
    setThrottle(0)
    setSteerAngle(0)
    setVelocity(0)
    setStatus('Halt')
    setParkPhase(0)
    setSuccess(false)
    setTutorialHint('')
    setTutorialActive(false)
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
      {controlsVisible && (
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
          <button onClick={() => setSteerAngle(0)}>Lenkung zentrieren</button>
        </div>
      </div>
      )}
      {stepListVisible && (
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
      )}

      <div className="simulator-footer">
        <p>{success ? '✅ Erfolgreich eingeparkt!' : '🚗 Versuche einzuparken'}</p>
        <button className="reset-btn" onClick={() => {
          if (window.confirm('Reset Simulator? Alle aktuellen Fortschritte gehen verloren.')) {
            reset()
          }
        }}>
          Reset (mit Bestätigung)
        </button>
      </div>
      {tutorialMode && tutorialActive && (
        <div className="tutorial-hint">
          <strong>Tutorial Command:</strong> {tutorialHint}
        </div>
      )}
      {isMobile && <p className="mobile-hint">Touch: Steuerbuttons verwenden.</p>}
    </div>
  )
}

export default Simulator
