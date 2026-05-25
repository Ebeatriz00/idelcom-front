import type { CommentDto, CreateCommentInput } from "@/application";
import http from "@/infrastructure";
import { getAreasIdFromtStorage, getBusinessIdFromStorage, getUserIdFromtStorage, getUsersVisibilityIdFromtStorage } from "@/stores";

export async function OpportunityComments(
  linkToken: string
): Promise<CommentDto[]> {
  const businessId = getBusinessIdFromStorage();
  const uid = getUserIdFromtStorage();
  const aid = getAreasIdFromtStorage();
  const ubid = getUsersVisibilityIdFromtStorage();

  if (businessId == null) throw new Error("BusinessId no disponible.");

  try {
    const { data } = await http.get<CommentDto[]>("/Comment/List", {
      params: { businessId, linkToken, usersId: uid, areaId: aid, userInternalVisibilityId : ubid},
    });

    return data ?? [];
  } catch (err: any) {
    if (err?.response?.status === 404) return [];
    throw err;
  }
}

export async function CreateOpportunityComment(
  dto: CreateCommentInput
): Promise<CommentDto> {
  const usersBy = getUserIdFromtStorage();
  const businessId = getBusinessIdFromStorage();

  if (usersBy == null) throw new Error("Usuario no disponible.");
  if (businessId == null) throw new Error("Empresa no disponible.");

  const payload = {
    ...dto,
    businessId,
    usersBy,
  };

  const { data } = await http.post<CommentDto>("/Comment/Create", payload);

  return data;
}

export async function markOpportunityCommentsRead(linkToken: string) {
  const businessId = getBusinessIdFromStorage();
  const usersId = getUserIdFromtStorage();

  await http.post("/Comment/MarkRead", {
    businessId,
    createdBy: usersId,
    linkToken,
  });
}
