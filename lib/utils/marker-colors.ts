/**
 * @file marker-colors.ts
 * @description 관광 타입별 마커 색상 및 아이콘 생성 유틸리티
 *
 * 네이버 지도에서 관광 타입별로 마커 색상을 구분하기 위한 유틸리티 함수들을 제공합니다.
 * 각 관광 타입에 맞는 색상을 정의하고, HTML 마커 아이콘을 생성합니다.
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /lib/types/tour.ts} - ContentTypeId 타입 정의
 */

import type { ContentTypeId } from "@/lib/types/tour";
import { CONTENT_TYPE } from "@/lib/types/tour";

/**
 * 관광 타입별 마커 색상 매핑
 *
 * 각 관광 타입에 맞는 의미 있는 색상을 지정합니다.
 * Tailwind CSS 색상 팔레트를 기반으로 하되, 지도에서 잘 보이도록 조정했습니다.
 */
export const MARKER_COLORS: Record<ContentTypeId, string> = {
  [CONTENT_TYPE.TOUR_SPOT]: "#3B82F6", // 파란색 - 관광지
  [CONTENT_TYPE.CULTURE]: "#8B5CF6", // 보라색 - 문화시설
  [CONTENT_TYPE.FESTIVAL]: "#EF4444", // 빨간색 - 축제/행사
  [CONTENT_TYPE.TOUR_COURSE]: "#10B981", // 초록색 - 여행코스
  [CONTENT_TYPE.LEISURE]: "#F59E0B", // 주황색 - 레포츠
  [CONTENT_TYPE.LODGING]: "#92400E", // 갈색 - 숙박
  [CONTENT_TYPE.SHOPPING]: "#EC4899", // 분홍색 - 쇼핑
  [CONTENT_TYPE.RESTAURANT]: "#FBBF24", // 노란색 - 음식점
} as const;

/**
 * 관광 타입별 마커 테두리 색상
 *
 * 마커의 가시성을 높이기 위해 어두운 테두리를 추가합니다.
 */
export const MARKER_BORDER_COLORS: Record<ContentTypeId, string> = {
  [CONTENT_TYPE.TOUR_SPOT]: "#1E40AF", // 진한 파란색
  [CONTENT_TYPE.CULTURE]: "#6D28D9", // 진한 보라색
  [CONTENT_TYPE.FESTIVAL]: "#DC2626", // 진한 빨간색
  [CONTENT_TYPE.TOUR_COURSE]: "#059669", // 진한 초록색
  [CONTENT_TYPE.LEISURE]: "#D97706", // 진한 주황색
  [CONTENT_TYPE.LODGING]: "#78350F", // 진한 갈색
  [CONTENT_TYPE.SHOPPING]: "#DB2777", // 진한 분홍색
  [CONTENT_TYPE.RESTAURANT]: "#D97706", // 진한 노란색
} as const;

/**
 * 관광 타입 ID로 마커 색상을 조회합니다.
 *
 * @param contentTypeId 관광 타입 ID
 * @returns 마커 색상 (HEX 코드)
 */
export function getMarkerColor(contentTypeId: string): string {
  const color = MARKER_COLORS[contentTypeId as ContentTypeId];
  return color || MARKER_COLORS[CONTENT_TYPE.TOUR_SPOT]; // 기본값: 관광지 색상
}

/**
 * 관광 타입 ID로 마커 테두리 색상을 조회합니다.
 *
 * @param contentTypeId 관광 타입 ID
 * @returns 마커 테두리 색상 (HEX 코드)
 */
export function getMarkerBorderColor(contentTypeId: string): string {
  const color = MARKER_BORDER_COLORS[contentTypeId as ContentTypeId];
  return color || MARKER_BORDER_COLORS[CONTENT_TYPE.TOUR_SPOT]; // 기본값: 관광지 색상
}

/**
 * 네이버 지도 마커 아이콘 옵션 인터페이스
 */
export interface MarkerIconOptions {
  /** 마커 색상 (HEX 코드) */
  color: string;
  /** 마커 테두리 색상 (HEX 코드) */
  borderColor: string;
  /** 마커 크기 (기본값: 24) */
  size?: number;
  /** 마커 테두리 두께 (기본값: 2) */
  borderWidth?: number;
}

/**
 * 네이버 지도용 HTML 마커 아이콘을 생성합니다.
 *
 * 원형 마커를 HTML로 생성하여 네이버 지도 API의 icon 옵션에 사용할 수 있습니다.
 *
 * @param options 마커 아이콘 옵션
 * @returns 네이버 지도 API icon 옵션 객체
 *
 * @example
 * ```ts
 * const icon = createMarkerIcon({
 *   color: "#3B82F6",
 *   borderColor: "#1E40AF",
 *   size: 24,
 * });
 *
 * const marker = new naver.maps.Marker({
 *   position: { lat: 37.5665, lng: 126.9780 },
 *   map: map,
 *   icon: icon,
 * });
 * ```
 */
export function createMarkerIcon(options: MarkerIconOptions) {
  const {
    color,
    borderColor,
    size = 24,
    borderWidth = 2,
  } = options;

  // HTML 마커 생성 (원형)
  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      border: ${borderWidth}px solid ${borderColor};
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: ${size * 0.4}px;
        height: ${size * 0.4}px;
        background-color: white;
        border-radius: 50%;
        opacity: 0.8;
      "></div>
    </div>
  `;

  // 네이버 지도 API가 로드되어 있으면 Size와 Point 객체 사용, 없으면 일반 객체 사용
  // 실제 사용 시점에 naver.maps 객체가 있으므로 여기서는 일반 객체로 반환
  return {
    content: html,
    size: { width: size, height: size },
    anchor: { x: size / 2, y: size / 2 },
  };
}

/**
 * 관광 타입 ID로 마커 아이콘을 생성합니다.
 *
 * 관광 타입에 맞는 색상으로 마커 아이콘을 자동 생성합니다.
 *
 * @param contentTypeId 관광 타입 ID
 * @returns 네이버 지도 API icon 옵션 객체
 *
 * @example
 * ```ts
 * const icon = getMarkerIconByType("12"); // 관광지
 * const marker = new naver.maps.Marker({
 *   position: { lat: 37.5665, lng: 126.9780 },
 *   map: map,
 *   icon: icon,
 * });
 * ```
 */
export function getMarkerIconByType(contentTypeId: string) {
  const color = getMarkerColor(contentTypeId);
  const borderColor = getMarkerBorderColor(contentTypeId);

  return createMarkerIcon({
    color,
    borderColor,
    size: 24,
    borderWidth: 2,
  });
}

