/**
 * @file detail-intro.tsx
 * @description 관광지 운영 정보 컴포넌트
 *
 * 관광지 상세페이지에서 운영 정보를 표시하는 컴포넌트입니다.
 * 운영시간, 휴무일, 이용요금, 주차, 수용인원, 체험 프로그램, 유모차/반려동물 동반 정보를 표시합니다.
 *
 * 주요 기능:
 * 1. 운영시간/개장시간 표시
 * 2. 휴무일 표시
 * 3. 이용요금 표시
 * 4. 주차 가능 여부 표시
 * 5. 수용인원 표시
 * 6. 체험 프로그램 표시 (있는 경우)
 * 7. 유모차/반려동물 동반 가능 여부 표시
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.4.2 운영 정보 섹션)
 * @see {@link /docs/TODO.md} - 작업 목록
 * @see {@link /docs/reference/design/DESIGN.md} - 디자인 가이드
 */

import {
  Clock,
  CalendarX,
  DollarSign,
  Car,
  Users,
  GraduationCap,
  Baby,
  Dog,
} from "lucide-react";
import type { TourIntro } from "@/lib/types/tour";

interface DetailIntroProps {
  /** 관광지 운영 정보 */
  tourIntro: TourIntro;
}

/**
 * HTML 태그 제거 및 텍스트 정리 유틸리티 함수
 * <br> 태그는 줄바꿈으로 변환하고, 나머지 HTML 태그는 제거합니다.
 */
function cleanHtmlText(text: string): string {
  return text
    .replace(/<br\s*\/?>/gi, "\n") // <br> 또는 <br/>를 줄바꿈으로
    .replace(/<[^>]*>/g, "") // 나머지 HTML 태그 제거
    .replace(/&nbsp;/g, " ") // &nbsp;를 공백으로
    .replace(/&amp;/g, "&") // &amp;를 &로
    .replace(/&lt;/g, "<") // &lt;를 <로
    .replace(/&gt;/g, ">") // &gt;를 >로
    .replace(/&quot;/g, '"') // &quot;를 "로
    .trim();
}

/**
 * 관광지 운영 정보 컴포넌트
 *
 * @example
 * ```tsx
 * <DetailIntro tourIntro={tourIntroData} />
 * ```
 */
export function DetailIntro({ tourIntro }: DetailIntroProps) {
  // 정보가 있는 항목만 필터링하고 HTML 태그 제거
  const hasInfo = {
    usetime: tourIntro.usetime?.trim()
      ? cleanHtmlText(tourIntro.usetime.trim())
      : null,
    restdate: tourIntro.restdate?.trim()
      ? cleanHtmlText(tourIntro.restdate.trim())
      : null,
    usefee: tourIntro.usefee?.trim()
      ? cleanHtmlText(tourIntro.usefee.trim())
      : null,
    parking: tourIntro.parking?.trim()
      ? cleanHtmlText(tourIntro.parking.trim())
      : null,
    accomcount: tourIntro.accomcount?.trim()
      ? cleanHtmlText(tourIntro.accomcount.trim())
      : null,
    expguide: tourIntro.expguide?.trim()
      ? cleanHtmlText(tourIntro.expguide.trim())
      : null,
    chkbabycarriage: tourIntro.chkbabycarriage?.trim()
      ? cleanHtmlText(tourIntro.chkbabycarriage.trim())
      : null,
    chkpet: tourIntro.chkpet?.trim()
      ? cleanHtmlText(tourIntro.chkpet.trim())
      : null,
  };

  // 정보가 하나도 없으면 컴포넌트를 렌더링하지 않음
  if (!Object.values(hasInfo).some((value) => value)) {
    return null;
  }

  return (
    <section className="rounded-lg border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5" />
        운영 정보
      </h2>

      <div className="space-y-4">
        {/* 운영시간 */}
        {hasInfo.usetime && (
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                운영시간
              </p>
              <p className="text-base whitespace-pre-wrap wrap-break-word">
                {hasInfo.usetime}
              </p>
            </div>
          </div>
        )}

        {/* 휴무일 */}
        {hasInfo.restdate && (
          <div className="flex items-start gap-3">
            <CalendarX className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                휴무일
              </p>
              <p className="text-base whitespace-pre-wrap wrap-break-word">
                {hasInfo.restdate}
              </p>
            </div>
          </div>
        )}

        {/* 이용요금 */}
        {hasInfo.usefee && (
          <div className="flex items-start gap-3">
            <DollarSign className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                이용요금
              </p>
              <p className="text-base whitespace-pre-wrap wrap-break-word">
                {hasInfo.usefee}
              </p>
            </div>
          </div>
        )}

        {/* 주차 가능 여부 */}
        {hasInfo.parking && (
          <div className="flex items-start gap-3">
            <Car className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                주차
              </p>
              <p className="text-base whitespace-pre-wrap wrap-break-word">
                {hasInfo.parking}
              </p>
            </div>
          </div>
        )}

        {/* 수용인원 */}
        {hasInfo.accomcount && (
          <div className="flex items-start gap-3">
            <Users className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                수용인원
              </p>
              <p className="text-base whitespace-pre-wrap wrap-break-word">
                {hasInfo.accomcount}
              </p>
            </div>
          </div>
        )}

        {/* 체험 프로그램 */}
        {hasInfo.expguide && (
          <div className="flex items-start gap-3">
            <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                체험 프로그램
              </p>
              <p className="text-base whitespace-pre-wrap wrap-break-word">
                {hasInfo.expguide}
              </p>
            </div>
          </div>
        )}

        {/* 유모차 동반 가능 여부 */}
        {hasInfo.chkbabycarriage && (
          <div className="flex items-start gap-3">
            <Baby className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                유모차 동반
              </p>
              <p className="text-base whitespace-pre-wrap wrap-break-word">
                {hasInfo.chkbabycarriage}
              </p>
            </div>
          </div>
        )}

        {/* 반려동물 동반 가능 여부 */}
        {hasInfo.chkpet && (
          <div className="flex items-start gap-3">
            <Dog className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                반려동물 동반
              </p>
              <p className="text-base whitespace-pre-wrap wrap-break-word">
                {hasInfo.chkpet}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

