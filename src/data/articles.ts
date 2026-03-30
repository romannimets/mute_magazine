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
  relatedArticles?: string[];
  hidden?: boolean;        // se true, invisibile al pubblico (bozza / programmato)
};

export const categoryLabels: Record<string, string> = {
  risonanze: "Risonanze",
  voci: "Voci",
  sottofondo: "Sottofondo",
};

export const categoryIcons: Record<string, string> = {
  risonanze: "/risonanze.png",
  voci: "/voci.png",
  sottofondo: "/sottofondo.png",
};

export const categoryColors: Record<string, string> = {
  risonanze: "#FFFF00",
  voci: "#df1968",
  sottofondo: "#86DF2C",
};

export const DEFAULT_CATEGORY = "risonanze";