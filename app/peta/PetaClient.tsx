'use client';

import MapWrapper from '@/components/MapWrapper';
import { logout } from '@/actions/auth';
import { useRouter } from 'next/navigation';

interface PetaClientProps {
    geoJson: any;
    locations: any[];
    isAdmin: boolean;
}

export default function PetaClient({ geoJson, locations, isAdmin }: PetaClientProps) {
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.refresh();
    };

    return (
        <MapWrapper
            geoJson={geoJson}
            locations={locations}
            isAdmin={isAdmin}
            showNavigation={true}
            onLogout={handleLogout}
        />
    );
}
