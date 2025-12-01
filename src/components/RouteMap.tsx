import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Client } from '../types/route';
import { useLanguage } from '../context/LanguageContext';
import './RouteMap.css';

interface RouteMapProps {
  clients: Client[];
  showRoute: boolean;
  onClose: () => void;
}

export const RouteMap: React.FC<RouteMapProps> = ({ clients, showRoute, onClose }) => {
  const { t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Carregar Mapbox (ou Google Maps)
    // Por enquanto, usar um placeholder visual
    // Em produção, integrar com Mapbox GL JS ou Google Maps API
    
    if (mapContainerRef.current && !mapLoaded) {
      // Simulação de mapa - em produção usar biblioteca real
      setMapLoaded(true);
    }
  }, [mapLoaded]);

  const calculateRoute = () => {
    // Algoritmo simples de otimização de rota (Nearest Neighbor)
    if (clients.length === 0) return [];

    const unvisited = [...clients];
    const route: Client[] = [];
    let current = unvisited[0];
    route.push(current);
    unvisited.splice(0, 1);

    while (unvisited.length > 0) {
      let nearest = unvisited[0];
      let minDistance = calculateDistance(current, nearest);

      for (const client of unvisited) {
        const distance = calculateDistance(current, client);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = client;
        }
      }

      route.push(nearest);
      unvisited.splice(unvisited.indexOf(nearest), 1);
      current = nearest;
    }

    return route;
  };

  const calculateDistance = (client1: Client, client2: Client): number => {
    // Fórmula de Haversine para calcular distância entre coordenadas
    const R = 6371; // Raio da Terra em km
    const dLat = (client2.latitude - client1.latitude) * Math.PI / 180;
    const dLon = (client2.longitude - client1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(client1.latitude * Math.PI / 180) * Math.cos(client2.latitude * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const optimizedRoute = React.useMemo(() => {
    return showRoute ? calculateRoute() : [];
  }, [showRoute, clients]);

  return (
    <div className="route-map-overlay" onClick={onClose}>
      <div className="route-map-container" onClick={(e) => e.stopPropagation()}>
        <div className="map-header">
          <h2>{t('workArea.map.title')}</h2>
          <button onClick={onClose} className="close-map-button">✕</button>
        </div>
        
        <div ref={mapContainerRef} className="map-placeholder">
          {!mapLoaded ? (
            <div className="map-loading">{t('workArea.map.loading')}</div>
          ) : (
            <>
              <div className="map-info">
                <p>📍 {clients.length} {t('workArea.map.clientsOnRoute')}</p>
                {showRoute && optimizedRoute.length > 0 && (
                  <div className="route-info">
                    <h3>{t('workArea.map.optimizedRoute')}</h3>
                    <ol>
                      {optimizedRoute.map((client, index) => (
                        <li key={client.id}>
                          {index + 1}. {client.name}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
              <div className="map-note">
                <p>💡 {t('workArea.map.note1')}</p>
                <p>{t('workArea.map.note2')}</p>
              </div>
            </>
          )}
        </div>

        {showRoute && optimizedRoute.length > 0 && (
          <div className="map-actions">
            <div className="route-summary">
              <p>{t('workArea.map.routeSummary', { count: optimizedRoute.length })}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

