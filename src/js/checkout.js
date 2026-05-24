// ============================================================
// checkout.js - Core E-Commerce Checkout Business Logic
// ============================================================
// Module ini berisi SEMUA logika bisnis untuk sistem checkout.
// Dirancang dengan banyak percabangan (if/else) agar cocok
// untuk analisis Cyclomatic Complexity & Whitebox Testing.
// Semua fungsi bersifat PURE (tanpa DOM manipulation).
// ============================================================

// ===================== KONSTANTA & DATA =====================

const PRODUCTS = [
  { id: 1, name: "Wireless Earbuds Pro", price: 350000, stock: 25, weight: 0.15, category: "audio" },
  { id: 2, name: "Mechanical Keyboard RGB", price: 890000, stock: 15, weight: 1.2, category: "peripheral" },
  { id: 3, name: "Gaming Mouse Wireless", price: 450000, stock: 30, weight: 0.3, category: "peripheral" },
  { id: 4, name: "USB-C Hub 7-in-1", price: 275000, stock: 20, weight: 0.2, category: "accessory" },
  { id: 5, name: "Monitor Stand Ergonomic", price: 520000, stock: 10, weight: 2.5, category: "furniture" },
  { id: 6, name: "Webcam Full HD 1080p", price: 680000, stock: 18, weight: 0.4, category: "camera" },
  { id: 7, name: "Mousepad XL Premium", price: 180000, stock: 40, weight: 0.5, category: "accessory" },
  { id: 8, name: "Phone Holder Adjustable", price: 125000, stock: 35, weight: 0.25, category: "accessory" },
];

const PRODUCT_EMOJIS = ["🎧", "⌨️", "🖱️", "🔌", "🖥️", "📷", "🖲️", "📱"];

const PRODUCT_GRADIENTS = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #f093fb, #f5576c)",
  "linear-gradient(135deg, #4facfe, #00f2fe)",
  "linear-gradient(135deg, #43e97b, #38f9d7)",
  "linear-gradient(135deg, #fa709a, #fee140)",
  "linear-gradient(135deg, #a18cd1, #fbc2eb)",
  "linear-gradient(135deg, #fccb90, #d57eeb)",
  "linear-gradient(135deg, #89f7fe, #66a6ff)",
];

const COUPON_CODES = {
  "DISKON10": { type: "percentage", value: 10, minPurchase: 500000, maxDiscount: 200000, active: true },
  "HEMAT20": { type: "percentage", value: 20, minPurchase: 1000000, maxDiscount: 500000, active: true },
  "GRATIS50K": { type: "fixed", value: 50000, minPurchase: 300000, maxDiscount: 50000, active: true },
  "EXPIRED01": { type: "percentage", value: 15, minPurchase: 0, maxDiscount: 100000, active: false },
  "SPESIAL30": { type: "percentage", value: 30, minPurchase: 2000000, maxDiscount: 1000000, active: true },
};

const TAX_RATES = {
  "jakarta": 0.11, "bandung": 0.11, "surabaya": 0.11,
  "yogyakarta": 0.11, "semarang": 0.11, "medan": 0.10,
  "makassar": 0.10, "bali": 0.10, "balikpapan": 0.10, "jayapura": 0.05,
};

const SHIPPING_ZONES = {
  "jakarta": "jawa", "bandung": "jawa", "surabaya": "jawa",
  "yogyakarta": "jawa", "semarang": "jawa", "medan": "sumatera",
  "bali": "bali_nusa", "makassar": "sulawesi",
  "balikpapan": "kalimantan", "jayapura": "papua",
};

const SHIPPING_RATES = {
  "jawa":       { regular: 9000,  express: 18000, sameday: 30000 },
  "sumatera":   { regular: 15000, express: 28000, sameday: null },
  "kalimantan":  { regular: 20000, express: 35000, sameday: null },
  "sulawesi":   { regular: 22000, express: 38000, sameday: null },
  "bali_nusa":  { regular: 18000, express: 30000, sameday: null },
  "papua":      { regular: 35000, express: 55000, sameday: null },
};

const FREE_SHIPPING_THRESHOLD = 1500000;
const MAX_QUANTITY_PER_ITEM = 10;
const BUNDLE_ITEM_THRESHOLD = 3;
const BUNDLE_DISCOUNT_PERCENT = 5;

