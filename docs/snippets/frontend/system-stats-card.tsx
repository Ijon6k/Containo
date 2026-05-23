/**
 * Judul PI:
 * Visualisasi Data Metrik Real-time pada Dashboard Interface
 *
 * BAB 3:
 * 3.4.4 Implementasi Data Binding dan Rendering Komponen React
 *
 * Deskripsi:
 * Komponen fungsional React (TSX) yang bertanggung jawab merender grafis 
 * balok CPU & RAM berdasarkan pembaruan data State secara dinamis (Data-Binding).
 * Komponen ini dibuat statis-kecil untuk menghindari re-render di seluruh halaman.
 */

import React from 'react';
import { motion } from 'framer-motion';

export const LinearBar = ({ value, color }: { value: number; color: string }) => (
  <div className="w-full h-1.5 bg-ui-accent rounded-full mt-3 overflow-hidden">
    {/* Menggunakan Framer Motion untuk membuat animasi transisi antar metrik terasa sangat mulus (Liquid) */}
    <motion.div 
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      className={`h-full ${color}`}
    />
  </div>
);

// Contoh pemakaiannya di Parent Component:
// <LinearBar value={sysCpu} color="bg-brand" />
