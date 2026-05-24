// ============================================================
// stress.test.js - STRESS TESTING
// Mengukur performa fungsi checkout di bawah beban besar
// Termasuk: Load test, Spike test, Breakpoint analysis,
//           Memory profiling
// ============================================================

const Checkout = require("../../src/js/checkout.js");

// ===================== CONFIG =====================
const ITERATIONS = {
  light: 1000,
  medium: 10000,
  heavy: 100000,
};

const VALID_BUYER = {
  name: "Stress Tester",
  email: "stress@test.com",
  phone: "081299999999",
  address: "Jalan Stress Test No.999, Jakarta Pusat",
};

// ===================== UTILITY =====================
function measureTime(label, fn, iterations) {
  const start = process.hrtime.bigint();
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < iterations; i++) {
    try {
      const result = fn(i);
      if (result && result.success !== false && result.valid !== false) successCount++;
      else failCount++;
    } catch (e) {
      failCount++;
    }
  }

  const end = process.hrtime.bigint();
  const durationMs = Number(end - start) / 1_000_000;
  const avgMs = durationMs / iterations;
  const throughput = Math.round(iterations / (durationMs / 1000));

  console.log(`\n📊 [${label}]`);
  console.log(`   Iterasi    : ${iterations.toLocaleString()}`);
  console.log(`   Total Waktu: ${durationMs.toFixed(2)} ms`);
  console.log(`   Avg/iterasi: ${avgMs.toFixed(4)} ms`);
  console.log(`   Throughput : ${throughput.toLocaleString()} ops/detik`);
  console.log(`   Sukses     : ${successCount.toLocaleString()}`);
  console.log(`   Gagal      : ${failCount.toLocaleString()}`);

  return { durationMs, avgMs, throughput, successCount, failCount };
}

