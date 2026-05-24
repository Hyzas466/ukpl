// ============================================================
// checkout.test.js - WHITEBOX TESTING (Jest)
// Cyclomatic Complexity & Branch Coverage
// Target: 100% Statement, Branch, Function, Line Coverage
// ============================================================

const Checkout = require("../../src/js/checkout.js");

// ===================== validateProductData =====================
describe("validateProductData - Whitebox (8 branches)", () => {
  test("null product → invalid", () => {
    expect(Checkout.validateProductData(null).valid).toBe(false);
  });
  test("id <= 0 → invalid", () => {
    expect(Checkout.validateProductData({ id: -1, name: "A", price: 100, stock: 1, weight: 0.1, category: "x" }).valid).toBe(false);
  });
  test("empty name → invalid", () => {
    expect(Checkout.validateProductData({ id: 1, name: "  ", price: 100, stock: 1, weight: 0.1, category: "x" }).valid).toBe(false);
  });
  test("price <= 0 → invalid", () => {
    expect(Checkout.validateProductData({ id: 1, name: "A", price: 0, stock: 1, weight: 0.1, category: "x" }).valid).toBe(false);
  });
  test("stock < 0 → invalid", () => {
    expect(Checkout.validateProductData({ id: 1, name: "A", price: 100, stock: -1, weight: 0.1, category: "x" }).valid).toBe(false);
  });
  test("weight <= 0 → invalid", () => {
    expect(Checkout.validateProductData({ id: 1, name: "A", price: 100, stock: 1, weight: 0, category: "x" }).valid).toBe(false);
  });
  test("no category → invalid", () => {
    expect(Checkout.validateProductData({ id: 1, name: "A", price: 100, stock: 1, weight: 0.1, category: "" }).valid).toBe(false);
  });
  test("valid product → valid", () => {
    expect(Checkout.validateProductData({ id: 1, name: "A", price: 100, stock: 1, weight: 0.1, category: "audio" }).valid).toBe(true);
  });
});

// ===================== calculateItemSubtotal =====================
describe("calculateItemSubtotal - Whitebox (7 branches)", () => {
  test("NaN price → invalid", () => {
    expect(Checkout.calculateItemSubtotal(NaN, 1).valid).toBe(false);
  });
  test("NaN quantity → invalid", () => {
    expect(Checkout.calculateItemSubtotal(1000, NaN).valid).toBe(false);
  });
  test("price = 0 → invalid", () => {
    expect(Checkout.calculateItemSubtotal(0, 1).valid).toBe(false);
  });
  test("quantity = 0 → invalid", () => {
    expect(Checkout.calculateItemSubtotal(1000, 0).valid).toBe(false);
  });
  test("decimal quantity → invalid", () => {
    expect(Checkout.calculateItemSubtotal(1000, 1.5).valid).toBe(false);
  });
  test("quantity > MAX → invalid", () => {
    expect(Checkout.calculateItemSubtotal(1000, 11).valid).toBe(false);
  });
  test("valid inputs → correct subtotal", () => {
    const r = Checkout.calculateItemSubtotal(350000, 3);
    expect(r.valid).toBe(true);
    expect(r.subtotal).toBe(1050000);
  });
});

// ===================== validateStock =====================
describe("validateStock - Whitebox (6 branches)", () => {
  test("null cart → invalid", () => {
    expect(Checkout.validateStock(null).valid).toBe(false);
  });
  test("empty cart → invalid", () => {
    expect(Checkout.validateStock([]).valid).toBe(false);
  });
  test("unknown product id → error", () => {
    const r = Checkout.validateStock([{ productId: 999, quantity: 1 }]);
    expect(r.valid).toBe(false);
  });
  test("quantity > stock → error", () => {
    const r = Checkout.validateStock([{ productId: 1, quantity: 9999 }]);
    expect(r.valid).toBe(false);
  });
  test("quantity <= 0 → error", () => {
    const r = Checkout.validateStock([{ productId: 1, quantity: 0 }]);
    expect(r.valid).toBe(false);
  });
  test("valid stock → valid", () => {
    const r = Checkout.validateStock([{ productId: 1, quantity: 2 }]);
    expect(r.valid).toBe(true);
  });
});

