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

import { TourList } from "@/components/tour-list";
import { TourFilters } from "@/components/tour-filters";
import { getAreaBasedList, getAreaCodes } from "@/lib/api/tour-api";
import type { ContentTypeId } from "@/lib/types/tour";

interface HomeProps {
  searchParams: Promise<{
    areaCode?: string;
    contentTypeId?: string;
  }>;
}

/**
 * 홈페이지 컴포넌트
 *
 * Server Component에서 한국관광공사 API를 호출하여 관광지 목록을 가져옵니다.
 * URL searchParams를 통해 필터 파라미터를 받아 필터링된 결과를 표시합니다.
 *
 * @param searchParams URL 쿼리 파라미터
 *   - areaCode: 지역코드 (기본값: "1" - 서울)
 *   - contentTypeId: 관광 타입 ID (기본값: undefined - 전체)
 */
export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const areaCode = params.areaCode || "1"; // 기본값: 서울
  const contentTypeId = params.contentTypeId
    ? (params.contentTypeId as ContentTypeId)
    : undefined;

  // 지역 목록 prefetch (필터 컴포넌트에서 사용)
  let areaCodes;
  try {
    areaCodes = await getAreaCodes(50, 1);
  } catch (err) {
    console.error("Failed to fetch area codes:", err);
    areaCodes = [];
  }

  // 관광지 목록 조회
  let tours;
  let error: Error | null = null;

  try {
    tours = await getAreaBasedList(areaCode, contentTypeId, 20, 1);
  } catch (err) {
    console.error("Failed to fetch tours:", err);
    error = err instanceof Error ? err : new Error("관광지 정보를 불러오는데 실패했습니다.");
    tours = [];
  }

  return (
    <main className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">관광지 목록</h1>
        <p className="text-muted-foreground">
          한국의 다양한 관광지를 탐색해보세요.
        </p>
      </div>

      {/* 필터 컴포넌트 */}
      <div className="mb-6">
        <TourFilters areaCodes={areaCodes} />
      </div>

      {/* 관광지 목록 컴포넌트 */}
      <TourList tours={tours} error={error} />
    </main>
  );
}
