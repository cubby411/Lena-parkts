import { useEffect, useState } from 'react'

type TutorialMode = 'auto' | 'parallel' | 'reverse' | 'diagonal' | 'home'

type TutorialsProps = {
  onOpenSimulator: () => void
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
      title: 'Parallelparken',
      description: 'Üben Sie das Parallelparken.',
      steps: [
        'Fahren Sie neben dem Parkplatz.',
        'Setzen Sie zurück und lenken Sie nach rechts.',
        'Fahren Sie vorwärts und lenken Sie nach links.',
        'Richten Sie das Auto gerade aus.'
      ]
    },
    {
      key: 'reverse',
      title: 'Rückwärts einparken',
      description: 'Sicher und präzise in eine enge Parklücke rückwärts einparken.',
      steps: [
        'Fahren Sie an der Parklücke vorbei, halten Sie Abstand.',
        'Schalten Sie in den Rückwärtsgang und lenken Sie scharf.',
        'Korrigieren Sie bei Bedarf mit kleinen vorwärts/rückwärts Bewegungen.',
        'Richten Sie das Fahrzeug gerade in der Lücke aus.'
      ]
    },
    {
      key: 'diagonal',
      title: 'Schrägparken',
      description: 'Elegante Einfahrt in schrägliegende Parkplätze wie in Parkhäusern.',
      steps: [
        'Positionieren Sie das Fahrzeug parallel zur Parklücke.',
        'Lenken Sie sanft ein, wenn die Fahrzeugfront in der Lücke ist.',
        'Nutzen Sie Rückspiegel und Schultern zur Orientierung.',
        'Korrigieren Sie mit einem kurzen Vor-/Zurückmanöver.'
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
              <button onClick={onOpenSimulator}>Simulator öffnen</button>
              <button onClick={() => setCurrentTutorial(null)}>Übersicht</button>
            </div>
          </div>
          <div className="tutorial-preview">
            <div className="preview-card">
              <h4>Schritt {stepIndex + 1} / {tutorial?.steps.length}</h4>
              <p>{tutorial?.steps[stepIndex]}</p>
              <div className="preview-illustration">
                <p>🖼️ Visualisierung für Schritt {stepIndex + 1}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Tutorials