/**
 * Single place to customise the site.
 * Replace the placeholders below with your real data.
 */

/** International format, digits only (country code + number). */
export const WHATSAPP_NUMBER = '56900000000';

/** Google Apps Script web app URL that receives leads (see README). Empty = WhatsApp fallback. */
export const LEAD_ENDPOINT = '';

export const DEVELOPER = {
  name: 'Tu Nombre',
  role: 'Desarrollador web freelance',
  tagline: 'Landings que convierten visitas en clientes',
  site: 'https://tu-dominio.com',
};

export const SERVICES = [
  {
    title: 'Landing pages',
    description:
      'Páginas rápidas, bonitas y pensadas para vender: diseño a medida, adaptadas a celular y listas para recibir clientes.',
    from: 150,
    icon: 'rocket',
  },
  {
    title: 'Automatización por WhatsApp',
    description:
      'Reservas, pedidos y captación de clientes que llegan directo a tu WhatsApp con el mensaje ya armado, sin perder ninguna venta.',
    from: 120,
    icon: 'chat',
  },
  {
    title: 'Mantenimiento',
    description:
      'Cambios de precios, fotos y textos, respaldos y soporte mensual para que tu web siempre esté al día.',
    from: 25,
    icon: 'wrench',
  },
] as const;

export const DEMOS = [
  {
    slug: 'dental',
    name: 'Sonríe Clínica Dental',
    niche: 'Clínicas y consultorios',
    description: 'Reservas por WhatsApp, comparador antes/después y tratamientos con precios claros.',
    image:
      'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=900&q=75',
    alt: 'Sonrisa luminosa en una consulta dental moderna',
  },
  {
    slug: 'pasteleria',
    name: 'Masa Madre Pastelería',
    niche: 'Pastelerías y comida',
    description: 'Menú con carrito y pedido completo enviado por WhatsApp, más tortas personalizadas.',
    image:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=75',
    alt: 'Pan artesanal de masa madre recién horneado',
  },
  {
    slug: 'training',
    name: 'Forja Training',
    niche: 'Entrenadores y gimnasios',
    description: 'Quiz que recomienda un plan y captura el contacto del cliente automáticamente.',
    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=75',
    alt: 'Persona entrenando con pesas en un gimnasio',
  },
] as const;
