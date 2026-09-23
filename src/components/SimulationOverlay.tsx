import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ArrowRight, 
  Radio, 
  Info,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Minimize2,
  Maximize2,
  Mountain,
  Flame,
  AlertTriangle,
  CloudLightning,
  Zap,
  Wind,
  Waves,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { DisasterId } from '../types/disaster';
import { SIMULATION_SCENARIOS, DISASTERS_DATA } from '../data/disasterData';
import { soundEngine } from '../audio/soundEngine';
import type { EruptionStage } from '../scenes/VolcanoScene';
import type { TsunamiStage } from '../scenes/TsunamiScene';
import type { FloodStage } from '../scenes/FloodScene';
import type { EarthquakeStage } from '../scenes/EarthquakeScene';
import type { LandslideStage } from '../scenes/LandslideScene';
import type { TornadoStage } from '../scenes/TornadoScene';

// ── Tornado Stages Data ─────────────────────────────────────────────
const TORNADO_STAGES = [
  {
    id: 'NORMAL',
    title: 'Kondisi Cuaca Cerah',
    subtitle: 'Atmosfer Stabil & Angin Normal',
    pvmbgLevel: 'Normal (Skala EF-0)',
    pvmbgColor: '#22c55e',
    icon: Wind,
    description: 'Kondisi atmosfer pemukiman dalam keadaan tenang dan stabil. Kecepatan angin rendah (< 15 km/jam), langit cerah berawan, dan warga beraktivitas seperti biasa.',
    visualHint: 'Perhatikan lingkungan pemukiman yang asri, pepohonan berdiri tegak, dan cuaca cerah.'
  },
  {
    id: 'SUPERCELL_INFLOW',
    title: 'Awan Supercell & Inflow Panas',
    subtitle: 'Konvergensi Udara Panas-Dingin',
    pvmbgLevel: 'Waspada Cuaca Ekstrem',
    pvmbgColor: '#eab308',
    icon: CloudLightning,
    description: 'Udara hangat lembap naik drastis (updraft) bertemu massa udara dingin. Terbentuk awan badai Cumulonimbus supercell gelap kehijauan disertai kilatan petir dan hujan deras berangin.',
    visualHint: 'Langit menggelap mendung badai, kilatan petir menyala di langit, dan hujan deras mulai mengguyur.'
  },
  {
    id: 'MESOCYCLONE_ROTATION',
    title: 'Rotasi Mesosiklon (Wall Cloud)',
    subtitle: 'Pusaran Udara Vertikal Berputar',
    pvmbgLevel: 'Siaga Puting Beliung',
    pvmbgColor: '#f97316',
    icon: AlertTriangle,
    description: 'Terbentuk pusaran udara berputar vertikal (mesosiklon) di dalam awan badai. Dinding awan berputar (rotating wall cloud) mulai turun mendekati atap pemukiman. Pohon-pohon mulai membungkuk tertiup angin kencang.',
    visualHint: 'Perhatikan cakram dinding awan gelap (wall cloud) berputar turun dari kanopi awan badai!'
  },
  {
    id: 'CONDENSATION_FUNNEL',
    title: 'Turunnya Corong Pusaran (Funnel)',
    subtitle: 'Condensation Funnel Descending',
    pvmbgLevel: 'Peringatan Dini Tornado (EF-2)',
    pvmbgColor: '#ef4444',
    icon: Zap,
    description: 'Tekanan udara di pusat pusaran anjlok drastis menyebabkan uap air mengembun menjadi corong pusaran (funnel cloud) yang memanjang turun dari awan ke arah pemukiman. Segera cari perlindungan!',
    visualHint: 'Corong pusaran memanjang turun dari awan menuju jalanan pemukiman, pohon miring tajam!'
  },
  {
    id: 'TOUCHDOWN_VIOLENT',
    title: 'Hantaman Puting Beliung (Touchdown)',
    subtitle: 'Touchdown & Debris Vortex EF-3',
    pvmbgLevel: 'BAHAYA KRITIS / TORNADO TOUCHDOWN',
    pvmbgColor: '#ef4444',
    icon: AlertOctagon,
    description: 'TORNADO MENYENTUH TANAH! Pusaran berkecepatan > 150 km/jam menerjang pemukiman. Puing seng, dahan pohon, dan debu berputar hebat dalam spiral heliks. Kabel listrik putus mengeluarkan percikan!',
    visualHint: 'Hantaman dahsyat! Corong menyentuh tanah, atap seng beterbangan, percikan listrik di tiang PLN!'
  },
  {
    id: 'SAFE_ROOM_MITIGATION',
    title: 'Mitigasi Ruang Aman Tengah / Bunker',
    subtitle: 'Lindungi Kepala di Ruang Tanpa Jendela',
    pvmbgLevel: 'Tindakan Penyelamatan Diri',
    pvmbgColor: '#38bdf8',
    icon: ShieldCheck,
    description: 'JANGAN BERADA DI DEKAT JENDELA! Masuklah ke ruangan paling tengah rumah di lantai dasar tanpa jendela (kamar mandi/lorong dalam) atau bunker bawah tanah. Lindungi kepala di bawah meja kokoh dengan kasur/helm.',
    visualHint: 'Lihat potongan rumah: warga berlindung aman di dalam ruang tengah terlindung dari serpihan kaca!'
  },
  {
    id: 'AFTERMATH_RECOVERY',
    title: 'Pasca Badai & Tanggap Darurat',
    subtitle: 'Evakuasi Tim SAR & Amankan Jalur Listrik',
    pvmbgLevel: 'Pemulihan Pasca Bencana',
    pvmbgColor: '#22c55e',
    icon: Wind,
    description: 'Pusaran angin puting beliung telah terangkat dan menghilang. Waspadai bahaya sekunder seperti kabel listrik terbuka dan serpihan kaca tajam. Tim BPBD dan relawan medis membantu pemulihan.',
    visualHint: 'Cuaca kembali cerah, tim penanggulangan bencana mendata kerusakan dan mengamankan lokasi.'
  }
];

