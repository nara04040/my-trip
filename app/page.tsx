/**
 * @file page.tsx
 * @description 홈페이지 (관광지 목록)
 *
 * 관광지 목록을 표시하는 홈페이지입니다.
 * Server Component에서 한국관광공사 API를 호출하여 실제 데이터를 가져옵니다.
 *
 * 필터 기능:
 * - 지역 필터 (시/도 단위, URL 파라미터: areaCode)
 * - 관광 타입 필터 (URL 파라미터: contentTypeId)
 * - 반려동물 동반 가능 필터 (URL 파라미터: pet=true)
 *
 * 레이아웃:
 * - 데스크톱 (lg 이상): 리스트(좌측 50%) | 지도(우측 50%) 동시 표시
 * - 모바일 (lg 미만): 탭으로 리스트/지도 전환
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /docs/TODO.md} - 작업 목록
 * @see {@link /docs/reference/design/DESIGN.md} - 디자인 가이드
 */

import { Suspense } from "react";
import { TourFilters } from "@/components/tour-filters";
import { TourPagination } from "@/components/tour-pagination";
import { HomeTourView } from "@/components/home-tour-view";
import {
  getAreaBasedListWithPagination,
  getAreaCodes,
  searchKeywordWithPagination,
  getDetailPetTour,
} from "@/lib/api/tour-api";
import type { ContentTypeId, SortOption, TourItem, PetTourInfo } from "@/lib/types/tour";
import { sortToursBy } from "@/lib/utils";

/**
 * 반려동물 동반 가능 여부 판단 함수
 * PetTourInfo 객체의 실제 API 응답 필드들을 확인하여 반려동물 동반 가능 여부를 판단합니다.
 */
function isPetFriendly(petInfo: PetTourInfo | null): boolean {
  if (!petInfo) {
    return false;
  }

  // acmpyTypeCd로 판단 (가장 확실한 필드)
  const acmpyTypeCd = petInfo.acmpyTypeCd?.trim();
  if (acmpyTypeCd) {
    // "전구역 동반가능" 또는 "일부구역 동반가능"이면 true
    if (acmpyTypeCd.includes("동반가능")) {
      return true;
    }
    // "동반불가"면 false
    if (acmpyTypeCd.includes("동반불가")) {
      return false;
    }
  }

  // acmpyPsblCpam으로 판단
  const acmpyPsblCpam = petInfo.acmpyPsblCpam?.trim();
  if (acmpyPsblCpam && acmpyPsblCpam.includes("동반 가능")) {
    return true;
  }

  // acmpyNeedMtr가 있으면 동반 가능 (조건부)
  if (petInfo.acmpyNeedMtr?.trim()) {
    return true;
  }

  // 레거시 chkpetleash 필드도 확인 (호환성)
  const chkpetleash = petInfo.chkpetleash?.trim();
  if (chkpetleash) {
    const cleaned = chkpetleash.toLowerCase();
    if (cleaned.includes("불가능") || cleaned.includes("불가")) {
      return false;
    }
    if (
      cleaned.includes("가능") || 
      cleaned.includes("제한") || 
      cleaned.includes("허용") ||
      cleaned.includes("ok") ||
      cleaned.includes("yes")
    ) {
      return true;
    }
  }

  return false;
}

/**
 * 반려동물 동반 가능 관광지 필터링 함수
 * 각 관광지에 대해 detailPetTour2 API를 호출하여 반려동물 정보를 확인하고 필터링합니다.
 */
