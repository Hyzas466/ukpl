// ============================================================
// app.js - TechMart UI Controller
// Handles DOM manipulation, events, cart state, and rendering
// ============================================================

(function () {
  "use strict";

  // ===================== STATE =====================
  let cart = [];
  let appliedCoupon = null;

  // ===================== DOM REFS =====================
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const productsGrid = $("#products-grid");
  const cartSidebar = $("#cart-sidebar");
  const cartItems = $("#cart-items");
  const cartBadge = $("#cart-badge");
  const cartSubtotal = $("#cart-subtotal");
  const cartTotalItems = $("#cart-total-items");
  const btnCheckout = $("#btn-checkout");
  const overlay = $("#overlay");
  const checkoutModal = $("#checkout-modal");
  const successModal = $("#success-modal");
  const toastContainer = $("#toast-container");

  // ===================== FORMAT HELPERS =====================
  function formatCurrency(amount) {
    return "Rp " + amount.toLocaleString("id-ID");
  }

  // ===================== TOAST NOTIFICATION =====================
  function showToast(message, type = "info") {
    const icons = { success: "✅", error: "❌", info: "ℹ️" };
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // ===================== RENDER PRODUCTS =====================
  function renderProducts() {
    const { PRODUCTS, PRODUCT_EMOJIS, PRODUCT_GRADIENTS } = Checkout;
    productsGrid.innerHTML = "";

    PRODUCTS.forEach((product, index) => {
      const stockClass = product.stock === 0 ? "out" : product.stock <= 5 ? "low" : "";
      const stockText = product.stock === 0 ? "Habis" : `Stok: ${product.stock}`;
      const disabled = product.stock === 0 ? "disabled" : "";

      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <div class="product-image" style="background: ${PRODUCT_GRADIENTS[index]}">
          ${PRODUCT_EMOJIS[index]}
        </div>
        <div class="product-info">
          <div class="product-name">${product.name}</div>
          <div class="product-category">${product.category}</div>
          <div class="product-meta">
            <span class="product-price">${formatCurrency(product.price)}</span>
            <span class="product-stock ${stockClass}">${stockText}</span>
          </div>
          <button class="btn-add-cart" id="btn-add-${product.id}" data-id="${product.id}" ${disabled}>
            ${product.stock === 0 ? "Stok Habis" : "Tambah ke Keranjang"}
          </button>
        </div>
      `;
      productsGrid.appendChild(card);
    });

    // Attach events
    $$(".btn-add-cart").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = parseInt(this.dataset.id);
        addToCart(id);
      });
    });
  }

  // ===================== CART OPERATIONS =====================
  function addToCart(productId) {
    const product = Checkout.PRODUCTS.find((p) => p.id === productId);
    if (!product || product.stock === 0) return;

    const existing = cart.find((item) => item.productId === productId);
    if (existing) {
      if (existing.quantity >= Checkout.MAX_QUANTITY_PER_ITEM) {
        showToast(`Maksimal ${Checkout.MAX_QUANTITY_PER_ITEM} per item`, "error");
        return;
      }
      if (existing.quantity >= product.stock) {
        showToast(`Stok ${product.name} tidak cukup`, "error");
        return;
      }
      existing.quantity++;
    } else {
      cart.push({ productId: productId, quantity: 1 });
    }

    // Button feedback
    const btn = $(`#btn-add-${productId}`);
    if (btn) {
      btn.classList.add("added");
      btn.textContent = "✓ Ditambahkan!";
      setTimeout(() => {
        btn.classList.remove("added");
        btn.textContent = "Tambah ke Keranjang";
      }, 800);
    }

    showToast(`${product.name} ditambahkan`, "success");
    updateCart();
  }

  function removeFromCart(productId) {
    cart = cart.filter((item) => item.productId !== productId);
    updateCart();
  }

  function updateQuantity(productId, delta) {
    const item = cart.find((i) => i.productId === productId);
    if (!item) return;

    const product = Checkout.PRODUCTS.find((p) => p.id === productId);
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    if (newQty > Checkout.MAX_QUANTITY_PER_ITEM) {
      showToast(`Maksimal ${Checkout.MAX_QUANTITY_PER_ITEM} per item`, "error");
      return;
    }
    if (product && newQty > product.stock) {
      showToast(`Stok ${product.name} tidak cukup`, "error");
      return;
    }

    item.quantity = newQty;
    updateCart();
  }

  function getCartSubtotal() {
    let subtotal = 0;
    cart.forEach((item) => {
      const product = Checkout.PRODUCTS.find((p) => p.id === item.productId);
      if (product) subtotal += product.price * item.quantity;
    });
    return subtotal;
  }

  function getCartTotalItems() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  // ===================== RENDER CART =====================
  function updateCart() {
    renderCartItems();
    updateCartBadge();
    updateCartFooter();
  }

  function renderCartItems() {
    if (cart.length === 0) {
      cartItems.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">🛒</div>
          <p>Keranjang masih kosong</p>
          <p style="font-size:0.8rem;margin-top:0.5rem;color:var(--text-muted)">Tambahkan produk untuk mulai belanja</p>
        </div>`;
      return;
    }

    cartItems.innerHTML = "";
    cart.forEach((item) => {
      const product = Checkout.PRODUCTS.find((p) => p.id === item.productId);
      if (!product) return;
      const idx = Checkout.PRODUCTS.indexOf(product);
      const gradient = Checkout.PRODUCT_GRADIENTS[idx];
      const emoji = Checkout.PRODUCT_EMOJIS[idx];

      const el = document.createElement("div");
      el.className = "cart-item";
      el.innerHTML = `
        <div class="cart-item-image" style="background:${gradient}">${emoji}</div>
        <div class="cart-item-details">
          <div class="cart-item-name">${product.name}</div>
          <div class="cart-item-price">${formatCurrency(product.price * item.quantity)}</div>
          <div class="cart-item-controls">
            <button class="qty-btn" data-id="${product.id}" data-delta="-1">−</button>
            <span class="cart-item-qty">${item.quantity}</span>
            <button class="qty-btn" data-id="${product.id}" data-delta="1">+</button>
          </div>
        </div>
        <button class="btn-remove-item" data-id="${product.id}" title="Hapus">🗑️</button>
      `;
      cartItems.appendChild(el);
    });

    // Attach events
    cartItems.querySelectorAll(".qty-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        updateQuantity(parseInt(this.dataset.id), parseInt(this.dataset.delta));
      });
    });
    cartItems.querySelectorAll(".btn-remove-item").forEach((btn) => {
      btn.addEventListener("click", function () {
        removeFromCart(parseInt(this.dataset.id));
        showToast("Item dihapus dari keranjang", "info");
      });
    });
  }

  function updateCartBadge() {
    const total = getCartTotalItems();
    cartBadge.textContent = total;
    cartBadge.classList.remove("bounce");
    void cartBadge.offsetWidth; // trigger reflow
    cartBadge.classList.add("bounce");
  }

  function updateCartFooter() {
    const subtotal = getCartSubtotal();
    const totalItems = getCartTotalItems();
    cartSubtotal.textContent = formatCurrency(subtotal);
    cartTotalItems.textContent = `${totalItems} item`;
    btnCheckout.disabled = cart.length === 0;
  }

  // ===================== SIDEBAR TOGGLE =====================
  function openCart() {
    cartSidebar.classList.add("open");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeCart() {
    cartSidebar.classList.remove("open");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  // ===================== CHECKOUT MODAL =====================
  function openCheckout() {
    closeCart();
    setTimeout(() => {
      checkoutModal.classList.add("active");
      document.body.style.overflow = "hidden";
      resetCheckoutForm();
      updateOrderPreview();
    }, 300);
  }

  function closeCheckout() {
    checkoutModal.classList.remove("active");
    document.body.style.overflow = "";
  }

  function resetCheckoutForm() {
    $("#checkout-form").reset();
    $$(".error-msg").forEach((el) => (el.textContent = ""));
    $$(".form-group input, .form-group select, .form-group textarea").forEach((el) =>
      el.classList.remove("error")
    );
    appliedCoupon = null;
    $("#coupon-status").textContent = "";
    $("#coupon-status").className = "coupon-status";
  }

  // ===================== ORDER PREVIEW =====================
  function updateOrderPreview() {
    const subtotal = getCartSubtotal();
    const region = $("#shipping-region").value;
    const method = $("#shipping-method").value;

    let discount = 0;
    if (appliedCoupon) {
      discount = appliedCoupon.discount;
    }

    // Bundle discount check
    const bundleResult = Checkout.calculateBundleDiscount(cart, subtotal);
    if (bundleResult.applied && bundleResult.discount > discount) {
      discount = bundleResult.discount;
    }

    const afterDiscount = subtotal - discount;

    let tax = 0;
    if (region) {
      const taxResult = Checkout.calculateTax(afterDiscount, region);
      if (taxResult.valid) tax = taxResult.tax;
    }

    let shipping = 0;
    let freeShipping = false;
    if (region && method) {
      let totalWeight = 0;
      cart.forEach((item) => {
        const p = Checkout.PRODUCTS.find((pr) => pr.id === item.productId);
        if (p) totalWeight += p.weight * item.quantity;
      });
      const shipResult = Checkout.calculateShipping(totalWeight, region, method);
      if (shipResult.valid) {
        shipping = shipResult.cost;
        if (afterDiscount >= Checkout.FREE_SHIPPING_THRESHOLD) {
          shipping = 0;
          freeShipping = true;
        }
      }
    }

    const grandTotal = afterDiscount + tax + shipping;

    $("#preview-subtotal").textContent = formatCurrency(subtotal);
    $("#preview-discount").textContent = discount > 0 ? `- ${formatCurrency(discount)}` : "- Rp 0";
    $("#preview-tax").textContent = formatCurrency(tax);

    const shippingEl = $("#preview-shipping");
    if (freeShipping) {
      shippingEl.textContent = "GRATIS";
      shippingEl.className = "free";
    } else {
      shippingEl.textContent = formatCurrency(shipping);
      shippingEl.className = "";
    }

    $("#preview-grand-total").textContent = formatCurrency(grandTotal);
  }

  // ===================== APPLY COUPON =====================
  function handleApplyCoupon() {
    const code = $("#coupon-code").value.trim();
    const statusEl = $("#coupon-status");

    if (!code) {
      statusEl.textContent = "Masukkan kode kupon";
      statusEl.className = "coupon-status error";
      return;
    }

    const subtotal = getCartSubtotal();
    const result = Checkout.applyCoupon(subtotal, code);

    if (result.valid) {
      appliedCoupon = result;
      statusEl.textContent = `✅ Kupon berhasil! Diskon: ${formatCurrency(result.discount)}`;
      statusEl.className = "coupon-status success";
      showToast("Kupon berhasil diterapkan!", "success");
    } else {
      appliedCoupon = null;
      statusEl.textContent = `❌ ${result.error}`;
      statusEl.className = "coupon-status error";
    }

    updateOrderPreview();
  }

  // ===================== FORM VALIDATION UI =====================
  function showFieldError(fieldId, errorId, message) {
    const field = $(`#${fieldId}`);
    const errorEl = $(`#${errorId}`);
    if (field) field.classList.add("error");
    if (errorEl) errorEl.textContent = message;
  }

  function clearFieldError(fieldId, errorId) {
    const field = $(`#${fieldId}`);
    const errorEl = $(`#${errorId}`);
    if (field) field.classList.remove("error");
    if (errorEl) errorEl.textContent = "";
  }

  // ===================== PROCESS CHECKOUT =====================
  function handleCheckoutSubmit(e) {
    e.preventDefault();

    // Clear all errors
    $$(".error-msg").forEach((el) => (el.textContent = ""));
    $$(".form-group input, .form-group select, .form-group textarea").forEach((el) =>
      el.classList.remove("error")
    );

    const buyerData = {
      name: $("#buyer-name").value,
      email: $("#buyer-email").value,
      phone: $("#buyer-phone").value,
      address: $("#buyer-address").value,
    };

    const region = $("#shipping-region").value;
    const method = $("#shipping-method").value;
    const couponCode = appliedCoupon ? $("#coupon-code").value.trim() : "";

    // Validate buyer locally for better UX
    const buyerResult = Checkout.validateBuyerData(buyerData);
    if (!buyerResult.valid) {
      const fieldMap = {
        name: ["buyer-name", "error-name"],
        email: ["buyer-email", "error-email"],
        phone: ["buyer-phone", "error-phone"],
        address: ["buyer-address", "error-address"],
      };
      for (const [key, [fieldId, errorId]] of Object.entries(fieldMap)) {
        if (buyerResult.errors[key]) {
          showFieldError(fieldId, errorId, buyerResult.errors[key]);
        }
      }
      showToast("Mohon lengkapi data pembeli", "error");
      return;
    }

    if (!region) {
      showFieldError("shipping-region", "error-region", "Pilih region pengiriman");
      showToast("Pilih region pengiriman", "error");
      return;
    }

    if (!method) {
      showFieldError("shipping-method", "error-method", "Pilih metode pengiriman");
      showToast("Pilih metode pengiriman", "error");
      return;
    }

    // Process via checkout module
    const result = Checkout.processCheckout(cart, buyerData, couponCode, region, method);

    if (result.success) {
      showSuccessModal(result);
    } else {
      showToast(result.error, "error");
    }
  }

  // ===================== SUCCESS MODAL =====================
  function showSuccessModal(result) {
    closeCheckout();

    setTimeout(() => {
      const s = result.summary;
      $("#success-order-id").textContent = `Order ID: ${result.orderId}`;

      let detailsHTML = "";
      s.items.forEach((item) => {
        detailsHTML += `<div class="detail-row">
          <span>${item.product} (x${item.quantity})</span>
          <span>${formatCurrency(item.subtotal)}</span>
        </div>`;
      });

      detailsHTML += `<div class="detail-row" style="border-top:1px solid var(--border-glass);margin-top:0.5rem;padding-top:0.5rem;">
        <span>Subtotal</span><span>${formatCurrency(s.subtotal)}</span>
      </div>`;

      if (s.discount > 0) {
        detailsHTML += `<div class="detail-row" style="color:var(--success)">
          <span>Diskon (${s.discountSource})</span><span>- ${formatCurrency(s.discount)}</span>
        </div>`;
      }

      detailsHTML += `<div class="detail-row">
        <span>Pajak (${(s.taxRate * 100).toFixed(0)}%)</span><span>${formatCurrency(s.tax)}</span>
      </div>`;

      detailsHTML += `<div class="detail-row">
        <span>Ongkir (${s.shippingMethod})</span>
        <span>${s.freeShipping ? '<span style="color:var(--success);font-weight:600">GRATIS</span>' : formatCurrency(s.shipping)}</span>
      </div>`;

      detailsHTML += `<div class="detail-row grand">
        <span>Grand Total</span><span>${formatCurrency(s.grandTotal)}</span>
      </div>`;

      $("#success-details").innerHTML = detailsHTML;

      successModal.classList.add("active");
      document.body.style.overflow = "hidden";

      showToast("Pesanan berhasil diproses! 🎉", "success");
    }, 400);
  }

  function closeSuccess() {
    successModal.classList.remove("active");
    document.body.style.overflow = "";
    cart = [];
    appliedCoupon = null;
    updateCart();
  }

  // ===================== EVENT LISTENERS =====================
  function init() {
    renderProducts();
    updateCart();

    // Cart toggle
    $("#cart-toggle").addEventListener("click", openCart);
    $("#close-cart").addEventListener("click", closeCart);
    overlay.addEventListener("click", closeCart);

    // Checkout
    btnCheckout.addEventListener("click", openCheckout);
    $("#close-checkout").addEventListener("click", closeCheckout);

    // Coupon
    $("#btn-apply-coupon").addEventListener("click", handleApplyCoupon);
    $("#coupon-code").addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleApplyCoupon();
      }
    });

    // Live preview updates
    $("#shipping-region").addEventListener("change", updateOrderPreview);
    $("#shipping-method").addEventListener("change", updateOrderPreview);

    // Checkout form submit
    $("#checkout-form").addEventListener("submit", handleCheckoutSubmit);

    // Clear field errors on input
    const fieldPairs = [
      ["buyer-name", "error-name"],
      ["buyer-email", "error-email"],
      ["buyer-phone", "error-phone"],
      ["buyer-address", "error-address"],
      ["shipping-region", "error-region"],
      ["shipping-method", "error-method"],
    ];
    fieldPairs.forEach(([fieldId, errorId]) => {
      const el = $(`#${fieldId}`);
      if (el) {
        el.addEventListener("input", () => clearFieldError(fieldId, errorId));
        el.addEventListener("change", () => clearFieldError(fieldId, errorId));
      }
    });

    // Success modal
    $("#btn-new-order").addEventListener("click", closeSuccess);

    // Close modals on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (successModal.classList.contains("active")) closeSuccess();
        else if (checkoutModal.classList.contains("active")) closeCheckout();
        else if (cartSidebar.classList.contains("open")) closeCart();
      }
    });
  }

  // ===================== START =====================
  document.addEventListener("DOMContentLoaded", init);
})();
