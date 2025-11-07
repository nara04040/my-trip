/**
 * @file page.tsx
 * @description 북마크 목록 페이지
 *
 * 사용자가 북마크한 관광지 목록을 표시하는 페이지입니다.
 * 인증된 사용자만 접근 가능하며, 북마크 목록을 조회하여 관광지 정보와 함께 표시합니다.
 *
 * 주요 기능:
 * 1. 인증 확인 및 리다이렉트
 * 2. 북마크 목록 조회
 * 3. 관광지 정보 조회 (병렬 처리)
 * 4. 북마크 목록 컴포넌트에 데이터 전달
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.4.5 북마크)
 * @see {@link /docs/TODO.md} - 작업 목록
 */

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getBookmarks } from "@/lib/api/supabase-api";
import { getDetailCommon } from "@/lib/api/tour-api";
import type { Bookmark } from "@/lib/types/bookmark";
import type { TourItem, TourDetail } from "@/lib/types/tour";
import { BookmarkList } from "@/components/bookmarks/bookmark-list";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * TourDetail을 TourItem으로 변환하는 유틸리티 함수
 * 북마크 목록에서 TourItem 형태가 필요하므로 변환합니다.
 */
function tourDetailToTourItem(detail: TourDetail): TourItem {
  return {
    contentid: detail.contentid,
    contenttypeid: detail.contenttypeid,
    title: detail.title,
    addr1: detail.addr1,
    addr2: detail.addr2,
    areacode: "", // TourDetail에는 areacode가 없으므로 빈 문자열
    mapx: detail.mapx,
    mapy: detail.mapy,
    firstimage: detail.firstimage,
    firstimage2: detail.firstimage2,
    tel: detail.tel,
    modifiedtime: "", // TourDetail에는 modifiedtime이 없으므로 빈 문자열
  };
}

/**
 * 북마크 목록 페이지
 *
 * 인증된 사용자의 북마크 목록을 조회하고 관광지 정보와 함께 표시합니다.
 * 인증되지 않은 사용자는 로그인 페이지로 리다이렉트됩니다.
 */
export default async function BookmarksPage() {
  // 인증 확인
  const { userId } = await auth();

  if (!userId) {
    // 인증되지 않은 경우 홈으로 리다이렉트
    redirect("/");
  }

  // 북마크 목록 조회
  let bookmarks: Bookmark[] = [];
  try {
    bookmarks = await getBookmarks();
  } catch (error) {
    console.error("Failed to fetch bookmarks:", error);
    // 에러 발생 시 빈 배열로 처리
  }

  // 북마크가 없으면 빈 상태 표시
  if (bookmarks.length === 0) {
    return (
      <main className="container max-w-6xl py-8 px-4 md:px-6">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              뒤로가기
            </Button>
          </Link>
        </div>

        {/* 빈 상태 */}
        <div className="flex flex-col items-center justify-center gap-4 p-12 text-center min-h-[400px]">
          <h1 className="text-2xl font-bold">북마크한 관광지가 없습니다</h1>
          <p className="text-muted-foreground">
            관광지 상세페이지에서 북마크를 추가하세요.
          </p>
          <Link href="/">
            <Button>관광지 둘러보기</Button>
          </Link>
        </div>
      </main>
    );
  }

  // 각 북마크의 관광지 정보 조회 (병렬 처리)
  const bookmarkWithTours = await Promise.allSettled(
    bookmarks.map(async (bookmark) => {
      try {
        const tourDetail = await getDetailCommon(bookmark.content_id);
        if (!tourDetail) {
          return null;
        }
        return {
          bookmark,
          tourItem: tourDetailToTourItem(tourDetail),
        };
      } catch (error) {
        console.error(
          `Failed to fetch tour detail for ${bookmark.content_id}:`,
          error
        );
        return null;
      }
    })
  );

  // 성공적으로 조회된 북마크만 필터링
  const validBookmarks = bookmarkWithTours
    .filter(
      (result): result is PromiseFulfilledResult<{
        bookmark: Bookmark;
        tourItem: TourItem;
      } | null> => result.status === "fulfilled" && result.value !== null
    )
    .map((result) => result.value!)
    .map(({ bookmark, tourItem }) => ({
      ...bookmark,
      tourItem,
    }));

  return (
    <main className="container max-w-6xl py-8 px-4 md:px-6">
      {/* 뒤로가기 버튼 */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            뒤로가기
          </Button>
        </Link>
      </div>

      {/* 페이지 제목 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">내 북마크</h1>
        <p className="text-muted-foreground mt-2">
          북마크한 관광지 {validBookmarks.length}개
        </p>
      </div>

      {/* 북마크 목록 */}
      <BookmarkList bookmarks={validBookmarks} />
    </main>
  );
}

