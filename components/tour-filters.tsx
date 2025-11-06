/**
 * @file tour-filters.tsx
 * @description 관광지 필터 컴포넌트
 *
 * 지역 필터와 관광 타입 필터를 제공하는 컴포넌트입니다.
 * 필터 변경 시 URL searchParams를 업데이트하여 Server Component에서 필터링된 결과를 가져옵니다.
 *
 * 주요 기능:
 * 1. 지역 필터 (시/도 단위, "전체" 옵션 포함)
 * 2. 관광 타입 필터 (12, 14, 15, 25, 28, 32, 38, 39, "전체")
 * 3. URL searchParams 기반 상태 관리
 * 4. 반응형 디자인 (데스크톱: 수평 배치, 모바일: 가로 스크롤)
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /docs/reference/design/DESIGN.md} - 디자인 가이드
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Tag } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AreaCode, ContentTypeId } from "@/lib/types/tour";
import { CONTENT_TYPE, CONTENT_TYPE_NAMES } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface TourFiltersProps {
  /** 지역 목록 (시/도 단위) */
  areaCodes: AreaCode[];
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 관광지 필터 컴포넌트
 *
 * @example
 * ```tsx
 * const areaCodes = await getAreaCodes();
 * <TourFilters areaCodes={areaCodes} />
 * ```
 */
export function TourFilters({ areaCodes, className }: TourFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 현재 필터 값 읽기
  const currentAreaCode = searchParams.get("areaCode") || "1"; // 기본값: 서울
  const contentTypeIdParam = searchParams.get("contentTypeId");
  const currentContentTypeId = contentTypeIdParam || undefined;

  /**
   * 필터 변경 핸들러
   * URL searchParams를 업데이트하여 Server Component에서 필터링된 결과를 가져옵니다.
   */
  const handleAreaCodeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "all" || !value) {
      params.delete("areaCode");
    } else {
      params.set("areaCode", value);
    }
    
    // contentTypeId가 있으면 유지
    if (currentContentTypeId) {
      params.set("contentTypeId", currentContentTypeId);
    }
    
    router.push(`/?${params.toString()}`);
  };

  const handleContentTypeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "all" || !value) {
      params.delete("contentTypeId");
    } else {
      params.set("contentTypeId", value);
    }
    
    // areaCode가 있으면 유지 (없으면 기본값 "1" 사용)
    const areaCode = searchParams.get("areaCode") || "1";
    if (areaCode !== "1") {
      params.set("areaCode", areaCode);
    }
    
    router.push(`/?${params.toString()}`);
  };


  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-center md:gap-6",
        "overflow-x-auto pb-2 md:overflow-x-visible md:pb-0",
        className
      )}
    >
      {/* 지역 필터 */}
      <div className="flex items-center gap-2 min-w-[200px] shrink-0">
        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select value={currentAreaCode} onValueChange={handleAreaCodeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="지역 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {areaCodes.map((area) => (
              <SelectItem key={area.code} value={area.code}>
                {area.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 관광 타입 필터 */}
      <div className="flex items-center gap-2 min-w-[200px] shrink-0">
        <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select
          value={currentContentTypeId ?? "all"}
          onValueChange={handleContentTypeChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="관광 타입 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            {Object.entries(CONTENT_TYPE).map(([key, value]) => (
              <SelectItem key={value} value={value}>
                {CONTENT_TYPE_NAMES[value as ContentTypeId]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
