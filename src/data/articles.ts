export type ArticleCard = {
  _id: string;
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  date: string;
  cover: string;
  category: string;
  content: string;
  relatedArticles?: string[]; // array of article UUIDs
};

export const categoryLabels: Record<string, string> = {
  risonanze: "Risonanze",
  voci: "Voci",
  sottofondo: "Sottofondo",
  //manifesto: "Manifesto", // usato solo in admin, non mostrato al pubblico
};

export const categoryIcons: Record<string, string> = {
  risonanze: "/risonanze.png",
  voci: "/voci.png",
  sottofondo: "/sottofondo.png",
};

export const DEFAULT_CATEGORY = "risonanze";