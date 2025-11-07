/**
 * @file home-tour-view.tsx
 * @description 홈페이지 관광지 목록/지도 뷰 컴포넌트
 *
 * 리스트와 지도를 연동하여 TourCard 클릭 시 해당 마커로 지도가 이동하도록 합니다.
 * Client Component로 구현되어 지도 ref를 관리합니다.
 *
 * DESIGN.md 요구사항:
 * - 데스크톱: 리스트(50%) | 지도(50%) 동시 표시
 * - 모바일: 탭으로 리스트/지도 전환
 *
 * @see {@link /docs/reference/design/DESIGN.md} - 디자인 가이드
 */

"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { TourList } from "@/components/tour-list";
import { TourCard } from "@/components/tour-card";
import { TourViewTabs } from "@/components/tour-view-tabs";
import type { NaverMapRef } from "@/components/naver-map";
import type { TourItem } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

// 네이버 지도 컴포넌트는 dynamic import로 SSR 비활성화
const NaverMapDynamic = dynamic(
  () => import("@/components/naver-map").then((mod) => ({ default: mod.NaverMap })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] lg:h-[600px] bg-muted animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">지도를 불러오는 중...</p>
      </div>
    ),
  }
);

interface HomeTourViewProps {
  /** 관광지 목록 */
  tours: TourItem[];
  /** 에러 메시지 */
  error?: string | Error | null;
  /** 빈 상태 메시지 */
  emptyMessage?: string;
}

/**
 * 홈페이지 관광지 목록/지도 뷰 컴포넌트
 *
 * 데스크톱에서는 리스트와 지도를 동시에 표시하고,
 * 모바일에서는 탭으로 전환합니다.
 * TourCard 클릭 시 해당 관광지의 마커로 지도가 이동합니다.
 */
export function HomeTourView({
  tours,
  error,
  emptyMessage,
}: HomeTourViewProps) {
  const mapRef = useRef<NaverMapRef>(null);
  const [selectedTourId, setSelectedTourId] = useState<string | null>(null);

  // TourCard 클릭 핸들러 (지도 이동)
  const handleCardClick = (contentId: string) => {
    // 지도로 이동
    mapRef.current?.moveToMarker(contentId);
    setSelectedTourId(contentId);

    // 모바일에서 지도 탭으로 자동 전환 (선택 사항)
    // 이 기능은 TourViewTabs의 onTabChange를 통해 구현 가능
  };

  // TourCard 호버 핸들러 (마커 강조)
  const handleCardHover = (contentId: string) => {
    // 데스크톱에서만 동작 (모바일은 호버 이벤트 없음)
    if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) {
      mapRef.current?.highlightMarker(contentId);
    }
  };

  // TourCard 호버 해제 핸들러 (마커 강조 해제)
  const handleCardLeave = () => {
    // 데스크톱에서만 동작
    if (typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches) {
      mapRef.current?.unhighlightMarker();
    }
  };

  // 리스트 컴포넌트 (클릭 이벤트 처리 포함)
  const listContent = error ? (
    <TourList tours={tours} error={error} emptyMessage={emptyMessage} />
  ) : tours.length === 0 ? (
    <TourList tours={tours} error={error} emptyMessage={emptyMessage} />
  ) : (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-1">
      {tours.map((tour) => (
        <div
          key={tour.contentid}
          onClick={() => handleCardClick(tour.contentid)}
          onMouseEnter={() => handleCardHover(tour.contentid)}
          onMouseLeave={handleCardLeave}
          className={cn(
            "cursor-pointer transition-all",
            selectedTourId === tour.contentid && "ring-2 ring-primary rounded-lg"
          )}
        >
          <TourCard tour={tour} />
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* 데스크톱 레이아웃: 리스트(50%) | 지도(50%) 동시 표시 */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-6">
        {/* 좌측: 관광지 목록 */}
        <div className="flex flex-col">{listContent}</div>

        {/* 우측: 네이버 지도 */}
        <div className="sticky top-4 h-[600px]">
          <NaverMapDynamic ref={mapRef} tours={tours} />
        </div>
      </div>

      {/* 모바일 레이아웃: 탭으로 리스트/지도 전환 */}
      <div className="lg:hidden">
        <TourViewTabs
          listContent={listContent}
          mapContent={<NaverMapDynamic ref={mapRef} tours={tours} />}
          defaultValue="list"
        />
      </div>
    </>
  );
}

