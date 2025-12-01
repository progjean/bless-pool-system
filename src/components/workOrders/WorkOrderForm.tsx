import React, { useState } from 'react';
import { WorkOrder, WorkOrderType, WorkOrderPriority } from '../../types/workOrder';
import { UserRole } from '../../types/user';
import { Customer } from '../../types/customer';
import { WORK_ORDER_TYPES, getWorkOrderTypeConfig } from '../../types/workOrder';
import { useLanguage } from '../../context/LanguageContext';
import { cacheImage } from '../../utils/sync';
import './WorkOrderForm.css';

interface WorkOrderFormProps {
  workOrder: Partial<WorkOrder>;
  customers: Customer[];
  userRole?: UserRole;
  onSave: (workOrder: WorkOrder) => void;
  onCancel: () => void;
}

const MOCK_TECHNICIANS = ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Oliveira'];

export const WorkOrderForm: React.FC<WorkOrderFormProps> = ({
  workOrder,
  customers,
  userRole,
  onSave,
  onCancel,
}) => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    workOrderNumber: workOrder.workOrderNumber || '',
    type: workOrder.type || 'other',
    title: workOrder.title || '',
    description: workOrder.description || '',
    priority: workOrder.priority || 'medium',
    status: workOrder.status || 'open',
    customerId: workOrder.customerId || '',
    assignedTechnician: workOrder.assignedTechnician || '',
    assignedTechnicianId: workOrder.assignedTechnicianId || '',
    estimatedDuration: workOrder.estimatedDuration || 0,
    notes: workOrder.notes || '',
  });

  const [photos, setPhotos] = useState<string[]>(workOrder.photos || []);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const canUploadPhotos = () => {
    return userRole === UserRole.ADMIN;
  };

  const selectedCustomer = customers.find(c => c.id === formData.customerId);
  const typeConfig = getWorkOrderTypeConfig(formData.type as WorkOrderType);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Atualizar endereço quando cliente mudar
    if (field === 'customerId') {
      const customer = customers.find(c => c.id === value);
      if (customer) {
        const customerName = customer.name || `${customer.firstName} ${customer.lastName}`.trim();
        const addressParts = [
          customer.address,
          customer.city,
          customer.state,
          customer.zipCode
        ].filter(Boolean);
        const customerAddress = addressParts.length > 0 ? addressParts.join(', ') : customer.address || '';
        setFormData(prev => ({
          ...prev,
          customerId: value,
          customerName,
          customerAddress,
        }));
      }
    }
  };

  const handleGalleryClick = () => {
    if (canUploadPhotos() && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              const imageData = event.target.result as string;
              cacheImage(imageData);
              setPhotos(prev => [...prev, imageData]);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
      alert(language === 'pt-BR' ? 'Não foi possível acessar a câmera. Verifique as permissões.' : 'Could not access camera. Check permissions.');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.customerId) {
      alert(t('workOrderForm.fillRequired'));
      return;
    }

    const customer = customers.find(c => c.id === formData.customerId);

    const workOrderData: WorkOrder = {
      id: workOrder.id || `wo_${Date.now()}`,
      workOrderNumber: formData.workOrderNumber,
      type: formData.type as WorkOrderType,
      title: formData.title,
      description: formData.description,
      priority: formData.priority as WorkOrderPriority,
      status: formData.status as WorkOrder['status'],
      customerId: formData.customerId,
      customerName: customer?.name || '',
      customerAddress: customer?.address || '',
      assignedTechnician: formData.assignedTechnician || undefined,
      assignedTechnicianId: formData.assignedTechnicianId || undefined,
      createdBy: workOrder.createdBy || 'Admin',
      createdByRole: workOrder.createdByRole || 'admin',
      createdAt: workOrder.createdAt || new Date().toISOString(),
      photos,
      notes: formData.notes || undefined,
      estimatedDuration: formData.estimatedDuration || undefined,
    };

    onSave(workOrderData);
  };

  return (
    <form onSubmit={handleSubmit} className="work-order-form">
      {/* Informações Básicas */}
      <section className="form-section">
        <h2>{t('workOrderForm.basicInfo')}</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>{t('workOrderForm.number')} *</label>
            <input
              type="text"
              value={formData.workOrderNumber}
              onChange={(e) => handleInputChange('workOrderNumber', e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('workOrderForm.type')} *</label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              required
            >
              {WORK_ORDER_TYPES.map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            {formData.type && (
              <div className="type-preview" style={{ color: typeConfig.color }}>
                <span>{typeConfig.icon}</span>
                <span>{typeConfig.label}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>{t('workOrderForm.priority')} *</label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              required
            >
              <option value="low">🟢 {t('workOrders.priority.low')}</option>
              <option value="medium">🟡 {t('workOrders.priority.medium')}</option>
              <option value="high">🟠 {t('workOrders.priority.high')}</option>
              <option value="urgent">🔴 {t('workOrders.priority.urgent')}</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t('workOrderForm.status')}</label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <option value="open">{t('workOrders.status.open')}</option>
              <option value="in_progress">{t('workOrders.status.inProgress')}</option>
              <option value="completed">{t('workOrders.status.completed')}</option>
            </select>
          </div>
        </div>
      </section>

      {/* Cliente e Técnico */}
      <section className="form-section">
        <h2>{t('workOrderForm.customerAndTechnician')}</h2>
        <div className="form-grid">
          <div className="form-group full-width">
            <label>{t('workOrderForm.customer')} *</label>
            <select
              value={formData.customerId}
              onChange={(e) => handleInputChange('customerId', e.target.value)}
              required
            >
              <option value="">{t('common.select')}</option>
              {customers.map(customer => {
                const customerName = customer.name || `${customer.firstName} ${customer.lastName}`.trim();
                return (
                  <option key={customer.id} value={customer.id}>
                    {customerName}
                  </option>
                );
              })}
            </select>
            {selectedCustomer && (
              <div className="customer-preview">
                <p>📍 {selectedCustomer.address}</p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>{t('workOrderForm.assignTechnician')}</label>
            <select
              value={formData.assignedTechnician}
              onChange={(e) => handleInputChange('assignedTechnician', e.target.value)}
            >
              <option value="">{t('workOrderForm.notAssigned')}</option>
              {MOCK_TECHNICIANS.map(tech => (
                <option key={tech} value={tech}>{tech}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>{t('workOrderForm.estimatedDuration')}</label>
            <input
              type="number"
              min="0"
              value={formData.estimatedDuration}
              onChange={(e) => handleInputChange('estimatedDuration', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </section>

      {/* Descrição */}
      <section className="form-section">
        <h2>{t('workOrderForm.description')}</h2>
        <div className="form-grid">
          <div className="form-group full-width">
            <label>{t('workOrderForm.title')} *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder={t('workOrderForm.titlePlaceholder')}
              required
            />
          </div>

          <div className="form-group full-width">
            <label>{t('workOrderForm.description')} *</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('workOrderForm.descriptionPlaceholder')}
              rows={6}
              required
            />
          </div>
        </div>
      </section>

      {/* Fotos */}
      {canUploadPhotos() && (
        <section className="form-section">
          <div className="section-header">
            <h2>{t('workOrderForm.photos')}</h2>
            <div className="photo-actions">
              <button type="button" onClick={handleGalleryClick} className="photo-button">
                📷 {t('workOrderForm.gallery')}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <button 
                type="button" 
                onClick={showCamera ? stopCamera : startCamera} 
                className="photo-button"
              >
                {showCamera ? `❌ ${t('workOrderForm.close')}` : `📸 ${t('workOrderForm.camera')}`}
              </button>
            </div>
          </div>

          {showCamera && (
            <div className="camera-container">
              <video ref={videoRef} autoPlay playsInline className="camera-video" />
              <button type="button" onClick={capturePhoto} className="capture-button">
                {t('workOrderForm.capturePhoto')}
              </button>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {photos.length > 0 && (
            <div className="photos-grid">
              {photos.map((photo, index) => (
                <div key={index} className="photo-item">
                  <img src={photo} alt={`${language === 'pt-BR' ? 'Foto' : 'Photo'} ${index + 1}`} />
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
        </section>
      )}

      {/* Observações */}
      <section className="form-section">
        <h2>{t('workOrderForm.observations')}</h2>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          className="notes-textarea"
          placeholder={t('workOrderForm.observationsPlaceholder')}
          rows={4}
        />
      </section>

      {/* Ações */}
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-button">
          {t('common.cancel')}
        </button>
        <button type="submit" className="save-button">
          {t('workOrderForm.save')}
        </button>
      </div>
    </form>
  );
};

