# Tecnologías Emergentes TN Pilar 2025 - Frontend

Aplicación React.js para el sistema de reconocimiento facial y análisis de emociones.

## Características

- **Cámara Web**: Acceso a la cámara del dispositivo para captura de video en tiempo real
- **Estadísticas de Asistencias**: Visualización de alumnos presentes/ausentes con fracción (ej: 8/10)
- **Análisis de Emociones**: Porcentajes de felicidad, neutralidad, tristeza, enojo y sorpresa
- **Diseño Moderno**: Interfaz responsive con gradientes y efectos visuales

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Ejecutar la aplicación:
```bash
npm start
```

3. Abrir [http://localhost:3000](http://localhost:3000) en el navegador

## Estructura del Proyecto

```
src/
├── components/
│   ├── Camera.js              # Componente de cámara web
│   ├── Camera.css
│   ├── AttendanceStats.js     # Estadísticas de asistencias
│   ├── AttendanceStats.css
│   ├── EmotionStats.js        # Estadísticas de emociones
│   └── EmotionStats.css
├── App.js                     # Componente principal
├── App.css
├── index.js                   # Punto de entrada
└── index.css
```

## Funcionalidades

### Cámara Web
- Acceso automático a la cámara del dispositivo
- Indicador de estado (activa/inactiva)
- Manejo de errores de permisos

### Asistencias
- Fracción de alumnos presentes (ej: 8/10)
- Porcentaje de asistencia con círculo visual
- Lista detallada de alumnos con estado presente/ausente

### Emociones
- Barras de progreso para cada emoción
- Gráfico circular (pie chart) de resumen
- Colores distintivos para cada emoción

## Tecnologías Utilizadas

- React 18
- CSS3 con gradientes y animaciones
- WebRTC para acceso a cámara
- Diseño responsive

## Notas

- La aplicación solicita permisos de cámara al cargar
- Los datos mostrados son de ejemplo (estudiantes y emociones)
- En una implementación real, estos datos vendrían de APIs de reconocimiento facial