// ── Landslide Stages Data ─────────────────────────────────────────────
const LANDSLIDE_STAGES = [
  {
    id: 'NORMAL',
    title: 'Kondisi Lereng Stabil',
    subtitle: 'Keseimbangan Alami Lereng Pegunungan',
    pvmbgLevel: 'Zona Stabil / Aman',
    pvmbgColor: '#22c55e',
    icon: Mountain,
    description: 'Lereng pegunungan dalam kondisi stabil dengan tegangan geser seimbang. Pepohonan lebat mengikat tanah permukaan, aliran air tanah normal, dan jalan raya lembah beroperasi aman.',
    visualHint: 'Perhatikan lereng hijau yang subur, lapisan tanah kokoh di atas batuan dasar, serta vegetasi yang lebat.'
  },
  {
    id: 'HEAVY_RAIN',
    title: 'Hujan Badai Ekstrem',
    subtitle: 'Curah Hujan Tinggi Terus-Menerus',
    pvmbgLevel: 'Peringatan Dini Cuaca Ekstrem',
    pvmbgColor: '#eab308',
    icon: CloudLightning,
    description: 'Hujan lebat berdurasi panjang mengguyur kawasan perbukitan. Air hujan mulai meresap ke dalam pori-pori tanah (infiltrasi), menambah beban massa tanah di bagian atas lereng.',
    visualHint: 'Hujan deras mengguyur lereng, langit menggelap mendung, air mulai meresap membasahi tanah.'
  },
  {
    id: 'SOIL_SATURATION',
    title: 'Saturasi Air & Tekanan Pori',
    subtitle: 'Pore Water Pressure & Akuifer Jenuh',
    pvmbgLevel: 'Waspada Longsor (Level 2)',
    pvmbgColor: '#38bdf8',
    icon: Zap,
    description: 'Lapisan tanah mencapai titik jenuh air (saturated). Tekanan air pori (pore water pressure) meningkat drastis, mengurangi daya ikat partikel tanah dan menurunkan kuat geser batuan.',
    visualHint: 'Lihat potongan geologi: lapisan akuifer jenuh air memancarkan tekanan air pori (panah biru) ke atas!'
  },
  {
    id: 'TENSION_CRACKING',
    title: 'Retakan Mahkota Lereng',
    subtitle: 'Crown Tension Cracks & Pohon Miring',
    pvmbgLevel: 'Siaga Bencana (Level 3)',
    pvmbgColor: '#f97316',
    icon: AlertTriangle,
    description: 'Tanda awal longsor! Terbentuk retakan tapal kuda (tension cracks) di puncak lereng (crown). Batang pohon dan tiang listrik mulai miring kehilangan pijakan. Suara gemuruh rekahan tanah terdengar!',
    visualHint: 'Perhatikan retakan mahkota merekah di puncak bukit dan pohon-pohon mulai miring condong ke depan!'
  },
  {
    id: 'SLOPE_FAILURE',
    title: 'Guguran Massa & Longsoran Debris',
    subtitle: 'Slope Failure, Mudflow & Debris Avalanche',
    pvmbgLevel: 'Awas Longsor / Bahaya Kritis',
    pvmbgColor: '#ef4444',
    icon: AlertOctagon,
    description: 'LONGSOR TERJADI! Bidang gelincir (slip surface) runtuh seketika. Ratusan ton massa tanah, batuan besar, dan lumpur meluncur deras menuruni lereng dengan kecepatan tinggi menyapu jalan dan pepohonan!',
    visualHint: 'Longsoran masif! Lumpur, bebatuan, dan pohon tumbang meluncur deras menuruni bidang gelincir lereng!'
  },
  {
    id: 'VALLEY_IMPACT_MITIGATION',
    title: 'Mitigasi & Evakuasi Lateral',
    subtitle: 'Lari Tegak Lurus Menjauhi Jalur Longsor',
    pvmbgLevel: 'Tanggap Darurat Evakuasi',
    pvmbgColor: '#38bdf8',
    icon: Mountain,
    description: 'JANGAN BERLARI KE ARAH BAWAH LEMBAH! Lakukan EVAKUASI LATERAL: lari menyamping tegak lurus dari arah luncuran longsor menuju dataran tinggi dan Titik Kumpul (Assembly Point) di area aman!',
    visualHint: 'Warga bergerak cepat ke kanan (Titik Kumpul Lembah Aman) menjauhi alur luncuran debris longsor!'
  },
  {
    id: 'AFTERMATH',
    title: 'Pasca Bencana & Stabilisasi Lereng',
    subtitle: 'SAR, Bronjong Kawat & Revegetasi Akar Kuat',
    pvmbgLevel: 'Pemulihan & Stabilisasi Lereng',
    pvmbgColor: '#22c55e',
    icon: Wind,
    description: 'Alur longsor terhenti di dinding penahan (retaining wall/bronjong). Tim SAR BNPB dan relawan medis mengevakuasi korban di posko darurat. Upaya mitigasi struktural dan penanaman rumput vetiver dimulai.',
    visualHint: 'Posko BPBD dan ambulans aktif di titik kumpul, dinding penahan menahan endapan tanah longsor.'
  }
];

