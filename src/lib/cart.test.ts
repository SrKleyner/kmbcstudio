import { describe, expect, it } from 'vitest';
import {
  addItem,
  buildOrderMessage,
  cartCount,
  cartTotal,
  decrementItem,
  formatPrice,
  removeItem,
  type Product,
} from './cart';

const bread: Product = { id: 'pan', name: 'Pan de masa madre', price: 4500 };
const tart: Product = { id: 'tarta', name: 'Tarta de limón', price: 12990 };

describe('formatPrice', () => {
  it('formats with thousands separator and currency symbol', () => {
    expect(formatPrice(4500)).toBe('$4.500');
    expect(formatPrice(1234567)).toBe('$1.234.567');
    expect(formatPrice(900)).toBe('$900');
    expect(formatPrice(0)).toBe('$0');
  });
});

describe('cart operations', () => {
  it('adds a new product with quantity 1', () => {
    expect(addItem([], bread)).toEqual([{ ...bread, qty: 1 }]);
  });

  it('increments quantity when the product already exists', () => {
    const cart = addItem(addItem([], bread), bread);
    expect(cart).toEqual([{ ...bread, qty: 2 }]);
  });

  it('does not mutate the original cart', () => {
    const original = addItem([], bread);
    addItem(original, bread);
    expect(original[0].qty).toBe(1);
  });

  it('decrements and removes the line when it reaches zero', () => {
    const cart = addItem(addItem([], bread), bread);
    expect(decrementItem(cart, 'pan')[0].qty).toBe(1);
    expect(decrementItem(decrementItem(cart, 'pan'), 'pan')).toEqual([]);
  });

  it('removes a line regardless of quantity', () => {
    const cart = addItem(addItem(addItem([], bread), bread), tart);
    expect(removeItem(cart, 'pan')).toEqual([{ ...tart, qty: 1 }]);
  });

  it('computes total and count', () => {
    const cart = addItem(addItem(addItem([], bread), bread), tart);
    expect(cartTotal(cart)).toBe(4500 * 2 + 12990);
    expect(cartCount(cart)).toBe(3);
    expect(cartTotal([])).toBe(0);
  });
});

describe('buildOrderMessage', () => {
  const cart = addItem(addItem(addItem([], bread), bread), tart);

  it('lists line items with formatted prices and the total', () => {
    const msg = buildOrderMessage(cart, { name: 'Ana', mode: 'pickup' });
    expect(msg).toContain('Hola Masa Madre Pastelería');
    expect(msg).toContain('2 x Pan de masa madre - $9.000');
    expect(msg).toContain('1 x Tarta de limón - $12.990');
    expect(msg).toContain('Total: $21.990');
    expect(msg).toContain('Nombre: Ana');
    expect(msg).toContain('Retiro en tienda');
  });

  it('includes the address for delivery orders', () => {
    const msg = buildOrderMessage(cart, {
      name: 'Ana',
      mode: 'delivery',
      address: 'Calle 123',
      notes: 'Sin nueces',
    });
    expect(msg).toContain('Despacho a domicilio');
    expect(msg).toContain('Dirección: Calle 123');
    expect(msg).toContain('Notas: Sin nueces');
  });

  it('omits address and notes when not provided', () => {
    const msg = buildOrderMessage(cart, { name: 'Ana', mode: 'pickup' });
    expect(msg).not.toContain('Dirección');
    expect(msg).not.toContain('Notas');
  });
});
