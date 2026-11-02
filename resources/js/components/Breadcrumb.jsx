import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb as IddsBreadcrumb } from '@idds/react';

export const Breadcrumb = ({ items = [] }) => {
    const navigate = useNavigate();

    const formattedItems = items.map((item, idx) => ({
        label: item.label,
        onClick: item.to ? () => navigate(item.to) : item.onClick,
    }));

    return (
        <div className="py-1">
            <IddsBreadcrumb items={formattedItems} />
        </div>
    );
};

export default Breadcrumb;