// ── Earthquake Stages Data ───────────────────────────────────────────
const EARTHQUAKE_STAGES = [
  {
    id: 'NORMAL',
    title: 'Kondisi Normal & Stabil',
    subtitle: 'Keseimbangan Lempeng Tektonik',
    pvmbgLevel: 'Skala I MMI (Normal)',
    pvmbgColor: '#22c55e',
    icon: Activity,
    description: 'Lempeng tektonik bumi dalam keadaan stabil dan seimbang. Aktivitas seismik sangat rendah. Bangunan gedung, sekolah, jalan raya, dan warga kota beraktivitas aman tanpa getaran.',
    visualHint: 'Perhatikan kota yang tenang dan potongan lapisan kerak bumi bawah tanah yang kokoh.'
  },
  {
    id: 'STRESS_ACCUMULATION',
    title: 'Akumulasi Tekanan Tektonik',
    subtitle: 'Tectonic Stress & Locked Fault',
    pvmbgLevel: 'Skala II MMI (Waspada)',
    pvmbgColor: '#eab308',
    icon: AlertTriangle,
    description: 'Pergerakan lempeng tektonik saling bertumbukan dan terkunci akibat gesekan batuan. Energi elastis mulai terakumulasi secara masif di sepanjang bidang sesar (fault plane) di kedalaman bumi.',
    visualHint: 'Perhatikan zona patahan sesar bawah tanah mulai menyala kuning karena akumulasi tekanan tinggi.'
  },
  {
    id: 'FAULT_RUPTURE',
    title: 'Pelepasan Energi Hiposentrum',
    subtitle: 'Fault Rupture & Hypocenter Focus',
    pvmbgLevel: 'Skala III-IV MMI (Siaga)',
    pvmbgColor: '#f97316',
    icon: Zap,
    description: 'BATUAN PATAH MENDADAK! Gesekan batuan tidak lagi mampu menahan tegangan lempeng. Terjadi rekahan sesar (fault rupture) di titik Hiposentrum yang melepaskan energi seismik raksasa seketika.',
    visualHint: 'Lihat kilatan energi menyala terang di titik fokus hiposentrum bawah tanah saat sesar patah!'
  },
  {
    id: 'P_WAVE',
    title: 'Gelombang Primer (P-Wave)',
    subtitle: 'Compressional Wave Arrival (V ≈ 6-8 km/s)',
    pvmbgLevel: 'Peringatan Dini Gempa (EEW)',
    pvmbgColor: '#38bdf8',
    icon: Radio,
    description: 'Gelombang seismik longitudinal tercepat (Gelombang P) merambat naik dari hiposentrum ke permukaan (Episentrum). Menghasilkan getaran vertikal awal dan suara gemuruh bumi. Sistem Peringatan Dini BMKG berbunyi!',
    visualHint: 'Lihat cincin gelombang P biru melesat cepat ke permukaan dan getaran awal terasa di permukaan.'
  },
  {
    id: 'S_WAVE_SURFACE',
    title: 'Guncangan Dahsyat Gelombang S',
    subtitle: 'Shear & Surface Waves Destructive Phase',
    pvmbgLevel: 'Skala VI-VIII MMI (Awas Bahaya)',
    pvmbgColor: '#ef4444',
    icon: AlertOctagon,
    description: 'GELOMBANG S & GELOMBANG PERMUKAAN MENGHANTAM! Gelombang transversal lambat namun bertenaga destruktif mengguncang tanah ke segala arah. Gedung bergoyang hebat, retakan tanah terbuka, dan trafo tiang listrik memercikkan api!',
    visualHint: 'Guncangan dahsyat! Gedung-gedung bergoyang kencang, retakan tanah terbuka di sepanjang sesar!'
  },
  {
    id: 'STRUCTURAL_DAMAGE_MITIGATION',
    title: 'Tindakan Mitigasi Darurat',
    subtitle: 'Drop, Cover, Hold On & Evakuasi Lapangan',
    pvmbgLevel: 'Tanggap Darurat Evakuasi',
    pvmbgColor: '#38bdf8',
    icon: Mountain,
    description: 'DI DALAM RUANGAN: Lakukan DROP (berlutut), COVER (lindungi kepala di bawah meja kokoh), HOLD ON (pegang kaki meja). DI LUAR RUANGAN: Segera evakuasi ke Titik Kumpul (Assembly Point) di lapangan terbuka!',
    visualHint: 'Lihat potongan gedung: warga berlindung di bawah meja dan berkumpul aman di Titik Kumpul lapangan!'
  },
  {
    id: 'AFTERMATH',
    title: 'Pasca Gempa & Gempa Susulan',
    subtitle: 'Aftershocks, SAR & Damage Assessment',
    pvmbgLevel: 'Pemulihan & Waspada Susulan',
    pvmbgColor: '#f97316',
    icon: Wind,
    description: 'Guncangan utama mereda namun waspadai gempa susulan (aftershocks). Jangan masuk gedung yang retak miring. Tim SAR BNPB dan relawan medis tiba di Titik Kumpul untuk evakuasi dan pertolongan pertama.',
    visualHint: 'Posko darurat dan ambulans SAR aktif dengan lampu sirine di titik kumpul, jalur evakuasi aman.'
  }
];

// ── Volcano Eruption Stages Data ──────────────────────────────────────
const ERUPTION_STAGES = [
  {
    id: 'NORMAL',
    title: 'Gunung Normal',
    subtitle: 'Fase Dormant',
    pvmbgLevel: 'Level I — Normal',
    pvmbgColor: '#22c55e',
    icon: Mountain,
    description: 'Gunung api dalam keadaan tenang. Aktivitas vulkanik sangat rendah. Danau kawah stabil dan tidak ada emisi gas berbahaya yang signifikan. Masyarakat dapat beraktivitas normal di sekitar gunung.',
    visualHint: 'Perhatikan gunung yang tenang — tidak ada asap, lava redup, suasana damai.'
  },
  {
    id: 'UNREST',
    title: 'Keresahan Vulkanik',
    subtitle: 'Volcanic Unrest',
    pvmbgLevel: 'Level II — Waspada',
    pvmbgColor: '#eab308',
    icon: AlertTriangle,
    description: 'Magma mulai bergerak naik dari dapur magma. Terjadi gempa-gempa vulkanik dangkal (tremor). Suhu danau kawah meningkat dan muncul asap solfatara tipis. PVMBG menaikkan status ke Level II Waspada.',
    visualHint: 'Lihat getaran halus pada gunung dan asap tipis mulai keluar dari kawah.'
  },
  {
    id: 'PHREATIC',
    title: 'Erupsi Freatik',
    subtitle: 'Phreatic Eruption',
    pvmbgLevel: 'Level II — Waspada',
    pvmbgColor: '#eab308',
    icon: CloudLightning,
    description: 'Air tanah bertemu magma panas dan berubah menjadi uap bertekanan tinggi. Ledakan uap menyemburkan material dari kawah tanpa magma baru mencapai permukaan. Kolom abu tipis mulai terlihat.',
    visualHint: 'Perhatikan semburan abu dari kawah dan zona KRB mulai terlihat.'
  },
  {
    id: 'MAGMATIC_RISE',
    title: 'Kubah Lava Tumbuh',
    subtitle: 'Lava Dome Growth',
    pvmbgLevel: 'Level III — Siaga',
    pvmbgColor: '#f97316',
    icon: Flame,
    description: 'Magma kental (andesit-dasit) mencapai permukaan dan membentuk kubah lava di kawah. Kubah ini sangat tidak stabil — bisa runtuh kapan saja menghasilkan awan panas guguran. Status dinaikkan ke Level III Siaga.',
    visualHint: 'Kubah lava merah menyala terbentuk di kawah. Asap semakin pekat. Zona KRB aktif!'
  },
  {
    id: 'ERUPTION',
    title: 'Erupsi Eksplosif',
    subtitle: 'Klimaks — Plinian Eruption',
    pvmbgLevel: 'Level IV — Awas',
    pvmbgColor: '#ef4444',
    icon: Zap,
    description: 'LETUSAN BESAR! Kolom erupsi menjulang ke troposfer, awan jamur terbentuk, bom vulkanik terlontar, awan panas (wedhus gembel) menerjang lereng, petir vulkanik menyambar di dalam awan abu. EVAKUASI TOTAL!',
    visualHint: 'Semua elemen erupsi aktif — kolom abu, awan panas, lava, petir vulkanik di awan abu!'
  },
  {
    id: 'LAVA_FLOW',
    title: 'Aliran Lava ke Dataran Rendah',
    subtitle: 'Lava Flow & Lahar',
    pvmbgLevel: 'Level IV — Awas',
    pvmbgColor: '#ef4444',
    icon: Flame,
    description: 'Lava cair mengalir deras menuruni lereng gunung, membentuk aliran lava (lava flow) yang membakar dan menghancurkan segalanya. Lava mencapai dataran rendah, membakar hutan dan pemukiman. Lahar panas juga mengalir di sepanjang sungai. EVAKUASI TOTAL masih berlaku!',
    visualHint: 'Lihat sisi kanan gunung — aliran lava merah menyala mengalir jauh ke dataran, membentuk kolam lava di lembah.'
  },
  {
    id: 'POST_ERUPTION',
    title: 'Pasca Erupsi',
    subtitle: 'Post-Eruption Phase',
    pvmbgLevel: 'Level III — Siaga',
    pvmbgColor: '#f97316',
    icon: Wind,
    description: 'Aktivitas vulkanik mulai mereda namun ancaman belum berakhir. Hujan abu tebal menutupi wilayah sekitar, lahar dingin mengancam saat hujan turun. Tim SAR dan BPBD melaksanakan operasi penyelamatan korban. Korban perlu waspada ancaman gas beracun (SO2, H2S).',
    visualHint: 'Abu jatuh dari langit, asap mereda, pohon-pohon menghitam tertutup abu. Posko evakuasi aktif penuh.'
  },
];

