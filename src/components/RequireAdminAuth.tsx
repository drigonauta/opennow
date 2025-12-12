import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function RequireAdminAuth({ children }: { children: React.ReactNode }) {
    const token = localStorage.getItem('admin_token');
    const location = useLocation();

    if (!token) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
