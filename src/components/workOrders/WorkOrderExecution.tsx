import React, { useState, useRef } from 'react';
import { WorkOrder } from '../../types/workOrder';
import { UserRole } from '../../types/user';
import { cacheImage } from '../../utils/sync';
import './WorkOrderExecution.css';

interface WorkOrderExecutionProps {
  workOrder: WorkOrder;
  onStart: () => void;
  onComplete: (notes: string, photos: string[], actualDuration?: number) => void;
  userRole?: UserRole;
}

export const WorkOrderExecution: React.FC<WorkOrderExecutionProps> = ({
  workOrder,
  onStart,
  onComplete,
  userRole,
}) => {
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [actualDuration, setActualDuration] = useState<number>(workOrder.estimatedDuration || 0);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      alert('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/png');
        cacheImage(imageData);
        setPhotos(prev => [...prev, imageData]);
        stopCamera();
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleComplete = () => {
    if (!notes.trim()) {
      alert('Por favor, adicione observações sobre a execução.');
      return;
    }
    onComplete(notes, photos, actualDuration || undefined);
  };

  return (
    <div className="wo-execution">
      <div className="execution-card">
        <h3>Executar Work Order</h3>

        {workOrder.status === 'open' && (
          <div className="execution-section">
            <p className="execution-info">
              Esta work order está aberta. Clique no botão abaixo para iniciar a execução.
            </p>
            <button onClick={onStart} className="start-button">
              ▶️ Iniciar Execução
            </button>
          </div>
        )}

        {workOrder.status === 'in_progress' && (
          <>
            <div className="execution-section">
              <label className="execution-label">Duração Real (minutos)</label>
              <input
                type="number"
                min="0"
                value={actualDuration}
                onChange={(e) => setActualDuration(parseInt(e.target.value) || 0)}
                className="duration-input"
                placeholder="Tempo gasto na execução"
              />
            </div>

            <div className="execution-section">
              <div className="section-header">
                <label className="execution-label">Fotos da Execução</label>
                <button 
                  type="button"
                  onClick={showCamera ? stopCamera : startCamera} 
                  className="camera-button"
                >
                  {showCamera ? '❌ Fechar' : '📸 Tirar Foto'}
                </button>
              </div>

              {showCamera && (
                <div className="camera-container">
                  <video ref={videoRef} autoPlay playsInline className="camera-video" />
                  <button type="button" onClick={capturePhoto} className="capture-button">
                    Capturar Foto
                  </button>
                </div>
              )}

              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {photos.length > 0 && (
                <div className="photos-grid">
                  {photos.map((photo, index) => (
                    <div key={index} className="photo-item">
                      <img src={photo} alt={`Foto ${index + 1}`} />
                      <button 
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="remove-photo-btn"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="execution-section">
              <label className="execution-label">Observações da Execução *</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="execution-notes"
                placeholder="Descreva o que foi feito, problemas encontrados, soluções aplicadas..."
                rows={6}
                required
              />
            </div>

            <div className="execution-actions">
              <button onClick={handleComplete} className="complete-button">
                ✓ Concluir Work Order
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

