'use client';

import dynamic from 'next/dynamic';
import { MapProps } from './Map';

const Map = dynamic(() => import('@/components/Map'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-muted animate-pulse flex items-center justify-center">
            <div className="text-muted-foreground flex flex-col items-center gap-2">
                <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Memuat Peta...</span>
            </div>
        </div>
    )
});

export interface MapWrapperProps extends MapProps {
    isAdmin?: boolean;
    minZoom?: number;
    initialZoom?: number;
    showNavigation?: boolean;
    onLogout?: () => void;
}

export default function MapWrapper({ isAdmin = false, minZoom = 17, initialZoom = 17, showNavigation = false, onLogout, ...props }: MapWrapperProps) {
    return <Map {...props} isAdmin={isAdmin} minZoom={minZoom} initialZoom={initialZoom} showNavigation={showNavigation} onLogout={onLogout} />;
}


