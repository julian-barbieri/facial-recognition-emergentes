import React, { useRef, useEffect, useState } from 'react';
import './Camera.css';

const Camera = ({ isExpanded = false, onToggle, onDetections = () => {} }) => {
  const videoRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Verificar si getUserMedia está disponible
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('getUserMedia no está soportado en este navegador');
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          // Configurar eventos del video
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded');
          };

          videoRef.current.oncanplay = () => {
            console.log('Video can play - dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
            videoRef.current.play().then(() => {
              console.log('Video playing successfully');
              setIsStreaming(true);
              setError(null);
              setIsLoading(false);
            }).catch((playError) => {
              console.error('Error playing video:', playError);
              setError('Error al reproducir el video de la cámara.');
              setIsStreaming(false);
              setIsLoading(false);
            });
          };

          videoRef.current.onerror = (e) => {
            console.error('Video error:', e);
            setError('Error en el video de la cámara.');
            setIsStreaming(false);
            setIsLoading(false);
          };
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        let errorMessage = 'No se pudo acceder a la cámara.';
        
        if (err.name === 'NotAllowedError') {
          errorMessage = 'Permisos de cámara denegados. Por favor, permite el acceso a la cámara.';
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'No se encontró ninguna cámara en este dispositivo.';
        } else if (err.name === 'NotSupportedError') {
          errorMessage = 'La cámara no es compatible con este navegador.';
        }
        
        setError(errorMessage);
        setIsStreaming(false);
        setIsLoading(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const capturarYDetectar = async () => {
    try {
      if (!videoRef.current) return;

      const videoEl = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = videoEl.videoWidth || 640;
      canvas.height = videoEl.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      if (!blob) throw new Error('No se pudo capturar la imagen');

      const form = new FormData();
      form.append('image', blob, 'frame.jpg');

      const res = await fetch('/api/vision/detect', { method: 'POST', body: form });
      const text = await res.text();
      if (!res.ok) throw new Error(text || 'Error en detección');

      // Si el backend devuelve JSON válido, emitir nombres detectados y mostrar en consola
      try {
        const json = JSON.parse(text);
        console.log('Detección:', json);
        const names = Array.isArray(json?.faces)
          ? json.faces.map(f => (f && f.name) || '').filter(Boolean)
          : [];
        if (names.length) onDetections(names);
        alert('Detección realizada. Revisa la consola para ver el resultado.');
      } catch (_) {
        console.log('Respuesta:', text);
        alert('Detección realizada. Respuesta de texto en consola.');
      }
    } catch (e) {
      console.error(e);
      alert(e.message || 'Error realizando la detección');
    }
  };

  return (
    <div className="camera-container">
      <div className="camera-wrapper">
        <button
          type="button"
          className="camera-action"
          onClick={onToggle}
        >
          {isExpanded ? 'Reducir cámara' : 'Agrandar cámara'}
        </button>
        {isStreaming && !error && (
          <button
            type="button"
            className="camera-action"
            onClick={capturarYDetectar}
            style={{ marginLeft: 8 }}
          >
            Detectar rostro
          </button>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-video"
        />
        {isLoading && !error && (
          <div className="camera-loading">
            <div className="loading-spinner"></div>
            <p>Iniciando cámara...</p>
          </div>
        )}
        {error && (
          <div className="camera-error">
            <div className="error-icon">📷</div>
            <p>{error}</p>
            <button 
              className="retry-button" 
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        )}
        {isStreaming && (
          <div className="camera-overlay">
            <div className="camera-indicator">
              <div className="recording-dot"></div>
              <span>EN VIVO</span>
            </div>
          </div>
        )}
      </div>
      <div className="camera-status">
        <div className={`status-indicator ${isStreaming ? 'active' : 'inactive'}`}></div>
        <span>{isStreaming ? 'Cámara activa' : 'Cámara inactiva'}</span>
      </div>
    </div>
  );
};

export default Camera;
