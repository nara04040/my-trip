"use client";

/**
 * @file coordinates-copy-button.tsx
 * @description 좌표 복사 버튼 컴포넌트
 *
 * 클립보드 API를 사용하여 좌표(위도, 경도)를 복사하는 클라이언트 컴포넌트입니다.
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 */

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CoordinatesCopyButtonProps {
  /** 위도 */
  latitude: number;
  /** 경도 */
  longitude: number;
}

/**
 * 좌표 복사 버튼 컴포넌트
 *
 * 클립보드에 좌표를 복사하고 복사 완료 피드백을 제공합니다.
 * 좌표는 "위도: {latitude}, 경도: {longitude}" 형식으로 복사됩니다.
 *
 * @example
 * ```tsx
 * <CoordinatesCopyButton latitude={37.5665} longitude={126.9780} />
 * ```
 */
export function CoordinatesCopyButton({
  latitude,
  longitude,
}: CoordinatesCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  // 좌표 텍스트 생성 (예: "위도: 37.5665, 경도: 126.9780")
  const coordinatesText = `위도: ${latitude}, 경도: ${longitude}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coordinatesText);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy coordinates:", error);
      // Fallback: 텍스트 영역을 사용한 복사
      const textArea = document.createElement("textarea");
      textArea.value = coordinatesText;
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
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="h-8 gap-2"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          복사됨
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          복사
        </>
      )}
    </Button>
  );
}

