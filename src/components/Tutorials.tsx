import { useEffect, useState } from 'react'
import Simulator from './Simulator'

type TutorialMode = 'auto' | 'parallel' | 'reverse' | 'diagonal' | 'home'

type TutorialsProps = {
  onOpenSimulator: (mode: 'parallel' | 'reverse' | 'diagonal', step: number) => void
  mode?: TutorialMode
}

const Tutorials: React.FC<TutorialsProps> = ({ onOpenSimulator, mode }) => {
  const [currentTutorial, setCurrentTutorial] = useState<number | null>(null)

  const tutorials = [
    {
      key: 'home',
      title: 'Einführung ins Parken',
      description: 'Lernen Sie die Grundlagen des Parkens in Deutschland.',
      steps: [
        'Wählen Sie einen Parkplatz aus.',
        'Fahren Sie rückwärts in den Parkplatz.',
        'Achten Sie auf den Abstand zu anderen Fahrzeugen.',
        'Parken Sie immer auf der rechten Seite.'
      ]
    },
    {
      key: 'parallel',
      title: 'Seitwärts einparken',
      description: 'Lerne, wie du mühelos parallel zur Fahrbahn in kleine Lücken kommst.',
      steps: [
        'Fahre parallel neben das vordere Auto, ca. 50cm Abstand.',
        'Bleibe stehen, wenn dein Heck auf gleicher Höhe mit dem anderen Heck ist.',
        'Lenke komplett nach rechts ein und fahre langsam rückwärts.',
        'Wenn dein Auto im 45-Grad-Winkel steht (du siehst das Nummernschild des hinteren Autos komplett im linken Außenspiegel), lenke geradeaus.',
        'Fahre gerade rückwärts, bis deine Front am Heck des vorderen Autos vorbei ist.',
        'Lenke nun komplett nach links und fahre weiter rückwärts in die Lücke.',
        'Richte das Auto gerade aus.'
      ]
    },
    {
      key: 'reverse',
      title: 'Rückwärts einparken',
      description: 'Die beste Technik für Parkplätze im rechten Winkel zur Fahrbahn.',
      steps: [
        'Fahre langsam an der Parklücke vorbei, in die du einparken möchtest.',
        'Halte etwa 1,5m seitlichen Abstand zu den geparkten Autos.',
        'Lege den Rückwärtsgang ein und kontrolliere dein Umfeld.',
        'Lenke stark in Richtung der Lücke ein, sobald das Heck deines Autos das Nebenfahrzeug passiert.',
        'Fahre langsam rückwärts in die Lücke.',
        'Sobald das Auto parallel zu den Linien steht, lenke geradeaus.',
        'Fahre rückwärts, bis du vollständig in der Lücke stehst.'
      ]
    },
    {
      key: 'diagonal',
      title: 'Wende in 3 Zügen',
      description: 'Sicheres Wenden auf engem Raum mit einem klaren Ablauf.',
      steps: [
        'Fahre dicht an den rechten Straßenrand und halte an.',
        'Blinke links, lenke komplett nach links ein und fahre langsam vorwärts bis kurz vor den gegenüberliegenden Rand.',
        'Lenke nun im Stand komplett nach rechts ein.',
        'Fahre langsam rückwärts, um den Winkel deines Autos weiter zu verkleinern.',
        'Schlage das Lenkrad wieder nach links ein und fahre vorwärts in die neue Richtung.',
        'Beschleunige und ordne dich wieder auf der rechten Spur ein.'
      ]
    }
  ]

  useEffect(() => {
    if (!mode || mode === 'home') {
      setCurrentTutorial(null)
      return
    }

    if (mode === 'auto') {
      return
    }

    const idx = tutorials.findIndex(t => t.key === mode)
    if (idx >= 0) {
      setCurrentTutorial(idx)
    }
  }, [mode])

  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (currentTutorial == null) {
      setStepIndex(0)
    } else {
      setStepIndex(0)
    }
  }, [currentTutorial])

  const tutorial = currentTutorial !== null ? tutorials[currentTutorial] : null

  const gotoNext = () => {
    if (!tutorial) return
    if (stepIndex < tutorial.steps.length - 1) {
      setStepIndex(stepIndex + 1)
    }
  }

  const gotoPrev = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1)
  }

  return (
    <div className="tutorials">
      <h2>Tutorials</h2>
      {!currentTutorial ? (
        <>
          <p>Wählen Sie einen Parkguide für Ihren Lernschritt aus:</p>
          <div className="tutorial-grid">
            {tutorials.map((tut, index) => (
              <article key={tut.key} className="tutorial-card">
                <div className="tutorial-card-icon">{tut.key === 'home' ? '🅿️' : tut.key === 'reverse' ? '↩️' : tut.key === 'diagonal' ? '📐' : '🚘'}</div>
                <h3>{tut.title}</h3>
                <p>{tut.description}</p>
                <button className="tutorial-card-btn" onClick={() => setCurrentTutorial(index)}>
                  Anleitung starten ➜
                </button>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="tutorial-detail-layout">
          <div className="tutorial-step-list">
            <button className="back-btn" onClick={() => setCurrentTutorial(null)}>
              &larr; Zurück zur Übersicht
            </button>
            <h3>{tutorial?.title}</h3>
            <p>{tutorial?.description}</p>
            <div className="progress-line">
              {tutorial?.steps.map((step, index) => (
                <div key={index} className={`progress-step ${index <= stepIndex ? 'active' : ''}`}>
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
            <div className="step-controls">
              <button disabled={stepIndex === 0} onClick={gotoPrev}>Zurück</button>
              <button disabled={!tutorial || stepIndex === tutorial.steps.length - 1} onClick={gotoNext}>Nächster Schritt</button>
            </div>
            <div className="tutorial-actions">
              <button onClick={() => onOpenSimulator(currentTutorial !== null ? tutorials[currentTutorial].key as 'parallel' | 'reverse' | 'diagonal' : 'parallel', stepIndex)}>
                Simulator öffnen
              </button>
              <button onClick={() => setCurrentTutorial(null)}>Übersicht</button>
            </div>
          </div>
          <div className="tutorial-preview">
            <div className="preview-card">
              <h4>Schritt {stepIndex + 1} / {tutorial?.steps.length}</h4>
              <p>{tutorial?.steps[stepIndex]}</p>
            </div>
            <div className="preview-simulator">
              <Simulator tutorialMode={tutorial?.key as 'parallel' | 'reverse' | 'diagonal'} tutorialStep={stepIndex} embedded />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tutorials