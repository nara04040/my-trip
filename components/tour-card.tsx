/**
 * @file tour-card.tsx
 * @description 관광지 카드 컴포넌트
 *
 * 관광지 목록에서 각 관광지를 표시하는 카드 컴포넌트입니다.
 * 썸네일 이미지, 관광지명, 주소, 관광 타입 뱃지를 표시합니다.
 *
 * 주요 기능:
 * 1. 썸네일 이미지 표시 (없으면 기본 이미지)
 * 2. 관광지명 표시
 * 3. 주소 표시
 * 4. 관광 타입 뱃지 표시
 * 5. 클릭 시 상세페이지로 이동
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /lib/types/tour.ts} - TourItem 타입 정의
 */

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { TourItem } from "@/lib/types/tour";
import { CONTENT_TYPE_NAMES } from "@/lib/types/tour";
import { cn } from "@/lib/utils";

interface TourCardProps {
  /** 관광지 정보 */
  tour: TourItem;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 관광지 카드 컴포넌트
 *
 * @example
 * ```tsx
 * <TourCard tour={tourItem} />
 * ```
 */
export function TourCard({ tour, className }: TourCardProps) {
  // 이미지 URL (firstimage 또는 firstimage2, 없으면 기본 이미지)
  const imageUrl =
    tour.firstimage || tour.firstimage2 || "/og-image.png";

  // 주소 (addr1 + addr2)
  const address = tour.addr2
    ? `${tour.addr1} ${tour.addr2}`
    : tour.addr1;

  // 관광 타입 이름
  const contentTypeName =
    CONTENT_TYPE_NAMES[tour.contenttypeid as keyof typeof CONTENT_TYPE_NAMES] ||
    "관광지";

  return (
    <Link
      href={`/places/${tour.contentid}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border bg-card shadow-sm transition-all hover:shadow-md hover:border-primary/50",
        className
      )}
    >
      {/* 썸네일 이미지 */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <Image
          src={imageUrl}
          alt={tour.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          // 외부 이미지 도메인은 next.config.ts에서 설정 필요
          unoptimized={imageUrl.startsWith("http")}
        />
      </div>

      {/* 카드 내용 */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* 관광지명 */}
        <h3 className="line-clamp-2 text-lg font-semibold leading-tight text-card-foreground group-hover:text-primary transition-colors">
          {tour.title}
        </h3>

        {/* 주소 */}
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {address}
          </p>
        </div>

        {/* 관광 타입 뱃지 */}
        <div className="mt-auto flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {contentTypeName}
          </span>
        </div>
      </div>
    </Link>
  );
}
