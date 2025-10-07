import React, { useMemo } from 'react';
import './AttendanceStats.css';

const AttendanceStats = ({ presentNames = [] }) => {
  // Convertimos nombres en items visuales de "presentes"
  const students = useMemo(() => {
    return presentNames.map((name, idx) => ({ id: idx + 1, name, present: true }));
  }, [presentNames]);

  const presentCount = students.length;
  const totalCount = Math.max(1, students.length); // evita división por cero si se usa más adelante

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
