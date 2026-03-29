import { useState } from 'react'
import './App.css'
import Simulator from './components/Simulator'
import Tutorials from './components/Tutorials'

function App() {
  const [view, setView] = useState<'home' | 'parallel' | 'reverse' | 'diagonal' | 'tips' | 'simulator' | 'tutorials'>('home')
  const [lang, setLang] = useState<'de' | 'en'>('de')
  const [tutorialMode, setTutorialMode] = useState<'parallel' | 'reverse' | 'diagonal' | null>(null)
  const [tutorialStep, setTutorialStep] = useState<number>(0)

  const headings = {
    de: { hero: 'Einparken lernen mit Selbstvertrauen', sub: 'Schluss mit dem Umkreisen des Blocks. Meistern Sie Parallel-, Rückwärts- und Schrägparken mit interaktiven Schritt-für-Schritt-Anleitungen.' },
    en: { hero: 'Learn to park with confidence', sub: 'No more circling the block. Master parallel, reverse, and angle parking with interactive step-by-step guidance.' }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="logo">🚗</div>
          <h1>Lena parkts</h1>
        </div>
        <nav className="main-nav">
          <button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}>{lang === 'de' ? 'Startseite' : 'Home'}</button>
          <button className={view === 'parallel' ? 'active' : ''} onClick={() => setView('parallel')}>{lang === 'de' ? 'Parallelparken' : 'Parallel Park'}</button>
          <button className={view === 'reverse' ? 'active' : ''} onClick={() => setView('reverse')}>{lang === 'de' ? 'Rückwärts einparken' : 'Reverse Park'}</button>
          <button className={view === 'diagonal' ? 'active' : ''} onClick={() => setView('diagonal')}>{lang === 'de' ? 'Schrägparken' : 'Angle Park'}</button>
          <button className={view === 'tips' ? 'active' : ''} onClick={() => setView('tips')}>{lang === 'de' ? 'Profi-Tipps' : 'Pro Tips'}</button>
          <button className={view === 'simulator' ? 'active' : ''} onClick={() => setView('simulator')}>{lang === 'de' ? 'Trainer' : 'Trainer'}</button>
        </nav>
        <div className="lang-toggle">
          <button onClick={() => setLang('de')} className={lang === 'de' ? 'active' : ''}>DE</button>
          <button onClick={() => setLang('en')} className={lang === 'en' ? 'active' : ''}>EN</button>
        </div>
      </header>

      <main>
        {view === 'home' && (
          <section className="hero">
            <div className="hero-text">
              <p className="label">{lang === 'de' ? 'Der interaktive Leitfaden' : 'Interactive Guide'}</p>
              <h2>{headings[lang].hero}</h2>
              <p>{headings[lang].sub}</p>
              <div className="hero-actions">
                <button onClick={() => setView('simulator')}>{lang === 'de' ? 'Jetzt lernen' : 'Start learning'}</button>
                <button onClick={() => setView('tips')} className="ghost">{lang === 'de' ? 'Profi-Tipps' : 'Pro tips'}</button>
              </div>
            </div>
            <div className="hero-image">
              <img src="https://i.imgur.com/Wb1dTeG.png" alt="Cartoon car" />
            </div>
          </section>
        )}

        {view === 'home' && (
          <section className="maneuver-grid">
            <h3>{lang === 'de' ? 'Manöver wählen' : 'Select maneuver'}</h3>
            <p>{lang === 'de' ? 'Wählen Sie einen Parkstil für die Animation.' : 'Choose a parking style for the animation.'}</p>
            <div className="cards">
              <button onClick={() => setView('parallel')} className={view === 'parallel' ? 'selected' : ''}>
                <h4>{lang === 'de' ? 'Parallelparken' : 'Parallel Parking'}</h4>
                <p>{lang === 'de' ? 'Engere Lücke, präzise Steuerung.' : 'Tight gap, precise steering.'}</p>
              </button>
              <button onClick={() => setView('reverse')} className={view === 'reverse' ? 'selected' : ''}>
                <h4>{lang === 'de' ? 'Rückwärts einparken' : 'Reverse Parking'}</h4>
                <p>{lang === 'de' ? 'Dreipunkt-Kleines Manöver.' : 'Classic back-in spot.'}</p>
              </button>
              <button onClick={() => setView('diagonal')} className={view === 'diagonal' ? 'selected' : ''}>
                <h4>{lang === 'de' ? 'Schrägparken' : 'Angle Parking'}</h4>
                <p>{lang === 'de' ? 'Optimierte Einfahrt bei Parkbuchten.' : 'Smooth diagonal entry.'}</p>
              </button>
            </div>
          </section>
        )}

        {view === 'simulator' && <Simulator tutorialMode={tutorialMode} tutorialStep={tutorialStep} />}
        {(view === 'tutorials' || view === 'parallel' || view === 'reverse' || view === 'diagonal') && (
          <Tutorials
            mode={view === 'tutorials' ? 'auto' : view}
            onOpenSimulator={(mode, step) => {
              setTutorialMode(mode)
              setTutorialStep(step)
              setView('simulator')
            }}
          />
        )}

        {view === 'tips' && (
          <section className="tips">
            <h2>{lang === 'de' ? 'Profi-Tipps' : 'Pro Tips'}</h2>
            <ul>
              <li>{lang === 'de' ? 'Verwenden Sie kleine Lenkbewegungen für genaue Anpassung.' : 'Use small steering corrections for accuracy.'}</li>
              <li>{lang === 'de' ? 'Beobachten Sie Straßenmarkierungen und Abstandsziel.' : 'Watch line markers and target gap.'}</li>
              <li>{lang === 'de' ? 'Fahren Sie langsam, vor allem beim Rückwärtsfahren.' : 'Move slowly, especially in reverse.'}</li>
              <li>{lang === 'de' ? 'Achten Sie auf Spiegel und Schulterblick.' : 'Check mirrors and blind spots.'}</li>
            </ul>
          </section>
        )}
      </main>
    </div>
  )
}

export default App