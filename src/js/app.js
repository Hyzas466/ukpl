// ============================================================
// app.js - TechMart UI Controller (SPA + Sidebar Navigation)
// ============================================================

(function () {
  "use strict";

  const C = window.Checkout;
  const fmt = (n) => `Rp ${n.toLocaleString("id-ID")}`;
  let cart = [];
  let orderHistory = [];

  // ===================== NAVIGATION =====================
  const sidebar = document.getElementById("sidebar");
  const sidebarOverlay = document.getElementById("sidebar-overlay");
  const hamburger = document.getElementById("hamburger");
  const navItems = document.querySelectorAll(".nav-item");
  const pages = document.querySelectorAll(".page");

  function navigateTo(pageName) {
    pages.forEach((p) => p.classList.remove("active"));
    navItems.forEach((n) => n.classList.remove("active"));

    const target = document.getElementById("page-" + pageName);
    if (target) target.classList.add("active");

    navItems.forEach((n) => {
      if (n.dataset.page === pageName) n.classList.add("active");
    });

    closeSidebar();

    // Refresh page data
    if (pageName === "dashboard") renderDashboard();
    if (pageName === "produk") renderProducts();
    if (pageName === "checkout") renderCheckoutPage();
    if (pageName === "riwayat") renderHistory();
    if (pageName === "info") renderInfoPage();
  }

  navItems.forEach((item) => {
    item.addEventListener("click", () => navigateTo(item.dataset.page));
  });

  // Mobile sidebar toggle
  function openSidebar() {
    sidebar.classList.add("open");
    sidebarOverlay.classList.add("active");
    hamburger.classList.add("active");
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("active");
    hamburger.classList.remove("active");
  }

  hamburger.addEventListener("click", () => {
    sidebar.classList.contains("open") ? closeSidebar() : openSidebar();
  });
  sidebarOverlay.addEventListener("click", closeSidebar);

  // Mobile cart toggle → go to checkout page
  document.getElementById("mobile-cart-toggle").addEventListener("click", () => {
    navigateTo("checkout");
  });

  // Cart indicator on produk page
  document.getElementById("cart-indicator").addEventListener("click", () => {
    navigateTo("checkout");
  });

  // ===================== TOAST =====================
  function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    const icons = { success: "✅", error: "❌", info: "ℹ️" };
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // ===================== DASHBOARD =====================
  function renderDashboard() {
    const grid = document.getElementById("stats-grid");
    const totalProducts = C.PRODUCTS.length;
    const totalStock = C.PRODUCTS.reduce((sum, p) => sum + p.stock, 0);
    const activeCoupons = Object.values(C.COUPON_CODES).filter((c) => c.active).length;
    const totalOrders = orderHistory.length;

    grid.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(124,92,252,0.15);color:#a78bfa;">📦</div>
        <div><div class="stat-value">${totalProducts}</div><div class="stat-label">Total Produk</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(0,212,170,0.15);color:#00d4aa;">📊</div>
        <div><div class="stat-value">${totalStock}</div><div class="stat-label">Total Stok</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(34,197,94,0.15);color:#22c55e;">🏷️</div>
        <div><div class="stat-value">${activeCoupons}</div><div class="stat-label">Kupon Aktif</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background:rgba(245,158,11,0.15);color:#f59e0b;">🧾</div>
        <div><div class="stat-value">${totalOrders}</div><div class="stat-label">Total Pesanan</div></div>
      </div>
    `;

    // Product summary
    const prodDiv = document.getElementById("dashboard-products");
    prodDiv.innerHTML = C.PRODUCTS.map(
      (p, i) => `
      <div class="dash-product-row">
        <div class="dash-product-name">
          <span class="dash-product-emoji">${C.PRODUCT_EMOJIS[i]}</span>
          <span>${p.name}</span>
        </div>
        <span class="dash-product-stock">Stok: ${p.stock}</span>
      </div>
    `
    ).join("");

    // Coupon summary
    const coupDiv = document.getElementById("dashboard-coupons");
    coupDiv.innerHTML = Object.entries(C.COUPON_CODES)
      .map(
        ([code, c]) => `
      <div class="dash-coupon-row">
        <span class="dash-coupon-code">${code}</span>
        <span class="coupon-badge ${c.active ? "active" : "expired"}">${c.active ? "Aktif" : "Expired"}</span>
      </div>
    `
      )
      .join("");
  }

  // ===================== PRODUCTS =====================
  function renderProducts() {
    const grid = document.getElementById("products-grid");
    grid.innerHTML = C.PRODUCTS.map(
      (p, i) => `
      <div class="product-card" id="product-${p.id}">
        <div class="product-image" style="background:${C.PRODUCT_GRADIENTS[i]}">${C.PRODUCT_EMOJIS[i]}</div>
        <div class="product-info">
          <div class="product-name">${p.name}</div>
          <div class="product-category">${p.category}</div>
          <div class="product-meta">
            <span class="product-price">${fmt(p.price)}</span>
            <span class="product-stock ${p.stock <= 5 ? "low" : ""} ${p.stock === 0 ? "out" : ""}">
              ${p.stock === 0 ? "Habis" : `Stok: ${p.stock}`}
            </span>
          </div>
          <button class="btn-add-cart" data-id="${p.id}" ${p.stock === 0 ? "disabled" : ""}>
            ${p.stock === 0 ? "Habis" : "＋ Tambah ke Keranjang"}
          </button>
        </div>
      </div>
    `
    ).join("");

    // Add to cart listeners
    grid.querySelectorAll(".btn-add-cart").forEach((btn) => {
      btn.addEventListener("click", () => addToCart(parseInt(btn.dataset.id)));
    });

    updateCartBadge();
  }

  function addToCart(productId) {
    const product = C.PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    const existing = cart.find((c) => c.productId === productId);
    if (existing) {
      if (existing.quantity >= product.stock || existing.quantity >= C.MAX_QUANTITY_PER_ITEM) {
        showToast(`Maksimal ${Math.min(product.stock, C.MAX_QUANTITY_PER_ITEM)} per item`, "error");
        return;
      }
      existing.quantity++;
    } else {
      cart.push({ productId, quantity: 1 });
    }

    // Button feedback
    const btn = document.querySelector(`.btn-add-cart[data-id="${productId}"]`);
    if (btn) {
      btn.classList.add("added");
      btn.textContent = "✓ Ditambahkan";
      setTimeout(() => {
        btn.classList.remove("added");
        btn.textContent = "＋ Tambah ke Keranjang";
      }, 800);
    }

    updateCartBadge();
    showToast(`${product.name} ditambahkan ke keranjang`, "success");
  }

  function updateCartBadge() {
    const total = cart.reduce((s, c) => s + c.quantity, 0);
    const badge = document.getElementById("cart-badge");
    const mobileCount = document.getElementById("mobile-cart-count");
    if (badge) badge.textContent = total;
    if (mobileCount) mobileCount.textContent = total;
  }

  // ===================== CHECKOUT PAGE =====================
  function renderCheckoutPage() {
    renderCartItems();
    updateOrderPreview();
  }

  function renderCartItems() {
    const container = document.getElementById("cart-items");
    if (cart.length === 0) {
      container.innerHTML = `<div class="cart-empty"><div class="cart-empty-icon">🛒</div><p>Keranjang kosong</p></div>`;
      document.getElementById("cart-subtotal").textContent = "Rp 0";
      document.getElementById("cart-total-items").textContent = "0 item";
      return;
    }

    let subtotal = 0;
    let totalItems = 0;

    container.innerHTML = cart
      .map((item) => {
        const p = C.PRODUCTS.find((pr) => pr.id === item.productId);
        if (!p) return "";
        const idx = C.PRODUCTS.indexOf(p);
        const itemSub = p.price * item.quantity;
        subtotal += itemSub;
        totalItems += item.quantity;

        return `
        <div class="cart-item">
          <div class="cart-item-emoji" style="background:${C.PRODUCT_GRADIENTS[idx]}">${C.PRODUCT_EMOJIS[idx]}</div>
          <div class="cart-item-details">
            <div class="cart-item-name">${p.name}</div>
            <div class="cart-item-price">${fmt(itemSub)}</div>
            <div class="cart-item-controls">
              <button class="qty-btn" data-action="dec" data-id="${p.id}">−</button>
              <span class="cart-item-qty">${item.quantity}</span>
              <button class="qty-btn" data-action="inc" data-id="${p.id}">+</button>
            </div>
          </div>
          <button class="btn-remove-item" data-id="${p.id}" title="Hapus">✕</button>
        </div>
      `;
      })
      .join("");

    document.getElementById("cart-subtotal").textContent = fmt(subtotal);
    document.getElementById("cart-total-items").textContent = `${totalItems} item`;

    // Qty buttons
    container.querySelectorAll(".qty-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        const item = cart.find((c) => c.productId === id);
        const product = C.PRODUCTS.find((p) => p.id === id);
        if (!item || !product) return;

        if (btn.dataset.action === "inc") {
          if (item.quantity < Math.min(product.stock, C.MAX_QUANTITY_PER_ITEM)) {
            item.quantity++;
          } else {
            showToast("Kuantitas sudah maksimal", "error");
          }
        } else {
          item.quantity--;
          if (item.quantity <= 0) cart = cart.filter((c) => c.productId !== id);
        }
        renderCheckoutPage();
        updateCartBadge();
      });
    });

    // Remove buttons
    container.querySelectorAll(".btn-remove-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        cart = cart.filter((c) => c.productId !== parseInt(btn.dataset.id));
        renderCheckoutPage();
        updateCartBadge();
        showToast("Item dihapus dari keranjang", "info");
      });
    });
  }

  function updateOrderPreview() {
    const subtotal = cart.reduce((sum, item) => {
      const p = C.PRODUCTS.find((pr) => pr.id === item.productId);
      return sum + (p ? p.price * item.quantity : 0);
    }, 0);

    document.getElementById("preview-subtotal").textContent = fmt(subtotal);

    const couponCode = document.getElementById("coupon-code").value.trim();
    let discount = 0;
    if (couponCode && subtotal > 0) {
      const r = C.applyCoupon(subtotal, couponCode);
      if (r.valid) discount = r.discount;
    }

    // Bundle discount
    const bundle = C.calculateBundleDiscount(cart, subtotal);
    const finalDiscount = Math.max(discount, bundle.discount);

    document.getElementById("preview-discount").textContent = `- ${fmt(finalDiscount)}`;

    const region = document.getElementById("shipping-region").value;
    const method = document.getElementById("shipping-method").value;
    const afterDiscount = subtotal - finalDiscount;

    let tax = 0;
    if (region && afterDiscount > 0) {
      const t = C.calculateTax(afterDiscount, region);
      if (t.valid) tax = t.tax;
    }
    document.getElementById("preview-tax").textContent = fmt(tax);

    let shippingCost = 0;
    const totalWeight = cart.reduce((sum, item) => {
      const p = C.PRODUCTS.find((pr) => pr.id === item.productId);
      return sum + (p ? p.weight * item.quantity : 0);
    }, 0);

    if (region && method && totalWeight > 0) {
      const s = C.calculateShipping(totalWeight, region, method);
      if (s.valid) {
        shippingCost = afterDiscount >= C.FREE_SHIPPING_THRESHOLD ? 0 : s.cost;
      }
    }
    const freeShipText = afterDiscount >= C.FREE_SHIPPING_THRESHOLD ? " (GRATIS! 🎉)" : "";
    document.getElementById("preview-shipping").textContent = shippingCost === 0 && cart.length > 0 ? "GRATIS 🎉" : fmt(shippingCost);

    const grandTotal = afterDiscount + tax + shippingCost;
    document.getElementById("preview-grand-total").textContent = fmt(Math.max(0, grandTotal));
  }

  // Live preview updates
  ["shipping-region", "shipping-method", "coupon-code"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", updateOrderPreview);
    if (el) el.addEventListener("input", updateOrderPreview);
  });

  // Apply coupon button
  document.getElementById("btn-apply-coupon").addEventListener("click", () => {
    const code = document.getElementById("coupon-code").value.trim();
    const status = document.getElementById("coupon-status");
    if (!code) {
      status.className = "coupon-status error";
      status.textContent = "Masukkan kode kupon";
      return;
    }

    const subtotal = cart.reduce((sum, item) => {
      const p = C.PRODUCTS.find((pr) => pr.id === item.productId);
      return sum + (p ? p.price * item.quantity : 0);
    }, 0);

    const result = C.applyCoupon(subtotal, code);
    if (result.valid) {
      status.className = "coupon-status success";
      status.textContent = `✓ Diskon ${result.description} (${fmt(result.discount)})`;
    } else {
      status.className = "coupon-status error";
      status.textContent = `✕ ${result.error}`;
    }
    updateOrderPreview();
  });

  // Process checkout
  document.getElementById("checkout-form").addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors();

    const buyerData = {
      name: document.getElementById("buyer-name").value,
      email: document.getElementById("buyer-email").value,
      phone: document.getElementById("buyer-phone").value,
      address: document.getElementById("buyer-address").value,
    };
    const region = document.getElementById("shipping-region").value;
    const method = document.getElementById("shipping-method").value;
    const coupon = document.getElementById("coupon-code").value.trim() || null;

    if (!region) {
      showFieldError("error-region", "Pilih region pengiriman");
      return;
    }
    if (!method) {
      showFieldError("error-method", "Pilih metode pengiriman");
      return;
    }

    const result = C.processCheckout(cart, buyerData, coupon, region, method);

    if (!result.success) {
      showToast(result.error, "error");
      // Map errors to fields
      const err = result.error.toLowerCase();
      if (err.includes("nama")) showFieldError("error-name", result.error.replace("Data pembeli: ", ""));
      else if (err.includes("email")) showFieldError("error-email", result.error.replace("Data pembeli: ", ""));
      else if (err.includes("telepon")) showFieldError("error-phone", result.error.replace("Data pembeli: ", ""));
      else if (err.includes("alamat")) showFieldError("error-address", result.error.replace("Data pembeli: ", ""));
      return;
    }

    // Success!
    const s = result.summary;
    orderHistory.unshift({
      orderId: result.orderId,
      date: new Date().toLocaleString("id-ID"),
      items: s.items,
      grandTotal: s.grandTotal,
      buyer: result.buyer,
    });

    // Show success modal
    document.getElementById("success-order-id").textContent = result.orderId;
    document.getElementById("success-details").innerHTML = `
      <div class="detail-row"><span>Subtotal</span><span>${fmt(s.subtotal)}</span></div>
      ${s.discount > 0 ? `<div class="detail-row"><span>Diskon (${s.discountSource})</span><span style="color:#22c55e">- ${fmt(s.discount)}</span></div>` : ""}
      <div class="detail-row"><span>Pajak (${(s.taxRate * 100).toFixed(0)}%)</span><span>${fmt(s.tax)}</span></div>
      <div class="detail-row"><span>Ongkir (${s.shippingMethod})</span><span>${s.freeShipping ? "GRATIS 🎉" : fmt(s.shipping)}</span></div>
      <div class="detail-row grand"><span>Grand Total</span><span>${fmt(s.grandTotal)}</span></div>
    `;
    document.getElementById("success-modal").classList.add("active");

    // Reset cart
    cart = [];
    document.getElementById("checkout-form").reset();
    document.getElementById("coupon-status").textContent = "";
    updateCartBadge();
    renderCheckoutPage();
  });

  function showFieldError(id, message) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = message;
      const input = el.previousElementSibling;
      if (input && input.classList) input.classList.add("error");
    }
  }

  function clearErrors() {
    document.querySelectorAll(".error-msg").forEach((el) => (el.textContent = ""));
    document.querySelectorAll(".input-field.error").forEach((el) => el.classList.remove("error"));
  }

  // Success modal close
  document.getElementById("btn-new-order").addEventListener("click", () => {
    document.getElementById("success-modal").classList.remove("active");
    navigateTo("produk");
  });

  // ===================== HISTORY =====================
  function renderHistory() {
    const container = document.getElementById("order-history-list");
    if (orderHistory.length === 0) {
      container.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><p>Belum ada riwayat pesanan</p></div>`;
      return;
    }

    container.innerHTML = orderHistory
      .map(
        (order) => `
      <div class="order-card">
        <div class="order-card-header">
          <div>
            <div class="order-card-id">${order.orderId}</div>
            <div class="order-card-date">${order.date}</div>
          </div>
          <div class="order-card-total">${fmt(order.grandTotal)}</div>
        </div>
        <div class="order-card-items">${order.items.map((i) => `${i.product} ×${i.quantity}`).join(" · ")}</div>
      </div>
    `
      )
      .join("");
  }

  document.getElementById("btn-clear-history").addEventListener("click", () => {
    if (orderHistory.length === 0) {
      showToast("Tidak ada riwayat untuk dihapus", "info");
      return;
    }
    orderHistory = [];
    renderHistory();
    showToast("Riwayat pesanan dihapus", "success");
  });

  // ===================== INFO PAGE =====================
  function renderInfoPage() {
    // Coupons
    const grid = document.getElementById("coupon-info-grid");
    grid.innerHTML = Object.entries(C.COUPON_CODES)
      .map(
        ([code, c]) => `
      <div class="coupon-card ${c.active ? "" : "inactive"}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div class="coupon-code">${code}</div>
          <span class="coupon-badge ${c.active ? "active" : "expired"}">${c.active ? "✓ Aktif" : "✕ Expired"}</span>
        </div>
        <div class="coupon-desc">${c.type === "percentage" ? `Diskon ${c.value}%` : `Potongan ${fmt(c.value)}`}</div>
        <div class="coupon-detail">
          Min. Pembelian: ${fmt(c.minPurchase)}<br>
          Maks. Diskon: ${fmt(c.maxDiscount)}
        </div>
      </div>
    `
      )
      .join("");

    // Shipping info
    const shippingDiv = document.getElementById("shipping-info");
    const regions = Object.entries(C.SHIPPING_ZONES);
    shippingDiv.innerHTML = `
      <table class="info-table">
        <thead>
          <tr>
            <th>Region</th>
            <th>Zona</th>
            <th>Regular</th>
            <th>Express</th>
            <th>Same Day</th>
            <th>Pajak</th>
          </tr>
        </thead>
        <tbody>
          ${regions
            .map(([region, zone]) => {
              const rates = C.SHIPPING_RATES[zone];
              const tax = C.TAX_RATES[region];
              return `
              <tr>
                <td style="text-transform:capitalize;color:var(--text-primary);font-weight:500;">${region}</td>
                <td>${zone}</td>
                <td>${rates ? fmt(rates.regular) : "-"}</td>
                <td>${rates ? fmt(rates.express) : "-"}</td>
                <td>${rates && rates.sameday ? fmt(rates.sameday) : "—"}</td>
                <td>${tax ? (tax * 100).toFixed(0) + "%" : "-"}</td>
              </tr>
            `;
            })
            .join("")}
        </tbody>
      </table>
      <p style="margin-top:12px;font-size:12px;color:var(--text-muted);">
        🚚 Gratis ongkir untuk pembelian di atas ${fmt(C.FREE_SHIPPING_THRESHOLD)}<br>
        📦 Bundle discount ${C.BUNDLE_DISCOUNT_PERCENT}% untuk pembelian ${C.BUNDLE_ITEM_THRESHOLD}+ item berbeda
      </p>
    `;
  }

  // ===================== INIT =====================
  renderDashboard();
})();
