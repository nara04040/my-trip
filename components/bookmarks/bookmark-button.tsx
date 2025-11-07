"use client";

/**
 * @file bookmark-button.tsx
 * @description 북마크 버튼 컴포넌트
 *
 * 관광지를 북마크(즐겨찾기)할 수 있는 버튼 컴포넌트입니다.
 * Clerk 인증과 Supabase를 연동하여 북마크 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 별 아이콘으로 북마크 상태 표시 (채워짐/비어있음)
 * 2. 북마크 추가/삭제 기능
 * 3. 인증되지 않은 사용자에게 로그인 모달 표시
 * 4. 로딩 상태 및 에러 처리
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.4.5 북마크)
 * @see {@link /docs/TODO.md} - 작업 목록
 * @see {@link /lib/api/supabase-api.ts} - 북마크 API 함수들
 */

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { Button } from "@/components/ui/button";
import {
  addBookmarkClient,
  removeBookmarkClient,
  isBookmarkedClient,
} from "@/lib/api/supabase-api-client";

interface BookmarkButtonProps {
  /** 관광지 콘텐츠 ID (필수) */
  contentId: string;
  /** 버튼 크기 */
  size?: "sm" | "default" | "lg";
  /** 버튼 variant */
  variant?: "default" | "outline" | "ghost" | "secondary";
}

/**
 * 북마크 버튼 컴포넌트
 *
 * 관광지를 북마크할 수 있는 버튼입니다.
 * 로그인한 사용자는 북마크를 추가/삭제할 수 있고,
 * 로그인하지 않은 사용자는 버튼 클릭 시 로그인 모달이 표시됩니다.
 *
 * @example
 * ```tsx
 * <BookmarkButton contentId="125266" />
 * ```
 */
export function BookmarkButton({
  contentId,
  size = "sm",
  variant = "outline",
}: BookmarkButtonProps) {
  const { isLoaded, userId: clerkUserId } = useAuth();
  const supabase = useClerkSupabaseClient();

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);

  /**
   * Clerk userId로 Supabase user_id 조회
   */
  useEffect(() => {
    async function fetchSupabaseUserId() {
      if (!isLoaded || !clerkUserId) {
        setSupabaseUserId(null);
        setIsLoading(false);
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
          setSupabaseUserId(null);
        } else {
          setSupabaseUserId(data.id);
        }
      } catch (error) {
        console.error("Error fetching Supabase user_id:", error);
        setSupabaseUserId(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSupabaseUserId();
  }, [isLoaded, clerkUserId, supabase]);

  /**
   * 북마크 상태 확인
   */
  useEffect(() => {
    async function checkBookmarkStatus() {
      if (!supabaseUserId || !contentId) {
        setIsBookmarked(false);
        return;
      }

      try {
        const bookmarked = await isBookmarkedClient(
          supabase,
          supabaseUserId,
          contentId
        );
        setIsBookmarked(bookmarked);
      } catch (error) {
        console.error("Failed to check bookmark status:", error);
        setIsBookmarked(false);
      }
    }

    // 로딩이 완료되고 user_id가 있을 때만 북마크 상태 확인
    if (!isLoading) {
      if (supabaseUserId) {
        checkBookmarkStatus();
      } else {
        setIsBookmarked(false);
      }
    }
  }, [supabase, supabaseUserId, contentId, isLoading]);

  /**
   * 북마크 토글 (추가/삭제)
   */
  const handleToggleBookmark = async () => {
    if (!supabaseUserId || !contentId || isToggling) {
      return;
    }

    setIsToggling(true);

    try {
      if (isBookmarked) {
        // 북마크 삭제
        await removeBookmarkClient(supabase, supabaseUserId, contentId);
        setIsBookmarked(false);
      } else {
        // 북마크 추가
        await addBookmarkClient(supabase, supabaseUserId, contentId);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
      // 에러 발생 시 이전 상태로 복원
      setIsBookmarked(!isBookmarked);
    } finally {
      setIsToggling(false);
    }
  };

  // 로그인하지 않은 사용자를 위한 버튼 (SignInButton으로 감싸기)
  if (!isLoaded || !clerkUserId) {
    return (
      <SignInButton mode="modal">
        <Button
          variant={variant}
          size={size}
          className="gap-2"
          aria-label="북마크 추가 (로그인 필요)"
        >
          <Star className="h-4 w-4" />
        </Button>
      </SignInButton>
    );
  }

  // 로딩 중이거나 Supabase user_id를 가져오지 못한 경우
  if (isLoading || !supabaseUserId) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled
        className="gap-2"
        aria-label="북마크 로딩 중"
      >
        <Star className="h-4 w-4" />
      </Button>
    );
  }

  // 북마크 버튼 (로그인한 사용자)
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleBookmark}
      disabled={isToggling}
      className="gap-2"
      aria-label={isBookmarked ? "북마크 제거" : "북마크 추가"}
    >
      <Star
        className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
        aria-hidden="true"
      />
    </Button>
  );
}