// ===================== FUNGSI VALIDASI PRODUK =====================

/**
 * Validasi data produk
 * Branches: 8
 */
function validateProductData(product) {
  if (!product) {
    return { valid: false, error: "Produk tidak ditemukan" };
  }
  if (typeof product.id !== "number" || product.id <= 0) {
    return { valid: false, error: "ID produk tidak valid" };
  }
  if (!product.name || typeof product.name !== "string" || product.name.trim().length === 0) {
    return { valid: false, error: "Nama produk tidak valid" };
  }
  if (typeof product.price !== "number" || product.price <= 0) {
    return { valid: false, error: "Harga produk harus lebih dari 0" };
  }
  if (typeof product.stock !== "number" || product.stock < 0) {
    return { valid: false, error: "Stok produk tidak valid" };
  }
  if (typeof product.weight !== "number" || product.weight <= 0) {
    return { valid: false, error: "Berat produk harus lebih dari 0" };
  }
  if (!product.category || typeof product.category !== "string") {
    return { valid: false, error: "Kategori produk tidak valid" };
  }
  return { valid: true };
}

// ===================== KALKULASI SUBTOTAL =====================

/**
 * Hitung subtotal per item
 * Branches: 7
 */
function calculateItemSubtotal(price, quantity) {
  if (typeof price !== "number" || isNaN(price)) {
    return { valid: false, error: "Harga tidak valid", subtotal: 0 };
  }
  if (typeof quantity !== "number" || isNaN(quantity)) {
    return { valid: false, error: "Kuantitas tidak valid", subtotal: 0 };
  }
  if (price <= 0) {
    return { valid: false, error: "Harga harus lebih dari 0", subtotal: 0 };
  }
  if (quantity <= 0) {
    return { valid: false, error: "Kuantitas harus lebih dari 0", subtotal: 0 };
  }
  if (!Number.isInteger(quantity)) {
    return { valid: false, error: "Kuantitas harus bilangan bulat", subtotal: 0 };
  }
  if (quantity > MAX_QUANTITY_PER_ITEM) {
    return { valid: false, error: `Maksimal ${MAX_QUANTITY_PER_ITEM} per item`, subtotal: 0 };
  }
  const subtotal = price * quantity;
  return { valid: true, subtotal: subtotal };
}

// ===================== VALIDASI STOK =====================

/**
 * Validasi ketersediaan stok untuk semua item di cart
 * Branches: 6
 */
