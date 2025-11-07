/**
 * @file Navbar.tsx
 * @description 네비게이션 바 컴포넌트
 *
 * 헤더 네비게이션 바로, 로고, 검색창, 북마크 링크, 로그인/회원가입 버튼을 포함합니다.
 *
 * 주요 기능:
 * 1. 로고 (My Trip)
 * 2. 검색창 (데스크톱: 헤더 내부, 모바일: 반응형)
 * 3. 북마크 링크 (로그인한 사용자만 표시)
 * 4. 로그인/회원가입 버튼
 *
 * @see {@link /docs/reference/design/DESIGN.md} - 디자인 가이드
 */

"use client";

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React, { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { TourSearch } from "@/components/tour-search";
import { Bookmark, BarChart3 } from "lucide-react";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4 px-4">
        {/* 로고 */}
        <Link href="/" className="text-2xl font-bold shrink-0">
          My Trip
        </Link>

        {/* 검색창 (데스크톱) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <Suspense fallback={<div className="w-full h-10 animate-pulse bg-muted rounded-md" />}>
            <TourSearch className="w-full" />
          </Suspense>
        </div>

        {/* 로그인/회원가입 및 북마크, 통계 */}
        <div className="flex gap-2 items-center shrink-0">
          {/* 통계 링크 (모든 사용자에게 표시) */}
          <Link href="/stats">
            <Button variant="ghost" size="sm" className="gap-2" aria-label="통계 대시보드">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">통계</span>
            </Button>
          </Link>
          
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">
                로그인
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            {/* 북마크 링크 */}
            <Link href="/bookmarks">
              <Button variant="ghost" size="sm" className="gap-2" aria-label="북마크 목록">
                <Bookmark className="h-4 w-4" />
                <span className="hidden sm:inline">북마크</span>
              </Button>
            </Link>
            <UserButton />
          </SignedIn>
        </div>
      </div>

      {/* 검색창 (모바일) */}
      <div className="md:hidden border-t px-4 py-2">
        <Suspense fallback={<div className="w-full h-10 animate-pulse bg-muted rounded-md" />}>
          <TourSearch className="w-full" />
        </Suspense>
      </div>
    </header>
  );
};

export default Navbar;
