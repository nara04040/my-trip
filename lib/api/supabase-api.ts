/**
 * @file supabase-api.ts
 * @description Supabase 북마크 쿼리 함수들
 *
 * 북마크 기능을 위한 Supabase 쿼리 함수들을 제공합니다.
 * Clerk 인증과 연동되어 인증된 사용자만 북마크를 관리할 수 있습니다.
 *
 * 주요 기능:
 * 1. 북마크 추가/삭제
 * 2. 북마크 목록 조회
 * 3. 북마크 여부 확인
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /lib/types/bookmark.ts} - 북마크 타입 정의
 */

import type { Bookmark, BookmarkInsert, BookmarkListOptions } from "@/lib/types/bookmark";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Clerk 사용자 ID로 Supabase users 테이블의 user_id를 조회
 * @param supabase Supabase 클라이언트
 * @param clerkUserId Clerk 사용자 ID
 * @returns Supabase user_id (UUID)
 */
async function getUserIdByClerkId(
  supabase: SupabaseClient,
  clerkUserId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkUserId)
    .single();

  if (error || !data) {
    console.error("Failed to get user_id:", error);
    return null;
  }

  return data.id;
}

/**
 * 현재 인증된 사용자의 Supabase user_id 조회 (Server Component용)
 * @returns Supabase user_id (UUID)
 */
async function getCurrentUserId(): Promise<string | null> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return null;
  }

  const supabase = createClerkSupabaseClient();
  return getUserIdByClerkId(supabase, clerkUserId);
}

/**
 * 북마크 추가
 * 동일한 관광지를 중복 북마크하는 것을 방지합니다 (UNIQUE 제약).
 *
 * @param contentId 관광지 콘텐츠 ID
 * @returns 생성된 북마크 또는 null (중복 시)
 */
export async function addBookmark(
  contentId: string
): Promise<Bookmark | null> {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const supabase = createClerkSupabaseClient();

  const { data, error } = await supabase
    .from("bookmarks")
    .insert({
      user_id: userId,
      content_id: contentId,
    } as BookmarkInsert)
    .select()
    .single();

  if (error) {
    // 중복 북마크인 경우 (UNIQUE 제약 위반)
    if (error.code === "23505") {
      return null;
    }

    console.error("Failed to add bookmark:", error);
    throw new Error(`Failed to add bookmark: ${error.message}`);
  }

  return data;
}

/**
 * 북마크 삭제
 *
 * @param contentId 관광지 콘텐츠 ID
 * @returns 삭제 성공 여부
 */
export async function removeBookmark(
  contentId: string
): Promise<boolean> {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const supabase = createClerkSupabaseClient();

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("content_id", contentId);

  if (error) {
    console.error("Failed to remove bookmark:", error);
    throw new Error(`Failed to remove bookmark: ${error.message}`);
  }

  return true;
}

/**
 * 북마크 토글 (추가/삭제)
 * 이미 북마크되어 있으면 삭제, 없으면 추가합니다.
 *
 * @param contentId 관광지 콘텐츠 ID
 * @returns 북마크 상태 (true: 추가됨, false: 삭제됨)
 */
export async function toggleBookmark(
  contentId: string
): Promise<boolean> {
  const isBookmarked = await isBookmarkedByCurrentUser(contentId);

  if (isBookmarked) {
    await removeBookmark(contentId);
    return false;
  } else {
    await addBookmark(contentId);
    return true;
  }
}

/**
 * 북마크 여부 확인 (현재 사용자)
 *
 * @param contentId 관광지 콘텐츠 ID
 * @returns 북마크 여부
 */
export async function isBookmarkedByCurrentUser(
  contentId: string
): Promise<boolean> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return false;
  }

  const supabase = createClerkSupabaseClient();

  const { data, error } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("content_id", contentId)
    .maybeSingle();

  if (error) {
    console.error("Failed to check bookmark:", error);
    return false;
  }

  return data !== null;
}

/**
 * 북마크 목록 조회 (현재 사용자)
 *
 * @param options 조회 옵션
 * @returns 북마크 목록
 */
export async function getBookmarks(
  options?: Partial<BookmarkListOptions>
): Promise<Bookmark[]> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return [];
  }

  const supabase = createClerkSupabaseClient();

  let query = supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", userId);

  // 정렬 옵션
  const orderBy = options?.orderBy || "created_at";
  const orderDirection = options?.orderDirection || "desc";
  query = query.order(orderBy, { ascending: orderDirection === "asc" });

  // 페이지네이션
  if (options?.page && options?.limit) {
    const from = (options.page - 1) * options.limit;
    const to = from + options.limit - 1;
    query = query.range(from, to);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to get bookmarks:", error);
    throw new Error(`Failed to get bookmarks: ${error.message}`);
  }

  return data || [];
}

/**
 * 북마크 개수 조회 (현재 사용자)
 *
 * @returns 북마크 개수
 */
export async function getBookmarkCount(): Promise<number> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return 0;
  }

  const supabase = createClerkSupabaseClient();

  const { count, error } = await supabase
    .from("bookmarks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to get bookmark count:", error);
    return 0;
  }

  return count || 0;
}

/**
 * Client Component용 북마크 함수들은 별도 파일로 분리되었습니다.
 * @see {@link /lib/api/supabase-api-client.ts} - Client Component용 함수들
 */

