import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function DataTablePagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: DataTablePaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const btnBase = cn(
    'inline-flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-40',
  );
  const btnDefault = cn(btnBase, 'text-gray-600 hover:bg-ivory-100 hover:text-sage-600');
  const btnActive = cn(
    btnBase,
    'bg-sage-500 text-white font-medium shadow-xs hover:bg-sage-600',
  );

  // Generate visible page numbers (max 5 pages with ellipsis)
  const getPages = (): (number | 'ellipsis')[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | 'ellipsis')[] = [1];
    if (currentPage > 3) pages.push('ellipsis');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div
      className={cn(
        'mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row',
        className,
      )}
    >
      <p className="text-sm text-gray-500">
        显示 {startItem}-{endItem} 条，共 {totalItems} 条
      </p>
      <div className="flex items-center gap-1">
        <button
          className={btnDefault}
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
          aria-label="第一页"
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
        <button
          className={btnDefault}
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="上一页"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPages().map((page, idx) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-gray-400">
              ...
            </span>
          ) : (
            <button
              key={page}
              className={page === currentPage ? btnActive : btnDefault}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          ),
        )}

        <button
          className={btnDefault}
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="下一页"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          className={btnDefault}
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          aria-label="最后一页"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
