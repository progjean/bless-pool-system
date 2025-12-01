import { Client, Route, ChecklistItem } from '../types/route';

// Mock de clientes
export const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Residência Silva',
    address: 'Rua das Flores, 123, São Paulo - SP',
    latitude: -23.5505,
    longitude: -46.6333,
    serviceType: 'regular',
    status: 'pending',
    scheduledTime: '09:00',
    estimatedDuration: 45,
  },
  {
    id: '2',
    name: 'Condomínio Vista Mar',
    address: 'Av. Beira Mar, 456, Santos - SP',
    latitude: -23.9608,
    longitude: -46.3331,
    serviceType: 'regular',
    status: 'pending',
    scheduledTime: '10:30',
    estimatedDuration: 60,
  },
  {
    id: '3',
    name: 'Hotel Paradise',
    address: 'Rua do Comércio, 789, Guarujá - SP',
    latitude: -23.9931,
    longitude: -46.2564,
    serviceType: 'deep',
    status: 'pending',
    scheduledTime: '14:00',
    estimatedDuration: 90,
  },
  {
    id: '4',
    name: 'Casa da Praia',
    address: 'Av. Atlântica, 321, Praia Grande - SP',
    latitude: -24.0089,
    longitude: -46.4128,
    serviceType: 'regular',
    status: 'pending',
    scheduledTime: '16:00',
    estimatedDuration: 50,
  },
];

// Checklists pré-cadastrados
export const DEFAULT_CHECKLIST: ChecklistItem[] = [
  // Pool
  { id: 'chk1', label: 'Verificar nível da água', checked: false, category: 'pool' },
  { id: 'chk2', label: 'Limpar skimmer e pré-filtro', checked: false, category: 'pool' },
  { id: 'chk3', label: 'Escovar paredes e fundo', checked: false, category: 'pool' },
  { id: 'chk4', label: 'Aspirar fundo da piscina', checked: false, category: 'pool' },
  { id: 'chk5', label: 'Verificar bordas e azulejos', checked: false, category: 'pool' },
  
  // Equipment
  { id: 'chk6', label: 'Verificar bomba e motor', checked: false, category: 'equipment' },
  { id: 'chk7', label: 'Verificar filtro', checked: false, category: 'equipment' },
  { id: 'chk8', label: 'Verificar aquecedor', checked: false, category: 'equipment' },
  { id: 'chk9', label: 'Verificar iluminação', checked: false, category: 'equipment' },
  
  // Safety
  { id: 'chk10', label: 'Verificar escada e corrimão', checked: false, category: 'safety' },
  { id: 'chk11', label: 'Verificar cercas e portões', checked: false, category: 'safety' },
  
  // Other
  { id: 'chk12', label: 'Verificar área ao redor', checked: false, category: 'other' },
];

// Produtos disponíveis
export const AVAILABLE_PRODUCTS = [
  { id: 'prod1', name: 'Cloro Granulado', unit: 'kg' },
  { id: 'prod2', name: 'Cloro Líquido', unit: 'litros' },
  { id: 'prod3', name: 'Algicida', unit: 'litros' },
  { id: 'prod4', name: 'Clarificante', unit: 'litros' },
  { id: 'prod5', name: 'Ajustador de pH', unit: 'kg' },
  { id: 'prod6', name: 'Estabilizador', unit: 'kg' },
];

// Químicos para leitura
export const CHEMICALS = [
  { id: 'chem1', name: 'Cloro Livre', unit: 'ppm', min: 1, max: 3 },
  { id: 'chem2', name: 'Cloro Total', unit: 'ppm', min: 1, max: 3 },
  { id: 'chem3', name: 'pH', unit: '', min: 7.2, max: 7.6 },
  { id: 'chem4', name: 'Alcalinidade Total', unit: 'ppm', min: 80, max: 120 },
  { id: 'chem5', name: 'Dureza Cálcica', unit: 'ppm', min: 200, max: 400 },
  { id: 'chem6', name: 'Ácido Cianúrico', unit: 'ppm', min: 30, max: 50 },
];

