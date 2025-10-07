import React, { useMemo } from 'react';
import './AttendanceStats.css';

const AttendanceStats = ({ allNames = [], presentNames = [] }) => {
  // Construye la lista completa con estado presente/ausente
  const students = useMemo(() => {
    const presentSet = new Set(presentNames.map(n => String(n || '').trim()));
    return allNames.map((name, idx) => ({
      id: idx + 1,
      name,
      present: presentSet.has(String(name || '').trim())
    }));
  }, [allNames, presentNames]);

  const presentCount = students.filter(s => s.present).length;
  const totalCount = students.length; // total debe reflejar el roster completo

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
