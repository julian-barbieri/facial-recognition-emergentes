import React, { useState } from 'react';
import './App.css';
import Camera from './components/Camera';
import AttendanceStats from './components/AttendanceStats';
import EmotionStats from './components/EmotionStats';

function App() {
  const [isCameraExpanded, setIsCameraExpanded] = useState(false);
  const [presentStudents, setPresentStudents] = useState([]); // lista de nombres detectados

  const toggleCameraSize = () => setIsCameraExpanded(prev => !prev);

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
              />
            </div>
          </section>

          <section className="right-panel">
            <div className="stats-section">
              <div className="stats-container">
                <AttendanceStats presentNames={presentStudents} />
                <EmotionStats />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
