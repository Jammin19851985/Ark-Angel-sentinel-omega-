
import React, { useEffect, ReactNode } from 'react';
import { useAppStore, AppState } from '../store/appStore';

// Re-export the store hook as useAppContext for backward compatibility
export const useAppContext = useAppStore;

// AppProvider is now primarily responsible for initializing the simulation/subscriptions
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const initApp = useAppStore(state => state.initApp);
    const theme = useAppStore(state => state.theme);

    useEffect(() => {
        initApp();
    }, [initApp]);

    // Theme sync effect
    useEffect(() => {
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        } else {
            document.body.classList.remove('light-theme');
        }
    }, [theme]);

    return <>{children}</>;
};
