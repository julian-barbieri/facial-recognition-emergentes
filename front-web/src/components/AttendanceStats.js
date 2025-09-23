import React, { useState, useEffect } from 'react';
import './AttendanceStats.css';

const AttendanceStats = () => {
  // Datos de ejemplo - en una aplicación real estos vendrían de una API
  const [students] = useState([
    { id: 1, name: 'Juan Pérez', present: true },
    { id: 2, name: 'María García', present: true },
    { id: 3, name: 'Carlos López', present: false },
    { id: 4, name: 'Ana Martínez', present: true },
    { id: 5, name: 'Luis Rodríguez', present: true },
    { id: 6, name: 'Sofia Hernández', present: true },
    { id: 7, name: 'Diego González', present: false },
    { id: 8, name: 'Valentina Torres', present: true },
    { id: 9, name: 'Mateo Silva', present: true },
    { id: 10, name: 'Isabella Morales', present: true }
  ]);

  const presentCount = students.filter(student => student.present).length;
  const totalCount = students.length;
  const attendancePercentage = Math.round((presentCount / totalCount) * 100);

  return (
    <div className="attendance-stats">
      <div className="attendance-header">
        <h2 className="stats-title">Asistencias</h2>
        <div className="attendance-fraction pill">
          <span className="fraction-number">{presentCount}/{totalCount}</span>
        </div>
      </div>
      
      <div className="students-list">
        <div className="students-container">
          {students.map(student => (
            <div 
              key={student.id} 
              className={`student-item ${student.present ? 'present' : 'absent'}`}
            >
              <div className="student-status">
                <div className={`status-dot ${student.present ? 'present' : 'absent'}`}></div>
              </div>
              <span className="student-name">{student.name}</span>
              <span className="student-status-text">
                {student.present ? 'Presente' : 'Ausente'}
              </span>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default AttendanceStats;
