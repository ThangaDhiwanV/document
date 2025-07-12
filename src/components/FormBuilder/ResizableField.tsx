import React, { useState, useRef, useCallback } from 'react';
import { FormField } from '../../types';

interface ResizableFieldProps {
  field: FormField;
  children: React.ReactNode;
  onUpdateField: (updates: Partial<FormField>) => void;
  onSelectField: (field: FormField) => void;
  isSelected: boolean;
}

const ResizableField: React.FC<ResizableFieldProps> = ({ 
  field, 
  children, 
  onUpdateField, 
  onSelectField,
  isSelected 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0 });
  const fieldRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start dragging if clicking on the field itself or drag handle, not on form inputs
    const target = e.target as HTMLElement;
    const isFormInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.tagName === 'BUTTON';
    const isActionButton = target.closest('.field-actions');
    const isTableCell = target.closest('td') || target.closest('th');
    
    if (!isFormInput && !isActionButton && !isTableCell && (e.target === e.currentTarget || target.classList.contains('drag-handle'))) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - (field.position?.x || 0),
        y: e.clientY - (field.position?.y || 0)
      });
      
      // Select field on click (but don't open properties panel)
      onSelectField(field);
      
      e.preventDefault();
    }
  }, [field.position, field, onSelectField]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    setResizeStart({
      width: field.size?.width || 200,
      height: field.size?.height || 40
    });
    setDragStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
    e.stopPropagation();
  }, [field.size]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, e.clientX - dragStart.x);
      const newY = Math.max(0, e.clientY - dragStart.y);
      onUpdateField({
        position: { x: newX, y: newY }
      });
    } else if (isResizing) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      const newWidth = Math.max(100, resizeStart.width + deltaX);
      const newHeight = Math.max(30, resizeStart.height + deltaY);
      onUpdateField({
        size: { width: newWidth, height: newHeight }
      });
    }
  }, [isDragging, isResizing, dragStart, resizeStart, onUpdateField]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const fieldStyle = {
    position: 'absolute' as const,
    left: field.position?.x || 0,
    top: field.position?.y || 0,
    width: field.size?.width || 'auto',
    height: field.size?.height || 'auto',
    minWidth: '100px',
    minHeight: '30px',
    cursor: isDragging ? 'grabbing' : 'grab'
  };

  return (
    <div
      ref={fieldRef}
      style={fieldStyle}
      onMouseDown={handleMouseDown}
      className={`group ${isSelected ? 'ring-2 ring-blue-500' : ''} ${isDragging ? 'z-50' : 'z-10'}`}
    >
      {children}
      
      {/* Resize handle - always visible for selected field */}
      <div
        onMouseDown={handleResizeMouseDown}
        className={`absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
        style={{ transform: 'translate(50%, 50%)' }}
      />
      
      {/* Drag handle - always visible for selected field */}
      <div className={`drag-handle absolute top-0 left-0 w-full h-6 bg-blue-500 bg-opacity-20 cursor-move transition-opacity flex items-center justify-center ${
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <div className="w-4 h-1 bg-blue-500 rounded"></div>
      </div>
    </div>
  );
};

export default ResizableField;