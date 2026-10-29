export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface CartItem extends Product {
  qty: number;
}

export type Cart = readonly CartItem[];

export interface OrderDetails {
  name: string;
  mode: 'delivery' | 'pickup';
  address?: string;
  notes?: string;
}

/** Formats an integer amount as `$12.345` (dot thousands separator). */
export function formatPrice(amount: number): string {
  return `$${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

export function addItem(cart: Cart, product: Product): CartItem[] {
  const exists = cart.some((i) => i.id === product.id);
  if (!exists) return [...cart, { ...product, qty: 1 }];
  return cart.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
}

/** Removes one unit; the line disappears when it reaches zero. */
export function decrementItem(cart: Cart, id: string): CartItem[] {
  return cart
    .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
    .filter((i) => i.qty > 0);
}

export function removeItem(cart: Cart, id: string): CartItem[] {
  return cart.filter((i) => i.id !== id);
}

export function cartTotal(cart: Cart): number {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export function cartCount(cart: Cart): number {
  return cart.reduce((sum, i) => sum + i.qty, 0);
}

export function buildOrderMessage(cart: Cart, details: OrderDetails): string {
  const lines = cart.map((i) => `${i.qty} x ${i.name} - ${formatPrice(i.price * i.qty)}`);
  const delivery = details.mode === 'delivery' ? 'Despacho a domicilio' : 'Retiro en tienda';
  return [
    'Hola Masa Madre Pastelería, quiero hacer este pedido:',
    '',
    ...lines,
    '',
    `Total: ${formatPrice(cartTotal(cart))}`,
    '',
    `Nombre: ${details.name}`,
    `Entrega: ${delivery}`,
    ...(details.mode === 'delivery' && details.address ? [`Dirección: ${details.address}`] : []),
    ...(details.notes ? [`Notas: ${details.notes}`] : []),
  ].join('\n');
}
