"use server";

import { getAllCategories } from "@/queries/categories";
import { getAllGraphData } from "@/queries/graph";
import { getAllTags } from "@/queries/tags";

export async function getTagsAction() {
  return getAllTags();
}

export async function getGraphPageDataAction() {
  const [graphData, categories] = await Promise.all([
    getAllGraphData(),
    getAllCategories(),
  ]);

  return { graphData, categories };
}
