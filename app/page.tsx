import fs from 'fs';
import path from 'path';
import { getLocations } from '@/actions/location';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import AboutSection from '@/components/landing/AboutSection';
import HistorySection from '@/components/landing/HistorySection';
import HeritageSection from '@/components/landing/HeritageSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import MapPreviewSection from '@/components/landing/MapPreviewSection';
import Footer from '@/components/landing/Footer';

export default async function Home() {
  // Load GeoJSON and locations for map preview
  const geoJsonPath = path.join(process.cwd(), 'maps', 'bulusidokare.geojson');
  let geoJson = null;

  try {
    const fileContent = fs.readFileSync(geoJsonPath, 'utf8');
    geoJson = JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading GeoJSON:", error);
  }

  const { data: locations } = await getLocations();

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <HistorySection />
      <HeritageSection />
      <FeaturesSection />
      <MapPreviewSection geoJson={geoJson} locations={locations || []} />
      <Footer />
    </main>
  );
}