// ===================== applyCoupon =====================
describe("applyCoupon - Whitebox (10 branches)", () => {
  test("invalid subtotal → invalid", () => {
    expect(Checkout.applyCoupon(-1, "DISKON10").valid).toBe(false);
  });
  test("null code → invalid", () => {
    expect(Checkout.applyCoupon(500000, null).valid).toBe(false);
  });
  test("unknown code → invalid", () => {
    expect(Checkout.applyCoupon(500000, "SALAH").valid).toBe(false);
  });
  test("expired coupon → invalid", () => {
    expect(Checkout.applyCoupon(500000, "EXPIRED01").valid).toBe(false);
  });
  test("below min purchase → invalid", () => {
    expect(Checkout.applyCoupon(100000, "DISKON10").valid).toBe(false);
  });
  test("percentage coupon under cap → correct discount", () => {
    const r = Checkout.applyCoupon(500000, "DISKON10");
    expect(r.valid).toBe(true);
    expect(r.discount).toBe(50000);
  });
  test("percentage coupon hits max cap → capped", () => {
    const r = Checkout.applyCoupon(5000000, "DISKON10");
    expect(r.valid).toBe(true);
    expect(r.discount).toBe(200000);
  });
  test("fixed coupon → fixed discount", () => {
    const r = Checkout.applyCoupon(500000, "GRATIS50K");
    expect(r.valid).toBe(true);
    expect(r.discount).toBe(50000);
  });
  test("fixed coupon > subtotal → capped to subtotal", () => {
    const r = Checkout.applyCoupon(30000, "GRATIS50K");
    // minPurchase is 300000, so this should fail
    expect(r.valid).toBe(false);
  });
  test("high-value coupon SPESIAL30 → valid", () => {
    const r = Checkout.applyCoupon(2000000, "SPESIAL30");
    expect(r.valid).toBe(true);
    expect(r.discount).toBe(600000);
  });

  // *** COVERAGE FIX: L201-204 — tipe kupon tidak dikenal ***
  test("unknown coupon type → invalid (L201-204)", () => {
    // Sementara tambah kupon dengan tipe tidak dikenal
    Checkout.COUPON_CODES["BADTYPE"] = {
      type: "mystery", value: 10, minPurchase: 0, maxDiscount: 100, active: true
    };
    const r = Checkout.applyCoupon(500000, "BADTYPE");
    delete Checkout.COUPON_CODES["BADTYPE"]; // cleanup
    expect(r.valid).toBe(false);
    expect(r.error).toBe("Tipe kupon tidak valid");
  });

  // *** COVERAGE FIX: fixed coupon > subtotal (kupon tetap yang nilainya melebihi subtotal) ***
  test("fixed coupon value > subtotal → discount capped to subtotal", () => {
    // Tambah kupon fixed besar dengan minPurchase rendah
    Checkout.COUPON_CODES["BIGFIXED"] = {
      type: "fixed", value: 999999, minPurchase: 100, maxDiscount: 999999, active: true
    };
    const r = Checkout.applyCoupon(500, "BIGFIXED");
    delete Checkout.COUPON_CODES["BIGFIXED"]; // cleanup
    expect(r.valid).toBe(true);
    expect(r.discount).toBe(500); // capped ke subtotal
  });
});

// ===================== calculateBundleDiscount =====================
describe("calculateBundleDiscount - Whitebox (5 branches)", () => {
  test("null cart → not applied", () => {
    expect(Checkout.calculateBundleDiscount(null, 500000).applied).toBe(false);
  });
  test("empty cart → not applied", () => {
    expect(Checkout.calculateBundleDiscount([], 500000).applied).toBe(false);
  });
  test("invalid subtotal → not applied", () => {
    expect(Checkout.calculateBundleDiscount([{ productId: 1 }], -1).applied).toBe(false);
  });
  test("< 3 unique items → not applied", () => {
    const cart = [{ productId: 1, quantity: 1 }, { productId: 2, quantity: 1 }];
    expect(Checkout.calculateBundleDiscount(cart, 500000).applied).toBe(false);
  });
  test(">= 3 unique items → 5% discount", () => {
    const cart = [
      { productId: 1, quantity: 1 },
      { productId: 2, quantity: 1 },
      { productId: 3, quantity: 1 },
    ];
    const r = Checkout.calculateBundleDiscount(cart, 1000000);
    expect(r.applied).toBe(true);
    expect(r.discount).toBe(50000);
  });
});

// ===================== calculateTax =====================
describe("calculateTax - Whitebox (5 branches)", () => {
  test("negative amount → invalid", () => {
    expect(Checkout.calculateTax(-100, "jakarta").valid).toBe(false);
  });
  test("null region → invalid", () => {
    expect(Checkout.calculateTax(500000, null).valid).toBe(false);
  });
  test("unknown region → invalid", () => {
    expect(Checkout.calculateTax(500000, "atlantis").valid).toBe(false);
  });
  test("amount = 0 → tax = 0", () => {
    const r = Checkout.calculateTax(0, "jakarta");
    expect(r.valid).toBe(true);
    expect(r.tax).toBe(0);
  });
  test("jakarta 11% tax", () => {
    const r = Checkout.calculateTax(1000000, "jakarta");
    expect(r.valid).toBe(true);
    expect(r.tax).toBe(110000);
  });
  test("jayapura 5% tax", () => {
    const r = Checkout.calculateTax(1000000, "jayapura");
    expect(r.valid).toBe(true);
    expect(r.tax).toBe(50000);
  });
});

