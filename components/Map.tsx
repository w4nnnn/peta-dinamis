import { MapContainer, TileLayer, Polygon, Marker, Popup, useMapEvents } from 'react-leaflet';
import { LatLngExpression, LatLngTuple, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import L from 'leaflet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { addLocation } from '@/actions/location';
import { toast } from 'sonner';
import { MapPin, Building2, Users, Trees, School, Plus, Edit, Trash2 } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LocationForm } from './LocationForm';

// --- Custom Icon Factory ---
const createCustomIcon = (category: string) => {
    let IconComponent = MapPin;
    let color = '#ef4444'; // red-500

    switch (category) {
        case 'pemerintahan':
            IconComponent = Building2;
            color = '#3b82f6'; // blue-500
            break;
        case 'fasilitas_umum':
            IconComponent = Users;
            color = '#f97316'; // orange-500
            break;
        case 'taman':
            IconComponent = Trees;
            color = '#22c55e'; // green-500
            break;
        case 'sekolah':
            IconComponent = School;
            color = '#eab308'; // yellow-500
            break;
        default:
            IconComponent = MapPin;
            color = '#ef4444'; // red-500
    }

    // Google Maps Style Pin with Icon inside
    const iconHtml = renderToStaticMarkup(
        <div className="relative flex items-center justify-center w-[40px] h-[40px]">
            {/* Pin Shape */}
            <svg viewBox="0 0 384 512" fill={color} className="w-10 h-10 drop-shadow-md">
                <path d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z" />
            </svg>
            {/* Creating a white circle background for icon */}
            <div className="absolute top-[6px] bg-white/20 rounded-full w-6 h-6 flex items-center justify-center">
                <IconComponent size={16} strokeWidth={2.5} color="white" />
            </div>
        </div>
    );

    return new DivIcon({
        html: iconHtml,
        className: 'bg-transparent',
        iconSize: [40, 40],
        iconAnchor: [20, 40], // Center bottom
        popupAnchor: [0, -40],
    });
};

export interface Location {
    id: number;
    name: string;
    description: string | null;
    category: string;
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
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Context Menu states
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; mode: 'map' | 'marker'; data?: any } | null>(null);

    // Data states
    const [selectedPos, setSelectedPos] = useState<LatLngTuple | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    // Add default category
    const [formData, setFormData] = useState({ name: '', description: '', category: 'lainnya' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ... (GeoJSON parsing logic remains same)
    const feature = geoJson.features[0];
    const coordinates = feature.geometry.coordinates;
    const worldBounds: LatLngTuple[] = [[-90, -180], [-90, 180], [90, 180], [90, -180]];
    const hole = coordinates[0][0].map((coord: any) => [coord[1], coord[0]] as LatLngTuple);
    const maskPositions = [worldBounds, hole];
    const center: LatLngExpression = [-7.4578, 112.7290];

    // --- Actions ---

    const handleMapContextMenu = (latlng: LatLngTuple, event: L.LeafletMouseEvent) => {
        setContextMenu({
            x: event.originalEvent.clientX,
            y: event.originalEvent.clientY,
            mode: 'map',
            data: latlng
        });
    };

    const handleMarkerContextMenu = (location: Location, event: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(event);
        setContextMenu({
            x: event.originalEvent.clientX,
            y: event.originalEvent.clientY,
            mode: 'marker',
            data: location
        });
    };

    const openAddDialog = () => {
        if (contextMenu?.mode === 'map' && contextMenu.data) {
            setSelectedPos(contextMenu.data);
            setFormData({ name: '', description: '', category: 'lainnya' });
            setIsAddDialogOpen(true);
            setContextMenu(null);
        }
    };

    const openEditDialog = () => {
        if (contextMenu?.mode === 'marker' && contextMenu.data) {
            const loc = contextMenu.data as Location;
            setSelectedLocation(loc);
            setFormData({ name: loc.name, description: loc.description || '', category: loc.category || 'lainnya' });
            setIsEditDialogOpen(true);
            setContextMenu(null);
        }
    };

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
                category: formData.category,
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

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLocation) return;

        setIsSubmitting(true);
        try {
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
                            className="text-sm px-2 py-1.5 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm flex items-center gap-2"
                            onClick={openAddDialog}
                        >
                            <Plus size={16} />
                            Tambah Lokasi
                        </div>
                    ) : (
                        <>
                            <div
                                className="text-sm px-2 py-1.5 cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm flex items-center gap-2"
                                onClick={openEditDialog}
                            >
                                <Edit size={16} />
                                Edit Lokasi
                            </div>
                            <div
                                className="text-sm px-2 py-1.5 cursor-pointer hover:bg-accent hover:text-destructive-foreground rounded-sm flex items-center text-destructive gap-2"
                                onClick={openDeleteDialog}
                            >
                                <Trash2 size={16} />
                                Hapus Lokasi
                            </div>
                        </>
                    )}
                </div>
            )}

            <MapContainer center={center} zoom={16} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }} attributionControl={false}>
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
                        icon={createCustomIcon(loc.category || 'lainnya')}
                        eventHandlers={{
                            contextmenu: (e) => handleMarkerContextMenu(loc, e)
                        }}
                    >
                        <Popup>
                            <div className="p-2 min-w-[150px]">
                                <h3 className="font-bold text-lg mb-1">{loc.name}</h3>
                                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                    {loc.category?.replace('_', ' ') || 'Lainnya'}
                                </div>
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

