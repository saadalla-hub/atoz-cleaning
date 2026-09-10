export type PropertyType =
  | "Apartment"
  | "Cafe"
  | "Shop"
  | "Villa";

export type PropertySize =
  | "Under 70 m²"
  | "70–100 m²"
  | "100–150 m²"
  | "150–200 m²"
  | "200+ m²";

export type CleaningType =
  | "Regular Cleaning"
  | "Deep Cleaning"
  | "Post-Construction Cleaning";

export const PRICES: Record<
  PropertyType,
  Record<PropertySize, Record<CleaningType, number | null>>
> = {
  Apartment: {
    "Under 70 m²": {
      "Regular Cleaning": 550,
      "Deep Cleaning": 750,
      "Post-Construction Cleaning": 1600,
    },
    "70–100 m²": {
      "Regular Cleaning": 650,
      "Deep Cleaning": 900,
      "Post-Construction Cleaning": 1900,
    },
    "100–150 m²": {
      "Regular Cleaning": 750,
      "Deep Cleaning": 1100,
      "Post-Construction Cleaning": 2300,
    },
    "150–200 m²": {
      "Regular Cleaning": 850,
      "Deep Cleaning": 1300,
      "Post-Construction Cleaning": 2800,
    },
    "200+ m²": {
      "Regular Cleaning": null,
      "Deep Cleaning": null,
      "Post-Construction Cleaning": null,
    },
  },

  Cafe: {
    "Under 70 m²": {
      "Regular Cleaning": 750,
      "Deep Cleaning": 1000,
      "Post-Construction Cleaning": 1800,
    },
    "70–100 m²": {
      "Regular Cleaning": 950,
      "Deep Cleaning": 1300,
      "Post-Construction Cleaning": 2200,
    },
    "100–150 m²": {
      "Regular Cleaning": 1200,
      "Deep Cleaning": 1500,
      "Post-Construction Cleaning": 2500,
    },
    "150–200 m²": {
      "Regular Cleaning": 1400,
      "Deep Cleaning": 1900,
      "Post-Construction Cleaning": 3200,
    },
    "200+ m²": {
      "Regular Cleaning": null,
      "Deep Cleaning": null,
      "Post-Construction Cleaning": null,
    },
  },

  Shop: {
    "Under 70 m²": {
      "Regular Cleaning": 700,
      "Deep Cleaning": 1100,
      "Post-Construction Cleaning": 2000,
    },
    "70–100 m²": {
      "Regular Cleaning": 800,
      "Deep Cleaning": 1400,
      "Post-Construction Cleaning": 2500,
    },
    "100–150 m²": {
      "Regular Cleaning": 1100,
      "Deep Cleaning": 1600,
      "Post-Construction Cleaning": 2700,
    },
    "150–200 m²": {
      "Regular Cleaning": 1400,
      "Deep Cleaning": 2000,
      "Post-Construction Cleaning": 3400,
    },
    "200+ m²": {
      "Regular Cleaning": null,
      "Deep Cleaning": null,
      "Post-Construction Cleaning": null,
    },
  },

  Villa: {
    "Under 70 m²": {
      "Regular Cleaning": null,
      "Deep Cleaning": null,
      "Post-Construction Cleaning": null,
    },
    "70–100 m²": {
      "Regular Cleaning": null,
      "Deep Cleaning": null,
      "Post-Construction Cleaning": null,
    },
    "100–150 m²": {
      "Regular Cleaning": null,
      "Deep Cleaning": null,
      "Post-Construction Cleaning": null,
    },
    "150–200 m²": {
      "Regular Cleaning": null,
      "Deep Cleaning": null,
      "Post-Construction Cleaning": null,
    },
    "200+ m²": {
      "Regular Cleaning": null,
      "Deep Cleaning": null,
      "Post-Construction Cleaning": null,
    },
  },
};
