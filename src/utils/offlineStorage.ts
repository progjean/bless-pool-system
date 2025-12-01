// Sistema de armazenamento offline melhorado

export interface OfflineAction {
  id: string;
  type: 'service' | 'work_order' | 'inventory' | 'photo';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  synced: boolean;
}

const OFFLINE_ACTIONS_KEY = 'bless_pool_offline_actions';
const OFFLINE_PHOTOS_KEY = 'bless_pool_offline_photos';
const SYNC_STATUS_KEY = 'bless_pool_sync_status';

export const saveOfflineAction = (action: Omit<OfflineAction, 'id' | 'timestamp' | 'synced'>): string => {
  const actions = getOfflineActions();
  const newAction: OfflineAction = {
    ...action,
    id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    synced: false,
  };
  
  actions.push(newAction);
  localStorage.setItem(OFFLINE_ACTIONS_KEY, JSON.stringify(actions));
  
  return newAction.id;
};

export const getOfflineActions = (): OfflineAction[] => {
  const stored = localStorage.getItem(OFFLINE_ACTIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const getPendingActions = (): OfflineAction[] => {
  return getOfflineActions().filter(action => !action.synced);
};

export const markActionAsSynced = (actionId: string): void => {
  const actions = getOfflineActions();
  const updated = actions.map(action =>
    action.id === actionId ? { ...action, synced: true } : action
  );
  localStorage.setItem(OFFLINE_ACTIONS_KEY, JSON.stringify(updated));
};

export const removeSyncedActions = (): void => {
  const actions = getOfflineActions().filter(action => !action.synced);
  localStorage.setItem(OFFLINE_ACTIONS_KEY, JSON.stringify(actions));
};

export const saveOfflinePhoto = (photoId: string, photoData: string): void => {
  const photos = getOfflinePhotos();
  photos[photoId] = photoData;
  localStorage.setItem(OFFLINE_PHOTOS_KEY, JSON.stringify(photos));
};

export const getOfflinePhotos = (): Record<string, string> => {
  const stored = localStorage.getItem(OFFLINE_PHOTOS_KEY);
  return stored ? JSON.parse(stored) : {};
};

export const getOfflinePhoto = (photoId: string): string | null => {
  const photos = getOfflinePhotos();
  return photos[photoId] || null;
};

export const removeOfflinePhoto = (photoId: string): void => {
  const photos = getOfflinePhotos();
  delete photos[photoId];
  localStorage.setItem(OFFLINE_PHOTOS_KEY, JSON.stringify(photos));
};

export const getSyncStatus = (): { lastSync: string | null; isOnline: boolean } => {
  const stored = localStorage.getItem(SYNC_STATUS_KEY);
  const status = stored ? JSON.parse(stored) : { lastSync: null, isOnline: navigator.onLine };
  return {
    ...status,
    isOnline: navigator.onLine,
  };
};

export const updateSyncStatus = (lastSync: string): void => {
  localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify({
    lastSync,
    isOnline: navigator.onLine,
  }));
};

export const clearOfflineData = (): void => {
  localStorage.removeItem(OFFLINE_ACTIONS_KEY);
  localStorage.removeItem(OFFLINE_PHOTOS_KEY);
};

