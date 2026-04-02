import { Car } from '../simulation/Car'
import type { CarPose } from '../simulation/types'
import type { DemoCommand, ParkingSuccessMetrics, StepSnapshot, TutorialDefinition } from './types'

export const FIXED_DT = 1 / 60

function clonePose(pose: CarPose): CarPose {
  return {
    x: pose.x,
    y: pose.y,
    angle: pose.angle
  }
}

function runCommandFixed(car: Car, command: DemoCommand, dt: number) {
  car.setSteering(command.steer)
  car.setSpeed(command.speed)

  const totalMs = command.duration * 1000
  let elapsedMs = 0

  while (elapsedMs < totalMs) {
    const stepMs = Math.min(totalMs - elapsedMs, dt * 1000)
    car.update(stepMs / 1000)
    elapsedMs += stepMs
  }
}

export function simulateTutorialUpToStep(
  tutorial: TutorialDefinition,
  stepIndex: number,
  dt = FIXED_DT
): {
  car: Car
  snapshots: StepSnapshot[]
} {
  const car = new Car(tutorial.startPose.x, tutorial.startPose.y, tutorial.startPose.angle)
  const snapshots: StepSnapshot[] = []

  const clampedStep = Math.max(-1, Math.min(stepIndex, tutorial.steps.length - 1))

  for (let i = 0; i <= clampedStep; i++) {
    const step = tutorial.steps[i]
    const startPose = clonePose(car.getPose())

    for (const command of step.demoCommands) {
      runCommandFixed(car, command, dt)
    }

    const endPose = clonePose(car.getPose())
    snapshots.push({
      stepIndex: i,
      startPose,
      endPose
    })
  }

  car.setSpeed(0)
  car.setSteering(0)

  return {
    car,
    snapshots
  }
}

export function simulateTutorialAllSteps(
  tutorial: TutorialDefinition,
  dt = FIXED_DT
): {
  car: Car
  snapshots: StepSnapshot[]
} {
  return simulateTutorialUpToStep(tutorial, tutorial.steps.length - 1, dt)
}

export function evaluateParkingResult(
  car: Car,
  target: { x: number; y: number; w: number; h: number }
): ParkingSuccessMetrics {
  const centerDistanceToTarget = Math.hypot(car.x - target.x, car.y - target.y)
  const normalizedAngle = ((car.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
  const angleError = Math.min(Math.abs(normalizedAngle), Math.abs(2 * Math.PI - normalizedAngle))

  const halfW = target.w / 2
  const halfH = target.h / 2
  const isInsideTargetBounds =
    car.x >= target.x - halfW &&
    car.x <= target.x + halfW &&
    car.y >= target.y - halfH &&
    car.y <= target.y + halfH

  const success = isInsideTargetBounds && centerDistanceToTarget <= 38 && angleError <= 0.22 && Math.abs(car.speed) <= 4

  return {
    success,
    centerDistanceToTarget,
    angleError,
    speed: car.speed,
    isInsideTargetBounds
  }
}
