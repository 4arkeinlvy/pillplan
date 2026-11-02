/** Indonesian text. Same keys as English; TypeScript refuses a missing one. */
import type { Strings } from './en';

const list = (items: readonly string[]): string =>
  items.length <= 1
    ? (items[0] ?? '')
    : `${items.slice(0, -1).join(', ')} dan ${items[items.length - 1] ?? ''}`;

export const id: Strings = {
  locale: 'id-ID',
  language: { label: 'Bahasa', en: 'English', id: 'Bahasa Indonesia' },
  formNames: {
    tablet: ['tablet', 'tablet'],
    capsule: ['kapsul', 'kapsul'],
    mL: ['mL', 'mL'],
    puff: ['semprot', 'semprot'],
    drop: ['tetes', 'tetes'],
  },
  example: {
    patient: 'Contoh pasien',
    purposes: {
      metformin: 'untuk diabetes',
      amlodipine: 'untuk tekanan darah',
      simvastatin: 'untuk kolesterol',
      paracetamol: 'untuk nyeri',
    },
  },
  app: {
    name: 'PillPlan',
    tagline: 'Ubah daftar obat menjadi jadwal yang jelas dan mudah diikuti pasien.',
    counsel: 'Mode konseling',
    print: 'Cetak jadwal',
    example: 'Coba contoh pasien',
    repo: 'Kode sumber dan dokumentasi',
    disclaimer:
      'PillPlan membantu orang mengingat cara minum obat. PillPlan tidak menggantikan saran dokter atau apoteker.',
    dataNote:
      'Data obat awal berasal dari label FDA Amerika Serikat. Periksa dengan formularium Anda sebelum dipakai sungguhan.',
    privacy: 'Semua data tetap di browser ini. Tidak ada yang diunggah.',
  },
  slots: {
    morning: 'Pagi',
    noon: 'Siang',
    evening: 'Malam',
    bedtime: 'Sebelum tidur',
  },
  whenNeeded: 'Bila perlu',
  food: {
    before: 'Sebelum makan',
    with_after: 'Saat atau sesudah makan',
    any: 'Dengan atau tanpa makan',
  },
  foodLong: {
    before: 'Minum sebelum makan, saat perut kosong.',
    with_after: 'Minum saat makan atau sesudah makan.',
    any: 'Boleh diminum dengan atau tanpa makan.',
  },
  signa: {
    label: 'Signa (aturan pakai)',
    placeholder: 'Contoh: 3 dd 1 tab p.c. atau 2x1 sesudah makan',
    hint: 'Ketik signa dari resep. Waktu, jumlah, dan aturan makan terisi otomatis.',
    timesCount: (count: number) => (count === 1 ? 'Sekali sehari' : `${count} kali sehari`),
    preview: (count: string, slots: string, dose: string, food: string | null) =>
      [`${count}: ${slots}`, dose, food].filter(Boolean).join('. ') + '.',
    previewPrn: (dose: string, max: number | null) =>
      max ? `Bila perlu: ${dose}, paling banyak ${max} kali sehari.` : `Bila perlu: ${dose}.`,
    check: (tokens: readonly string[]) => `Periksa: ${tokens.join(', ')}`,
  },
  myDrugs: {
    remember: 'Ingat obat ini untuk berikutnya',
    tag: 'Obat saya, tidak diperiksa',
    heading: 'Obat saya',
    hint: 'Obat yang Anda ketik sendiri. Hanya tersimpan di perangkat ini.',
    remove: (name: string) => `Hapus ${name} dari obat saya`,
    saved: (name: string) => `${name} disimpan ke obat saya.`,
  },
  calendar: {
    heading: 'Pengingat di ponsel',
    hint: 'Unduh file kalender lalu buka di ponsel untuk pengingat setiap hari.',
    export: 'Tambahkan ke kalender ponsel',
    times: 'Jam untuk setiap waktu',
    none: 'Tambahkan dulu obat dengan waktu tetap.',
    eventTitle: (slot: string) => `Obat: ${slot}`,
    eventLine: (name: string, dose: string) => `${name}: ${dose}`,
    repeats: (days: number) => `Berulang setiap hari selama ${days} hari.`,
  },
  timeline: {
    label: 'Waktu dalam sehari',
  },
  patient: {
    heading: 'Pasien',
    nameLabel: 'Nama pasien',
    nameHint: 'Tidak wajib. Kosongkan jika memakai komputer bersama.',
  },
  search: {
    label: 'Cari obat',
    placeholder: 'Nama generik atau merek',
    hint: 'Tidak ada di daftar? Ketik namanya lalu pilih tambahkan sebagai obat lain.',
    loading: 'Memuat daftar obat',
    listLabel: 'Obat yang cocok',
    addCustom: (name: string) => `Tambahkan "${name}" sebagai obat lain`,
    customNote: 'Tidak diperiksa oleh PillPlan',
    matches: (count: number) => `${count} hasil`,
    strengths: (labels: readonly string[]) => list(labels),
  },
  form: {
    addHeading: (name: string) => `Tambah ${name}`,
    editHeading: (name: string) => `Ubah ${name}`,
    name: 'Nama obat',
    strength: 'Kekuatan',
    strengthCustomHint: 'Contoh: 5 mg, atau 125 mg per 5 mL.',
    amount: 'Jumlah setiap kali minum',
    less: 'Kurangi',
    more: 'Tambah',
    form: 'Bentuk',
    forms: {
      tablet: 'Tablet',
      capsule: 'Kapsul',
      mL: 'Cairan (mL)',
      puff: 'Semprot',
      drop: 'Tetes',
    },
    when: 'Kapan diminum',
    whenNeededHint: 'Hanya saat pasien membutuhkan, misalnya untuk nyeri.',
    maxPerDay: 'Paling banyak per hari',
    food: 'Makanan',
    warnings: 'Stiker peringatan',
    purpose: 'Untuk apa',
    purposeHint: 'Kata sederhana, misalnya "untuk tekanan darah".',
    advice: 'Catatan untuk pasien',
    pillLook: 'Bentuk dan warna obat',
    shape: 'Bentuk',
    shapes: { round: 'Bulat', oval: 'Lonjong', capsule: 'Kapsul' },
    color: 'Warna',
    add: 'Tambahkan ke jadwal',
    save: 'Simpan perubahan',
    moreDetails: 'Detail lainnya',
    moreDetailsHint: 'Peringatan, kegunaan, bentuk obat, dan catatan',
    cancel: 'Batal',
    errors: {
      name: 'Isi nama obat.',
      amount: 'Isi jumlah lebih dari nol.',
      times: 'Pilih minimal satu waktu, atau "Bila perlu".',
      maxPerDay: 'Isi berapa kali sehari, dari 1 sampai 24.',
    },
  },
  list: {
    heading: 'Obat di jadwal',
    empty: 'Belum ada obat. Cari obat di atas untuk mulai.',
    edit: 'Ubah',
    remove: 'Hapus',
    reorder: (name: string) => `Pindahkan ${name}`,
    removed: (name: string) => `${name} dihapus.`,
    undo: 'Urungkan',
    schedule: (times: readonly string[]) => list(times),
    prnSummary: (max: number | null) =>
      max ? `Bila perlu, paling banyak ${max} kali sehari` : 'Bila perlu',
    dragInstructions:
      'Untuk memindahkan obat, tekan Spasi atau Enter pada pegangannya, gunakan tombol panah, lalu tekan Spasi atau Enter lagi. Tekan Escape untuk batal.',
    pickedUp: (name: string) => `${name} diambil.`,
    movedTo: (name: string, position: number, total: number) =>
      `${name} sekarang nomor ${position} dari ${total}.`,
    dropped: (name: string, position: number, total: number) =>
      `${name} diletakkan di nomor ${position} dari ${total}.`,
    cancelled: (name: string) => `Pemindahan ${name} dibatalkan.`,
  },
  chart: {
    heading: 'Jadwal minum obat',
    patient: 'Pasien',
    date: 'Tanggal',
    medicine: 'Obat',
    caption: 'Kapan minum setiap obat',
    none: 'Tidak ada',
    whenNeededHeading: 'Bila perlu',
    prnLine: (dose: string, max: number | null) =>
      max ? `Minum ${dose}. Tidak lebih dari ${max} kali sehari.` : `Minum ${dose} bila perlu.`,
    emptyTitle: 'Jadwal masih kosong',
    emptyBody: 'Tambahkan obat di sebelah kiri dan obat langsung muncul di sini.',
    spotlightLabel: 'Sorot satu waktu',
    medicinesAt: (count: number) => `${count} obat`,
    footer: 'Bawa jadwal ini setiap kali ke dokter atau apotek.',
  },
  tracker: {
    heading: 'Pemantau 7 hari',
    hint: 'Ketuk gelembung setiap kali obat sudah diminum.',
    reset: 'Mulai minggu baru',
    bubble: (day: string, slot: string, taken: boolean) =>
      `${day}, ${slot}: ${taken ? 'sudah diminum' : 'belum diminum'}`,
  },
  counsel: {
    title: 'Mode konseling',
    progress: (index: number, total: number) => `Obat ${index} dari ${total}`,
    whatFor: 'Untuk apa',
    when: 'Kapan diminum',
    how: 'Cara minum',
    warnings: 'Ingat',
    note: 'Catatan',
    back: 'Kembali',
    next: 'Berikutnya',
    done: 'Selesai',
    close: 'Tutup',
    at: (slot: string, dose: string) => `${slot}: ${dose}`,
  },
  safety: {
    heading: 'Catatan keamanan',
    none: 'Tidak ada masalah dari pemeriksaan yang bisa dilakukan PillPlan.',
    noneDetail:
      'PillPlan memeriksa total harian, duplikasi, dan waktu minum. PillPlan tidak memeriksa interaksi obat.',
    maxDailyTitle: (ingredient: string, total: string) => `${ingredient}: ${total} sehari`,
    maxDailyDetail: (max: string) =>
      `Ini di atas batas maksimum biasa ${max} sehari. Tanyakan kepada apoteker.`,
    duplicateIngredientTitle: (ingredient: string, count: number) =>
      `${ingredient} ada di ${count} obat`,
    duplicateIngredientDetail: (names: readonly string[], ingredient: string) =>
      `${list(names)} sama-sama mengandung ${ingredient}. Jika diminum bersama, jumlahnya bisa terlalu banyak. Tanyakan kepada apoteker.`,
    duplicateClassTitle: (drugClass: string) =>
      `Dua obat atau lebih dari satu golongan: ${drugClass}`,
    duplicateClassDetail: (names: readonly string[]) =>
      `${list(names)} bekerja dengan cara yang sama. Biasanya ini tidak disengaja. Tanyakan kepada apoteker.`,
    timingTitle: (name: string) => `${name}: periksa waktu minum`,
    uncheckedTitle: (name: string) => `${name} tidak ada di daftar obat`,
    uncheckedDetail: 'PillPlan tidak bisa memeriksa dosis, duplikasi, atau waktu untuk obat ini.',
  },
  storage: {
    heading: 'Simpan dan bagikan',
    remember: 'Ingat di perangkat ini',
    rememberHint: 'Matikan di komputer bersama. Data yang tersimpan akan dihapus.',
    unavailable:
      'Browser ini tidak mengizinkan PillPlan menyimpan. Gunakan Ekspor untuk menyimpan salinan.',
    export: 'Ekspor file',
    import: 'Impor file',
    clear: 'Hapus semua data',
    clearTitle: 'Hapus semua data?',
    clearBody: 'Semua obat, pemantau, dan nama pasien akan dihapus dari perangkat ini.',
    clearConfirm: 'Ya, hapus semua',
    imported: 'Jadwal berhasil diimpor.',
    importFailed: 'File itu bukan jadwal PillPlan.',
    invalidSaved: 'Data tersimpan tidak bisa dibaca, jadi PillPlan memulai jadwal baru.',
    cleared: 'Semua data dihapus.',
  },
};
