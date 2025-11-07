/**
 * @file bookmark.ts
 * @description 북마크 관련 타입 정의
 *
 * Supabase bookmarks 테이블과 관련된 타입을 정의합니다.
 * 북마크는 사용자가 관광지를 즐겨찾기로 저장하는 기능입니다.
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /supabase/migrations/mytrip_schema.sql} - 데이터베이스 스키마
 */

/**
 * 북마크 테이블 타입 (Supabase bookmarks 테이블)
 */
export interface Bookmark {
  /** 북마크 ID */
  id: string;
  /** 사용자 ID (users 테이블 FK) */
  user_id: string;
  /** 관광지 콘텐츠 ID (한국관광공사 API contentid) */
  content_id: string;
  /** 북마크 생성일시 */
  created_at: string;
}

/**
 * 북마크 생성 시 입력 데이터 (id, created_at 제외)
 */
export interface BookmarkInsert {
  /** 사용자 ID */
  user_id: string;
  /** 관광지 콘텐츠 ID */
  content_id: string;
}

/**
 * 북마크 목록 조회 옵션
 */
export interface BookmarkListOptions {
  /** 사용자 ID (필수) */
  user_id: string;
  /** 정렬 옵션 */
  orderBy?: "created_at" | "content_id";
  /** 정렬 방향 */
  orderDirection?: "asc" | "desc";
  /** 페이지 번호 (선택 사항, 페이지네이션) */
  page?: number;
  /** 페이지당 항목 수 (선택 사항) */
  limit?: number;
}

/**
 * 북마크 응답 타입 (북마크 + 관광지 정보 포함 가능)
 */
export interface BookmarkWithTour extends Bookmark {
  /** 관광지 정보 (선택 사항, JOIN 시 포함) */
  tour?: {
    content_id: string;
    title?: string;
    firstimage?: string;
    addr1?: string;
  };
}

/**
 * 북마크 + TourItem 정보 (북마크 목록에서 사용)
 */
export interface BookmarkWithTourItem extends Bookmark {
  /** 관광지 정보 (TourItem) */
  tourItem: import("./tour").TourItem;
}

/**
 * 북마크 정렬 옵션
 */
export type BookmarkSortOption = "latest" | "name" | "region";

