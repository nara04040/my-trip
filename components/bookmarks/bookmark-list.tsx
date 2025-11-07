"use client";

/**
 * @file bookmark-list.tsx
 * @description 북마크 목록 컴포넌트
 *
 * 북마크한 관광지 목록을 표시하는 컴포넌트입니다.
 * 정렬 기능과 일괄 삭제 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 북마크 목록 표시 (TourCard 컴포넌트 재사용)
 * 2. 정렬 기능 (최신순, 이름순, 지역별)
 * 3. 일괄 삭제 기능 (체크박스 선택)
 * 4. 개별 북마크 삭제
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.4.5 북마크)
 * @see {@link /docs/TODO.md} - 작업 목록
 */

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Trash2, ArrowUpDown } from "lucide-react";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { removeBookmarkClient } from "@/lib/api/supabase-api-client";
import type { BookmarkWithTourItem } from "@/lib/types/bookmark";
import type { BookmarkSortOption } from "@/lib/types/bookmark";
import { TourCard } from "@/components/tour-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BookmarkListProps {
  /** 북마크 + 관광지 정보 배열 */
  bookmarks: BookmarkWithTourItem[];
}

/**
 * 정렬 옵션 이름 매핑
 */
const SORT_OPTION_NAMES: Record<BookmarkSortOption, string> = {
  latest: "최신순",
  name: "이름순",
  region: "지역별",
} as const;

/**
 * 주소에서 지역명(시/도) 추출하는 유틸리티 함수
 * 예: "서울특별시 강남구..." -> "서울특별시"
 */
function extractRegionFromAddress(address: string): string | null {
  if (!address) return null;

  // 주소에서 첫 번째 공백이나 특수문자 전까지 추출
  const match = address.match(/^([가-힣]+(?:특별시|광역시|시|도|특별자치시|특별자치도)?)/);
  return match ? match[1] : null;
}

/**
 * 북마크 목록 컴포넌트
 *
 * @example
 * ```tsx
 * <BookmarkList bookmarks={bookmarks} />
 * ```
 */
