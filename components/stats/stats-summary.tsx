/**
 * @file stats-summary.tsx
 * @description 통계 요약 카드 컴포넌트
 *
 * 통계 대시보드에서 전체 관광지 수, Top 3 지역, Top 3 타입, 마지막 업데이트 시간을
 * 카드 형태로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 전체 관광지 수 표시 (큰 숫자로 강조)
 * 2. Top 3 지역 표시 (지역명 + 개수)
 * 3. Top 3 타입 표시 (타입명 + 개수)
 * 4. 마지막 업데이트 시간 표시 (상대 시간)
 * 5. 로딩 상태 처리 (Skeleton UI)
 * 6. 반응형 디자인
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.6.3 통계 요약 카드)
 * @see {@link /docs/TODO.md} - 작업 목록 (Phase 4.4)
 * @see {@link /lib/types/stats.ts} - 통계 타입 정의
 */

"use client";

import { Globe, MapPin, Tag, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { StatsSummary } from "@/lib/types/stats";

interface StatsSummaryProps {
  /** 통계 요약 정보 */
  summary?: StatsSummary;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 상대 시간 표시 함수
 *
 * 현재 시간과의 차이를 계산하여 상대 시간 문자열을 반환합니다.
 *
 * @param date 표시할 날짜
 * @returns 상대 시간 문자열 (예: "방금 전", "5분 전", "1시간 전", "3일 전", "2025년 1월 15일")
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "방금 전";
  } else if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  } else if (diffHours < 24) {
    return `${diffHours}시간 전`;
  } else if (diffDays < 7) {
    return `${diffDays}일 전`;
  } else {
    // 7일 이상: 절대 시간 표시
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
  }
}

/**
 * 통계 요약 카드 스켈레톤 컴포넌트
 * 전체 1개 + Top 3 지역 3개 + Top 3 타입 3개 + 업데이트 시간 1개 = 총 8개
 */
function StatsSummarySkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="p-6 border rounded-lg bg-card shadow-sm"
        >
          <Skeleton className="h-5 w-24 mb-3" />
          <Skeleton className={index === 0 ? "h-10 w-32 mb-2" : "h-8 w-32 mb-2"} />
          {index === 0 && <Skeleton className="h-4 w-40" />}
        </div>
      ))}
    </div>
  );
}

/**
 * 통계 요약 카드 컴포넌트
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <StatsSummary summary={statsSummary} />
 *
 * // 로딩 상태
 * <StatsSummary isLoading={true} />
 *
 * // 데이터 없음
 * <StatsSummary summary={undefined} />
 * ```
 */
export function StatsSummary({
  summary,
  isLoading = false,
  className,
}: StatsSummaryProps) {
  // 로딩 상태
  if (isLoading || !summary) {
    return (
      <div className={cn("", className)}>
        <StatsSummarySkeleton />
      </div>
    );
  }

  const { totalCount, topRegions, topTypes, lastUpdated } = summary;

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}>
      {/* 전체 관광지 수 카드 */}
      <div className="p-6 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="h-5 w-5 text-primary" />
          <p className="text-sm text-muted-foreground">전체 관광지</p>
        </div>
        <p className="text-4xl font-bold text-primary mb-1">
          {totalCount.toLocaleString("ko-KR")}
        </p>
        <p className="text-xs text-muted-foreground">전국 관광지 수</p>
      </div>

      {/* Top 3 지역 카드 */}
      {topRegions.slice(0, 3).map((region, index) => (
        <div
          key={region.areaCode}
          className="p-6 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              Top {index + 1} 지역
            </p>
          </div>
          <p className="text-2xl font-bold mb-1">{region.areaName}</p>
          <p className="text-sm text-muted-foreground">
            {region.count.toLocaleString("ko-KR")}개
          </p>
        </div>
      ))}

      {/* Top 3 타입 카드 */}
      {topTypes.slice(0, 3).map((type, index) => (
        <div
          key={type.contentTypeId}
          className="p-6 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-2 mb-3">
            <Tag className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              Top {index + 1} 타입
            </p>
          </div>
          <p className="text-2xl font-bold mb-1">{type.typeName}</p>
          <p className="text-sm text-muted-foreground">
            {type.count.toLocaleString("ko-KR")}개
          </p>
        </div>
      ))}

      {/* 마지막 업데이트 시간 카드 */}
      <div className="p-6 border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-5 w-5 text-primary" />
          <p className="text-sm text-muted-foreground">마지막 업데이트</p>
        </div>
        <p className="text-lg font-semibold mb-1">
          {formatRelativeTime(lastUpdated)}
        </p>
        <p className="text-xs text-muted-foreground">
          {lastUpdated.toLocaleString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

