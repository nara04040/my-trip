/**
 * @file detail-info.tsx
 * @description 관광지 기본 정보 컴포넌트
 *
 * 관광지 상세페이지에서 기본 정보를 표시하는 컴포넌트입니다.
 * 관광지명, 대표 이미지, 주소, 전화번호, 홈페이지, 개요, 관광 타입을 표시합니다.
 *
 * 주요 기능:
 * 1. 관광지명 표시 (대제목)
 * 2. 대표 이미지 표시
 * 3. 주소 표시 및 복사 기능
 * 4. 전화번호 표시 및 전화 연결
 * 5. 홈페이지 링크
 * 6. 개요 표시
 * 7. 관광 타입 및 카테고리 표시
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /docs/TODO.md} - 작업 목록
 * @see {@link /docs/reference/design/DESIGN.md} - 디자인 가이드
 */

import Image from "next/image";
import { MapPin, Phone, Globe, FileText } from "lucide-react";
import type { TourDetail } from "@/lib/types/tour";
import { CONTENT_TYPE_NAMES } from "@/lib/types/tour";
import { Button } from "@/components/ui/button";
import { AddressCopyButton } from "./address-copy-button";

interface DetailInfoProps {
  /** 관광지 상세 정보 */
  tour: TourDetail;
}

/**
 * 관광지 기본 정보 컴포넌트
 *
 * @example
 * ```tsx
 * <DetailInfo tour={tourDetail} />
 * ```
 */
export function DetailInfo({ tour }: DetailInfoProps) {
  // 이미지 URL (firstimage 또는 firstimage2, 없으면 기본 이미지)
  const imageUrl = tour.firstimage || tour.firstimage2 || "/og-image.png";

  // 주소 (addr1 + addr2)
  const address = tour.addr2
    ? `${tour.addr1} ${tour.addr2}`
    : tour.addr1;

  // 관광 타입 이름
  const contentTypeName =
    CONTENT_TYPE_NAMES[
      tour.contenttypeid as keyof typeof CONTENT_TYPE_NAMES
    ] || "관광지";

  // HTML 태그 제거 및 텍스트 정리
  const cleanOverview = tour.overview
    ? tour.overview
        .replace(/<[^>]*>/g, "") // HTML 태그 제거
        .replace(/&nbsp;/g, " ") // &nbsp;를 공백으로
        .replace(/&amp;/g, "&") // &amp;를 &로
        .replace(/&lt;/g, "<") // &lt;를 <로
        .replace(/&gt;/g, ">") // &gt;를 >로
        .replace(/&quot;/g, '"') // &quot;를 "로
        .trim()
    : null;

  // 홈페이지 URL 및 표시 텍스트 추출
  const getHomepageInfo = (homepage: string) => {
    if (!homepage) return null;

    // HTML 태그가 포함된 경우 처리
    const hrefMatch = homepage.match(/href=["']([^"']+)["']/i);
    const textMatch = homepage.match(/>([^<]+)</i);

    if (hrefMatch) {
      const url = hrefMatch[1];
      // 텍스트 내용이 있으면 사용, 없으면 URL 사용
      const displayText = textMatch ? textMatch[1].trim() : url;
      return { url, displayText };
    }

    // HTML 태그가 없는 경우 (일반 URL)
    return { url: homepage.trim(), displayText: "페이지로 이동하기" };
  };

  const homepageInfo = tour.homepage ? getHomepageInfo(tour.homepage) : null;

  return (
    <div className="space-y-8">
      {/* 관광지명 */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{tour.title}</h1>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
            {contentTypeName}
          </span>
        </div>
      </div>

      {/* 대표 이미지 */}
      {imageUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
          <Image
            src={imageUrl}
            alt={tour.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
            priority
            unoptimized={imageUrl.startsWith("http")}
          />
        </div>
      )}

      {/* 기본 정보 섹션 */}
      <section className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          기본 정보
        </h2>

        <div className="space-y-4">
          {/* 주소 */}
          {address && (
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  주소
                </p>
                <p className="text-base break-all">{address}</p>
                <div className="mt-2">
                  <AddressCopyButton address={address} />
                </div>
              </div>
            </div>
          )}

          {/* 전화번호 */}
          {tour.tel && (
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  전화번호
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${tour.tel.replace(/-/g, "")}`}
                    className="text-base hover:text-primary transition-colors"
                  >
                    {tour.tel}
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="h-8"
                  >
                    <a href={`tel:${tour.tel.replace(/-/g, "")}`}>
                      <Phone className="h-4 w-4" />
                      전화
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 홈페이지 */}
          {homepageInfo && (
            <div className="flex items-start gap-3">
              <Globe className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  홈페이지
                </p>
                <a
                  href={homepageInfo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-primary hover:underline break-all"
                >
                  {homepageInfo.displayText}
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 개요 섹션 */}
      {cleanOverview && (
        <section className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">개요</h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {cleanOverview}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