// ── Tsunami Stages Data ───────────────────────────────────────────────
const TSUNAMI_STAGES = [
  {
    id: 'NORMAL',
    title: 'Kondisi Normal',
    subtitle: 'Laut Tenang & Pesisir Pantai',
    pvmbgLevel: 'Status Normal',
    pvmbgColor: '#22c55e',
    icon: Waves,
    description: 'Lautan dalam keadaan tenang, gelombang laut normal, kapal nelayan jukung berlayar damai, rumah panggung pesisir aman.',
    visualHint: 'Permukaan laut tenang, air tidak surut, ombak pantai kecil normal.'
  },
  {
    id: 'UNDERSEA_QUAKE',
    title: 'Gempa Bumi Bawah Laut',
    subtitle: 'Dislokasi Lempeng Tektonik (M > 7.0)',
    pvmbgLevel: 'Peringatan Gempa Laut',
    pvmbgColor: '#eab308',
    icon: AlertTriangle,
    description: 'Pergeseran lempeng tektonik bawah laut secara vertikal menimbulkan gempa bumi megathrust ber-magnitudo besar di kedalaman laut. Kamera guncang, kerak dasar laut patah dan mendorong kolom air laut secara masif ke atas.',
    visualHint: 'Lihat getaran gempa, retakan patahan di dasar laut, dan air laut mulai terganggu.'
  },
  {
    id: 'SEA_DRAWBACK',
    title: 'Air Laut Surut Tiba-tiba',
    subtitle: 'Peringatan Dini Tsunami (TEWS)',
    pvmbgLevel: 'Waspada / Siaga Tsunami',
    pvmbgColor: '#f97316',
    icon: Radio,
    description: 'Air laut di garis pantai mendadak surut ratusan meter secara drastis hingga dasar laut dan terumbu karang terlihat. Sirine BMKG TEWS berbunyi nyaring! SEGERA LARI KE BUKIT TINGGI!',
    visualHint: 'Air laut surut jauh ke tengah laut secara mendadak, sirine peringatan TEWS menyala!'
  },
  {
    id: 'WAVE_APPROACH',
    title: 'Gelombang Tsunami Mendekat',
    subtitle: 'Towering Wave Approach',
    pvmbgLevel: 'Awas Tsunami Datang',
    pvmbgColor: '#ef4444',
    icon: Zap,
    description: 'Gelombang tsunami raksasa terbentuk dari tengah laut dan bergerak cepat mendekati daratan. Saat memasuki perairan dangkal, tingginya menjulang tinggi (efek shoaling).',
    visualHint: 'Ombak raksasa dengan puncak busa putih tinggi terbentuk menjulang mendekati pesisir pantai!'
  },
  {
    id: 'COASTAL_IMPACT',
    title: 'Terjangan Tsunami ke Pantai',
    subtitle: 'Coastal Inundation & Impact',
    pvmbgLevel: 'Awas Terjangan Gelombang',
    pvmbgColor: '#ef4444',
    icon: AlertOctagon,
    description: 'Gelombang tsunami menghantam pantai, melompati pemecah gelombang (tetrapod), dan menerjang pemukiman rumah panggung dengan kekuatan destruktif. Sabuk hijau bakau (mangrove) meredam sebagian energi gelombang.',
    visualHint: 'Gelombang meluap menerjang pemukiman pantai, perahu tersapu air!'
  },
  {
    id: 'EVACUATION',
    title: 'Evakuasi Darurat ke Bukit',
    subtitle: 'High Ground Evacuation (>20m)',
    pvmbgLevel: 'Proses Evakuasi',
    pvmbgColor: '#38bdf8',
    icon: Mountain,
    description: 'Warga pesisir melarikan diri mengikuti jalur evakuasi menuju Tempat Evakuasi Sementara (TES) di bukit tinggi dengan elevasi lebih dari 20 meter di atas permukaan laut. Hindari sungai dan muara!',
    visualHint: 'Posko evakuasi di atas bukit menyala terang, jalur evakuasi aman dari genangan!'
  },
  {
    id: 'POST_TSUNAMI',
    title: 'Pasca Tsunami',
    subtitle: 'Receding Water & Relief',
    pvmbgLevel: 'Tanggap Darurat',
    pvmbgColor: '#f97316',
    icon: Wind,
    description: 'Air tsunami mulai surut kembali ke laut membawa puing-puing. Waspadai gelombang susulan yang bisa terjadi hingga beberapa jam kemudian. Tetap di bukit sampai instruksi resmi BMKG/BPBD mencabut status peringatan.',
    visualHint: 'Air surut kembali, bendera Merah Putih di puncak bukit berkibar tegak, tim penanggulangan bencana aktif.'
  }
];