function validateStock(cartItems) {
  if (!cartItems || !Array.isArray(cartItems)) {
    return { valid: false, errors: ["Cart tidak valid"] };
  }
  if (cartItems.length === 0) {
    return { valid: false, errors: ["Cart kosong"] };
  }

  const errors = [];
  for (let i = 0; i < cartItems.length; i++) {
    const item = cartItems[i];
    const product = PRODUCTS.find(p => p.id === item.productId);

    if (!product) {
      errors.push(`Produk ID ${item.productId} tidak ditemukan`);
    } else if (item.quantity > product.stock) {
      errors.push(`Stok ${product.name} tidak cukup (tersisa: ${product.stock})`);
    } else if (item.quantity <= 0) {
      errors.push(`Kuantitas ${product.name} harus lebih dari 0`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors: errors };
  }
  return { valid: true, errors: [] };
}

// ===================== KUPON & DISKON =====================

/**
 * Aplikasikan kupon diskon
 * Branches: 10
 */
function applyCoupon(subtotal, couponCode) {
  if (typeof subtotal !== "number" || subtotal <= 0) {
    return { valid: false, discount: 0, error: "Subtotal tidak valid" };
  }
  if (!couponCode || typeof couponCode !== "string") {
    return { valid: false, discount: 0, error: "Kode kupon tidak valid" };
  }

  const code = couponCode.trim().toUpperCase();
  const coupon = COUPON_CODES[code];

  if (!coupon) {
    return { valid: false, discount: 0, error: "Kode kupon tidak ditemukan" };
  }
  if (!coupon.active) {
    return { valid: false, discount: 0, error: "Kupon sudah tidak aktif / kadaluarsa" };
  }
  if (subtotal < coupon.minPurchase) {
    return { valid: false, discount: 0, error: `Minimal pembelian Rp ${coupon.minPurchase.toLocaleString("id-ID")}` };
  }

  let discount = 0;
  if (coupon.type === "percentage") {
    discount = Math.floor(subtotal * (coupon.value / 100));
    if (discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else if (coupon.type === "fixed") {
    discount = coupon.value;
    if (discount > subtotal) {
      discount = subtotal;
    }
  } else {
    return { valid: false, discount: 0, error: "Tipe kupon tidak valid" };
  }

  return { valid: true, discount: discount, description: coupon.type === "percentage" ? `${coupon.value}%` : `Rp ${coupon.value.toLocaleString("id-ID")}` };
}

/**
 * Hitung diskon bundling (beli 3+ item berbeda dapat diskon tambahan)
 * Branches: 5
 */
function calculateBundleDiscount(cartItems, subtotal) {
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return { applied: false, discount: 0, message: "" };
  }
  if (typeof subtotal !== "number" || subtotal <= 0) {
    return { applied: false, discount: 0, message: "" };
  }

  const uniqueProducts = new Set(cartItems.map(item => item.productId));

  if (uniqueProducts.size >= BUNDLE_ITEM_THRESHOLD) {
    const discount = Math.floor(subtotal * (BUNDLE_DISCOUNT_PERCENT / 100));
    return { applied: true, discount: discount, message: `Bundle discount ${BUNDLE_DISCOUNT_PERCENT}% (${uniqueProducts.size} item berbeda)` };
  }

  return { applied: false, discount: 0, message: `Tambah ${BUNDLE_ITEM_THRESHOLD - uniqueProducts.size} item lagi untuk bundle discount` };
}

// ===================== PAJAK =====================

/**
 * Hitung pajak berdasarkan region
 * Branches: 5
 */
function calculateTax(amount, region) {
  if (typeof amount !== "number" || amount < 0) {
    return { valid: false, tax: 0, rate: 0, error: "Jumlah tidak valid" };
  }
  if (!region || typeof region !== "string") {
    return { valid: false, tax: 0, rate: 0, error: "Region tidak valid" };
  }

  const regionKey = region.trim().toLowerCase();
  const rate = TAX_RATES[regionKey];

  if (rate === undefined) {
    return { valid: false, tax: 0, rate: 0, error: `Region "${region}" tidak dikenali` };
  }

  if (amount === 0) {
    return { valid: true, tax: 0, rate: rate };
  }

  const tax = Math.floor(amount * rate);
  return { valid: true, tax: tax, rate: rate };
}

// ===================== ONGKOS KIRIM =====================

/**
 * Hitung surcharge berdasarkan berat total
 * Branches: 6
 */
function calculateWeightSurcharge(weight) {
  if (typeof weight !== "number" || weight < 0) {
    return 0;
  }
  if (weight <= 1) {
    return 0;
  } else if (weight <= 3) {
    return 5000;
  } else if (weight <= 5) {
    return 12000;
  } else if (weight <= 10) {
    return 25000;
  } else {
    return 50000;
  }
}

/**
 * Hitung ongkos kirim berdasarkan region, metode, dan berat
 * Branches: 12
 */
function calculateShipping(totalWeight, region, method) {
  if (typeof totalWeight !== "number" || totalWeight <= 0) {
    return { valid: false, cost: 0, error: "Berat total tidak valid" };
  }
  if (!region || typeof region !== "string") {
    return { valid: false, cost: 0, error: "Region tidak valid" };
  }
  if (!method || typeof method !== "string") {
    return { valid: false, cost: 0, error: "Metode pengiriman tidak valid" };
  }

  const regionKey = region.trim().toLowerCase();
  const zone = SHIPPING_ZONES[regionKey];

  if (!zone) {
    return { valid: false, cost: 0, error: `Region "${region}" tidak dikenali` };
  }

  const rates = SHIPPING_RATES[zone];
  if (!rates) {
    return { valid: false, cost: 0, error: `Zona pengiriman "${zone}" tidak tersedia` };
  }

  const methodKey = method.trim().toLowerCase();
  if (!["regular", "express", "sameday"].includes(methodKey)) {
    return { valid: false, cost: 0, error: `Metode "${method}" tidak valid. Pilih: regular, express, sameday` };
  }

  const baseRate = rates[methodKey];
  if (baseRate === null) {
    return { valid: false, cost: 0, error: `Metode ${method} tidak tersedia untuk region ${region}` };
  }

  const surcharge = calculateWeightSurcharge(totalWeight);
  const totalCost = baseRate + surcharge;

  return {
    valid: true,
    cost: totalCost,
    zone: zone,
    method: methodKey,
    baseRate: baseRate,
    surcharge: surcharge,
  };
}

// ===================== VALIDASI DATA PEMBELI =====================

/**
 * Validasi data pembeli
 * Branches: 14
 */
function validateBuyerData(buyer) {
  const errors = {};

  if (!buyer || typeof buyer !== "object") {
    return { valid: false, errors: { general: "Data pembeli tidak valid" } };
  }

  // Validasi nama
  if (!buyer.name || typeof buyer.name !== "string") {
    errors.name = "Nama harus diisi";
  } else if (buyer.name.trim().length < 3) {
    errors.name = "Nama minimal 3 karakter";
  } else if (buyer.name.trim().length > 100) {
    errors.name = "Nama maksimal 100 karakter";
  }

  // Validasi email
  if (!buyer.email || typeof buyer.email !== "string") {
    errors.email = "Email harus diisi";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(buyer.email.trim())) {
      errors.email = "Format email tidak valid";
    }
  }

  // Validasi telepon
  if (!buyer.phone || typeof buyer.phone !== "string") {
    errors.phone = "Nomor telepon harus diisi";
  } else {
    const phoneClean = buyer.phone.trim().replace(/[\s\-]/g, "");
    if (!/^(08|628|\+628)\d{8,12}$/.test(phoneClean)) {
      errors.phone = "Format telepon tidak valid (contoh: 08xxxxxxxxxx)";
    }
  }

  // Validasi alamat
  if (!buyer.address || typeof buyer.address !== "string") {
    errors.address = "Alamat harus diisi";
  } else if (buyer.address.trim().length < 10) {
    errors.address = "Alamat minimal 10 karakter";
  } else if (buyer.address.trim().length > 500) {
    errors.address = "Alamat maksimal 500 karakter";
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors: errors };
  }
  return { valid: true, errors: {} };
}

