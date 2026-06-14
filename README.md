# 🛠️ ShortcutPro

Kumpulan **tools internal CS** berbasis HTML/JS murni — generator, kalkulator, analisa, dan halaman utilitas untuk operasional harian. Tanpa backend, langsung jalan di browser.

🌐 **Live:** [shortcutpro.vercel.app](https://shortcutpro.vercel.app)

---

## 📋 Daftar Tool

### ⚽ Bola & Prediksi
| File | Fungsi |
| ---- | ------ |
| `analisis-bola.html` | Analisa pertandingan bola |
| `analisis-bola-idn.html` | Analisa bola versi IDN |
| `analisisiplogin.html` | Analisa IP login |
| `script-bola-auto.html` | Script auto prediksi bola |
| `script-bola-lama2.html` | Script bola versi lama |
| `script.html` | Script generator umum |
| `cek bola` | Cek data bola |

### 🎰 Togel & Syair
| File | Fungsi |
| ---- | ------ |
| `prediksitogel.html` / `prediksitogel2.html` | Prediksi togel |
| `togel-idn.html` | Togel IDN |
| `togel-png.html` / `togel-png-new.html` | Generator gambar togel PNG |
| `generatorsyairdanangka.html` | Generator syair & angka |
| `inputsyair.html` | Input data syair |
| `syair-generate` / `syair-generate2` | Generate syair |
| `generator-bbfs.html` | Generator BBFS |
| `kalkulator-togel-png` | Kalkulator togel (PNG) |
| `jadwalpasaran.html` | Jadwal pasaran togel |

### 🎲 Parlay & Slot
| File | Fungsi |
| ---- | ------ |
| `kalkulator-parlay.html` | Kalkulator parlay |
| `parlay1.html` / `parlay2.html` | Halaman parlay |
| `hitungfreespin-buyspin.html` | Hitung freespin / buyspin |

### 💰 Keuangan & QRIS
| File | Fungsi |
| ---- | ------ |
| `qris-deposit.html` | Kalkulator deposit QRIS |
| `selisih-qris.html` / `selisih-qris-idn.html` | Hitung selisih QRIS |
| `validasi-koin-depo-wd.html` | Validasi koin deposit / withdraw |
| `data-to.html` | Data turnover |
| `winlose.html` | Hitung win/lose |
| `reportan.html` | Laporan |
| `bagi-bonus.html` | Pembagian bonus |
| `peminjaman-pengembalian.html` | Peminjaman & pengembalian |
| `batasanline.html` | Batasan line |

### 🖼️ Gambar & Utilitas
| File | Fungsi |
| ---- | ------ |
| `gabunggambar.html` | Gabung gambar |
| `gambar-png-idn.html` | Generator gambar PNG IDN |
| `gambar-zia.html` | Generator gambar |
| `generator-password.html` | Generator password |
| `generator-script-jp.html` | Generator script JP |
| `jobdesk.html` | Halaman jobdesk |
| `index.html` | Halaman utama / menu |

---

## 🗂️ Aset

Repo juga berisi aset gambar pendukung:

- **Logo pasaran** — Kentucky, PCSO, Singapore, California, Carolina, Bangkok, Brunei, Cambodia, Florida, Nevada, New York, Oregon, Poipet, Hua Hin, Hongkong Lotto, Sydney Lotto, Toto Macau, Toto Mali, Magnum, dll.
- **Logo lain** — Chelsea, King Kong, Bullseye, Hoki Draw.
- **Shio (12)** — tikus, kerbau, harimau, kelinci, naga, ular, kuda, kambing, monyet, ayam, anjing, babi.
- **Lain-lain** — `backgorund.png`, `logo-mobile.png`.

---

## 🚀 Deploy

Project ini di-deploy via **Vercel** (static hosting).

1. Push semua file ke repo GitHub.
2. Import repo di [vercel.com](https://vercel.com) → deploy (tanpa build command, framework: *Other*).
3. Akses tiap tool langsung lewat nama file:
   ```
   https://shortcutpro.vercel.app/kalkulator-parlay.html
   https://shortcutpro.vercel.app/qris-deposit.html
   ```

---

## 🧰 Teknologi

- HTML / CSS / JavaScript murni (tanpa framework, tanpa build step)
- 100% client-side, aman untuk static hosting (Vercel / GitHub Pages)

---

> ⚠️ **Catatan:** Tools ini untuk keperluan operasional internal. Beberapa nama file masih typo (`backgorund.png`) atau tanpa ekstensi (`cek bola`, `syair-generate`) — bisa dirapikan saat ada waktu.
