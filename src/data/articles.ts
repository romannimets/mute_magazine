export type ArticleCard = {
  _id: string;     // MongoDB ID
  id: string;      // UUID usato per URL
  title: string;
  subtitle: string;
  author: string;
  date: string;
  cover: string;   // link o percorso immagine
  category: string;
  content: string;
};

// Label display per ogni categoria
export const categoryLabels: Record<string, string> = {
  risonanze: "Risonanze",
  voci: "Voci",
  sottofondo: "Sottofondo",
};

// Icona PNG per ogni categoria
export const categoryIcons: Record<string, string> = {
  risonanze: "/risonanze.png",
  voci: "/voci.png",
  sottofondo: "/sottofondo.png",
};

// Slug di default (usato come fallback nei link di categoria)
export const DEFAULT_CATEGORY = "risonanze";