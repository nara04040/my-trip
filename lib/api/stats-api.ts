/**
 * @file stats-api.ts
 * @description 통계 대시보드용 데이터 수집 함수들
 *
 * 통계 대시보드 페이지에서 사용할 데이터를 수집하는 함수들을 제공합니다.
 * 지역별 통계, 타입별 통계, 통계 요약 정보를 조회합니다.
 *
 * 주요 기능:
 * 1. getRegionStats(): 지역별 관광지 개수 집계
 * 2. getTypeStats(): 타입별 관광지 개수 및 비율 집계
 * 3. getStatsSummary(): 전체 통계 요약 정보 생성
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.6 통계 대시보드)
 * @see {@link /docs/TODO.md} - 작업 목록 (Phase 4.3)
 * @see {@link /lib/types/stats.ts} - 통계 타입 정의
 * @see {@link /lib/api/tour-api.ts} - 한국관광공사 API 호출 함수들
 */

import {
  getAreaCodes,
  getAreaBasedListWithPagination,
} from "@/lib/api/tour-api";
import type {
  RegionStats,
  TypeStats,
  StatsSummary,
} from "@/lib/types/stats";
import {
  CONTENT_TYPE,
  CONTENT_TYPE_NAMES,
  type ContentTypeId,
} from "@/lib/types/tour";

/**
 * 모든 관광 타입 코드 배열
 */
const ALL_CONTENT_TYPE_IDS: ContentTypeId[] = [
  CONTENT_TYPE.TOUR_SPOT,
  CONTENT_TYPE.CULTURE,
  CONTENT_TYPE.FESTIVAL,
  CONTENT_TYPE.TOUR_COURSE,
  CONTENT_TYPE.LEISURE,
  CONTENT_TYPE.LODGING,
  CONTENT_TYPE.SHOPPING,
  CONTENT_TYPE.RESTAURANT,
];

/**
 * 지역별 관광지 통계 조회
 *
 * 모든 시/도별 관광지 개수를 집계하여 반환합니다.
 * 각 지역별로 병렬로 API를 호출하여 성능을 최적화합니다.
 *
 * @returns 지역별 통계 배열
 * @throws 전체 지역 코드 조회 실패 시 에러 throw
 *
 * @example
 * ```typescript
 * const regionStats = await getRegionStats();
 * // [
 * //   { areaCode: "1", areaName: "서울", count: 1234 },
 * //   { areaCode: "6", areaName: "부산", count: 987 },
 * //   ...
 * // ]
 * ```
 */
