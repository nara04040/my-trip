/**
 * @file map-legend.tsx
 * @description 지도 범례 컴포넌트
 *
 * 네이버 지도에 표시되는 관광 타입별 마커 색상을 설명하는 범례 컴포넌트입니다.
 * 지도 우측 하단에 표시되며, 각 관광 타입의 색상과 이름을 보여줍니다.
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /lib/utils/marker-colors.ts} - 마커 색상 유틸리티
 */

"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MARKER_COLORS, MARKER_BORDER_COLORS } from "@/lib/utils/marker-colors";
import { CONTENT_TYPE, CONTENT_TYPE_NAMES } from "@/lib/types/tour";
import type { ContentTypeId } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface MapLegendProps {
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 지도 범례 컴포넌트
 *
 * 관광 타입별 마커 색상을 표시하는 범례입니다.
 * 토글 버튼으로 접을 수 있습니다.
 *
 * @example
 * ```tsx
 * <MapLegend />
 * ```
 */
export function MapLegend({ className }: MapLegendProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // 관광 타입 목록 (순서대로)
  const contentTypes: ContentTypeId[] = [
    CONTENT_TYPE.TOUR_SPOT,
    CONTENT_TYPE.CULTURE,
    CONTENT_TYPE.FESTIVAL,
    CONTENT_TYPE.TOUR_COURSE,
    CONTENT_TYPE.LEISURE,
    CONTENT_TYPE.LODGING,
    CONTENT_TYPE.SHOPPING,
    CONTENT_TYPE.RESTAURANT,
  ];

  return (
    <div
      className={cn(
        "absolute bottom-4 right-4 z-10 bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg",
        "max-w-[200px] transition-all duration-200",
        className
      )}
    >
      {/* 헤더 (토글 버튼) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-2 hover:bg-muted/50 transition-colors rounded-t-lg"
        aria-label={isExpanded ? "범례 접기" : "범례 펼치기"}
        aria-expanded={isExpanded}
      >
        <span className="text-sm font-semibold">범례</span>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronUp className="h-4 w-4" />
        )}
      </button>

      {/* 범례 목록 */}
      {isExpanded && (
        <div className="p-2 space-y-1.5 border-t">
          {contentTypes.map((typeId) => {
            const color = MARKER_COLORS[typeId];
            const borderColor = MARKER_BORDER_COLORS[typeId];
            const name = CONTENT_TYPE_NAMES[typeId];

            return (
              <div
                key={typeId}
                className="flex items-center gap-2 text-xs"
                role="listitem"
              >
                {/* 마커 색상 표시 */}
                <div
                  className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                  style={{
                    backgroundColor: color,
                    borderColor: borderColor,
                  }}
                  aria-label={`${name} 마커 색상`}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-white opacity-80 m-auto mt-0.5"
                    style={{ marginTop: "2px" }}
                  />
                </div>
                {/* 타입 이름 */}
                <span className="text-muted-foreground">{name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

