import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types/user';
import { ServiceData, ChecklistItem, ChemicalReading, Dosage } from '../types/route';
import { ReadingStandard, DosageStandard } from '../types/settings';
import { DEFAULT_READINGS, DEFAULT_DOSAGES } from '../data/settingsData';
import { ServiceMessage, DEFAULT_SERVICE_MESSAGES } from '../types/serviceMessages';
import { ServiceHistory } from '../data/serviceHistoryData';
import { settingsService } from '../services/settingsService';
import { servicesService } from '../services/servicesService';
import { storageService } from '../services/storageService';
import { customersService } from '../services/customersService';
import { cacheImage } from '../utils/sync';
import { SyncStatus } from '../components/SyncStatus';
import { SkipServiceModal } from '../components/SkipServiceModal';
import { sendServiceReportEmail } from '../utils/pdfGenerator';
import { formatTemperature } from '../utils/formatUtils';
import { showToast } from '../utils/toast';
import './ServicePage.css';

interface LocationState {
  client?: any;
  viewMode?: 'self' | 'technician';
  technicianId?: string;
}

export const ServicePage: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const { user } = useAuth();
  const { t, language } = useLanguage();

  // Estados principais
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [readings, setReadings] = useState<ChemicalReading[]>([]);
  const [dosages, setDosages] = useState<Dosage[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [observations, setObservations] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ServiceMessage | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [serviceMessages, setServiceMessages] = useState<ServiceMessage[]>([]);
  
  // Estados de UI
  const [readingsExpanded, setReadingsExpanded] = useState(true);
  const [dosagesExpanded, setDosagesExpanded] = useState(true);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [showAllReadings, setShowAllReadings] = useState(false);
  const [showAllDosages, setShowAllDosages] = useState(false);
  
  // Controle de tempo de serviço
  const [serviceStartTime, setServiceStartTime] = useState<Date | null>(null);
  const [serviceElapsedTime, setServiceElapsedTime] = useState(0); // em segundos
  
  // Referências
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [clientData, setClientData] = useState<any>(state?.client || null);
  const client = clientData || { id: clientId, name: t('service.client'), address: '' };

  // Carregar dados completos do cliente se necessário
  useEffect(() => {
    const loadClientData = async () => {
      if (!clientId || state?.client) return; // Se já tem dados do state, não precisa buscar
      
      try {
        const customerResult = await customersService.get(clientId);
        if (customerResult) {
          setClientData({
            ...customerResult,
            name: customerResult.name || `${customerResult.firstName} ${customerResult.lastName}`,
            address: customerResult.address,
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados do cliente:', error);
      }
    };

    loadClientData();
  }, [clientId, state?.client]);

  // Carregar readings, dosages e checklist das configurações
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Carregar checklist
        const checklistData = await settingsService.getChecklist();
        setChecklist(checklistData);

        // Buscar readings configurados do serviço ou usar defaults
        let readingsToUse = DEFAULT_READINGS;
        try {
          const savedReadings = await settingsService.getReadings();
          if (savedReadings && savedReadings.length > 0) {
            readingsToUse = savedReadings;
          }
        } catch (error) {
          console.warn('Erro ao carregar readings, usando defaults:', error);
        }
        
        // Ordenar por order e criar entradas vazias
        const sortedReadings = [...readingsToUse].sort((a, b) => (a.order || 999) - (b.order || 999));
        const configuredReadings: ChemicalReading[] = sortedReadings.map(reading => ({
          id: `reading_${reading.id}`,
          chemical: reading.readingType || reading.name,
          value: 0,
          unit: reading.unit,
          timestamp: new Date().toISOString(),
        }));
        setReadings(configuredReadings);

        // Buscar dosages configurados do serviço ou usar defaults
        let dosagesToUse = DEFAULT_DOSAGES;
        try {
          const savedDosages = await settingsService.getDosages();
          if (savedDosages && savedDosages.length > 0) {
            dosagesToUse = savedDosages;
          }
        } catch (error) {
          console.warn('Erro ao carregar dosages, usando defaults:', error);
        }
        
        // Ordenar por order e criar entradas vazias
        const sortedDosages = [...dosagesToUse].sort((a, b) => (a.order || 999) - (b.order || 999));
        const configuredDosages: Dosage[] = sortedDosages.map(dosage => ({
          id: `dosage_${dosage.id}`,
          chemical: dosage.dosageType || dosage.name,
          amount: 0,
          unit: dosage.unit,
          timestamp: new Date().toISOString(),
        }));
        setDosages(configuredDosages);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };

    loadSettings();

    // Carregar mensagens padrão do serviço
    const loadMessages = async () => {
      try {
        const messages = await settingsService.getServiceMessages();
        const messagesToUse = messages.length > 0 ? messages : DEFAULT_SERVICE_MESSAGES;
        setServiceMessages(messagesToUse);
        
        // Carregar mensagem padrão selecionada
        const savedMessageId = localStorage.getItem('defaultServiceMessage');
        if (savedMessageId) {
          const message = messagesToUse.find(m => m.id === savedMessageId);
          if (message) {
            setSelectedMessage(message);
            setCustomMessage(message.content);
          } else if (messagesToUse.length > 0) {
            setSelectedMessage(messagesToUse[0]);
            setCustomMessage(messagesToUse[0].content);
          }
        } else if (messagesToUse.length > 0) {
          setSelectedMessage(messagesToUse[0]);
          setCustomMessage(messagesToUse[0].content);
        }
      } catch (error) {
        console.error('Erro ao carregar mensagens:', error);
        // Fallback para defaults
        setServiceMessages(DEFAULT_SERVICE_MESSAGES);
        if (DEFAULT_SERVICE_MESSAGES.length > 0) {
          setSelectedMessage(DEFAULT_SERVICE_MESSAGES[0]);
          setCustomMessage(DEFAULT_SERVICE_MESSAGES[0].content);
        }
      }
    };

    loadMessages();
  }, [clientId]);

  // Timer para tempo de serviço
  useEffect(() => {
    if (serviceStartTime) {
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - serviceStartTime.getTime()) / 1000);
        setServiceElapsedTime(elapsed);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [serviceStartTime]);

  const startServiceTimer = () => {
    const startTime = new Date();
    setServiceStartTime(startTime);
    setServiceElapsedTime(0);
    localStorage.setItem(`service_${clientId}_startTime`, startTime.toISOString());
  };

  const restartServiceTimer = () => {
    startServiceTimer();
  };

  const formatElapsedTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const saveServiceData = () => {
    const serviceData: ServiceData = {
      clientId: clientId!,
      checklist,
      readings: readings.filter(r => r.value > 0), // Apenas readings com valor
      dosages: dosages.filter(d => d.amount > 0), // Apenas dosages com quantidade
      products: [], // Removido Products Used
      photos,
      observations,
    };
    localStorage.setItem(`service_${clientId}`, JSON.stringify(serviceData));
  };

  useEffect(() => {
    saveServiceData();
  }, [checklist, readings, dosages, photos, observations, clientId]);

  const handleChecklistChange = (id: string) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleReadingChange = (id: string, value: number) => {
    setReadings(prev =>
      prev.map(reading =>
        reading.id === id ? { ...reading, value, timestamp: new Date().toISOString() } : reading
      )
    );
  };

  const handleDosageChange = (id: string, amount: number) => {
    setDosages(prev =>
      prev.map(dosage =>
        dosage.id === id ? { ...dosage, amount, timestamp: new Date().toISOString() } : dosage
      )
    );
  };

  const canUploadFromGallery = () => {
    return user?.role === UserRole.ADMIN;
  };

  const handleGalleryClick = () => {
    if (canUploadFromGallery() && fileInputRef.current) {
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
      alert(language === 'pt-BR' ? 'Não foi possível acessar a câmera. Verifique as permissões.' : 'Could not access camera. Please check permissions.');
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

  const handleMessageChange = (messageId: string) => {
    const message = serviceMessages.find(m => m.id === messageId);
    if (message) {
      setSelectedMessage(message);
      setCustomMessage(message.content);
      localStorage.setItem('defaultServiceMessage', messageId);
    }
  };

  const handleCreateWorkOrder = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Creating work order for client:', clientId);
    
    // Usar rota diferente baseado no role do usuário
    const workOrderRoute = user?.role === UserRole.ADMIN 
      ? `/admin/work-orders/new` 
      : `/work/work-orders/new`;
    
    navigate(workOrderRoute, {
      state: {
        customerId: clientId,
        customerName: client.name,
        returnToService: true,
        client: client,
        viewMode: state?.viewMode,
        technicianId: state?.technicianId,
      }
    });
  };

  const handleCompleteService = async () => {
    try {
      const serviceData: ServiceData = {
        clientId: clientId!,
        checklist,
        readings: readings.filter(r => r.value > 0),
        dosages: dosages.filter(d => d.amount > 0),
        products: [],
        photos,
        observations,
        completedAt: new Date().toISOString(),
      };

      // Upload de fotos para storage
      const uploadedPhotoUrls: string[] = [];
      if (photos.length > 0 && user) {
        try {
          for (const photo of photos) {
            // Se for base64, converter para File
            if (photo.startsWith('data:image')) {
              const response = await fetch(photo);
              const blob = await response.blob();
              const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
              const url = await storageService.uploadServicePhoto(file, clientId!);
              uploadedPhotoUrls.push(url);
            } else {
              uploadedPhotoUrls.push(photo);
            }
          }
        } catch (error) {
          console.warn('Erro ao fazer upload de fotos, continuando sem upload:', error);
          // Continuar mesmo se upload falhar
        }
      }

      // Salvar serviço no backend
      const technicianName = user?.name || 'Unknown';
      const serviceId = await servicesService.create(serviceData, technicianName);

      // Salvar dados completos localmente também (fallback)
      localStorage.setItem(`service_${clientId}_completed`, JSON.stringify(serviceData));
      localStorage.removeItem(`service_${clientId}_startTime`);

      // Gerar PDF e enviar e-mail com mensagem personalizada
      try {
        // Buscar email do cliente
        const clientEmail = client.contacts?.find((c: any) => c.type === 'email')?.value || 
                           clientData?.contacts?.find((c: any) => c.type === 'email')?.value || 
                           'cliente@example.com';
        const messageToSend = customMessage || (selectedMessage?.content || '');
        
        const success = await sendServiceReportEmail(serviceData, client, clientEmail, messageToSend);
        
        if (success) {
          showToast.success(t('service.completedSuccess') || 'Serviço concluído com sucesso!');
        } else {
          showToast.error(t('service.sendError') || 'Erro ao enviar relatório.');
        }
      } catch (error) {
        console.error('Erro ao enviar relatório:', error);
        showToast.info(t('service.completedButSendError') || 'Serviço salvo, mas erro ao enviar relatório.');
      }
      
      navigate('/work');
    } catch (error) {
      console.error('Erro ao completar serviço:', error);
      showToast.error(t('service.completeError') || 'Erro ao completar serviço.');
    }
  };

  const handleSkipService = () => {
    setShowSkipModal(true);
  };

  const handleBack = () => {
    navigate('/work');
  };

  const groupedChecklist = checklist.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  // Buscar histórico do cliente
  const [clientHistory, setClientHistory] = useState<ServiceHistory[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!clientId) return;
      
      try {
        const historyData = await servicesService.getClientHistory(clientId, 5);
        const history: ServiceHistory[] = historyData.map((service, index) => ({
          id: `hist_${index}`,
          clientId: service.clientId,
          serviceDate: service.completedAt || new Date().toISOString(),
          readings: service.readings || [],
          dosages: service.dosages || [],
          completedAt: service.completedAt || new Date().toISOString(),
        }));
        
        // Combinar com histórico local (fallback)
        const localHistory = JSON.parse(localStorage.getItem('serviceHistory') || '[]')
          .filter((h: ServiceHistory) => h.clientId === clientId);
        
        const combined = [...history, ...localHistory]
          .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime())
          .slice(0, 5);
        
        setClientHistory(combined);
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        // Fallback para localStorage apenas
        const localHistory = JSON.parse(localStorage.getItem('serviceHistory') || '[]')
          .filter((h: ServiceHistory) => h.clientId === clientId)
          .sort((a, b) => new Date(b.serviceDate || b.completedAt || '').getTime() - new Date(a.serviceDate || a.completedAt || '').getTime())
          .slice(0, 5);
        setClientHistory(localHistory);
      }
    };

    loadHistory();
  }, [clientId]);


  return (
    <div className="service-page">
      <header className="service-header">
        <div className="header-content">
          <div>
            <button onClick={handleBack} className="back-button">← {t('common.back')}</button>
            <h1>{client.name}</h1>
            <p className="client-address">{client.address}</p>
          </div>
          <div className="header-actions">
            <button 
              type="button"
              onClick={handleCreateWorkOrder} 
              className="work-order-button"
            >
              📋 {language === 'pt-BR' ? 'Criar Work Order' : 'Create Work Order'}
            </button>
          </div>
        </div>
      </header>

      <main className="service-main">
        {/* Controle de Tempo de Serviço */}
        <section className="service-section timer-section">
          <div className="timer-controls">
            <div className="timer-display">
              {serviceStartTime ? (
                <>
                  <div className="timer-label">{language === 'pt-BR' ? 'Tempo de Serviço' : 'Service Time'}</div>
                  <div className="timer-value">{formatElapsedTime(serviceElapsedTime)}</div>
                  <div className="timer-start-time">
                    {language === 'pt-BR' ? 'Iniciado em' : 'Started at'}: {serviceStartTime.toLocaleTimeString(language === 'pt-BR' ? 'pt-BR' : 'en-US')}
                  </div>
                </>
              ) : (
                <>
                  <div className="timer-label">{language === 'pt-BR' ? 'Serviço não iniciado' : 'Service not started'}</div>
                  <button onClick={startServiceTimer} className="start-timer-button">
                    ▶️ {language === 'pt-BR' ? 'Iniciar Serviço' : 'Start Service'}
                  </button>
                </>
              )}
            </div>
            {serviceStartTime && (
              <button onClick={restartServiceTimer} className="restart-timer-button">
                🔄 {language === 'pt-BR' ? 'Reiniciar' : 'Restart'}
              </button>
            )}
          </div>
        </section>

        {/* Checklists */}
        <section className="service-section">
          <h2>{t('service.checklist')}</h2>
          <div className="checklist-container">
            {Object.entries(groupedChecklist).map(([category, items]) => (
              <div key={category} className="checklist-group">
                <h3 className="checklist-category">{category.toUpperCase()}</h3>
                {items.map((item) => (
                  <label key={item.id} className="checklist-item">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleChecklistChange(item.id)}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Chemical Readings - Com expansão */}
        <section className="service-section collapsible-section">
          <div className="section-header-collapsible">
            <h2>{language === 'pt-BR' ? 'Leituras Químicas' : 'Chemical Readings'}</h2>
            <button 
              onClick={() => setReadingsExpanded(!readingsExpanded)}
              className="expand-button"
            >
              {readingsExpanded ? '▼' : '▶'}
            </button>
          </div>
          {readingsExpanded && (
            <>
              <div className="readings-list">
                {(showAllReadings ? readings : readings.slice(0, 4)).map((reading) => {
                  const savedReadings = localStorage.getItem('readingsSettings');
                  const readingsToUse = savedReadings ? JSON.parse(savedReadings) : DEFAULT_READINGS;
                  const configuredReading = readingsToUse.find((r: ReadingStandard) => r.name === reading.chemical);
                  return (
                    <div key={reading.id} className="reading-item">
                      <div className="reading-info">
                        <span className="reading-name">{reading.chemical}</span>
                        {configuredReading && (
                          <span className="reading-range">
                            {language === 'pt-BR' ? 'Faixa' : 'Range'}: {configuredReading.minValue} - {configuredReading.maxValue} {configuredReading.unit}
                          </span>
                        )}
                      </div>
                      <div className="reading-input-group">
                        <input
                          type="number"
                          step="0.1"
                          value={reading.value || ''}
                          onChange={(e) => handleReadingChange(reading.id, parseFloat(e.target.value) || 0)}
                          className="reading-input"
                          placeholder={language === 'pt-BR' ? 'Valor medido' : 'Measured value'}
                        />
                        <span className="reading-unit">{reading.unit}</span>
                      </div>
                      {reading.value > 0 && configuredReading && (
                        <div className={`reading-status ${
                          reading.value >= configuredReading.minValue && reading.value <= configuredReading.maxValue
                            ? 'in-range' : 'out-of-range'
                        }`}>
                          {reading.value >= configuredReading.minValue && reading.value <= configuredReading.maxValue
                            ? '✓' : '⚠️'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {readings.length > 4 && (
                <button 
                  onClick={() => setShowAllReadings(!showAllReadings)}
                  className="show-more-button"
                >
                  {showAllReadings 
                    ? `▲ ${language === 'pt-BR' ? 'Mostrar menos' : 'Show less'}` 
                    : `▼ ${language === 'pt-BR' ? `Ver mais (${readings.length - 4} restantes)` : `Show more (${readings.length - 4} remaining)`}`}
                </button>
              )}
            </>
          )}
        </section>

        {/* Applied Dosages - Com expansão */}
        <section className="service-section collapsible-section">
          <div className="section-header-collapsible">
            <h2>{language === 'pt-BR' ? 'Dosagens Aplicadas' : 'Applied Dosages'}</h2>
            <button 
              onClick={() => setDosagesExpanded(!dosagesExpanded)}
              className="expand-button"
            >
              {dosagesExpanded ? '▼' : '▶'}
            </button>
          </div>
          {dosagesExpanded && (
            <>
              <div className="dosages-list">
                {(showAllDosages ? dosages : dosages.slice(0, 4)).map((dosage) => {
                  const savedDosages = localStorage.getItem('dosagesSettings');
                  const dosagesToUse = savedDosages ? JSON.parse(savedDosages) : DEFAULT_DOSAGES;
                  const configuredDosage = dosagesToUse.find((d: DosageStandard) => d.name === dosage.chemical);
                  return (
                    <div key={dosage.id} className="dosage-item">
                      <div className="dosage-info">
                        <span className="dosage-name">{dosage.chemical}</span>
                        {configuredDosage && (
                          <span className="dosage-default">
                            {language === 'pt-BR' ? 'Padrão' : 'Default'}: {configuredDosage.defaultAmount} {configuredDosage.unit}
                          </span>
                        )}
                      </div>
                      <div className="dosage-input-group">
                        <input
                          type="number"
                          step="0.1"
                          value={dosage.amount || ''}
                          onChange={(e) => handleDosageChange(dosage.id, parseFloat(e.target.value) || 0)}
                          className="dosage-input"
                          placeholder={language === 'pt-BR' ? 'Quantidade aplicada' : 'Amount applied'}
                        />
                        <span className="dosage-unit">{dosage.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {dosages.length > 4 && (
                <button 
                  onClick={() => setShowAllDosages(!showAllDosages)}
                  className="show-more-button"
                >
                  {showAllDosages 
                    ? `▲ ${language === 'pt-BR' ? 'Mostrar menos' : 'Show less'}` 
                    : `▼ ${language === 'pt-BR' ? `Ver mais (${dosages.length - 4} restantes)` : `Show more (${dosages.length - 4} remaining)`}`}
                </button>
              )}
            </>
          )}
        </section>

        {/* Histórico das últimas 5 visitas */}
        {clientHistory.length > 0 && (
          <section className="service-section collapsible-section">
            <div className="section-header-collapsible">
              <h2>{language === 'pt-BR' ? 'Histórico (Últimas 5 Visitas)' : 'History (Last 5 Visits)'}</h2>
              <button 
                onClick={() => setHistoryExpanded(!historyExpanded)}
                className="expand-button"
              >
                {historyExpanded ? '▼' : '▶'}
              </button>
            </div>
            {historyExpanded && (
              <div className="history-list">
                {clientHistory.map((history) => (
                  <div key={history.id} className="history-item">
                    <div className="history-date">
                      {new Date(history.serviceDate).toLocaleDateString(language === 'pt-BR' ? 'pt-BR' : 'en-US')}
                    </div>
                    {history.readings.length > 0 && (
                      <div className="history-readings">
                        <strong>{language === 'pt-BR' ? 'Leituras' : 'Readings'}:</strong>
                        {history.readings.map((r, idx) => (
                          <span key={idx} className="history-reading-tag">
                            {r.chemical}: {r.value} {r.unit}
                          </span>
                        ))}
                      </div>
                    )}
                    {history.dosages.length > 0 && (
                      <div className="history-dosages">
                        <strong>{language === 'pt-BR' ? 'Dosagens' : 'Dosages'}:</strong>
                        {history.dosages.map((d, idx) => (
                          <span key={idx} className="history-dosage-tag">
                            {d.chemical}: {d.amount} {d.unit}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Photos */}
        <section className="service-section">
          <div className="section-header">
            <h2>{t('service.photos')}</h2>
            <div className="photo-actions">
              {canUploadFromGallery() && (
                <>
                  <button onClick={handleGalleryClick} className="photo-button">
                    📷 {t('purchases.gallery')}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                </>
              )}
              <button onClick={showCamera ? stopCamera : startCamera} className="photo-button">
                {showCamera ? `❌ ${t('common.close')}` : `📸 ${t('purchases.camera')}`}
              </button>
            </div>
          </div>

          {showCamera && (
            <div className="camera-container">
              <video ref={videoRef} autoPlay playsInline className="camera-video" />
              <button onClick={capturePhoto} className="capture-button">
                {t('purchases.capture')}
              </button>
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {photos.length > 0 && (
            <div className="photos-grid">
              {photos.map((photo, index) => (
                <div key={index} className="photo-item">
                  <img src={photo} alt={`${language === 'pt-BR' ? 'Foto' : 'Photo'} ${index + 1}`} />
                  <button onClick={() => removePhoto(index)} className="remove-photo-btn">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          {photos.length === 0 && (
            <p className="empty-message">{t('service.noPhotos')}</p>
          )}
        </section>

        {/* Mensagem Padrão */}
        <section className="service-section">
          <h2>{language === 'pt-BR' ? 'Mensagem Padrão' : 'Default Message'}</h2>
          {serviceMessages.length > 0 ? (
            <select
              value={selectedMessage?.id || ''}
              onChange={(e) => handleMessageChange(e.target.value)}
              className="message-select"
            >
              {serviceMessages.map(msg => (
                <option key={msg.id} value={msg.id}>{msg.title}</option>
              ))}
            </select>
          ) : (
            <p className="empty-message">{language === 'pt-BR' ? 'Nenhuma mensagem configurada' : 'No messages configured'}</p>
          )}
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="message-textarea"
            placeholder={language === 'pt-BR' ? 'Personalize a mensagem que será enviada ao cliente...' : 'Customize the message that will be sent to the client...'}
            rows={4}
          />
        </section>

        {/* Observations */}
        <section className="service-section">
          <h2>{t('service.observations')}</h2>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="observations-textarea"
            placeholder={t('service.observationsPlaceholder')}
            rows={6}
          />
        </section>

        {/* Actions */}
        <div className="service-actions">
          <button onClick={handleSkipService} className="skip-button">
            ⊘ {t('service.skipService')}
          </button>
          <button onClick={handleCompleteService} className="complete-button">
            ✓ {t('service.completeService')}
          </button>
        </div>
      </main>

      {showSkipModal && (
        <SkipServiceModal
          clientId={clientId!}
          clientName={client.name}
          onClose={() => setShowSkipModal(false)}
        />
      )}

      <SyncStatus />
    </div>
  );
};
