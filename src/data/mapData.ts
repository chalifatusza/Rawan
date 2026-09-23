import { MapMarker } from '../types/disaster';

export interface BmkgEarthquakeData {
  tanggal: string;
  jam: string;
  dateTime: string;
  coordinates: string;
  lat: number;
  lng: number;
  magnitude: string;
  depth: string;
  wilayah: string;
  potensi: string;
  dirasakan?: string;
  shakemap?: string;
}

export const INDONESIA_MAP_MARKERS: MapMarker[] = [
  // ==========================================
  // ZONA MEGATHRUST RESMI PUSGEN BMKG (13 Segmen Utama)
  // ==========================================
  {
    id: 'sub_aceh_andaman',
    title: 'Zona Megathrust Aceh - Andaman',
    type: 'subduction',
    location: 'Lepas Pantai Barat Aceh hingga Kepulauan Andaman',
    lat: 4.8,
    lng: 93.5,
    description: 'Segmen utara subduksi Sumatra yang memicu Gempa & Tsunami Aceh M 9.1+ pada tahun 2004.',
    riskLevel: 'Ekstrem',
    details: 'Diidentifikasi oleh PUSGEN & BMKG sebagai salah satu pemicu tsunami terbesar dalam sejarah peradaban modern.'
  },
  {
    id: 'sub_nias_simeulue',
    title: 'Zona Megathrust Nias - Simeulue',
    type: 'subduction',
    location: 'Lepas Pantai Nias, Simeulue, Sumatera Utara',
    lat: 1.5,
    lng: 96.8,
    description: 'Segmen subduksi aktif yang memicu Gempa Nias M 8.7 pada tahun 2005.',
    riskLevel: 'Ekstrem',
    details: 'Dipantau ketat oleh jaringan seismograf BMKG TEWS & GPS kontinu BIG.'
  },
  {
    id: 'sub_sunda',
    title: 'Zona Megathrust Mentawai - Selat Sunda',
    type: 'subduction',
    location: 'Lepas Pantai Barat Sumatra (Siberut, Pagai, Enggano) hingga Selat Sunda',
    lat: -4.5,
    lng: 101.5,
    description: 'Zona penunjaman Lempeng Indo-Australia di bawah Lempeng Eurasia. PUSGEN BMKG mencatat zona ini sebagai Seismic Gap dengan potensi Magnitudo hingga M 8.9+.',
    riskLevel: 'Ekstrem',
    details: 'Sumber utama pemicu gempa bumi megathrust dan gelombang tsunami dahsyat di pesisir barat Sumatra dan Selat Sunda.'
  },
  {
    id: 'sub_jawa_barat',
    title: 'Zona Megathrust Jawa Barat - Jawa Tengah',
    type: 'subduction',
    location: 'Lepas Pantai Selatan Jawa Barat hingga Cilacap Jawa Tengah',
    lat: -8.5,
    lng: 107.5,
    description: 'Sabuk subduksi aktif di Samudra Hindia selatan Jawa Barat yang menyimpan akumulasi energi besar.',
    riskLevel: 'Ekstrem',
    details: 'Pernah memicu Tsunami Pangandaran 2006 (M 7.7). Dipantau oleh sensor buoy DART & Tide Gauge BMKG.'
  },
  {
    id: 'sub_jawa_timur',
    title: 'Zona Megathrust Jawa Timur',
    type: 'subduction',
    location: 'Lepas Pantai Selatan Pacitan, Trenggalek, Malang, hingga Banyuwangi',
    lat: -9.5,
    lng: 112.5,
    description: 'Segmen subduksi selatan Jawa Timur dengan potensi magnitudo maks M 8.8+.',
    riskLevel: 'Ekstrem',
    details: 'Pernah memicu Tsunami Banyuwangi 1994 (M 7.8). BMKG memasang sistem Sirine Peringatan Dini Tsunami di sepanjang pesisir.'
  },
  {
    id: 'sub_bali_ntb',
    title: 'Zona Megathrust Bali, NTB, & NTT',
    type: 'subduction',
    location: 'Lepas Pantai Selatan Bali, Lombok, Sumbawa, Sumba, hingga Timor',
    lat: -10.2,
    lng: 118.5,
    description: 'Penunjaman lempeng samudra di selatan Kepulauan Nusa Tenggara yang membentang hingga Palung Sumba.',
    riskLevel: 'Ekstrem',
    details: 'Pemicu gempa tektonik dangkal & menengah berskala M 7.0+ di kawasan Nusa Tenggara.'
  },
  {
    id: 'sub_sulut',
    title: 'Zona Subduksi Minahasa / Laut Sulawesi',
    type: 'subduction',
    location: 'Laut Sulawesi - Semenanjung Utara Sulawesi & Kep. Sangihe',
    lat: 2.8,
    lng: 122.5,
    description: 'Zona penunjaman Lempeng Laut Sulawesi di bawah Semenanjung Minahasa.',
    riskLevel: 'Ekstrem',
    details: 'Pemicu rangkaian gempa bumi tektonik berpotensi tsunami di pesisir Manado, Gorontalo, dan Buol.'
  },
  {
    id: 'sub_banda',
    title: 'Zona Subduksi Busur Banda & Maluku',
    type: 'subduction',
    location: 'Laut Banda, Halmahera, & Kepulauan Maluku',
    lat: -5.2,
    lng: 129.5,
    description: 'Kompleksitas tektonik paling rumit di dunia tempat ditemukannya struktur palung laut dalam dan sesar naik Busur Banda.',
    riskLevel: 'Ekstrem',
    details: 'Sering memicu gempa bumi dalam berskala besar (M 7.5+) yang guncangannya terasa hingga Australia bagian utara.'
  },
  {
    id: 'sub_papua',
    title: 'Palung New Guinea & Sesar Tarera-Aiduna',
    type: 'subduction',
    location: 'Utara Teluk Cenderawasih & Pesisir Utara Papua',
    lat: -1.8,
    lng: 137.5,
    description: 'Zona benturan tektonik aktif antara Lempeng Pasifik/Laut Caroline dan lempeng mikro benua Papua.',
    riskLevel: 'Tinggi',
    details: 'Memiliki laju pergeseran tinggi yang memicu rangkaian gempa bumi tektonik dangkal di pesisir Jayapura & Biak.'
  },

  // ==========================================
  // SESAR AKTIF DARAT RESMI PUSGEN & BMKG
  // ==========================================
  {
    id: 'fault_semangko',
    title: 'Sesar Besar Sumatra (Great Sumatran Fault - 19 Segmen)',
    type: 'fault',
    location: 'Membentang 1.900 km sepanjang Pegunungan Bukit Barisan dari Banda Aceh ke Teluk Semangko',
    lat: -2.5,
    lng: 101.5,
    description: 'Patahan geser dextral raksasa yang terbagi menjadi 19 segmen aktif (Seulimeum, Aceh, Tripa, Renun, Toru, Angkola, Sianok, Sumani, Suliti, Siulak, Musi, Semangko).',
    riskLevel: 'Ekstrem',
    details: 'Memiliki laju geser 10-27 mm/tahun dan riwayat gempa merusak tinggi seperti Gempa Tarutung, Gempa Solok, dan Gempa Padang Panjang.'
  },
  {
    id: 'fault_baribis',
    title: 'Sesar Baribis - Kendeng Arc',
    type: 'fault',
    location: 'Purwakarta, Subang, Majalengka, Cirebon, hingga Semarang & Kendeng Jatim',
    lat: -6.65,
    lng: 108.15,
    description: 'Patahan naik aktif yang membentang di bagian utara Pulau Jawa melintasi kawasan padat penduduk Jawa Barat hingga Jawa Timur.',
    riskLevel: 'Ekstrem',
    details: 'Studi BMKG & PUSGEN mengidentifikasi segmen Jakarta-Bekasi-Purwakarta aktif bergerak dengan potensi M 6.5+.'
  },
  {
    id: 'fault_lembang',
    title: 'Sesar Lembang',
    type: 'fault',
    location: 'Bandung Utara, Jawa Barat',
    lat: -6.82,
    lng: 107.61,
    description: 'Patahan aktif sepanjang 29 km dengan laju geser 3-6 mm/tahun membentang dari Padalarang hingga Gunung Manglayang.',
    riskLevel: 'Tinggi',
    details: 'BMKG memasang 6 stasiun seismograf rapat untuk memantau aktivitas mikro-seismik sesar yang mengancam kawasan Cekungan Bandung.'
  },
  {
    id: 'fault_garsela',
    title: 'Sesar Garsela (Garut Selatan)',
    type: 'fault',
    location: 'Kabupaten Garut & Bandung Selatan, Jawa Barat',
    lat: -7.25,
    lng: 107.75,
    description: 'Sesar aktif dengan 2 struktur segmen utama (Segmen Rakutai & Segmen Kencana) yang sering memicu gempa dangkal beruntun (earthquake swarm).',
    riskLevel: 'Tinggi',
    details: 'Meskipun magnitudo relatif sedang (M 4.0 - 5.2), hiposenternya yang sangat dangkal (<10 km) menimbulkan guncangan destruktif lokal.'
  },
  {
    id: 'fault_opak',
    title: 'Sesar Opak Yogyakarta',
    type: 'fault',
    location: 'Bantul & Sleman, D.I. Yogyakarta',
    lat: -7.88,
    lng: 110.42,
    description: 'Sesar aktif yang membentang dari muara Sungai Opak hingga Prambanan, memicu Gempa Bantul M 6.3 pada tahun 2006.',
    riskLevel: 'Tinggi',
    details: 'Guncangan gempanya sangat merusak akibat tanah endapan aluvium vulkanik muda yang melipatgandakan gelombang seismik.'
  },
  {
    id: 'fault_flores_thrust',
    title: 'Sesar Naik Flores (Flores Back-Arc Thrust)',
    type: 'fault',
    location: 'Lepas Pantai Utara Bali, Lombok, Sumbawa, hingga Flores',
    lat: -7.95,
    lng: 117.8,
    description: 'Sesar naik raksasa di Laut Flores yang memicu rangkaian Gempa Lombok M 7.0 (2018) dan Gempa & Tsunami Flores 1992 (M 7.8).',
    riskLevel: 'Ekstrem',
    details: 'Merupakan sumber gempa utama di perairan utara Kepulauan Nusa Tenggara yang dipantau ketat oleh BMKG.'
  },
  {
    id: 'fault_palukoro',
    title: 'Sesar Geser Palu-Koro & Sesar Matano',
    type: 'fault',
    location: 'Teluk Palu - Lembah Koro - Danau Matano, Sulawesi Tengah & Selatan',
    lat: -1.5,
    lng: 120.2,
    description: 'Sesar geser aktif berkecapatan tinggi 35-45 mm/tahun yang memicu Gempa M 7.4 dan likuefaksi dahsyat Palu 2018.',
    riskLevel: 'Ekstrem',
    details: 'Salah satu patahan darat teraktif dan paling berbahaya di Asia Tenggara menurut penelitian BMKG & BRIN.'
  },
  {
    id: 'fault_sorong',
    title: 'Sesar Sorong',
    type: 'fault',
    location: 'Membentang dari Kepala Burung Papua, Laut Halmahera, hingga Sulawesi Tengah',
    lat: -1.2,
    lng: 131.5,
    description: 'Sesar geser sinistral terbesar di kawasan timur Indonesia yang memotong struktur geologi Maluku Utara dan Papua.',
    riskLevel: 'Ekstrem',
    details: 'Memiliki laju pergeseran 32 mm/tahun yang mengendalikan aktivitas tektonik regional Papua-Maluku.'
  },

  // ==========================================
  // GUNUNG API AKTIF MAGMA INDONESIA / PVMBG
  // ==========================================

  // --- SUMATRA ---
  {
    id: 'vol_sinabung',
    title: 'Gunung Sinabung (2.460 mdpl)',
    type: 'volcano',
    location: 'Kabupaten Karo, Sumatera Utara',
    lat: 3.17,
    lng: 98.39,
    description: 'Gunung api aktif tipe strato yang bangun dari tidur panjang 400 tahun sejak 2010 dan sering melontarkan awan panas guguran.',
    riskLevel: 'Tinggi',
    details: 'Status PVMBG menetapkan Zona Merah Bahaya pada radius 3-5 km dari kawah aktif.'
  },
  {
    id: 'vol_marapi_sumbar',
    title: 'Gunung Marapi (2.891 mdpl)',
    type: 'volcano',
    location: 'Agam & Tanah Datar, Sumatera Barat',
    lat: -0.38,
    lng: 100.47,
    description: 'Gunung api teraktif di Pulau Sumatra yang sering mengalami erupsi freatik tiba-tiba tanpa sinyal seismik awal yang jelas.',
    riskLevel: 'Sangat Tinggi',
    details: 'Status PVMBG Level III (SIAGA) dengan radius rekomendasi aman 4.5 km dari Kawah Verbeek.'
  },
  {
    id: 'vol_kerinci',
    title: 'Gunung Kerinci (3.805 mdpl)',
    type: 'volcano',
    location: 'Kerinci (Jambi) & Solok Selatan (Sumbar)',
    lat: -1.69,
    lng: 101.26,
    description: 'Gunung api tertinggi di Indonesia dan puncak tertinggi di Sumatra dengan kawah aktif sedalam 600 meter.',
    riskLevel: 'Tinggi',
    details: 'PVMBG memantau rutin gumpalan asap kolom abu vulkanik hitam yang mengarah ke jalur penerbangan darurat.'
  },
  {
    id: 'vol_dempo',
    title: 'Gunung Dempo (3.173 mdpl)',
    type: 'volcano',
    location: 'Kota Pagar Alam, Sumatera Selatan',
    lat: -3.11,
    lng: 103.13,
    description: 'Gunung api aktif yang memiliki danau kawah bercorak hijau toska dengan riwayat erupsi freatik periodik.',
    riskLevel: 'Tinggi',
    details: 'Status PVMBG Level II (WASPADA). Dilarang mendekati danau kawah dalam radius 1 km.'
  },
  {
    id: 'vol_talang',
    title: 'Gunung Talang (2.597 mdpl)',
    type: 'volcano',
    location: 'Kabupaten Solok, Sumatera Barat',
    lat: -0.97,
    lng: 100.67,
    description: 'Gunung api aktif yang dikelilingi danau kembar (Danau Diatas & Danau Dibawah) dengan sistem kawah celah (fissure).',
    riskLevel: 'Tinggi',
    details: 'Dipantau oleh pos pengamatan PVMBG Kampung Batu Dalam.'
  },
  {
    id: 'vol_kaba',
    title: 'Gunung Kaba (1.935 mdpl)',
    type: 'volcano',
    location: 'Rejang Lebong, Bengkulu',
    lat: -3.52,
    lng: 102.62,
    description: 'Gunung api dengan kompleks kawah ganda aktif yang memancarkan solfatara dan fumarola kuat.',
    riskLevel: 'Tinggi',
    details: 'PVMBG mengimbau pengunjung untuk tidak menginap di tepi kawah aktif.'
  },

  // --- JAWA & SELAT SUNDA ---
  {
    id: 'vol_krakatau',
    title: 'Gunung Anak Krakatau (157 mdpl)',
    type: 'volcano',
    location: 'Selat Sunda (Lampung - Banten)',
    lat: -6.10,
    lng: 105.42,
    description: 'Gunung api kaldera laut aktif. Runtuhan tubuh baratnya pada 22 Desember 2018 memicu tsunami dahsyat Selat Sunda.',
    riskLevel: 'Sangat Tinggi',
    details: 'Dipantau sistem peringatan dini tsunami BMKG TEWS & PVMBG dengan radius aman 5 km.'
  },
  {
    id: 'vol_gede',
    title: 'Gunung Gede (2.958 mdpl)',
    type: 'volcano',
    location: 'Cianjur, Sukabumi, Bogor (Jawa Barat)',
    lat: -6.78,
    lng: 106.98,
    description: 'Gunung api stratovulkano dekat kawasan metropolitan Jabodetabek yang memiliki Kawah Ratu aktif.',
    riskLevel: 'Tinggi',
    details: 'Dipantau pos PVMBG Gedepahala terhadap peningkatan kegempaan vulkanik dalam.'
  },
  {
    id: 'vol_salak',
    title: 'Gunung Salak (2.211 mdpl)',
    type: 'volcano',
    location: 'Bogor & Sukabumi, Jawa Barat',
    lat: -6.72,
    lng: 106.73,
    description: 'Gunung api tua dengan Kawah Ratu yang memancarkan gas beracun (CO2/H2S) berkonsentrasi tinggi.',
    riskLevel: 'Tinggi',
    details: 'PVMBG memperingatkan bahaya gas beracun tidak berbau di celah kawah saat cuaca mendung.'
  },
  {
    id: 'vol_tangkubanparahu',
    title: 'Gunung Tangkuban Parahu (2.084 mdpl)',
    type: 'volcano',
    location: 'Subang & Bandung Barat, Jawa Barat',
    lat: -6.77,
    lng: 107.60,
    description: 'Gunung api berbentuk perahu terbalik dengan Kawah Ratu & Kawah Upas yang sering erupsi phreatik mendadak.',
    riskLevel: 'Tinggi',
    details: 'Status PVMBG Level II (WASPADA). Evaluasi semburan lumpur dan gas vulkanik rutin.'
  },
  {
    id: 'vol_papandayan',
    title: 'Gunung Papandayan (2.665 mdpl)',
    type: 'volcano',
    location: 'Kabupaten Garut, Jawa Barat',
    lat: -7.32,
    lng: 107.73,
    description: 'Gunung api dengan kompleks kawah terbuka unik (Kawah Mas, Kawah Baru) dan ladang gas belerang luas.',
    riskLevel: 'Tinggi',
    details: 'Dipantau ketat PVMBG pos Cisurupan terhadap potensi longsoran dinding kawah.'
  },
  {
    id: 'vol_slamet',
    title: 'Gunung Slamet (3.428 mdpl)',
    type: 'volcano',
    location: 'Pemalang, Banyumas, Brebes, Tegal, Purbalingga (Jateng)',
    lat: -7.24,
    lng: 109.20,
    description: 'Gunung api tertinggi di Jawa Tengah dengan tipe erupsi strombolian yang menghasilkan dentuman kuat.',
    riskLevel: 'Sangat Tinggi',
    details: 'Status PVMBG Level II (WASPADA). Radius aman 2 km dari kawah puncak.'
  },
  {
    id: 'vol_dieng',
    title: 'Kompleks Gunung Api Dieng',
    type: 'volcano',
    location: 'Wonosobo & Banjarnegara, Jawa Tengah',
    lat: -7.20,
    lng: 109.91,
    description: 'Dataran tinggi vulkanik aktif dengan ancaman semburan gas racun CO2 (Kawah Timbang) dan erupsi lumpur (Kawah Sileri).',
    riskLevel: 'Sangat Tinggi',
    details: 'PVMBG memasang stasiun pemantau konsentrasi gas racun otomatis 24 jam.'
  },
  {
    id: 'vol_merapi',
    title: 'Gunung Merapi (2.930 mdpl)',
    type: 'volcano',
    location: 'Sleman (DIY), Magelang, Boyolali, Klaten (Jateng)',
    lat: -7.54,
    lng: 110.44,
    description: 'Gunung api teraktif di Pulau Jawa dengan kubah lava aktif dan awan panas guguran (Wedhus Gembel).',
    riskLevel: 'Ekstrem',
    details: 'Status PVMBG Level III (SIAGA). Pemantauan BPPTKG 24 jam dengan seismometer dan tiltmeter.'
  },
  {
    id: 'vol_kelud',
    title: 'Gunung Kelud (1.731 mdpl)',
    type: 'volcano',
    location: 'Kediri, Blitar, Malang (Jawa Timur)',
    lat: -7.93,
    lng: 112.30,
    description: 'Gunung api sangat berbahaya dengan riwayat letusan eksplosif dahsyat 2014 yang melontarkan abu sejauh 500 km.',
    riskLevel: 'Sangat Tinggi',
    details: 'Sistem saluran terowongan Ampera dibuat untuk mengontrol volume air danau kawah.'
  },
  {
    id: 'vol_bromo',
    title: 'Gunung Bromo (2.329 mdpl)',
    type: 'volcano',
    location: 'Probolinggo, Pasuruan, Malang, Lumajang (Jatim)',
    lat: -7.94,
    lng: 112.95,
    description: 'Gunung api aktif di tengah Kaldera Tengger dengan semburan asap belerang terus-menerus.',
    riskLevel: 'Tinggi',
    details: 'Status PVMBG Level II (WASPADA). Dilarang mendekati bibir kawah dalam radius 1 km.'
  },
  {
    id: 'vol_semeru',
    title: 'Gunung Semeru (Mahameru 3.676 mdpl)',
    type: 'volcano',
    location: 'Lumajang & Malang, Jawa Timur',
    lat: -8.11,
    lng: 112.92,
    description: 'Atap pulau Jawa yang sering mengalami erupsi vulkanian dengan ancaman awan panas guguran melintasi Besuk Kobokan.',
    riskLevel: 'Ekstrem',
    details: 'Status PVMBG Level III (SIAGA) dengan rekomendasi jarak aman 13 km di sektor tenggara.'
  },
  {
    id: 'vol_raung',
    title: 'Gunung Raung (3.332 mdpl)',
    type: 'volcano',
    location: 'Banyuwangi, Bondowoso, Jember (Jawa Timur)',
    lat: -8.12,
    lng: 114.04,
    description: 'Gunung api dengan kaldera terbesar kedua di Indonesia (diameter 2 km) dan suara gemuruh strombolian yang khas.',
    riskLevel: 'Tinggi',
    details: 'Sering mengganggu penerbangan di Bandara Banyuwangi & Bali saat erupsi abu.'
  },
  {
    id: 'vol_ijen',
    title: 'Gunung Ijen (2.769 mdpl)',
    type: 'volcano',
    location: 'Banyuwangi & Bondowoso, Jawa Timur',
    lat: -8.05,
    lng: 114.24,
    description: 'Gunung api terkenal dengan danau asam terbesar di dunia dan fenomena api biru (Blue Fire) Kawah Ijen.',
    riskLevel: 'Tinggi',
    details: 'PVMBG memantau ketat suhu danau kawah dan pelepasan gas asam sulfat.'
  },

  // --- BALI & NUSA TENGGARA ---
  {
    id: 'vol_agung',
    title: 'Gunung Agung (3.031 mdpl)',
    type: 'volcano',
    location: 'Kabupaten Karangasem, Bali',
    lat: -8.34,
    lng: 115.50,
    description: 'Atap Pulau Bali yang mengalami erupsi magmatik eksplosif besar pada tahun 2017-2019.',
    riskLevel: 'Sangat Tinggi',
    details: 'Status PVMBG Level I (NORMAL/WASPADA). Dipantau pos Rendang Karangasem.'
  },
  {
    id: 'vol_batur',
    title: 'Gunung Batur (1.717 mdpl)',
    type: 'volcano',
    location: 'Bangli, Bali',
    lat: -8.24,
    lng: 115.37,
    description: 'Gunung api di dalam kaldera ganda purba yang indah dengan danau kawah Batur.',
    riskLevel: 'Tinggi',
    details: 'Dipantau pos PVMBG Kintamani terhadap aktivitas letusan basaltik.'
  },
  {
    id: 'vol_rinjani',
    title: 'Gunung Rinjani & Gunung Barujari (3.726 mdpl)',
    type: 'volcano',
    location: 'Lombok Utara, Nusa Tenggara Barat',
    lat: -8.41,
    lng: 116.46,
    description: 'Gunung api megah di Pulau Lombok dengan anak gunung aktif Barujari di tengah Danau Segara Anak.',
    riskLevel: 'Sangat Tinggi',
    details: 'Erupsi Barujari dapat memicu banjir bandang lahar di danau kaldera Segara Anak.'
  },
  {
    id: 'vol_tambora',
    title: 'Gunung Tambora (2.850 mdpl)',
    type: 'volcano',
    location: 'Sumbawa & Dompu, Nusa Tenggara Barat',
    lat: -8.25,
    lng: 118.00,
    description: 'Gunung api pemicu letusan terhebat dalam sejarah modern manusia pada tahun 1815 (VEI 7) yang mengubah iklim dunia.',
    riskLevel: 'Sangat Tinggi',
    details: 'Memiliki kaldera raksasa sedalam 1.100 meter yang dipantau PVMBG.'
  },
  {
    id: 'vol_lewotobi',
    title: 'Gunung Lewotobi Laki-laki (1.584 mdpl)',
    type: 'volcano',
    location: 'Flores Timur, Nusa Tenggara Timur',
    lat: -8.53,
    lng: 122.78,
    description: 'Gunung api kembar Flores yang mengalami peningkatan erupsi dahsyat pada 2024 dengan gumpalan abu melambung 10 km.',
    riskLevel: 'Ekstrem',
    details: 'Status PVMBG Level IV (AWAS) dengan rekomendasi zona bahaya 7 km dari pusat kawah.'
  },
  {
    id: 'vol_iya',
    title: 'Gunung Iya (637 mdpl)',
    type: 'volcano',
    location: 'Kabupaten Ende, Nusa Tenggara Timur',
    lat: -8.88,
    lng: 121.64,
    description: 'Gunung api semenanjung di pantai selatan Flores yang mengalami peningkatan kegempaan signifikan pada 2024.',
    riskLevel: 'Sangat Tinggi',
    details: 'Status PVMBG Level III (SIAGA). Berpotensi memicu reruntuhan kawah ke laut.'
  },

  // --- SULAWESI & NORTH MALUKU ---
  {
    id: 'vol_ruang',
    title: 'Gunung Ruang (725 mdpl)',
    type: 'volcano',
    location: 'Kabupaten Kepulauan Sitaro, Sulawesi Utara',
    lat: 2.30,
    lng: 125.37,
    description: 'Gunung api pulau yang mengalami erupsi eksplosif paroksisma pada April 2024 hingga memicu petir vulkanik & ancaman tsunami laut.',
    riskLevel: 'Ekstrem',
    details: 'Status PVMBG menetapkan evakuasi total seluruh penduduk Pulau Ruang & pesisir Tagulandang.'
  },
  {
    id: 'vol_karangetang',
    title: 'Gunung Karangetang (1.784 mdpl)',
    type: 'volcano',
    location: 'Pulau Siau, Kepulauan Sitaro, Sulawesi Utara',
    lat: 2.78,
    lng: 125.40,
    description: 'Salah satu gunung api teraktif di Indonesia yang hampir tanpa henti meluncurkan lava pijar malam hari.',
    riskLevel: 'Sangat Tinggi',
    details: 'Status PVMBG Level III (SIAGA) dengan guguran lava pijar mengarah ke Kali Batang & Kiting.'
  },
  {
    id: 'vol_lokon',
    title: 'Gunung Lokon (1.580 mdpl)',
    type: 'volcano',
    location: 'Kota Tomohon, Sulawesi Utara',
    lat: 1.35,
    lng: 124.79,
    description: 'Gunung api dengan kawah aktif Tompaluan di celah antara Gunung Lokon dan Gunung Empung.',
    riskLevel: 'Tinggi',
    details: 'PVMBG memasang seismometer otomatis untuk memantau gempa vulkanik dangkal.'
  },
  {
    id: 'vol_ibu',
    title: 'Gunung Ibu (1.340 mdpl)',
    type: 'volcano',
    location: 'Halmahera Barat, Maluku Utara',
    lat: 1.48,
    lng: 127.63,
    description: 'Gunung api di Maluku Utara yang mengalami erupsi kontinu dengan lontaran abu vulkanik tinggi hingga 4.000 meter.',
    riskLevel: 'Ekstrem',
    details: 'Status PVMBG Level IV (AWAS) dengan zona steril 4 km dan sektoral 7 km ke arah pembukaan kawah.'
  },
  {
    id: 'vol_dukono',
    title: 'Gunung Dukono (1.335 mdpl)',
    type: 'volcano',
    location: 'Halmahera Utara, Maluku Utara',
    lat: 1.68,
    lng: 127.88,
    description: 'Gunung api yang meletus secara terus-menerus sejak 1933 dengan kolom abu tebal melintasi Tobelo.',
    riskLevel: 'Sangat Tinggi',
    details: 'Status PVMBG Level II (WASPADA). Masyarakat diimbau selalu menggunakan masker anti-abu.'
  },
  {
    id: 'vol_gamalama',
    title: 'Gunung Gamalama (1.715 mdpl)',
    type: 'volcano',
    location: 'Pulau Ternate, Maluku Utara',
    lat: 0.80,
    lng: 127.33,
    description: 'Gunung api pulau yang membentuk seluruh wilayah Pulau Ternate dengan riwayat erupsi freatik merusak.',
    riskLevel: 'Tinggi',
    details: 'Dipantau pos PVMBG Ternate 24 jam nonstop.'
  }
];

