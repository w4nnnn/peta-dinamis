import { MapContainer, TileLayer, Polygon, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { LatLngExpression, LatLngTuple, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { addLocation } from '@/actions/location';
import { toast } from 'sonner';
import { MapPin, Building2, Users, Trees, School, Plus, Edit, Trash2, ShoppingCart, Utensils, Hotel, Hospital, Circle, Search, Filter, Landmark, Stethoscope, BookHeart, Coffee, Store, ShieldCheck, Info, X } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMemo } from 'react';
import { LocationForm } from './LocationForm';
import { ScrollArea } from '@/components/ui/scroll-area';

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
            <svg viewBox="0 0 384 512" className="w-10 h-10 drop-shadow-md">
                <path
                    d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"
                    fill={color}
                    stroke="white"
                    strokeWidth="12"
                />
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
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mapRef, setMapRef] = useState<L.Map | null>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search suggestions (tidak memfilter marker, hanya untuk dropdown)
    const suggestions = useMemo(() => {
        if (!debouncedSearch.trim()) return [];
        return locations.filter(loc => {
            const matchesSearch = loc.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                (loc.description && loc.description.toLowerCase().includes(debouncedSearch.toLowerCase()));
            const matchesCategory = categoryFilter === 'all' || loc.category === categoryFilter;
            return matchesSearch && matchesCategory;
        }).slice(0, 8); // Max 8 suggestions
    }, [locations, debouncedSearch, categoryFilter]);

    // Filter locations hanya berdasarkan kategori (semua marker tetap tampil)
    const filteredLocations = useMemo(() => {
        return locations.filter(loc => {
            const matchesCategory = categoryFilter === 'all' || loc.category === categoryFilter;
            return matchesCategory;
        });
    }, [locations, categoryFilter]);

    // Fly to location
    const flyToLocation = useCallback((loc: Location) => {
        if (mapRef) {
            mapRef.flyTo([loc.latitude, loc.longitude], 18, { duration: 1.5 });
            setShowSuggestions(false);
            setSearchQuery(loc.name);
        }
    }, [mapRef]);

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
                    {/* Search with Dropdown */}
                    <div ref={searchContainerRef} className="relative">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari lokasi..."
                                className="pl-8 pr-8 bg-background/50"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setShowSuggestions(false);
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg max-h-64 overflow-hidden z-[6000]">
                                <ScrollArea className="max-h-64">
                                    {suggestions.map((loc) => (
                                        <div
                                            key={loc.id}
                                            className="px-3 py-2 hover:bg-accent cursor-pointer border-b last:border-b-0 flex items-center gap-2"
                                            onClick={() => flyToLocation(loc)}
                                        >
                                            <MapPin size={14} className="text-muted-foreground flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate">{loc.name}</div>
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {loc.category?.replace('_', ' ') || 'Lainnya'}
                                                    {loc.description && ` • ${loc.description}`}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </ScrollArea>
                            </div>
                        )}
                    </div>

                    {/* Category Filter */}
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

                    <div className="flex flex-col gap-1">
                        <div className="text-xs text-muted-foreground px-1">
                            Menampilkan {filteredLocations.length} lokasi
                        </div>
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

            <MapContainer center={center} zoom={16} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }} attributionControl={false} ref={setMapRef}>
                {/* Tile lokal dengan fallback ke online */}
                <TileLayer
                    url="/tiles/{z}/{x}/{y}.png"
                    errorTileUrl="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
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
                                <p className="text-sm text-gray-600 mb-3">{loc.description}</p>

                                <div className="grid grid-cols-2 gap-2 border-t pt-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-xs gap-1"
                                        onClick={() => {
                                            setSelectedLocation(loc);
                                            setFormData({ name: loc.name, description: loc.description || '', category: loc.category || 'default' });
                                            setIsEditDialogOpen(true);
                                        }}
                                    >
                                        <Edit size={12} /> Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="h-7 text-xs gap-1"
                                        onClick={() => {
                                            setSelectedLocation(loc);
                                            setIsDeleteDialogOpen(true);
                                        }}
                                    >
                                        <Trash2 size={12} /> Hapus
                                    </Button>
                                </div>
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

            {/* TIP Badge */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:bottom-8 md:right-4 z-[400] bg-background/90 backdrop-blur border px-3 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs md:text-sm text-muted-foreground animate-in slide-in-from-bottom-5">
                <Info size={16} className="text-blue-500" />
                <span>Klik kanan / Tahan peta untuk tambah lokasi</span>
            </div>
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

