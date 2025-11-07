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

import { Dog, Home, TreePine, AlertCircle, Info } from "lucide-react";
import type { PetTourInfo } from "@/lib/types/tour";
import { Badge } from "@/components/ui/badge";

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
 * 반려동물 크기 제한 정보 파싱 함수
 * acmpyPsblCpam 필드에서 크기 정보를 추출하여 배열로 반환합니다.
 */
function parsePetSizes(acmpyPsblCpam?: string): Array<"small" | "medium" | "large"> {
  if (!acmpyPsblCpam?.trim()) {
    return [];
  }

  const text = acmpyPsblCpam.toLowerCase().trim();
  const sizes: Array<"small" | "medium" | "large"> = [];

  // "전 견종" 또는 "모든 견종" 포함 시 모든 크기
  if (text.includes("전 견종") || text.includes("모든 견종") || text.includes("전체")) {
    return ["small", "medium", "large"];
  }

  // 개별 크기 확인
  if (text.includes("소형") || text.includes("소형견")) {
    sizes.push("small");
  }
  if (text.includes("중형") || text.includes("중형견")) {
    sizes.push("medium");
  }
  if (text.includes("대형") || text.includes("대형견")) {
    sizes.push("large");
  }

  return sizes;
}

/**
 * 반려동물 크기 뱃지 정보
 */
