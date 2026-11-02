import React from 'react';

export const FormSection = ({
    title,
    description,
    children,
    actions,
    className = '',
}) => {
    return (
        <div className={`bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden mb-6 ${className}`}>
            {(title || description) && (
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    {title && (
                        <h2 className="text-base font-semibold text-gray-900">
                            {title}
                        </h2>
                    )}
                    {description && (
                        <p className="mt-1 text-xs text-gray-500">
                            {description}
                        </p>
                    )}
                </div>
            )}
            <div className="p-6 space-y-4">
                {children}
            </div>
            {actions && (
                <div className="px-6 py-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
};

export default FormSection;
