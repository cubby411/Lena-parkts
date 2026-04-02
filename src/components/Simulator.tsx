import { useEffect, useRef, useState } from 'react'
import { Car } from '../simulation/Car'
import type { CarPose, TutorialModeKey } from '../simulation/types'
import { tutorialDefinitions } from '../tutorials/definitions'
import { evaluateConditions } from '../tutorials/conditions'
import { evaluateParkingResult, simulateTutorialAllSteps } from '../tutorials/simulateTutorial'
import type { ParkingSuccessMetrics, StepSnapshot } from '../tutorials/types'

type SimulatorProps = {
  tutorialMode?: TutorialModeKey | null
  tutorialStep?: number
  embedded?: boolean
}

type TutorialPlaybackState = {
  commandIndex: number
  commandElapsedMs: number
  active: boolean
  stepId?: string
}

type TutorialDebugInfo = {
  mode: TutorialModeKey
  stepIndex: number
  startPose: CarPose
  endPose: CarPose
  distanceToTarget: number
  angleError: number
  stepConditionsMet: boolean
}

const TARGET_BOX = { x: 600, y: 320, w: 180, h: 60 }
const REAR_PARKED_CAR_X = 480
const FRONT_PARKED_CAR_X = 720
const PARKED_CAR_Y = 320