// ===================== calculateWeightSurcharge =====================
describe("calculateWeightSurcharge - Whitebox (6 branches)", () => {
  test("negative weight → 0", () => {
    expect(Checkout.calculateWeightSurcharge(-1)).toBe(0);
  });
  test("weight <= 1 → 0", () => {
    expect(Checkout.calculateWeightSurcharge(1)).toBe(0);
  });
  test("weight 1-3 → 5000", () => {
    expect(Checkout.calculateWeightSurcharge(2)).toBe(5000);
  });
  test("weight 3-5 → 12000", () => {
    expect(Checkout.calculateWeightSurcharge(4)).toBe(12000);
  });
  test("weight 5-10 → 25000", () => {
    expect(Checkout.calculateWeightSurcharge(8)).toBe(25000);
  });
  test("weight > 10 → 50000", () => {
    expect(Checkout.calculateWeightSurcharge(15)).toBe(50000);
  });
});

// ===================== calculateShipping =====================
describe("calculateShipping - Whitebox (12 branches)", () => {
  test("invalid weight → invalid", () => {
    expect(Checkout.calculateShipping(0, "jakarta", "regular").valid).toBe(false);
  });
  test("null region → invalid", () => {
    expect(Checkout.calculateShipping(1, null, "regular").valid).toBe(false);
  });
  test("null method → invalid", () => {
    expect(Checkout.calculateShipping(1, "jakarta", null).valid).toBe(false);
  });
  test("unknown region → invalid", () => {
    expect(Checkout.calculateShipping(1, "mars", "regular").valid).toBe(false);
  });
  test("invalid method → invalid", () => {
    expect(Checkout.calculateShipping(1, "jakarta", "drone").valid).toBe(false);
  });
  test("sameday outside jawa → invalid", () => {
    expect(Checkout.calculateShipping(1, "medan", "sameday").valid).toBe(false);
  });
  test("regular jawa → 9000 base", () => {
    const r = Checkout.calculateShipping(0.5, "jakarta", "regular");
    expect(r.valid).toBe(true);
    expect(r.cost).toBe(9000);
  });
  test("express jawa → 18000 base", () => {
    const r = Checkout.calculateShipping(0.5, "bandung", "express");
    expect(r.valid).toBe(true);
    expect(r.cost).toBe(18000);
  });
  test("sameday jawa → 30000 base", () => {
    const r = Checkout.calculateShipping(0.5, "jakarta", "sameday");
    expect(r.valid).toBe(true);
    expect(r.cost).toBe(30000);
  });
  test("papua regular → 35000 base", () => {
    const r = Checkout.calculateShipping(0.5, "jayapura", "regular");
    expect(r.valid).toBe(true);
    expect(r.cost).toBe(35000);
  });
  test("weight surcharge added to base", () => {
    const r = Checkout.calculateShipping(2, "jakarta", "regular");
    expect(r.valid).toBe(true);
    expect(r.cost).toBe(9000 + 5000); // base + surcharge
  });

  // *** COVERAGE FIX: L308 — zona pengiriman ada tapi rates tidak ***
  test("zone exists but rates undefined → invalid (L308)", () => {
    // Sementara tambah mapping zone yang tidak ada di SHIPPING_RATES
    Checkout.SHIPPING_ZONES["testkota"] = "zona_hantu";
    const r = Checkout.calculateShipping(1, "testkota", "regular");
    delete Checkout.SHIPPING_ZONES["testkota"]; // cleanup
    expect(r.valid).toBe(false);
    expect(r.error).toContain("tidak tersedia");
  });
});

