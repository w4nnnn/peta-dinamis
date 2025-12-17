'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { MapPin, Users, Building2, TreePine } from 'lucide-react';

export default function AboutSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    const features = [
        {
            icon: MapPin,
            title: 'Lokasi Strategis',
            description:
                'Berjarak hanya 2 km dari Alun-Alun Sidoarjo, sebagai penyangga ring satu pusat pemerintahan dengan akses mudah ke fasilitas publik.',
        },
        {
            icon: Users,
            title: 'Komunitas Aktif',
            description:
                'Masyarakat yang dinamis dengan berbagai kegiatan sosial, budaya, dan kemasyarakatan yang rutin diselenggarakan.',
        },
        {
            icon: Building2,
            title: 'Infrastruktur Modern',
            description:
                'Dilengkapi fasilitas pendidikan, kesehatan, dan sarana umum yang memadai untuk mendukung kualitas hidup warga.',
        },
        {
            icon: TreePine,
            title: 'Lingkungan Asri',
            description:
                'Kawasan hijau dan taman yang terjaga membuat lingkungan tetap sejuk dan nyaman untuk ditinggali.',
        },
    ];

    return (
        <section
            id="tentang"
            ref={ref}
            className="relative py-24 bg-gradient-to-b from-background to-muted/30"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
                        Tentang Kami
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                        Mengenal{' '}
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            Bulusidokare
                        </span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        Kelurahan Bulusidokare terletak di Kecamatan Sidoarjo, Kabupaten Sidoarjo, Jawa Timur.
                        Berada pada koordinat 7°27′37″ LS dan 112°43′27″ BT, wilayah ini menyimpan
                        lapisan sejarah "Sidokare" kuno—nama asli kawasan Sidoarjo sebelum era kolonial Belanda.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 40 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group"
                        >
                            <div className="h-full p-6 rounded-2xl bg-white dark:bg-white/5 border border-border hover:border-emerald-500/50 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Info Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20"
                >
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                                1859
                            </div>
                            <div className="text-muted-foreground">Sidoarjo Diresmikan</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-teal-600 dark:text-teal-400 mb-2">
                                144 Ha
                            </div>
                            <div className="text-muted-foreground">Luas Wilayah</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">
                                8 RW / 48 RT
                            </div>
                            <div className="text-muted-foreground">Struktur Wilayah</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
