import React, { useState, useEffect } from 'react';
import './EmotionStats.css';

const EmotionStats = () => {
  // Datos de ejemplo - en una aplicación real estos vendrían del análisis de la cámara
  const [emotions] = useState({
    happiness: 38,
    neutrality: 28,
    sadness: 10,
    anger: 7,
    surprise: 7,
    fear: 5
  });

  const emotionsList = [
    { name: 'Felicidad', value: emotions.happiness, color: '#4CAF50', emoji: '😊' },
    { name: 'Neutralidad', value: emotions.neutrality, color: '#9E9E9E', emoji: '😐' },
    { name: 'Tristeza', value: emotions.sadness, color: '#2196F3', emoji: '😢' },
    { name: 'Enojo', value: emotions.anger, color: '#F44336', emoji: '😠' },
    { name: 'Sorpresa', value: emotions.surprise, color: '#FF9800', emoji: '😲' },
    { name: 'Miedo', value: emotions.fear, color: '#673AB7', emoji: '😨' }
  ];

  return (
    <div className="emotion-stats">
      <h2 className="stats-title">Emociones</h2>
      
      <div className="emotions-container">
        {emotionsList.map((emotion, index) => (
          <div key={index} className="emotion-item">
            <div className="emotion-header">
              <span className="emotion-emoji">{emotion.emoji}</span>
              <span className="emotion-name">{emotion.name}</span>
              <span className="emotion-percentage">{emotion.value}%</span>
            </div>
            
            <div className="emotion-bar-container">
              <div 
                className="emotion-bar"
                style={{
                  width: `${emotion.value}%`,
                  backgroundColor: emotion.color
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default EmotionStats;
