import React from 'react';

export default function RequireAdminAuth({ children }: { children: React.ReactNode }) {
    // Auth Disabled per user request
    return <>{children}</>;
}
