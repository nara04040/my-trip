/**
 * @file detail-map.tsx
 * @description 관광지 상세페이지 지도 컴포넌트
 *
 * 관광지 상세페이지에서 해당 관광지의 위치를 네이버 지도에 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 네이버 지도 API 스크립트 동적 로드
 * 2. 단일 관광지 마커 표시
 * 3. 길찾기 버튼 (네이버 지도 앱/웹 연동)
 * 4. 좌표 복사 기능
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /docs/TODO.md} - 작업 목록
 * @see {@link /docs/reference/design/DESIGN.md} - 디자인 가이드
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import type { TourDetail } from "@/lib/types/tour";
import { convertKATECToWGS84 } from "@/lib/utils/coordinates";
import { getMarkerIconByType } from "@/lib/utils/marker-colors";
import { Button } from "@/components/ui/button";
import { AddressCopyButton } from "./address-copy-button";
import { CoordinatesCopyButton } from "./coordinates-copy-button";
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

interface DetailMapProps {
  /** 관광지 상세 정보 */
  tour: TourDetail;
  /** 지도 높이 (기본값: 모바일 400px, 데스크톱 500px) */
  height?: string;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 관광지 상세페이지 지도 컴포넌트
 *
 * 단일 관광지의 위치를 네이버 지도에 표시하고, 길찾기 및 좌표 복사 기능을 제공합니다.
 *
 * @example
 * ```tsx
 * <DetailMap tour={tourDetail} />
 * ```
 */
export function DetailMap({
  tour,
  height,
  className,
}: DetailMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const scriptLoadedRef = useRef(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // 좌표 변환
  const coordinates = tour.mapx && tour.mapy
    ? convertKATECToWGS84(tour.mapx, tour.mapy)
    : null;

  // 주소 (addr1 + addr2)
  const address = tour.addr2
    ? `${tour.addr1} ${tour.addr2}`
    : tour.addr1;

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
      console.error(
        "NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 환경변수가 설정되지 않았습니다."
      );
      setMapError("지도 API 설정이 필요합니다.");
      return;
    }

    // 이미 스크립트가 로드되어 있는지 확인
    if (window.naver?.maps) {
      scriptLoadedRef.current = true;
      setIsScriptLoaded(true);
      return;
    }

    // 스크립트 동적 로드
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}`;
    script.async = true;
    script.onload = () => {
      scriptLoadedRef.current = true;
      setIsScriptLoaded(true);
    };
    script.onerror = () => {
      console.error("네이버 지도 API 스크립트 로드 실패");
      setMapError("지도를 불러오는 중 오류가 발생했습니다.");
    };
    document.head.appendChild(script);

    return () => {
      // 컴포넌트 언마운트 시 스크립트 제거하지 않음
    };
  }, []);

  // 지도 초기화 및 마커 표시
  useEffect(() => {
    // 좌표가 없으면 지도를 표시하지 않음
    if (!coordinates) {
      setMapError("좌표 정보가 없어 지도를 표시할 수 없습니다.");
      return;
    }

    if (!mapRef.current || !window.naver?.maps || !isScriptLoaded) {
      return;
    }

    const { maps } = window.naver;

    // 기존 마커 제거
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }

    // 지도 초기화
    const mapCenter = {
      lat: coordinates.latitude,
      lng: coordinates.longitude,
    };
    const map = new maps.Map(mapRef.current, {
      center: mapCenter,
      zoom: 16, // 상세페이지는 줌 레벨을 높게 설정
    });

    mapInstanceRef.current = map;

    // 관광 타입별 마커 아이콘 생성
    const iconOptions = getMarkerIconByType(tour.contenttypeid);
    const iconSize = new maps.Size(
      iconOptions.size.width,
      iconOptions.size.height
    );
    const iconAnchor = new maps.Point(
      iconOptions.anchor.x,
      iconOptions.anchor.y
    );

    // 마커 생성
    const marker = new maps.Marker({
      position: mapCenter,
      map: map,
      title: tour.title,
      icon: {
        content: iconOptions.content,
        size: iconSize,
        anchor: iconAnchor,
      },
    });

    markerRef.current = marker;

    return () => {
      // 컴포넌트 언마운트 시 마커 정리
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    };
  }, [coordinates, isScriptLoaded, tour.contenttypeid, tour.title]);

  // 길찾기 URL 생성
  const getDirectionsUrl = () => {
    if (!coordinates) return null;

    const { latitude, longitude } = coordinates;
    const title = encodeURIComponent(tour.title);

    // 모바일 환경 감지
    const isMobile =
      typeof window !== "undefined" &&
      /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // 네이버 지도 앱 URL (보행자 경로)
      return `nmap://route/walk?dlat=${latitude}&dlng=${longitude}&dname=${title}`;
    } else {
      // 네이버 지도 웹 URL
      return `https://map.naver.com/v5/directions/-/-/${longitude},${latitude},${title}`;
    }
  };

  const directionsUrl = getDirectionsUrl();

  // 좌표가 없으면 에러 메시지 표시
  if (!coordinates) {
    return (
      <section
        className={cn(
          "rounded-lg border bg-card p-6 shadow-sm",
          className
        )}
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          위치 정보
        </h2>
        <p className="text-muted-foreground">
          좌표 정보가 없어 지도를 표시할 수 없습니다.
        </p>
      </section>
    );
  }

  return (
    <section
      className={cn("rounded-lg border bg-card p-6 shadow-sm", className)}
    >
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5" />
        위치 정보
      </h2>

      {/* 지도 */}
      <div
        className={cn(
          "relative w-full mb-4",
          height || "h-[400px] md:h-[500px]",
          mapError && "bg-muted"
        )}
        style={{ minHeight: height || "400px" }}
      >
        {mapError ? (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-muted-foreground">{mapError}</p>
          </div>
        ) : (
          <div ref={mapRef} className="w-full h-full rounded-lg" />
        )}
      </div>

      {/* 주소 및 좌표 정보 */}
      <div className="space-y-4">
        {/* 주소 */}
        {address && (
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                주소
              </p>
              <p className="text-base break-all mb-2">{address}</p>
              <AddressCopyButton address={address} />
            </div>
          </div>
        )}

        {/* 좌표 */}
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              좌표
            </p>
            <p className="text-base break-all mb-2">
              위도: {coordinates.latitude.toFixed(6)}, 경도:{" "}
              {coordinates.longitude.toFixed(6)}
            </p>
            <CoordinatesCopyButton
              latitude={coordinates.latitude}
              longitude={coordinates.longitude}
            />
          </div>
        </div>

        {/* 길찾기 버튼 */}
        {directionsUrl && (
          <div className="pt-2">
            <Button
              variant="default"
              size="lg"
              className="w-full gap-2"
              asChild
            >
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Navigation className="h-5 w-5" />
                길찾기
              </a>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