const PET_SIZE_BADGES = {
  small: {
    label: "소형견",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  medium: {
    label: "중형견",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
  large: {
    label: "대형견",
    className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
} as const;

/**
 * 반려동물 입장 가능 장소 정보 파싱 함수
 * acmpyTypeCd와 etcAcmpyInfo에서 입장 가능 장소 정보를 추출합니다.
 */
function parsePetPlaces(
  acmpyTypeCd?: string,
  etcAcmpyInfo?: string
): {
  indoor: boolean;
  outdoor: boolean;
  restrictions: string[];
} {
  const result = {
    indoor: false,
    outdoor: false,
    restrictions: [] as string[],
  };

  const typeCd = acmpyTypeCd?.trim() || "";
  const etcInfo = etcAcmpyInfo?.trim() || "";

  // 전구역 동반가능이면 실내/실외 모두 가능
  if (typeCd.includes("전구역 동반가능")) {
    result.indoor = true;
    result.outdoor = true;
  }

  // 일부구역 동반가능이면 제한적
  if (typeCd.includes("일부구역 동반가능")) {
    // etcAcmpyInfo에서 실내/실외 정보 확인
    const etcLower = etcInfo.toLowerCase();
    if (etcLower.includes("실내") && etcLower.includes("불가")) {
      result.outdoor = true;
      result.restrictions.push("실내는 동반 불가");
    } else if (etcLower.includes("실외") && etcLower.includes("불가")) {
      result.indoor = true;
      result.restrictions.push("실외는 동반 불가");
    } else {
      // 명확하지 않으면 둘 다 가능으로 표시하되 제한적 표시
      result.indoor = true;
      result.outdoor = true;
    }
  }

  // etcAcmpyInfo에서 추가 제한사항 추출
  if (etcInfo) {
    const lines = cleanHtmlText(etcInfo).split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !result.restrictions.includes(trimmed)) {
        // 이미 추가된 제한사항이 아니고, 실내/실외 관련이 아닌 경우만 추가
        if (
          !trimmed.toLowerCase().includes("실내") &&
          !trimmed.toLowerCase().includes("실외")
        ) {
          result.restrictions.push(trimmed);
        }
      }
    }
  }

  return result;
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

  // 반려동물 크기 제한 정보 파싱
  const petSizes = parsePetSizes(petTourInfo.acmpyPsblCpam);

  // 반려동물 입장 가능 장소 정보 파싱
  const petPlaces = parsePetPlaces(
    petTourInfo.acmpyTypeCd,
    petTourInfo.etcAcmpyInfo
  );

  // 표시할 텍스트 구성 (기본 정보만)
  const displayTexts: string[] = [];
  if (petTourInfo.acmpyTypeCd?.trim()) {
    displayTexts.push(petTourInfo.acmpyTypeCd.trim());
  }
  // acmpyPsblCpam은 크기 뱃지로 표시하므로 텍스트에서 제외 (크기 정보가 아닌 경우만 텍스트로 표시)
  const acmpyPsblCpamText = petTourInfo.acmpyPsblCpam?.trim();
  if (acmpyPsblCpamText && petSizes.length === 0) {
    // 크기 정보가 아닌 다른 내용인 경우만 텍스트로 표시
    displayTexts.push(acmpyPsblCpamText);
  }
  if (petTourInfo.chkpetleash?.trim() && !availabilityStatus.displayText) {
    displayTexts.push(cleanHtmlText(petTourInfo.chkpetleash.trim()));
  }
  
  const displayText = displayTexts.length > 0 
    ? displayTexts.join("\n\n") 
    : availabilityStatus.displayText;

  // 필수 사항 및 주의사항 분리
  const requiredItems: string[] = [];
  const warningItems: string[] = [];

  if (petTourInfo.acmpyNeedMtr?.trim()) {
    requiredItems.push(petTourInfo.acmpyNeedMtr.trim());
  }

  if (petTourInfo.etcAcmpyInfo?.trim()) {
    const etcInfo = cleanHtmlText(petTourInfo.etcAcmpyInfo.trim());
    const lines = etcInfo.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        // 실내/실외 제한은 이미 입장 가능 장소 섹션에서 처리
        if (
          !trimmed.toLowerCase().includes("실내") &&
          !trimmed.toLowerCase().includes("실외")
        ) {
          warningItems.push(trimmed);
        }
      }
    }
  }

  return (
    <section
      className="rounded-lg border bg-card p-6 shadow-sm"
      aria-labelledby="pet-tour-info-heading"
    >
      <h2
        id="pet-tour-info-heading"
        className="text-xl font-semibold mb-4 flex items-center gap-2"
      >
        <Dog className="h-5 w-5" aria-hidden="true" />
        반려동물 동반 정보
      </h2>

      <div className="space-y-6" role="list">
        {/* 반려동물 동반 가능 여부 */}
        <div className="flex items-start gap-3" role="listitem">
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
                aria-label={`동반 가능 여부: ${availabilityStatus.label}`}
              >
                {availabilityStatus.label}
              </span>
            </div>
            {displayText && (
              <p
                className="text-base whitespace-pre-wrap wrap-break-word"
                aria-label="상세 정보"
              >
                {displayText}
              </p>
            )}
          </div>
        </div>

        {/* 반려동물 크기 제한 정보 */}
        {petSizes.length > 0 && (
          <div className="flex items-start gap-3" role="listitem">
            <Dog
              className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                동반 가능 크기
              </p>
              <div
                className="flex flex-wrap gap-2"
                role="list"
                aria-label="동반 가능한 반려동물 크기"
              >
                {petSizes.map((size) => (
                  <Badge
                    key={size}
                    variant="secondary"
                    className={PET_SIZE_BADGES[size].className}
                    aria-label={PET_SIZE_BADGES[size].label}
                  >
                    {PET_SIZE_BADGES[size].label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 반려동물 입장 가능 장소 정보 */}
        {(petPlaces.indoor || petPlaces.outdoor || petPlaces.restrictions.length > 0) && (
          <div className="flex items-start gap-3" role="listitem">
            <TreePine
              className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                입장 가능 장소
              </p>
              <div
                className="flex flex-wrap gap-2 mb-2"
                role="list"
                aria-label="입장 가능한 장소"
              >
                {petPlaces.indoor && (
                  <Badge
                    variant="outline"
                    className="gap-1.5 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
                    aria-label="실내 동반 가능"
                  >
                    <Home className="h-3 w-3" aria-hidden="true" />
                    실내 가능
                  </Badge>
                )}
                {petPlaces.outdoor && (
                  <Badge
                    variant="outline"
                    className="gap-1.5 bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                    aria-label="실외 동반 가능"
                  >
                    <TreePine className="h-3 w-3" aria-hidden="true" />
                    실외 가능
                  </Badge>
                )}
              </div>
              {petPlaces.restrictions.length > 0 && (
                <div className="mt-2 space-y-1" role="list" aria-label="장소 제한사항">
                  {petPlaces.restrictions.map((restriction, index) => (
                    <p
                      key={index}
                      className="text-sm text-muted-foreground flex items-start gap-1.5"
                      role="listitem"
                    >
                      <AlertCircle
                        className="h-4 w-4 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{restriction}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 필수 사항 */}
        {requiredItems.length > 0 && (
          <div className="flex items-start gap-3" role="listitem">
            <Info
              className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400"
              aria-hidden="true"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                필수 사항
              </p>
              <div
                className="space-y-1.5"
                role="list"
                aria-label="반려동물 동반 필수 사항"
              >
                {requiredItems.map((item, index) => (
                  <p
                    key={index}
                    className="text-sm text-foreground flex items-start gap-1.5"
                    role="listitem"
                  >
                    <span
                      className="text-blue-600 dark:text-blue-400 shrink-0"
                      aria-hidden="true"
                    >
                      •
                    </span>
                    <span>{item}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 주의사항 */}
        {warningItems.length > 0 && (
          <div className="flex items-start gap-3" role="listitem">
            <AlertCircle
              className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-400"
              aria-hidden="true"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                주의사항
              </p>
              <div
                className="space-y-1.5"
                role="list"
                aria-label="반려동물 동반 주의사항"
              >
                {warningItems.map((item, index) => (
                  <p
                    key={index}
                    className="text-sm text-foreground flex items-start gap-1.5"
                    role="listitem"
                  >
                    <span
                      className="text-yellow-600 dark:text-yellow-400 shrink-0"
                      aria-hidden="true"
                    >
                      •
                    </span>
                    <span>{item}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

