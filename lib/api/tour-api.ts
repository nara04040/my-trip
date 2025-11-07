/**
 * @file tour-api.ts
 * @description 한국관광공사 API 호출 함수들
 *
 * 한국관광공사 공공 API (KorService2)를 호출하는 함수들을 제공합니다.
 * 모든 API는 공통 파라미터를 포함하며, 에러 처리를 포함합니다.
 *
 * 주요 기능:
 * 1. areaCode2: 지역코드 조회
 * 2. areaBasedList2: 지역 기반 관광정보 조회
 * 3. searchKeyword2: 키워드 검색
 * 4. detailCommon2: 공통 정보 조회
 * 5. detailIntro2: 소개 정보 조회
 * 6. detailImage2: 이미지 목록 조회
 * 7. detailPetTour2: 반려동물 동반 여행 정보 조회
 *
 * @see {@link /docs/PRD.md} - API 명세 문서
 * @see {@link /lib/types/tour.ts} - 타입 정의
 */

import type {
  TourItem,
  TourDetail,
  TourIntro,
  TourImage,
  AreaCode,
  TourApiResponse,
  ContentTypeId,
  PetTourInfo,
} from "@/lib/types/tour";

/**
 * API 기본 URL
 */
const BASE_URL = "https://apis.data.go.kr/B551011/KorService2";

/**
 * API 키 가져오기 (환경변수)
 * NEXT_PUBLIC_TOUR_API_KEY 또는 TOUR_API_KEY 사용
 * 
 * 한국관광공사 API는 serviceKey를 URL 인코딩된 형태로 받습니다.
 * 환경변수에 이미 URL 인코딩된 값(%2F, %3D 등)이 들어있을 수 있으므로,
 * 디코딩한 후 URLSearchParams에서 자동으로 다시 올바르게 인코딩되도록 처리합니다.
 * 
 * 이렇게 하면 이중 인코딩 문제를 방지할 수 있습니다.
 */
function getApiKey(): string {
  const apiKey =
    process.env.NEXT_PUBLIC_TOUR_API_KEY || process.env.TOUR_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Tour API key is missing. Please set NEXT_PUBLIC_TOUR_API_KEY or TOUR_API_KEY environment variable."
    );
  }

  // 환경변수에 URL 인코딩된 값이 들어있을 수 있으므로 디코딩
  // URLSearchParams가 자동으로 다시 올바르게 인코딩해줍니다
  try {
    return decodeURIComponent(apiKey);
  } catch {
    // 디코딩 실패 시 원본 값 반환 (이미 디코딩된 상태일 수 있음)
    return apiKey;
  }
}

/**
 * 공통 파라미터 생성
 */
function getCommonParams(): Record<string, string> {
  return {
    serviceKey: getApiKey(),
    MobileOS: "ETC",
    MobileApp: "MyTrip",
    _type: "json",
  };
}

/**
 * API 호출 유틸리티 함수
 * @param endpoint API 엔드포인트
 * @param params 추가 파라미터
 * @returns API 응답 데이터
 */
async function fetchTourApi<T>(
  endpoint: string,
  params: Record<string, string | number | undefined> = {}
): Promise<TourApiResponse<T>> {
  const commonParams = getCommonParams();

  // undefined 값 제거
  const filteredParams: Record<string, string> = {};
  for (const [key, value] of Object.entries({ ...commonParams, ...params })) {
    if (value !== undefined) {
      filteredParams[key] = String(value);
    }
  }

  // URL 생성
  const queryString = new URLSearchParams(filteredParams).toString();
  const url = `${BASE_URL}${endpoint}?${queryString}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Next.js에서 캐싱 제어 (선택 사항)
      next: { revalidate: 3600 }, // 1시간 캐시
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data: TourApiResponse<T> = await response.json();

    // API 에러 체크 (resultCode가 "0000"이면 성공)
    if (data.response.header.resultCode !== "0000") {
      throw new Error(
        `API error: ${data.response.header.resultCode} - ${data.response.header.resultMsg}`
      );
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch tour API: ${error.message}`);
    }
    throw new Error("Failed to fetch tour API: Unknown error");
  }
}

