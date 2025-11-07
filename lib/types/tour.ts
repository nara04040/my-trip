/**
 * @file tour.ts
 * @description 한국관광공사 API 관련 타입 정의
 *
 * 한국관광공사 공공 API (KorService2)의 응답 데이터 타입을 정의합니다.
 * API 응답은 배열 형태로 반환되며, 각 타입별로 필드가 다를 수 있습니다.
 *
 * 주요 타입:
 * - TourItem: 관광지 목록 조회 (areaBasedList2) 응답
 * - TourDetail: 관광지 상세 정보 (detailCommon2) 응답
 * - TourIntro: 관광지 소개 정보 (detailIntro2) 응답
 * - AreaCode: 지역코드 조회 (areaCode2) 응답
 * - PetTourInfo: 반려동물 동반 여행 정보 (detailPetTour2) 응답
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 */

/**
 * 관광지 목록 조회 응답 타입 (areaBasedList2)
 */
export interface TourItem {
  /** 주소 */
  addr1: string;
  /** 상세주소 */
  addr2?: string;
  /** 지역코드 */
  areacode: string;
  /** 콘텐츠ID (상세페이지 라우팅에 사용) */
  contentid: string;
  /** 콘텐츠타입ID (12: 관광지, 14: 문화시설, 15: 축제/행사, 25: 여행코스, 28: 레포츠, 32: 숙박, 38: 쇼핑, 39: 음식점) */
  contenttypeid: string;
  /** 관광지명 */
  title: string;
  /** 경도 (KATEC 좌표계, 정수형 → 10000000으로 나누어 변환 필요) */
  mapx: string;
  /** 위도 (KATEC 좌표계, 정수형 → 10000000으로 나누어 변환 필요) */
  mapy: string;
  /** 대표이미지1 */
  firstimage?: string;
  /** 대표이미지2 */
  firstimage2?: string;
  /** 전화번호 */
  tel?: string;
  /** 대분류 */
  cat1?: string;
  /** 중분류 */
  cat2?: string;
  /** 소분류 */
  cat3?: string;
  /** 수정일 (정렬 기준으로 사용) */
  modifiedtime: string;
}

/**
 * 관광지 상세 정보 응답 타입 (detailCommon2)
 */
export interface TourDetail {
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: string;
  /** 관광지명 */
  title: string;
  /** 주소 */
  addr1: string;
  /** 상세주소 */
  addr2?: string;
  /** 우편번호 */
  zipcode?: string;
  /** 전화번호 */
  tel?: string;
  /** 홈페이지 URL */
  homepage?: string;
  /** 개요 (긴 설명문) */
  overview?: string;
  /** 대표이미지1 */
  firstimage?: string;
  /** 대표이미지2 */
  firstimage2?: string;
  /** 경도 (KATEC 좌표계) */
  mapx: string;
  /** 위도 (KATEC 좌표계) */
  mapy: string;
}

/**
 * 관광지 소개 정보 응답 타입 (detailIntro2)
 * 타입별로 필드가 다를 수 있으므로 옵셔널로 정의
 */
export interface TourIntro {
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: string;
  /** 이용시간 */
  usetime?: string;
  /** 휴무일 */
  restdate?: string;
  /** 문의처 */
  infocenter?: string;
  /** 주차 가능 여부 */
  parking?: string;
  /** 반려동물 동반 가능 여부 */
  chkpet?: string;
  /** 이용요금 */
  usefee?: string;
  /** 수용인원 */
  accomcount?: string;
  /** 체험 프로그램 */
  expguide?: string;
  /** 유모차 대여 가능 여부 */
  chkbabycarriage?: string;
  /** 기타 정보 (타입별로 추가 필드 가능) */
  [key: string]: string | undefined;
}

/**
 * 지역코드 조회 응답 타입 (areaCode2)
 */
export interface AreaCode {
  /** 지역코드 (시/도 단위) */
  code: string;
  /** 지역명 */
  name: string;
  /** 하위 지역코드 (시/군/구, 선택 사항) */
  rnum?: number;
}