function setCarPose(car: Car, pose: CarPose) {
  car.setPose(pose)
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

const Simulator: React.FC<SimulatorProps> = ({ tutorialMode, tutorialStep, embedded }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const initialPose = tutorialDefinitions.parallel.startPose
  const carRef = useRef(new Car(initialPose.x, initialPose.y, initialPose.angle))
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef(0)
  const controlsVisible = !embedded
  const stepListVisible = !embedded

  // State refs für die Animation-Loop (verhindert stale closures)
  const steerAngleRef = useRef(0)
  const throttleRef = useRef(0)
  const tutorialModeRef = useRef(tutorialMode)
  const tutorialStepRef = useRef(tutorialStep)
  const tutorialPlaybackRef = useRef<TutorialPlaybackState>({ commandIndex: 0, commandElapsedMs: 0, active: false })
  const tutorialSnapshotsRef = useRef<Partial<Record<TutorialModeKey, StepSnapshot[]>>>({})
  const embeddedRef = useRef(embedded)

  // React State (für UI-Updates)
  const [steerAngle, setSteerAngle] = useState(0)
  const [throttle, setThrottle] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const [status, setStatus] = useState('Halt')
  const [success, setSuccess] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [parkPhase, setParkPhase] = useState(0)
  const [tutorialDebug, setTutorialDebug] = useState<TutorialDebugInfo | null>(null)
  const [parallelMetrics, setParallelMetrics] = useState<ParkingSuccessMetrics | null>(null)
  const [parallelFinalPose, setParallelFinalPose] = useState<CarPose | null>(null)

  const parkPhases = [
    { title: 'Anfahren', text: 'Fahre am Parkplatz vorbei, halte dich in der Fahrspur und richte dich längs aus.' },
    { title: 'Vorpositionieren', text: 'Halte an parallel zum Parkplatz und positioniere dich hinter dem linken parkenden Auto.' },
    { title: 'Rückwärts einleiten', text: 'Schalte in den Rückwärtsgang, lenke rechts voll und fahre langsam ein.' },
    { title: 'Finale Ausrichtung', text: 'Gerade ausfahren / korrigieren, damit das Auto zentriert in der Lücke steht.' }
  ]

  // Überwache State-Änderungen und aktualisiere Refs
  useEffect(() => {
    steerAngleRef.current = steerAngle
  }, [steerAngle])

  useEffect(() => {
    throttleRef.current = throttle
  }, [throttle])

  useEffect(() => {
    tutorialModeRef.current = tutorialMode
    tutorialStepRef.current = tutorialStep
  }, [tutorialMode, tutorialStep])

  useEffect(() => {
    embeddedRef.current = embedded
  }, [embedded])

  // Mobile-Erkennung
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent))
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Tutorial-Initialisierung und Command-Playback
  useEffect(() => {
    if (!embedded || !tutorialMode || tutorialStep === null) {
      setTutorialDebug(null)
      return
    }

    const tutorial = tutorialDefinitions[tutorialMode]
    if (!tutorial) return

    const car = carRef.current
    const cachedSnapshots = tutorialSnapshotsRef.current[tutorialMode]
    const allSimulation = cachedSnapshots
      ? { car: new Car(tutorial.startPose.x, tutorial.startPose.y, tutorial.startPose.angle), snapshots: cachedSnapshots }
      : simulateTutorialAllSteps(tutorial)

    if (!cachedSnapshots) {
      tutorialSnapshotsRef.current[tutorialMode] = allSimulation.snapshots
    }

    const stepIdx = Math.max(0, Math.min(tutorialStep, tutorial.steps.length - 1))
    const snapshot = allSimulation.snapshots[stepIdx]
    const startPose = snapshot ? snapshot.startPose : tutorial.startPose
    const expectedEndPose = snapshot ? snapshot.endPose : startPose

    // Nur Startzustand setzen, die Bewegung selbst bleibt command-basiert im Frame-Loop.
    setCarPose(car, startPose)
    car.setSpeed(0)
    car.setSteering(0)

    // Starte Playback des aktuellen Schritts
    const currentStep = tutorial.steps[stepIdx]
    const evaluationCar = new Car(expectedEndPose.x, expectedEndPose.y, expectedEndPose.angle)
    evaluationCar.setSpeed(0)
    const stepConditionsMet = evaluateConditions(currentStep.successConditions, evaluationCar, { x: TARGET_BOX.x, y: TARGET_BOX.y })

    setTutorialDebug({
      mode: tutorialMode,
      stepIndex: stepIdx,
      startPose,
      endPose: expectedEndPose,
      distanceToTarget: Math.hypot(expectedEndPose.x - TARGET_BOX.x, expectedEndPose.y - TARGET_BOX.y),
      angleError: Math.min(
        Math.abs(((expectedEndPose.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)),
        2 * Math.PI - Math.abs(((expectedEndPose.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI))
      ),
      stepConditionsMet
    })

    tutorialPlaybackRef.current = {
      commandIndex: 0,
      commandElapsedMs: 0,
      active: true,
      stepId: currentStep.id
    }

    return () => {
      tutorialPlaybackRef.current.active = false
    }
  }, [tutorialMode, tutorialStep, embedded])

  useEffect(() => {
    const sim = simulateTutorialAllSteps(tutorialDefinitions.parallel)
    const metrics = evaluateParkingResult(sim.car, TARGET_BOX)
    setParallelMetrics(metrics)
    setParallelFinalPose(sim.car.getPose())

    if (process.env.NODE_ENV !== 'production') {
      console.info('Parallel tutorial final evaluation', {
        metrics,
        finalPose: sim.car.getPose(),
        snapshots: sim.snapshots
      })
    }
  }, [])

  const drawScene = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, car: Car) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#f0f3f8'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Fahrspur
    ctx.fillStyle = '#4b5563'
    ctx.fillRect(0, 100, canvas.width, 190)

    // Mittellinie
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 4
    ctx.setLineDash([18, 18])
    ctx.beginPath()
    ctx.moveTo(0, 190)
    ctx.lineTo(canvas.width, 190)
    ctx.stroke()
    ctx.setLineDash([])

    // Parkzone
    ctx.fillStyle = '#dbeafe'
    ctx.fillRect(0, 290, canvas.width, 20)

    // Gehweg
    ctx.fillStyle = '#d9d9d1'
    ctx.fillRect(0, 310, canvas.width, canvas.height - 310)

    // Andere Fahrspur
    drawStaticCar(ctx, 120, 150, 36, 72, '#1d4ed8')
    drawStaticCar(ctx, 680, 150, 36, 72, '#1d4ed8')

    // Nachbarautos in der Parklücke
    drawStaticCar(ctx, REAR_PARKED_CAR_X, PARKED_CAR_Y, 36, 72, '#1d4ed8')
    drawStaticCar(ctx, FRONT_PARKED_CAR_X, PARKED_CAR_Y, 36, 72, '#1d4ed8')

    // Zielbereich
    ctx.strokeStyle = '#f59e0b'
    ctx.lineWidth = 2
    ctx.setLineDash([8, 8])
    ctx.strokeRect(TARGET_BOX.x - TARGET_BOX.w / 2, TARGET_BOX.y - TARGET_BOX.h / 2, TARGET_BOX.w, TARGET_BOX.h)
    ctx.setLineDash([])

    ctx.fillStyle = 'rgba(245, 158, 11, 0.18)'
    ctx.fillRect(TARGET_BOX.x - TARGET_BOX.w / 2, TARGET_BOX.y - TARGET_BOX.h / 2, TARGET_BOX.w, TARGET_BOX.h)
    ctx.fillStyle = '#c2410c'
    ctx.font = '18px system-ui'
    ctx.fillText('P', TARGET_BOX.x - 6, TARGET_BOX.y + 8)

    // Spieler-Auto
    car.draw(ctx)

    // Schritt-2-Overlay: Heck-Ausrichtungshilfe (nur im embedded Tutorial-Modus für parallel-2)
    if (embeddedRef.current && tutorialModeRef.current === 'parallel' && tutorialStepRef.current === 1) {
      const rearRefX = FRONT_PARKED_CAR_X - 36 // Heck des vorderen Parkwagens = 684
      const carRearX = car.x - 16 * Math.cos(car.angle)
      const carRearY = car.y - 16 * Math.sin(car.angle)
      const aligned = Math.abs(carRearX - rearRefX) < 12
      const overlayColor = aligned ? '#16a34a' : '#f59e0b'

      ctx.save()

      // Vertikale Referenzlinie (Heck des Parkwagens)
      ctx.strokeStyle = overlayColor
      ctx.lineWidth = 2
      ctx.setLineDash([6, 4])
      ctx.beginPath()
      ctx.moveTo(rearRefX, 115)
      ctx.lineTo(rearRefX, 344)
      ctx.stroke()
      ctx.setLineDash([])

      // Punkt am Heck des Parkwagens (Oberkante, zur Fahrbahn hin)
      ctx.fillStyle = overlayColor
      ctx.beginPath()
      ctx.arc(rearRefX, PARKED_CAR_Y - 18, 5, 0, 2 * Math.PI)
      ctx.fill()

      // Punkt am Heck des Spielerautos
      ctx.beginPath()
      ctx.arc(carRearX, carRearY, 5, 0, 2 * Math.PI)
      ctx.fill()

      // Horizontale Verbindungslinie auf Spurhöhe
      ctx.strokeStyle = overlayColor
      ctx.lineWidth = 1.5
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(carRearX, carRearY)
      ctx.lineTo(rearRefX, carRearY)
      ctx.stroke()
      ctx.setLineDash([])

      // Beschriftung
      ctx.font = 'bold 12px system-ui'
      ctx.fillStyle = overlayColor
      const label = aligned ? '\u2713 Hecks auf gleicher H\u00f6he' : 'Hecks ausrichten'
      const labelX = Math.min(rearRefX + 8, canvas.width - 190)
      ctx.fillText(label, labelX, 130)

      ctx.restore()
    }

    // Info-Text
    ctx.fillStyle = '#111827'
    ctx.font = '14px system-ui'
    ctx.fillText(`Speed: ${car.speed.toFixed(1)} px/s`, 12, 24)
    ctx.fillText(`Steer: ${steerAngleRef.current}°`, 12, 44)
    ctx.fillText(`Status: ${status}`, 12, 64)
    ctx.fillText(success ? '✅ Eingeparkt!' : '⛔ Nicht eingeparkt', 12, 84)
  }

  // Hauptanimations-Loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const frame = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time
      const dt = Math.min(0.05, (time - lastTimeRef.current) / 1000)
      lastTimeRef.current = time

      const car = carRef.current

      // Tutorial-Playback
      if (embeddedRef.current && tutorialModeRef.current && tutorialPlaybackRef.current.active) {
        const tutorial = tutorialDefinitions[tutorialModeRef.current]
        const stepIdx = tutorialStepRef.current ?? 0
        const step = tutorial.steps[stepIdx]

        if (!step) {
          tutorialPlaybackRef.current.active = false
        } else {
          const playback = tutorialPlaybackRef.current
          const cmd = step.demoCommands[playback.commandIndex]

          if (cmd) {
            car.setSteering(cmd.steer)
            car.setSpeed(cmd.speed)
            car.update(dt)

            playback.commandElapsedMs += dt * 1000
            if (playback.commandElapsedMs >= cmd.duration * 1000) {
              playback.commandIndex++
              playback.commandElapsedMs = 0
              if (playback.commandIndex >= step.demoCommands.length) {
                car.setSpeed(0)
                car.setSteering(0)
                setStatus('Halt')
                playback.active = false
              }
            }
          } else {
            car.setSpeed(0)
            car.setSteering(0)
            setStatus('Halt')
            playback.active = false
          }
        }
      } else {
        // Freies Fahren
        car.setSteering(steerAngleRef.current)
        car.setSpeed(
          throttleRef.current === 1 ? 90 : throttleRef.current === -1 ? -40 : 0
        )
        car.update(dt)
      }

      // Grenzen
      car.x = Math.max(40, Math.min(canvas.width - 40, car.x))
      car.y = Math.max(50, Math.min(canvas.height - 50, car.y))

      // Status aktualisieren (nur für freies Fahren)
      if (!embeddedRef.current || !tutorialModeRef.current) {
        if (throttleRef.current === 1) {
          setStatus('Vorwärts')
        } else if (throttleRef.current === -1) {
          setStatus('Rückwärts')
        } else {
          setStatus('Halt')
        }
      }

      // Parkphase-Prüfung
      const dist = Math.hypot(car.x - TARGET_BOX.x, car.y - TARGET_BOX.y)
      const carAngleNorm = ((car.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
      const goalAngle = 0
      const angleDiff = Math.min(Math.abs(carAngleNorm - goalAngle), 2 * Math.PI - Math.abs(carAngleNorm - goalAngle))

      const phaseDone = [
        () => car.x > 400 && car.x < 520 && Math.abs(car.y - 230) < 20,
        () => dist < 220 && Math.abs(car.angle) < 0.8,
        () => dist < 140 && Math.abs(car.angle) < 0.5,
        () => dist < 45 && angleDiff < 0.3 && Math.abs(car.speed) < 15
      ][parkPhase]

      if (phaseDone && phaseDone()) {
        setParkPhase(prev => {
          const next = Math.min(prev + 1, parkPhases.length - 1)
          if (next === parkPhases.length - 1) {
            setSuccess(true)
          }
          return next
        })
      }

      // Velocity anzeigen
      setVelocity(car.speed)

      drawScene(ctx, canvas, car)
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
    setCarPose(car, tutorialDefinitions.parallel.startPose)
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
            >
              Vorwärts
            </button>
            <button
              onPointerDown={() => setThrottle(-1)}
              onPointerUp={() => setThrottle(0)}
              onPointerLeave={() => setThrottle(0)}
              onTouchEnd={() => setThrottle(0)}
            >
              Rückwärts
            </button>
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
            <button onClick={() => setParkPhase(prev => Math.max(0, prev - 1))} disabled={parkPhase === 0}>
              Zurück
            </button>
            <button onClick={() => setParkPhase(prev => Math.min(parkPhases.length - 1, prev + 1))} disabled={parkPhase === parkPhases.length - 1}>
              Weiter
            </button>
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

      {process.env.NODE_ENV !== 'production' && (tutorialDebug || parallelMetrics) && (
        <div className="simulator-debug" style={{ marginTop: 12, padding: 10, border: '1px dashed #94a3b8', borderRadius: 8, background: '#f8fafc', fontSize: 13 }}>
          {tutorialDebug && (
            <p>
              Step Debug: mode={tutorialDebug.mode}, step={tutorialDebug.stepIndex + 1},
              start=({tutorialDebug.startPose.x.toFixed(1)}, {tutorialDebug.startPose.y.toFixed(1)}, {tutorialDebug.startPose.angle.toFixed(2)}),
              end=({tutorialDebug.endPose.x.toFixed(1)}, {tutorialDebug.endPose.y.toFixed(1)}, {tutorialDebug.endPose.angle.toFixed(2)}),
              dist={tutorialDebug.distanceToTarget.toFixed(1)},
              angleErr={tutorialDebug.angleError.toFixed(2)},
              conditions={tutorialDebug.stepConditionsMet ? 'ok' : 'fail'}
            </p>
          )}
          {parallelMetrics && parallelFinalPose && (
            <p>
              Parallel Final: success={parallelMetrics.success ? 'yes' : 'no'},
              finalPose=({parallelFinalPose.x.toFixed(1)}, {parallelFinalPose.y.toFixed(1)}, {parallelFinalPose.angle.toFixed(2)}),
              dist={parallelMetrics.centerDistanceToTarget.toFixed(1)},
              angleErr={parallelMetrics.angleError.toFixed(2)},
              inBounds={parallelMetrics.isInsideTargetBounds ? 'yes' : 'no'}
            </p>
          )}
        </div>
      )}

      {isMobile && <p className="mobile-hint">Touch: Steuerbuttons verwenden.</p>}
    </div>
  )
}

export default Simulator
