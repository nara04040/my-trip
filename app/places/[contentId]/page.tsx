/**
 * @file page.tsx
 * @description 관광지 상세페이지
 *
 * 관광지의 상세 정보를 표시하는 페이지입니다.
 * Server Component에서 한국관광공사 API를 호출하여 실제 데이터를 가져옵니다.
 *
 * 주요 기능:
 * 1. 관광지 기본 정보 표시 (3.2 완료)
 * 2. 지도 섹션 (3.3에서 구현 예정)
 * 3. 공유 기능 (3.4에서 구현 예정)
 * 4. 추가 정보 섹션 (3.5에서 구현 예정)
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /docs/TODO.md} - 작업 목록
 * @see {@link /docs/reference/design/DESIGN.md} - 디자인 가이드
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDetailCommon } from "@/lib/api/tour-api";
import { Button } from "@/components/ui/button";
import { DetailInfo } from "@/components/tour-detail/detail-info";

interface PlaceDetailPageProps {
  params: Promise<{
    contentId: string;
  }>;
}

/**
 * 관광지 상세페이지 컴포넌트
 *
 * Server Component에서 한국관광공사 API를 호출하여 관광지 상세 정보를 가져옵니다.
 * 데이터가 없으면 404 페이지로 리다이렉트합니다.
 *
 * @param params URL 파라미터
 *   - contentId: 관광지 콘텐츠 ID
 */
export default async function PlaceDetailPage({
  params,
}: PlaceDetailPageProps) {
  const { contentId } = await params;

  // 관광지 상세 정보 조회
  let tourDetail;
  try {
    tourDetail = await getDetailCommon(contentId);
  } catch (error) {
    console.error("Failed to fetch tour detail:", error);
    notFound();
  }

  // 데이터가 없으면 404 페이지로 리다이렉트
  if (!tourDetail) {
    notFound();
  }

  return (
    <main className="container max-w-4xl py-8 px-4 md:px-6">
      {/* 뒤로가기 버튼 */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            뒤로가기
          </Button>
        </Link>
      </div>

      {/* 기본 정보 섹션 */}
      <DetailInfo tour={tourDetail} />

      {/* 섹션 구분선 */}
      <hr className="my-8 border-border" />

      {/* 추가 섹션들 (3.3, 3.4, 3.5에서 구현 예정) */}
      <section className="mb-8">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">추가 정보</h2>
          <p className="text-muted-foreground">
            지도, 공유 기능, 운영 정보 등은 향후 구현 예정입니다.
          </p>
        </div>
      </section>
    </main>
  );
}

