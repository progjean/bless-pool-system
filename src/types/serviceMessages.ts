export interface ServiceMessage {
  id: string;
  title: string;
  content: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_SERVICE_MESSAGES: ServiceMessage[] = [
  {
    id: 'msg1',
    title: 'Serviço Completo Padrão',
    content: 'Olá! Informamos que o serviço de limpeza da sua piscina foi concluído com sucesso. Todos os parâmetros químicos estão dentro dos padrões recomendados. Qualquer dúvida, estamos à disposição.',
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'msg2',
    title: 'Serviço com Ajustes Químicos',
    content: 'Olá! O serviço de limpeza foi concluído. Realizamos alguns ajustes químicos na água conforme necessário. Os parâmetros estão agora dentro dos padrões recomendados. Em caso de dúvidas, entre em contato.',
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'msg3',
    title: 'Serviço Completo - Manutenção Preventiva',
    content: 'Olá! O serviço de limpeza e manutenção preventiva foi concluído. Todos os equipamentos foram verificados e estão funcionando corretamente. A água está em perfeitas condições. Obrigado pela confiança!',
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