/**
 * 응답 데이터를 배열로 정규화
 * API는 단일 객체 또는 배열을 반환할 수 있음
 */
function normalizeItem<T>(item: T | T[]): T[] {
  return Array.isArray(item) ? item : [item];
}

/**
 * 지역코드 조회 (areaCode2)
 * 시/도 단위 지역코드를 조회합니다.
 *
 * @param numOfRows 페이지당 항목 수 (기본값: 50)
 * @param pageNo 페이지 번호 (기본값: 1)
 * @returns 지역코드 배열
 */
export async function getAreaCodes(
  numOfRows: number = 50,
  pageNo: number = 1
): Promise<AreaCode[]> {
  const response = await fetchTourApi<AreaCode>("/areaCode2", {
    numOfRows,
    pageNo,
  });

  const items = response.response.body.items;
  if (!items || !items.item) {
    return [];
  }

  return normalizeItem(items.item);
}

/**
 * 지역 기반 관광정보 조회 (내부 함수)
 * 단일 지역에 대한 관광지 목록을 조회합니다.
 *
 * @param areaCode 지역코드 (시/도, 필수)
 * @param contentTypeId 관광 타입 ID (선택 사항)
 * @param numOfRows 페이지당 항목 수
 * @param pageNo 페이지 번호
 * @returns 관광지 목록
 */
async function getAreaBasedListInternal(
  areaCode: string,
  contentTypeId?: ContentTypeId,
  numOfRows: number = 20,
  pageNo: number = 1
): Promise<TourItem[]> {
  const params: Record<string, string | number> = {
    areaCode,
    numOfRows,
    pageNo,
  };

  if (contentTypeId) {
    params.contentTypeId = contentTypeId;
  }

  const response = await fetchTourApi<TourItem>("/areaBasedList2", params);

  const items = response.response.body.items;
  if (!items || !items.item) {
    return [];
  }

  return normalizeItem(items.item);
}

/**
 * 전체 지역 기반 관광정보 조회
 * 모든 지역코드를 순회하여 관광지 목록을 조회하고 결과를 합칩니다.
 *
 * @param contentTypeId 관광 타입 ID (선택 사항, 전체 조회 시 undefined)
 * @param numOfRows 지역당 조회할 항목 수 (기본값: 20)
 * @param pageNo 페이지 번호 (기본값: 1)
 * @returns 관광지 목록 (중복 제거됨)
 */
async function getAllAreasBasedList(
  contentTypeId?: ContentTypeId,
  numOfRows: number = 20,
  pageNo: number = 1
): Promise<TourItem[]> {
  try {
    // 모든 지역코드 조회
    const areaCodes = await getAreaCodes(50, 1);

    if (areaCodes.length === 0) {
      return [];
    }

    // 모든 지역에 대해 병렬로 API 호출
    const promises = areaCodes.map((area) =>
      getAreaBasedListInternal(area.code, contentTypeId, numOfRows, pageNo).catch(
        (error) => {
          // 개별 지역 조회 실패 시 빈 배열 반환 (다른 지역은 계속 진행)
          console.error(
            `Failed to fetch tours for area ${area.code} (${area.name}):`,
            error
          );
          return [];
        }
      )
    );

    const results = await Promise.all(promises);

    // 모든 결과를 합치고 중복 제거 (contentid 기준)
    const allTours: TourItem[] = [];
    const seenContentIds = new Set<string>();

    for (const tours of results) {
      for (const tour of tours) {
        if (!seenContentIds.has(tour.contentid)) {
          seenContentIds.add(tour.contentid);
          allTours.push(tour);
        }
      }
    }

    return allTours;
  } catch (error) {
    console.error("Failed to fetch all areas based list:", error);
    throw error;
  }
}

