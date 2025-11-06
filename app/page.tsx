/**
 * @file page.tsx
 * @description 홈페이지 (관광지 목록)
 *
 * 관광지 목록을 표시하는 홈페이지입니다.
 * Server Component에서 한국관광공사 API를 호출하여 실제 데이터를 가져옵니다.
 *
 * 현재는 기본값으로 서울 지역(areaCode: "1")의 전체 관광지를 조회합니다.
 * 추후 필터 기능 추가 시 지역 및 관광 타입 선택 가능 예정.
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /docs/TODO.md} - 작업 목록
 */

import { TourList } from "@/components/tour-list";
import { getAreaBasedList } from "@/lib/api/tour-api";

/**
 * 홈페이지 컴포넌트
 *
 * Server Component에서 한국관광공사 API를 호출하여 관광지 목록을 가져옵니다.
 * 에러가 발생하면 에러 메시지를 표시합니다.
 *
 * @default areaCode: "1" (서울)
 * @default contentTypeId: undefined (전체 관광 타입)
 * @default numOfRows: 20
 */
export default async function Home() {
  let tours;
  let error: Error | null = null;

  try {
    // 서울 지역(areaCode: "1")의 전체 관광지 조회
    // TODO: 추후 필터 기능 추가 시 query parameter로 받아서 사용
    tours = await getAreaBasedList("1", undefined, 20, 1);
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

      {/* 관광지 목록 컴포넌트 */}
      <TourList tours={tours} error={error} />
    </main>
  );
}
