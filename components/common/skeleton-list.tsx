/**
 * @file skeleton-list.tsx
 * @description 관광지 목록 스켈레톤 UI
 *
 * 관광지 목록 로딩 시 표시할 스켈레톤 리스트 컴포넌트입니다.
 * 여러 개의 스켈레톤 카드를 그리드 레이아웃으로 표시합니다.
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 */

import { SkeletonCard } from "./skeleton-card";
import { cn } from "@/lib/utils";

interface SkeletonListProps {
  /** 카드 개수 (기본값: 6) */
  count?: number;
  /** 그리드 컬럼 수 (모바일: 1, 태블릿: 2, 데스크톱: 3) */
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  /** 추가 클래스명 */
  className?: string;
}

const DEFAULT_COUNT = 6;

/**
 * 관광지 목록 스켈레톤 컴포넌트
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <SkeletonList />
 *
 * // 커스텀 개수
 * <SkeletonList count={12} />
 *
 * // 커스텀 그리드
 * <SkeletonList
 *   count={8}
 *   columns={{ mobile: 1, tablet: 2, desktop: 4 }}
 * />
 * ```
 */
const gridColsMap = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
};

const mdGridColsMap = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6",
};

const lgGridColsMap = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

export function SkeletonList({
  count = DEFAULT_COUNT,
  columns = {},
  className,
}: SkeletonListProps) {
  const {
    mobile = 1,
    tablet = 2,
    desktop = 3,
  } = columns;

  const mobileClass = gridColsMap[mobile as keyof typeof gridColsMap] || "grid-cols-1";
  const tabletClass = mdGridColsMap[tablet as keyof typeof mdGridColsMap] || "md:grid-cols-2";
  const desktopClass = lgGridColsMap[desktop as keyof typeof lgGridColsMap] || "lg:grid-cols-3";

  return (
    <div
      className={cn(
        "grid gap-4",
        mobileClass,
        tabletClass,
        desktopClass,
        className
      )}
      aria-label="로딩 중"
      aria-live="polite"
    >
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

