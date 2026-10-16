// Datos globales del sitio (contacto, redes y menús), copiados del header/footer de WordPress.

export const CONTACT = {
  email: "info@inprotar.cl",
  phone: "+56 9 9089 4601",
  phoneRaw: "56990894601",
  address: "CHAMISERO, COLINA.",
  whatsapp: "https://wa.me/56990894601",
  whatsappInfo: "https://wa.me/56990894601?text=Necesito%20m%C3%A1s%20informaci%C3%B3n",
  whatsappApi: "https://api.whatsapp.com/send?phone=+56990894601",
  whatsappVisit: "https://wa.me/56990894601?text=Quiero%20agendar%20una%20visita",
};

export const SOCIAL = {
  facebook: "https://www.facebook.com/profile.php?id=61561388644389",
  linkedin: "https://www.linkedin.com/company/inprotar/",
  // En el sitio original el ícono de YouTube enlaza a WhatsApp
  youtube: "https://wa.me/56990894601",
};

export type NavLink = { label: string; href: string };

/** Submenú "Iluminación Profesional Conectada" (se repite en mega menú, menú móvil y footer). */
export const LIGHTING_LINKS: NavLink[] = [
  { label: "Alumbrado publico LED", href: "/alumbrado-publico-led/" },
  { label: "Alumbrado público solar", href: "/alumbrado-publico-solar/" },
  { label: "Campanas LED industriales", href: "/campanas-led-industriales/" },
  { label: "Proyectores de area LED", href: "/proyectores-de-area-led/" },
  { label: "Iluminacion Antiexplosiva LED", href: "/iluminacion-antiexplosiva/" },
  { label: "Iluminación Interior LED", href: "/iluminacion-interior-led/" },
  { label: "Iluminación para Horticultura", href: "/iluminacion-para-horticultura/" },
  { label: "Iluminación para Acuicultura", href: "/iluminacion-para-acuicultura/" },
];

export const CATALOG_LINKS: NavLink[] = [
  { label: "Alumbrado público led", href: "/categoria-producto/alumbrado-publico-led/" },
  { label: "Campanas Led industriales", href: "/categoria-producto/campanas-led-industriales/" },
  { label: "Iluminación antiexplosiva led", href: "/categoria-producto/iluminacion-antiexplosiva-led/" },
  { label: "Iluminación exterior", href: "/categoria-producto/iluminacion-exterior/" },
  { label: "Iluminación interior led", href: "/categoria-producto/iluminacion-interior-led/" },
  { label: "Iluminación para acuicultura", href: "/categoria-producto/iluminacion-para-acuicultura/" },
  { label: "Iluminación para desinfección UVC", href: "/categoria-producto/iluminacion-para-desinfeccion-uvc/" },
  { label: "Iluminación para horticultura", href: "/categoria-producto/iluminacion-para-horticultura/" },
  { label: "Iluminación solar led", href: "/categoria-producto/iluminacion-solar-led/" },
  { label: "Proyectores de area led", href: "/categoria-producto/proyectores-de-area-led/" },
];

/** Menú del footer (segunda columna). */
export const FOOTER_MENU = {
  areas: {
    label: "Areas de negocio",
    children: [
      {
        label: "Iluminación Profesional Conectada",
        href: "/iluminacion-profesional-conectada/",
        children: [
          { label: "Alumbrado público solar", href: "/alumbrado-publico-solar/" },
          { label: "¿Que es el Decreto Supremo 1?", href: "/que-es-el-decreto-supremo-1/" },
        ],
      },
      { label: "Suministros y Componentes Eléctricos y Electrónicos", href: "/suministros-y-componentes-electricos-y-electronicos/" },
      { label: "Automatización y Digitalización Integrada", href: "/automatizacion-y-digitalizacion-integrada/" },
    ],
  },
  links: [
    { label: "Quienes somos", href: "/quienes-somos/" },
    { label: "Politicas de privacidad", href: "/politicas-de-privacidad/" },
    { label: "Noticias", href: "/noticias/" },
    { label: "Contacto", href: "/contacto/" },
  ] as NavLink[],
};

export const LOGO_DARK_BG = "/wp-content/uploads/2024/06/LOGO-fondo-oscuro2.png";