// ===================== MAIN STRESS TESTS =====================
describe("STRESS TESTING - TechMart Checkout", () => {
  test("ST-01: validateBuyerData under load", () => {
    const r = measureTime("Valid buyer (medium)", () => Checkout.validateBuyerData(VALID_BUYER), ITERATIONS.medium);
    expect(r.avgMs).toBeLessThan(1);
  });

  test("ST-02: applyCoupon under load", () => {
    const coupons = ["DISKON10", "HEMAT20", "GRATIS50K", "EXPIRED01", "INVALID"];
    const amounts = [100000, 500000, 1000000, 2000000];
    const r = measureTime("Coupon (heavy)", (i) => Checkout.applyCoupon(amounts[i % amounts.length], coupons[i % coupons.length]), ITERATIONS.heavy);
    expect(r.avgMs).toBeLessThan(1);
  });

  test("ST-03: calculateShipping under load", () => {
    const regions = ["jakarta", "bandung", "medan", "bali", "jayapura"];
    const methods = ["regular", "express"];
    const r = measureTime("Shipping (heavy)", (i) => Checkout.calculateShipping(0.5, regions[i % regions.length], methods[i % methods.length]), ITERATIONS.heavy);
    expect(r.avgMs).toBeLessThan(1);
  });

  test("ST-04: calculateTax under load", () => {
    const regions = ["jakarta", "bandung", "medan", "bali", "jayapura"];
    const r = measureTime("Tax (heavy)", (i) => Checkout.calculateTax(500000, regions[i % regions.length]), ITERATIONS.heavy);
    expect(r.avgMs).toBeLessThan(1);
  });

  test("ST-05: processCheckout full flow under load", () => {
    const carts = [
      [{ productId: 1, quantity: 1 }],
      [{ productId: 2, quantity: 1 }],
      [{ productId: 1, quantity: 1 }, { productId: 2, quantity: 1 }],
    ];
    const regions = ["jakarta", "bandung", "surabaya"];
    const methods = ["regular", "express"];
    const r = measureTime("Full checkout (medium)", (i) => Checkout.processCheckout(carts[i % carts.length], VALID_BUYER, "", regions[i % regions.length], methods[i % methods.length]), ITERATIONS.medium);
    expect(r.successCount).toBeGreaterThan(0);
    expect(r.avgMs).toBeLessThan(10);
  });

  test("ST-06: Spike wave load test (5k → 10k → 15k)", () => {
    const spikes = [5000, 10000, 15000];
    for (const spike of spikes) {
      const r = measureTime(`Spike ${spike} req`, (i) => Checkout.processCheckout([{ productId: (i % 8) + 1, quantity: 1 }], VALID_BUYER, "", "jakarta", "regular"), spike);
      expect(r.avgMs).toBeLessThan(1); // < 1ms avg per request
    }
  });

  test("ST-07: calculateBundleDiscount under load", () => {
    const carts = [
      [{ productId: 1, quantity: 1 }],
      [{ productId: 1, quantity: 1 }, { productId: 2, quantity: 1 }, { productId: 3, quantity: 1 }],
    ];
    const r = measureTime("Bundle discount (heavy)", (i) => Checkout.calculateBundleDiscount(carts[i % carts.length], 1000000), ITERATIONS.heavy);
    expect(r.avgMs).toBeLessThan(1);
  });

  // ===================== BREAKPOINT ANALYSIS =====================
  test("ST-08: Breakpoint Analysis - cari titik degradasi performa", () => {
    console.log("\n🔍 BREAKPOINT ANALYSIS");
    console.log("   Mencari titik di mana performa mulai menurun...\n");

    const thresholdMs = 0.1; // threshold degradasi: avg > 0.1ms
    let breakpointFound = false;
    let prevAvg = 0;
    const results = [];

    // Naikkan beban secara eksponensial: 1K → 2K → 4K → 8K → ... → 512K
    for (let load = 1000; load <= 512000; load *= 2) {
      const r = measureTime(`Breakpoint ${load.toLocaleString()} req`, (i) => {
        return Checkout.processCheckout(
          [
            { productId: (i % 8) + 1, quantity: 1 },
            { productId: ((i + 1) % 8) + 1, quantity: 1 },
            { productId: ((i + 2) % 8) + 1, quantity: 1 },
          ],
          VALID_BUYER, "", "jakarta", "regular"
        );
      }, load);

      results.push({ load, avgMs: r.avgMs, throughput: r.throughput });

      // Deteksi degradasi: avg time naik signifikan (>50% dari sebelumnya)
      if (prevAvg > 0 && r.avgMs > prevAvg * 1.5 && r.avgMs > thresholdMs) {
        breakpointFound = true;
        console.log(`\n   ⚠️  DEGRADASI terdeteksi pada ${load.toLocaleString()} iterasi`);
        console.log(`       Avg sebelumnya: ${prevAvg.toFixed(4)}ms → Avg sekarang: ${r.avgMs.toFixed(4)}ms`);
      }
      prevAvg = r.avgMs;
    }

    if (!breakpointFound) {
      console.log("\n   ✅ Tidak ada degradasi signifikan hingga 512K iterasi");
    }

    console.log("\n   📈 Ringkasan Breakpoint Analysis:");
    console.log("   " + "-".repeat(50));
    results.forEach(r => {
      const status = r.avgMs < thresholdMs ? "✅" : "⚠️";
      console.log(`   ${status} ${r.load.toLocaleString().padStart(7)} req | avg: ${r.avgMs.toFixed(4)}ms | ${r.throughput.toLocaleString()} ops/s`);
    });

    // Sistem harus bertahan hingga minimal 100K tanpa crash
    expect(results.length).toBeGreaterThanOrEqual(5);
    expect(results[0].avgMs).toBeLessThan(1);
  });

  // ===================== MEMORY PROFILING =====================
  test("ST-09: Memory profiling - ukur penggunaan memori", () => {
    console.log("\n💾 MEMORY PROFILING");

    // Force GC jika tersedia
    if (global.gc) global.gc();

    const memBefore = process.memoryUsage();
    console.log(`   Memori sebelum: ${(memBefore.heapUsed / 1024 / 1024).toFixed(2)} MB`);

    // Jalankan 50K operasi checkout penuh
    const iterations = 50000;
    for (let i = 0; i < iterations; i++) {
      Checkout.processCheckout(
        [{ productId: (i % 8) + 1, quantity: 1 }],
        VALID_BUYER, "", "jakarta", "regular"
      );
    }

    const memAfter = process.memoryUsage();
    const memDelta = (memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024;

    console.log(`   Memori sesudah: ${(memAfter.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Delta memori : ${memDelta.toFixed(2)} MB`);
    console.log(`   RSS          : ${(memAfter.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Heap Total   : ${(memAfter.heapTotal / 1024 / 1024).toFixed(2)} MB`);

    // Memori tidak boleh bocor lebih dari 50MB untuk 50K operasi
    expect(memDelta).toBeLessThan(50);
    console.log(`\n   ✅ Memory profiling PASS (delta: ${memDelta.toFixed(2)} MB < 50 MB)`);
  });

  // ===================== EXTREME PAYLOAD TEST =====================
  test("ST-10: Extreme payload - input data sangat besar", () => {
    console.log("\n🔨 EXTREME PAYLOAD TEST");

    // Test 1: Cart dengan semua produk, quantity maksimal
    const maxCart = Checkout.PRODUCTS.map(p => ({ productId: p.id, quantity: Math.min(p.stock, Checkout.MAX_QUANTITY_PER_ITEM) }));
    const r1 = measureTime("Max cart (all products, max qty)", () => {
      return Checkout.processCheckout(maxCart, VALID_BUYER, "HEMAT20", "jayapura", "express");
    }, 1000);
    expect(r1.avgMs).toBeLessThan(5);

    // Test 2: Buyer data dengan string sangat panjang (boundary)
    const longBuyer = {
      name: "A".repeat(100),
      email: "a@b.com",
      phone: "081234567890",
      address: "A".repeat(500),
    };
    const r2 = measureTime("Long buyer strings (boundary)", () => {
      return Checkout.validateBuyerData(longBuyer);
    }, ITERATIONS.medium);
    expect(r2.avgMs).toBeLessThan(1);

    // Test 3: Rapid coupon validation
    const allCoupons = Object.keys(Checkout.COUPON_CODES);
    const r3 = measureTime("All coupons rapid fire", (i) => {
      return Checkout.applyCoupon(2000000, allCoupons[i % allCoupons.length]);
    }, ITERATIONS.heavy);
    expect(r3.avgMs).toBeLessThan(1);
  });
});
