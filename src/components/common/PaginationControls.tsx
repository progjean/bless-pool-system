// Componente de controles de paginação
import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './PaginationControls.css';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startItem: number;
  endItem: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onGoToPage: (page: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  startItem,
  endItem,
  hasNextPage,
  hasPreviousPage,
  onNext,
  onPrevious,
  onGoToPage,
}) => {
  const { t } = useLanguage();

  // Gerar array de páginas para exibir
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Mostrar todas as páginas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar páginas com ellipsis
      if (currentPage <= 3) {
        // Início
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Fim
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Meio
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null; // Não mostrar controles se houver apenas uma página
  }

  return (
    <div className="pagination-controls">
      <div className="pagination-info">
        <span>
          {t('pagination.showing') || 'Mostrando'} {startItem}-{endItem} {t('pagination.of') || 'de'} {totalItems}
        </span>
      </div>

      <div className="pagination-buttons">
        <button
          onClick={onPrevious}
          disabled={!hasPreviousPage}
          className="pagination-button"
          aria-label={t('pagination.previous') || 'Página anterior'}
        >
          ←
        </button>

        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onGoToPage(pageNum)}
              className={`pagination-button ${isActive ? 'active' : ''}`}
              aria-label={`${t('pagination.page') || 'Página'} ${pageNum}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={onNext}
          disabled={!hasNextPage}
          className="pagination-button"
          aria-label={t('pagination.next') || 'Próxima página'}
        >
          →
        </button>
      </div>
    </div>
  );
};

