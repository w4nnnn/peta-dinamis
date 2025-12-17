'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { BookOpen, TreePine, History, Milestone } from 'lucide-react';

export default function HistorySection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    const timeline = [
        {
            era: 'Era Hutan Purba',
            title: 'Asal Nama "Bulusidokare"',
            description: 'Nama "Bulusidokare" berasal dari deskripsi vegetasi dominan di masa pembukaan lahan (babat alas). Merujuk pada "Pohon Cuncung Belut" atau tanaman merambat berbulu lebat yang tumbuh melilit pepohonan besar di hutan belantara. Interpretasi lain mengaitkan kata "Bulu" dengan pohon Bulu (Ficus annulata) yang sering dianggap keramat.',
            icon: TreePine,
            color: 'from-green-500 to-emerald-600',
        },
        {
            era: 'Pra-Kolonial',
            title: 'Relasi dengan "Sidokare"',
            description: 'Sebelum nama "Sidoarjo" diresmikan pada 1859, seluruh wilayah kabupaten dikenal sebagai Sidokare. "Sido" berarti "jadi/terlaksana" dan "Kare" berarti "tertinggal/sisa". Bulusidokare adalah ekstensi dari pemukiman kuno Sidokare yang meluas ke arah hutan di tenggara.',
            icon: History,
            color: 'from-amber-500 to-orange-600',
        },
        {
            era: 'Era Kolonial (1859)',
            title: 'Peresmian Sidoarjo',
            description: 'Pada masa kolonial Belanda, nama "Sidokare" diubah menjadi "Sidoarjo". R. Djojohardjo, patih yang berdomisili di Pucang Anom (berbatasan langsung dengan Bulusidokare), menjadi saksi transisi nama ini. Fakta bahwa nama "Sidokare" diabadikan dalam dua kelurahan menandakan area ini sebagai nukleus pemukiman awal.',
            icon: Milestone,
            color: 'from-blue-500 to-indigo-600',
        },
    ];

    return (
        <section
            id="sejarah"
            ref={ref}
            className="relative py-24 bg-gradient-to-b from-background to-muted/30 overflow-hidden"
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='48' height='48' fill='none' stroke='rgb(0 0 0)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
                }} />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium mb-4">
                        <BookOpen className="w-4 h-4" />
                        Sejarah
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                        Jejak{' '}
                        <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                            Sejarah Kami
                        </span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                        Menelusuri etimologi dan sejarah Kelurahan Bulusidokare, dari hutan purba
                        hingga menjadi bagian integral Kota Sidoarjo.
                    </p>
                </motion.div>

                {/* Timeline */}
                <div className="relative">
                    {/* Center Line */}
                    <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500 via-orange-500 to-red-500 transform md:-translate-x-1/2" />

                    <div className="space-y-12">
                        {timeline.map((item, index) => (
                            <motion.div
                                key={item.era}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                animate={isInView ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                                    }`}
                            >
                                {/* Content */}
                                <div className={`flex-1 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'} ml-20 md:ml-0`}>
                                    <div className="p-6 rounded-2xl bg-white dark:bg-card border border-border shadow-lg hover:shadow-xl transition-shadow">
                                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 bg-gradient-to-r ${item.color} text-white`}>
                                            {item.era}
                                        </div>
                                        <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                        <p className="text-muted-foreground">{item.description}</p>
                                    </div>
                                </div>

                                {/* Icon */}
                                <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 -translate-x-1/2">
                                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg border-4 border-background`}>
                                        <item.icon className="w-7 h-7 text-white" />
                                    </div>
                                </div>

                                {/* Spacer for alternate layout */}
                                <div className="hidden md:block flex-1" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
