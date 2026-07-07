// components/FormSection.tsx
import React from 'react';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  required?: boolean;
}

export function FormSection({ title, children, required = false }: FormSectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {title}
        {required && <span className="text-red-500 ml-1">*</span>}
      </h2>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}