// ===================== validateBuyerData =====================
describe("validateBuyerData - Whitebox (14 branches)", () => {
  test("null buyer → invalid", () => {
    expect(Checkout.validateBuyerData(null).valid).toBe(false);
  });
  test("missing name → error.name", () => {
    const r = Checkout.validateBuyerData({ name: "", email: "a@b.com", phone: "081234567890", address: "Jalan Merdeka No.1 Jakarta" });
    expect(r.errors.name).toBeDefined();
  });
  test("name < 3 chars → error.name", () => {
    const r = Checkout.validateBuyerData({ name: "AB", email: "a@b.com", phone: "081234567890", address: "Jalan Merdeka No.1 Jakarta" });
    expect(r.errors.name).toBeDefined();
  });
  test("name > 100 chars → error.name", () => {
    const r = Checkout.validateBuyerData({ name: "A".repeat(101), email: "a@b.com", phone: "081234567890", address: "Jalan Merdeka No.1 Jakarta" });
    expect(r.errors.name).toBeDefined();
  });
  test("missing email → error.email", () => {
    const r = Checkout.validateBuyerData({ name: "Budi", email: "", phone: "081234567890", address: "Jalan Merdeka No.1 Jakarta" });
    expect(r.errors.email).toBeDefined();
  });
  test("invalid email format → error.email", () => {
    const r = Checkout.validateBuyerData({ name: "Budi", email: "bukan-email", phone: "081234567890", address: "Jalan Merdeka No.1 Jakarta" });
    expect(r.errors.email).toBeDefined();
  });
  test("missing phone → error.phone", () => {
    const r = Checkout.validateBuyerData({ name: "Budi", email: "a@b.com", phone: "", address: "Jalan Merdeka No.1 Jakarta" });
    expect(r.errors.phone).toBeDefined();
  });
  test("invalid phone format → error.phone", () => {
    const r = Checkout.validateBuyerData({ name: "Budi", email: "a@b.com", phone: "1234567", address: "Jalan Merdeka No.1 Jakarta" });
    expect(r.errors.phone).toBeDefined();
  });
  test("missing address → error.address", () => {
    const r = Checkout.validateBuyerData({ name: "Budi", email: "a@b.com", phone: "081234567890", address: "" });
    expect(r.errors.address).toBeDefined();
  });
  test("address < 10 chars → error.address", () => {
    const r = Checkout.validateBuyerData({ name: "Budi", email: "a@b.com", phone: "081234567890", address: "Jl.A" });
    expect(r.errors.address).toBeDefined();
  });
  test("address > 500 chars → error.address", () => {
    const r = Checkout.validateBuyerData({ name: "Budi", email: "a@b.com", phone: "081234567890", address: "A".repeat(501) });
    expect(r.errors.address).toBeDefined();
  });
  test("valid data → all valid", () => {
    const r = Checkout.validateBuyerData({
      name: "Budi Santoso",
      email: "budi@email.com",
      phone: "081234567890",
      address: "Jalan Merdeka No.1, Jakarta Pusat",
    });
    expect(r.valid).toBe(true);
  });
});

