export const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "Why Us", href: "#why-us" },
  { label: "Areas", href: "#areas" },
  { label: "Contact", href: "#contact" },
] as const;

export const SERVICES = [
  {
    id: "residential",
    title: "Residential Cleaning",
    description:
      "Professional cleaning services for homes, apartments, villas, cafés, and shops.",
    icon: "home",
    image: "/images/services/residential.jpg",
    features: [
      "Deep Cleaning",
      "Move In / Move Out",
      "Regular Cleaning",
    ],
  },
  {
    id: "mall",
    title: "Mall Services",
    description:
      "Professional cleaning and maintenance services for malls, shopping centers, and large commercial spaces.",
    icon: "store",
    image: "/images/services/retail.jpg",
    features: [
      "Floor Care",
      "Glass Cleaning",
      "Daily Maintenance",
    ],
  },
  {
    id: "corporate",
    title: "Corporate Cleaning",
    description:
      "Reliable cleaning services for companies, banks, offices, and commercial buildings.",
    icon: "building",
    image: "/images/services/corporate.jpg",
    features: [
      "Office Cleaning",
      "Bank Cleaning",
      "Commercial Buildings",
    ],
  },
] as const;

export const WHY_CHOOSE_US = [
  {
    title: "Professional Team",
    description: "Highly trained cleaning specialists.",
    icon: "users",
  },
  {
    title: "Eco-Friendly Products",
    description: "Safe products for your family and workplace.",
    icon: "leaf",
  },
  {
    title: "On-Time Service",
    description: "Always arriving on schedule.",
    icon: "clock",
  },
  {
    title: "Quality Service",
    description:
      "We focus on delivering reliable and consistent results.",
    icon: "star",
  },
  {
    title: "Trusted Service",
    description:
      "Reliable and professional cleaning solutions.",
    icon: "shield",
  },
  {
    title: "Competitive Prices",
    description:
      "Professional cleaning services at competitive prices.",
    icon: "dollar",
  },
] as const;

export const AREAS = [
  "Madinaty",
  "El Shorouk",
] as const;

export const CONTACT_INFO = {
  phone: "+20 1214290075",
  email: "atoz.cleaningservice3@gmail.com",
  address: "Madinaty & El Shorouk, Egypt",
  hours: "Daily — 10:00 AM to 6:00 PM",
} as const;

export const WHATSAPP_NUMBER = "201214290075";