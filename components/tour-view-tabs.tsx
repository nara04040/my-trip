/**
 * @file tour-view-tabs.tsx
 * @description 관광지 목록/지도 전환 탭 컴포넌트
 *
 * 모바일 환경에서 리스트 뷰와 지도 뷰를 전환하는 탭 컴포넌트입니다.
 * 데스크톱에서는 사용하지 않고, 모바일에서만 표시됩니다.
 *
 * DESIGN.md 요구사항:
 * - 모바일: 탭 형태로 리스트/지도 전환
 * - 탭: "📋 목록" / "🗺️ 지도"
 *
 * @see {@link /docs/reference/design/DESIGN.md} - 디자인 가이드
 */

"use client";

import { List, MapPin } from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface TourViewTabsProps {
  /** 목록 탭 내용 */
  listContent: React.ReactNode;
  /** 지도 탭 내용 */
  mapContent: React.ReactNode;
  /** 기본 선택된 탭 (기본값: "list") */
  defaultValue?: "list" | "map";
  /** 탭 변경 핸들러 */
  onTabChange?: (value: string) => void;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 관광지 목록/지도 전환 탭 컴포넌트
 *
 * @example
 * ```tsx
 * <TourViewTabs
 *   listContent={<TourList tours={tours} />}
 *   mapContent={<NaverMap tours={tours} />}
 *   defaultValue="list"
 * />
 * ```
 */
export function TourViewTabs({
  listContent,
  mapContent,
  defaultValue = "list",
  onTabChange,
  className,
}: TourViewTabsProps) {
  return (
    <Tabs
      defaultValue={defaultValue}
      onValueChange={onTabChange}
      className={cn("w-full", className)}
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="list" className="flex items-center gap-2">
          <List className="h-4 w-4" />
          <span>목록</span>
        </TabsTrigger>
        <TabsTrigger value="map" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>지도</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="list" className="mt-4">
        {listContent}
      </TabsContent>
      <TabsContent value="map" className="mt-4">
        {mapContent}
      </TabsContent>
    </Tabs>
  );
}

