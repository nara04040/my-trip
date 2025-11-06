/**
 * @file page.tsx
 * @description 홈페이지 (관광지 목록)
 *
 * 관광지 목록을 표시하는 홈페이지입니다.
 * Server Component에서 한국관광공사 API를 호출하여 실제 데이터를 가져옵니다.
 *
 * 필터 기능:
 * - 지역 필터 (시/도 단위, URL 파라미터: areaCode)
 * - 관광 타입 필터 (URL 파라미터: contentTypeId)
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /docs/TODO.md} - 작업 목록
 */

import { Suspense } from "react";
import { TourList } from "@/components/tour-list";
import { TourFilters } from "@/components/tour-filters";
import { TourPagination } from "@/components/tour-pagination";
import {
  getAreaBasedListWithPagination,
  getAreaCodes,
  searchKeywordWithPagination,
} from "@/lib/api/tour-api";
import type { ContentTypeId, SortOption } from "@/lib/types/tour";
import { sortToursBy } from "@/lib/utils";

interface HomeProps {
  searchParams: Promise<{
    keyword?: string;
    areaCode?: string;
    contentTypeId?: string;
    sort?: string;
    pageNo?: string;
  }>;
}

/**
 * 홈페이지 컴포넌트
 *
 * Server Component에서 한국관광공사 API를 호출하여 관광지 목록을 가져옵니다.
 * URL searchParams를 통해 필터 및 검색 파라미터를 받아 필터링/검색된 결과를 표시합니다.
 *
 * 검색 모드:
 * - keyword가 있으면: searchKeyword() API 호출
 * - keyword가 없으면: getAreaBasedList() API 호출
 *
 * @param searchParams URL 쿼리 파라미터
 *   - keyword: 검색 키워드 (선택 사항)
 *   - areaCode: 지역코드 (선택 사항, 없으면 전체 지역 조회)
 *   - contentTypeId: 관광 타입 ID (기본값: undefined - 전체)
 */
export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const keyword = params.keyword?.trim();
  // areaCode가 없으면 undefined (전체 지역 조회)
  const areaCode = params.areaCode || undefined;
  const contentTypeId = params.contentTypeId
    ? (params.contentTypeId as ContentTypeId)
    : undefined;
  const sort = (params.sort as SortOption) || "latest";
  const pageNo = params.pageNo ? parseInt(params.pageNo, 10) : 1;

  // 검색 모드 여부
  const isSearchMode = !!keyword;

  // 지역 목록 prefetch (필터 컴포넌트에서 사용)
  let areaCodes;
  try {
    areaCodes = await getAreaCodes(50, 1);
  } catch (err) {
    console.error("Failed to fetch area codes:", err);
    areaCodes = [];
  }

  // 관광지 목록 조회 (검색 또는 필터)
  let tours;
  let totalCount = 0;
  let error: Error | null = null;

  try {
    if (isSearchMode) {
      // 검색 모드: searchKeywordWithPagination API 호출
      const result = await searchKeywordWithPagination(
        keyword,
        areaCode,
        contentTypeId,
        20,
        pageNo
      );
      tours = result.items;
      totalCount = result.totalCount;
    } else {
      // 필터 모드: getAreaBasedListWithPagination API 호출
      const result = await getAreaBasedListWithPagination(
        areaCode,
        contentTypeId,
        20,
        pageNo
      );
      tours = result.items;
      totalCount = result.totalCount;
    }

    // 클라이언트 사이드 정렬 (API는 정렬 기능을 직접 지원하지 않음)
    tours = sortToursBy(tours, sort);
  } catch (err) {
    console.error("Failed to fetch tours:", err);
    error = err instanceof Error ? err : new Error("관광지 정보를 불러오는데 실패했습니다.");
    tours = [];
    totalCount = 0;
  }

  // 전체 페이지 수 계산
  const itemsPerPage = 20;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // 검색 결과 개수 표시용 메시지
  const resultMessage = isSearchMode
    ? `"${keyword}" 검색 결과: ${tours.length}개`
    : "한국의 다양한 관광지를 탐색해보세요.";

  // 빈 상태 메시지
  const emptyMessage = isSearchMode
    ? `"${keyword}"에 대한 검색 결과가 없습니다.`
    : "관광지가 없습니다.";

  return (
    <main className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isSearchMode ? "검색 결과" : "관광지 목록"}
        </h1>
        <p className="text-muted-foreground">
          {resultMessage}
        </p>
      </div>

      {/* 필터 컴포넌트 */}
      <div className="mb-6">
        <Suspense fallback={<div className="h-10 animate-pulse bg-muted rounded-lg" />}>
          <TourFilters areaCodes={areaCodes} />
        </Suspense>
      </div>

      {/* 관광지 목록 컴포넌트 */}
      <TourList tours={tours} error={error} emptyMessage={emptyMessage} />

      {/* 페이지네이션 컴포넌트 */}
      {!error && tours.length > 0 && (
        <Suspense fallback={<div className="h-16 animate-pulse bg-muted rounded-lg mt-6" />}>
          <TourPagination
            currentPage={pageNo}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalCount}
          />
        </Suspense>
      )}
    </main>
  );
}