// ── Flood Stages Data ────────────────────────────────────────────────
const FLOOD_STAGES = [
  {
    id: 'NORMAL',
    title: 'Kondisi Normal',
    subtitle: 'Aliran Sungai & Drainase Lancar',
    pvmbgLevel: 'Status Aman',
    pvmbgColor: '#22c55e',
    icon: Waves,
    description: 'Cuaca cerah, debit air sungai dalam batas normal, saluran drainase perkotaan bersih tanpa sumbatan sampah, pemukiman aman beraktivitas.',
    visualHint: 'Permukaan air sungai normal di dalam palung sungai, jalanan dan rumah kering bersih.'
  },
  {
    id: 'HEAVY_RAIN',
    title: 'Hujan Monsun Lebat',
    subtitle: 'Curah Hujan Ekstrem (>100 mm/hari)',
    pvmbgLevel: 'Peringatan Dini Cuaca',
    pvmbgColor: '#eab308',
    icon: CloudLightning,
    description: 'Awan kumulonimbus tebal mengguyur hulu sungai dan kawasan pemukiman dengan curah hujan lebat berdurasi panjang. Laju infiltrasi tanah mulai mencapai batas jenuh.',
    visualHint: 'Hujan deras mengguyur pemukiman, langit meredup berawan, debit air sungai mulai naik.'
  },
  {
    id: 'DRAINAGE_CLOG',
    title: 'Penyumbatan Saluran Air',
    subtitle: 'Sedimentasi & Sampah Menumpuk',
    pvmbgLevel: 'Waspada Genangan Air',
    pvmbgColor: '#eab308',
    icon: AlertTriangle,
    description: 'Tumpukan sampah plastik dan endapan lumpur menyumbat gorong-gorong drainase kota. Air hujan tidak dapat mengalir dan mulai menggenangi jalanan setinggi mata kaki (10-30 cm).',
    visualHint: 'Genangan air mulai naik di jalan raya dan trotoar, tumpukan sampah terlihat di saluran air.'
  },
  {
    id: 'RIVER_OVERFLOW',
    title: 'Luapan Debit Sungai',
    subtitle: 'Banjir Kiriman dari Hulu',
    pvmbgLevel: 'Pintu Air Siaga 2',
    pvmbgColor: '#f97316',
    icon: Zap,
    description: 'Volume air kiriman dari hulu meluap melebihi kapasitas penampang sungai. Tanggul sungai mulai merembes dan air melimpas deras ke jalanan pemukiman warga.',
    visualHint: 'Sungai meluap melompati tanggul pembatas, arus air cokelat deras mulai menggenangi halaman rumah!'
  },
  {
    id: 'URBAN_INUNDATION',
    title: 'Banjir Merendam Pemukiman',
    subtitle: 'Ketinggian Air 1.0 - 1.8 Meter',
    pvmbgLevel: 'Awas Banjir / Siaga 1',
    pvmbgColor: '#ef4444',
    icon: AlertOctagon,
    description: 'Air banjir keruh merendam seluruh lantai 1 pemukiman dan jalanan. Kendaraan mogok dan terseret arus. Bahaya sengatan listrik dari tiang PLN! Segera matikan sekering MCB!',
    visualHint: 'Air banjir tinggi merendam lantai 1 rumah, mobil terapung hanyut, percikan korsleting listrik di tiang PLN!'
  },
  {
    id: 'EMERGENCY_EVACUATION',
    title: 'Evakuasi Vertikal & SAR',
    subtitle: 'Penyelamatan Perahu Karet SAR',
    pvmbgLevel: 'Tanggap Darurat Evakuasi',
    pvmbgColor: '#38bdf8',
    icon: Mountain,
    description: 'Warga melakukan evakuasi vertikal ke Lantai 2 rumah yang aman. Tim SAR BNPB dan relawan mengerahkan perahu karet untuk mengevakuasi lansia dan anak-anak ke posko pengungsian.',
    visualHint: 'Warga berkumpul aman di balkon lantai 2, perahu karet BNPB beroperasi menjemput korban banjir.'
  },
  {
    id: 'RECEDING_WATER',
    title: 'Air Surut & Pemulihan',
    subtitle: 'Pembersihan Lumpur & Sanitasi',
    pvmbgLevel: 'Pasca Bencana / Pemulihan',
    pvmbgColor: '#22c55e',
    icon: Wind,
    description: 'Pompa drainase beroperasi dan air banjir mulai surut menyisakan endapan lumpur tebal. Warga membersihkan sisa banjir, waspadai hewan berbisa dan penyakit leptospirosis.',
    visualHint: 'Genangan air menyusut kembali ke saluran, endapan lumpur tersisa, pemulihan lingkungan dimulai.'
  }
];

interface SimulationOverlayProps {
  disasterId: DisasterId;
  isSimulating: boolean;
  onToggleSimulate: () => void;
  onExit: () => void;
  onAddXp: (amount: number) => void;
  onOpenDetails: () => void;
  volcanoStage?: EruptionStage;
  onSetVolcanoStage?: (stage: EruptionStage) => void;
  tsunamiStage?: TsunamiStage;
  onSetTsunamiStage?: (stage: TsunamiStage) => void;
  floodStage?: FloodStage;
  onSetFloodStage?: (stage: FloodStage) => void;
  earthquakeStage?: EarthquakeStage;
  onSetEarthquakeStage?: (stage: EarthquakeStage) => void;
  landslideStage?: LandslideStage;
  onSetLandslideStage?: (stage: LandslideStage) => void;
  tornadoStage?: TornadoStage;
  onSetTornadoStage?: (stage: TornadoStage) => void;
  showCutaway?: boolean;
  onToggleCutaway?: () => void;
}

