import React from 'react';
import './EmotionStats.css';

const EmotionStats = ({ percentages = { happiness: 0, neutrality: 0, sadness: 0, anger: 0, surprise: 0, fear: 0 } }) => {
  const emotionsList = [
    { name: 'Felicidad', value: percentages.happiness, color: '#4CAF50', emoji: '😊' },
    { name: 'Neutralidad', value: percentages.neutrality, color: '#9E9E9E', emoji: '😐' },
    { name: 'Tristeza', value: percentages.sadness, color: '#2196F3', emoji: '😢' },
    { name: 'Enojo', value: percentages.anger, color: '#F44336', emoji: '😠' },
    { name: 'Sorpresa', value: percentages.surprise, color: '#FF9800', emoji: '😲' },
    { name: 'Miedo', value: percentages.fear, color: '#673AB7', emoji: '😨' }
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