export async function getRegionStats(): Promise<RegionStats[]> {
  console.log("📍 지역별 통계 수집 시작");

  try {
    // 모든 지역 코드 조회 (시/도 단위)
    const areaCodes = await getAreaCodes(50, 1);

    if (areaCodes.length === 0) {
      console.warn("⚠️ 지역 코드가 없습니다.");
      return [];
    }

    console.log(`📍 ${areaCodes.length}개 지역 코드 조회 완료`);

    // 각 지역별로 병렬로 API 호출 (totalCount만 필요하므로 numOfRows=1)
    const regionStatsPromises = areaCodes.map(async (area) => {
      try {
        const result = await getAreaBasedListWithPagination(
          area.code,
          undefined, // contentTypeId: 전체 타입
          1, // numOfRows: totalCount만 필요
          1 // pageNo: 첫 페이지만
        );

        return {
          areaCode: area.code,
          areaName: area.name,
          count: result.totalCount,
        } as RegionStats;
      } catch (error) {
        // 개별 지역 조회 실패 시 로그만 남기고 count=0으로 처리
        console.error(
          `❌ 지역 ${area.code} (${area.name}) 조회 실패:`,
          error instanceof Error ? error.message : error
        );
        return {
          areaCode: area.code,
          areaName: area.name,
          count: 0,
        } as RegionStats;
      }
    });

    // 모든 Promise가 완료될 때까지 대기 (실패해도 계속 진행)
    const results = await Promise.allSettled(regionStatsPromises);

    // 성공한 결과만 필터링
    const regionStats: RegionStats[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        regionStats.push(result.value);
      } else {
        console.error("❌ 지역 통계 수집 실패:", result.reason);
      }
    }

    // count 기준 내림차순 정렬
    regionStats.sort((a, b) => b.count - a.count);

    console.log(
      `✅ 지역별 통계 수집 완료: ${regionStats.length}개 지역, 총 ${regionStats.reduce((sum, r) => sum + r.count, 0)}개 관광지`
    );

    return regionStats;
  } catch (error) {
    console.error("❌ 지역별 통계 수집 중 에러 발생:", error);
    throw new Error(
      `지역별 통계 수집 실패: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * 관광 타입별 통계 조회
 *
 * 모든 관광 타입별 관광지 개수와 전체 대비 비율을 집계하여 반환합니다.
 * 각 타입별로 병렬로 API를 호출하여 성능을 최적화합니다.
 *
 * @returns 타입별 통계 배열
 * @throws 타입별 통계 수집 실패 시 에러 throw
 *
 * @example
 * ```typescript
 * const typeStats = await getTypeStats();
 * // [
 * //   { contentTypeId: "12", typeName: "관광지", count: 5000, percentage: 35.5 },
 * //   { contentTypeId: "39", typeName: "음식점", count: 4000, percentage: 28.3 },
 * //   ...
 * // ]
 * ```
 */
export async function getTypeStats(): Promise<TypeStats[]> {
  console.log("🎯 타입별 통계 수집 시작");

  try {
    // 모든 지역 코드 조회 (각 지역별로 타입 통계를 집계하기 위해)
    const areaCodes = await getAreaCodes(50, 1);

    if (areaCodes.length === 0) {
      console.warn("⚠️ 지역 코드가 없습니다.");
      return ALL_CONTENT_TYPE_IDS.map((contentTypeId) => ({
        contentTypeId,
        typeName: CONTENT_TYPE_NAMES[contentTypeId],
        count: 0,
        percentage: 0,
      }));
    }

    // 각 타입별로 모든 지역의 totalCount를 합산
    const typeStatsPromises = ALL_CONTENT_TYPE_IDS.map(async (contentTypeId) => {
      try {
        // 각 지역별로 해당 타입의 totalCount를 조회
        const regionCountPromises = areaCodes.map(async (area) => {
          try {
            const result = await getAreaBasedListWithPagination(
              area.code,
              contentTypeId,
              1, // numOfRows: totalCount만 필요
              1 // pageNo: 첫 페이지만
            );
            return result.totalCount;
          } catch (error) {
            // 개별 지역 조회 실패 시 0으로 처리
            console.error(
              `❌ 타입 ${contentTypeId} 지역 ${area.code} (${area.name}) 조회 실패:`,
              error instanceof Error ? error.message : error
            );
            return 0;
          }
        });

        // 모든 지역의 totalCount 합산
        const regionCounts = await Promise.allSettled(regionCountPromises);
        const totalCount = regionCounts.reduce((sum, result) => {
          if (result.status === "fulfilled") {
            return sum + result.value;
          }
          return sum;
        }, 0);

        return {
          contentTypeId,
          count: totalCount,
        };
      } catch (error) {
        // 개별 타입 조회 실패 시 로그만 남기고 count=0으로 처리
        console.error(
          `❌ 타입 ${contentTypeId} 조회 실패:`,
          error instanceof Error ? error.message : error
        );
        return {
          contentTypeId,
          count: 0,
        };
      }
    });

    // 모든 Promise가 완료될 때까지 대기 (실패해도 계속 진행)
    const results = await Promise.allSettled(typeStatsPromises);

    // 성공한 결과만 필터링
    const typeStatsData: Array<{ contentTypeId: ContentTypeId; count: number }> =
      [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        typeStatsData.push(result.value);
      } else {
        console.error("❌ 타입 통계 수집 실패:", result.reason);
      }
    }

    // 전체 관광지 수 계산 (모든 타입의 count 합)
    // 주의: 타입별 count의 합은 정확한 전체 개수가 아닐 수 있음
    // (같은 관광지가 여러 타입에 포함될 수 있으므로)
    // 하지만 통계 목적으로는 각 타입의 비율 계산에 사용
    const totalCount = typeStatsData.reduce((sum, t) => sum + t.count, 0);

    // TypeStats[] 형태로 변환 (비율 계산 포함)
    const typeStats: TypeStats[] = typeStatsData.map((data) => {
      const percentage =
        totalCount > 0 ? (data.count / totalCount) * 100 : 0;

      return {
        contentTypeId: data.contentTypeId,
        typeName: CONTENT_TYPE_NAMES[data.contentTypeId],
        count: data.count,
        percentage: Math.round(percentage * 100) / 100, // 소수점 둘째 자리까지 반올림
      };
    });

    // count 기준 내림차순 정렬
    typeStats.sort((a, b) => b.count - a.count);

    console.log(
      `✅ 타입별 통계 수집 완료: ${typeStats.length}개 타입, 총 ${totalCount}개 관광지 (타입별 합계)`
    );

    return typeStats;
  } catch (error) {
    console.error("❌ 타입별 통계 수집 중 에러 발생:", error);
    throw new Error(
      `타입별 통계 수집 실패: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * 통계 요약 정보 생성
 *
 * 전체 통계 요약 정보를 생성하여 반환합니다.
 * 지역별 통계와 타입별 통계를 병렬로 조회하고,
 * Top 3 지역과 Top 3 타입을 추출합니다.
 *
 * @returns 통계 요약 정보
 * @throws 통계 수집 실패 시 에러 throw
 *
 * @example
 * ```typescript
 * const summary = await getStatsSummary();
 * // {
 * //   totalCount: 15000,
 * //   topRegions: [
 * //     { areaCode: "1", areaName: "서울", count: 1234 },
 * //     { areaCode: "6", areaName: "부산", count: 987 },
 * //     { areaCode: "39", areaName: "제주", count: 765 }
 * //   ],
 * //   topTypes: [
 * //     { contentTypeId: "12", typeName: "관광지", count: 5000, percentage: 35.5 },
 * //     { contentTypeId: "39", typeName: "음식점", count: 4000, percentage: 28.3 },
 * //     { contentTypeId: "14", typeName: "문화시설", count: 3000, percentage: 21.2 }
 * //   ],
 * //   lastUpdated: new Date()
 * // }
 * ```
 */
export async function getStatsSummary(): Promise<StatsSummary> {
  console.log("📊 통계 요약 정보 수집 시작");

  try {
    // 지역별 통계와 타입별 통계를 병렬로 조회
    const [regionStats, typeStats] = await Promise.all([
      getRegionStats(),
      getTypeStats(),
    ]);

    // 전체 관광지 수 계산
    // 지역별 합계를 사용 (타입별 합계는 중복 포함 가능)
    const totalCount = regionStats.reduce((sum, r) => sum + r.count, 0);

    // Top 3 지역 추출 (이미 count 기준 내림차순 정렬되어 있음)
    const topRegions = regionStats.slice(0, 3);

    // Top 3 타입 추출 (이미 count 기준 내림차순 정렬되어 있음)
    const topTypes = typeStats.slice(0, 3);

    const summary: StatsSummary = {
      totalCount,
      topRegions,
      topTypes,
      lastUpdated: new Date(),
    };

    console.log(
      `✅ 통계 요약 정보 수집 완료: 전체 ${totalCount}개 관광지, Top 3 지역, Top 3 타입`
    );

    return summary;
  } catch (error) {
    console.error("❌ 통계 요약 정보 수집 중 에러 발생:", error);
    throw new Error(
      `통계 요약 정보 수집 실패: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

