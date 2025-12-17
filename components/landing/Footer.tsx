'use client';

import { MapPin, Mail, Phone, Facebook, Instagram, Twitter } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer id="kontak" className="relative bg-gradient-to-b from-muted/50 to-muted pt-20 pb-8">
            {/* Top wave decoration */}
            <div className="absolute top-0 left-0 right-0 overflow-hidden leading-[0]">
                <svg
                    className="relative block w-full h-12 text-background"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                        fill="currentColor"
                    />
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Bulusidokare</h3>
                                <p className="text-sm text-muted-foreground">Sidoarjo, Jawa Timur</p>
                            </div>
                        </div>
                        <p className="text-muted-foreground mb-6 max-w-md">
                            Sistem Informasi Geografis Kelurahan Bulusidokare menyediakan peta interaktif
                            untuk mempermudah warga dan pengunjung menjelajahi wilayah kelurahan.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-muted hover:bg-emerald-500 flex items-center justify-center transition-colors group"
                            >
                                <Facebook className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-muted hover:bg-emerald-500 flex items-center justify-center transition-colors group"
                            >
                                <Instagram className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-muted hover:bg-emerald-500 flex items-center justify-center transition-colors group"
                            >
                                <Twitter className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-lg mb-6">Tautan Cepat</h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="#beranda" className="text-muted-foreground hover:text-emerald-600 transition-colors">
                                    Beranda
                                </a>
                            </li>
                            <li>
                                <a href="#tentang" className="text-muted-foreground hover:text-emerald-600 transition-colors">
                                    Tentang Kami
                                </a>
                            </li>
                            <li>
                                <a href="#fitur" className="text-muted-foreground hover:text-emerald-600 transition-colors">
                                    Fitur
                                </a>
                            </li>
                            <li>
                                <Link href="/peta" className="text-muted-foreground hover:text-emerald-600 transition-colors">
                                    Peta Interaktif
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-lg mb-6">Kontak</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                <span className="text-muted-foreground">
                                    Jl. Raya Bulusidokare, Kec. Sidoarjo, Kab. Sidoarjo, Jawa Timur
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
                                <span className="text-muted-foreground">081615515685</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-emerald-600 shrink-0" />
                                <span className="text-muted-foreground">irwanfebriansyah112@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-border">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                            © {currentYear} Kelurahan Bulusidokare. Hak Cipta Dilindungi.
                        </p>
                        <div className="flex gap-6 text-sm">
                            <a href="#" className="text-muted-foreground hover:text-emerald-600 transition-colors">
                                Kebijakan Privasi
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-emerald-600 transition-colors">
                                Syarat & Ketentuan
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
