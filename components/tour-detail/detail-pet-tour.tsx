/**
 * @file detail-pet-tour.tsx
 * @description 반려동물 동반 여행 정보 컴포넌트
 *
 * 관광지 상세페이지에서 반려동물 동반 여행 관련 정보를 표시하는 컴포넌트입니다.
 * 반려동물 동반 가능 여부, 크기 제한, 입장 가능 장소, 추가 요금 등의 정보를 표시합니다.
 *
 * 주요 기능:
 * 1. 반려동물 동반 가능 여부 표시
 * 2. 반려동물 아이콘 (🐾) 표시
 * 3. 동반 가능/불가능 상태 명확히 표시
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.5 반려동물 동반 여행)
 * @see {@link /docs/TODO.md} - 작업 목록
 * @see {@link /docs/reference/design/DESIGN.md} - 디자인 가이드
 */

import { Dog } from "lucide-react";
import type { PetTourInfo } from "@/lib/types/tour";

interface DetailPetTourProps {
  /** 반려동물 동반 여행 정보 */
  petTourInfo: PetTourInfo;
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
 * 반려동물 동반 가능 여부 상태 판단 함수
 * PetTourInfo 객체의 실제 API 응답 필드들을 확인하여 상태를 분류합니다.
 */
function getPetAvailabilityStatus(
  petInfo: PetTourInfo
): {
  status: "available" | "unavailable" | "limited" | "unknown";
  label: string;
  className: string;
  displayText: string;
} {
  // acmpyTypeCd로 판단 (가장 확실한 필드)
  const acmpyTypeCd = petInfo.acmpyTypeCd?.trim();
  if (acmpyTypeCd) {
    if (acmpyTypeCd.includes("전구역 동반가능")) {
      return {
        status: "available",
        label: "전구역 동반 가능",
        className: "text-green-600 dark:text-green-400",
        displayText: acmpyTypeCd,
      };
    }
    if (acmpyTypeCd.includes("일부구역 동반가능")) {
      return {
        status: "limited",
        label: "일부구역 동반 가능",
        className: "text-yellow-600 dark:text-yellow-400",
        displayText: acmpyTypeCd,
      };
    }
    if (acmpyTypeCd.includes("동반불가")) {
      return {
        status: "unavailable",
        label: "동반 불가능",
        className: "text-gray-600 dark:text-gray-400",
        displayText: acmpyTypeCd,
      };
    }
  }

  // acmpyPsblCpam으로 판단
  const acmpyPsblCpam = petInfo.acmpyPsblCpam?.trim();
  if (acmpyPsblCpam && acmpyPsblCpam.includes("동반 가능")) {
    return {
      status: "available",
      label: "동반 가능",
      className: "text-green-600 dark:text-green-400",
      displayText: acmpyPsblCpam,
    };
  }

  // 레거시 chkpetleash 필드 확인
  const chkpetleash = petInfo.chkpetleash?.trim();
  if (chkpetleash) {
    const cleaned = cleanHtmlText(chkpetleash).toLowerCase();

    // "가능" 관련 키워드
    if (
      cleaned.includes("가능") &&
      !cleaned.includes("불가능") &&
      !cleaned.includes("제한")
    ) {
      return {
        status: "available",
        label: "동반 가능",
        className: "text-green-600 dark:text-green-400",
        displayText: cleanHtmlText(chkpetleash),
      };
    }

    // "불가능" 관련 키워드
    if (cleaned.includes("불가능") || cleaned.includes("불가")) {
      return {
        status: "unavailable",
        label: "동반 불가능",
        className: "text-gray-600 dark:text-gray-400",
        displayText: cleanHtmlText(chkpetleash),
      };
    }

    // "제한" 관련 키워드
    if (
      cleaned.includes("제한") ||
      cleaned.includes("제한적") ||
      cleaned.includes("일부")
    ) {
      return {
        status: "limited",
        label: "제한적 동반 가능",
        className: "text-yellow-600 dark:text-yellow-400",
        displayText: cleanHtmlText(chkpetleash),
      };
    }

    // 기타 경우 (원본 텍스트 표시)
    return {
      status: "unknown",
      label: cleanHtmlText(chkpetleash),
      className: "text-foreground",
      displayText: cleanHtmlText(chkpetleash),
    };
  }

  // 정보 없음
  return {
    status: "unknown",
    label: "정보 없음",
    className: "text-muted-foreground",
    displayText: "",
  };
}

/**
 * 반려동물 동반 여행 정보 컴포넌트
 *
 * 반려동물 동반 여행 정보를 표시하는 컴포넌트입니다.
 * 상세페이지에서 API를 호출하여 데이터를 가져온 후 props로 전달합니다.
 *
 * @example
 * ```tsx
 * const petInfo = await getDetailPetTour(contentId);
 * {petInfo && <DetailPetTour petTourInfo={petInfo} />}
 * ```
 */
export function DetailPetTour({ petTourInfo }: DetailPetTourProps) {
  // 동반 가능 여부 정보가 없으면 컴포넌트를 렌더링하지 않음
  if (
    !petTourInfo.acmpyTypeCd?.trim() &&
    !petTourInfo.acmpyPsblCpam?.trim() &&
    !petTourInfo.acmpyNeedMtr?.trim() &&
    !petTourInfo.chkpetleash?.trim()
  ) {
    return null;
  }

  // 동반 가능 여부 상태 판단
  const availabilityStatus = getPetAvailabilityStatus(petTourInfo);

  // 표시할 텍스트 구성
  const displayTexts: string[] = [];
  if (petTourInfo.acmpyTypeCd?.trim()) {
    displayTexts.push(petTourInfo.acmpyTypeCd.trim());
  }
  if (petTourInfo.acmpyPsblCpam?.trim()) {
    displayTexts.push(petTourInfo.acmpyPsblCpam.trim());
  }
  if (petTourInfo.acmpyNeedMtr?.trim()) {
    displayTexts.push(`필수 사항: ${petTourInfo.acmpyNeedMtr.trim()}`);
  }
  if (petTourInfo.etcAcmpyInfo?.trim()) {
    displayTexts.push(cleanHtmlText(petTourInfo.etcAcmpyInfo.trim()));
  }
  if (petTourInfo.chkpetleash?.trim() && !availabilityStatus.displayText) {
    displayTexts.push(cleanHtmlText(petTourInfo.chkpetleash.trim()));
  }
  
  const displayText = displayTexts.length > 0 
    ? displayTexts.join("\n\n") 
    : availabilityStatus.displayText;

  return (
    <section className="rounded-lg border bg-card p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Dog className="h-5 w-5" />
        반려동물 동반 정보
      </h2>

      <div className="space-y-4">
        {/* 반려동물 동반 가능 여부 */}
        <div className="flex items-start gap-3">
          <div className="mt-0.5 text-2xl shrink-0" aria-hidden="true">
            🐾
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-muted-foreground">
                동반 가능 여부
              </p>
              <span
                className={`text-sm font-semibold ${availabilityStatus.className}`}
              >
                {availabilityStatus.label}
              </span>
            </div>
            {displayText && (
              <p className="text-base whitespace-pre-wrap wrap-break-word">
                {displayText}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

