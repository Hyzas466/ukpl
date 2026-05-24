// ============================================================
// blackbox.test.js - BLACKBOX TESTING (Jest)
// Teknik: Boundary Value Analysis (BVA) + Equivalence Partitioning
// + Error Guessing + Decision Table
// ============================================================

const Checkout = require("../../src/js/checkout.js");

// Helper buyer data yang valid
const VALID_BUYER = {
  name: "Siti Rahayu",
  email: "siti@email.com",
  phone: "081298765432",
  address: "Jalan Sudirman No.99, Jakarta Selatan",
};

// =============================================================
// BVA - QUANTITY BATAS BAWAH & ATAS
// =============================================================
describe("BVA - Quantity per item", () => {
  // MIN = 1, MAX = 10
  test("quantity = 0 (di bawah batas bawah) → subtotal invalid", () => {
    expect(Checkout.calculateItemSubtotal(100000, 0).valid).toBe(false);
  });
  test("quantity = 1 (tepat batas bawah) → valid", () => {
    expect(Checkout.calculateItemSubtotal(100000, 1).valid).toBe(true);
  });
  test("quantity = 2 (satu atas batas bawah) → valid", () => {
    expect(Checkout.calculateItemSubtotal(100000, 2).valid).toBe(true);
  });
  test("quantity = 9 (satu bawah batas atas) → valid", () => {
    expect(Checkout.calculateItemSubtotal(100000, 9).valid).toBe(true);
  });
  test("quantity = 10 (tepat batas atas) → valid", () => {
    expect(Checkout.calculateItemSubtotal(100000, 10).valid).toBe(true);
  });
  test("quantity = 11 (di atas batas atas) → invalid", () => {
    expect(Checkout.calculateItemSubtotal(100000, 11).valid).toBe(false);
  });
});

// =============================================================
// BVA - NAMA PEMBELI (MIN 3, MAX 100)
// =============================================================
describe("BVA - Nama pembeli", () => {
  const base = { email: "a@b.com", phone: "081234567890", address: "Jalan A No.1 Kota Jakarta" };
  test("nama 2 karakter (di bawah min) → invalid", () => {
    expect(Checkout.validateBuyerData({ ...base, name: "AB" }).valid).toBe(false);
  });
  test("nama 3 karakter (tepat min) → valid", () => {
    expect(Checkout.validateBuyerData({ ...base, name: "Abu" }).valid).toBe(true);
  });
  test("nama 4 karakter → valid", () => {
    expect(Checkout.validateBuyerData({ ...base, name: "Abud" }).valid).toBe(true);
  });
  test("nama 99 karakter → valid", () => {
    expect(Checkout.validateBuyerData({ ...base, name: "A".repeat(99) }).valid).toBe(true);
  });
  test("nama 100 karakter (tepat max) → valid", () => {
    expect(Checkout.validateBuyerData({ ...base, name: "A".repeat(100) }).valid).toBe(true);
  });
  test("nama 101 karakter (di atas max) → invalid", () => {
    expect(Checkout.validateBuyerData({ ...base, name: "A".repeat(101) }).valid).toBe(false);
  });
});

// =============================================================
// BVA - ALAMAT (MIN 10, MAX 500)
// =============================================================
describe("BVA - Alamat pembeli", () => {
  const base = { name: "Budi", email: "a@b.com", phone: "081234567890" };
  test("alamat 9 karakter → invalid", () => {
    expect(Checkout.validateBuyerData({ ...base, address: "123456789" }).valid).toBe(false);
  });
  test("alamat 10 karakter (tepat min) → valid", () => {
    expect(Checkout.validateBuyerData({ ...base, address: "1234567890" }).valid).toBe(true);
  });
  test("alamat 11 karakter → valid", () => {
    expect(Checkout.validateBuyerData({ ...base, address: "12345678901" }).valid).toBe(true);
  });
  test("alamat 499 karakter → valid", () => {
    expect(Checkout.validateBuyerData({ ...base, address: "A".repeat(499) }).valid).toBe(true);
  });
  test("alamat 500 karakter (tepat max) → valid", () => {
    expect(Checkout.validateBuyerData({ ...base, address: "A".repeat(500) }).valid).toBe(true);
  });
  test("alamat 501 karakter → invalid", () => {
    expect(Checkout.validateBuyerData({ ...base, address: "A".repeat(501) }).valid).toBe(false);
  });
});

