import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { TourItem, SortOption } from "@/lib/types/tour"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 관광지 목록을 정렬합니다.
 *
 * @param tours 정렬할 관광지 목록
 * @param sortOption 정렬 옵션 ("latest": 최신순, "name": 이름순)
 * @returns 정렬된 관광지 목록
 */
export function sortToursBy(
  tours: TourItem[],
  sortOption: SortOption
): TourItem[] {
  const sorted = [...tours]; // 원본 배열 변경 방지

  switch (sortOption) {
    case "latest":
      // 최신순: modifiedtime 기준 내림차순 (최신이 먼저)
      return sorted.sort((a, b) => {
        const timeA = a.modifiedtime ? new Date(a.modifiedtime).getTime() : 0;
        const timeB = b.modifiedtime ? new Date(b.modifiedtime).getTime() : 0;
        return timeB - timeA; // 내림차순
      });

    case "name":
      // 이름순: title 기준 가나다순 (오름차순)
      return sorted.sort((a, b) => {
        const titleA = a.title || "";
        const titleB = b.title || "";
        return titleA.localeCompare(titleB, "ko"); // 한국어 정렬
      });

    default:
      return sorted;
  }
}
