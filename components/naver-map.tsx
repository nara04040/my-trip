/**
 * @file naver-map.tsx
 * @description 네이버 지도 컴포넌트
 *
 * Naver Maps JavaScript API v3 (NCP)를 사용하여 관광지 목록을 지도에 마커로 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 네이버 지도 API 스크립트 동적 로드
 * 2. 관광지 마커 표시
 * 3. 마커 클릭 시 인포윈도우 표시
 * 4. 외부에서 마커로 이동하는 메서드 제공 (ref를 통한 제어)
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /lib/utils/coordinates.ts} - 좌표 변환 유틸리티
 */

"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from "react";
import Link from "next/link";
import type { TourItem } from "@/lib/types/tour";
import {
  convertKATECToWGS84,
  calculateCenterCoordinates,
  getTourCoordinates,
} from "@/lib/utils/coordinates";
import {
  getMarkerIconByType,
  getHighlightedMarkerIconByType,
} from "@/lib/utils/marker-colors";
import { MapLegend } from "@/components/map-legend";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Naver Maps API 타입 정의
declare global {
  interface Window {
    naver?: {
      maps: {
        Map: new (element: HTMLElement, options: {
          center: { lat: number; lng: number };
          zoom: number;
        }) => {
          setCenter: (center: { lat: number; lng: number }) => void;
          setZoom: (zoom: number) => void;
          getCenter: () => { lat: number; lng: number };
          getZoom: () => number;
        };
        Marker: new (options: {
          position: { lat: number; lng: number };
          map: any;
          title?: string;
          icon?: {
            content: string | HTMLElement;
            size?: { width: number; height: number } | any;
            anchor?: { x: number; y: number } | any;
          };
        }) => {
          setMap: (map: any) => void;
          setIcon: (icon: {
            content: string | HTMLElement;
            size?: { width: number; height: number } | any;
            anchor?: { x: number; y: number } | any;
          }) => void;
          getPosition: () => { lat: number; lng: number };
          addListener?: (event: string, handler: () => void) => void;
        };
        Size: new (width: number, height: number) => { width: number; height: number };
        Point: new (x: number, y: number) => { x: number; y: number };
        InfoWindow: new (options: {
          content: string | HTMLElement;
          maxWidth?: number;
          backgroundColor?: string;
          borderColor?: string;
          borderWidth?: number;
          anchorSize?: { width: number; height: number };
          anchorColor?: string;
        }) => {
          open: (map: any, marker: any) => void;
          close: () => void;
        };
        Event?: {
          addListener: (target: any, event: string, handler: () => void) => void;
          removeListener: (target: any, event: string, handler: () => void) => void;
        };
      };
    };
  }
}

interface NaverMapProps {
  /** 관광지 목록 */
  tours: TourItem[];
  /** 지도 높이 (기본값: 모바일 400px, 데스크톱 600px) */
  height?: string;
  /** 추가 클래스명 */
  className?: string;
}

export interface NaverMapRef {
  /** 특정 관광지의 마커로 지도 이동 */
  moveToMarker: (contentId: string) => void;
  /** 지도 중심 좌표 설정 */
  setCenter: (longitude: number, latitude: number) => void;
  /** 특정 관광지의 마커 강조 */
  highlightMarker: (contentId: string) => void;
  /** 강조된 마커 해제 */
  unhighlightMarker: () => void;
}

/**
 * 네이버 지도 컴포넌트
 *
 * @example
 * ```tsx
 * const mapRef = useRef<NaverMapRef>(null);
 * 
 * <NaverMap
 *   ref={mapRef}
 *   tours={tours}
 *   onMarkerClick={(tour) => console.log(tour)}
 * />
 * 
 * // 마커로 이동
 * mapRef.current?.moveToMarker("125266");
 * ```
 */
