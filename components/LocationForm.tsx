import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useCallback } from 'react';
import { Landmark, School, Stethoscope, BookHeart, Utensils, Coffee, Store, ShieldCheck, Trees, Trophy, Circle, Home } from 'lucide-react';

const FORM_CATEGORIES = [
    { value: "pemerintahan", label: "Pemerintahan", icon: Landmark, color: "#2563eb" },
    { value: "pendidikan", label: "Pendidikan", icon: School, color: "#4f46e5" },
    { value: "kesehatan", label: "Kesehatan", icon: Stethoscope, color: "#ef4444" },
    { value: "ibadah", label: "Ibadah", icon: BookHeart, color: "#059669" },
    { value: "kuliner", label: "Kuliner", icon: Utensils, color: "#f97316" },
    { value: "warkop", label: "Warkop", icon: Coffee, color: "#b45309" },
    { value: "perbelanjaan", label: "Perbelanjaan", icon: Store, color: "#0ea5e9" },
    { value: "keamanan", label: "Keamanan", icon: ShieldCheck, color: "#334155" },
    { value: "taman", label: "Taman", icon: Trees, color: "#16a34a" },
    { value: "olahraga", label: "Olahraga", icon: Trophy, color: "#eab308" },
    { value: "rumahku", label: "Rumahku", icon: Home, color: "#9333ea" },
    { value: "default", label: "Lainnya", icon: Circle, color: "#6b7280" },
];

interface LocationFormProps {
    formData: {
        name: string;
        description: string;
        category: string;
    };
    setFormData: (data: any) => void;
    onSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
    submitLabel?: string;
    enableDraft?: boolean;
}

const DRAFT_KEY = 'locationFormDraft';

export function LocationForm({
    formData,
    setFormData,
    onSubmit,
    isSubmitting,
    submitLabel = "Simpan Lokasi",
    enableDraft = true
}: LocationFormProps) {

    // Auto-save draft saat formData berubah
    useEffect(() => {
        if (enableDraft && (formData.name || formData.description)) {
            localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
        }
    }, [formData, enableDraft]);

    // Clear draft
    const clearDraft = useCallback(() => {
        localStorage.removeItem(DRAFT_KEY);
        setFormData({ name: '', description: '', category: 'default' });
    }, [setFormData]);

    // Handle submit dengan clear draft
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.removeItem(DRAFT_KEY); // Clear draft setelah submit
        onSubmit(e);
    };

    // Cek apakah ada draft
    const hasDraft = enableDraft && (formData.name || formData.description);

    return (
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
                <Label htmlFor="category">Kategori</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                        {FORM_CATEGORIES.map((cat) => {
                            const IconComponent = cat.icon;
                            return (
                                <SelectItem key={cat.value} value={cat.value}>
                                    <div className="flex items-center gap-2">
                                        <IconComponent size={16} style={{ color: cat.color }} />
                                        {cat.label}
                                    </div>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
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

            <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Memproses...' : submitLabel}
                </Button>
            </DialogFooter>
        </form>
    );
}
