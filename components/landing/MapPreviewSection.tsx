'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { MapPin, ArrowRight, Expand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import MapWrapper from '@/components/MapWrapper';

interface MapPreviewSectionProps {
    geoJson: any;
    locations: any[];
}

export default function MapPreviewSection({ geoJson, locations }: MapPreviewSectionProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <section
            id="peta"
            ref={ref}
            className="relative py-24 bg-gradient-to-b from-muted/30 to-background"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
                        Peta Interaktif
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                        Jelajahi{' '}
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            Wilayah Kami
                        </span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Temukan berbagai lokasi penting di Kelurahan Bulusidokare melalui peta interaktif di bawah ini.
                    </p>
                </motion.div>

                {/* Map Card */}
                <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="relative"
                >
                    <div className="rounded-3xl overflow-hidden shadow-2xl border border-border bg-card isolate">
                        {/* Map Container */}
                        <div className="relative h-[400px] md:h-[500px] w-full z-0">
                            {geoJson ? (
                                <MapWrapper geoJson={geoJson} locations={locations} isAdmin={false} minZoom={16} initialZoom={16} />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full bg-muted">
                                    <p className="text-muted-foreground">Memuat peta...</p>
                                </div>
                            )}

                            {/* Overlay gradient */}
                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card to-transparent pointer-events-none" />
                        </div>

                        {/* Card Footer */}
                        <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-card">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                                    <MapPin className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Peta Bulusidokare</h3>
                                </div>
                            </div>

                            <Button
                                asChild
                                size="lg"
                                className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300"
                            >
                                <Link href="/peta">
                                    <Expand className="w-5 h-5 mr-2" />
                                    Buka Layar Penuh
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
