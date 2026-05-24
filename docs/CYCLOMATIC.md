# 📐 Analisis Cyclomatic Complexity & Flow Graph

## TechMart E-Commerce Checkout - Module `checkout.js`

---

## 1. Tabel Cyclomatic Complexity

Rumus: **V(G) = E - N + 2P** atau disederhanakan **V(G) = jumlah_decision_points + 1**

| No | Fungsi | Decision Points | V(G) | Risiko |
|----|--------|----------------|------|--------|
| 1 | `validateProductData` | 7 (null, id, name, price, stock, weight, category) | **8** | Simple ✅ |
| 2 | `calculateItemSubtotal` | 6 (price type, qty type, price≤0, qty≤0, integer, max) | **7** | Simple ✅ |
| 3 | `validateStock` | 5 (null/array, empty, not found, >stock, ≤0) | **6** | Simple ✅ |
| 4 | `applyCoupon` | 9 (subtotal, code, not found, inactive, minPurchase, percentage, maxCap, fixed, fixedCap) | **10** | Moderate ⚠️ |
| 5 | `calculateBundleDiscount` | 4 (null/empty, subtotal, ≥threshold, <threshold) | **5** | Simple ✅ |
| 6 | `calculateTax` | 4 (amount, region, unknown, zero) | **5** | Simple ✅ |
| 7 | `calculateWeightSurcharge` | 5 (negative, ≤1, ≤3, ≤5, ≤10) | **6** | Simple ✅ |
| 8 | `calculateShipping` | 7 (weight, region, method, zone, rates, methodName, null rate) | **8** | Simple ✅ |
| 9 | `validateBuyerData` | 11 (null, name empty/min/max, email empty/format, phone empty/format, address empty/min/max) | **12** | Moderate ⚠️ |
| 10 | `processCheckout` | 15 (cart, stock, product loop, subtotal, coupon valid/error, bundle, discount compare ×3, region, tax, method, shipping, freeShip, buyer, grandTotal) | **16** | Moderate ⚠️ |

### Ringkasan

| Kategori | V(G) Range | Jumlah Fungsi | Daftar |
|----------|-----------|---------------|--------|
| 🟢 Simple | 1-10 | 7 | validateProductData, calculateItemSubtotal, validateStock, calculateBundleDiscount, calculateTax, calculateWeightSurcharge, calculateShipping |
| 🟡 Moderate | 11-20 | 3 | applyCoupon, validateBuyerData, processCheckout |
| 🔴 High | 21-50 | 0 | - |
| ⛔ Very High | >50 | 0 | - |

**Total Complexity: V(G) = 83** | **Rata-rata: 8.3 per fungsi**

---

## 2. Flow Graph - Fungsi Utama

### 2.1 Flow Graph: `processCheckout` (V(G) = 16)

```mermaid
flowchart TD
    START([Start]) --> A{Cart kosong/null?}
    A -->|Ya| ERR1[Return: Keranjang kosong]
    A -->|Tidak| B{validateStock valid?}
    B -->|Tidak| ERR2[Return: Stock error]
    B -->|Ya| C[Loop: setiap item di cart]
    C --> D{Product ditemukan?}
    D -->|Tidak| ERR3[Return: Produk tidak ditemukan]
    D -->|Ya| E{Subtotal valid?}
    E -->|Tidak| ERR4[Return: Subtotal error]
    E -->|Ya| F{Ada kode kupon?}
    F -->|Ya| G{applyCoupon valid?}
    G -->|Tidak| ERR5[Return: Kupon error]
    G -->|Ya| H[Set couponDiscount]
    F -->|Tidak| H2[couponDiscount = 0]
    H --> I[calculateBundleDiscount]
    H2 --> I
    I --> J{coupon > 0 AND bundle > 0?}
    J -->|Ya| K{coupon >= bundle?}
    K -->|Ya| L1[Pakai kupon]
    K -->|Tidak| L2[Pakai bundle]
    J -->|Tidak| M{coupon > 0 saja?}
    M -->|Ya| L1
    M -->|Tidak| N{bundle > 0 saja?}
    N -->|Ya| L2
    N -->|Tidak| L3[Diskon = 0]
    L1 --> O{Region valid?}
    L2 --> O
    L3 --> O
    O -->|Tidak| ERR6[Return: Region error]
    O -->|Ya| P{calculateTax valid?}
    P -->|Tidak| ERR7[Return: Pajak error]
    P -->|Ya| Q{Shipping method valid?}
    Q -->|Tidak| ERR8[Return: Method error]
    Q -->|Ya| R{calculateShipping valid?}
    R -->|Tidak| ERR9[Return: Ongkir error]
    R -->|Ya| S{afterDiscount >= 1.5jt?}
    S -->|Ya| T1[Free shipping]
    S -->|Tidak| T2[Normal shipping]
    T1 --> U{validateBuyerData valid?}
    T2 --> U
    U -->|Tidak| ERR10[Return: Buyer error]
    U -->|Ya| V{grandTotal > 0?}
    V -->|Tidak| ERR11[Return: Total invalid]
    V -->|Ya| SUCCESS[Return: Success + Summary]
```

### 2.2 Flow Graph: `validateBuyerData` (V(G) = 12)

