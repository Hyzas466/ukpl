# 🛒 TechMart E-Commerce Checkout

## Project UKPL - Uji Kualitas Perangkat Lunak

Sistem checkout e-commerce lengkap yang dirancang khusus untuk pengujian kualitas perangkat lunak (Software Quality Assurance). Modul ini mengandung logika bisnis berisiko tinggi dengan banyak percabangan, cocok untuk analisis Whitebox, Blackbox, dan Stress Testing.

---

## 📁 Struktur Project

```
UKPL/
├── src/                          # Source code aplikasi
│   ├── js/
│   │   ├── checkout.js           # Business logic (pure functions)
│   │   └── app.js                # UI Controller (DOM manipulation)
│   ├── css/
│   │   └── style.css             # Styling
│   └── index.html                # Entry point (buka di browser)
│
├── tests/                        # Test suites
│   ├── whitebox/
│   │   └── checkout.test.js      # 89 tests: Branch coverage, CC analysis
│   ├── blackbox/
│   │   └── blackbox.test.js      # 51 tests: BVA, EP, Error Guessing, Decision Table
│   └── stress/
│       └── stress.test.js        # 10 tests: Load, Spike, Breakpoint, Memory
│
├── docs/                         # Dokumentasi SQA
│   ├── CYCLOMATIC.md             # Analisis Cyclomatic Complexity + Flow Graph
│   ├── RTM.md                    # Requirement Traceability Matrix
│   └── DEFECT_LOG.md             # Defect Management Log
│
├── coverage/                     # Auto-generated coverage reports
├── package.json                  # Konfigurasi Jest + scripts
└── README.md                     # Dokumen ini
```

---

## 🚀 Instalasi & Menjalankan

### Prerequisites
- **Node.js** >= 14.x
- **npm** >= 6.x

### Instalasi
```bash
npm install
```

### Menjalankan Aplikasi
Buka `src/index.html` di browser:
```bash
# Windows
start src/index.html

# Mac/Linux
open src/index.html
```

---

## 🧪 Menjalankan Test

### Semua Test + Coverage
```bash
npm test
# atau
npm run test:all
```

### Per Kategori
```bash
# Whitebox testing (branch coverage)
npm run test:whitebox

# Blackbox testing (BVA, EP, Error Guessing)
npm run test:blackbox

# Stress testing (load, spike, breakpoint, memory)
npm run test:stress
```

---

## 📊 Hasil Testing

### Coverage

| Metrik | Hasil |
|--------|-------|
| Statements | **100%** |
| Branches | **100%** |
| Functions | **100%** |
| Lines | **100%** |

### Test Summary

| Suite | Tests | Status |
|-------|-------|--------|
| Whitebox | 89 | ✅ ALL PASS |
| Blackbox | 51 | ✅ ALL PASS |
| Stress | 10 | ✅ ALL PASS |
| **Total** | **150** | ✅ **ALL PASS** |

### Stress Test Performance

| Skenario | Throughput |
|----------|-----------|
| Full checkout flow | ~100K+ ops/sec |
| Individual functions | ~130K+ ops/sec |
| Memory (50K ops) | <21 MB delta |
| Breakpoint (512K) | Stabil, tanpa degradasi |

---

## 📐 Metodologi Testing

### 1. Whitebox Testing
- **Grafik Aliran Logika**: Flow graph setiap fungsi (Mermaid)
- **Cyclomatic Complexity**: V(G) analysis per fungsi (total V(G) = 83)
- **100% Code Coverage**: Semua statements, branches, functions, dan lines tercover

### 2. Blackbox Testing
- **Boundary Value Analysis (BVA)**: Quantity (0,1,2,9,10,11), nama (2-101 char), alamat (9-501 char)
- **Equivalence Partitioning (EP)**: Partisi valid/invalid untuk email dan telepon
- **Error Guessing**: Case sensitivity, spasi, format telepon, value besar
- **Decision Table**: Prioritas diskon kupon vs bundle

### 3. Stress Testing
- **Load Test**: 10K-100K iterasi per fungsi
- **Spike Test**: Wave 5K → 10K → 15K request
- **Breakpoint Analysis**: Eskalasi 1K → 512K, deteksi degradasi
- **Memory Profiling**: Monitoring heap usage selama 50K operasi
- **Extreme Payload**: Max cart, max strings, rapid coupon fire

---

## 📋 Dokumentasi SQA

| Dokumen | Deskripsi |
|---------|-----------|
| [CYCLOMATIC.md](docs/CYCLOMATIC.md) | Analisis Cyclomatic Complexity, flow graph Mermaid, jalur uji |
| [RTM.md](docs/RTM.md) | Requirement Traceability Matrix: mapping requirement → test case |
| [DEFECT_LOG.md](docs/DEFECT_LOG.md) | Log 10 defect yang ditemukan & diperbaiki selama testing |

---

## 🏗️ Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| Logic | JavaScript (ES6+) |
| UI | HTML5 + CSS3 (Glassmorphism) |
| Testing | Jest 29.x |
| Coverage | Istanbul (built-in Jest) |
| Flow Graph | Mermaid |

---



| Nama | NIM | Role |
|------|-----|------|
| - | - | - |
