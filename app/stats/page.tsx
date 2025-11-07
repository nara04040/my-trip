/**
 * @file page.tsx
 * @description 통계 대시보드 페이지
 *
 * 전국 관광지 데이터를 차트로 시각화하여 통계를 표시하는 페이지입니다.
 * Server Component로 구현되며, 한국관광공사 API를 호출하여 통계 데이터를 수집합니다.
 *
 * 주요 기능:
 * 1. 통계 요약 카드 (전체 개수, Top 3 지역, Top 3 타입)
 * 2. 지역별 분포 차트 (Bar Chart)
 * 3. 타입별 분포 차트 (Donut Chart)
 *
 * 현재 상태:
 * - Phase 4.1: 페이지 기본 구조 완료
 * - Phase 4.2~4.7: 추후 구현 예정
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.6 통계 대시보드)
 * @see {@link /docs/TODO.md} - 작업 목록 (Phase 4)
 * @see {@link /docs/reference/design/DESIGN.md} - 디자인 가이드
 */

import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsSummary } from "@/components/stats/stats-summary";
import { getStatsSummary } from "@/lib/api/stats-api";

/**
 * 메타데이터 설정
 * 
 * SEO 최적화를 위한 페이지 메타데이터를 설정합니다.
 */
export const metadata = {
  title: "통계 대시보드 | My Trip",
  description: "전국 관광지 데이터를 차트로 시각화하여 통계를 확인해보세요.",
};

/**
 * 데이터 캐싱 설정
 * 
 * 통계 데이터는 변동이 적으므로 1시간마다 재검증하도록 설정합니다.
 * Phase 4.7에서 실제 데이터 연동 시 활성화 예정
 */
export const revalidate = 3600; // 1시간마다 재검증

/**
 * 통계 대시보드 페이지 컴포넌트
 *
 * Phase 4.1-4.4 구현 완료:
 * - 페이지 기본 구조
 * - 타입 정의
 * - 통계 데이터 수집 함수
 * - 통계 요약 카드 컴포넌트
 *
 * 향후 구현:
 * - Phase 4.5: 지역별 분포 차트
 * - Phase 4.6: 타입별 분포 차트
 * - Phase 4.7: 페이지 통합 및 최적화
 */
export default async function StatsPage() {
  // 통계 데이터 조회
  let statsSummary;
  let error: Error | null = null;

  try {
    statsSummary = await getStatsSummary();
  } catch (err) {
    console.error("Failed to fetch stats summary:", err);
    error = err instanceof Error ? err : new Error("통계 데이터를 불러오는데 실패했습니다.");
  }

  return (
    <main className="container max-w-6xl py-8 px-4 md:px-6">
      {/* 뒤로가기 버튼 */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            뒤로가기
          </Button>
        </Link>
      </div>

      {/* 페이지 제목 및 설명 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">통계 대시보드</h1>
        </div>
        <p className="text-muted-foreground">
          전국 관광지 데이터를 한눈에 확인해보세요.
        </p>
      </div>

      {/* 섹션 구분선 */}
      <hr className="my-8 border-border" />

      {/* 통계 요약 카드 섹션 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">통계 요약</h2>
        {error ? (
          <div className="p-6 border rounded-lg bg-card">
            <p className="text-red-500 mb-2">통계 데이터를 불러오는데 실패했습니다.</p>
            <p className="text-sm text-muted-foreground">
              {error.message}
            </p>
          </div>
        ) : (
          <StatsSummary summary={statsSummary} isLoading={!statsSummary} />
        )}
      </section>

      {/* 섹션 구분선 */}
      <hr className="my-8 border-border" />

      {/* 지역별 분포 차트 섹션 (Phase 4.5에서 구현 예정) */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">지역별 관광지 분포</h2>
        <div className="p-6 border rounded-lg bg-card min-h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">지역별 분포 차트 (구현 예정)</p>
        </div>
      </section>

      {/* 섹션 구분선 */}
      <hr className="my-8 border-border" />

      {/* 타입별 분포 차트 섹션 (Phase 4.6에서 구현 예정) */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">관광 타입별 분포</h2>
        <div className="p-6 border rounded-lg bg-card min-h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">타입별 분포 차트 (구현 예정)</p>
        </div>
      </section>
    </main>
  );
}

