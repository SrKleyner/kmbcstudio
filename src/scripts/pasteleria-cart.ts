import {
  addItem,
  buildOrderMessage,
  cartCount,
  cartTotal,
  decrementItem,
  formatPrice,
  removeItem,
  type Cart,
  type CartItem,
} from '../lib/cart';
import { buildWhatsAppUrl } from '../lib/whatsapp';

const STORAGE_KEY = 'masa-madre-cart-v1';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(cart: Cart): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    /* storage unavailable: the cart simply lives in memory */
  }
}

function $<T extends HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
}

export function initPasteleriaCart(whatsappNumber: string): void {
  let cart: CartItem[] = loadCart();

  const bar = $<HTMLElement>('[data-cart-bar]');
  const barCount = $('[data-cart-count]');
  const barTotal = $('[data-cart-total]');
  const dialog = $<HTMLDialogElement>('[data-cart-dialog]');
  const list = $('[data-cart-list]');
  const empty = $('[data-cart-empty]');
  const form = $<HTMLFormElement>('[data-cart-form]');
  const dialogTotal = $('[data-dialog-total]');
  const addressField = $('[data-address-field]');
  const addressInput = $<HTMLInputElement>('[data-address-input]');
  const live = $('[data-cart-live]');

  function render(): void {
    const count = cartCount(cart);
    const total = formatPrice(cartTotal(cart));
    barCount.textContent = String(count);
    barTotal.textContent = total;
    dialogTotal.textContent = total;
    bar.hidden = count === 0;
    empty.hidden = count > 0;
    form.hidden = count === 0;

    list.replaceChildren(
      ...cart.map((item) => {
        const li = document.createElement('li');
        li.className = 'flex items-center justify-between gap-3 py-3';
        li.innerHTML = `
          <div class="min-w-0">
            <p class="truncate font-semibold"></p>
            <p class="text-sm opacity-70">${formatPrice(item.price)} c/u</p>
          </div>
          <div class="flex items-center gap-2">
            <button type="button" data-dec="${item.id}" class="flex h-9 w-9 items-center justify-center rounded-full border border-cocoa/20 text-lg" aria-label="Quitar una unidad"></button>
            <span class="w-6 text-center font-semibold" aria-label="Cantidad">${item.qty}</span>
            <button type="button" data-inc="${item.id}" class="flex h-9 w-9 items-center justify-center rounded-full border border-cocoa/20 text-lg" aria-label="Agregar una unidad"></button>
            <button type="button" data-del="${item.id}" class="ml-1 text-sm underline opacity-70" aria-label="Eliminar del pedido">Quitar</button>
          </div>`;
        li.querySelector('p')!.textContent = item.name;
        li.querySelector('[data-dec]')!.textContent = '−';
        li.querySelector('[data-inc]')!.textContent = '+';
        return li;
      }),
    );
  }

  function commit(next: CartItem[], announce?: string): void {
    cart = next;
    saveCart(cart);
    render();
    if (announce) live.textContent = announce;
  }

  document.querySelectorAll<HTMLButtonElement>('[data-add]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const product = {
        id: btn.dataset.id!,
        name: btn.dataset.name!,
        price: Number(btn.dataset.price),
      };
      commit(addItem(cart, product), `${product.name} agregado al pedido`);
      btn.animate?.(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }],
        { duration: 250 },
      );
    });
  });

  list.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>('button');
    if (!target) return;
    const { inc, dec, del } = target.dataset;
    if (inc) {
      const item = cart.find((i) => i.id === inc);
      if (item) commit(addItem(cart, item));
    } else if (dec) commit(decrementItem(cart, dec));
    else if (del) commit(removeItem(cart, del));
  });

  document.querySelectorAll('[data-open-cart]').forEach((el) =>
    el.addEventListener('click', () => dialog.showModal()),
  );
  document.querySelectorAll('[data-close-cart]').forEach((el) =>
    el.addEventListener('click', () => dialog.close()),
  );
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  form.querySelectorAll<HTMLInputElement>('input[name="mode"]').forEach((radio) =>
    radio.addEventListener('change', () => {
      const delivery = new FormData(form).get('mode') === 'delivery';
      addressField.hidden = !delivery;
      addressInput.required = delivery;
    }),
  );

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (cart.length === 0) return;
    const data = new FormData(form);
    const message = buildOrderMessage(cart, {
      name: String(data.get('name') ?? '').trim(),
      mode: data.get('mode') === 'delivery' ? 'delivery' : 'pickup',
      address: String(data.get('address') ?? '').trim(),
      notes: String(data.get('notes') ?? '').trim(),
    });
    window.open(buildWhatsAppUrl(whatsappNumber, message), '_blank', 'noopener');
  });

  // Category filter
  const tabs = document.querySelectorAll<HTMLButtonElement>('[data-tab]');
  const cards = document.querySelectorAll<HTMLElement>('[data-category]');
  tabs.forEach((tab) =>
    tab.addEventListener('click', () => {
      const wanted = tab.dataset.tab;
      tabs.forEach((t) => t.setAttribute('aria-pressed', String(t === tab)));
      cards.forEach((c) => {
        c.hidden = wanted !== 'all' && c.dataset.category !== wanted;
      });
    }),
  );

  render();
}
