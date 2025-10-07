import React, { useState, useEffect } from 'react';
import './App.css';
import Camera from './components/Camera';
import AttendanceStats from './components/AttendanceStats';
import EmotionStats from './components/EmotionStats';

function App() {
  const [isCameraExpanded, setIsCameraExpanded] = useState(false);
  const [presentStudents, setPresentStudents] = useState([]); // lista de nombres detectados
  const [allStudents, setAllStudents] = useState([]); // roster completo
  const [emotionCounts, setEmotionCounts] = useState({
    happiness: 0,
    neutrality: 0,
    sadness: 0,
    anger: 0,
    surprise: 0,
    fear: 0
  });

  const toggleCameraSize = () => setIsCameraExpanded(prev => !prev);

  // Cargar roster desde backend al inicio
  useEffect(() => {
    const loadRoster = async () => {
      try {
        const r = await fetch('/api/vision/identities');
        if (!r.ok) throw new Error(await r.text());
        const json = await r.json();
        const names = Array.isArray(json?.identities) ? json.identities : [];
        setAllStudents(names);
      } catch (e) {
        console.error('Error cargando roster', e);
        setAllStudents([]);
      }
    };
    loadRoster();
  }, []);

  const handleDetections = (names = []) => {
    // normalizar nombres, quitar duplicados y actualizar presentes
    const normalized = names
      .map(n => (n || '').trim())
      .filter(Boolean);
    const unique = Array.from(new Set([...
      presentStudents,
      ...normalized
    ]));
    setPresentStudents(unique);
  };

  const handleEmotions = (emotions = []) => {
    // emotions: array de strings con la emoción dominante por rostro detectado
    if (!Array.isArray(emotions) || emotions.length === 0) return;
    setEmotionCounts(prev => {
      const next = { ...prev };
      emotions.forEach(e => {
        const key = String(e || '').toLowerCase();
        // mapear posibles valores del servicio a nuestras llaves
        const mapping = {
          happy: 'happiness',
          happiness: 'happiness',
          neutral: 'neutrality',
          neutrality: 'neutrality',
          sad: 'sadness',
          sadness: 'sadness',
          angry: 'anger',
          anger: 'anger',
          surprise: 'surprise',
          fearful: 'fear',
          fear: 'fear'
        };
        const target = mapping[key];
        if (target && Object.prototype.hasOwnProperty.call(next, target)) {
          next[target] = (next[target] || 0) + 1;
        }
      });
      return next;
    });
  };

  const totalDetections = Object.values(emotionCounts).reduce((a, b) => a + b, 0);
  const emotionPercentages = totalDetections === 0 ? {
    happiness: 0,
    neutrality: 0,
    sadness: 0,
    anger: 0,
    surprise: 0,
    fear: 0
  } : {
    happiness: Math.round((emotionCounts.happiness / totalDetections) * 100),
    neutrality: Math.round((emotionCounts.neutrality / totalDetections) * 100),
    sadness: Math.round((emotionCounts.sadness / totalDetections) * 100),
    anger: Math.round((emotionCounts.anger / totalDetections) * 100),
    surprise: Math.round((emotionCounts.surprise / totalDetections) * 100),
    fear: Math.round((emotionCounts.fear / totalDetections) * 100)
  };

  return (
    <div className="App">
      <main className={`main-content ${isCameraExpanded ? 'expanded' : ''}`}>
        <div className={`layout ${isCameraExpanded ? 'layout-expanded' : ''}`}>
          <section className="left-panel">
            <div className="left-panel-header">
              <h1 className="main-title">Tecnologías Emergentes TN Pilar 2025</h1>
            </div>
            <div className="camera-section">
              <Camera 
                isExpanded={isCameraExpanded} 
                onToggle={toggleCameraSize}
                onDetections={handleDetections}
                onEmotions={handleEmotions}
              />
            </div>
          </section>

          <section className="right-panel">
            <div className="stats-section">
              <div className="stats-container">
                <AttendanceStats allNames={allStudents} presentNames={presentStudents} />
                <EmotionStats percentages={emotionPercentages} />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
