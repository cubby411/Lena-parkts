import type { CarPose, TutorialModeKey } from '../simulation/types'

export type DemoCommand = {
  steer: number
  speed: number
  duration: number
  label?: string
}

export type StepCondition =
  | { type: 'xRange'; min: number; max: number }
  | { type: 'yRange'; min: number; max: number }
  | { type: 'angleRange'; min: number; max: number }
  | { type: 'speedBelow'; value: number }
  | { type: 'distanceToTarget'; max: number }

export type TutorialStep = {
  id: string
  instruction: string
  label?: string
  demoCommands: DemoCommand[]
  successConditions?: StepCondition[]
}

export type TutorialDefinition = {
  key: TutorialModeKey
  title: string
  description: string
  startPose: CarPose
  steps: TutorialStep[]
}

export type StepSnapshot = {
  stepIndex: number
  startPose: CarPose
  endPose: CarPose
}

export type ParkingSuccessMetrics = {
  success: boolean
  centerDistanceToTarget: number
  angleError: number
  speed: number
  isInsideTargetBounds: boolean
}