// ===================== PROSES CHECKOUT UTAMA =====================

/**
 * Fungsi utama proses checkout
 * Mengorkestrasikan seluruh validasi dan kalkulasi
 * Branches: ~20
 */
function processCheckout(cartItems, buyerData, couponCode, region, shippingMethod) {
  // 1. Validasi cart
  if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
    return { success: false, error: "Keranjang belanja kosong" };
  }

  // 2. Validasi stok
  const stockResult = validateStock(cartItems);
  if (!stockResult.valid) {
    return { success: false, error: stockResult.errors.join("; ") };
  }

  // 3. Hitung subtotal
  let subtotal = 0;
  let totalWeight = 0;
  const itemDetails = [];

  for (let i = 0; i < cartItems.length; i++) {
    const item = cartItems[i];
    const product = PRODUCTS.find(p => p.id === item.productId);

    /* istanbul ignore next -- defensive: unreachable setelah validateStock lolos */
    if (!product) {
      return { success: false, error: `Produk ID ${item.productId} tidak ditemukan` };
    }

    const itemResult = calculateItemSubtotal(product.price, item.quantity);
    if (!itemResult.valid) {
      return { success: false, error: `${product.name}: ${itemResult.error}` };
    }

    subtotal += itemResult.subtotal;
    totalWeight += product.weight * item.quantity;
    itemDetails.push({
      product: product.name,
      price: product.price,
      quantity: item.quantity,
      subtotal: itemResult.subtotal,
    });
  }

  // 4. Hitung diskon kupon
  let couponDiscount = 0;
  let couponInfo = null;
  if (couponCode && couponCode.trim().length > 0) {
    const couponResult = applyCoupon(subtotal, couponCode);
    if (!couponResult.valid) {
      return { success: false, error: `Kupon: ${couponResult.error}` };
    }
    couponDiscount = couponResult.discount;
    couponInfo = couponResult.description;
  }

  // 5. Hitung bundle discount
  const bundleResult = calculateBundleDiscount(cartItems, subtotal);
  let bundleDiscount = bundleResult.discount;

  // 6. Ambil diskon terbesar (kupon vs bundle, tidak stack)
  let finalDiscount = 0;
  let discountSource = "";
  if (couponDiscount > 0 && bundleDiscount > 0) {
    if (couponDiscount >= bundleDiscount) {
      finalDiscount = couponDiscount;
      discountSource = `Kupon (${couponInfo})`;
    } else {
      finalDiscount = bundleDiscount;
      discountSource = bundleResult.message;
    }
  } else if (couponDiscount > 0) {
    finalDiscount = couponDiscount;
    discountSource = `Kupon (${couponInfo})`;
  } else if (bundleDiscount > 0) {
    finalDiscount = bundleDiscount;
    discountSource = bundleResult.message;
  }

  const afterDiscount = subtotal - finalDiscount;

  // 7. Validasi region & hitung pajak
  if (!region || typeof region !== "string" || region.trim().length === 0) {
    return { success: false, error: "Region pengiriman harus dipilih" };
  }

  const taxResult = calculateTax(afterDiscount, region);
  if (!taxResult.valid) {
    return { success: false, error: `Pajak: ${taxResult.error}` };
  }

  // 8. Validasi metode & hitung ongkir
  if (!shippingMethod || typeof shippingMethod !== "string" || shippingMethod.trim().length === 0) {
    return { success: false, error: "Metode pengiriman harus dipilih" };
  }

  const shippingResult = calculateShipping(totalWeight, region, shippingMethod);
  if (!shippingResult.valid) {
    return { success: false, error: `Ongkir: ${shippingResult.error}` };
  }

  // 9. Free shipping check
  let shippingCost = shippingResult.cost;
  let freeShipping = false;
  if (afterDiscount >= FREE_SHIPPING_THRESHOLD) {
    shippingCost = 0;
    freeShipping = true;
  }

  // 10. Validasi data pembeli
  const buyerResult = validateBuyerData(buyerData);
  if (!buyerResult.valid) {
    const firstError = Object.values(buyerResult.errors)[0];
    return { success: false, error: `Data pembeli: ${firstError}` };
  }

  // 11. Hitung grand total
  const grandTotal = afterDiscount + taxResult.tax + shippingCost;

  if (grandTotal <= 0) {
    return { success: false, error: "Total pembayaran tidak valid" };
  }

  // 12. Berhasil
  return {
    success: true,
    orderId: "ORD-" + Date.now(),
    summary: {
      items: itemDetails,
      subtotal: subtotal,
      discount: finalDiscount,
      discountSource: discountSource,
      afterDiscount: afterDiscount,
      tax: taxResult.tax,
      taxRate: taxResult.rate,
      shipping: shippingCost,
      shippingZone: shippingResult.zone,
      shippingMethod: shippingResult.method,
      freeShipping: freeShipping,
      totalWeight: totalWeight,
      grandTotal: grandTotal,
    },
    buyer: {
      name: buyerData.name.trim(),
      email: buyerData.email.trim(),
      phone: buyerData.phone.trim(),
      address: buyerData.address.trim(),
      region: region,
    },
  };
}

