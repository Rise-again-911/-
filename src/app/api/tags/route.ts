import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-utils";
import { TagType } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get("type");

  let typeFilter: TagType | undefined;

  if (typeParam) {
    const upper = typeParam.toUpperCase();
    if (upper === "THEME" || upper === "MOOD" || upper === "LEVEL") {
      typeFilter = upper as TagType;
    } else {
      return apiError("INVALID_TYPE", "type 参数必须为 THEME、MOOD 或 LEVEL", 400);
    }
  }

  const tags = await prisma.tag.findMany({
    where: typeFilter ? { type: typeFilter } : undefined,
    orderBy: { createdAt: "asc" },
  });

  // Group by type
  const grouped: Record<string, { id: string; name: string }[]> = {};
  for (const tag of tags) {
    if (!grouped[tag.type]) grouped[tag.type] = [];
    grouped[tag.type].push({ id: tag.id, name: tag.name });
  }

  // If a specific type was requested, return only that type's tags
  if (typeFilter) {
    return apiSuccess({
      [typeFilter]: grouped[typeFilter] || [],
    });
  }

  return apiSuccess(grouped);
}
