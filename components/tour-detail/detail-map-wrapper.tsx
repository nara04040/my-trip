"use client";

/**
 * @file detail-map-wrapper.tsx
 * @description 상세페이지 지도 컴포넌트 래퍼
 *
 * Server Component에서 사용하기 위한 Client Component 래퍼입니다.
 * dynamic import를 사용하여 SSR을 비활성화하고 로딩 상태를 제공합니다.
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 */

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";
import type { TourDetail } from "@/lib/types/tour";

// 네이버 지도 컴포넌트는 dynamic import로 SSR 비활성화
const DetailMap = dynamic(
  () =>
    import("@/components/tour-detail/detail-map").then((mod) => ({
      default: mod.DetailMap,
    })),
  {
    ssr: false,
    loading: () => (
      <section className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          위치 정보
        </h2>
        <div className="w-full h-[400px] md:h-[500px] bg-muted animate-pulse rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground">지도를 불러오는 중...</p>
        </div>
      </section>
    ),
  }
);

interface DetailMapWrapperProps {
  /** 관광지 상세 정보 */
  tour: TourDetail;
}

/**
 * 상세페이지 지도 컴포넌트 래퍼
 *
 * Server Component에서 사용할 수 있도록 dynamic import를 처리하는 래퍼입니다.
 *
 * @example
 * ```tsx
 * <DetailMapWrapper tour={tourDetail} />
 * ```
 */
export function DetailMapWrapper({ tour }: DetailMapWrapperProps) {
  return <DetailMap tour={tour} />;
}

