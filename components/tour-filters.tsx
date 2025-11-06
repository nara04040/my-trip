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
import { MapPin, Tag, ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AreaCode, ContentTypeId, SortOption } from "@/lib/types/tour";
import { CONTENT_TYPE, CONTENT_TYPE_NAMES, SORT_OPTION_NAMES } from "@/lib/types/tour";
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

  // 현재 필터 값 읽기 (areaCode가 없으면 "all" - 전체 지역)
  const currentAreaCode = searchParams.get("areaCode") || "all";
  const contentTypeIdParam = searchParams.get("contentTypeId");
  const currentContentTypeId = contentTypeIdParam || undefined;
  const currentSort = (searchParams.get("sort") as SortOption) || "latest";

  /**
   * 필터 변경 핸들러
   * URL searchParams를 업데이트하여 Server Component에서 필터링된 결과를 가져옵니다.
   * 검색 키워드와 다른 필터 파라미터를 유지합니다.
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
    
    // keyword가 있으면 유지 (검색 + 필터 조합)
    const keyword = searchParams.get("keyword");
    if (keyword) {
      params.set("keyword", keyword);
    }
    
    // sort가 있으면 유지
    const sort = searchParams.get("sort");
    if (sort) {
      params.set("sort", sort);
    }
    
    // pageNo는 필터 변경 시 1로 리셋
    params.delete("pageNo");
    
    router.push(`/?${params.toString()}`);
  };

  const handleContentTypeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "all" || !value) {
      params.delete("contentTypeId");
    } else {
      params.set("contentTypeId", value);
    }
    
    // areaCode가 있으면 유지 (없으면 전체 지역)
    const areaCode = searchParams.get("areaCode");
    if (areaCode) {
      params.set("areaCode", areaCode);
    }
    
    // keyword가 있으면 유지 (검색 + 필터 조합)
    const keyword = searchParams.get("keyword");
    if (keyword) {
      params.set("keyword", keyword);
    }
    
    // sort가 있으면 유지
    const sort = searchParams.get("sort");
    if (sort) {
      params.set("sort", sort);
    }
    
    // pageNo는 필터 변경 시 1로 리셋
    params.delete("pageNo");
    
    router.push(`/?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "latest" || !value) {
      params.set("sort", "latest");
    } else {
      params.set("sort", value);
    }
    
    // 기존 필터 파라미터 유지
    const areaCode = searchParams.get("areaCode");
    if (areaCode) {
      params.set("areaCode", areaCode);
    }
    
    const contentTypeId = searchParams.get("contentTypeId");
    if (contentTypeId) {
      params.set("contentTypeId", contentTypeId);
    }
    
    const keyword = searchParams.get("keyword");
    if (keyword) {
      params.set("keyword", keyword);
    }
    
    // pageNo는 정렬 변경 시 1로 리셋
    params.delete("pageNo");
    
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

      {/* 정렬 필터 */}
      <div className="flex items-center gap-2 min-w-[200px] shrink-0">
        <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="정렬 기준" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SORT_OPTION_NAMES).map(([key, name]) => (
              <SelectItem key={key} value={key}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
