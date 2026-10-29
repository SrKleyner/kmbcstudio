import { describe, expect, it } from 'vitest';
import { buildWhatsAppUrl } from './whatsapp';

describe('buildWhatsAppUrl', () => {
  it('builds a wa.me link with an encoded message', () => {
    expect(buildWhatsAppUrl('56911112222', 'Hola, quiero una cita')).toBe(
      'https://wa.me/56911112222?text=Hola%2C%20quiero%20una%20cita',
    );
  });

  it('strips non-digit characters from the number', () => {
    expect(buildWhatsAppUrl('+56 9 1111-2222', 'Hola')).toBe(
      'https://wa.me/56911112222?text=Hola',
    );
  });

  it('encodes accents, newlines and symbols', () => {
    const url = buildWhatsAppUrl('56911112222', 'Pedido:\n1 x Torta & café');
    expect(url).toContain('text=Pedido%3A%0A1%20x%20Torta%20%26%20caf%C3%A9');
  });

  it('omits the text param when the message is empty', () => {
    expect(buildWhatsAppUrl('56911112222', '')).toBe('https://wa.me/56911112222');
  });
});