// ===================== EXPORT =====================

// Support browser & Node.js
/* istanbul ignore else */
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    PRODUCTS, PRODUCT_EMOJIS, PRODUCT_GRADIENTS, COUPON_CODES,
    TAX_RATES, SHIPPING_ZONES, SHIPPING_RATES,
    FREE_SHIPPING_THRESHOLD, MAX_QUANTITY_PER_ITEM,
    BUNDLE_ITEM_THRESHOLD, BUNDLE_DISCOUNT_PERCENT,
    validateProductData, calculateItemSubtotal, validateStock,
    applyCoupon, calculateBundleDiscount, calculateTax,
    calculateWeightSurcharge, calculateShipping,
    validateBuyerData, processCheckout,
  };
} else {
  window.Checkout = {
    PRODUCTS, PRODUCT_EMOJIS, PRODUCT_GRADIENTS, COUPON_CODES,
    TAX_RATES, SHIPPING_ZONES, SHIPPING_RATES,
    FREE_SHIPPING_THRESHOLD, MAX_QUANTITY_PER_ITEM,
    BUNDLE_ITEM_THRESHOLD, BUNDLE_DISCOUNT_PERCENT,
    validateProductData, calculateItemSubtotal, validateStock,
    applyCoupon, calculateBundleDiscount, calculateTax,
    calculateWeightSurcharge, calculateShipping,
    validateBuyerData, processCheckout,
  };
}
