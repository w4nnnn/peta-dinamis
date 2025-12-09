'use client';

import { MapContainer, TileLayer, Polygon, Marker, Popup, useMapEvents } from 'react-leaflet';
import { LatLngExpression, LatLngTuple, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';
import L from 'leaflet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { addLocation } from '@/actions/location';
import { toast } from 'sonner';
import { MapPin } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Create a custom icon using Lucide React
const createCustomIcon = () => {
    const iconHtml = renderToStaticMarkup(
        <div className="text-red-500 filter drop-shadow-md">
            <MapPin size={32} fill="currentColor" strokeWidth={2} />
        </div>
    );

    return new DivIcon({
        html: iconHtml,
        className: 'bg-transparent', // Remove default square background
        iconSize: [32, 32],
        iconAnchor: [16, 32], // Bottom center
        popupAnchor: [0, -32],
    });
};

const customIcon = createCustomIcon();

export interface Location {
    id: number;
    name: string;
    description: string | null;
    latitude: number;
    longitude: number;
    createdAt: Date;
}

export interface MapProps {
    geoJson: any; // The bulusidokare feature collection
    locations: Location[];
}

// Component to handle right clicks
function AddLocationHandler({ onLocationSelect }: { onLocationSelect: (latlng: LatLngTuple) => void }) {
    useMapEvents({
        contextmenu(e) {
            onLocationSelect([e.latlng.lat, e.latlng.lng]);
            L.DomEvent.stopPropagation(e as any);
        },
    });
    return null;
}

export default function Map({ geoJson, locations }: MapProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPos, setSelectedPos] = useState<LatLngTuple | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Parse GeoJSON to get coordinates for the mask hole
    // Assuming the first feature is the main polygon
    const feature = geoJson.features[0];
    const coordinates = feature.geometry.coordinates; // MultiPolygon: [ [ [x, y], ... ] ]

    // Flatten appropriately. Leaflet Polygon positions: LatLngExpression[] for simple, or LatLngExpression[][] for holes
    // For color mask (World - Hole): [ [World], [Hole] ]
    // Coordinates in GeoJSON are [lng, lat], we need [lat, lng]

    const worldBounds: LatLngTuple[] = [
        [-90, -180],
        [-90, 180],
        [90, 180],
        [90, -180],
    ];

    // Assuming MultiPolygon with one main polygon [0] and its outer ring [0]
    const hole = coordinates[0][0].map((coord: any) => [coord[1], coord[0]] as LatLngTuple);

    // Note: Leaflet expects outer ring first, then holes.
    // We want to draw a black rectangle over the world, with a hole over Bulusidokare.
    const maskPositions = [worldBounds, hole];

    const handleLocationSelect = (latlng: LatLngTuple) => {
        setSelectedPos(latlng);
        setFormData({ name: '', description: '' });
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPos) return;

        setIsSubmitting(true);
        try {
            const result = await addLocation({
                name: formData.name,
                description: formData.description,
                latitude: selectedPos[0],
                longitude: selectedPos[1],
            });

            if (result.success) {
                toast.success('Lokasi berhasil ditambahkan');
                setIsDialogOpen(false);
            } else {
                toast.error('Gagal menambahkan lokasi');
            }
        } catch (error) {
            toast.error('Terjadi kesalahan saat menyimpan');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate center based on bounds or default to a known point in Bulusidokare
    const center: LatLngExpression = [-7.4578, 112.7290];

    return (
        <div className="relative w-full h-[85vh] border rounded-lg overflow-hidden shadow-xl">
            <MapContainer center={center} zoom={16} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Masking Layer - Blackout everything else */}
                <Polygon
                    positions={maskPositions as any}
                    pathOptions={{ color: 'transparent', fillColor: 'black', fillOpacity: 0.7 }}
                />

                {/* Boundary Line - Highlight the border */}
                <Polygon
                    positions={hole}
                    pathOptions={{ color: '#ec4899', weight: 2, fill: false, dashArray: '5, 10' }}
                />

                {/* Saved Locations */}
                {locations.map((loc) => (
                    <Marker key={loc.id} position={[loc.latitude, loc.longitude]} icon={customIcon}>
                        <Popup>
                            <div className="p-2 min-w-[150px]">
                                <h3 className="font-bold text-lg mb-1">{loc.name}</h3>
                                <p className="text-sm text-gray-600">{loc.description}</p>
                                <p className="text-xs text-gray-400 mt-2">{new Date(loc.createdAt).toLocaleDateString()}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <AddLocationHandler onLocationSelect={handleLocationSelect} />
            </MapContainer>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Titik Lokasi</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="name">Nama Lokasi</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="Contoh: Balai Desa"
                            />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="desc">Deskripsi</Label>
                            <Textarea
                                id="desc"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Keterangan singkat..."
                            />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label>Koordinat</Label>
                            <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                                {selectedPos ? `${selectedPos[0].toFixed(6)}, ${selectedPos[1].toFixed(6)}` : '-'}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Lokasi'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
