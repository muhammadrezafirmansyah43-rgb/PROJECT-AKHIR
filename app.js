/* app.js
   Single JS shared for all pages.
   - products[] data
   - render products to DOM
   - cart operations stored in localStorage ('mini_cart')
*/

const PRODUCTS = [
 { id: 1, name: "Air Mineral 600ml", price: 5000, img: "img/mineral.jpg", stock: 30 },
  { id: 2, name: "Teh Botol", price: 4500, img: "img/teh.jpg", stock: 25 },
  { id: 3, name: "Kopi Kaleng", price: 8500, img: "img/kopi.jpg", stock: 22 },
  { id: 4, name: "Mie Instan Goreng", price: 3500, img: "img/mie goreng.jpg", stock: 50 },
  { id: 5, name: "Mie Instan Kuah", price: 3500, img: "img/mie kuah.jpg", stock: 48 },
  { id: 6, name: "Keripik Kentang", price: 12000, img: "img/kentang.jpg", stock: 20 },
  { id: 7, name: "Coklat Batang", price: 10000, img: "img/coklat batang.jpg", stock: 18 },
  { id: 8, name: "Wafer Coklat", price: 7000, img: "img/wafer coklat.jpg", stock: 35 },
  { id: 9, name: "Sabun Cuci Piring", price: 9000, img: "img/cuci piring.jpg", stock: 15 },
  { id: 10, name: "Biskuit Kelapa", price: 8000, img: "img/biskuit.jpg", stock: 40 },

  { id: 11, name: "Sabun Mandi", price: 6000, img: "img/sabun mandi.jpg", stock: 25 },
  { id: 12, name: "Shampoo Sachet", price: 2000, img: "img/shampo.jpg", stock: 60 },
  { id: 13, name: "Pasta Gigi 75g", price: 15000, img: "img/odol.jpg", stock: 17 },
  { id: 14, name: "Tissue 50 lembar", price: 6000, img: "img/tissue.jpg", stock: 25 },
  { id: 15, name: "Detergen Bubuk 300g", price: 14000, img: "img/sabun bubuk.jpg", stock: 20 },


];

const CART_KEY = 'mini_cart_v1';

// util
function formatRupiah(n){ return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,"."); }
function loadCart(){ return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartBadge(); }

// add to cart
function addToCart(productId, qty = 1){
  const cart = loadCart();
  const found = cart.find(i => i.id === productId);
  if(found){ found.qty += qty; }
  else cart.push({ id: productId, qty: qty });
  saveCart(cart);
  toast('Ditambahkan ke keranjang');
}

// remove item
function removeFromCart(productId){
  let cart = loadCart();
  cart = cart.filter(i => i.id !== productId);
  saveCart(cart);
  renderCartTable();
}

// update quantity
function updateQty(productId, qty){
  const cart = loadCart();
  const item = cart.find(i => i.id === productId);
  if(!item) return;
  item.qty = Math.max(0, qty);
  if(item.qty === 0) removeFromCart(productId);
  else saveCart(cart);
  renderCartTable();
}

// cart badge
function updateCartBadge(){
  const el = document.getElementById('cart-count');
  if(!el) return;
  const cart = loadCart();
  const total = cart.reduce((s,i) => s + i.qty, 0);
  el.innerText = total;
}

// tiny toast
function toast(msg){
  if(window._mini_toast) clearTimeout(window._mini_toast);
  let el = document.getElementById('mini-toast');
  if(!el){
    el = document.createElement('div');
    el.id = 'mini-toast';
    Object.assign(el.style,{position:'fixed',right:'20px',bottom:'20px',background:'#111',color:'#fff',padding:'10px 14px',borderRadius:'8px',zIndex:9999,opacity:0,transition:'all .25s'});
    document.body.appendChild(el);
  }
  el.innerText = msg;
  el.style.opacity = 1;
  window._mini_toast = setTimeout(()=> el.style.opacity = 0, 1500);
}

