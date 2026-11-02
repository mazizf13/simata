import React from 'react';

export const CardContainer = ({
    title,
    subtitle,
    actions,
    children,
    className = '',
    contentClassName = '',
}) => {
    return (
        <div className={`bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden ${className}`}>
            {(title || subtitle || actions) && (
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
                    <div>
                        {title && (
                            <h2 className="text-base font-semibold text-gray-900 leading-tight">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="mt-0.5 text-xs text-gray-500">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>
            )}
            <div className={`p-5 ${contentClassName}`}>{children}</div>
        </div>
    );
};

export default CardContainer;
