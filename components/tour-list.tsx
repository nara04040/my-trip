/**
 * @file tour-list.tsx
 * @description 관광지 목록 컴포넌트
 *
 * 관광지 목록을 그리드 레이아웃으로 표시하는 컴포넌트입니다.
 * Client Component로 구현되어 Server Component에서도 사용 가능합니다.
 *
 * 주요 기능:
 * 1. 카드 형태의 그리드 레이아웃
 * 2. 로딩 상태 (스켈레톤 UI)
 * 3. 에러 처리
 * 4. 빈 상태 처리
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /lib/types/tour.ts} - TourItem 타입 정의
 */

"use client";

import { TourCard } from "./tour-card";
import { SkeletonList } from "./common/skeleton-list";
import { ErrorMessage } from "./common/error-message";
import type { TourItem } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface TourListProps {
  /** 관광지 목록 */
  tours?: TourItem[];
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 에러 메시지 */
  error?: string | Error | null;
  /** 에러 발생 시 재시도 핸들러 */
  onRetry?: () => void;
  /** 빈 상태 메시지 */
  emptyMessage?: string;
  /** 추가 클래스명 */
  className?: string;
  /** 그리드 컬럼 수 */
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}

/**
 * 관광지 목록 컴포넌트
 *
 * @example
 * ```tsx
 * // Server Component에서 사용
 * const tours = await getAreaBasedList("1");
 * <TourList tours={tours} />
 *
 * // Client Component에서 사용 (로딩 상태 포함)
 * <TourList tours={tours} isLoading={isLoading} error={error} onRetry={refetch} />
 *
 * // 빈 상태
 * <TourList tours={[]} emptyMessage="관광지가 없습니다." />
 * ```
 */
export function TourList({
  tours,
  isLoading = false,
  error = null,
  onRetry,
  emptyMessage = "관광지가 없습니다.",
  className,
  columns = {},
}: TourListProps) {
  // 로딩 상태
  if (isLoading) {
    return <SkeletonList columns={columns} className={className} />;
  }

  // 에러 상태
  if (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    const isNetworkError =
      errorMessage.includes("network") ||
      errorMessage.includes("fetch") ||
      errorMessage.includes("Network");

    // 에러 발생 시 재시도 버튼 제공
    // onRetry가 없으면 페이지 새로고침으로 재시도
    return (
      <ErrorMessage
        type={isNetworkError ? "network" : "api"}
        message={
          isNetworkError
            ? "네트워크 연결을 확인해주세요."
            : "관광지 정보를 불러오는데 실패했습니다."
        }
        onRetry={
          onRetry ||
          (() => {
            window.location.reload();
          })
        }
        className={className}
        fullHeight
      />
    );
  }

  // 데이터가 없는 경우
  if (!tours || tours.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-4 p-12 text-center min-h-[400px]",
          className
        )}
      >
        <p className="text-lg text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  // 그리드 컬럼 클래스 생성
  const {
    mobile = 1,
    tablet = 2,
    desktop = 3,
  } = columns;

  const gridColsMap = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  const mdGridColsMap = {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
  };

  const lgGridColsMap = {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
  };

  const mobileClass =
    gridColsMap[mobile as keyof typeof gridColsMap] || "grid-cols-1";
  const tabletClass =
    mdGridColsMap[tablet as keyof typeof mdGridColsMap] || "md:grid-cols-2";
  const desktopClass =
    lgGridColsMap[desktop as keyof typeof lgGridColsMap] || "lg:grid-cols-3";

  // 관광지 목록 표시
  return (
    <div
      className={cn(
        "grid gap-4",
        mobileClass,
        tabletClass,
        desktopClass,
        className
      )}
      role="list"
      aria-label="관광지 목록"
    >
      {tours.map((tour) => (
        <div key={tour.contentid} role="listitem">
          <TourCard tour={tour} />
        </div>
      ))}
    </div>
  );
}