/**
 * 관광지 이미지 정보 응답 타입 (detailImage2)
 */
export interface TourImage {
  /** 콘텐츠ID */
  contentid: string;
  /** 이미지 원본 URL */
  originimgurl: string;
  /** 이미지 썸네일 URL */
  smallimageurl: string;
  /** 이미지 설명 */
  imgname?: string;
  /** 이미지 순서 */
  serialnum?: string;
}

/**
 * 관광 타입 코드 (Content Type ID)
 */
export const CONTENT_TYPE = {
  /** 관광지 */
  TOUR_SPOT: "12",
  /** 문화시설 */
  CULTURE: "14",
  /** 축제/행사 */
  FESTIVAL: "15",
  /** 여행코스 */
  TOUR_COURSE: "25",
  /** 레포츠 */
  LEISURE: "28",
  /** 숙박 */
  LODGING: "32",
  /** 쇼핑 */
  SHOPPING: "38",
  /** 음식점 */
  RESTAURANT: "39",
} as const;

/**
 * 관광 타입 코드 타입
 */
export type ContentTypeId =
  | typeof CONTENT_TYPE.TOUR_SPOT
  | typeof CONTENT_TYPE.CULTURE
  | typeof CONTENT_TYPE.FESTIVAL
  | typeof CONTENT_TYPE.TOUR_COURSE
  | typeof CONTENT_TYPE.LEISURE
  | typeof CONTENT_TYPE.LODGING
  | typeof CONTENT_TYPE.SHOPPING
  | typeof CONTENT_TYPE.RESTAURANT;

/**
 * 관광 타입 이름 (한글)
 */
export const CONTENT_TYPE_NAMES: Record<ContentTypeId, string> = {
  [CONTENT_TYPE.TOUR_SPOT]: "관광지",
  [CONTENT_TYPE.CULTURE]: "문화시설",
  [CONTENT_TYPE.FESTIVAL]: "축제/행사",
  [CONTENT_TYPE.TOUR_COURSE]: "여행코스",
  [CONTENT_TYPE.LEISURE]: "레포츠",
  [CONTENT_TYPE.LODGING]: "숙박",
  [CONTENT_TYPE.SHOPPING]: "쇼핑",
  [CONTENT_TYPE.RESTAURANT]: "음식점",
} as const;

/**
 * API 응답 기본 구조
 * 한국관광공사 API는 response.body.items.item 형태로 응답
 */
