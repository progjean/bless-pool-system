// Hook para paginação
import { useState, useMemo, useCallback } from 'react';

interface UsePaginationOptions {
  itemsPerPage?: number;
  initialPage?: number;
}

export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
) {
  const {
    itemsPerPage = 10,
    initialPage = 1,
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);

  // Calcular dados paginados
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  // Calcular informações de paginação
  const paginationInfo = useMemo(() => {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, items.length);

    return {
      currentPage,
      totalPages,
      itemsPerPage,
      totalItems: items.length,
      hasNextPage,
      hasPreviousPage,
      startItem,
      endItem,
    };
  }, [items.length, currentPage, itemsPerPage]);

  // Navegar para próxima página
  const nextPage = useCallback(() => {
    if (paginationInfo.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [paginationInfo.hasNextPage]);

  // Navegar para página anterior
  const previousPage = useCallback(() => {
    if (paginationInfo.hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [paginationInfo.hasPreviousPage]);

  // Ir para página específica
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= paginationInfo.totalPages) {
      setCurrentPage(page);
    }
  }, [paginationInfo.totalPages]);

  // Resetar para primeira página
  const reset = useCallback(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  return {
    paginatedData,
    paginationInfo,
    nextPage,
    previousPage,
    goToPage,
    reset,
    setCurrentPage,
  };
}

// Componente de controles de paginação
export interface PaginationControlsProps {
  paginationInfo: ReturnType<typeof usePagination>['paginationInfo'];
  onNext: () => void;
  onPrevious: () => void;
  onGoToPage: (page: number) => void;
}

