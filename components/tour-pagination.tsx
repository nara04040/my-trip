/**
 * @file tour-pagination.tsx
 * @description 관광지 목록 페이지네이션 컴포넌트
 *
 * 페이지 번호 선택 방식의 페이지네이션 컴포넌트입니다.
 * 이전/다음 버튼과 페이지 번호 버튼을 제공합니다.
 *
 * 주요 기능:
 * 1. 페이지 번호 버튼 (최대 5-7개 표시)
 * 2. 이전/다음 버튼
 * 3. 첫 페이지/마지막 페이지 버튼 (선택 사항)
 * 4. 반응형 디자인 (모바일: 간소화된 UI)
 * 5. URL searchParams 기반 상태 관리
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /docs/reference/design/DESIGN.md} - 디자인 가이드
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TourPaginationProps {
  /** 현재 페이지 번호 */
  currentPage: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 페이지당 항목 수 */
  itemsPerPage?: number;
  /** 전체 항목 수 */
  totalItems?: number;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 관광지 목록 페이지네이션 컴포넌트
 *
 * @example
 * ```tsx
 * <TourPagination
 *   currentPage={1}
 *   totalPages={10}
 *   itemsPerPage={20}
 *   totalItems={200}
 * />
 * ```
 */
export function TourPagination({
  currentPage,
  totalPages,
  itemsPerPage = 20,
  totalItems,
  className,
}: TourPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 페이지가 1개 이하이면 표시하지 않음
  if (totalPages <= 1) {
    return null;
  }

  /**
   * 페이지 변경 핸들러
   * URL searchParams를 업데이트하여 Server Component에서 해당 페이지의 데이터를 가져옵니다.
   * 기존 필터, 검색, 정렬 파라미터를 유지합니다.
   */
  const handlePageChange = (newPage: number) => {
    // 페이지 범위 체크
    if (newPage < 1 || newPage > totalPages) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("pageNo", String(newPage));

    // 페이지 변경 시 스크롤을 목록 상단으로 이동
    router.push(`/?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * 페이지 번호 버튼 생성
   * 현재 페이지 주변의 페이지 번호들을 표시합니다.
   */
  const getPageNumbers = (): number[] => {
    const maxVisible = 5; // 최대 표시할 페이지 번호 개수
    const pages: number[] = [];

    if (totalPages <= maxVisible) {
      // 전체 페이지가 적으면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 현재 페이지 주변 페이지 표시
      const start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
      const end = Math.min(totalPages, start + maxVisible - 1);

      // 시작 페이지가 1보다 크면 첫 페이지 추가
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push(-1); // 생략 표시
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // 끝 페이지가 마지막보다 작으면 마지막 페이지 추가
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push(-1); // 생략 표시
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 py-6",
        "md:flex-row md:justify-between",
        className
      )}
    >
      {/* 페이지 정보 (모바일: 상단, 데스크톱: 좌측) */}
      {totalItems !== undefined && (
        <div className="text-sm text-muted-foreground text-center md:text-left">
          전체 {totalItems.toLocaleString()}개 중{" "}
          {((currentPage - 1) * itemsPerPage + 1).toLocaleString()}-
          {Math.min(currentPage * itemsPerPage, totalItems).toLocaleString()}개 표시
        </div>
      )}

      {/* 페이지네이션 버튼 그룹 */}
      <div className="flex items-center gap-1">
        {/* 첫 페이지 버튼 (데스크톱만) */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="hidden md:flex"
          aria-label="첫 페이지"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* 이전 페이지 버튼 */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="이전 페이지"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* 페이지 번호 버튼들 */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((pageNum, index) => {
            if (pageNum === -1) {
              // 생략 표시
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-muted-foreground"
                >
                  ...
                </span>
              );
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNum)}
                className={cn(
                  "min-w-[2.5rem]",
                  currentPage === pageNum && "pointer-events-none"
                )}
                aria-label={`${pageNum}페이지`}
                aria-current={currentPage === pageNum ? "page" : undefined}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        {/* 다음 페이지 버튼 */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="다음 페이지"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* 마지막 페이지 버튼 (데스크톱만) */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="hidden md:flex"
          aria-label="마지막 페이지"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