/* -------- render products on products.html -------- */
function renderProducts(filter = '', sort='default'){
  const list = document.getElementById('product-list');
  if(!list) return;
  let items = PRODUCTS.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
  if(sort === 'price-asc') items.sort((a,b) => a.price - b.price);
  if(sort === 'price-desc') items.sort((a,b) => b.price - a.price);

  list.innerHTML = items.map(p => `
    <article class="card product">
      <img src="${p.img}" alt="${p.name}" onerror="this.style.opacity=.4;this.style.filter='grayscale(80%)'"/>
      <h4>${p.name}</h4>
      <div class="price">Rp ${formatRupiah(p.price)}</div>
      <div class="qty-row">
        <button onclick="addToCart(${p.id},1)">+ Keranjang</button>
        <button onclick="addToCart(${p.id},5)">+5</button>
      </div>
    </article>
  `).join('');
  updateCartBadge();
}

/* -------- render cart (cart.html) -------- */
function renderCartTable(){
  const table = document.querySelector('#cart-table');
  const tbody = document.querySelector('#cart-table tbody');
  const emptyEl = document.getElementById('cart-empty');
  const summaryEl = document.getElementById('cart-summary');

  if(!tbody) return; // not on page
  const cart = loadCart();
  if(cart.length === 0){
    table.classList.add('hidden');
    summaryEl.classList.add('hidden');
    emptyEl.classList.remove('hidden');
    return;
  }
  emptyEl.classList.add('hidden');
  table.classList.remove('hidden');
  summaryEl.classList.remove('hidden');

  let subtotal = 0, totalItems = 0;
  tbody.innerHTML = cart.map(item => {
    const p = PRODUCTS.find(x => x.id === item.id) || {};
    const sub = p.price * item.qty;
    subtotal += sub;
    totalItems += item.qty;
    return `<tr>
      <td>${p.name || '(produk hilang)'}</td>
      <td>Rp ${formatRupiah(p.price || 0)}</td>
      <td>
        <input type="number" min="1" value="${item.qty}" style="width:72px;padding:6px;border-radius:6px;border:1px solid #eee"
          onchange="updateQty('${item.id}', parseInt(this.value) || 0)" />
      </td>
      <td>Rp ${formatRupiah(sub)}</td>
      <td><button class="btn outline" onclick="removeFromCart('${item.id}')">Hapus</button></td>
    </tr>`;
  }).join('');

  document.getElementById('subtotal').innerText = formatRupiah(subtotal);
  document.getElementById('total-items').innerText = totalItems;
  saveCart(cart);
  updateCartBadge();
}

/* -------- checkout page logic -------- */
function renderCheckout(){
  const cart = loadCart();
  const form = document.getElementById('checkout-form');
  const empty = document.getElementById('checkout-empty');
  if(!form) return;
  if(cart.length === 0){
    form.classList.add('hidden');
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  form.classList.remove('hidden');

  const total = cart.reduce((s,i) => {
    const p = PRODUCTS.find(x=>x.id===i.id) || {price:0};
    return s + p.price * i.qty;
  },0);
  document.getElementById('total-pay').innerText = formatRupiah(total);

  // submit
  form.onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();
    const promo = document.getElementById('promo').value.trim();
    if(!name || !email || !address){
      document.getElementById('checkout-msg').innerText = 'Lengkapi semua data pengiriman';
      return;
    }
    // promo demo
    let final = total;
    if(promo.toUpperCase() === 'PELAJAR10'){ final = Math.round(final * 0.9); }
    // "Bayar" demo - clear cart
    localStorage.removeItem(CART_KEY);
    saveCart([]);
    document.getElementById('checkout-msg').innerText = `Terima kasih ${name}! Pembayaran disimulasikan. Total dibayar: Rp ${formatRupiah(final)}.`;
    updateCartBadge();
  };

  // clear cart button
  document.getElementById('clear-cart').onclick = () => {
    if(confirm('Batalkan dan kosongkan keranjang?')){ localStorage.removeItem(CART_KEY); saveCart([]); renderCheckout(); }
  };
}

/* -------- page initialization -------- */
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();

  // products page
  const search = document.getElementById('search');
  const sort = document.getElementById('sort');
  if(document.getElementById('product-list')){
    renderProducts('');
    if(search) search.oninput = (e) => renderProducts(e.target.value, sort.value);
    if(sort) sort.onchange = (e) => renderProducts(search ? search.value : '', e.target.value);
  }

  // cart page
  if(document.querySelector('#cart-table tbody')) renderCartTable();

  // checkout page
  if(document.getElementById('checkout-form')) renderCheckout();
});