'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Map, Layers, Filter, MousePointer2, Download, Share2 } from 'lucide-react';

export default function FeaturesSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    const features = [
        {
            icon: Map,
            title: 'Peta Interaktif',
            description: 'Jelajahi wilayah dengan peta yang dapat diperbesar, digeser, dan diklik untuk informasi detail.',
            color: 'from-blue-500 to-indigo-600',
        },
        {
            icon: Layers,
            title: 'Multi Layer',
            description: 'Tampilkan berbagai layer informasi seperti batas wilayah, jalan, dan fasilitas umum.',
            color: 'from-purple-500 to-pink-600',
        },
        {
            icon: Filter,
            title: 'Filter Kategori',
            description: 'Saring lokasi berdasarkan kategori untuk menemukan tempat yang Anda cari dengan mudah.',
            color: 'from-orange-500 to-red-600',
        },
        {
            icon: MousePointer2,
            title: 'Tambah Lokasi',
            description: 'Admin dapat menambahkan lokasi baru dengan klik langsung pada peta interaktif.',
            color: 'from-emerald-500 to-teal-600',
        },
        {
            icon: Download,
            title: 'Unduh Peta',
            description: 'Simpan tampilan peta sebagai gambar untuk dokumentasi atau presentasi.',
            color: 'from-cyan-500 to-blue-600',
        },
        {
            icon: Share2,
            title: 'Bagikan Lokasi',
            description: 'Bagikan koordinat lokasi dengan mudah melalui tautan atau media sosial.',
            color: 'from-pink-500 to-rose-600',
        },
    ];

    return (
        <section
            id="fitur"
            ref={ref}
            className="relative py-24 bg-muted/30"
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-50">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
                        Fitur Unggulan
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                        Peta yang{' '}
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            Mudah Digunakan
                        </span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Berbagai fitur canggih untuk mempermudah eksplorasi dan pengelolaan data geografis Kelurahan Bulusidokare.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 40, scale: 0.95 }}
                            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative"
                        >
                            <div className="h-full p-8 rounded-3xl bg-white dark:bg-card border border-border hover:border-transparent shadow-sm hover:shadow-2xl transition-all duration-500">
                                {/* Gradient overlay on hover */}
                                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                                <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                                    <feature.icon className="w-7 h-7 text-white" />
                                </div>

                                <h3 className="relative text-xl font-semibold mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="relative text-muted-foreground">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
