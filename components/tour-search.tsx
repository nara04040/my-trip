/**
 * @file tour-search.tsx
 * @description 관광지 검색 컴포넌트
 *
 * 키워드로 관광지를 검색하는 컴포넌트입니다.
 * 검색 실행 시 URL searchParams를 업데이트하여 Server Component에서 검색 결과를 가져옵니다.
 *
 * 주요 기능:
 * 1. 검색창 UI (Input + 검색 아이콘)
 * 2. 엔터키 또는 검색 버튼으로 검색 실행
 * 3. URL searchParams 기반 상태 관리
 * 4. 기존 필터 파라미터 유지
 * 5. 반응형 디자인
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /docs/reference/design/DESIGN.md} - 디자인 가이드
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TourSearchProps {
  /** 추가 클래스명 */
  className?: string;
  /** 검색창 너비 (기본값: 자동) */
  width?: "full" | "auto";
  /** 검색 버튼 표시 여부 (기본값: false, 엔터키로 검색 가능) */
  showButton?: boolean;
}

/**
 * 관광지 검색 컴포넌트
 *
 * @example
 * ```tsx
 * // 헤더에 사용
 * <TourSearch className="flex-1 max-w-md" />
 *
 * // 검색 버튼 포함
 * <TourSearch showButton />
 * ```
 */
export function TourSearch({
  className,
  width = "auto",
  showButton = false,
}: TourSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 현재 검색 키워드 읽기
  const currentKeyword = searchParams.get("keyword") || "";

  // 로컬 상태 (입력 중인 값)
  const [inputValue, setInputValue] = useState(currentKeyword);

  // URL의 keyword가 변경되면 inputValue 동기화
  useEffect(() => {
    setInputValue(currentKeyword);
  }, [currentKeyword]);

  /**
   * 검색 실행 핸들러
   * URL searchParams를 업데이트하여 Server Component에서 검색 결과를 가져옵니다.
   */
  const handleSearch = useCallback(
    (keyword: string) => {
      const params = new URLSearchParams(searchParams.toString());

      // 빈 문자열이면 keyword 파라미터 제거
      if (!keyword.trim()) {
        params.delete("keyword");
      } else {
        params.set("keyword", keyword.trim());
      }

      // 기존 필터 파라미터 유지 (areaCode, contentTypeId)
      // pageNo는 검색 시 1로 리셋
      params.delete("pageNo");

      router.push(`/?${params.toString()}`);
    },
    [router, searchParams]
  );

  /**
   * 검색 실행
   */
  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      handleSearch(inputValue);
    },
    [inputValue, handleSearch]
  );

  /**
   * 검색어 초기화
   */
  const handleClear = useCallback(() => {
    setInputValue("");
    handleSearch("");
  }, [handleSearch]);

  /**
   * 엔터키 입력 핸들러
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex items-center gap-2",
        width === "full" && "w-full",
        className
      )}
    >
      <div className="relative flex-1 min-w-[200px] md:min-w-[300px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="관광지 검색..."
          className={cn(
            "pl-9 pr-9",
            inputValue && "pr-9"
          )}
        />
        {inputValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full"
            onClick={handleClear}
            aria-label="검색어 지우기"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      {showButton && (
        <Button type="submit" size="default">
          검색
        </Button>
      )}
    </form>
  );
}
