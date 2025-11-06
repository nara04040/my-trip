/**
 * @file skeleton-card.tsx
 * @description 관광지 카드 스켈레톤 UI
 *
 * 관광지 목록 로딩 시 표시할 스켈레톤 카드 컴포넌트입니다.
 * 실제 관광지 카드와 유사한 레이아웃을 제공하여 로딩 상태를 자연스럽게 표현합니다.
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 */

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 관광지 카드 스켈레톤 컴포넌트
 *
 * @example
 * ```tsx
 * // 단일 카드
 * <SkeletonCard />
 *
 * // 그리드 레이아웃
 * <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 *   {Array.from({ length: 6 }).map((_, i) => (
 *     <SkeletonCard key={i} />
 *   ))}
 * </div>
 * ```
 */
export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm",
        className
      )}
    >
      {/* 썸네일 이미지 영역 */}
      <Skeleton className="aspect-[4/3] w-full" />

      {/* 카드 내용 영역 */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* 관광지명 */}
        <Skeleton className="h-6 w-3/4" />

        {/* 주소 */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />

        {/* 관광 타입 뱃지 */}
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>

        {/* 개요 (1-2줄) */}
        <div className="mt-2 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}