export function BookmarkList({ bookmarks }: BookmarkListProps) {
  const router = useRouter();
  const { userId: clerkUserId } = useAuth();
  const supabase = useClerkSupabaseClient();

  const [sortOption, setSortOption] = useState<BookmarkSortOption>("latest");
  const [selectedBookmarkIds, setSelectedBookmarkIds] = useState<Set<string>>(
    new Set()
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);

  // Supabase user_id 조회
  useEffect(() => {
    async function fetchSupabaseUserId() {
      if (!clerkUserId) {
        return;
      }

      try {
        const { data, error } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", clerkUserId)
          .single();

        if (error || !data) {
          console.error("Failed to get Supabase user_id:", error);
          return;
        }

        setSupabaseUserId(data.id);
      } catch (error) {
        console.error("Error fetching Supabase user_id:", error);
      }
    }

    fetchSupabaseUserId();
  }, [clerkUserId, supabase]);

  /**
   * 정렬된 북마크 목록
   */
  const sortedBookmarks = useMemo(() => {
    const sorted = [...bookmarks];

    switch (sortOption) {
      case "latest":
        // 최신순: created_at 기준 내림차순 (이미 정렬되어 있을 수 있음)
        sorted.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA;
        });
        break;

      case "name":
        // 이름순: title 기준 오름차순
        sorted.sort((a, b) => {
          return a.tourItem.title.localeCompare(b.tourItem.title, "ko");
        });
        break;

      case "region":
        // 지역별: areacode 기준 오름차순, areacode가 없으면 주소의 첫 번째 단어로 정렬
        sorted.sort((a, b) => {
          // areacode가 있으면 areacode로 정렬
          if (a.tourItem.areacode && b.tourItem.areacode) {
            return a.tourItem.areacode.localeCompare(b.tourItem.areacode);
          }
          // areacode가 없으면 주소의 첫 번째 단어(시/도명)로 정렬
          const regionA =
            a.tourItem.areacode ||
            extractRegionFromAddress(a.tourItem.addr1) ||
            "zzz";
          const regionB =
            b.tourItem.areacode ||
            extractRegionFromAddress(b.tourItem.addr1) ||
            "zzz";
          return regionA.localeCompare(regionB, "ko");
        });
        break;
    }

    return sorted;
  }, [bookmarks, sortOption]);

  /**
   * 체크박스 토글
   */
  const toggleBookmarkSelection = (bookmarkId: string) => {
    setSelectedBookmarkIds((prev) => {
      const next = new Set(prev);
      if (next.has(bookmarkId)) {
        next.delete(bookmarkId);
      } else {
        next.add(bookmarkId);
      }
      return next;
    });
  };

  /**
   * 전체 선택/해제
   */
  const toggleAllSelection = () => {
    if (selectedBookmarkIds.size === sortedBookmarks.length) {
      setSelectedBookmarkIds(new Set());
    } else {
      setSelectedBookmarkIds(new Set(sortedBookmarks.map((b) => b.id)));
    }
  };

  /**
   * 개별 북마크 삭제
   */
  const handleDeleteBookmark = async (bookmark: BookmarkWithTourItem) => {
    if (!supabaseUserId) {
      console.error("Supabase user_id not found");
      return;
    }

    setIsDeleting(true);

    try {
      await removeBookmarkClient(
        supabase,
        supabaseUserId,
        bookmark.content_id
      );
      // 삭제 후 페이지 새로고침
      router.refresh();
    } catch (error) {
      console.error("Failed to delete bookmark:", error);
      alert("북마크 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * 일괄 삭제
   */
  const handleBulkDelete = async () => {
    if (!supabaseUserId || selectedBookmarkIds.size === 0) {
      return;
    }

    setIsDeleting(true);
    setDeleteDialogOpen(false);

    try {
      // 선택된 북마크들의 content_id 가져오기
      const selectedBookmarks = sortedBookmarks.filter((b) =>
        selectedBookmarkIds.has(b.id)
      );

      // 병렬로 삭제
      await Promise.all(
        selectedBookmarks.map((bookmark) =>
          removeBookmarkClient(supabase, supabaseUserId, bookmark.content_id)
        )
      );

      // 선택 초기화
      setSelectedBookmarkIds(new Set());

      // 삭제 후 페이지 새로고침
      router.refresh();
    } catch (error) {
      console.error("Failed to delete bookmarks:", error);
      alert("북마크 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  // 빈 상태
  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center min-h-[400px]">
        <p className="text-lg text-muted-foreground">북마크한 관광지가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더: 정렬 옵션 및 일괄 삭제 */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* 전체 선택 체크박스 */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={
                sortedBookmarks.length > 0 &&
                selectedBookmarkIds.size === sortedBookmarks.length
              }
              onChange={toggleAllSelection}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-muted-foreground">전체 선택</span>
          </label>

          {/* 일괄 삭제 버튼 */}
          {selectedBookmarkIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isDeleting}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              선택 삭제 ({selectedBookmarkIds.size})
            </Button>
          )}
        </div>

        {/* 정렬 옵션 */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select
            value={sortOption}
            onValueChange={(value) =>
              setSortOption(value as BookmarkSortOption)
            }
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SORT_OPTION_NAMES).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 북마크 목록 */}
      <div
        className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-label="북마크 목록"
      >
        {sortedBookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="relative group"
            role="listitem"
          >
            {/* 체크박스 (호버 시 표시) */}
            <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <label className="flex items-center justify-center w-6 h-6 bg-background/80 backdrop-blur-sm rounded border cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedBookmarkIds.has(bookmark.id)}
                  onChange={() => toggleBookmarkSelection(bookmark.id)}
                  className="sr-only"
                />
                {selectedBookmarkIds.has(bookmark.id) && (
                  <div className="w-4 h-4 bg-primary rounded-sm flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-primary-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </label>
            </div>

            {/* 삭제 버튼 (호버 시 표시) */}
            <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleDeleteBookmark(bookmark)}
                disabled={isDeleting}
                aria-label="북마크 삭제"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* 북마크 카드 */}
            <TourCard tour={bookmark.tourItem} />
          </div>
        ))}
      </div>

      {/* 일괄 삭제 확인 다이얼로그 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>북마크 삭제</DialogTitle>
            <DialogDescription>
              선택한 {selectedBookmarkIds.size}개의 북마크를 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

