/**
 * Single place to customise the site.
 * Replace the placeholders below with your real data.
 */

/** International format, digits only (country code + number). */
export const WHATSAPP_NUMBER = '56900000000';

/** Google Apps Script web app URL that receives leads (see README). Empty = WhatsApp fallback. */
export const LEAD_ENDPOINT = '';

export const DEVELOPER = {
  name: 'Kleyner Bonalde',
  role: 'Desarrollador web freelance',
  tagline: 'Landings que convierten visitas en clientes',
  site: 'https://kmbcstudio.com',
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
    /** Page background while this demo is active on the home slider. */
    bg: '#c8efe6',
    name: 'Sonríe Clínica Dental',
    niche: 'Clínicas y consultorios',
    description: 'Reservas por WhatsApp, comparador antes/después y tratamientos con precios claros.',
    /** Id of a local photo in src/assets/photos. */
    image: '1606811841689-23dfddce3e95',
    alt: 'Sonrisa luminosa en una consulta dental moderna',
  },
  {
    slug: 'pasteleria',
    /** Page background while this demo is active on the home slider. */
    bg: '#3a2217',
    name: 'Masa Madre Pastelería',
    niche: 'Pastelerías y comida',
    description: 'Menú con carrito y pedido completo enviado por WhatsApp, más tortas personalizadas.',
    /** Id of a local photo in src/assets/photos. */
    image: '1509440159596-0249088772ff',
    alt: 'Pan artesanal de masa madre recién horneado',
  },
  {
    slug: 'training',
    /** Page background while this demo is active on the home slider. */
    bg: '#ff4a1c',
    name: 'Forja Training',
    niche: 'Entrenadores y gimnasios',
    description: 'Quiz que recomienda un plan y captura el contacto del cliente automáticamente.',
    /** Id of a local photo in src/assets/photos. */
    image: '1534438327276-14e5300c3a48',
    alt: 'Persona entrenando con pesas en un gimnasio',
  },
] as const;
