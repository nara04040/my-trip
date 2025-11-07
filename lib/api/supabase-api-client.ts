"use client";

/**
 * @file supabase-api-client.ts
 * @description Client Component용 북마크 API 함수들
 *
 * Client Component에서 사용할 수 있는 북마크 관련 함수들을 제공합니다.
 * 서버 전용 모듈을 import하지 않으므로 Client Component에서 안전하게 사용할 수 있습니다.
 *
 * @see {@link /lib/api/supabase-api.ts} - 서버 전용 함수들
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 */

import type { Bookmark, BookmarkInsert, BookmarkListOptions } from "@/lib/types/bookmark";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Component에서 사용할 수 있는 북마크 추가 함수
 * @param supabase Supabase 클라이언트 (useClerkSupabaseClient로 생성)
 * @param userId Supabase user_id
 * @param contentId 관광지 콘텐츠 ID
 * @returns 생성된 북마크 또는 null
 */
export async function addBookmarkClient(
  supabase: SupabaseClient,
  userId: string,
  contentId: string
): Promise<Bookmark | null> {
  const { data, error } = await supabase
    .from("bookmarks")
    .insert({
      user_id: userId,
      content_id: contentId,
    } as BookmarkInsert)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      // 중복 북마크
      return null;
    }
    throw new Error(`Failed to add bookmark: ${error.message}`);
  }

  return data;
}

/**
 * Client Component에서 사용할 수 있는 북마크 삭제 함수
 * @param supabase Supabase 클라이언트
 * @param userId Supabase user_id
 * @param contentId 관광지 콘텐츠 ID
 * @returns 삭제 성공 여부
 */
export async function removeBookmarkClient(
  supabase: SupabaseClient,
  userId: string,
  contentId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("content_id", contentId);

  if (error) {
    throw new Error(`Failed to remove bookmark: ${error.message}`);
  }

  return true;
}

/**
 * Client Component에서 사용할 수 있는 북마크 여부 확인 함수
 * @param supabase Supabase 클라이언트
 * @param userId Supabase user_id
 * @param contentId 관광지 콘텐츠 ID
 * @returns 북마크 여부
 */
export async function isBookmarkedClient(
  supabase: SupabaseClient,
  userId: string,
  contentId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("content_id", contentId)
    .maybeSingle();

  if (error) {
    return false;
  }

  return data !== null;
}

/**
 * Client Component에서 사용할 수 있는 북마크 목록 조회 함수
 * @param supabase Supabase 클라이언트
 * @param userId Supabase user_id
 * @param options 조회 옵션
 * @returns 북마크 목록
 */
export async function getBookmarksClient(
  supabase: SupabaseClient,
  userId: string,
  options?: Partial<BookmarkListOptions>
): Promise<Bookmark[]> {
  let query = supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId);

  const orderBy = options?.orderBy || "created_at";
  const orderDirection = options?.orderDirection || "desc";
  query = query.order(orderBy, { ascending: orderDirection === "asc" });

  if (options?.page && options?.limit) {
    const from = (options.page - 1) * options.limit;
    const to = from + options.limit - 1;
    query = query.range(from, to);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to get bookmarks: ${error.message}`);
  }

  return data || [];
}

