"use client";

/**
 * @file share-button.tsx
 * @description 공유 버튼 컴포넌트
 *
 * 현재 페이지 URL을 클립보드에 복사하는 공유 버튼 컴포넌트입니다.
 * 클립보드 API를 사용하여 URL을 복사하고 복사 완료 피드백을 제공합니다.
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /docs/TODO.md} - 작업 목록
 */

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  /** 공유할 URL (없으면 현재 페이지 URL 사용) */
  url?: string;
  /** 버튼 텍스트 표시 여부 */
  showText?: boolean;
  /** 버튼 크기 */
  size?: "sm" | "default" | "lg";
  /** 버튼 variant */
  variant?: "default" | "outline" | "ghost" | "secondary";
}

/**
 * 공유 버튼 컴포넌트
 *
 * 현재 페이지 URL을 클립보드에 복사하고 복사 완료 피드백을 제공합니다.
 *
 * @example
 * ```tsx
 * <ShareButton />
 * <ShareButton showText={true} />
 * <ShareButton url="https://example.com" />
 * ```
 */
export function ShareButton({
  url,
  showText = false,
  size = "sm",
  variant = "outline",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // URL이 제공되지 않으면 현재 페이지 URL 사용
    const urlToCopy = url || (typeof window !== "undefined" ? window.location.href : "");

    if (!urlToCopy) {
      console.error("URL not available");
      return;
    }

    try {
      await navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
      // Fallback: 텍스트 영역을 사용한 복사
      const textArea = document.createElement("textarea");
      textArea.value = urlToCopy;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      } catch (err) {
        console.error("Fallback copy failed:", err);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className="gap-2"
      aria-label={copied ? "URL이 복사되었습니다" : "URL 공유"}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          {showText && "복사됨"}
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          {showText && "공유"}
        </>
      )}
    </Button>
  );
}

