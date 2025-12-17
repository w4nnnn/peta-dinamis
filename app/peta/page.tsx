import fs from 'fs';
import path from 'path';
import { getLocations } from '@/actions/location';
import { getSession } from '@/actions/auth';
import { Toaster } from '@/components/ui/sonner';
import PetaClient from './PetaClient';

export default async function PetaPage() {
    const geoJsonPath = path.join(process.cwd(), 'maps', 'bulusidokare.geojson');
    let geoJson = null;

    try {
        const fileContent = fs.readFileSync(geoJsonPath, 'utf8');
        geoJson = JSON.parse(fileContent);
    } catch (error) {
        console.error("Error reading GeoJSON:", error);
    }

    const { data: locations } = await getLocations();
    const session = await getSession();
    const isAdmin = !!session;

    return (
        <main className="relative w-screen h-screen overflow-hidden bg-background">

            {geoJson ? (
                <div className="w-full h-full">
                    <PetaClient geoJson={geoJson} locations={locations || []} isAdmin={isAdmin} />
                </div>
            ) : (
                <div className="flex items-center justify-center w-full h-full p-4">
                    <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
                        Gagal memuat data peta dasar (GeoJSON tidak ditemukan).
                    </div>
                </div>
            )}

            <Toaster position="top-center" />
        </main>
    );
}