export interface TourApiResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items?: {
        item: T | T[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

/**
 * 좌표 변환 유틸리티 타입
 * KATEC 좌표계 (정수형)를 WGS84 좌표계 (소수형)로 변환
 */
export interface Coordinates {
  /** 경도 (WGS84) */
  longitude: number;
  /** 위도 (WGS84) */
  latitude: number;
}

/**
 * 좌표 변환 함수 타입
 */
export type ConvertCoordinates = (
  mapx: string,
  mapy: string
) => Coordinates;

/**
 * 정렬 옵션 타입
 */
export type SortOption = "latest" | "name";

/**
 * 정렬 옵션 이름 매핑
 */
export const SORT_OPTION_NAMES: Record<SortOption, string> = {
  latest: "최신순",
  name: "이름순",
} as const;

/**
 * 페이지네이션을 포함한 관광지 목록 응답 타입
 */
export interface TourListResponse {
  /** 관광지 목록 */
  items: TourItem[];
  /** 전체 개수 */
  totalCount: number;
}

/**
 * 반려동물 크기 타입
 * 소형견, 중형견, 대형견, 전체 가능
 */
export type PetSize = "small" | "medium" | "large" | "all";

/**
 * 반려동물 크기 한글 이름 매핑
 */
export const PET_SIZE_NAMES: Record<PetSize, string> = {
  small: "소형견",
  medium: "중형견",
  large: "대형견",
  all: "전체",
} as const;

/**
 * 반려동물 입장 가능 장소 타입
 * 실내, 실외, 전체 가능
 */
export type PetPlace = "indoor" | "outdoor" | "all";

/**
 * 반려동물 입장 가능 장소 한글 이름 매핑
 */
export const PET_PLACE_NAMES: Record<PetPlace, string> = {
  indoor: "실내",
  outdoor: "실외",
  all: "전체",
} as const;

/**
 * 반려동물 동반 여행 정보 응답 타입 (detailPetTour2)
 *
 * 한국관광공사 API의 detailPetTour2 엔드포인트에서 반환하는
 * 반려동물 동반 여행 관련 상세 정보를 담는 타입입니다.
 *
 * 주요 정보:
 * - 반려동물 동반 가능 여부
 * - 반려동물 크기 제한 (소형견, 중형견, 대형견)
 * - 입장 가능 장소 (실내, 실외)
 * - 추가 요금 정보
 * - 주차장 및 시설 정보
 * - 기타 주의사항 및 안내
 *
 * @example
 * ```typescript
 * const petInfo: PetTourInfo = {
 *   contentid: "125266",
 *   contenttypeid: "12",
 *   chkpetleash: "가능",
 *   chkpetsize: "소형견, 중형견",
 *   chkpetplace: "실외",
 *   chkpetfee: "무료",
 *   petinfo: "목줄 착용 필수",
 *   parking: "반려동물 하차 공간 있음"
 * };
 * ```
 *
 * @see {@link /docs/PRD.md#2.5-반려동물-동반-여행} - 반려동물 기능 요구사항
 */
export interface PetTourInfo {
  /** 콘텐츠ID */
  contentid: string;
  /** 콘텐츠타입ID */
  contenttypeid: string;
  /**
   * 사고 위험 완화 조치
   */
  relaAcdntRiskMtr?: string;
  /**
   * 동반 가능 타입 코드
   * 예: "전구역 동반가능", "일부구역 동반가능", "동반불가"
   */
  acmpyTypeCd?: string;
  /**
   * 관련 소지 시설
   */
  relaPosesFclty?: string;
  /**
   * 관련 비치 물품 목록
   */
  relaFrnshPrdlst?: string;
  /**
   * 기타 동반 정보
   * 추가 안내 사항 (맹견 입마개 착용 필수, 배변봉투 지참 등)
   */
  etcAcmpyInfo?: string;
  /**
   * 관련 구매 물품 목록
   */
  relaPurcPrdlst?: string;
  /**
   * 동반 가능 반려동물
   * 예: "전 견종 동반 가능", "소형견만 가능" 등
   */
  acmpyPsblCpam?: string;
  /**
   * 관련 대여 물품 목록
   */
  relaRntlPrdlst?: string;
  /**
   * 동반 필요 사항
   * 예: "목줄 착용", "입마개 착용 필수" 등
   */
  acmpyNeedMtr?: string;
  /**
   * 애완동물 동반 여부 (레거시 필드)
   * 예: "가능", "불가능", "제한적", "가능 (목줄 필수)"
   */
  chkpetleash?: string;
  /**
   * 애완동물 크기 제한 (레거시 필드)
   * 예: "소형견", "중형견", "대형견", "소형견, 중형견", "전체"
   */
  chkpetsize?: string;
  /**
   * 입장 가능 장소 (레거시 필드)
   * 예: "실내", "실외", "실내, 실외", "전체"
   */
  chkpetplace?: string;
  /**
   * 추가 요금 정보 (레거시 필드)
   * 예: "무료", "5,000원", "입장료와 동일", "별도 요금 있음"
   */
  chkpetfee?: string;
  /**
   * 기타 반려동물 정보 (레거시 필드)
   * 목줄 착용 의무, 주의사항, 문의처 등 상세 안내
   * 예: "목줄 착용 필수", "배변 봉투 지참", "문의: 02-1234-5678"
   */
  petinfo?: string;
  /**
   * 주차장 정보 (레거시 필드)
   * 반려동물 하차 공간, 산책로, 배변 봉투 제공 여부, 음수대 위치 등
   * 예: "반려동물 하차 공간 있음", "산책로 있음", "배변 봉투 제공"
   */
  parking?: string;
}
