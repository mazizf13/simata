import React from 'react';

export const PageHeader = ({
    title,
    subtitle,
    breadcrumb,
    actions,
    action,
    className = '',
}) => {
    const renderedActions = actions || action;

    return (
        <div className={`mb-6 ${className}`}>
            {breadcrumb && <div className="mb-2">{breadcrumb}</div>}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="mt-1 text-sm text-gray-500">
                            {subtitle}
                        </p>
                    )}
                </div>
                {renderedActions && (
                    <div className="flex items-center gap-3 shrink-0">
                        {renderedActions}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
