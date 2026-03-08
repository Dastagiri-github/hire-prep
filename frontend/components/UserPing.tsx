"use client";

import { useEffect, useRef } from 'react';
import api from '@/lib/api';

export default function UserPing() {
    const pingInterval = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const sendPing = async () => {
            // Only ping if the document is visible
            if (document.visibilityState === 'visible') {
                const token = localStorage.getItem('access_token');
                if (token) {
                    try {
                        await api.post('/stats/ping');
                    } catch (error) {
                        // Silently fail pings to avoid console clutter
                        // console.error("Ping failed:", error);
                    }
                }
            }
        };

        // Initial ping on load
        sendPing();

        // Set up periodic ping every 30 seconds
        pingInterval.current = setInterval(sendPing, 30000);

        // Also ping when page becomes visible again
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                sendPing();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (pingInterval.current) {
                clearInterval(pingInterval.current);
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // This component doesn't render anything visually
    return null;
}
