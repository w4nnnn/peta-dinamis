import fs from 'fs';
import path from 'path';
import { getLocations } from '@/actions/location';
import { Toaster } from '@/components/ui/sonner';
import MapWrapper from '@/components/MapWrapper';

export default async function Home() {
  const geoJsonPath = path.join(process.cwd(), 'maps', 'bulusidokare.geojson');
  let geoJson = null;

  try {
    const fileContent = fs.readFileSync(geoJsonPath, 'utf8');
    geoJson = JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading GeoJSON:", error);
    // Fallback or handle error
  }

  const { data: locations } = await getLocations();

  return (
    <main className="container mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Peta Digital Bulusidokare</h1>
          <p className="text-muted-foreground">Sistem Informasi Geografis Desa Bulusidokare</p>
        </div>
      </div>

      {geoJson ? (
        <MapWrapper geoJson={geoJson} locations={locations || []} />
      ) : (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20">
          Gagal memuat data peta dasar (GeoJSON tidak ditemukan).
        </div>
      )}

      <Toaster />
    </main>
  );
}
