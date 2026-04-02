import type { TutorialDefinition } from './types'

export const tutorialDefinitions: Record<'parallel' | 'reverse' | 'diagonal', TutorialDefinition> = {
  parallel: {
    key: 'parallel',
    title: 'Seitwärts einparken',
    description: 'Lerne, wie du mühelos parallel zur Fahrbahn in kleine Lücken kommst.',
    startPose: { x: 500, y: 230, angle: 0 },
    steps: [
      {
        id: 'parallel-1',
        instruction: 'Fahre parallel neben das vordere Auto, ca. 50cm Abstand.',
        label: 'Fahre parallel neben das vordere Auto',
        demoCommands: [
          { steer: 0, speed: 90, duration: 1.9, label: 'Fahren zur Parkposition' }
        ],
        successConditions: [
          { type: 'xRange', min: 630, max: 730 },
          { type: 'yRange', min: 210, max: 250 }
        ]
      },
      {
        id: 'parallel-2',
        instruction: 'Fahre noch ein kurzes Stück vor und halte an, wenn dein Heck neben dem Heck des vorderen Autos steht. Die Hilfslinie zeigt dir den genauen Punkt.',
        label: 'Vorpositionieren – Hecks ausrichten',
        demoCommands: [
          { steer: 0, speed: 30, duration: 1.1, label: 'Feinjustierung vorwärts' },
          { steer: 0, speed: 0, duration: 0.5, label: 'Anhalten' }
        ],
        successConditions: [
          { type: 'speedBelow', value: 2 },
          { type: 'xRange', min: 660, max: 770 }
        ]
      },
      {
        id: 'parallel-3',
        instruction: 'Lenke komplett nach rechts ein und fahre langsam rückwärts.',
        label: 'Rückwärts, voll nach rechts lenken',
        demoCommands: [
          { steer: 45, speed: -34, duration: 1.6 }
        ],
        successConditions: [
          { type: 'yRange', min: 245, max: 300 }
        ]
      },
      {
        id: 'parallel-4',
        instruction: 'Wenn dein Auto im 45-Grad-Winkel steht (du siehst das Nummernschild des hinteren Autos komplett im linken Außenspiegel), lenke geradeaus.',
        label: 'Gerade rückwärts',
        demoCommands: [
          { steer: 0, speed: -28, duration: 1.1 }
        ],
        successConditions: [
          { type: 'xRange', min: 600, max: 660 }
        ]
      },
      {
        id: 'parallel-5',
        instruction: 'Fahre gerade rückwärts, bis deine Front am Heck des vorderen Autos vorbei ist.',
        label: 'Rückwärts, voll nach links lenken',
        demoCommands: [
          { steer: -45, speed: -26, duration: 1.6 }
        ],
        successConditions: [
          { type: 'distanceToTarget', max: 95 }
        ]
      },
      {
        id: 'parallel-6',
        instruction: 'Lenke nun komplett nach links und fahre weiter rückwärts in die Lücke.',
        label: 'Geradeaus korrigieren',
        demoCommands: [
          { steer: -25, speed: -16, duration: 0.7 },
          { steer: 0, speed: -10, duration: 0.4 }
        ],
        successConditions: [
          { type: 'distanceToTarget', max: 55 }
        ]
      },
      {
        id: 'parallel-7',
        instruction: 'Richte das Auto gerade aus.',
        label: 'Final gerade',
        demoCommands: [
          { steer: 12, speed: 20, duration: 1.25 },
          { steer: 0, speed: 0, duration: 0.8 }
        ],
        successConditions: [
          { type: 'distanceToTarget', max: 42 },
          { type: 'speedBelow', value: 2 }
        ]
      }
    ]
  },

  reverse: {
    key: 'reverse',
    title: 'Rückwärts einparken',
    description: 'Die beste Technik für Parkplätze im rechten Winkel zur Fahrbahn.',
    startPose: { x: 210, y: 230, angle: 0 },
    steps: [
      {
        id: 'reverse-1',
        instruction: 'Fahre langsam an der Parklücke vorbei, in die du einparken möchtest.',
        label: 'Anfahrt zur Parklücke',
        demoCommands: [
          { steer: 0, speed: 60, duration: 2.0 }
        ]
      },
      {
        id: 'reverse-2',
        instruction: 'Halte etwa 1,5m seitlichen Abstand zu den geparkten Autos.',
        label: 'Positioniere dich seitlich',
        demoCommands: [
          { steer: 0, speed: 0, duration: 1.0 }
        ]
      },
      {
        id: 'reverse-3',
        instruction: 'Lege den Rückwärtsgang ein und kontrolliere dein Umfeld.',
        label: 'Erste Rückwärts-Phase',
        demoCommands: [
          { steer: 30, speed: -50, duration: 1.2 }
        ]
      },
      {
        id: 'reverse-4',
        instruction: 'Lenke stark in Richtung der Lücke ein, sobald das Heck deines Autos das Nebenfahrzeug passiert.',
        label: 'Hauptlenkaktion',
        demoCommands: [
          { steer: -45, speed: -40, duration: 1.5 }
        ]
      },
      {
        id: 'reverse-5',
        instruction: 'Fahre langsam rückwärts in die Lücke.',
        label: 'Finale Ausrichtung',
        demoCommands: [
          { steer: 0, speed: -30, duration: 1.2 }
        ]
      }
    ]
  },

  diagonal: {
    key: 'diagonal',
    title: 'Wende in 3 Zügen',
    description: 'Sicheres Wenden auf engem Raum mit einem klaren Ablauf.',
    startPose: { x: 210, y: 230, angle: 0 },
    steps: [
      {
        id: 'diagonal-1',
        instruction: 'Fahre dicht an den rechten Straßenrand und halte an.',
        label: 'Anfahrt zum Wendepunkt',
        demoCommands: [
          { steer: 0, speed: 80, duration: 2.0 }
        ]
      },
      {
        id: 'diagonal-2',
        instruction: 'Blinke links, lenke komplett nach links ein und fahre langsam vorwärts bis kurz vor den gegenüberliegenden Rand.',
        label: 'Erster Lenkhub',
        demoCommands: [
          { steer: -45, speed: 50, duration: 1.6 }
        ]
      },
      {
        id: 'diagonal-3',
        instruction: 'Lenke nun im Stand komplett nach rechts ein.',
        label: 'Gegenlenkaktion',
        demoCommands: [
          { steer: 45, speed: 0, duration: 0.8 }
        ]
      },
      {
        id: 'diagonal-4',
        instruction: 'Fahre langsam rückwärts, um den Winkel deines Autos weiter zu verkleinern.',
        label: 'Rückwärts-Phase',
        demoCommands: [
          { steer: 45, speed: -40, duration: 1.2 }
        ]
      },
      {
        id: 'diagonal-5',
        instruction: 'Schlage das Lenkrad wieder nach links ein und fahre vorwärts in die neue Richtung.',
        label: 'Letzte Ausrichtung',
        demoCommands: [
          { steer: -30, speed: 60, duration: 1.2 }
        ]
      }
    ]
  }
}
