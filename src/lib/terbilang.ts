export function terbilang(angka: number): string {
  const huruf = [
    "", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"
  ];
  
  if (angka === 0) return "";
  if (angka < 12) return huruf[angka];
  if (angka < 20) return terbilang(angka - 10) + " Belas";
  if (angka < 100) return terbilang(Math.floor(angka / 10)) + " Puluh " + terbilang(angka % 10);
  if (angka < 200) return "Seratus " + terbilang(angka - 100);
  if (angka < 1000) return terbilang(Math.floor(angka / 100)) + " Ratus " + terbilang(angka % 100);
  if (angka < 2000) return "Seribu " + terbilang(angka - 1000);
  if (angka < 1000000) return terbilang(Math.floor(angka / 1000)) + " Ribu " + terbilang(angka % 1000);
  if (angka < 1000000000) return terbilang(Math.floor(angka / 1000000)) + " Juta " + terbilang(angka % 1000000);
  if (angka < 1000000000000) return terbilang(Math.floor(angka / 1000000000)) + " Miliar " + terbilang(angka % 1000000000);
  if (angka < 1000000000000000) return terbilang(Math.floor(angka / 1000000000000)) + " Triliun " + terbilang(angka % 1000000000000);
  return "";
}

export function formatTerbilang(angkaStr: string | number | undefined | null): string {
  if (angkaStr === undefined || angkaStr === null || angkaStr === '') return "";
  const str = String(angkaStr);
  // Remove non-numeric characters (like dots in 88.844.705)
  const cleanStr = str.replace(/[^0-9]/g, '');
  const num = parseInt(cleanStr, 10);
  if (isNaN(num)) return "";
  if (num === 0) return "Nol";
  
  const result = terbilang(num);
  return result.trim().replace(/\s+/g, ' ');
}
