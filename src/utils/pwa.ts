// Utilitário para registro do Service Worker e funcionalidades PWA

export const registerSW = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado com sucesso:', registration.scope);
          
          // Verificar atualizações periodicamente
          setInterval(() => {
            registration.update();
          }, 60000); // A cada minuto
        })
        .catch((error) => {
          console.log('Erro ao registrar Service Worker:', error);
        });
    });
  }
};

// Função para solicitar instalação do PWA
export const promptInstall = async (): Promise<boolean> => {
  // @ts-ignore - beforeinstallprompt não está no tipo padrão
  const deferredPrompt = window.deferredPrompt;
  
  if (!deferredPrompt) {
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  // @ts-ignore
  window.deferredPrompt = null;
  
  return outcome === 'accepted';
};

// Detectar evento de instalação
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    // @ts-ignore
    window.deferredPrompt = e;
  });
}

