# 📋 Requirement Traceability Matrix (RTM)

## TechMart E-Commerce Checkout - Project UKPL

---

## Daftar Requirement

| Req ID | Requirement | Sumber | Prioritas |
|--------|------------|--------|-----------|
| R01 | Modul berisiko fatal (proses transaksi, validasi data) | PPT Slide 2 | High |
| R02 | Banyak percabangan (if/else) dan perulangan | PPT Slide 2 | High |
| R03 | Whitebox: grafik aliran logika, Cyclomatic Complexity, 100% code coverage | PPT Slide 3 | High |
| R04 | Blackbox: BVA, Error Guessing, Equivalence Partitioning | PPT Slide 4 | High |
| R05 | Stress Testing: beban besar, ukur kecepatan, titik kegagalan | PPT Slide 5 | Medium |
| R06 | Dokumentasi: RTM + Defect Management Log | PPT Slide 6 | Medium |

---

## Matriks Traceability: Requirement → Test Case

### R01 - Modul Berisiko Fatal (Transaksi & Validasi)

| Test ID | Test Case | File Test | Tipe | Status |
|---------|-----------|-----------|------|--------|
| WB-PC-01 | empty cart → fail | checkout.test.js | Whitebox | ✅ PASS |
| WB-PC-02 | invalid stock → fail | checkout.test.js | Whitebox | ✅ PASS |
| WB-PC-03 | invalid buyer data → fail | checkout.test.js | Whitebox | ✅ PASS |
| WB-PC-04 | invalid region → fail | checkout.test.js | Whitebox | ✅ PASS |
| WB-PC-05 | invalid shipping method → fail | checkout.test.js | Whitebox | ✅ PASS |
| WB-PC-06 | invalid coupon → fail | checkout.test.js | Whitebox | ✅ PASS |
| WB-PC-07 | valid checkout no coupon → success | checkout.test.js | Whitebox | ✅ PASS |
| WB-PC-08 | valid checkout with coupon → discount | checkout.test.js | Whitebox | ✅ PASS |
| WB-PC-09 | free shipping threshold | checkout.test.js | Whitebox | ✅ PASS |
| WB-PC-10 | bundle discount applied | checkout.test.js | Whitebox | ✅ PASS |
| WB-PC-11 | grand total calculation correct | checkout.test.js | Whitebox | ✅ PASS |
| WB-PC-12 | decimal quantity fails subtotal (L425) | checkout.test.js | Whitebox | ✅ PASS |
| WB-PC-13 | bundle > coupon discount (L462) | checkout.test.js | Whitebox | ✅ PASS |
| WB-PC-14 | unknown region fails tax (L482) | checkout.test.js | Whitebox | ✅ PASS |
| WB-PC-15 | negative grand total (L514) | checkout.test.js | Whitebox | ✅ PASS |

### R02 - Banyak Percabangan

| Test ID | Fungsi | Branch Count | Test Cases | Coverage |
|---------|--------|-------------|------------|----------|
| WB-VP | validateProductData | 8 | 8 | 100% |
| WB-CS | calculateItemSubtotal | 7 | 7 | 100% |
| WB-VS | validateStock | 6 | 6 | 100% |
| WB-AC | applyCoupon | 10 | 12 | 100% |
| WB-BD | calculateBundleDiscount | 5 | 5 | 100% |
| WB-CT | calculateTax | 5 | 6 | 100% |
| WB-WS | calculateWeightSurcharge | 6 | 6 | 100% |
| WB-SH | calculateShipping | 12 | 12 | 100% |
| WB-VB | validateBuyerData | 14 | 12 | 100% |
| WB-PC | processCheckout | ~20 | 15 | 100% |
| **Total** | | **~93** | **89** | **100%** |

### R03 - Whitebox Testing

| Test ID | Deliverable | File | Status |
|---------|------------|------|--------|
| DOC-CC | Cyclomatic Complexity Analysis | docs/CYCLOMATIC.md | ✅ |
| DOC-FG | Flow Graph (Mermaid diagrams) | docs/CYCLOMATIC.md | ✅ |
| WB-ALL | 100% Code Coverage | coverage/lcov-report/ | ✅ |
| WB-01~89 | 89 Whitebox test cases | tests/whitebox/checkout.test.js | ✅ PASS |

### R04 - Blackbox Testing

| Test ID | Teknik | Test Case | File | Status |
|---------|--------|-----------|------|--------|
| BB-BVA-01~06 | BVA | Quantity per item (0,1,2,9,10,11) | blackbox.test.js | ✅ PASS |
| BB-BVA-07~12 | BVA | Nama pembeli (2,3,4,99,100,101 char) | blackbox.test.js | ✅ PASS |
| BB-BVA-13~18 | BVA | Alamat (9,10,11,499,500,501 char) | blackbox.test.js | ✅ PASS |
| BB-BVA-19~20 | BVA | Free shipping threshold | blackbox.test.js | ✅ PASS |
| BB-BVA-21~23 | BVA | Min pembelian kupon | blackbox.test.js | ✅ PASS |
| BB-EP-01~07 | EP | Format email (valid/invalid partitions) | blackbox.test.js | ✅ PASS |
| BB-EP-08~14 | EP | Nomor telepon (valid/invalid partitions) | blackbox.test.js | ✅ PASS |
| BB-EG-01~10 | Error Guessing | Skenario ekstrem (case sensitivity, spasi, large values) | blackbox.test.js | ✅ PASS |
| BB-DT-01~04 | Decision Table | Prioritas diskon (kupon vs bundle) | blackbox.test.js | ✅ PASS |

### R05 - Stress Testing

| Test ID | Skenario | Iterasi | Avg Time | Status |
|---------|----------|---------|----------|--------|
| ST-01 | validateBuyerData under load | 10.000 | <0.01ms | ✅ PASS |
| ST-02 | applyCoupon under load | 100.000 | <0.001ms | ✅ PASS |
| ST-03 | calculateShipping under load | 100.000 | <0.001ms | ✅ PASS |
| ST-04 | calculateTax under load | 100.000 | <0.001ms | ✅ PASS |
| ST-05 | processCheckout full flow | 10.000 | <0.01ms | ✅ PASS |
| ST-06 | Spike wave (5K→10K→15K) | 30.000 | <0.01ms | ✅ PASS |
| ST-07 | calculateBundleDiscount | 100.000 | <0.001ms | ✅ PASS |
| ST-08 | Breakpoint Analysis (1K→512K) | 1.023.000 | <0.01ms | ✅ PASS |
| ST-09 | Memory Profiling (50K ops) | 50.000 | <50MB delta | ✅ PASS |
| ST-10 | Extreme Payload | varies | <5ms | ✅ PASS |

### R06 - Dokumentasi SQA

| Deliverable | File | Status |
|------------|------|--------|
| Requirement Traceability Matrix | docs/RTM.md | ✅ |
| Defect Management Log | docs/DEFECT_LOG.md | ✅ |
| Cyclomatic Complexity + Flow Graph | docs/CYCLOMATIC.md | ✅ |
| README Project | README.md | ✅ |

---

## Ringkasan Coverage

| Metrik | Target | Hasil | Status |
|--------|--------|-------|--------|
| Statements | 100% | 100% | ✅ |
| Branches | 100% | 100% | ✅ |
| Functions | 100% | 100% | ✅ |
| Lines | 100% | 100% | ✅ |
| Total Tests | - | 150 | ✅ PASS ALL |
| Test Suites | - | 3 (whitebox, blackbox, stress) | ✅ PASS ALL |
