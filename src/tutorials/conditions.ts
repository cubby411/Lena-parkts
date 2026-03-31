import type { StepCondition } from './types'
import type { Car } from '../simulation/Car'

export function evaluateConditions(
  conditions: StepCondition[] | undefined,
  car: Car,
  target: { x: number; y: number }
): boolean {
  if (!conditions || conditions.length === 0) {
    return true
  }

  return conditions.every(condition => {
    switch (condition.type) {
      case 'xRange':
        return car.x >= condition.min && car.x <= condition.max

      case 'yRange':
        return car.y >= condition.min && car.y <= condition.max

      case 'angleRange': {
        const carAngleNorm = ((car.angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
        return carAngleNorm >= condition.min && carAngleNorm <= condition.max
      }

      case 'speedBelow':
        return Math.abs(car.speed) < condition.value

      case 'distanceToTarget': {
        const dist = Math.hypot(car.x - target.x, car.y - target.y)
        return dist <= condition.max
      }

      default:
        return true
    }
  })
}
