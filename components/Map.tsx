import { MapContainer, TileLayer, Polygon, Marker, Popup, useMapEvents } from 'react-leaflet';
import { LatLngExpression, LatLngTuple, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import L from 'leaflet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { addLocation } from '@/actions/location';
import { toast } from 'sonner';
import { MapPin, Building2, Users, Trees, School, Plus, Edit, Trash2, ShoppingCart, Utensils, Hotel, Hospital, Circle, Search, Filter, Landmark, Stethoscope, BookHeart, Coffee, Store, ShieldCheck } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMemo } from 'react';
import { LocationForm } from './LocationForm';

const CATEGORIES = [
    { value: "all", label: "Semua Kategori" },
    { value: "pemerintahan", label: "Pemerintahan" },
    { value: "pendidikan", label: "Pendidikan" },
    { value: "kesehatan", label: "Kesehatan" },
    { value: "ibadah", label: "Ibadah" },
    { value: "kuliner", label: "Kuliner" },
    { value: "warkop", label: "Warkop" },
    { value: "perbelanjaan", label: "Perbelanjaan" },
    { value: "keamanan", label: "Keamanan" },
    { value: "taman", label: "Taman" },
    { value: "default", label: "Lainnya" },
];

// --- Custom Icon Factory ---
// --- Custom Icon Factory ---
const createCustomIcon = (category: string) => {
    const iconMap: Record<string, { icon: any; color: string }> = {
        pemerintahan: { icon: Landmark, color: "#2563eb" }, // text-blue-600
        pendidikan: { icon: School, color: "#4f46e5" }, // text-indigo-600
        kesehatan: { icon: Stethoscope, color: "#ef4444" }, // text-red-500
        ibadah: { icon: BookHeart, color: "#059669" }, // text-emerald-600
        kuliner: { icon: Utensils, color: "#f97316" }, // text-orange-500
        warkop: { icon: Coffee, color: "#b45309" }, // text-amber-700
        perbelanjaan: { icon: Store, color: "#0ea5e9" }, // text-sky-500
        keamanan: { icon: ShieldCheck, color: "#334155" }, // text-slate-700
        taman: { icon: Trees, color: "#16a34a" }, // text-green-600
        default: { icon: Circle, color: "#6b7280" }, // text-gray-500
    };

    const config = iconMap[category] || iconMap.default;
    const IconComponent = config.icon;
    const color = config.color;

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
    const [formData, setFormData] = useState({ name: '', description: '', category: 'default' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Search & Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Filter locations
    const filteredLocations = useMemo(() => {
        return locations.filter(loc => {
            const matchesSearch = loc.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                (loc.description && loc.description.toLowerCase().includes(debouncedSearch.toLowerCase()));

            const matchesCategory = categoryFilter === 'all' || loc.category === categoryFilter;

            return matchesSearch && matchesCategory;
        });
    }, [locations, debouncedSearch, categoryFilter]);

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
            setFormData({ name: '', description: '', category: 'default' });
            setIsAddDialogOpen(true);
            setContextMenu(null);
        }
    };

    const openEditDialog = () => {
        if (contextMenu?.mode === 'marker' && contextMenu.data) {
            const loc = contextMenu.data as Location;
            setSelectedLocation(loc);
            setFormData({ name: loc.name, description: loc.description || '', category: loc.category || 'default' });
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
        <div className="relative w-full h-full overflow-hidden">
            {/* Floating Search & Filter Control */}
            <div className="absolute top-4 right-4 z-[5000] w-full max-w-sm">
                <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-3 rounded-lg shadow-lg border mx-4 md:mx-0 space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari lokasi..."
                                className="pl-8 bg-background/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-full bg-background/50">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    <SelectValue placeholder="Pilih Kategori" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map((cat) => (
                                    <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="text-xs text-muted-foreground px-1">
                        Menampilkan {filteredLocations.length} lokasi
                    </div>
                </div>
            </div>
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

                {filteredLocations.map((loc) => (
                    <Marker
                        key={loc.id}
                        position={[loc.latitude, loc.longitude]}
                        icon={createCustomIcon(loc.category || 'default')}
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

