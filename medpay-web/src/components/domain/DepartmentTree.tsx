import { useState, useCallback } from 'react';
import { ChevronRight, Folder, FolderOpen } from 'lucide-react';
import type { DepartmentResponse } from '@/types/department';
import { cn } from '@/lib/utils';

interface DepartmentTreeProps {
  departments: DepartmentResponse[];
  onSelect?: (dept: DepartmentResponse) => void;
  selectedId?: string;
}

interface TreeNode {
  dept: DepartmentResponse;
  children: TreeNode[];
}

function buildTree(departments: DepartmentResponse[]): TreeNode[] {
  // Since DepartmentResponse does not have parentId, we treat all departments as flat
  // but we sort by sortOrder for consistent display
  const sorted = [...departments].sort((a, b) => a.sortOrder - b.sortOrder);
  return sorted.map((dept) => ({ dept, children: [] }));
}

function TreeItem({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  selectedId?: string;
  onSelect?: (dept: DepartmentResponse) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedId === node.dept.id;

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasChildren) {
        setExpanded((prev) => !prev);
      }
    },
    [hasChildren],
  );

  const handleSelect = useCallback(() => {
    onSelect?.(node.dept);
  }, [node.dept, onSelect]);

  return (
    <div>
      <button
        onClick={handleSelect}
        className={cn(
          'group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
          isSelected
            ? 'bg-sage-50 text-sage-700 font-medium'
            : 'text-gray-700 hover:bg-ivory-100',
        )}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        {/* Expand icon */}
        <span
          onClick={handleToggle}
          className={cn(
            'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded transition-colors',
            hasChildren
              ? 'cursor-pointer hover:bg-sage-100 text-gray-400'
              : 'text-transparent',
          )}
        >
          <ChevronRight
            className={cn(
              'h-3.5 w-3.5 transition-transform',
              expanded && hasChildren && 'rotate-90',
            )}
          />
        </span>

        {/* Folder icon */}
        {expanded && hasChildren ? (
          <FolderOpen className="h-4 w-4 flex-shrink-0 text-sage-400" />
        ) : (
          <Folder className="h-4 w-4 flex-shrink-0 text-sage-300" />
        )}

        <span className="truncate">{node.dept.name}</span>

        {node.dept.description && (
          <span className="ml-auto hidden text-xs text-gray-400 group-hover:inline truncate max-w-[120px]">
            {node.dept.description}
          </span>
        )}
      </button>

      {/* Children */}
      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.dept.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DepartmentTree({
  departments,
  onSelect,
  selectedId,
}: DepartmentTreeProps) {
  const tree = buildTree(departments);

  if (departments.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-400">
        暂无科室数据
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-ivory-200/60 bg-white p-2 shadow-sm">
      {tree.map((node) => (
        <TreeItem
          key={node.dept.id}
          node={node}
          depth={0}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
