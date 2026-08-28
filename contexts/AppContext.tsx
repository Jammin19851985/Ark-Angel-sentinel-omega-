
import React, { useEffect, ReactNode } from 'react';
import { useAppStore, AppState } from '../store/appStore';

// Re-export the store hook as useAppContext for backward compatibility
export const useAppContext = useAppStore;

// AppProvider is now primarily responsible for initializing the simulation/subscriptions
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const initApp = useAppStore(state => state.initApp);
    const theme = useAppStore(state => state.theme);
    const isSovereign = useAppStore(state => state.isSovereign);

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

    // Sovereign mode CSS variables & class sync effect
    useEffect(() => {
        if (isSovereign) {
            document.body.classList.add('sovereign-mode');
            document.documentElement.classList.add('sovereign-mode');
        } else {
            document.body.classList.remove('sovereign-mode');
            document.documentElement.classList.remove('sovereign-mode');
        }
    }, [isSovereign]);

    return <>{children}</>;
};
