/**
 * @file Navbar.tsx
 * @description 네비게이션 바 컴포넌트
 *
 * 헤더 네비게이션 바로, 로고, 검색창, 로그인/회원가입 버튼을 포함합니다.
 *
 * 주요 기능:
 * 1. 로고 (My Trip)
 * 2. 검색창 (데스크톱: 헤더 내부, 모바일: 반응형)
 * 3. 로그인/회원가입 버튼
 *
 * @see {@link /docs/reference/design/DESIGN.md} - 디자인 가이드
 */

import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { TourSearch } from "@/components/tour-search";

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
          <TourSearch className="w-full" />
        </div>

        {/* 로그인/회원가입 */}
        <div className="flex gap-2 items-center shrink-0">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" size="sm">
                로그인
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>

      {/* 검색창 (모바일) */}
      <div className="md:hidden border-t px-4 py-2">
        <TourSearch className="w-full" />
      </div>
    </header>
  );
};

export default Navbar;