async function filterToursByPetAvailability(
  tours: TourItem[]
): Promise<TourItem[]> {
  if (tours.length === 0) {
    return [];
  }

  // 디버깅: 처음 5개만 상세 로그 출력
  const debugCount = Math.min(5, tours.length);
  console.log(`🐾 반려동물 정보 확인 시작: ${tours.length}개 관광지`);

  // 각 관광지에 대해 병렬로 반려동물 정보 확인
  const petInfoPromises = tours.map(async (tour, index) => {
    try {
      const petInfo = await getDetailPetTour(tour.contentid);
      const friendly = isPetFriendly(petInfo);
      
      // 처음 5개만 상세 로그
      if (index < debugCount) {
        console.log(`[${index + 1}] ${tour.title} (${tour.contentid}):`, {
          hasPetInfo: !!petInfo,
          acmpyTypeCd: petInfo?.acmpyTypeCd || "없음",
          acmpyPsblCpam: petInfo?.acmpyPsblCpam || "없음",
          acmpyNeedMtr: petInfo?.acmpyNeedMtr || "없음",
          isPetFriendly: friendly,
          fullPetInfo: petInfo ? JSON.stringify(petInfo, null, 2) : "null",
        });
      }
      
      return {
        tour,
        isPetFriendly: friendly,
        petInfo, // 디버깅용
      };
    } catch (error) {
      // API 호출 실패 시 해당 관광지는 제외 (false 반환)
      if (index < debugCount) {
        console.error(
          `[${index + 1}] Failed to fetch pet info for ${tour.contentid} (${tour.title}):`,
          error
        );
      }
      return {
        tour,
        isPetFriendly: false,
        petInfo: null,
      };
    }
  });

  // 모든 Promise가 완료될 때까지 대기 (실패해도 계속 진행)
  const results = await Promise.allSettled(petInfoPromises);

  // 반려동물 동반 가능한 관광지만 필터링
  const petFriendlyTours: TourItem[] = [];
  let hasPetInfoCount = 0;
  let petFriendlyCount = 0;
  const petInfoDetails: Array<{ title: string; contentid: string; petInfo: PetTourInfo }> = [];
  
  for (const result of results) {
    if (result.status === "fulfilled") {
      const { tour, isPetFriendly, petInfo } = result.value;
      if (petInfo) {
        hasPetInfoCount++;
        // 반려동물 정보가 있는 관광지의 상세 정보 수집
        petInfoDetails.push({
          title: tour.title,
          contentid: tour.contentid,
          petInfo,
        });
      }
      if (isPetFriendly) {
        petFriendlyCount++;
        petFriendlyTours.push(tour);
      }
    }
  }

  // 반려동물 정보가 있는 관광지들의 상세 로그 출력
  if (petInfoDetails.length > 0) {
    console.log(`\n🐾 반려동물 정보가 있는 관광지 (${petInfoDetails.length}개):`);
    petInfoDetails.forEach((detail, index) => {
      console.log(`[${index + 1}] ${detail.title} (${detail.contentid}):`);
      console.log(`  - acmpyTypeCd: "${detail.petInfo.acmpyTypeCd || "없음"}"`);
      console.log(`  - acmpyPsblCpam: "${detail.petInfo.acmpyPsblCpam || "없음"}"`);
      console.log(`  - acmpyNeedMtr: "${detail.petInfo.acmpyNeedMtr || "없음"}"`);
      console.log(`  - isPetFriendly: ${isPetFriendly(detail.petInfo)}`);
      console.log(`  - 전체 정보:`, JSON.stringify(detail.petInfo, null, 2));
    });
  }

  console.log(`\n🐾 반려동물 정보 확인 완료:`, {
    total: tours.length,
    hasPetInfo: hasPetInfoCount,
    petFriendly: petFriendlyCount,
  });

  return petFriendlyTours;
}

interface HomeProps {
  searchParams: Promise<{
    keyword?: string;
    areaCode?: string;
    contentTypeId?: string;
    sort?: string;
    pageNo?: string;
    pet?: string;
  }>;
}

/**
 * 홈페이지 컴포넌트
 *
 * Server Component에서 한국관광공사 API를 호출하여 관광지 목록을 가져옵니다.
 * URL searchParams를 통해 필터 및 검색 파라미터를 받아 필터링/검색된 결과를 표시합니다.
 *
 * 검색 모드:
 * - keyword가 있으면: searchKeyword() API 호출
 * - keyword가 없으면: getAreaBasedList() API 호출
 *
 * @param searchParams URL 쿼리 파라미터
 *   - keyword: 검색 키워드 (선택 사항)
 *   - areaCode: 지역코드 (선택 사항, 없으면 전체 지역 조회)
 *   - contentTypeId: 관광 타입 ID (기본값: undefined - 전체)
 *   - pet: 반려동물 동반 가능 필터 (true일 때만 필터링)
 */
