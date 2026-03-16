"use client";

import { useParams } from "next/navigation";
import ArticleGrid from "@/app/components/ArticleGrid";
import { categoryLabels, DEFAULT_CATEGORY } from "@/data/articles";

export default function CategoriaArticoli() {
  const params = useParams();
  const categoryParam =
    typeof params.categoria === "string" ? params.categoria : DEFAULT_CATEGORY;

  // fallback se la categoria non esiste nelle etichette
  const category = categoryLabels[categoryParam] ? categoryParam : DEFAULT_CATEGORY;

  return <ArticleGrid category={category} />;
}