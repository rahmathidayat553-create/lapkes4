
export enum Jenjang {
  SD = 'SD',
  SMP = 'SMP',
  SMA = 'SMA',
  SMK = 'SMK',
}

export enum HariFormat {
  LIMA = '5 Hari',
  ENAM = '6 Hari',
}

export enum Jk {
  LAKI_LAKI = 'Laki-Laki',
  PEREMPUAN = 'Perempuan',
}

export enum StatusGuru {
  ASN = 'ASN',
  NON_ASN = 'NON-ASN',
}

export enum StatusSiswa {
  BARU = 'Siswa Baru',
  PINDAHAN = 'Siswa Pindahan',
}

export enum StatusKalender {
    LIBUR = 'Libur',
    TIDAK_EFEKTIF = 'Tidak Efektif',
    AKTIF = 'Aktif',
}

export enum AlasanMutasi {
    PINDAH = 'Pindah Sekolah',
    KELUAR = 'Dikeluarkan',
    LULUS = 'Lulus'
}

export enum KehadiranStatus {
    HADIR = 'H',
    SAKIT = 'S',
    IJIN = 'I',
    ALPA = 'A'
}

export interface Notification {
    type: 'success' | 'error' | 'warning';
    message: string;
}

export interface User {
  id: string;
  nama: string;
  user: string;
  password?: string;
}

export interface IdentitasSekolah {
  id: string;
  npsn: string;
  nama_sekolah: string;
  jenjang: Jenjang;
  nama_kepsek: string;
  nama_wakasek: string;
  alamat: string;
  logo: string; // base64 string
  format: HariFormat;
}

export interface KalenderPendidikan {
  id: string;
  tanggal: string; // YYYY-MM-DD
  judul: string;
  status: StatusKalender;
  ket?: string;
}

export interface Guru {
  id: string;
  nama_guru: string;
  jk: Jk;
  status: StatusGuru;
  nip?: string;
}

export interface Mapel {
  id: string;
  kd_mapel: string;
  nama_mapel: string;
}

export interface PengajarMapel {
  id: string;
  mapelId: string;
  guruId: string;
  jp: number; // jumlah pertemuan
  kelasId: string;
}

export interface Siswa {
  id: string;
  nisn: string;
  nama_siswa: string;
  jk: Jk;
  status: StatusSiswa;
  tgl_masuk: string; // YYYY-MM-DD
  tgl_keluar?: string; // YYYY-MM-DD
  foto?: string; // base64 string
  no_wa?: string;
  kelasId?: string; // a student belongs to one class
  mutasi?: boolean;
}

export interface Kelas {
  id: string;
  kd_kelas: string;
  nama_kelas: string;
  waliKelasId: string;
}

export interface KehadiranSiswaRecord {
    siswaId: string;
    status: [
        KehadiranStatus, KehadiranStatus, KehadiranStatus, KehadiranStatus, KehadiranStatus, 
        KehadiranStatus, KehadiranStatus, KehadiranStatus, KehadiranStatus, KehadiranStatus
    ];
}

export interface KehadiranSiswa {
  id: string;
  kelasId: string;
  tanggal: string; // YYYY-MM-DD
  kehadiran: KehadiranSiswaRecord[];
}

export interface KehadiranGuruRecord {
    guruId: string;
    mapelId: string;
    jumlahPertemuan: number;
}

export interface KehadiranGuru {
    id: string;
    kelasId: string;
    tanggal: string; // YYYY-MM-DD
    kehadiran: KehadiranGuruRecord[];
}

export interface MutasiSiswa {
  id: string;
  siswaId: string;
  tanggal_keluar: string;
  alasan_mutasi: AlasanMutasi;
  keterangan?: string;
}