const NaverMap = forwardRef<NaverMapRef, NaverMapProps>(
  ({ tours, height, className }, ref) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const infoWindowsRef = useRef<any[]>([]);
    const scriptLoadedRef = useRef(false);
    // ✅ 상태 추가: 스크립트 로드 완료 여부를 상태로 관리
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    // 마커 인덱스 매핑 (contentId → marker index)
    const markerIndexMapRef = useRef<Map<string, number>>(new Map());
    // 원래 마커 아이콘 저장 (복원용)
    const originalIconsRef = useRef<Map<string, any>>(new Map());
    // 현재 강조된 마커의 contentId
    const highlightedMarkerIdRef = useRef<string | null>(null);

    // 외부에서 사용할 수 있는 메서드 제공
    useImperativeHandle(ref, () => ({
      moveToMarker: (contentId: string) => {
        const tour = tours.find((t) => t.contentid === contentId);
        if (!tour || !mapInstanceRef.current) return;

        const coords = getTourCoordinates(tour);
        if (!coords) return;

        mapInstanceRef.current.setCenter({
          lat: coords.latitude,
          lng: coords.longitude,
        } as { lat: number; lng: number });

        // 해당 마커 찾아서 인포윈도우 열기
        const markerIndex = tours.findIndex((t) => t.contentid === contentId);
        if (markerIndex >= 0 && infoWindowsRef.current[markerIndex]) {
          // 기존 인포윈도우 모두 닫기
          infoWindowsRef.current.forEach((iw) => iw?.close());
          // 해당 인포윈도우 열기
          infoWindowsRef.current[markerIndex]?.open(
            mapInstanceRef.current,
            markersRef.current[markerIndex]
          );
        }
      },
      setCenter: (longitude: number, latitude: number) => {
        if (!mapInstanceRef.current) return;
        mapInstanceRef.current.setCenter({
          lat: latitude,
          lng: longitude,
        } as { lat: number; lng: number });
      },
      highlightMarker: (contentId: string) => {
        const markerIndex = markerIndexMapRef.current.get(contentId);
        if (markerIndex === undefined || !markersRef.current[markerIndex]) {
          return;
        }

        const marker = markersRef.current[markerIndex];
        const tour = tours.find((t) => t.contentid === contentId);
        if (!tour || !window.naver?.maps) return;

        // 이미 강조된 마커면 무시
        if (highlightedMarkerIdRef.current === contentId) {
          return;
        }

        // 기존 강조 해제
        if (highlightedMarkerIdRef.current) {
          const prevIndex = markerIndexMapRef.current.get(
            highlightedMarkerIdRef.current
          );
          if (prevIndex !== undefined && markersRef.current[prevIndex]) {
            const originalIcon = originalIconsRef.current.get(
              highlightedMarkerIdRef.current
            );
            if (originalIcon) {
              markersRef.current[prevIndex].setIcon(originalIcon);
            }
          }
        }

        // 원래 아이콘 저장 (아직 저장되지 않은 경우)
        if (!originalIconsRef.current.has(contentId)) {
          // 일반 아이콘을 저장
          const normalIcon = getMarkerIconByType(tour.contenttypeid);
          const { maps } = window.naver;
          const normalIconSize = new maps.Size(normalIcon.size.width, normalIcon.size.height);
          const normalIconAnchor = new maps.Point(normalIcon.anchor.x, normalIcon.anchor.y);
          originalIconsRef.current.set(contentId, {
            content: normalIcon.content,
            size: normalIconSize,
            anchor: normalIconAnchor,
          });
        }

        // 강조된 아이콘 생성 및 적용
        const highlightedIcon = getHighlightedMarkerIconByType(tour.contenttypeid);
        const { maps } = window.naver;
        const highlightedIconSize = new maps.Size(
          highlightedIcon.size.width,
          highlightedIcon.size.height
        );
        const highlightedIconAnchor = new maps.Point(
          highlightedIcon.anchor.x,
          highlightedIcon.anchor.y
        );

        marker.setIcon({
          content: highlightedIcon.content,
          size: highlightedIconSize,
          anchor: highlightedIconAnchor,
        });

        highlightedMarkerIdRef.current = contentId;
      },
      unhighlightMarker: () => {
        if (!highlightedMarkerIdRef.current) return;

        const contentId = highlightedMarkerIdRef.current;
        const markerIndex = markerIndexMapRef.current.get(contentId);
        if (markerIndex === undefined || !markersRef.current[markerIndex]) {
          highlightedMarkerIdRef.current = null;
          return;
        }

        const marker = markersRef.current[markerIndex];
        const originalIcon = originalIconsRef.current.get(contentId);

        if (originalIcon) {
          marker.setIcon(originalIcon);
        }

        highlightedMarkerIdRef.current = null;
      },
    }));

    // 네이버 지도 API 스크립트 로드
    useEffect(() => {
      if (scriptLoadedRef.current || typeof window === "undefined") {
        // 이미 로드되어 있으면 상태 업데이트
        if (window.naver?.maps) {
          setIsScriptLoaded(true);
        }
        return;
      }

      const clientId = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
      if (!clientId) {
        console.error("NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 환경변수가 설정되지 않았습니다.");
        return;
      }

      // 이미 스크립트가 로드되어 있는지 확인
      if (window.naver?.maps) {
        scriptLoadedRef.current = true;
        setIsScriptLoaded(true); // ✅ 상태 업데이트
        return;
      }

      // 스크립트 동적 로드
      const script = document.createElement("script");
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
      script.async = true;
      script.onload = () => {
        scriptLoadedRef.current = true;
        setIsScriptLoaded(true); // ✅ 상태 업데이트로 지도 초기화 useEffect 재실행
      };
      script.onerror = () => {
        console.error("네이버 지도 API 스크립트 로드 실패");
      };
      document.head.appendChild(script);

      return () => {
        // 컴포넌트 언마운트 시 스크립트 제거하지 않음 (다른 컴포넌트에서도 사용 가능)
      };
    }, []);

    // 지도 초기화 및 마커 표시
    useEffect(() => {
      // ✅ isScriptLoaded 상태를 의존성에 추가
      if (!mapRef.current || !window.naver?.maps || !isScriptLoaded) {
        return;
      }

      const { maps } = window.naver;

      // 기존 마커 및 인포윈도우 제거
      markersRef.current.forEach((marker) => marker?.setMap(null));
      infoWindowsRef.current.forEach((iw) => iw?.close());
      markersRef.current = [];
      infoWindowsRef.current = [];

      // 중심 좌표 계산
      const center = calculateCenterCoordinates(tours);
      const defaultCenter = { lat: 37.5665, lng: 126.9780 }; // 서울시청 기본 좌표

      // 지도 초기화
      const mapCenter = center
        ? { lat: center.latitude, lng: center.longitude }
        : defaultCenter;
      const map = new maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: center ? 12 : 10, // 관광지가 있으면 줌 레벨 12, 없으면 10
      });

      mapInstanceRef.current = map;

      // 관광지 마커 생성
      tours.forEach((tour) => {
        const coords = getTourCoordinates(tour);
        if (!coords) return;

        // 관광 타입별 마커 아이콘 생성
        const iconOptions = getMarkerIconByType(tour.contenttypeid);
        // 네이버 지도 API의 Size와 Point 객체 생성
        const iconSize = new maps.Size(iconOptions.size.width, iconOptions.size.height);
        const iconAnchor = new maps.Point(iconOptions.anchor.x, iconOptions.anchor.y);

        // 마커 생성
        const marker = new maps.Marker({
          position: {
            lat: coords.latitude,
            lng: coords.longitude,
          },
          map: map,
          title: tour.title,
          icon: {
            content: iconOptions.content,
            size: iconSize,
            anchor: iconAnchor,
          },
        });

        markersRef.current.push(marker);
        // 마커 인덱스 매핑 저장
        markerIndexMapRef.current.set(tour.contentid, markersRef.current.length - 1);
        // 원래 아이콘 저장 (복원용)
        const normalIcon = getMarkerIconByType(tour.contenttypeid);
        const normalIconSize = new maps.Size(normalIcon.size.width, normalIcon.size.height);
        const normalIconAnchor = new maps.Point(normalIcon.anchor.x, normalIcon.anchor.y);
        originalIconsRef.current.set(tour.contentid, {
          content: normalIcon.content,
          size: normalIconSize,
          anchor: normalIconAnchor,
        });

        // 인포윈도우 컨텐츠 생성
        const address = tour.addr2
          ? `${tour.addr1} ${tour.addr2}`
          : tour.addr1;

        const infoContent = document.createElement("div");
        infoContent.className = "p-3 min-w-[200px]";
        infoContent.innerHTML = `
          <div class="flex flex-col gap-2">
            <h3 class="font-semibold text-sm">${tour.title}</h3>
            <p class="text-xs text-muted-foreground">${address}</p>
            <a 
              href="/places/${tour.contentid}" 
              class="text-xs text-primary hover:underline"
              data-contentid="${tour.contentid}"
            >
              상세보기 →
            </a>
          </div>
        `;

        // 인포윈도우 생성
        const infoWindow = new maps.InfoWindow({
          content: infoContent,
          maxWidth: 300,
          backgroundColor: "white",
          borderColor: "#e5e7eb",
          borderWidth: 1,
          anchorSize: { width: 10, height: 10 },
          anchorColor: "white",
        });

        infoWindowsRef.current.push(infoWindow);

        // 마커 클릭 이벤트
        if (maps.Event) {
          maps.Event.addListener(marker, "click", () => {
            // 기존 인포윈도우 모두 닫기
            infoWindowsRef.current.forEach((iw) => iw?.close());
            // 클릭한 마커의 인포윈도우 열기
            infoWindow.open(map, marker);
          });
        } else if (marker.addListener) {
          marker.addListener("click", () => {
            // 기존 인포윈도우 모두 닫기
            infoWindowsRef.current.forEach((iw) => iw?.close());
            // 클릭한 마커의 인포윈도우 열기
            infoWindow.open(map, marker);
          });
        }
      });

      // 관광지가 여러 개일 경우 지도 범위 자동 조정
      if (tours.length > 1) {
        const validCoords = tours
          .map((tour) => getTourCoordinates(tour))
          .filter((coords): coords is { longitude: number; latitude: number } =>
            coords !== null
          );

        if (validCoords.length > 0) {
          const bounds = {
            minLat: Math.min(...validCoords.map((c) => c.latitude)),
            maxLat: Math.max(...validCoords.map((c) => c.latitude)),
            minLng: Math.min(...validCoords.map((c) => c.longitude)),
            maxLng: Math.max(...validCoords.map((c) => c.longitude)),
          };

          // 지도 중심을 경계의 중심으로 설정
          const centerLat = (bounds.minLat + bounds.maxLat) / 2;
          const centerLng = (bounds.minLng + bounds.maxLng) / 2;
          map.setCenter({ lat: centerLat, lng: centerLng });

          // 줌 레벨 자동 조정 (간단한 계산)
          const latDiff = bounds.maxLat - bounds.minLat;
          const lngDiff = bounds.maxLng - bounds.minLng;
          const maxDiff = Math.max(latDiff, lngDiff);

          let zoom = 10;
          if (maxDiff < 0.01) zoom = 15;
          else if (maxDiff < 0.05) zoom = 13;
          else if (maxDiff < 0.1) zoom = 12;
          else if (maxDiff < 0.5) zoom = 10;
          else zoom = 8;

          map.setZoom(zoom);
        }
      }

      return () => {
        // 컴포넌트 언마운트 시 마커 정리
        markersRef.current.forEach((marker) => {
          if (marker) {
            marker.setMap(null);
          }
        });
        infoWindowsRef.current.forEach((iw) => {
          if (iw) {
            iw.close();
          }
        });
        // 매핑 및 상태 초기화
        markerIndexMapRef.current.clear();
        originalIconsRef.current.clear();
        highlightedMarkerIdRef.current = null;
      };
    }, [tours, isScriptLoaded]); // ✅ isScriptLoaded를 의존성 배열에 추가

    return (
      <div
        className={cn(
          "relative w-full",
          height || "h-[400px] lg:h-[600px]",
          className
        )}
        style={{ minHeight: height || "400px" }}
      >
        {/* 지도 컨테이너 */}
        <div
          ref={mapRef}
          className="w-full h-full"
        />
        {/* 범례 컴포넌트 */}
        <MapLegend />
      </div>
    );
  }
);

NaverMap.displayName = "NaverMap";

export { NaverMap };

