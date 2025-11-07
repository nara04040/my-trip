/**
 * @file stats.ts
 * @description 통계 대시보드 관련 타입 정의
 *
 * 통계 대시보드 페이지에서 사용하는 타입들을 정의합니다.
 * 지역별 통계, 타입별 통계, 통계 요약 등의 데이터 구조를 포함합니다.
 *
 * 주요 타입:
 * - RegionStats: 지역별 관광지 통계
 * - TypeStats: 관광 타입별 통계
 * - StatsSummary: 통계 요약 정보
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.6 통계 대시보드)
 * @see {@link /docs/TODO.md} - 작업 목록 (Phase 4.2)
 * @see {@link /lib/types/tour.ts} - 관광지 관련 타입 정의
 */

import type { ContentTypeId } from "./tour";

/**
 * 지역별 관광지 통계
 *
 * 각 시/도별 관광지 개수를 나타내는 통계 정보입니다.
 * 지역 코드, 지역명, 관광지 개수를 포함합니다.
 *
 * @example
 * ```typescript
 * const seoulStats: RegionStats = {
 *   areaCode: "1",
 *   areaName: "서울",
 *   count: 1234
 * };
 * ```
 */
export interface RegionStats {
  /** 지역 코드 (시/도 단위) */
  areaCode: string;
  /** 지역명 (예: "서울", "부산", "제주") */
  areaName: string;
  /** 해당 지역의 관광지 개수 */
  count: number;
}

/**
 * 관광 타입별 통계
 *
 * 각 관광 타입별 관광지 개수와 전체 대비 비율을 나타내는 통계 정보입니다.
 * 타입 코드, 타입명, 개수, 비율을 포함합니다.
 *
 * @example
 * ```typescript
 * const tourSpotStats: TypeStats = {
 *   contentTypeId: "12",
 *   typeName: "관광지",
 *   count: 5000,
 *   percentage: 35.5
 * };
 * ```
 */
export interface TypeStats {
  /** 타입 코드 (12: 관광지, 14: 문화시설, 15: 축제/행사, 25: 여행코스, 28: 레포츠, 32: 숙박, 38: 쇼핑, 39: 음식점) */
  contentTypeId: ContentTypeId;
  /** 타입명 (예: "관광지", "문화시설", "축제/행사") */
  typeName: string;
  /** 해당 타입의 관광지 개수 */
  count: number;
  /** 전체 대비 비율 (백분율, 0-100) */
  percentage: number;
}

/**
 * 통계 요약 정보
 *
 * 전체 관광지 통계를 요약한 정보입니다.
 * 전체 개수, 상위 3개 지역, 상위 3개 타입, 마지막 업데이트 시간을 포함합니다.
 *
 * @example
 * ```typescript
 * const summary: StatsSummary = {
 *   totalCount: 15000,
 *   topRegions: [
 *     { areaCode: "1", areaName: "서울", count: 1234 },
 *     { areaCode: "6", areaName: "부산", count: 987 },
 *     { areaCode: "39", areaName: "제주", count: 765 }
 *   ],
 *   topTypes: [
 *     { contentTypeId: "12", typeName: "관광지", count: 5000, percentage: 35.5 },
 *     { contentTypeId: "39", typeName: "음식점", count: 4000, percentage: 28.3 },
 *     { contentTypeId: "14", typeName: "문화시설", count: 3000, percentage: 21.2 }
 *   ],
 *   lastUpdated: new Date()
 * };
 * ```
 */
export interface StatsSummary {
  /** 전체 관광지 수 */
  totalCount: number;
  /** 상위 3개 지역 (개수 기준 정렬) */
  topRegions: RegionStats[];
  /** 상위 3개 타입 (개수 기준 정렬) */
  topTypes: TypeStats[];
  /** 마지막 업데이트 시간 */
  lastUpdated: Date;
}

