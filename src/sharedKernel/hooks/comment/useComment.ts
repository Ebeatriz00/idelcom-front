import type { CommentDto, CreateCommentInput } from "@/application";
import {
  CreateOpportunityComment,
  OpportunityComments,
} from "@/infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const qkComment = {
  all: ["opportunity-comments"] as const,

  byOppor: (linkToken: string) =>
    [...qkComment.all, "by-oppor", linkToken] as const,
};

export function useListComment(linkToken?: string | null) {
  return useQuery<CommentDto[]>({
    queryKey: linkToken != null ? qkComment.byOppor(linkToken) : qkComment.all,
    queryFn: () => OpportunityComments(linkToken!),
    enabled: !!linkToken,
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: false,
  });
}

export function useCreateOpportunityComment() {
  const qc = useQueryClient();

  return useMutation<CommentDto, unknown, CreateCommentInput>({
    mutationFn: (dto) => CreateOpportunityComment(dto),
    onSuccess: (_data, variables) => {
      if (!variables.linkToken) return;

      qc.invalidateQueries({
        queryKey: qkComment.byOppor(variables.linkToken),
      });
    },
  });
}