// ===================== processCheckout =====================
describe("processCheckout - Integration (Whitebox ~20 branches)", () => {
  const validBuyer = {
    name: "Budi Santoso",
    email: "budi@email.com",
    phone: "081234567890",
    address: "Jalan Merdeka No.1, Jakarta Pusat",
  };

  test("empty cart → fail", () => {
    expect(Checkout.processCheckout([], validBuyer, "", "jakarta", "regular").success).toBe(false);
  });

  test("invalid stock → fail", () => {
    const r = Checkout.processCheckout([{ productId: 1, quantity: 9999 }], validBuyer, "", "jakarta", "regular");
    expect(r.success).toBe(false);
  });

  test("invalid buyer data → fail", () => {
    const r = Checkout.processCheckout(
      [{ productId: 1, quantity: 1 }],
      { name: "", email: "", phone: "", address: "" },
      "", "jakarta", "regular"
    );
    expect(r.success).toBe(false);
  });

  test("invalid region → fail", () => {
    const r = Checkout.processCheckout([{ productId: 1, quantity: 1 }], validBuyer, "", "", "regular");
    expect(r.success).toBe(false);
  });

  test("invalid shipping method → fail", () => {
    const r = Checkout.processCheckout([{ productId: 1, quantity: 1 }], validBuyer, "", "jakarta", "");
    expect(r.success).toBe(false);
  });

  test("invalid coupon → fail", () => {
    const r = Checkout.processCheckout([{ productId: 1, quantity: 1 }], validBuyer, "KODE_SALAH", "jakarta", "regular");
    expect(r.success).toBe(false);
  });

  test("valid checkout no coupon → success", () => {
    const r = Checkout.processCheckout([{ productId: 1, quantity: 2 }], validBuyer, "", "jakarta", "regular");
    expect(r.success).toBe(true);
    expect(r.summary.grandTotal).toBeGreaterThan(0);
    expect(r.orderId).toMatch(/^ORD-/);
  });

  test("valid checkout with coupon → discount applied", () => {
    const r = Checkout.processCheckout(
      [{ productId: 2, quantity: 2 }], // 890000 x2 = 1780000 > 1500000 free shipping
      validBuyer, "DISKON10", "bandung", "express"
    );
    expect(r.success).toBe(true);
    expect(r.summary.discount).toBeGreaterThan(0);
  });

  test("subtotal >= 1.5jt → free shipping", () => {
    const r = Checkout.processCheckout(
      [{ productId: 2, quantity: 2 }], // 890000 * 2 = 1780000
      validBuyer, "", "jakarta", "regular"
    );
    expect(r.success).toBe(true);
    expect(r.summary.freeShipping).toBe(true);
    expect(r.summary.shipping).toBe(0);
  });

  test("bundle discount applied when no coupon", () => {
    const r = Checkout.processCheckout(
      [
        { productId: 1, quantity: 1 },
        { productId: 2, quantity: 1 },
        { productId: 3, quantity: 1 },
      ],
      validBuyer, "", "jakarta", "regular"
    );
    expect(r.success).toBe(true);
    expect(r.summary.discount).toBeGreaterThan(0);
  });

  test("grand total calculation is correct", () => {
    const r = Checkout.processCheckout(
      [{ productId: 4, quantity: 1 }], // 275000
      validBuyer, "", "jakarta", "regular"
    );
    expect(r.success).toBe(true);
    const { subtotal, discount, tax, shipping, grandTotal } = r.summary;
    expect(grandTotal).toBe(subtotal - discount + tax + shipping);
  });

  // *** COVERAGE FIX: L425 — decimal quantity lolos validateStock tapi gagal di calculateItemSubtotal ***
  test("decimal quantity passes stock validation but fails subtotal (L425)", () => {
    // quantity=1.5: validateStock → 1.5 > 0 ✓, 1.5 <= stock(25) ✓ → lolos
    // calculateItemSubtotal → !Number.isInteger(1.5) → gagal
    const r = Checkout.processCheckout(
      [{ productId: 1, quantity: 1.5 }],
      validBuyer, "", "jakarta", "regular"
    );
    expect(r.success).toBe(false);
    expect(r.error).toContain("bilangan bulat");
  });

  // *** COVERAGE FIX: L462-463 — bundleDiscount > couponDiscount ***
  test("bundle discount > coupon discount → bundle wins (L462-463)", () => {
    // 3 items: 350000 + 890000 + 450000 = 1690000
    // Bundle: 5% * 1690000 = 84500
    // GRATIS50K: fixed 50000 (minPurchase 300000 → 1690000 >= 300000 ✓)
    // 84500 > 50000 → bundle menang
    const r = Checkout.processCheckout(
      [
        { productId: 1, quantity: 1 },
        { productId: 2, quantity: 1 },
        { productId: 3, quantity: 1 },
      ],
      validBuyer, "GRATIS50K", "jakarta", "regular"
    );
    expect(r.success).toBe(true);
    expect(r.summary.discount).toBe(84500); // bundle wins
    expect(r.summary.discountSource).toContain("Bundle");
  });

  // *** COVERAGE FIX: L482 — region non-empty tapi tidak ada di TAX_RATES ***
  test("unknown region passes empty check but fails tax (L482)", () => {
    // "atlantis" passes L476 check (non-empty string)
    // calculateTax("atlantis") → not in TAX_RATES → invalid
    const r = Checkout.processCheckout(
      [{ productId: 1, quantity: 1 }],
      validBuyer, "", "atlantis", "regular"
    );
    expect(r.success).toBe(false);
    expect(r.error).toContain("Pajak");
  });

  // *** COVERAGE FIX: L514 — grandTotal <= 0 via negative tax rate ***
  test("negative grand total → invalid (L514)", () => {
    // Sementara inject tax rate negatif untuk menciptakan grandTotal <= 0
    Checkout.TAX_RATES["negcity"] = -100;
    Checkout.SHIPPING_ZONES["negcity"] = "negzone";
    Checkout.SHIPPING_RATES["negzone"] = { regular: 1, express: 2, sameday: null };

    // subtotal=350000, afterDiscount=350000, tax=350000*(-100)=-35000000
    // grandTotal = 350000 + (-35000000) + 1 = -34650000 <= 0
    const r = Checkout.processCheckout(
      [{ productId: 1, quantity: 1 }],
      validBuyer, "", "negcity", "regular"
    );

    // Cleanup
    delete Checkout.TAX_RATES["negcity"];
    delete Checkout.SHIPPING_ZONES["negcity"];
    delete Checkout.SHIPPING_RATES["negzone"];

    expect(r.success).toBe(false);
    expect(r.error).toBe("Total pembayaran tidak valid");
  });
});
