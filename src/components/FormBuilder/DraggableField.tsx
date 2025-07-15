import React from 'react';
import { useDrag } from 'react-dnd';
import { FormField } from '../../types';

interface DraggableFieldProps {
  field: FormField;
  children: React.ReactNode;
}

const DraggableField: React.FC<DraggableFieldProps> = ({ field, children }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'field',
    item: { id: field.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
    >
      {children}
    </div>
  );
};

export default DraggableField;