```mermaid
flowchart TD
    START([Start]) --> A{buyer null/bukan object?}
    A -->|Ya| ERR_NULL[Return: Data tidak valid]
    A -->|Tidak| B{nama kosong?}
    B -->|Ya| E_NAME1["errors.name = 'harus diisi'"]
    B -->|Tidak| C{nama < 3 char?}
    C -->|Ya| E_NAME2["errors.name = 'min 3'"]
    C -->|Tidak| D{nama > 100 char?}
    D -->|Ya| E_NAME3["errors.name = 'max 100'"]
    D -->|Tidak| SKIP_NAME[Nama OK]
    E_NAME1 --> EMAIL
    E_NAME2 --> EMAIL
    E_NAME3 --> EMAIL
    SKIP_NAME --> EMAIL

    EMAIL{email kosong?}
    EMAIL -->|Ya| E_EMAIL1["errors.email = 'harus diisi'"]
    EMAIL -->|Tidak| F{format email valid?}
    F -->|Ya| PHONE
    F -->|Tidak| E_EMAIL2["errors.email = 'format invalid'"]
    E_EMAIL1 --> PHONE
    E_EMAIL2 --> PHONE

    PHONE{phone kosong?}
    PHONE -->|Ya| E_PHONE1["errors.phone = 'harus diisi'"]
    PHONE -->|Tidak| G{format phone valid?}
    G -->|Ya| ADDR
    G -->|Tidak| E_PHONE2["errors.phone = 'format invalid'"]
    E_PHONE1 --> ADDR
    E_PHONE2 --> ADDR

    ADDR{alamat kosong?}
    ADDR -->|Ya| E_ADDR1["errors.address = 'harus diisi'"]
    ADDR -->|Tidak| H{alamat < 10 char?}
    H -->|Ya| E_ADDR2["errors.address = 'min 10'"]
    H -->|Tidak| I{alamat > 500 char?}
    I -->|Ya| E_ADDR3["errors.address = 'max 500'"]
    I -->|Tidak| SKIP_ADDR[Alamat OK]

    E_ADDR1 --> CHECK
    E_ADDR2 --> CHECK
    E_ADDR3 --> CHECK
    SKIP_ADDR --> CHECK

    CHECK{Ada error?}
    CHECK -->|Ya| INVALID[Return: valid=false, errors]
    CHECK -->|Tidak| VALID[Return: valid=true]
```

### 2.3 Flow Graph: `calculateShipping` (V(G) = 8)

```mermaid
flowchart TD
    START([Start]) --> A{weight <= 0 atau bukan number?}
    A -->|Ya| ERR1[Return: Berat tidak valid]
    A -->|Tidak| B{region null/bukan string?}
    B -->|Ya| ERR2[Return: Region tidak valid]
    B -->|Tidak| C{method null/bukan string?}
    C -->|Ya| ERR3[Return: Method tidak valid]
    C -->|Tidak| D{zone ditemukan?}
    D -->|Tidak| ERR4[Return: Region tidak dikenali]
    D -->|Ya| E{rates ditemukan?}
    E -->|Tidak| ERR5[Return: Zona tidak tersedia]
    E -->|Ya| F{method valid: regular/express/sameday?}
    F -->|Tidak| ERR6[Return: Method tidak valid]
    F -->|Ya| G{baseRate === null?}
    G -->|Ya| ERR7[Return: Method tidak tersedia di region]
    G -->|Tidak| H[Hitung surcharge + total]
    H --> SUCCESS[Return: valid=true, cost, zone, method]
```

### 2.4 Flow Graph: `applyCoupon` (V(G) = 10)

```mermaid
flowchart TD
    START([Start]) --> A{subtotal <= 0 atau bukan number?}
    A -->|Ya| ERR1[Return: Subtotal tidak valid]
    A -->|Tidak| B{code null/bukan string?}
    B -->|Ya| ERR2[Return: Kode tidak valid]
    B -->|Tidak| C[Lookup kupon di COUPON_CODES]
    C --> D{kupon ditemukan?}
    D -->|Tidak| ERR3[Return: Tidak ditemukan]
    D -->|Ya| E{kupon aktif?}
    E -->|Tidak| ERR4[Return: Kadaluarsa]
    E -->|Ya| F{subtotal >= minPurchase?}
    F -->|Tidak| ERR5[Return: Min pembelian]
    F -->|Ya| G{tipe kupon?}
    G -->|percentage| H[discount = subtotal × %]
    G -->|fixed| I[discount = value]
    G -->|lainnya| ERR6[Return: Tipe tidak valid]
    H --> J{discount > maxDiscount?}
    J -->|Ya| K[Cap ke maxDiscount]
    J -->|Tidak| SUCCESS
    K --> SUCCESS
    I --> L{discount > subtotal?}
    L -->|Ya| M[Cap ke subtotal]
    L -->|Tidak| SUCCESS
    M --> SUCCESS
    SUCCESS[Return: valid=true, discount]
```

---

## 3. Jalur Uji (Test Paths)

Berdasarkan Cyclomatic Complexity, jumlah minimum jalur uji yang diperlukan:

| Fungsi | V(G) | Min Test Paths | Actual Test Cases | Status |
|--------|------|---------------|-------------------|--------|
| validateProductData | 8 | 8 | 8 | ✅ Tercukupi |
| calculateItemSubtotal | 7 | 7 | 7 | ✅ Tercukupi |
| validateStock | 6 | 6 | 6 | ✅ Tercukupi |
| applyCoupon | 10 | 10 | 12 | ✅ Melebihi |
| calculateBundleDiscount | 5 | 5 | 5 | ✅ Tercukupi |
| calculateTax | 5 | 5 | 6 | ✅ Melebihi |
| calculateWeightSurcharge | 6 | 6 | 6 | ✅ Tercukupi |
| calculateShipping | 8 | 8 | 12 | ✅ Melebihi |
| validateBuyerData | 12 | 12 | 12 | ✅ Tercukupi |
| processCheckout | 16 | 16 | 16 | ✅ Tercukupi |
| **TOTAL** | **83** | **83** | **90** | ✅ |

> Seluruh jalur logika telah diuji dengan jumlah test case melebihi minimum Cyclomatic Complexity.
