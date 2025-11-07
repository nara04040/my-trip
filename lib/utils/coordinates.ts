/**
 * @file coordinates.ts
 * @description 좌표 변환 유틸리티 함수
 *
 * 한국관광공사 API에서 제공하는 KATEC 좌표계를 WGS84 좌표계로 변환하는 함수들을 제공합니다.
 * KATEC 좌표계는 정수형으로 저장되어 있으며, 10000000으로 나누어 WGS84 좌표계로 변환합니다.
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /lib/types/tour.ts} - Coordinates 타입 정의
 */

import type { Coordinates, TourItem } from "@/lib/types/tour";

/**
 * 한국관광공사 API 좌표를 WGS84 좌표계로 변환합니다.
 *
 * 한국관광공사 API의 mapx, mapy는 다음 두 가지 형식 중 하나입니다:
 * 1. 이미 WGS84 소수점 형태: "126.9998434" (그대로 사용)
 * 2. 정수형 형태: "1269998434" (소수점 6-7자리를 정수로 저장)
 *
 * 이 함수는 두 형식을 모두 처리합니다.
 *
 * @param mapx 경도 (문자열)
 * @param mapy 위도 (문자열)
 * @returns WGS84 좌표계 좌표 { longitude, latitude }
 *
 * @example
 * ```ts
 * // 정수형 형태
 * const coords1 = convertKATECToWGS84("1269998434", "374296913");
 * // { longitude: 126.9998434, latitude: 37.4296913 }
 *
 * // 소수점 형태
 * const coords2 = convertKATECToWGS84("126.9998434", "37.4296913");
 * // { longitude: 126.9998434, latitude: 37.4296913 }
 * ```
 */
export function convertKATECToWGS84(
  mapx: string,
  mapy: string
): Coordinates {
  let longitude = parseFloat(mapx);
  let latitude = parseFloat(mapy);

  // 한국 좌표 범위: 경도 124~132, 위도 33~43
  // 값이 범위를 벗어나면 정수형으로 간주하고 변환
  if (longitude > 132 || longitude < 124) {
    longitude = longitude / 10000000;
  }
  if (latitude > 43 || latitude < 33) {
    latitude = latitude / 10000000;
  }

  return {
    longitude,
    latitude,
  };
}

/**
 * 여러 좌표의 중심점을 계산합니다.
 *
 * 관광지 목록의 모든 좌표를 기반으로 지도의 초기 중심 좌표를 계산합니다.
 *
 * @param tours 관광지 목록
 * @returns 중심 좌표 { longitude, latitude }
 *
 * @example
 * ```ts
 * const center = calculateCenterCoordinates(tours);
 * // { longitude: 127.5, latitude: 37.5 }
 * ```
 */
export function calculateCenterCoordinates(
  tours: TourItem[]
): Coordinates | null {
  if (tours.length === 0) {
    return null;
  }

  const coordinates = tours
    .filter((tour) => tour.mapx && tour.mapy)
    .map((tour) => convertKATECToWGS84(tour.mapx, tour.mapy));

  if (coordinates.length === 0) {
    return null;
  }

  // 모든 좌표의 평균값 계산
  const sumLongitude = coordinates.reduce(
    (sum, coord) => sum + coord.longitude,
    0
  );
  const sumLatitude = coordinates.reduce(
    (sum, coord) => sum + coord.latitude,
    0
  );

  return {
    longitude: sumLongitude / coordinates.length,
    latitude: sumLatitude / coordinates.length,
  };
}

/**
 * 관광지의 좌표를 WGS84로 변환합니다.
 *
 * TourItem에서 직접 좌표를 추출하여 변환합니다.
 *
 * @param tour 관광지 정보
 * @returns WGS84 좌표계 좌표 { longitude, latitude } 또는 null
 *
 * @example
 * ```ts
 * const coords = getTourCoordinates(tour);
 * if (coords) {
 *   // 좌표 사용
 * }
 * ```
 */
export function getTourCoordinates(
  tour: TourItem
): Coordinates | null {
  if (!tour.mapx || !tour.mapy) {
    return null;
  }

  return convertKATECToWGS84(tour.mapx, tour.mapy);
}