// =============================================================
// EQUIVALENCE PARTITIONING - EMAIL
// =============================================================
describe("EP - Format email", () => {
  const base = { name: "Budi", phone: "081234567890", address: "Jalan A No.1 Kota Jakarta" };
  // Partisi VALID
  test("EP Valid: format standar → valid", () => {
    expect(Checkout.validateBuyerData({ ...base, email: "user@domain.com" }).valid).toBe(true);
  });
  test("EP Valid: subdomain → valid", () => {
    expect(Checkout.validateBuyerData({ ...base, email: "user@mail.domain.co.id" }).valid).toBe(true);
  });
  // Partisi INVALID
  test("EP Invalid: tanpa @ → invalid", () => {
    expect(Checkout.validateBuyerData({ ...base, email: "userdomain.com" }).errors.email).toBeDefined();
  });
  test("EP Invalid: tanpa domain → invalid", () => {
    expect(Checkout.validateBuyerData({ ...base, email: "user@" }).errors.email).toBeDefined();
  });
  test("EP Invalid: tanpa titik domain → invalid", () => {
    expect(Checkout.validateBuyerData({ ...base, email: "user@domain" }).errors.email).toBeDefined();
  });
  test("EP Invalid: spasi dalam email → invalid", () => {
    expect(Checkout.validateBuyerData({ ...base, email: "us er@domain.com" }).errors.email).toBeDefined();
  });
  test("EP Invalid: string kosong → invalid", () => {
    expect(Checkout.validateBuyerData({ ...base, email: "" }).errors.email).toBeDefined();
  });
});

// =============================================================
// EQUIVALENCE PARTITIONING - NOMOR TELEPON
// =============================================================
describe("EP - Nomor telepon", () => {
  const base = { name: "Budi", email: "a@b.com", address: "Jalan A No.1 Kota Jakarta" };
  // Partisi VALID
  test("EP Valid: 08xxxxxxxxxx (11 digit) → valid", () => {
    expect(Checkout.validateBuyerData({ ...base, phone: "08123456789" }).valid).toBe(true);
  });
  test("EP Valid: 628xxxxxxxxxx → valid", () => {
    expect(Checkout.validateBuyerData({ ...base, phone: "628123456789" }).valid).toBe(true);
  });
  test("EP Valid: +628xxxxxxxxxx → valid", () => {
    expect(Checkout.validateBuyerData({ ...base, phone: "+628123456789" }).valid).toBe(true);
  });
  // Partisi INVALID
  test("EP Invalid: diawali 07 → invalid", () => {
    expect(Checkout.validateBuyerData({ ...base, phone: "07123456789" }).errors.phone).toBeDefined();
  });
  test("EP Invalid: terlalu pendek → invalid", () => {
    expect(Checkout.validateBuyerData({ ...base, phone: "0812345" }).errors.phone).toBeDefined();
  });
  test("EP Invalid: huruf → invalid", () => {
    expect(Checkout.validateBuyerData({ ...base, phone: "ABCDEFGH" }).errors.phone).toBeDefined();
  });
  test("EP Invalid: kosong → invalid", () => {
    expect(Checkout.validateBuyerData({ ...base, phone: "" }).errors.phone).toBeDefined();
  });
});

// =============================================================
// BVA - FREE SHIPPING THRESHOLD (Rp 1.500.000)
// =============================================================
describe("BVA - Free Shipping Threshold", () => {
  const cart2 = [{ productId: 2, quantity: 1 }]; // 890000 → di bawah threshold
  const cartFree = [{ productId: 2, quantity: 2 }]; // 1780000 → di atas threshold

  test("subtotal < 1.500.000 → ada ongkir", () => {
    const r = Checkout.processCheckout(cart2, VALID_BUYER, "", "jakarta", "regular");
    expect(r.success).toBe(true);
    expect(r.summary.freeShipping).toBe(false);
    expect(r.summary.shipping).toBeGreaterThan(0);
  });

  test("subtotal >= 1.500.000 → free shipping", () => {
    const r = Checkout.processCheckout(cartFree, VALID_BUYER, "", "jakarta", "regular");
    expect(r.success).toBe(true);
    expect(r.summary.freeShipping).toBe(true);
    expect(r.summary.shipping).toBe(0);
  });
});

// =============================================================
// BVA - MIN PEMBELIAN KUPON
// =============================================================
describe("BVA - Minimum pembelian kupon DISKON10 (min Rp500.000)", () => {
  test("subtotal tepat batas min (500000) → kupon valid", () => {
    const r = Checkout.applyCoupon(500000, "DISKON10");
    expect(r.valid).toBe(true);
  });
  test("subtotal satu di bawah batas (499999) → kupon invalid", () => {
    const r = Checkout.applyCoupon(499999, "DISKON10");
    expect(r.valid).toBe(false);
  });
  test("subtotal jauh di atas batas → kupon valid", () => {
    const r = Checkout.applyCoupon(2000000, "DISKON10");
    expect(r.valid).toBe(true);
  });
});

