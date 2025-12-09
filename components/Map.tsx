'use client';

import { MapContainer, TileLayer, Polygon, Marker, Popup, useMapEvents } from 'react-leaflet';
import { LatLngExpression, LatLngTuple, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
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


export default function Map({ geoJson, locations }: MapProps) {
    // Dialog states
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // New: Confirmation dialog

    // Context Menu states
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; mode: 'map' | 'marker'; data?: any } | null>(null);

    // Data states
    const [selectedPos, setSelectedPos] = useState<LatLngTuple | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ... (GeoJSON parsing logic remains same)
    const feature = geoJson.features[0];
    const coordinates = feature.geometry.coordinates;
    const worldBounds: LatLngTuple[] = [[-90, -180], [-90, 180], [90, 180], [90, -180]];
    const hole = coordinates[0][0].map((coord: any) => [coord[1], coord[0]] as LatLngTuple);
    const maskPositions = [worldBounds, hole];
    const center: LatLngExpression = [-7.4578, 112.7290];

    // --- Actions ---

    // 1. Map Right Click -> Show Context Menu (Add Mode)
    const handleMapContextMenu = (latlng: LatLngTuple, event: L.LeafletMouseEvent) => {
        setContextMenu({
            x: event.originalEvent.clientX,
            y: event.originalEvent.clientY,
            mode: 'map',
            data: latlng
        });
    };

    // 2. Marker Right Click -> Show Context Menu (Marker Mode)
    const handleMarkerContextMenu = (location: Location, event: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(event); // Prevent map context menu
        setContextMenu({
            x: event.originalEvent.clientX,
            y: event.originalEvent.clientY,
            mode: 'marker',
            data: location
        });
    };

    // 3. Open Add Dialog from Context Menu
    const openAddDialog = () => {
        if (contextMenu?.mode === 'map' && contextMenu.data) {
            setSelectedPos(contextMenu.data);
            setFormData({ name: '', description: '' });
            setIsAddDialogOpen(true);
            setContextMenu(null);
        }
    };

    // 4. Open Edit Dialog from Context Menu
    const openEditDialog = () => {
        if (contextMenu?.mode === 'marker' && contextMenu.data) {
            const loc = contextMenu.data as Location;
            setSelectedLocation(loc);
            setFormData({ name: loc.name, description: loc.description || '' });
            setIsEditDialogOpen(true);
            setContextMenu(null);
        }
    };

    // 5. Open Delete Dialog from Context Menu
    const openDeleteDialog = () => {
        if (contextMenu?.mode === 'marker' && contextMenu.data) {
            setSelectedLocation(contextMenu.data as Location);
            setIsDeleteDialogOpen(true);
            setContextMenu(null);
        }
    };

    // --- Validations & Submissions ---

    const handleAddSubmit = async (e: React.FormEvent) => {
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
                setIsAddDialogOpen(false);
            } else {
                toast.error('Gagal menambahkan lokasi');
            }
        } catch (error) { toast.error('Terjadi kesalahan'); } finally { setIsSubmitting(false); }
    };

    // Import updateLocation and deleteLocation at top of file (handled later, assuming available)
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLocation) return;

        setIsSubmitting(true);
        try {
            // Need to import updateLocation
            const { updateLocation } = await import('@/actions/location');
            const result = await updateLocation(selectedLocation.id, {
                ...formData,
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude
            });

            if (result.success) {
                toast.success('Lokasi berhasil diperbarui');
                setIsEditDialogOpen(false);
            } else {
                toast.error('Gagal memperbarui lokasi');
            }
        } catch (error) { toast.error('Terjadi kesalahan'); } finally { setIsSubmitting(false); }
    };

    const handleDeleteSubmit = async () => {
        if (!selectedLocation) return;
        setIsSubmitting(true);
        try {
            // Need to import deleteLocation
            const { deleteLocation } = await import('@/actions/location');
            const result = await deleteLocation(selectedLocation.id);

            if (result.success) {
                toast.success('Lokasi berhasil dihapus');
                setIsDeleteDialogOpen(false);
            } else {
                toast.error('Gagal menghapus lokasi');
            }
        } catch (error) { toast.error('Terjadi kesalahan'); } finally { setIsSubmitting(false); }
    };

    // Global click listener to close context menu
    useEffect(() => {
        const checkClickedOutside = () => setContextMenu(null);
        document.addEventListener('click', checkClickedOutside);
        return () => document.removeEventListener('click', checkClickedOutside);
    }, []);

    return (
        <div className="relative w-full h-[85vh] border rounded-lg overflow-hidden shadow-xl">
            {/* Custom Context Menu */}
            {contextMenu && (
                <div
                    className="fixed z-[10000] min-w-[160px] bg-background border rounded-md shadow-md p-1 animate-in fade-in zoom-in-95"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {contextMenu.mode === 'map' ? (
                        <div
                            className="text-sm px-2 py-1.5 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm flex items-center"
                            onClick={openAddDialog}
                        >
                            Tambah Lokasi
                        </div>
                    ) : (
                        <>
                            <div
                                className="text-sm px-2 py-1.5 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm flex items-center"
                                onClick={openEditDialog}
                            >
                                Edit Lokasi
                            </div>
                            <div
                                className="text-sm px-2 py-1.5 cursor-pointer hover:bg-destructive hover:text-destructive-foreground rounded-sm flex items-center text-destructive"
                                onClick={openDeleteDialog}
                            >
                                Hapus Lokasi
                            </div>
                        </>
                    )}
                </div>
            )}

            <MapContainer center={center} zoom={16} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Polygon positions={maskPositions as any} pathOptions={{ color: 'transparent', fillColor: 'black', fillOpacity: 0.7 }} />
                <Polygon positions={hole} pathOptions={{ color: '#ec4899', weight: 2, fill: false, dashArray: '5, 10' }} />

                {locations.map((loc) => (
                    <Marker
                        key={loc.id}
                        position={[loc.latitude, loc.longitude]}
                        icon={customIcon}
                        eventHandlers={{
                            contextmenu: (e) => handleMarkerContextMenu(loc, e)
                        }}
                    >
                        <Popup>
                            <div className="p-2 min-w-[150px]">
                                <h3 className="font-bold text-lg mb-1">{loc.name}</h3>
                                <p className="text-sm text-gray-600">{loc.description}</p>
                            </div>
                        </Popup>
                    </Marker>
                ))}


                <MapContextMenuHandler onContextMenu={(e, latlng) => handleMapContextMenu(latlng, e)} />
            </MapContainer>

            {/* ADD Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Tambah Titik Lokasi</DialogTitle></DialogHeader>
                    <LocationForm formData={formData} setFormData={setFormData} onSubmit={handleAddSubmit} isSubmitting={isSubmitting} />
                </DialogContent>
            </Dialog>

            {/* EDIT Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Titik Lokasi</DialogTitle></DialogHeader>
                    <LocationForm formData={formData} setFormData={setFormData} onSubmit={handleEditSubmit} isSubmitting={isSubmitting} submitLabel="Simpan Perubahan" />
                </DialogContent>
            </Dialog>

            {/* DELETE Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Hapus Lokasi</DialogTitle></DialogHeader>
                    <div className="py-4">Apakah Anda yakin ingin menghapus lokasi "{selectedLocation?.name}"? Tindakan ini tidak dapat dibatalkan.</div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Batal</Button>
                        <Button variant="destructive" onClick={handleDeleteSubmit} disabled={isSubmitting}>
                            {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Helper to capture Map Right Click
function MapContextMenuHandler({ onContextMenu }: { onContextMenu: (e: L.LeafletMouseEvent, latlng: LatLngTuple) => void }) {
    useMapEvents({
        contextmenu(e) {
            onContextMenu(e, [e.latlng.lat, e.latlng.lng]);
        },
    });
    return null;
}

// Reusable Form
function LocationForm({ formData, setFormData, onSubmit, isSubmitting, submitLabel = "Simpan Lokasi" }: any) {
    return (
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="name">Nama Lokasi</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="desc">Deskripsi</Label>
                <Textarea id="desc" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Memproses...' : submitLabel}</Button>
            </DialogFooter>
        </form>
    )
}
