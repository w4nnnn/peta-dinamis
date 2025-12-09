import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
}

export function LocationForm({ formData, setFormData, onSubmit, isSubmitting, submitLabel = "Simpan Lokasi" }: LocationFormProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-4 pt-4">
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
                        <SelectItem value="pemerintahan">Pemerintahan</SelectItem>
                        <SelectItem value="fasilitas_umum">Fasilitas Umum</SelectItem>
                        <SelectItem value="taman">Taman & RTH</SelectItem>
                        <SelectItem value="sekolah">Sekolah & Pendidikan</SelectItem>
                        <SelectItem value="lainnya">Lainnya</SelectItem>
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