export const SimulationOverlay: React.FC<SimulationOverlayProps> = ({
  disasterId,
  isSimulating,
  onToggleSimulate,
  onExit,
  onAddXp,
  onOpenDetails,
  volcanoStage,
  onSetVolcanoStage,
  tsunamiStage,
  onSetTsunamiStage,
  floodStage,
  onSetFloodStage,
  earthquakeStage,
  onSetEarthquakeStage,
  landslideStage,
  onSetLandslideStage,
  tornadoStage,
  onSetTornadoStage,
  showCutaway = true,
  onToggleCutaway
}) => {
  const scenario = SIMULATION_SCENARIOS[disasterId];
  const data = DISASTERS_DATA[disasterId];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showBriefing, setShowBriefing] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isStageMinimized, setIsStageMinimized] = useState(false);

  // Play atmospheric procedural sound when entering simulation
  useEffect(() => {
    if (isSimulating) {
      if (disasterId === 'EARTHQUAKE') {
        soundEngine.playEarthquakeRumble(5);
      } else if (disasterId === 'TSUNAMI') {
        soundEngine.playTsunamiSurge();
      } else if (disasterId === 'VOLCANO') {
        soundEngine.playVolcanoExplosion();
      } else if (disasterId === 'FLOOD') {
        soundEngine.playWaterSplash();
      } else if (disasterId === 'LANDSLIDE') {
        soundEngine.playEarthquakeRumble(3);
      } else if (disasterId === 'TORNADO') {
        soundEngine.playTornadoWind(5);
      }
    }
  }, [disasterId, isSimulating]);

  const currentStep = scenario.steps[currentStepIndex];

  const handleSelectOption = (option: { id: string; isCorrect: boolean; feedback: string; xp: number }) => {
    if (selectedOptionId) return;

    setSelectedOptionId(option.id);
    if (option.isCorrect) {
      soundEngine.playCorrect();
      onAddXp(option.xp);
    } else {
      soundEngine.playWrong();
    }
  };

  const handleNextStep = () => {
    soundEngine.playClick();
    if (currentStepIndex + 1 < scenario.steps.length) {
      setCurrentStepIndex(prev => prev + 1);
      setSelectedOptionId(null);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    soundEngine.playClick();
    setCurrentStepIndex(0);
    setSelectedOptionId(null);
    setIsCompleted(false);
    setShowBriefing(true);
    setIsMinimized(false);
  };

  const selectedOption = currentStep?.options.find(o => o.id === selectedOptionId);

  // Landslide Stage Navigation Handlers
  const isLandslide = disasterId === 'LANDSLIDE' && landslideStage !== undefined && onSetLandslideStage;
  const currentLandslideStageData = isLandslide ? LANDSLIDE_STAGES[landslideStage!] : null;

  const handleLandslidePrev = () => {
    if (!isLandslide || landslideStage === undefined || landslideStage <= 0) return;
    soundEngine.playClick();
    onSetLandslideStage!((landslideStage - 1) as LandslideStage);
  };

  const handleLandslideNext = () => {
    if (!isLandslide || landslideStage === undefined || landslideStage >= 6) return;
    soundEngine.playClick();
    onSetLandslideStage!((landslideStage + 1) as LandslideStage);
  };

  // Earthquake Stage Navigation Handlers
  const isEarthquake = disasterId === 'EARTHQUAKE' && earthquakeStage !== undefined && onSetEarthquakeStage;
  const currentEarthquakeStageData = isEarthquake ? EARTHQUAKE_STAGES[earthquakeStage!] : null;

  const handleEarthquakePrev = () => {
    if (!isEarthquake || earthquakeStage === undefined || earthquakeStage <= 0) return;
    soundEngine.playClick();
    onSetEarthquakeStage!((earthquakeStage - 1) as EarthquakeStage);
  };

  const handleEarthquakeNext = () => {
    if (!isEarthquake || earthquakeStage === undefined || earthquakeStage >= 6) return;
    soundEngine.playClick();
    onSetEarthquakeStage!((earthquakeStage + 1) as EarthquakeStage);
  };

  // Volcano Stage Navigation Handlers
  const isVolcano = disasterId === 'VOLCANO' && volcanoStage !== undefined && onSetVolcanoStage;
  const currentVolcanoStageData = isVolcano ? ERUPTION_STAGES[volcanoStage!] : null;

  const handleVolcanoPrev = () => {
    if (!isVolcano || volcanoStage === undefined || volcanoStage <= 0) return;
    soundEngine.playClick();
    onSetVolcanoStage!((volcanoStage - 1) as EruptionStage);
  };

  const handleVolcanoNext = () => {
    if (!isVolcano || volcanoStage === undefined || volcanoStage >= 6) return;
    soundEngine.playClick();
    onSetVolcanoStage!((volcanoStage + 1) as EruptionStage);
  };

  // Tsunami Stage Navigation Handlers
  const isTsunami = disasterId === 'TSUNAMI' && tsunamiStage !== undefined && onSetTsunamiStage;
  const currentTsunamiStageData = isTsunami ? TSUNAMI_STAGES[tsunamiStage!] : null;

  const handleTsunamiPrev = () => {
    if (!isTsunami || tsunamiStage === undefined || tsunamiStage <= 0) return;
    soundEngine.playClick();
    onSetTsunamiStage!((tsunamiStage - 1) as TsunamiStage);
  };

  const handleTsunamiNext = () => {
    if (!isTsunami || tsunamiStage === undefined || tsunamiStage >= 6) return;
    soundEngine.playClick();
    onSetTsunamiStage!((tsunamiStage + 1) as TsunamiStage);
  };

  // Flood Stage Navigation Handlers
  const isFlood = disasterId === 'FLOOD' && floodStage !== undefined && onSetFloodStage;
  const currentFloodStageData = isFlood ? FLOOD_STAGES[floodStage!] : null;

  const handleFloodPrev = () => {
    if (!isFlood || floodStage === undefined || floodStage <= 0) return;
    soundEngine.playClick();
    onSetFloodStage!((floodStage - 1) as FloodStage);
  };

  const handleFloodNext = () => {
    if (!isFlood || floodStage === undefined || floodStage >= 6) return;
    soundEngine.playClick();
    onSetFloodStage!((floodStage + 1) as FloodStage);
  };

  // Tornado Stage Navigation Handlers
  const isTornado = disasterId === 'TORNADO' && tornadoStage !== undefined && onSetTornadoStage;
  const currentTornadoStageData = isTornado ? TORNADO_STAGES[tornadoStage!] : null;

  const handleTornadoPrev = () => {
    if (!isTornado || tornadoStage === undefined || tornadoStage <= 0) return;
    soundEngine.playClick();
    onSetTornadoStage!((tornadoStage - 1) as TornadoStage);
  };

  const handleTornadoNext = () => {
    if (!isTornado || tornadoStage === undefined || tornadoStage >= 6) return;
    soundEngine.playClick();
    onSetTornadoStage!((tornadoStage + 1) as TornadoStage);
  };

  const activeStageData = isLandslide
    ? currentLandslideStageData
    : isEarthquake
    ? currentEarthquakeStageData
    : isVolcano 
    ? currentVolcanoStageData 
    : isTsunami 
    ? currentTsunamiStageData 
    : isFlood 
    ? currentFloodStageData 
    : isTornado
    ? currentTornadoStageData
    : null;

  const activeStageIndex = isLandslide
    ? landslideStage
    : isEarthquake
    ? earthquakeStage
    : isVolcano 
    ? volcanoStage 
    : isTsunami 
    ? tsunamiStage 
    : isFlood 
    ? floodStage 
    : isTornado
    ? tornadoStage
    : undefined;

  const stagesList = isLandslide
    ? LANDSLIDE_STAGES
    : isEarthquake
    ? EARTHQUAKE_STAGES
    : isVolcano 
    ? ERUPTION_STAGES 
    : isTsunami 
    ? TSUNAMI_STAGES 
    : isFlood 
    ? FLOOD_STAGES 
    : isTornado
    ? TORNADO_STAGES
    : [];

  const handleStagePrev = isLandslide
    ? handleLandslidePrev
    : isEarthquake
    ? handleEarthquakePrev
    : isVolcano 
    ? handleVolcanoPrev 
    : isTsunami 
    ? handleTsunamiPrev 
    : isFlood
    ? handleFloodPrev
    : handleTornadoPrev;

  const handleStageNext = isLandslide
    ? handleLandslideNext
    : isEarthquake
    ? handleEarthquakeNext
    : isVolcano 
    ? handleVolcanoNext 
    : isTsunami 
    ? handleTsunamiNext 
    : isFlood
    ? handleFloodNext
    : handleTornadoNext;

  const handleSetStage = isLandslide
    ? onSetLandslideStage
    : isEarthquake
    ? onSetEarthquakeStage
    : isVolcano 
    ? onSetVolcanoStage 
    : isTsunami 
    ? onSetTsunamiStage 
    : isFlood
    ? onSetFloodStage
    : onSetTornadoStage;

  return (
    <div className="absolute inset-0 pointer-events-none pt-16 px-3 pb-3 sm:pt-16 sm:px-4 sm:pb-4 z-30 overflow-hidden">
      
      {/* Top Bar HUD */}
      <div className="relative flex items-center justify-between gap-2 pointer-events-auto w-full min-h-[36px]">
        {/* Left Control Buttons */}
        <div className="flex items-center gap-1.5 z-10">
          <button
            onClick={() => {
              soundEngine.playClick();
              onExit();
            }}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700/80 backdrop-blur-md flex items-center gap-1.5 text-xs font-semibold transition-all shadow-md"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Menu Bencana
          </button>

          {/* Fixed 2D HUD Button: Tampilkan / Sembunyikan Proses (Cutaway / X-Ray) */}
          {onToggleCutaway && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onToggleCutaway();
              }}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm ${
                showCutaway
                  ? 'bg-amber-600 text-white border-amber-500 hover:bg-amber-500'
                  : 'bg-zinc-900/90 text-zinc-300 hover:text-white border-zinc-700 hover:bg-zinc-800'
              }`}
              title={showCutaway ? 'Sembunyikan visualisasi proses internal/cutaway 3D' : 'Tampilkan visualisasi proses internal/cutaway 3D'}
            >
              {showCutaway ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-amber-300" />
                  <span>Sembunyikan Proses</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Tampilkan Proses</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Hazard Level Badge (Perfect Center Alignment on Viewport) */}
        <div className="static md:absolute md:left-1/2 md:-translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-xl bg-zinc-950/90 border border-zinc-800 backdrop-blur-md shadow-md z-0 whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeStageData ? activeStageData.pvmbgColor : data.color }} />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              STATUS: <span style={{ color: activeStageData ? activeStageData.pvmbgColor : data.color }}>
                {activeStageData ? activeStageData.pvmbgLevel : scenario.hazardLevel}
              </span>
            </span>
          </div>
          <span className="text-zinc-700">|</span>
          <span className="text-[11px] font-bold text-white hidden sm:inline">{scenario.environmentName}</span>
        </div>

        {/* Simulation Controls (Right) */}
        <div className="flex items-center gap-1.5 z-10">
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenDetails();
            }}
            className="w-8 h-8 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 text-emerald-400 border border-zinc-700 backdrop-blur-md transition-colors shadow-sm flex items-center justify-center"
            title="Buka Materi Edukasi Lengkap"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* VOLCANO / TSUNAMI / FLOOD / EARTHQUAKE / LANDSLIDE PROCESS STAGE NAVIGATOR — Bottom Left Panel */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {(isVolcano || isTsunami || isFlood || isEarthquake || isLandslide || isTornado) && activeStageData && (
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 max-w-[calc(100%-1.5rem)] sm:max-w-[340px] z-30 pointer-events-auto">
          {isStageMinimized ? (
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsStageMinimized(false);
              }}
              className="px-3 py-2 rounded-xl bg-zinc-950/95 border border-zinc-800 text-white shadow-xl backdrop-blur-xl flex items-center gap-2 text-xs font-bold hover:border-emerald-500 transition-all cursor-pointer"
            >
              <div 
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: activeStageData.pvmbgColor }}
              />
              <span>Tahap {activeStageIndex !== undefined ? activeStageIndex + 1 : 1}: {activeStageData.title}</span>
              <Maximize2 className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          ) : (
            <div className="bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-xl backdrop-blur-xl overflow-hidden">
              
              {/* Stage Header with Status Badge */}
              <div className="p-3 sm:p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {/* Stage Icon */}
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ 
                        backgroundColor: `${activeStageData.pvmbgColor}20`, 
                        border: `1px solid ${activeStageData.pvmbgColor}60`
                      }}
                    >
                      {React.createElement(activeStageData.icon, { 
                        className: 'w-4 h-4',
                        style: { color: activeStageData.pvmbgColor }
                      })}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[9px] font-extrabold uppercase tracking-widest text-zinc-400">
                        Tahap {activeStageIndex !== undefined ? activeStageIndex + 1 : 1} dari 7
                      </div>
                      <div className="text-xs font-bold text-white leading-tight truncate">
                        {activeStageData.title}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Status Badge */}
                    <span 
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full border tracking-wide"
                      style={{
                        backgroundColor: `${activeStageData.pvmbgColor}20`,
                        borderColor: `${activeStageData.pvmbgColor}60`,
                        color: activeStageData.pvmbgColor
                      }}
                    >
                      {activeStageData.pvmbgLevel}
                    </span>

                    {/* Minimize Button */}
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        setIsStageMinimized(true);
                      }}
                      className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                      title="Sembunyikan Panel Tahap"
                    >
                      <Minimize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subtitle / Scientific explanation */}
                <div className="text-[10px] font-semibold text-zinc-400 mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: activeStageData.pvmbgColor }} />
                  <span className="truncate">{activeStageData.subtitle}</span>
                </div>

                {/* Description */}
                <p className="text-[11px] text-zinc-300 leading-relaxed bg-zinc-900 p-2.5 rounded-xl border border-zinc-800 mb-2">
                  {activeStageData.description}
                </p>

                {/* Visual Hint */}
                <div className="text-[10px] text-amber-300 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800 flex items-start gap-1.5">
                  <Sparkles className="w-3 h-3 shrink-0 text-amber-400 mt-0.5" />
                  <span className="leading-snug">{activeStageData.visualHint}</span>
                </div>
              </div>

              {/* Stage Stepper Progress Dots & Prev/Next Controls */}
              <div className="px-3 py-2 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between gap-1.5">
                
                {/* Previous Button */}
                <button
                  onClick={handleStagePrev}
                  disabled={activeStageIndex === undefined || activeStageIndex <= 0}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-[11px] font-bold text-zinc-300 hover:text-white border border-zinc-700 transition-all flex items-center gap-1 cursor-pointer"
                  title="Tahap Sebelumnya"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </button>

                {/* 7 Progress Stage Dots */}
                <div className="flex items-center gap-1">
                  {stagesList.map((stg, idx) => {
                    const isActive = idx === activeStageIndex;
                    const isPassed = activeStageIndex !== undefined && idx < activeStageIndex;
                    return (
                      <button
                        key={stg.id}
                        onClick={() => {
                          soundEngine.playClick();
                          if (handleSetStage) handleSetStage(idx as any);
                        }}
                        className={`transition-all duration-200 cursor-pointer rounded-full ${
                          isActive
                            ? 'w-4 h-1.5 rounded-full shadow-sm'
                            : isPassed
                            ? 'w-1.5 h-1.5 bg-zinc-500 hover:bg-zinc-400'
                            : 'w-1.5 h-1.5 bg-zinc-700 hover:bg-zinc-600'
                        }`}
                        style={isActive ? { backgroundColor: activeStageData.pvmbgColor } : {}}
                        title={`Pindah ke Tahap ${idx + 1}: ${stg.title}`}
                      />
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={handleStageNext}
                  disabled={activeStageIndex === undefined || activeStageIndex >= 6}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-[11px] font-bold text-zinc-300 hover:text-white border border-zinc-700 transition-all flex items-center gap-1 cursor-pointer"
                  title="Tahap Selanjutnya"
                >
                  <span className="hidden sm:inline">Selanjutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Floating Card Dock — Mission Questions Panel (right side) */}
      <div className={`absolute bottom-3 right-3 sm:bottom-4 sm:right-4 ${(isVolcano || isTsunami || isFlood || isEarthquake || isLandslide || isTornado) ? 'w-[calc(50%-1rem)] sm:w-auto sm:max-w-xs' : 'w-[calc(100%-1.5rem)] sm:w-auto sm:max-w-sm'} z-30 pointer-events-auto`}>
        
        {/* Minimized Pill Bar */}
        {isMinimized ? (
          <div 
            onClick={() => {
              soundEngine.playClick();
              setIsMinimized(false);
            }}
            className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-emerald-500 rounded-xl px-3 py-2 shadow-xl backdrop-blur-xl cursor-pointer flex items-center gap-2.5 text-white transition-all group animate-in fade-in"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <div>
                <div className="text-[9px] uppercase font-bold text-emerald-400 tracking-wider">Misi Berlangsung</div>
                <div className="text-[11px] font-bold text-zinc-200 group-hover:text-white truncate max-w-[180px] sm:max-w-[220px]">
                  {scenario.title}
                </div>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all flex items-center justify-center shrink-0" title="Buka Pertanyaan">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>
        ) : showBriefing ? (
          /* Initial Briefing Dialog - Compact & Non-Intrusive */
          <div className="bg-zinc-950/90 border border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 max-h-[75vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <AlertOctagon className="w-4 h-4" />
                <span>Skenario Tanggap Darurat</span>
              </div>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsMinimized(true);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Minimalkan panel untuk melihat 3D penuh"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-lg sm:text-xl font-black text-white mb-2 leading-snug">{scenario.title}</h3>
            
            <p className="text-xs text-slate-300 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 mb-3 leading-relaxed">
              {scenario.briefing}
            </p>
            
            <div className="text-[11px] font-semibold text-amber-300 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Misi: {scenario.objective}</span>
            </div>

            {/* Volcano, Tsunami, Flood, Earthquake & Landslide specific hint */}
            {(isVolcano || isTsunami || isFlood || isEarthquake || isLandslide) && (
              <div className="text-[11px] text-emerald-300/80 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/20 mb-4 flex items-start gap-2">
                <Waves className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>Gunakan panel <strong>Tahap Bencana</strong> di kiri bawah untuk melihat proses terjadinya bencana secara bertahap.</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsMinimized(true);
                }}
                className="px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-slate-300 text-xs font-bold border border-zinc-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Lihat Lingkungan 3D</span>
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowBriefing(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Mulai Pertanyaan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : isCompleted ? (
          /* Completion Card */
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl text-center animate-in fade-in">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-emerald-500 flex items-center justify-center mx-auto mb-3 text-emerald-400 shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-white mb-1">Simulasi Selesai!</h3>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Respon tanggap darurat Anda untuk bencana {data.indonesianName} telah dievaluasi dengan baik.
            </p>
            <div className="flex gap-2.5 justify-center">
              <button
                onClick={handleRestart}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-zinc-800"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Ulangi
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onExit();
                }}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30"
              >
                Pilih Modul Lain
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-950/95 border border-zinc-800 rounded-2xl p-3.5 sm:p-4 shadow-xl backdrop-blur-xl max-h-[75vh] overflow-y-auto custom-scrollbar">
            {/* Step Question & Action Options */}
            <div className="flex items-center justify-between mb-1.5 text-xs font-semibold text-zinc-400">
              <span className="text-emerald-400 font-mono text-[10px]">LANGKAH {currentStepIndex + 1} DARI {scenario.steps.length}</span>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsMinimized(true);
                }}
                className="p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-[10px]"
                title="Minimalkan pertanyaan untuk melihat objek 3D"
              >
                <Minimize2 className="w-3 h-3" />
                <span>Sembunyikan</span>
              </button>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-white mb-2.5 leading-snug">
              {currentStep.instruction}
            </h4>

            {/* Option Buttons */}
            <div className="space-y-1.5 mb-2.5">
              {currentStep.options.map((option) => {
                const isSelected = selectedOptionId === option.id;
                const showValidation = selectedOptionId !== null;

                let btnStyle = 'border-zinc-800 bg-zinc-900 text-zinc-200 hover:bg-zinc-800';
                if (showValidation) {
                  if (option.isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-950 text-white';
                  } else if (isSelected) {
                    btnStyle = 'border-rose-500 bg-rose-950 text-white';
                  } else {
                    btnStyle = 'border-zinc-900 bg-zinc-950 text-zinc-600 opacity-60';
                  }
                }

                return (
                  <button
                    key={option.id}
                    disabled={selectedOptionId !== null}
                    onClick={() => handleSelectOption(option)}
                    className={`w-full p-2 rounded-xl border text-left text-[11px] font-medium transition-all flex items-start gap-2 ${btnStyle}`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-bold">
                      {isSelected ? (option.isCorrect ? '✓' : '✕') : '•'}
                    </span>
                    <span className="leading-snug">{option.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback Banner upon answering */}
            {selectedOption && (
              <div className={`p-2.5 rounded-xl border mb-2.5 animate-in fade-in flex items-start gap-2 ${
                selectedOption.isCorrect 
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-200' 
                  : 'bg-rose-950 border-rose-500 text-rose-200'
              }`}>
                {selectedOption.isCorrect ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-[10px] font-bold mb-0.5">
                    {selectedOption.isCorrect ? 'Keputusan Tepat! (+50 XP)' : 'Peringatan Bahaya!'}
                  </div>
                  <p className="text-[10px] leading-relaxed text-zinc-300">
                    {selectedOption.feedback}
                  </p>
                </div>
              </div>
            )}

            {/* Next / Continue Button */}
            {selectedOptionId && (
              <button
                onClick={handleNextStep}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <span>{currentStepIndex + 1 < scenario.steps.length ? 'Lanjut Langkah Berikutnya' : 'Selesaikan Simulasi'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Center Navigation Helper */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none hidden sm:block">
        <span className="text-[10px] text-slate-400 bg-slate-950/75 px-3 py-1 rounded-full border border-slate-800/80 backdrop-blur-md">
          Klik & seret mouse untuk memutar kamera 3D • Scroll untuk zoom
        </span>
      </div>
    </div>
  );
};