/**
 * 지역 기반 관광정보 조회 (areaBasedList2)
 * 선택된 지역과 관광 타입에 해당하는 관광지 목록을 조회합니다.
 *
 * @param areaCode 지역코드 (시/도, 선택 사항 - undefined일 경우 전체 지역 조회)
 * @param contentTypeId 관광 타입 ID (선택 사항, 전체 조회 시 undefined)
 * @param numOfRows 페이지당 항목 수 (기본값: 20)
 * @param pageNo 페이지 번호 (기본값: 1)
 * @returns 관광지 목록 (레거시 호환성을 위해 배열 반환, totalCount는 별도 함수 사용)
 */
export async function getAreaBasedList(
  areaCode?: string,
  contentTypeId?: ContentTypeId,
  numOfRows: number = 20,
  pageNo: number = 1
): Promise<TourItem[]> {
  // areaCode가 없으면 전체 지역 조회
  if (!areaCode) {
    return getAllAreasBasedList(contentTypeId, numOfRows, pageNo);
  }

  return getAreaBasedListInternal(areaCode, contentTypeId, numOfRows, pageNo);
}

/**
 * 지역 기반 관광정보 조회 (페이지네이션 포함)
 * totalCount를 포함한 응답을 반환합니다.
 *
 * @param areaCode 지역코드 (시/도, 선택 사항)
 * @param contentTypeId 관광 타입 ID (선택 사항)
 * @param numOfRows 페이지당 항목 수 (기본값: 20)
 * @param pageNo 페이지 번호 (기본값: 1)
 * @returns 관광지 목록 및 전체 개수
 */
export async function getAreaBasedListWithPagination(
  areaCode?: string,
  contentTypeId?: ContentTypeId,
  numOfRows: number = 20,
  pageNo: number = 1
): Promise<{ items: TourItem[]; totalCount: number }> {
  // areaCode가 없으면 전체 지역 조회는 totalCount 계산이 복잡하므로
  // 일단 단일 지역 조회만 지원
  if (!areaCode) {
    // 전체 지역의 경우 정확한 totalCount를 계산하기 어려우므로
    // 현재 조회된 항목 수를 반환 (임시)
    const items = await getAllAreasBasedList(contentTypeId, numOfRows, pageNo);
    return { items, totalCount: items.length };
  }

  const params: Record<string, string | number> = {
    areaCode,
    numOfRows,
    pageNo,
  };

  if (contentTypeId) {
    params.contentTypeId = contentTypeId;
  }

  const response = await fetchTourApi<TourItem>("/areaBasedList2", params);

  const items = response.response.body.items;
  const itemsArray = items && items.item ? normalizeItem(items.item) : [];
  const totalCount = response.response.body.totalCount || itemsArray.length;

  // 좌표 디버깅: 첫 번째 항목의 좌표 로그
  if (itemsArray.length > 0) {
    console.log("🗺️ 첫 번째 관광지 좌표 데이터:", {
      title: itemsArray[0].title,
      mapx: itemsArray[0].mapx,
      mapy: itemsArray[0].mapy,
      mapx_type: typeof itemsArray[0].mapx,
      mapy_type: typeof itemsArray[0].mapy,
    });
  }

  return { items: itemsArray, totalCount };
}

/**
 * 키워드 검색 (searchKeyword2)
 * 입력한 키워드로 관광지를 검색합니다.
 *
 * @param keyword 검색 키워드
 * @param areaCode 지역코드 필터 (선택 사항)
 * @param contentTypeId 관광 타입 필터 (선택 사항)
 * @param numOfRows 페이지당 항목 수 (기본값: 20)
 * @param pageNo 페이지 번호 (기본값: 1)
 * @returns 검색 결과 관광지 목록 (레거시 호환성을 위해 배열 반환)
 */
export async function searchKeyword(
  keyword: string,
  areaCode?: string,
  contentTypeId?: ContentTypeId,
  numOfRows: number = 20,
  pageNo: number = 1
): Promise<TourItem[]> {
  const params: Record<string, string | number> = {
    keyword,
    numOfRows,
    pageNo,
  };

  if (areaCode) {
    params.areaCode = areaCode;
  }

  if (contentTypeId) {
    params.contentTypeId = contentTypeId;
  }

  const response = await fetchTourApi<TourItem>("/searchKeyword2", params);

  const items = response.response.body.items;
  if (!items || !items.item) {
    return [];
  }

  return normalizeItem(items.item);
}