export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const keyword = params.keyword?.trim();
  // areaCode가 없으면 undefined (전체 지역 조회)
  const areaCode = params.areaCode || undefined;
  const contentTypeId = params.contentTypeId
    ? (params.contentTypeId as ContentTypeId)
    : undefined;
  const sort = (params.sort as SortOption) || "latest";
  const pageNo = params.pageNo ? parseInt(params.pageNo, 10) : 1;
  const petFilter = params.pet === "true";

  // 검색 모드 여부
  const isSearchMode = !!keyword;

  // 지역 목록 prefetch (필터 컴포넌트에서 사용)
  let areaCodes;
  try {
    areaCodes = await getAreaCodes(50, 1);
  } catch (err) {
    console.error("Failed to fetch area codes:", err);
    areaCodes = [];
  }

  // 관광지 목록 조회 (검색 또는 필터)
  let tours;
  let totalCount = 0;
  let error: Error | null = null;

  try {
    if (isSearchMode) {
      // 검색 모드: searchKeywordWithPagination API 호출
      const result = await searchKeywordWithPagination(
        keyword,
        areaCode,
        contentTypeId,
        20,
        pageNo
      );
      tours = result.items;
      totalCount = result.totalCount;
    } else {
      // 필터 모드: getAreaBasedListWithPagination API 호출
      const result = await getAreaBasedListWithPagination(
        areaCode,
        contentTypeId,
        20,
        pageNo
      );
      tours = result.items;
      totalCount = result.totalCount;
    }

    // 반려동물 필터 적용
    if (petFilter) {
      console.log("🐾 반려동물 필터 적용 중...", tours.length, "개 관광지 확인");
      tours = await filterToursByPetAvailability(tours);
      console.log("🐾 반려동물 동반 가능 관광지:", tours.length, "개");
      // 필터링 후 totalCount 업데이트 (정확한 개수는 알 수 없으므로 현재 개수 사용)
      totalCount = tours.length;
    }

    // 클라이언트 사이드 정렬 (API는 정렬 기능을 직접 지원하지 않음)
    tours = sortToursBy(tours, sort);
  } catch (err) {
    console.error("Failed to fetch tours:", err);
    error = err instanceof Error ? err : new Error("관광지 정보를 불러오는데 실패했습니다.");
    tours = [];
    totalCount = 0;
  }

  // 전체 페이지 수 계산
  const itemsPerPage = 20;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // 검색 결과 개수 표시용 메시지
  const resultMessage = (() => {
    if (isSearchMode) {
      return petFilter
        ? `"${keyword}" 검색 결과 (반려동물 동반 가능): ${tours.length}개`
        : `"${keyword}" 검색 결과: ${tours.length}개`;
    }
    return petFilter
      ? `반려동물 동반 가능 관광지: ${tours.length}개`
      : "한국의 다양한 관광지를 탐색해보세요.";
  })();

  // 빈 상태 메시지
  const emptyMessage = (() => {
    if (isSearchMode) {
      return petFilter
        ? `"${keyword}"에 대한 반려동물 동반 가능한 검색 결과가 없습니다.`
        : `"${keyword}"에 대한 검색 결과가 없습니다.`;
    }
    return petFilter
      ? "반려동물 동반 가능한 관광지가 없습니다."
      : "관광지가 없습니다.";
  })();

  return (
    <main className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {isSearchMode ? "검색 결과" : "관광지 목록"}
        </h1>
        <p className="text-muted-foreground">
          {resultMessage}
        </p>
      </div>

      {/* 필터 컴포넌트 */}
      <div className="mb-6">
        <Suspense fallback={<div className="h-10 animate-pulse bg-muted rounded-lg" />}>
          <TourFilters areaCodes={areaCodes} />
        </Suspense>
      </div>

      {/* 관광지 목록 및 지도 뷰 (리스트-지도 연동 포함) */}
      <div className="mb-6">
        <HomeTourView
          tours={tours}
          error={error}
          emptyMessage={emptyMessage}
        />
      </div>

      {/* 페이지네이션 컴포넌트 (리스트 탭일 때만 표시) */}
      {!error && tours.length > 0 && (
        <Suspense fallback={<div className="h-16 animate-pulse bg-muted rounded-lg mt-6" />}>
          <TourPagination
            currentPage={pageNo}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={totalCount}
          />
        </Suspense>
      )}
    </main>
  );
}
