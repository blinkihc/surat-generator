export type TemplateType = 'BA_CAMAT' | 'BA_DESA';

export interface PBBHandoverData {
  templateType: TemplateType;
  nomorBeritaAcara: string;
  hari: string;
  tanggal: string;
  bulan: string;
  tahun: string;
  pihakPertama: {
    nama: string;
    jabatan: string;
    nip: string;
    instansi: string;
  };
  pihakKedua: {
    nama: string;
    jabatan: string;
    nip: string;
    instansi: string;
    kosongkanData?: boolean;
  };
  detailPenyerahan: {
    tahunPajak: string;
    jumlahSPPT: string;
    jumlahBukuDHKP: string;
    totalKetetapan: string;
    kecamatan: string;
    kelurahan: string;
  };
}

export interface SavedTemplate {
  id: string;
  name: string;
  data: PBBHandoverData;
  isDefault?: boolean;
}

export interface AppSettings {
  kopLogoBase64: string | null;
  kopLine1: string;
  kopLine2: string;
  kopLine3: string;
  kopAddress: string;
  nomorFormat: string;
  mengetahuiNama: string;
  mengetahuiNip: string;
  customGeminiKey?: string;
}

export const initialSettings: AppSettings = {
  kopLogoBase64: null,
  kopLine1: "PEMERINTAH KABUPATEN OGAN KOMERING ULU SELATAN",
  kopLine2: "BADAN PENDAPATAN DAERAH",
  kopLine3: "Komplek Perkantoran Pemkab. OKU Selatan",
  kopAddress: "Jalan Serasan Seandanan No. 21 Muaradua, Telp. 0735-3274012, Fax. 0735274013",
  nomorFormat: "973/ /BAPENDA/2026",
  mengetahuiNama: "FIRMAN BASTARI, S.STP., M.Si",
  mengetahuiNip: "198204262001121003",
  customGeminiKey: "",
};

export const initialData: PBBHandoverData = {
  templateType: 'BA_CAMAT',
  nomorBeritaAcara: "",
  hari: "",
  tanggal: "",
  bulan: "",
  tahun: "",
  pihakPertama: {
    nama: "",
    jabatan: "",
    nip: "",
    instansi: "",
  },
  pihakKedua: {
    nama: "",
    jabatan: "",
    nip: "",
    instansi: "",
    kosongkanData: false,
  },
  detailPenyerahan: {
    tahunPajak: "",
    jumlahSPPT: "",
    jumlahBukuDHKP: "",
    totalKetetapan: "",
    kecamatan: "",
    kelurahan: "",
  },
};