/**
 * 키워드 검색 (페이지네이션 포함)
 * totalCount를 포함한 응답을 반환합니다.
 *
 * @param keyword 검색 키워드
 * @param areaCode 지역코드 필터 (선택 사항)
 * @param contentTypeId 관광 타입 필터 (선택 사항)
 * @param numOfRows 페이지당 항목 수 (기본값: 20)
 * @param pageNo 페이지 번호 (기본값: 1)
 * @returns 검색 결과 관광지 목록 및 전체 개수
 */
export async function searchKeywordWithPagination(
  keyword: string,
  areaCode?: string,
  contentTypeId?: ContentTypeId,
  numOfRows: number = 20,
  pageNo: number = 1
): Promise<{ items: TourItem[]; totalCount: number }> {
  const params: Record<string, string | number> = {
    keyword,
    numOfRows,
    pageNo,
  };

  if (areaCode) {
    params.areaCode = areaCode;
  }

  if (contentTypeId) {
    params.contentTypeId = contentTypeId;
  }

  const response = await fetchTourApi<TourItem>("/searchKeyword2", params);

  const items = response.response.body.items;
  const itemsArray = items && items.item ? normalizeItem(items.item) : [];
  const totalCount = response.response.body.totalCount || itemsArray.length;

  return { items: itemsArray, totalCount };
}

/**
 * 공통 정보 조회 (detailCommon2)
 * 관광지의 기본 상세 정보를 조회합니다.
 *
 * @param contentId 콘텐츠ID
 * @returns 관광지 상세 정보
 */
export async function getDetailCommon(
  contentId: string
): Promise<TourDetail | null> {
  const response = await fetchTourApi<TourDetail>("/detailCommon2", {
    contentId,
  });

  const items = response.response.body.items;
  if (!items || !items.item) {
    return null;
  }

  const item = normalizeItem(items.item)[0];
  return item || null;
}

/**
 * 소개 정보 조회 (detailIntro2)
 * 관광지의 운영 정보(이용시간, 휴무일, 주차 등)를 조회합니다.
 *
 * @param contentId 콘텐츠ID
 * @param contentTypeId 콘텐츠타입ID (필수)
 * @returns 관광지 소개 정보
 */
export async function getDetailIntro(
  contentId: string,
  contentTypeId: ContentTypeId
): Promise<TourIntro | null> {
  const response = await fetchTourApi<TourIntro>("/detailIntro2", {
    contentId,
    contentTypeId,
  });

  const items = response.response.body.items;
  if (!items || !items.item) {
    return null;
  }

  const item = normalizeItem(items.item)[0];
  return item || null;
}

/**
 * 이미지 목록 조회 (detailImage2)
 * 관광지의 이미지 목록을 조회합니다.
 *
 * @param contentId 콘텐츠ID
 * @param numOfRows 페이지당 항목 수 (기본값: 20)
 * @param pageNo 페이지 번호 (기본값: 1)
 * @returns 이미지 목록
 */
export async function getDetailImage(
  contentId: string,
  numOfRows: number = 20,
  pageNo: number = 1
): Promise<TourImage[]> {
  const response = await fetchTourApi<TourImage>("/detailImage2", {
    contentId,
    numOfRows,
    pageNo,
  });

  const items = response.response.body.items;
  if (!items || !items.item) {
    return [];
  }

  return normalizeItem(items.item);
}

/**
 * 반려동물 동반 여행 정보 조회 (detailPetTour2)
 * 관광지의 반려동물 동반 관련 상세 정보를 조회합니다.
 *
 * @param contentId 콘텐츠ID
 * @returns 반려동물 동반 여행 정보 (없으면 null)
 */
export async function getDetailPetTour(
  contentId: string
): Promise<PetTourInfo | null> {
  const response = await fetchTourApi<PetTourInfo>("/detailPetTour2", {
    contentId,
  });

  const items = response.response.body.items;
  if (!items || !items.item) {
    return null;
  }

  const item = normalizeItem(items.item)[0];
  return item || null;
}