// =============================================================
// ERROR GUESSING - Skenario tidak terduga
// =============================================================
describe("Error Guessing - Skenario ekstrem", () => {
  test("kupon dengan huruf kecil → harus tetap valid (case insensitive)", () => {
    const r = Checkout.applyCoupon(500000, "diskon10");
    expect(r.valid).toBe(true);
  });

  test("kupon dengan spasi → tetap valid setelah trim", () => {
    const r = Checkout.applyCoupon(500000, "  DISKON10  ");
    expect(r.valid).toBe(true);
  });

  test("harga sangat besar → tetap dihitung benar", () => {
    const r = Checkout.calculateItemSubtotal(999999999, 1);
    expect(r.valid).toBe(true);
    expect(r.subtotal).toBe(999999999);
  });

  test("pajak region uppercase → harus valid (case insensitive)", () => {
    const r = Checkout.calculateTax(500000, "JAKARTA");
    expect(r.valid).toBe(true);
  });

  test("shipping region uppercase → harus valid", () => {
    const r = Checkout.calculateShipping(1, "JAKARTA", "regular");
    expect(r.valid).toBe(true);
  });

  test("phone dengan spasi di tengah → valid (stripped)", () => {
    const base = { name: "Budi", email: "a@b.com", address: "Jalan A No.1 Kota Jakarta" };
    // strip whitespace before check
    expect(Checkout.validateBuyerData({ ...base, phone: "0812 3456 7890" }).valid).toBe(true);
  });

  test("phone dengan strip → valid (stripped)", () => {
    const base = { name: "Budi", email: "a@b.com", address: "Jalan A No.1 Kota Jakarta" };
    expect(Checkout.validateBuyerData({ ...base, phone: "0812-3456-7890" }).valid).toBe(true);
  });

  test("processCheckout: productId tidak ada di daftar → fail", () => {
    const r = Checkout.processCheckout(
      [{ productId: 9999, quantity: 1 }],
      VALID_BUYER, "", "jakarta", "regular"
    );
    expect(r.success).toBe(false);
  });

  test("processCheckout: sameday di luar Jawa → fail", () => {
    const r = Checkout.processCheckout(
      [{ productId: 1, quantity: 1 }],
      VALID_BUYER, "", "medan", "sameday"
    );
    expect(r.success).toBe(false);
  });

  test("processCheckout: kupon expired → fail", () => {
    const r = Checkout.processCheckout(
      [{ productId: 1, quantity: 1 }],
      VALID_BUYER, "EXPIRED01", "jakarta", "regular"
    );
    expect(r.success).toBe(false);
  });
});

// =============================================================
// DECISION TABLE - Kombinasi Diskon
// =============================================================
describe("Decision Table - Prioritas diskon (kupon vs bundle)", () => {
  const cart3 = [
    { productId: 1, quantity: 1 }, // 350000
    { productId: 2, quantity: 1 }, // 890000
    { productId: 3, quantity: 1 }, // 450000
    // total = 1690000 → bundle 5% = 84500, kupon DISKON10 = 169000 → kupon menang
  ];

  test("bundle + kupon tersedia → ambil yang lebih besar", () => {
    const r = Checkout.processCheckout(cart3, VALID_BUYER, "DISKON10", "jakarta", "regular");
    expect(r.success).toBe(true);
    // Kupon DISKON10 = 10% dari 1690000 = 169000 > bundle 5% = 84500
    expect(r.summary.discountSource).toContain("Kupon");
    expect(r.summary.discount).toBe(169000);
  });

  test("hanya bundle (tanpa kupon) → diskon bundle", () => {
    const r = Checkout.processCheckout(cart3, VALID_BUYER, "", "jakarta", "regular");
    expect(r.success).toBe(true);
    expect(r.summary.discount).toBeGreaterThan(0);
  });

  test("hanya kupon (< 3 item) → diskon kupon", () => {
    const r = Checkout.processCheckout(
      [{ productId: 2, quantity: 1 }], // 890000
      VALID_BUYER, "DISKON10", "jakarta", "regular"
    );
    expect(r.success).toBe(true);
    expect(r.summary.discount).toBe(89000);
    expect(r.summary.discountSource).toContain("Kupon");
  });

  test("tidak ada kupon, tidak ada bundle → diskon = 0", () => {
    const r = Checkout.processCheckout(
      [{ productId: 1, quantity: 1 }], // 350000, 1 item
      VALID_BUYER, "", "jakarta", "regular"
    );
    expect(r.success).toBe(true);
    expect(r.summary.discount).toBe(0);
  });
});
