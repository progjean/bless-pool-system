import React, { useState, useRef, useEffect } from 'react';
import { Purchase, PurchaseItem } from '../../types/purchase';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole } from '../../types/user';
import { Product } from '../../types/inventory';
import { productsService } from '../../services/productsService';
import { generateNextPurchaseNumber } from '../../data/purchaseData';
import { cacheImage } from '../../utils/sync';
import { formatCurrency } from '../../utils/formatUtils';
import './PurchaseFormModal.css';

interface PurchaseFormModalProps {
  purchase?: Purchase;
  onClose: () => void;
  onSave: (purchase: Purchase) => void;
}

export const PurchaseFormModal: React.FC<PurchaseFormModalProps> = ({
  purchase,
  onClose,
  onSave,
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isEditing = !!purchase;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const [formData, setFormData] = useState({
    purchaseNumber: purchase?.purchaseNumber || generateNextPurchaseNumber(),
    supplier: purchase?.supplier || '',
    purchaseDate: purchase?.purchaseDate || new Date().toISOString().split('T')[0],
    notes: purchase?.notes || '',
    receipt: purchase?.receipt || '',
  });

  const [items, setItems] = useState<PurchaseItem[]>(
    purchase?.items || []
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const productsData = await productsService.list();
        setProducts(productsData);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoadingProducts(false);
      }
    };
    loadProducts();
  }, []);

  const canUploadReceipt = () => {
    return user?.role === UserRole.ADMIN;
  };

  const handleAddItem = () => {
    const newItem: PurchaseItem = {
      id: `item_${Date.now()}`,
      productId: '',
      productName: '',
      unit: '',
      quantity: 0,
      unitPrice: 0,
      totalPrice: 0,
    };
    setItems(prev => [...prev, newItem]);
  };

  const handleItemChange = (itemId: string, field: keyof PurchaseItem, value: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.totalPrice = updated.quantity * updated.unitPrice;
        }
        if (field === 'productId') {
          const product = products.find(p => p.id === value);
          if (product) {
            updated.productName = product.name;
            updated.unit = product.unit;
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleGalleryClick = () => {
    if (canUploadReceipt() && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const imageData = event.target.result as string;
            cacheImage(imageData);
            setFormData(prev => ({ ...prev, receipt: imageData }));
          }
        };
        reader.readAsDataURL(file);
      }
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
        setFormData(prev => ({ ...prev, receipt: imageData }));
        stopCamera();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplier || items.length === 0) {
      alert(language === 'pt-BR' ? 'Preencha o fornecedor e adicione pelo menos um item.' : 'Fill in the supplier and add at least one item.');
      return;
    }

    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

    const purchaseData: Purchase = {
      id: purchase?.id || `purchase_${Date.now()}`,
      purchaseNumber: formData.purchaseNumber,
      supplier: formData.supplier,
      purchaseDate: formData.purchaseDate,
      totalAmount,
      items,
      receipt: formData.receipt || undefined,
      notes: formData.notes || undefined,
      createdBy: user?.name || 'Admin',
      createdAt: purchase?.createdAt || new Date().toISOString(),
    };

    onSave(purchaseData);
  };

  return (
    <div className="purchase-modal-overlay" onClick={onClose}>
      <div className="purchase-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? t('purchases.editPurchase') : t('purchases.newPurchase')}</h2>
          <button onClick={onClose} className="close-button">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="purchase-form">
          <div className="form-section">
            <h3>{t('purchases.items')}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>{t('purchases.purchaseNumber')} *</label>
                <input
                  type="text"
                  value={formData.purchaseNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchaseNumber: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>{t('purchases.supplier')} *</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                  required
                  placeholder={t('purchases.supplierPlaceholder')}
                />
              </div>

              <div className="form-group">
                <label>{t('purchases.purchaseDate')} *</label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>{t('purchases.items')}</h3>
              <button type="button" onClick={handleAddItem} className="add-item-button">
                + {t('purchases.addItem')}
              </button>
            </div>

            {items.length > 0 ? (
              <div className="items-list">
                {items.map((item, index) => (
                  <div key={item.id} className="item-form">
                    <div className="item-header">
                      <span className="item-number">{t('purchases.item')} {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="remove-item-button"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="item-grid">
                      <div className="form-group">
                        <label>{t('purchases.product')} *</label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleItemChange(item.id, 'productId', e.target.value)}
                          required
                          disabled={loadingProducts}
                        >
                          <option value="">{loadingProducts ? t('common.loading') : t('common.select')}</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.unit})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>{t('purchases.quantity')} *</label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>{t('purchases.unitPrice')} *</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>{t('purchases.total')}</label>
                        <input
                          type="text"
                          value={formatCurrency(item.totalPrice, language)}
                          disabled
                          className="total-input"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-items">
                <p>{t('purchases.noItems')}</p>
              </div>
            )}

            {items.length > 0 && (
              <div className="total-section">
                <span className="total-label">{t('purchases.totalPurchase')}:</span>
                <span className="total-amount">
                  {formatCurrency(items.reduce((sum, item) => sum + item.totalPrice, 0), language)}
                </span>
              </div>
            )}
          </div>

          {canUploadReceipt() && (
            <div className="form-section">
              <div className="section-header">
                <h3>{t('purchases.receipt')}</h3>
                <div className="receipt-actions">
                  <button type="button" onClick={handleGalleryClick} className="receipt-button">
                    📷 {t('purchases.gallery')}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                  <button
                    type="button"
                    onClick={showCamera ? stopCamera : startCamera}
                    className="receipt-button"
                  >
                    {showCamera ? `❌ ${t('common.close')}` : `📸 ${t('purchases.camera')}`}
                  </button>
                </div>
              </div>

              {showCamera && (
                <div className="camera-container">
                  <video ref={videoRef} autoPlay playsInline className="camera-video" />
                  <button type="button" onClick={capturePhoto} className="capture-button">
                    {t('purchases.capture')}
                  </button>
                </div>
              )}

              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {formData.receipt && (
                <div className="receipt-preview">
                  <img src={formData.receipt} alt={t('purchases.receiptAlt')} />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, receipt: '' }))}
                    className="remove-receipt-button"
                  >
                    ✕ {t('common.remove')}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="form-section">
            <h3>{t('purchases.notes')}</h3>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder={t('purchases.notesPlaceholder')}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              {t('common.cancel')}
            </button>
            <button type="submit" className="save-button">
              {t('purchases.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

