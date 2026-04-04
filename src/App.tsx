/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  FileText, 
  Upload, 
  Download, 
  RefreshCw, 
  User, 
  MapPin, 
  Calendar, 
  CheckCircle2,
  AlertCircle,
  Printer,
  ChevronRight,
  ChevronLeft,
  Save,
  Trash2,
  Star,
  Copy,
  Layout,
  X,
  FileSpreadsheet,
  Archive,
  Heart,
  Home,
  HelpCircle,
  Zap,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatNumber } from './lib/utils';
import { formatTerbilang } from './lib/terbilang';
import { PBBHandoverData, initialData, SavedTemplate, TemplateType, AppSettings, initialSettings } from './types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const INPUT_CLASSES = "w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm hover:border-slate-300 placeholder:text-slate-400";

const SkeletonInput = () => (
  <div className="w-full h-[42px] bg-slate-100 rounded-xl animate-pulse border border-slate-100" />
);

  const DocumentPreview = ({ 
  data, 
  settings, 
  documentRef,
  onUpdate,
  onUpdateSettings
}: { 
  data: PBBHandoverData, 
  settings: AppSettings, 
  documentRef?: React.RefObject<HTMLDivElement>,
  onUpdate?: (path: string, value: string) => void,
  onUpdateSettings?: (path: string, value: string) => void
}) => {
  const Editable = ({ value, path, className, placeholder = '................................', isSettings = false, formatter }: { value: string | undefined, path: string, className?: string, placeholder?: string, isSettings?: boolean, formatter?: (v: string | undefined) => string }) => {
    const displayValue = formatter ? formatter(value) : (value || placeholder);
    const updateFn = isSettings ? onUpdateSettings : onUpdate;
    if (!updateFn) return <span className={className}>{displayValue}</span>;
    return (
      <span
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => updateFn(path, e.currentTarget.textContent || '')}
        className={cn("hover:bg-yellow-50 focus:bg-yellow-100 outline-none transition-colors px-0.5 rounded cursor-text", className)}
      >
        {displayValue}
      </span>
    );
  };

  return (
    <div 
      ref={documentRef}
      className="w-[215mm] bg-white px-[20mm] pt-[10mm] pb-[15mm] text-slate-900 font-['Arial',sans-serif] leading-relaxed text-[11pt] shrink-0 shadow-xl print-area"
    >
      {/* Kop Surat */}
      <div className="flex items-center border-b-[3px] border-slate-900 pb-2 mb-0.5 relative">
        <div className="w-24 h-28 flex-shrink-0 flex items-center justify-center overflow-hidden">
          {settings.kopLogoBase64 ? (
            <img src={settings.kopLogoBase64} alt="Logo" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-20 h-24 border-2 border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400 text-center p-2">Logo (Atur di Pengaturan)</div>
          )}
        </div>
        <div className="flex-1 text-center px-4">
          <h1 className="text-[12pt] font-bold uppercase tracking-wide leading-tight text-slate-600">
            <Editable value={settings.kopLine1} path="kopLine1" isSettings />
          </h1>
          <h2 className="text-[20pt] font-bold uppercase tracking-wider mt-1 mb-1 leading-tight text-slate-600">
            <Editable value={settings.kopLine2} path="kopLine2" isSettings />
          </h2>
          <p className="text-[9pt] leading-tight text-slate-600">
            <Editable value={settings.kopLine3} path="kopLine3" isSettings />
          </p>
          <p className="text-[9pt] italic leading-tight text-slate-600">
            <Editable value={settings.kopAddress} path="kopAddress" isSettings />
          </p>
        </div>
      </div>
      <div className="border-b border-slate-900 mb-6"></div>

      {data.templateType === 'BA_CAMAT' ? (
        <>
          <div className="text-center mb-6">
            <h2 className="text-[11pt] font-bold uppercase leading-snug">
              BERITA ACARA PENYERAHAN SURAT PEMBERITAHUAN PAJAK TERUTANG (SPPT)<br/>
              DAN DAFTAR HIMPUNAN KETETAPAN DAN PEMBAYARAN (DHKP) PBB<br/>
              SEKTOR PERDESAAN DAN PERKOTAAN TAHUN {data.detailPenyerahan.tahunPajak || '............'}
            </h2>
            <p className="mt-4 font-bold underline decoration-1 underline-offset-4">Nomor : <Editable value={data.nomorBeritaAcara ? (settings.nomorFormat.includes(' ') ? settings.nomorFormat.replace(' ', data.nomorBeritaAcara.padStart(4, '0')) : `${data.nomorBeritaAcara.padStart(4, '0')}${settings.nomorFormat}`) : undefined} path="nomorBeritaAcara" /></p>
          </div>

          <p className="mb-4 text-justify">
            Pada hari ini <span className="font-bold"><Editable value={data.hari} path="hari" placeholder="............" /></span> tanggal <span className="font-bold"><Editable value={data.tanggal} path="tanggal" placeholder="............" /></span> (<span className="italic">{formatTerbilang(data.tanggal) || '............'}</span>) bulan <span className="font-bold"><Editable value={data.bulan} path="bulan" placeholder="............" /></span> tahun <span className="font-bold"><Editable value={data.tahun} path="tahun" placeholder="............" /></span> (<span className="italic">{formatTerbilang(data.tahun) || '............'}</span>), yang bertanda tangan di bawah ini:
          </p>

          <div className="space-y-4 mb-4 pl-4">
            <div className="flex gap-2">
              <span className="w-4">I.</span>
              <div className="flex-1">
                <div className="grid grid-cols-[100px_10px_1fr] gap-1">
                  <span>Nama/NIP</span>
                  <span>:</span>
                  <span className="font-bold uppercase"><Editable value={data.pihakPertama.nama} path="pihakPertama.nama" /> / NIP. <Editable value={data.pihakPertama.nip} path="pihakPertama.nip" /></span>
                </div>
                <div className="grid grid-cols-[100px_10px_1fr] gap-1">
                  <span>Jabatan</span>
                  <span>:</span>
                  <span><Editable value={data.pihakPertama.jabatan} path="pihakPertama.jabatan" /></span>
                </div>
                <p className="mt-1">Selanjutnya disebut sebagai PIHAK PERTAMA</p>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="w-4">II.</span>
              <div className="flex-1">
                <div className="grid grid-cols-[100px_10px_1fr] gap-1">
                  <span>Nama/NIP</span>
                  <span>:</span>
                  <span className="font-bold uppercase"><Editable value={data.pihakKedua.nama} path="pihakKedua.nama" /> / NIP. <Editable value={data.pihakKedua.nip} path="pihakKedua.nip" /></span>
                </div>
                <div className="grid grid-cols-[100px_10px_1fr] gap-1">
                  <span>Jabatan</span>
                  <span>:</span>
                  <span><Editable value={data.pihakKedua.jabatan} path="pihakKedua.jabatan" /></span>
                </div>
                <p className="mt-1">Selanjutnya disebut sebagai PIHAK KEDUA</p>
              </div>
            </div>
          </div>

          <p className="mb-2 text-justify">
            PIHAK PERTAMA menyerahkan kepada PIHAK KEDUA dan PIHAK KEDUA menerima dari PIHAK PERTAMA Surat Pemberitahuan Pajak Terhutang (SPPT) dan buku DHKP 1, 2 dan 3 Pajak Bumi dan Bangunan (PBB) Sektor Perdesaan dan Perkotaan untuk wilayah Kecamatan <Editable value={data.detailPenyerahan.kecamatan} path="detailPenyerahan.kecamatan" placeholder="................" /> Kabupaten Ogan Komering Ulu Selatan Tahun <Editable value={data.detailPenyerahan.tahunPajak} path="detailPenyerahan.tahunPajak" placeholder="............" />, berupa :
          </p>

            <div className="pl-4 mb-4 space-y-1 text-justify">
              <div className="flex gap-2">
                <span>1.</span>
                <p>Surat Pemberitahuan Pajak Terutang (SPPT) sebanyak <Editable value={data.detailPenyerahan.jumlahSPPT} path="detailPenyerahan.jumlahSPPT" placeholder="......" formatter={formatNumber} /> (<span className="italic">{formatTerbilang(data.detailPenyerahan.jumlahSPPT) || '......'}</span>) lembar.</p>
              </div>
              <div className="flex gap-2">
                <span>2.</span>
                <div>
                  <p>Daftar Himpunan Ketetapan dan Pembayaran (DHKP) PBB sebanyak <Editable value={data.detailPenyerahan.jumlahBukuDHKP} path="detailPenyerahan.jumlahBukuDHKP" placeholder="......" formatter={formatNumber} /> (<span className="italic">{formatTerbilang(data.detailPenyerahan.jumlahBukuDHKP) || '......'}</span>) buku, dengan jumlah ketetapan sebesar <span className="font-bold">Rp. <Editable value={data.detailPenyerahan.totalKetetapan} path="detailPenyerahan.totalKetetapan" placeholder="................" formatter={formatNumber} /></span> (<span className="font-bold italic">{formatTerbilang(data.detailPenyerahan.totalKetetapan) || '................'} Rupiah</span>) sebagaimana terlampir, dengan penjelasan sebagai berikut:</p>
                <div className="pl-4 mt-1 space-y-1">
                  <div className="flex gap-2"><span>a.</span><p>DHKP dan SPPT untuk diserahkan kepada kepala Desa/Lurah/Petugas Pemungut dengan menggunakan berita acara.</p></div>
                  <div className="flex gap-2"><span>b.</span><p>SPPT dapat disampaikan kepada Desa / Kelurahan selambat-lambatnya 5 (lima) hari kerja sejak ditandatanganinya berita acara penyerahan.</p></div>
                  <div className="flex gap-2"><span>c.</span><p>Pajak terhutang agar dibayar lunas pada tempat pembayaran yang telah dicantumkan pada SPPT.</p></div>
                </div>
              </div>
            </div>
          </div>

          <p className="mb-6 text-justify">
            Demikian berita acara ini dibuat dalam rangkap 2 (dua) untuk dipergunakan sebagaimana mestinya.
          </p>

          <div className="grid grid-cols-2 gap-8 text-center">
            <div className="space-y-8">
              <div>
                <p>PIHAK KEDUA</p>
                <p>Camat <Editable value={data.detailPenyerahan.kecamatan} path="detailPenyerahan.kecamatan" placeholder="................" /></p>
                <p>Kabupaten Ogan Komering Ulu Selatan</p>
              </div>
              <div>
                <p className="font-bold underline uppercase"><Editable value={data.pihakKedua.nama} path="pihakKedua.nama" /></p>
                <p>NIP. <Editable value={data.pihakKedua.nip} path="pihakKedua.nip" /></p>
              </div>
            </div>
            <div className="space-y-8">
              <div>
                <p>PIHAK PERTAMA</p>
                <p>Kepala Badan Pendapatan Daerah</p>
                <p>Kabupaten Ogan Komering Ulu Selatan</p>
              </div>
              <div>
                <p className="font-bold underline uppercase">
                  <Editable value={settings.mengetahuiNama} path="mengetahuiNama" isSettings />
                </p>
                <p>NIP. <Editable value={settings.mengetahuiNip} path="mengetahuiNip" isSettings /></p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="text-center mb-6">
            <h2 className="text-[11pt] font-bold uppercase leading-snug">
              BERITA ACARA PENYERAHAN SURAT PEMBERITAHUAN PAJAK TERUTANG (SPPT)<br/>
              DAN DAFTAR HIMPUNAN KETETAPAN DAN PEMBAYARAN (DHKP) PBB<br/>
              SEKTOR PERDESAAN DAN PERKOTAAN TAHUN {data.detailPenyerahan.tahunPajak || '............'}
            </h2>
            <p className="mt-4 font-bold">Nomor : <Editable value={data.nomorBeritaAcara ? (settings.nomorFormat.includes(' ') ? settings.nomorFormat.replace(' ', data.nomorBeritaAcara.padStart(4, '0')) : `${data.nomorBeritaAcara.padStart(4, '0')}${settings.nomorFormat}`) : undefined} path="nomorBeritaAcara" /></p>
          </div>

          <p className="mb-4 text-justify">
            Pada hari ini <span className="font-bold"><Editable value={data.hari} path="hari" placeholder="............" /></span> tanggal <span className="font-bold"><Editable value={data.tanggal} path="tanggal" placeholder="............" /></span> (<span className="italic">{formatTerbilang(data.tanggal) || '............'}</span>) bulan <span className="font-bold"><Editable value={data.bulan} path="bulan" placeholder="............" /></span> tahun <span className="font-bold"><Editable value={data.tahun} path="tahun" placeholder="............" /></span> (<span className="italic">{formatTerbilang(data.tahun) || '............'}</span>), yang bertanda tangan di bawah ini:
          </p>

          <div className="space-y-4 mb-4 pl-4">
            <div className="flex gap-2">
              <span className="w-4">I.</span>
              <div className="flex-1">
                <div className="grid grid-cols-[100px_10px_1fr] gap-1">
                  <span>Nama/NIP</span>
                  <span>:</span>
                  <span className="font-bold uppercase"><Editable value={data.pihakPertama.nama} path="pihakPertama.nama" /> / NIP. <Editable value={data.pihakPertama.nip} path="pihakPertama.nip" /></span>
                </div>
                <div className="grid grid-cols-[100px_10px_1fr] gap-1">
                  <span>Jabatan</span>
                  <span>:</span>
                  <span><Editable value={data.pihakPertama.jabatan} path="pihakPertama.jabatan" /></span>
                </div>
                <p className="mt-1">Selanjutnya disebut sebagai PIHAK PERTAMA</p>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="w-4">II.</span>
              <div className="flex-1">
                <div className="grid grid-cols-[100px_10px_1fr] gap-1">
                  <span>Nama/NIP</span>
                  <span>:</span>
                  <span className="font-bold uppercase">
                    <Editable value={data.pihakKedua.kosongkanData ? '................................' : data.pihakKedua.nama} path="pihakKedua.nama" />
                    {!data.pihakKedua.kosongkanData && (
                      <> / NIP. <Editable value={data.pihakKedua.nip} path="pihakKedua.nip" /></>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-[100px_10px_1fr] gap-1">
                  <span>Jabatan</span>
                  <span>:</span>
                  <span><Editable value={data.pihakKedua.kosongkanData ? '................................' : data.pihakKedua.jabatan} path="pihakKedua.jabatan" /></span>
                </div>
                <p className="mt-1">Selanjutnya disebut sebagai PIHAK KEDUA</p>
              </div>
            </div>
          </div>

          <p className="mb-2 text-justify">
            PIHAK PERTAMA menyerahkan kepada PIHAK KEDUA dan PIHAK KEDUA menerima dari PIHAK PERTAMA Surat Pemberitahuan Pajak Terhutang (SPPT) dan buku DHKP 1, 2 dan 3 Pajak Bumi dan Bangunan (PBB) Sektor Perdesaan dan Perkotaan untuk wilayah Desa <Editable value={data.detailPenyerahan.kelurahan} path="detailPenyerahan.kelurahan" placeholder="................" /> Kecamatan <Editable value={data.detailPenyerahan.kecamatan} path="detailPenyerahan.kecamatan" placeholder="................" /> Kabupaten Ogan Komering Ulu Selatan Tahun <Editable value={data.detailPenyerahan.tahunPajak} path="detailPenyerahan.tahunPajak" placeholder="............" />, berupa :
          </p>

            <div className="pl-4 mb-4 space-y-1 text-justify">
              <div className="flex gap-2">
                <span>1.</span>
                <p>Surat Pemberitahuan Pajak Terutang (SPPT) sebanyak <Editable value={data.detailPenyerahan.jumlahSPPT} path="detailPenyerahan.jumlahSPPT" placeholder="......" formatter={formatNumber} /> (<span className="italic">{formatTerbilang(data.detailPenyerahan.jumlahSPPT) || '......'}</span>) lembar.</p>
              </div>
              <div className="flex gap-2">
                <span>2.</span>
                <div>
                  <p>Daftar Himpunan Ketetapan dan Pembayaran (DHKP) PBB sebanyak <Editable value={data.detailPenyerahan.jumlahBukuDHKP} path="detailPenyerahan.jumlahBukuDHKP" placeholder="......" formatter={formatNumber} /> (<span className="italic">{formatTerbilang(data.detailPenyerahan.jumlahBukuDHKP) || '......'}</span>) buku, dengan jumlah ketetapan sebesar <span className="font-bold">Rp. <Editable value={data.detailPenyerahan.totalKetetapan} path="detailPenyerahan.totalKetetapan" placeholder="................" formatter={formatNumber} /></span> (<span className="font-bold italic">{formatTerbilang(data.detailPenyerahan.totalKetetapan) || '................'} Rupiah</span>) sebagaimana terlampir, dengan penjelasan sebagai berikut:</p>
                <div className="pl-4 mt-1 space-y-1">
                  <div className="flex gap-2"><span>a.</span><p>SPPT dapat disampaikan kepada Wajib Pajak selambat-lambatnya 25 (dua puluh lima) hari kerja sejak ditandatanganinya berita acara penyerahan.</p></div>
                  <div className="flex gap-2"><span>b.</span><p>Pajak terhutang agar dibayar lunas pada tempat pembayaran yang telah dicantumkan pada SPPT.</p></div>
                </div>
              </div>
            </div>
          </div>

          <p className="mb-6 text-justify">
            Demikian berita acara ini dibuat dalam rangkap 2 (dua) untuk dipergunakan sebagaimana mestinya.
          </p>

          <div className="grid grid-cols-2 gap-8 text-center mb-4">
            <div className="space-y-8">
              <div>
                <p>PIHAK KEDUA</p>
                <p>&nbsp;</p>
                <p>&nbsp;</p>
              </div>
              <div>
                <p className="font-bold underline uppercase">
                  {data.pihakKedua.kosongkanData ? <>&nbsp;</> : <Editable value={data.pihakKedua.nama} path="pihakKedua.nama" />}
                </p>
                <p>
                  {data.pihakKedua.kosongkanData ? <>&nbsp;</> : <>NIP. <Editable value={data.pihakKedua.nip} path="pihakKedua.nip" /></>}
                </p>
              </div>
            </div>
            <div className="space-y-8">
              <div>
                <p>PIHAK PERTAMA</p>
                <p>Camat <Editable value={data.detailPenyerahan.kecamatan} path="detailPenyerahan.kecamatan" placeholder="................" /></p>
                <p>Kabupaten Ogan Komering Ulu Selatan</p>
              </div>
              <div>
                <p className="font-bold underline uppercase"><Editable value={data.pihakPertama.nama} path="pihakPertama.nama" /></p>
                <p>NIP. <Editable value={data.pihakPertama.nip} path="pihakPertama.nip" /></p>
              </div>
            </div>
          </div>

          <div className="text-center mt-2">
            <p className="font-bold uppercase leading-none">MENGETAHUI</p>
            <p className="font-bold leading-none">Kepala Badan Pendapatan Daerah</p>
            <p className="font-bold leading-none">Kabupaten Ogan Komering Ulu Selatan</p>
            <div className="mt-6">
              <p className="font-bold underline uppercase">
                <Editable value={settings.mengetahuiNama} path="mengetahuiNama" isSettings />
              </p>
              <p className="leading-none">NIP. <Editable value={settings.mengetahuiNip} path="mengetahuiNip" isSettings /></p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default function App() {
  const [data, setData] = useState<PBBHandoverData>(initialData);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isGeneratingWord, setIsGeneratingWord] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [previewMode, setPreviewMode] = useState(false);
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [batchData, setBatchData] = useState<any[]>([]);
  const [batchPreviewData, setBatchPreviewData] = useState<PBBHandoverData[] | null>(null);
  const [currentBatchPreviewIndex, setCurrentBatchPreviewIndex] = useState(0);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [printData, setPrintData] = useState<PBBHandoverData[] | null>(null);
  const documentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (printData && printData.length > 0) {
      // Small delay to ensure React has painted the DOM and images are loaded
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [printData]);

  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintData(null);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  useEffect(() => {
    const savedTemplates = localStorage.getItem('pbb_templates');
    if (savedTemplates) {
      try {
        const parsed = JSON.parse(savedTemplates);
        setTemplates(parsed);
        
        const defaultTemplate = parsed.find((t: SavedTemplate) => t.isDefault);
        if (defaultTemplate) {
          setData(defaultTemplate.data);
        }
      } catch (e) {
        console.error("Failed to parse templates", e);
      }
    }

    const savedSettings = localStorage.getItem('pbb_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  const saveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('pbb_settings', JSON.stringify(newSettings));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const base64 = await fileToBase64(file);
      saveSettings({ ...settings, kopLogoBase64: base64 });
    } catch (err) {
      console.error("Failed to upload logo", err);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const saveTemplate = () => {
    if (!templateName.trim()) return;
    
    const newTemplate: SavedTemplate = {
      id: Date.now().toString(),
      name: templateName,
      data: { ...data }
    };
    
    const updated = [...templates, newTemplate];
    setTemplates(updated);
    localStorage.setItem('pbb_templates', JSON.stringify(updated));
    setTemplateName("");
    setShowSaveModal(false);
  };

  const deleteTemplate = (id: string) => {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    localStorage.setItem('pbb_templates', JSON.stringify(updated));
  };

  const setDefaultTemplate = (id: string) => {
    const updated = templates.map(t => ({
      ...t,
      isDefault: t.id === id
    }));
    setTemplates(updated);
    localStorage.setItem('pbb_templates', JSON.stringify(updated));
  };

  const loadTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      setData(template.data);
      setShowTemplates(false);
      if (step === 1) setStep(2);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsAnalyzing(true);
    setError(null);
    setShowTemplates(false);
    setStep(2);

    try {
      const parts = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = await fileToBase64(file);
        parts.push({
          inlineData: {
            data: base64.split(',')[1],
            mimeType: file.type
          }
        });
      }

      const prompt = `Analyze this "Berita Acara Penyerahan PBB" document image. Extract all relevant fields into a JSON object. 
      Identify if this is a "BA Camat" (usually involves Camat/Kecamatan) or "BA Desa" (usually involves Kelurahan/Desa).
      
      Fields needed:
      - templateType: "BA_CAMAT" or "BA_DESA"
      - nomorBeritaAcara (Extract ONLY the number part, e.g., if "900/123/PBB", extract "123")
      - hari
      - tanggal
      - bulan
      - tahun
      - pihakPertama: { nama, jabatan, nip, instansi }
      - pihakKedua: { nama, jabatan, nip, instansi, kosongkanData } (Set kosongkanData to true if Pihak Kedua details are blank/empty dots in the image, especially for BA Desa)
      - detailPenyerahan: { tahunPajak, jumlahSPPT, jumlahBukuDHKP, totalKetetapan, kecamatan, kelurahan }
      
      Return ONLY the JSON object.`;

      const apiKey = settings.customGeminiKey || process.env.API_KEY || process.env.GEMINI_API_KEY || "";
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: [...parts, { text: prompt }] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              templateType: { type: Type.STRING, enum: ["BA_CAMAT", "BA_DESA"] },
              nomorBeritaAcara: { type: Type.STRING },
              hari: { type: Type.STRING },
              tanggal: { type: Type.STRING },
              bulan: { type: Type.STRING },
              tahun: { type: Type.STRING },
              pihakPertama: {
                type: Type.OBJECT,
                properties: {
                  nama: { type: Type.STRING },
                  jabatan: { type: Type.STRING },
                  nip: { type: Type.STRING },
                  instansi: { type: Type.STRING }
                }
              },
              pihakKedua: {
                type: Type.OBJECT,
                properties: {
                  nama: { type: Type.STRING },
                  jabatan: { type: Type.STRING },
                  nip: { type: Type.STRING },
                  instansi: { type: Type.STRING },
                  kosongkanData: { type: Type.BOOLEAN }
                }
              },
              detailPenyerahan: {
                type: Type.OBJECT,
                properties: {
                  tahunPajak: { type: Type.STRING },
                  jumlahSPPT: { type: Type.STRING },
                  jumlahBukuDHKP: { type: Type.STRING },
                  totalKetetapan: { type: Type.STRING },
                  kecamatan: { type: Type.STRING },
                  kelurahan: { type: Type.STRING }
                }
              }
            }
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      setData((prev) => ({ ...prev, ...result }));
    } catch (err) {
      console.error(err);
      setError("Gagal menganalisa gambar. Pastikan gambar jelas dan coba lagi.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleDownloadPDF = async () => {
    if (!documentRef.current) return;
    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(documentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', [215, 330]);
      const imgProps = pdf.getImageProperties(imgData);
      let pdfWidth = pdf.internal.pageSize.getWidth();
      let pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let xOffset = 0;
      if (pdfHeight > 330) {
        const scaleFactor = 330 / pdfHeight;
        pdfWidth = pdfWidth * scaleFactor;
        pdfHeight = 330;
        xOffset = (215 - pdfWidth) / 2;
      }
      
      pdf.addImage(imgData, 'PNG', xOffset, 0, pdfWidth, pdfHeight);
      pdf.save(`Berita_Acara_PBB_${data.detailPenyerahan.kelurahan || 'Dokumen'}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const updateField = (path: string, value: any) => {
    const keys = path.split('.');
    
    // Clean numeric values
    let processedValue = value;
    const numericPaths = [
      'detailPenyerahan.jumlahSPPT',
      'detailPenyerahan.jumlahBukuDHKP',
      'detailPenyerahan.totalKetetapan'
    ];
    if (numericPaths.includes(path) && typeof value === 'string') {
      processedValue = value.replace(/[^0-9]/g, '');
    }

    setData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = { ...current[keys[i]] };
      }
      current[keys[keys.length - 1]] = processedValue;
      return newData;
    });
  };

  const updateBatchField = (index: number, path: string, value: string) => {
    // Clean numeric values
    let processedValue = value;
    const numericPaths = [
      'detailPenyerahan.jumlahSPPT',
      'detailPenyerahan.jumlahBukuDHKP',
      'detailPenyerahan.totalKetetapan'
    ];
    if (numericPaths.includes(path)) {
      processedValue = value.replace(/[^0-9]/g, '');
    }

    setBatchPreviewData(prev => {
      const newData = [...prev];
      const item = { ...newData[index] };
      const keys = path.split('.');
      let current: any = item;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = { ...current[keys[i]] };
      }
      current[keys[keys.length - 1]] = processedValue;
      newData[index] = item;
      return newData;
    });
  };

  const formatNomorBeritaAcara = (nomor: string, format: string) => {
    if (!nomor) return '................................';
    const paddedNomor = nomor.padStart(4, '0');
    if (format.includes(' ')) {
      return format.replace(' ', paddedNomor);
    }
    return `${paddedNomor}${format}`;
  };

  const generateDocxBlob = (currentData: PBBHandoverData, currentSettings: AppSettings): Blob => {
    const formatNomor = formatNomorBeritaAcara(currentData.nomorBeritaAcara, currentSettings.nomorFormat);
    
    let content = '';
    
    // Kop Surat
    content += `
      <table width="100%" style="border-bottom: 3px solid black; margin-bottom: 5px;">
        <tr>
          <td width="15%" align="center" valign="middle">
            ${currentSettings.kopLogoBase64 ? `<img src="${currentSettings.kopLogoBase64}" width="80" height="90" />` : ''}
          </td>
          <td width="85%" align="center" valign="middle">
            <div style="font-size: 12pt; font-weight: bold;">${currentSettings.kopLine1}</div>
            <div style="font-size: 20pt; font-weight: bold; margin-top: 2px; margin-bottom: 2px;">${currentSettings.kopLine2}</div>
            <div style="font-size: 9pt;">${currentSettings.kopLine3}</div>
            <div style="font-size: 9pt; font-style: italic;">${currentSettings.kopAddress}</div>
          </td>
        </tr>
      </table>
      <div style="border-bottom: 1px solid black; margin-bottom: 15px;"></div>
    `;

    if (currentData.templateType === 'BA_CAMAT') {
      content += `
        <div style="text-align: center; margin-bottom: 15px;">
          <div style="font-size: 11pt; font-weight: bold;">
            BERITA ACARA PENYERAHAN SURAT PEMBERITAHUAN PAJAK TERUTANG (SPPT)<br/>
            DAN DAFTAR HIMPUNAN KETETAPAN DAN PEMBAYARAN (DHKP) PBB<br/>
            SEKTOR PERDESAAN DAN PERKOTAAN TAHUN ${currentData.detailPenyerahan.tahunPajak || '............'}
          </div>
          <div style="margin-top: 10px; font-weight: bold; text-decoration: underline;">
            Nomor : ${formatNomor}
          </div>
        </div>
        
        <p style="text-align: justify; margin-bottom: 10px;">
          Pada hari ini <b>${currentData.hari || '............'}</b> tanggal <b>${currentData.tanggal || '............'} (${formatTerbilang(currentData.tanggal) || '............'})</b> bulan <b>${currentData.bulan || '............'}</b> tahun <b>${currentData.tahun || '............'} (${formatTerbilang(currentData.tahun) || '............'})</b>, yang bertanda tangan di bawah ini:
        </p>
        
        <table width="100%" style="margin-bottom: 10px;">
          <tr>
            <td width="5%" valign="top">I.</td>
            <td width="95%">
              <table width="100%">
                <tr><td width="20%">Nama/NIP</td><td width="5%">:</td><td><b>${currentData.pihakPertama.nama || '................................'} / NIP. ${currentData.pihakPertama.nip || '................................'}</b></td></tr>
                <tr><td>Jabatan</td><td>:</td><td>${currentData.pihakPertama.jabatan || '................................'}</td></tr>
              </table>
              <p>Selanjutnya disebut sebagai PIHAK PERTAMA</p>
            </td>
          </tr>
          <tr>
            <td width="5%" valign="top">II.</td>
            <td width="95%">
              <table width="100%">
                <tr><td width="20%">Nama/NIP</td><td width="5%">:</td><td><b>${currentData.pihakKedua.nama || '................................'} / NIP. ${currentData.pihakKedua.nip || '................................'}</b></td></tr>
                <tr><td>Jabatan</td><td>:</td><td>${currentData.pihakKedua.jabatan || '................................'}</td></tr>
              </table>
              <p>Selanjutnya disebut sebagai PIHAK KEDUA</p>
            </td>
          </tr>
        </table>
        
        <p style="text-align: justify; margin-bottom: 10px;">
          PIHAK PERTAMA menyerahkan kepada PIHAK KEDUA dan PIHAK KEDUA menerima dari PIHAK PERTAMA Surat Pemberitahuan Pajak Terhutang (SPPT) dan buku DHKP 1, 2 dan 3 Pajak Bumi dan Bangunan (PBB) Sektor Perdesaan dan Perkotaan untuk wilayah Kecamatan ${currentData.detailPenyerahan.kecamatan || '................'} Kabupaten Ogan Komering Ulu Selatan Tahun ${currentData.detailPenyerahan.tahunPajak || '............'}, berupa :
        </p>
        
        <table width="100%" style="margin-bottom: 10px;">
          <tr>
            <td width="5%" valign="top">1.</td>
            <td width="95%" style="text-align: justify;">
              Surat Pemberitahuan Pajak Terutang (SPPT) sebanyak ${formatNumber(currentData.detailPenyerahan.jumlahSPPT) || '......'} (<i>${formatTerbilang(currentData.detailPenyerahan.jumlahSPPT) || '......'}</i>) lembar.
            </td>
          </tr>
          <tr>
            <td width="5%" valign="top">2.</td>
            <td width="95%" style="text-align: justify;">
              Daftar Himpunan Ketetapan dan Pembayaran (DHKP) PBB sebanyak ${formatNumber(currentData.detailPenyerahan.jumlahBukuDHKP) || '......'} (<i>${formatTerbilang(currentData.detailPenyerahan.jumlahBukuDHKP) || '......'}</i>) buku, dengan jumlah ketetapan sebesar <b>Rp. ${formatNumber(currentData.detailPenyerahan.totalKetetapan) || '................'}</b> (<b><i>${formatTerbilang(currentData.detailPenyerahan.totalKetetapan) || '................'} Rupiah</i></b>) sebagaimana terlampir, dengan penjelasan sebagai berikut:
              <table width="100%" style="margin-top: 5px;">
                <tr><td width="5%" valign="top">a.</td><td style="text-align: justify;">DHKP dan SPPT untuk diserahkan kepada kepala Desa/Lurah/Petugas Pemungut dengan menggunakan berita acara.</td></tr>
                <tr><td width="5%" valign="top">b.</td><td style="text-align: justify;">SPPT dapat disampaikan kepada Desa / Kelurahan selambat-lambatnya 5 (lima) hari kerja sejak ditandatanganinya berita acara penyerahan.</td></tr>
                <tr><td width="5%" valign="top">c.</td><td style="text-align: justify;">Pajak terhutang agar dibayar lunas pada tempat pembayaran yang telah dicantumkan pada SPPT.</td></tr>
              </table>
            </td>
          </tr>
        </table>
        
        <p style="text-align: justify; margin-bottom: 20px;">
          Demikian berita acara ini dibuat dalam rangkap 2 (dua) untuk dipergunakan sebagaimana mestinya.
        </p>
        
        <table width="100%" style="text-align: center;">
          <tr>
            <td width="50%" valign="top">
              <p>PIHAK KEDUA</p>
              <p>Camat ${currentData.detailPenyerahan.kecamatan || '................'}</p>
              <p>Kabupaten Ogan Komering Ulu Selatan</p>
              <br/><br/>
              <p><b><u>${currentData.pihakKedua.nama || '................................'}</u></b></p>
              <p>NIP. ${currentData.pihakKedua.nip || '................................'}</p>
            </td>
            <td width="50%" valign="top">
              <p>PIHAK PERTAMA</p>
              <p>Kepala Badan Pendapatan Daerah</p>
              <p>Kabupaten Ogan Komering Ulu Selatan</p>
              <br/><br/>
              <p><b><u>${currentSettings.mengetahuiNama || '................................'}</u></b></p>
              <p>NIP. ${currentSettings.mengetahuiNip || '................................'}</p>
            </td>
          </tr>
        </table>
      `;
    } else {
      // BA_DESA
      content += `
        <div style="text-align: center; margin-bottom: 15px;">
          <div style="font-size: 11pt; font-weight: bold;">
            BERITA ACARA PENYERAHAN SURAT PEMBERITAHUAN PAJAK TERUTANG (SPPT)<br/>
            DAN DAFTAR HIMPUNAN KETETAPAN DAN PEMBAYARAN (DHKP) PBB<br/>
            SEKTOR PERDESAAN DAN PERKOTAAN TAHUN ${currentData.detailPenyerahan.tahunPajak || '............'}
          </div>
          <div style="margin-top: 10px; font-weight: bold;">
            Nomor : ${formatNomor}
          </div>
        </div>
        
        <p style="text-align: justify; margin-bottom: 10px;">
          Pada hari ini <b>${currentData.hari || '............'}</b> tanggal <b>${currentData.tanggal || '............'} (${formatTerbilang(currentData.tanggal) || '............'})</b> bulan <b>${currentData.bulan || '............'}</b> tahun <b>${currentData.tahun || '............'} (${formatTerbilang(currentData.tahun) || '............'})</b>, yang bertanda tangan di bawah ini:
        </p>
        
        <table width="100%" style="margin-bottom: 10px;">
          <tr>
            <td width="5%" valign="top">I.</td>
            <td width="95%">
              <table width="100%">
                <tr><td width="20%">Nama/NIP</td><td width="5%">:</td><td><b>${currentData.pihakPertama.nama || '................................'} / NIP. ${currentData.pihakPertama.nip || '................................'}</b></td></tr>
                <tr><td>Jabatan</td><td>:</td><td>${currentData.pihakPertama.jabatan || '................................'}</td></tr>
              </table>
              <p>Selanjutnya disebut sebagai PIHAK PERTAMA</p>
            </td>
          </tr>
          <tr>
            <td width="5%" valign="top">II.</td>
            <td width="95%">
              <table width="100%">
                <tr><td width="20%">Nama/NIP</td><td width="5%">:</td><td><b>${currentData.pihakKedua.kosongkanData ? '................................' : `${currentData.pihakKedua.nama || '................................'} / NIP. ${currentData.pihakKedua.nip || '................................'}`}</b></td></tr>
                <tr><td>Jabatan</td><td>:</td><td>${currentData.pihakKedua.kosongkanData ? '................................' : (currentData.pihakKedua.jabatan || '................................')}</td></tr>
              </table>
              <p>Selanjutnya disebut sebagai PIHAK KEDUA</p>
            </td>
          </tr>
        </table>
        
        <p style="text-align: justify; margin-bottom: 10px;">
          PIHAK PERTAMA menyerahkan kepada PIHAK KEDUA dan PIHAK KEDUA menerima dari PIHAK PERTAMA Surat Pemberitahuan Pajak Terhutang (SPPT) dan buku DHKP 1, 2 dan 3 Pajak Bumi dan Bangunan (PBB) Sektor Perdesaan dan Perkotaan untuk wilayah Desa ${currentData.detailPenyerahan.kelurahan || '................'} Kecamatan ${currentData.detailPenyerahan.kecamatan || '................'} Kabupaten Ogan Komering Ulu Selatan Tahun ${currentData.detailPenyerahan.tahunPajak || '............'}, berupa :
        </p>
        
        <table width="100%" style="margin-bottom: 10px;">
          <tr>
            <td width="5%" valign="top">1.</td>
            <td width="95%" style="text-align: justify;">
              Surat Pemberitahuan Pajak Terutang (SPPT) sebanyak ${formatNumber(currentData.detailPenyerahan.jumlahSPPT) || '......'} (<i>${formatTerbilang(currentData.detailPenyerahan.jumlahSPPT) || '......'}</i>) lembar.
            </td>
          </tr>
          <tr>
            <td width="5%" valign="top">2.</td>
            <td width="95%" style="text-align: justify;">
              Daftar Himpunan Ketetapan dan Pembayaran (DHKP) PBB sebanyak ${formatNumber(currentData.detailPenyerahan.jumlahBukuDHKP) || '......'} (<i>${formatTerbilang(currentData.detailPenyerahan.jumlahBukuDHKP) || '......'}</i>) buku, dengan jumlah ketetapan sebesar <b>Rp. ${formatNumber(currentData.detailPenyerahan.totalKetetapan) || '................'}</b> (<b><i>${formatTerbilang(currentData.detailPenyerahan.totalKetetapan) || '................'} Rupiah</i></b>) sebagaimana terlampir, dengan penjelasan sebagai berikut:
              <table width="100%" style="margin-top: 5px;">
                <tr><td width="5%" valign="top">a.</td><td style="text-align: justify;">SPPT dapat disampaikan kepada Wajib Pajak selambat-lambatnya 25 (dua puluh lima) hari kerja sejak ditandatanganinya berita acara penyerahan.</td></tr>
                <tr><td width="5%" valign="top">b.</td><td style="text-align: justify;">Pajak terhutang agar dibayar lunas pada tempat pembayaran yang telah dicantumkan pada SPPT.</td></tr>
              </table>
            </td>
          </tr>
        </table>
        
        <p style="text-align: justify; margin-bottom: 20px;">
          Demikian berita acara ini dibuat dalam rangkap 2 (dua) untuk dipergunakan sebagaimana mestinya.
        </p>
        
        <table width="100%" style="text-align: center; margin-bottom: 15px;">
          <tr>
            <td width="50%" valign="top">
              <p>PIHAK KEDUA</p>
              <br/><br/>
              <p><b><u>${currentData.pihakKedua.kosongkanData ? '................................' : (currentData.pihakKedua.nama || '................................')}</u></b></p>
              <p>NIP. ${currentData.pihakKedua.kosongkanData ? '................................' : (currentData.pihakKedua.nip || '................................')}</p>
            </td>
            <td width="50%" valign="top">
              <p>PIHAK PERTAMA</p>
              <p>Camat ${currentData.detailPenyerahan.kecamatan || '................'}</p>
              <p>Kabupaten Ogan Komering Ulu Selatan</p>
              <br/><br/>
              <p><b><u>${currentData.pihakPertama.nama || '................................'}</u></b></p>
              <p>NIP. ${currentData.pihakPertama.nip || '................................'}</p>
            </td>
          </tr>
        </table>
        
        <table width="100%" style="text-align: center;">
          <tr>
            <td width="100%">
              <p><b>MENGETAHUI</b></p>
              <p>Kepala Badan Pendapatan Daerah</p>
              <p>Kabupaten Ogan Komering Ulu Selatan</p>
              <br/><br/>
              <p><b><u>${currentSettings.mengetahuiNama || '................................'}</u></b></p>
              <p>NIP. ${currentSettings.mengetahuiNip || '................................'}</p>
            </td>
          </tr>
        </table>
      `;
    }

    const html = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Berita Acara</title>
        <style>
          @page WordSection1 {
            size: 21.5cm 33.0cm;
            margin: 1.0cm 2.0cm 1.5cm 2.0cm;
            mso-header-margin: 35.4pt;
            mso-footer-margin: 35.4pt;
            mso-paper-source: 0;
          }
          div.WordSection1 { page: WordSection1; }
          body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5; }
          p { margin: 0; padding: 0; }
        </style>
      </head>
      <body>
        <div class="WordSection1">
          ${content}
        </div>
      </body>
      </html>
    `;

    return new Blob(['\ufeff', html], {
      type: 'application/msword'
    });
  };

  const handleDownloadWord = async () => {
    setIsGeneratingWord(true);
    try {
      const blob = generateDocxBlob(data, settings);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Berita_Acara_PBB_${data.detailPenyerahan.kelurahan || 'Dokumen'}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate Word", err);
    } finally {
      setIsGeneratingWord(false);
    }
  };

  const downloadExcelTemplate = () => {
    const headers = [
      'templateType', 'nomorBeritaAcara', 'hari', 'tanggal', 'bulan', 'tahun',
      'pihakPertama_nama', 'pihakPertama_jabatan', 'pihakPertama_nip',
      'pihakKedua_nama', 'pihakKedua_jabatan', 'pihakKedua_nip', 'pihakKedua_kosongkanData',
      'detailPenyerahan_tahunPajak', 'detailPenyerahan_jumlahSPPT', 'detailPenyerahan_jumlahBukuDHKP',
      'detailPenyerahan_totalKetetapan', 'detailPenyerahan_kecamatan', 'detailPenyerahan_kelurahan'
    ];
    
    const sampleRow = [
      'BA_DESA', '123', 'Senin', '01', 'Januari', '2026',
      'Andi Wijaya', 'Camat Muaradua', '198001012005011001',
      'Budi Santoso', 'Kepala Desa', '198502022010011002', 'false',
      '2026', '500', '5',
      '1500000', 'Muaradua', 'Batu Belang Jaya'
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers, sampleRow]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'Template_Batch_PBB.xlsx');
  };

  const handleBatchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        setBatchData(data);
      } catch (err: any) {
        setError(`Gagal membaca file Excel: ${err.message}`);
      }
    };
    reader.onerror = () => {
      setError('Gagal membaca file');
    };
    reader.readAsBinaryString(file);
  };

  const handleGenerateBatchPreview = () => {
    if (batchData.length === 0) return;
    
    try {
      const parsedData: PBBHandoverData[] = batchData.map((row) => ({
        templateType: (row.templateType as TemplateType) || 'BA_CAMAT',
        nomorBeritaAcara: row.nomorBeritaAcara || '',
        hari: row.hari || '',
        tanggal: row.tanggal || '',
        bulan: row.bulan || '',
        tahun: row.tahun || '',
        pihakPertama: {
          nama: row.pihakPertama_nama || '',
          jabatan: row.pihakPertama_jabatan || '',
          nip: row.pihakPertama_nip || '',
          instansi: 'Badan Pendapatan Daerah Kabupaten Ogan Komering Ulu Selatan'
        },
        pihakKedua: {
          nama: row.pihakKedua_nama || '',
          jabatan: row.pihakKedua_jabatan || '',
          nip: row.pihakKedua_nip || '',
          instansi: '',
          kosongkanData: String(row.pihakKedua_kosongkanData).toLowerCase() === 'true'
        },
        detailPenyerahan: {
          tahunPajak: row.detailPenyerahan_tahunPajak || '',
          jumlahSPPT: String(row.detailPenyerahan_jumlahSPPT || '').replace(/[^0-9]/g, ''),
          jumlahBukuDHKP: String(row.detailPenyerahan_jumlahBukuDHKP || '').replace(/[^0-9]/g, ''),
          totalKetetapan: String(row.detailPenyerahan_totalKetetapan || '').replace(/[^0-9]/g, ''),
          kecamatan: row.detailPenyerahan_kecamatan || '',
          kelurahan: row.detailPenyerahan_kelurahan || ''
        }
      }));
      
      setBatchPreviewData(parsedData);
      setCurrentBatchPreviewIndex(0);
    } catch (err) {
      setError('Terjadi kesalahan saat memproses data batch.');
      console.error(err);
    }
  };

  const downloadBatchZIP = async () => {
    if (!batchPreviewData || batchPreviewData.length === 0) return;
    
    setIsGeneratingBatch(true);
    setBatchProgress(0);
    
    try {
      const zip = new JSZip();
      
      for (let i = 0; i < batchPreviewData.length; i++) {
        const currentData = batchPreviewData[i];
        const blob = generateDocxBlob(currentData, settings);
        const fileName = `BA_PBB_${currentData.detailPenyerahan.kelurahan || `Dokumen_${i+1}`}.doc`;
        zip.file(fileName, blob);
        
        setBatchProgress(Math.round(((i + 1) / batchPreviewData.length) * 100));
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'Batch_Berita_Acara_PBB.zip');
    } catch (err) {
      setError('Terjadi kesalahan saat membuat file ZIP.');
      console.error(err);
    } finally {
      setIsGeneratingBatch(false);
      setBatchProgress(0);
    }
  };

  const handlePrintBatchCurrent = () => {
    setPrintData([data]);
  };

  const handlePrintBatchAll = () => {
    if (!batchPreviewData || batchPreviewData.length === 0) return;
    setPrintData(batchPreviewData);
  };

  const handlePrintBatchSingle = () => {
    if (!batchPreviewData) return;
    setPrintData([batchPreviewData[currentBatchPreviewIndex]]);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 no-print-root">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              setStep(1);
              setPreviewMode(false);
              setBatchPreviewData(null);
            }}
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:bg-indigo-700 transition-colors"
            >
              <Home size={20} />
            </motion.div>
            <div className="hidden sm:block">
              <h1 className="font-black text-slate-900 leading-none">PBB</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Handover</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <HelpCircle size={18} />
              <span className="hidden md:inline">Bantuan</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Layout size={18} />
              <span className="hidden md:inline">Pengaturan</span>
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTemplates(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <FileText size={18} />
              <span className="hidden md:inline">Templates</span>
            </motion.button>
            {step > 1 && step !== 3 && (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {previewMode ? <ChevronLeft size={18} /> : <Printer size={18} />}
                <span className="hidden sm:inline">{previewMode ? "Edit Data" : "Preview & Cetak"}</span>
                <span className="sm:hidden">{previewMode ? "Edit" : "Preview"}</span>
              </motion.button>
            )}
            {step === 3 && (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={18} />
                Kembali
              </motion.button>
            )}
            {step === 2 && !previewMode && (
              <div className="flex items-center gap-2">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownloadWord}
                  className="flex items-center justify-center w-10 h-10 sm:w-auto sm:px-4 sm:py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  title="Download DOCX"
                >
                  <FileText size={18} />
                  <span className="hidden sm:inline ml-2">DOCX</span>
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownloadPDF}
                  className="flex items-center justify-center w-10 h-10 sm:w-auto sm:px-4 sm:py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                  title="Download PDF"
                >
                  <Download size={18} />
                  <span className="hidden sm:inline ml-2">PDF</span>
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 no-print">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
                  PBB Handover <span className="text-indigo-600">Generator</span>
                </h1>
                <p className="text-lg text-slate-600 max-w-lg mx-auto leading-relaxed">
                  Pilih metode pembuatan Berita Acara Penyerahan PBB Anda.
                </p>
              </div>

              <div className="grid gap-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(2)}
                  className="group relative w-full p-6 bg-white border-2 border-slate-200 rounded-3xl transition-all hover:border-indigo-500 hover:shadow-xl hover:-translate-y-1 flex items-center gap-6 text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-110 group-hover:bg-indigo-100/50"></div>
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                    <FileText size={32} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Proses Manual</h3>
                    <p className="text-sm text-slate-500">Input data satu per satu melalui formulir interaktif</p>
                  </div>
                  <ChevronRight size={24} className="ml-auto text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(3)}
                  className="group relative w-full p-6 bg-white border-2 border-slate-200 rounded-3xl transition-all hover:border-indigo-500 hover:shadow-xl hover:-translate-y-1 flex items-center gap-6 text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 transition-all group-hover:scale-110 group-hover:bg-emerald-100/50"></div>
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                    <FileSpreadsheet size={32} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">Upload Data Massal</h3>
                    <p className="text-sm text-slate-500">Generate banyak dokumen sekaligus menggunakan file Excel</p>
                  </div>
                  <ChevronRight size={24} className="ml-auto text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </motion.button>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 text-sm">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}
            </motion.div>
          ) : step === 3 ? (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                    <FileSpreadsheet size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Batch Processing</h2>
                    <p className="text-sm text-slate-500">Buat banyak Berita Acara sekaligus dari file Excel</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="font-semibold text-slate-900 mb-2">Langkah 1: Download Template</h3>
                    <p className="text-sm text-slate-600 mb-4">Download template Excel dan isi data sesuai dengan format yang disediakan. Jangan mengubah baris pertama (header).</p>
                    <button 
                      onClick={downloadExcelTemplate}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Download size={16} />
                      Download Template Excel
                    </button>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h3 className="font-semibold text-slate-900 mb-2">Langkah 2: Upload Data</h3>
                    <p className="text-sm text-slate-600 mb-4">Upload file Excel yang sudah diisi data.</p>
                    
                    <label className="relative group cursor-pointer block">
                      <input 
                        type="file" 
                        accept=".xlsx, .xls" 
                        onChange={handleBatchUpload}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed border-slate-300 bg-white rounded-xl p-8 transition-all group-hover:border-indigo-400 group-hover:bg-indigo-50/50 flex flex-col items-center justify-center gap-2">
                        <Upload size={24} className="text-indigo-600" />
                        <span className="font-medium text-slate-700">Pilih File Excel</span>
                      </div>
                    </label>

                    {batchData.length > 0 && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-700">
                          <CheckCircle2 size={18} />
                          <span className="text-sm font-medium">{batchData.length} baris data berhasil dibaca</span>
                        </div>
                        <button 
                          onClick={() => setBatchData([])}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {batchData.length > 0 && !batchPreviewData && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h3 className="font-semibold text-slate-900 mb-2">Langkah 3: Generate Preview</h3>
                      <p className="text-sm text-slate-600 mb-4">Proses data untuk melihat preview dokumen sebelum dicetak atau didownload.</p>
                      
                      <button 
                        onClick={handleGenerateBatchPreview}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                      >
                        <Layout size={18} />
                        Generate Preview
                      </button>
                    </div>
                  )}

                  {batchPreviewData && batchPreviewData.length > 0 && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-slate-900">Preview Dokumen ({currentBatchPreviewIndex + 1} dari {batchPreviewData.length})</h3>
                          <p className="text-sm text-slate-600">Periksa dokumen sebelum diunduh atau dicetak.</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setCurrentBatchPreviewIndex(Math.max(0, currentBatchPreviewIndex - 1))}
                            disabled={currentBatchPreviewIndex === 0}
                            className="p-2 bg-white border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <button 
                            onClick={() => setCurrentBatchPreviewIndex(Math.min(batchPreviewData.length - 1, currentBatchPreviewIndex + 1))}
                            disabled={currentBatchPreviewIndex === batchPreviewData.length - 1}
                            className="p-2 bg-white border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-6">
                        <div className="bg-slate-800 px-4 py-2 flex items-center justify-between text-white">
                          <span className="text-xs font-medium">Preview {batchPreviewData[currentBatchPreviewIndex].detailPenyerahan.kelurahan || `Dokumen ${currentBatchPreviewIndex + 1}`}</span>
                        </div>
                        <div className="p-4 bg-slate-200/50 overflow-auto max-h-[500px] flex justify-center">
                          <div className="scale-[0.6] sm:scale-75 origin-top print:scale-100 print:transform-none">
                            <DocumentPreview 
                              data={batchPreviewData[currentBatchPreviewIndex]} 
                              settings={settings} 
                              onUpdate={(path, value) => updateBatchField(currentBatchPreviewIndex, path, value)}
                              onUpdateSettings={(path, value) => saveSettings({ ...settings, [path]: value })}
                            />
                          </div>
                        </div>
                      </div>

                      <h3 className="font-semibold text-slate-900 mb-2">Langkah 4: Download / Cetak</h3>
                      <p className="text-sm text-slate-600 mb-4">Download semua dokumen dalam format ZIP atau cetak dokumen yang sedang dilihat.</p>
                      
                      <div className="grid sm:grid-cols-2 gap-3">
                        {isGeneratingBatch ? (
                          <div className="space-y-2 col-span-full">
                            <div className="flex justify-between text-sm font-medium text-slate-700">
                              <span>Memproses dokumen...</span>
                              <span>{batchProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2.5">
                              <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${batchProgress}%` }}></div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button 
                              onClick={downloadBatchZIP}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                              <Archive size={18} />
                              Download Semua (ZIP)
                            </button>
                            <button 
                              onClick={handlePrintBatchSingle}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
                            >
                              <Printer size={18} />
                              Cetak Dokumen Ini
                            </button>
                            <button 
                              onClick={handlePrintBatchAll}
                              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
                            >
                              <Printer size={18} />
                              Cetak Semua ({batchPreviewData?.length || 0})
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 text-sm">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid lg:grid-cols-12 gap-6 items-start"
            >
              {/* Form Section */}
              <div className={cn("space-y-4 lg:col-span-4 xl:col-span-3", previewMode && "hidden lg:block")}>
                <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <Layout size={20} />
                      <h3 className="font-bold">Pilih Format Dokumen</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => updateField('templateType', 'BA_CAMAT')}
                      className={cn(
                        "p-4 border-2 rounded-xl text-left transition-all",
                        data.templateType === 'BA_CAMAT' 
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700" 
                          : "border-slate-100 hover:border-slate-200 text-slate-600"
                      )}
                    >
                      <p className="font-bold">BA Camat</p>
                      <p className="text-xs opacity-70">Format untuk tingkat Kecamatan</p>
                    </button>
                    <button 
                      onClick={() => updateField('templateType', 'BA_DESA')}
                      className={cn(
                        "p-4 border-2 rounded-xl text-left transition-all",
                        data.templateType === 'BA_DESA' 
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700" 
                          : "border-slate-100 hover:border-slate-200 text-slate-600"
                      )}
                    >
                      <p className="font-bold">BA Desa</p>
                      <p className="text-xs opacity-70">Format untuk tingkat Desa/Kelurahan</p>
                    </button>
                  </div>
                </section>

                <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <Calendar size={20} />
                      <h3 className="font-bold">Informasi Dokumen</h3>
                    </div>
                    <button 
                      onClick={() => setShowSaveModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      <Save size={14} />
                      Simpan Template
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Nomor Berita Acara</label>
                      {isAnalyzing ? <SkeletonInput /> : (
                        <input 
                          type="number"
                          min="1"
                          max="9999"
                          value={data.nomorBeritaAcara}
                          onChange={(e) => updateField('nomorBeritaAcara', e.target.value)}
                          className={INPUT_CLASSES}
                          placeholder="Contoh: 123"
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Hari</label>
                      {isAnalyzing ? <SkeletonInput /> : (
                        <input 
                          value={data.hari}
                          onChange={(e) => updateField('hari', e.target.value)}
                          className={INPUT_CLASSES}
                          placeholder="Contoh: Senin"
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Tanggal</label>
                      {isAnalyzing ? <SkeletonInput /> : (
                        <input 
                          value={data.tanggal}
                          onChange={(e) => updateField('tanggal', e.target.value)}
                          className={INPUT_CLASSES}
                          placeholder="Contoh: 01"
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Bulan</label>
                      {isAnalyzing ? <SkeletonInput /> : (
                        <input 
                          value={data.bulan}
                          onChange={(e) => updateField('bulan', e.target.value)}
                          className={INPUT_CLASSES}
                          placeholder="Contoh: Januari"
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Tahun</label>
                      {isAnalyzing ? <SkeletonInput /> : (
                        <input 
                          value={data.tahun}
                          onChange={(e) => updateField('tahun', e.target.value)}
                          className={INPUT_CLASSES}
                          placeholder="Contoh: 2024"
                        />
                      )}
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-4 text-indigo-600">
                    <User size={20} />
                    <h3 className="font-bold">Pihak Pertama (Penyerah)</h3>
                  </div>
                    <div className="grid gap-3">
                      {data.templateType === 'BA_DESA' && (
                        <>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-slate-500 uppercase">Nama Lengkap</label>
                            {isAnalyzing ? <SkeletonInput /> : (
                              <input 
                                value={data.pihakPertama.nama}
                                onChange={(e) => updateField('pihakPertama.nama', e.target.value)}
                                className={INPUT_CLASSES}
                              />
                            )}
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-slate-500 uppercase">Jabatan</label>
                              {isAnalyzing ? <SkeletonInput /> : (
                                <input 
                                  value={data.pihakPertama.jabatan}
                                  onChange={(e) => updateField('pihakPertama.jabatan', e.target.value)}
                                  className={INPUT_CLASSES}
                                />
                              )}
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-slate-500 uppercase">NIP</label>
                              {isAnalyzing ? <SkeletonInput /> : (
                                <input 
                                  value={data.pihakPertama.nip}
                                  onChange={(e) => updateField('pihakPertama.nip', e.target.value)}
                                  className={INPUT_CLASSES}
                                />
                              )}
                            </div>
                          </div>
                        </>
                      )}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase">Instansi</label>
                        {isAnalyzing ? <SkeletonInput /> : (
                          <input 
                            value={data.pihakPertama.instansi}
                            onChange={(e) => updateField('pihakPertama.instansi', e.target.value)}
                            className={INPUT_CLASSES}
                          />
                        )}
                      </div>
                    </div>
                </section>

                <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-indigo-600">
                      <User size={20} />
                      <h3 className="font-bold">Pihak Kedua (Penerima)</h3>
                    </div>
                    {data.templateType === 'BA_DESA' && (
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={data.pihakKedua.kosongkanData}
                          onChange={(e) => updateField('pihakKedua.kosongkanData', e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        Kosongkan Isian
                      </label>
                    )}
                  </div>
                  <div className={cn("grid gap-3 transition-opacity", (data.pihakKedua.kosongkanData && data.templateType === 'BA_DESA') || isAnalyzing ? "opacity-50 pointer-events-none" : "")}>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Nama Lengkap</label>
                      {isAnalyzing ? <SkeletonInput /> : (
                        <input 
                          value={data.pihakKedua.nama}
                          onChange={(e) => updateField('pihakKedua.nama', e.target.value)}
                          className={INPUT_CLASSES}
                        />
                      )}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase">Jabatan</label>
                        {isAnalyzing ? <SkeletonInput /> : (
                          <input 
                            value={data.pihakKedua.jabatan}
                            onChange={(e) => updateField('pihakKedua.jabatan', e.target.value)}
                            className={INPUT_CLASSES}
                          />
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-slate-500 uppercase">NIP</label>
                        {isAnalyzing ? <SkeletonInput /> : (
                          <input 
                            value={data.pihakKedua.nip}
                            onChange={(e) => updateField('pihakKedua.nip', e.target.value)}
                            className={INPUT_CLASSES}
                          />
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Instansi</label>
                      {isAnalyzing ? <SkeletonInput /> : (
                        <input 
                          value={data.pihakKedua.instansi}
                          onChange={(e) => updateField('pihakKedua.instansi', e.target.value)}
                          className={INPUT_CLASSES}
                        />
                      )}
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-4 text-indigo-600">
                    <MapPin size={20} />
                    <h3 className="font-bold">Detail Penyerahan</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Tahun Pajak</label>
                      {isAnalyzing ? <SkeletonInput /> : (
                        <input 
                          value={data.detailPenyerahan.tahunPajak}
                          onChange={(e) => updateField('detailPenyerahan.tahunPajak', e.target.value)}
                          className={INPUT_CLASSES}
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Jumlah SPPT</label>
                      {isAnalyzing ? <SkeletonInput /> : (
                        <input 
                          value={formatNumber(data.detailPenyerahan.jumlahSPPT)}
                          onChange={(e) => updateField('detailPenyerahan.jumlahSPPT', e.target.value)}
                          className={INPUT_CLASSES}
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Jumlah Buku DHKP</label>
                      {isAnalyzing ? <SkeletonInput /> : (
                        <input 
                          value={formatNumber(data.detailPenyerahan.jumlahBukuDHKP)}
                          onChange={(e) => updateField('detailPenyerahan.jumlahBukuDHKP', e.target.value)}
                          className={INPUT_CLASSES}
                          placeholder="Contoh: 16"
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Total Ketetapan (Rp)</label>
                      {isAnalyzing ? <SkeletonInput /> : (
                        <input 
                          value={formatNumber(data.detailPenyerahan.totalKetetapan)}
                          onChange={(e) => updateField('detailPenyerahan.totalKetetapan', e.target.value)}
                          className={INPUT_CLASSES}
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Kecamatan</label>
                      {isAnalyzing ? <SkeletonInput /> : (
                        <input 
                          value={data.detailPenyerahan.kecamatan}
                          onChange={(e) => updateField('detailPenyerahan.kecamatan', e.target.value)}
                          className={INPUT_CLASSES}
                        />
                      )}
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Kelurahan/Desa</label>
                      {isAnalyzing ? <SkeletonInput /> : (
                        <input 
                          value={data.detailPenyerahan.kelurahan}
                          onChange={(e) => updateField('detailPenyerahan.kelurahan', e.target.value)}
                          className={INPUT_CLASSES}
                        />
                      )}
                    </div>
                  </div>
                </section>
              </div>

              {/* Preview Section */}
              <div className={cn("sticky top-24 lg:col-span-8 xl:col-span-9", previewMode && "block lg:block")}>
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-800 px-6 py-3 flex items-center justify-between text-white">
                    <span className="text-sm font-medium">Preview Dokumen</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={handlePrintBatchCurrent}
                        className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors"
                        title="Cetak Dokumen"
                      >
                        <Printer size={16} />
                      </button>
                      <button 
                        onClick={handleDownloadWord}
                        disabled={isGeneratingWord}
                        className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors disabled:opacity-50"
                        title="Download DOCX"
                      >
                        {isGeneratingWord ? <RefreshCw size={16} className="animate-spin" /> : <FileText size={16} />}
                      </button>
                      <button 
                        onClick={handleDownloadPDF}
                        disabled={isGeneratingPDF}
                        className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors disabled:opacity-50"
                        title="Download PDF"
                      >
                        {isGeneratingPDF ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-8 bg-slate-200/50 overflow-auto max-h-[calc(100vh-200px)] flex justify-center">
                    <DocumentPreview 
                      data={data} 
                      settings={settings} 
                      documentRef={documentRef} 
                      onUpdate={updateField}
                      onUpdateSettings={(path, value) => saveSettings({ ...settings, [path]: value })}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Button for Mobile */}
      {step === 2 && (
        <div className="fixed bottom-6 right-6 lg:hidden flex flex-col gap-3 fab-container no-print">
          <button 
            onClick={() => setShowSaveModal(true)}
            className="w-14 h-14 bg-white text-indigo-600 rounded-full shadow-lg border border-slate-200 flex items-center justify-center"
          >
            <Save size={24} />
          </button>
          <button 
            onClick={() => setPreviewMode(!previewMode)}
            className="w-14 h-14 bg-white text-slate-700 rounded-full shadow-lg border border-slate-200 flex items-center justify-center"
          >
            {previewMode ? <ChevronLeft size={24} /> : <Layout size={24} />}
          </button>
          {previewMode && (
            <button 
              onClick={handlePrintBatchCurrent}
              className="w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center"
            >
              <Printer size={24} />
            </button>
          )}
          {!previewMode && (
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleDownloadWord}
                disabled={isGeneratingWord}
                className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center disabled:opacity-50"
              >
                {isGeneratingWord ? <RefreshCw size={24} className="animate-spin" /> : <FileText size={24} />}
              </button>
              <button 
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center disabled:opacity-50"
              >
                {isGeneratingPDF ? <RefreshCw size={24} className="animate-spin" /> : <Download size={24} />}
              </button>
            </div>
          )}
        </div>
      )}
      {/* Batch Print All Container */}
      {printData && (
        <div className="print-only-container">
          {printData.map((item, index) => (
            <div key={index} className="print-page-wrapper">
              <DocumentPreview 
                data={item} 
                settings={settings} 
              />
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showTemplates && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-container no-print">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTemplates(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Daftar Template</h3>
                <button onClick={() => setShowTemplates(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {/* AI Extraction Section */}
                <div className="mb-8 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-2 mb-3 text-indigo-700">
                    <RefreshCw size={18} className={isAnalyzing ? "animate-spin" : ""} />
                    <h4 className="font-bold text-sm uppercase tracking-wider">Ekstrak Data dari Gambar (AI)</h4>
                  </div>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    Punya foto atau scan dokumen lama? Upload di sini untuk mengekstrak datanya secara otomatis menggunakan AI.
                  </p>
                  <label className="relative group cursor-pointer block">
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className={cn(
                      "border-2 border-dashed border-indigo-200 bg-white rounded-xl p-6 transition-all hover:border-indigo-400 hover:bg-indigo-50 flex flex-col items-center justify-center gap-2",
                      isAnalyzing && "pointer-events-none opacity-50"
                    )}>
                      {isAnalyzing ? (
                        <div className="flex flex-col items-center gap-2">
                          <RefreshCw className="animate-spin text-indigo-600" size={24} />
                          <span className="text-xs font-medium text-slate-700">Menganalisa...</span>
                        </div>
                      ) : (
                        <>
                          <Upload size={24} className="text-indigo-600" />
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">Upload Gambar Dokumen</span>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                <div className="flex items-center gap-2 mb-4 text-slate-500">
                  <Layout size={18} />
                  <h4 className="font-bold text-sm uppercase tracking-wider">Template Tersimpan</h4>
                </div>

                {templates.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Layout size={32} />
                    </div>
                    <p className="text-slate-500">Belum ada template yang disimpan.</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {templates.map((template) => (
                      <div 
                        key={template.id}
                        className={cn(
                          "group p-4 border rounded-xl flex items-center justify-between transition-all hover:border-indigo-200 hover:bg-indigo-50/30",
                          template.isDefault ? "border-indigo-200 bg-indigo-50/50" : "border-slate-200"
                        )}
                      >
                        <div className="flex-1 cursor-pointer" onClick={() => loadTemplate(template.id)}>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">{template.name}</span>
                            {template.isDefault && (
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full uppercase">Default</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {template.data.pihakPertama.nama || 'Tanpa Nama'} • {template.data.detailPenyerahan.kelurahan || 'Tanpa Kelurahan'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setDefaultTemplate(template.id)}
                            className={cn(
                              "p-2 rounded-lg transition-colors",
                              template.isDefault ? "text-yellow-500" : "text-slate-400 hover:text-yellow-500 hover:bg-yellow-50"
                            )}
                            title="Set as Default"
                          >
                            <Star size={18} fill={template.isDefault ? "currentColor" : "none"} />
                          </button>
                          <button 
                            onClick={() => deleteTemplate(template.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100">
                <p className="text-xs text-slate-500 italic">
                  * Template default akan otomatis mengisi formulir saat aplikasi dibuka.
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {showHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-container no-print">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelp(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2 text-indigo-600">
                  <HelpCircle size={20} />
                  <h3 className="font-bold text-slate-900">Panduan Penggunaan</h3>
                </div>
                <button onClick={() => setShowHelp(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-indigo-600">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Zap size={18} />
                    </div>
                    <h4 className="font-bold text-lg">1. Mulai Cepat</h4>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Anda bisa mulai dengan memilih <span className="font-bold text-slate-900">"Pilih Template"</span> untuk menggunakan data yang sudah disimpan, atau gunakan fitur <span className="font-bold text-slate-900">"Ekstrak Data (AI)"</span> dengan mengupload foto dokumen lama. AI akan otomatis mengisi form untuk Anda.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-indigo-600">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <FileText size={18} />
                    </div>
                    <h4 className="font-bold text-lg">2. Pilih Format & Isi Data</h4>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Pilih antara <span className="font-bold text-slate-900">BA Camat</span> (untuk tingkat Kecamatan) atau <span className="font-bold text-slate-900">BA Desa</span> (untuk tingkat Kelurahan/Desa). Isi semua field yang diperlukan seperti Nomor Berita Acara, Tanggal, dan Detail Penyerahan.
                  </p>
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
                    <AlertCircle className="text-amber-600 shrink-0" size={20} />
                    <p className="text-sm text-amber-800">
                      Untuk BA Desa, Anda bisa mencentang <span className="font-bold">"Kosongkan Isian"</span> pada Pihak Kedua jika ingin mengisi data penerima secara manual setelah dicetak.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-indigo-600">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <FileSpreadsheet size={18} />
                    </div>
                    <h4 className="font-bold text-lg">3. Proses Banyak Sekaligus (Batch)</h4>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Gunakan fitur <span className="font-bold text-slate-900">"Batch Processing"</span> untuk membuat banyak dokumen sekaligus. Download template Excel yang disediakan, isi datanya, lalu upload kembali. Sistem akan men-generate semua dokumen dalam satu file ZIP.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-indigo-600">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Settings size={18} />
                    </div>
                    <h4 className="font-bold text-lg">4. Kustomisasi Kop & Logo</h4>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Klik tombol <span className="font-bold text-slate-900">"Pengaturan"</span> di header untuk mengubah teks Kop Surat, Alamat, dan mengupload Logo instansi Anda. Pengaturan ini akan tersimpan otomatis di browser Anda.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-indigo-600">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Download size={18} />
                    </div>
                    <h4 className="font-bold text-lg">5. Preview & Ekspor</h4>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Lihat hasil dokumen secara real-time di panel Preview. Anda bisa mendownload dokumen dalam format <span className="font-bold text-slate-900">PDF</span>, <span className="font-bold text-slate-900">Word (DOCX)</span>, atau langsung <span className="font-bold text-slate-900">Cetak</span> menggunakan printer.
                  </p>
                </div>
              </div>
              
              <div className="px-6 py-6 border-t border-slate-100 bg-slate-50 flex justify-center">
                <button 
                  onClick={() => setShowHelp(false)}
                  className="w-full sm:w-auto px-12 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 active:scale-95"
                >
                  Saya Mengerti, Mulai Sekarang
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-container no-print">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Pengaturan Dokumen</h3>
                <button onClick={() => setShowSettings(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Logo Kop Surat</label>
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-24 border border-slate-200 rounded flex items-center justify-center overflow-hidden bg-slate-50">
                      {settings.kopLogoBase64 ? (
                        <img src={settings.kopLogoBase64} alt="Logo" className="max-w-full max-h-full object-contain" />
                      ) : (
                        <span className="text-xs text-slate-400">Kosong</span>
                      )}
                    </div>
                    <div>
                      <label className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer inline-block flex items-center gap-2">
                        {isUploadingLogo ? (
                          <>
                            <RefreshCw size={16} className="animate-spin text-indigo-600" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            Upload Logo
                            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                          </>
                        )}
                      </label>
                      <p className="text-xs text-slate-500 mt-2">Gunakan gambar dengan background transparan (PNG) untuk hasil terbaik.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Baris 1 Kop Surat</label>
                  <input 
                    value={settings.kopLine1}
                    onChange={(e) => saveSettings({ ...settings, kopLine1: e.target.value })}
                    className={INPUT_CLASSES}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Baris 2 Kop Surat</label>
                  <input 
                    value={settings.kopLine2}
                    onChange={(e) => saveSettings({ ...settings, kopLine2: e.target.value })}
                    className={INPUT_CLASSES}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Baris 3 Kop Surat</label>
                  <input 
                    value={settings.kopLine3 || ''}
                    onChange={(e) => saveSettings({ ...settings, kopLine3: e.target.value })}
                    className={INPUT_CLASSES}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Alamat Kop Surat</label>
                  <input 
                    value={settings.kopAddress}
                    onChange={(e) => saveSettings({ ...settings, kopAddress: e.target.value })}
                    className={INPUT_CLASSES}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Format Nomor Berita Acara</label>
                  <input 
                    value={settings.nomorFormat || ''}
                    onChange={(e) => saveSettings({ ...settings, nomorFormat: e.target.value })}
                    className={INPUT_CLASSES}
                    placeholder="Contoh: 973/ /BAPENDA/2026"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">Pejabat Mengetahui</h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">Nama Kepala Badan</label>
                      <input 
                        value={settings.mengetahuiNama}
                        onChange={(e) => saveSettings({ ...settings, mengetahuiNama: e.target.value })}
                        className={INPUT_CLASSES}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-slate-500 uppercase">NIP Kepala Badan</label>
                      <input 
                        value={settings.mengetahuiNip}
                        onChange={(e) => saveSettings({ ...settings, mengetahuiNip: e.target.value })}
                        className={INPUT_CLASSES}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">Kecerdasan Buatan (AI)</h4>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">Gemini API Key (Opsional)</label>
                    <input 
                      type="password"
                      value={settings.customGeminiKey || ''}
                      onChange={(e) => saveSettings({ ...settings, customGeminiKey: e.target.value })}
                      className={INPUT_CLASSES}
                      placeholder="Masukkan API Key Anda jika ada"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Kosongkan untuk menggunakan API Key default sistem. API Key Anda akan disimpan secara lokal di browser ini.
                    </p>
                  </div>
                  
                  <div className="pt-2">
                    <button 
                      onClick={async () => {
                        if (window.aistudio) {
                          await window.aistudio.openSelectKey();
                        } else {
                          alert("Fitur ini hanya tersedia di lingkungan AI Studio.");
                        }
                      }}
                      className="w-full py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Zap size={14} className="text-amber-500" />
                      Gunakan API Key dari AI Studio
                    </button>
                    <p className="text-[9px] text-slate-400 mt-1 text-center">
                      Gunakan opsi ini jika Anda ingin menggunakan API Key berbayar dari Google Cloud.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full py-3 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Selesai
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showSaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-container no-print">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSaveModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Simpan sebagai Template</h3>
                <button onClick={() => setShowSaveModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">Nama Template</label>
                    <input 
                      autoFocus
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveTemplate()}
                      className={INPUT_CLASSES}
                      placeholder="Contoh: Template Kelurahan Merdeka"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Semua data yang saat ini terisi akan disimpan ke dalam template ini.
                  </p>
                </div>
              </div>
              <div className="p-6 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={saveTemplate}
                  disabled={!templateName.trim()}
                  className="flex-1 py-3 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  Simpan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="max-w-7xl mx-auto px-4 py-12 mt-auto border-t border-slate-100">
        <div className="flex flex-col items-center gap-4">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-10 h-10 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center cursor-pointer"
            onClick={() => {
              setStep(1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <Home size={20} />
          </motion.div>
          <p className="text-sm text-slate-500 flex items-center justify-center gap-1.5 font-medium">
            Made with <Heart size={16} className="text-red-500 fill-red-500 animate-pulse" /> by <span className="text-slate-900 font-bold">Ucup</span> @2026
          </p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-4">
            <span>PBB Handover Generator v2.0</span>
            <span className="w-1 h-1 bg-slate-200 rounded-full" />
            <button 
              onClick={() => setShowHelp(true)}
              className="text-indigo-500 hover:text-indigo-600 transition-colors"
            >
              Butuh bantuan?
            </button>
          </p>
        </div>
      </footer>
    </div>
  );
}
