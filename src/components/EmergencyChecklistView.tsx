import React, { useState } from 'react';
import { 
  PackageCheck, 
  Info, 
  Scale, 
  Clock, 
  MapPin, 
  Droplet, 
  Apple, 
  Cross, 
  Flashlight, 
  Volume2, 
  BatteryCharging, 
  FileText, 
  Coins, 
  Shirt, 
  Shield, 
  Radio, 
  Wrench,
  Sparkles,
  AlertTriangle,
  HeartHandshake,
  Baby,
  Users,
  ShieldCheck,
  CalendarCheck,
  Luggage,
  HelpCircle
} from 'lucide-react';
import { CHECKLIST_ITEMS } from '../data/checklistData';
import { soundEngine } from '../audio/soundEngine';

interface EmergencyChecklistViewProps {
  onNavigate?: (view: any) => void;
}

export const EmergencyChecklistView: React.FC<EmergencyChecklistViewProps> = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplet': return <Droplet className="w-5 h-5 text-cyan-400" />;
      case 'Apple': return <Apple className="w-5 h-5 text-emerald-400" />;
      case 'Cross': return <Cross className="w-5 h-5 text-rose-400" />;
      case 'Flashlight': return <Flashlight className="w-5 h-5 text-amber-400" />;
      case 'Volume2': return <Volume2 className="w-5 h-5 text-yellow-400" />;
      case 'BatteryCharging': return <BatteryCharging className="w-5 h-5 text-blue-400" />;
      case 'FileText': return <FileText className="w-5 h-5 text-indigo-400" />;
      case 'Coins': return <Coins className="w-5 h-5 text-amber-300" />;
      case 'Shirt': return <Shirt className="w-5 h-5 text-teal-400" />;
      case 'Shield': return <Shield className="w-5 h-5 text-violet-400" />;
      case 'Radio': return <Radio className="w-5 h-5 text-orange-400" />;
      case 'Wrench': return <Wrench className="w-5 h-5 text-slate-300" />;
      default: return <PackageCheck className="w-5 h-5 text-cyan-400" />;
    }
  };

  const categories = [
    'ALL', 
    'Kebutuhan Pokok', 
    'Pertolongan & Medis', 
    'Komunikasi & Penerangan', 
    'Dokumen & Perlindungan'
  ];

  const filteredItems = selectedCategory === 'ALL'
    ? CHECKLIST_ITEMS
    : CHECKLIST_ITEMS.filter(it => it.category === selectedCategory);

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'Sangat Wajib':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Sangat Wajib
          </span>
        );
      case 'Penting':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Penting
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            Pelengkap
          </span>
        );
    }
  };

  return (
    <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-16 w-full flex-1 animate-in fade-in duration-300 flex flex-col">
      {/* Page Title Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>STANDAR MITIGASI KESIAPSIAGAAN BNPB INDONESIA</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Panduan Tas Siaga Bencana (TSB)</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Panduan komprehensif penyiapan kit darurat mandiri untuk memenuhi kebutuhan hidup dasar selama <strong>72 jam pertama (*Golden Period*)</strong> saat terjadi bencana alam sebelum bantuan SAR dan logistik tiba.
        </p>
      </div>

      {/* 4 Core Standard Principles Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="p-5 rounded-3xl bg-zinc-950/80 border border-zinc-800 backdrop-blur-xl flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Prinsip Bertahan</div>
            <h4 className="text-sm font-bold text-amber-300 mb-1">72 Jam Golden Period</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Memenuhi nutrisi, hidrasi, dan medis mandiri sebelum posko penampungan darurat beroperasi penuh.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-950/80 border border-zinc-800 backdrop-blur-xl flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Kapasitas Beban</div>
            <h4 className="text-sm font-bold text-emerald-300 mb-1">15 - 20% Bobot Tubuh</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ransel tidak boleh terlalu berat agar pengguna tetap dapat berlari, merunduk, dan bergerak lincah.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-950/80 border border-zinc-800 backdrop-blur-xl flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Titik Penempatan</div>
            <h4 className="text-sm font-bold text-emerald-300 mb-1">Dekat Pintu Keluar</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Diletakkan di area yang mudah dijangkau seluruh keluarga tanpa terhalang pintu atau lemari saat gempa.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-zinc-950/80 border border-zinc-800 backdrop-blur-xl flex flex-col justify-between">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
            <Luggage className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Spesifikasi Tas</div>
            <h4 className="text-sm font-bold text-purple-300 mb-1">Ransel Tahan Air & Terang</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gunakan tas ransel bergaris reflektor dan berbahan kedap air (waterproof / dry-bag) agar isi tetap kering.
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Daftar Barang & Kebutuhan Esensial</h2>
          <p className="text-xs text-slate-400">Rincian spesifikasi dan fungsi barang perlengkapan evakuasi</p>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                soundEngine.playClick();
                setSelectedCategory(cat);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white border border-emerald-500 shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {cat === 'ALL' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Informative Items Grid (No Checkboxes) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-3xl bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between group backdrop-blur-xl hover:-translate-y-0.5 shadow-lg"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center transition-transform group-hover:scale-105 shrink-0">
                    {getIcon(item.icon)}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{item.category}</span>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {item.name}
                    </h4>
                  </div>
                </div>

                <div className="shrink-0">
                  {getImportanceBadge(item.importance)}
                </div>
              </div>

              <p className="text-xs text-slate-300/90 leading-relaxed mb-4">
                {item.description}
              </p>
            </div>

            <div className="text-[11px] text-slate-400 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
              <span className="text-slate-500">Estimasi Bobot Ransel:</span>
              <span className="font-bold text-slate-300 bg-zinc-900/80 px-2 py-0.5 rounded-lg border border-zinc-700/60">~{item.weightKg} kg</span>
            </div>
          </div>
        ))}
      </div>

      {/* Special Needs Section (Lansia, Balita, Disabilitas) */}
      <div className="mb-10">
        <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          Kebutuhan Khusus Anggota Keluarga
        </h3>
        <p className="text-xs text-slate-400 mb-4">Pastikan tas siaga telah disesuaikan jika keluarga Anda memiliki anggota dengan kebutuhan khusus</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-zinc-950/80 border border-zinc-800 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
                <Baby className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Bayi & Balita</h4>
            </div>
            <ul className="text-xs text-slate-300/90 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>Susu formula / bubur instan & botol steril</li>
              <li>Popok sekali pakai (persediaan 3 hari)</li>
              <li>Minyak telon, bedak, dan selimut hangat</li>
              <li>Mainan kecil / benda penenang (*comfort toy*)</li>
            </ul>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-950/80 border border-zinc-800 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Lansia & Medis Rutin</h4>
            </div>
            <ul className="text-xs text-slate-300/90 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>Obat rutin kronis (hipertensi, diabetes, jantung)</li>
              <li>Kacamata baca / alat bantu dengar cadangan</li>
              <li>Tongkat jalan lipat portabel</li>
              <li>Salinan catatan riwayat rekam medis dokter</li>
            </ul>
          </div>

          <div className="p-5 rounded-3xl bg-zinc-950/80 border border-zinc-800 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Kebutuhan Spesifik Wanita</h4>
            </div>
            <ul className="text-xs text-slate-300/90 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>Pembalut dan sanitasi higienis wanita</li>
              <li>Pakaian dalam cadangan ekstra</li>
              <li>Tisu basah antiseptik dan kantong pembuangan</li>
              <li>Sabun pembersih higienis pribadi</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Routine Maintenance & Rotation Protocol */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-zinc-950/95 to-black/95 border border-emerald-500/30 backdrop-blur-xl flex flex-col md:flex-row items-start gap-5 shadow-2xl">
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
          <CalendarCheck className="w-7 h-7" />
        </div>
        <div>
          <h4 className="text-base font-black text-white mb-1.5">Protokol Perawatan & Rotasi Berkala (Setiap 6 Bulan)</h4>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Periksa tanggal kedaluwarsa air mineral, ransum makanan kaleng, baterai senter/radio, dan obat-obatan pribadi secara terjadwal setiap <strong>6 bulan sekali</strong> (misalnya setiap pergantian semester atau tahun baru). 
            Ganti barang yang mendekati masa kedaluwarsa dengan stok baru.
          </p>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-emerald-300 font-medium">
            <span className="bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">✓ Gunakan kantong Ziplock kedap air</span>
            <span className="bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">✓ Cantumkan label nama & kontak keluarga</span>
            <span className="bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">✓ Satu tas per orang dewasa</span>
          </div>
        </div>
      </div>
    </section>
  );
};
