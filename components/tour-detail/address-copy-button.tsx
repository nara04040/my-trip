"use client";

/**
 * @file address-copy-button.tsx
 * @description 주소 복사 버튼 컴포넌트
 *
 * 클립보드 API를 사용하여 주소를 복사하는 클라이언트 컴포넌트입니다.
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 */

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddressCopyButtonProps {
  /** 복사할 주소 */
  address: string;
}

/**
 * 주소 복사 버튼 컴포넌트
 *
 * 클립보드에 주소를 복사하고 복사 완료 피드백을 제공합니다.
 *
 * @example
 * ```tsx
 * <AddressCopyButton address="서울특별시 종로구..." />
 * ```
 */
export function AddressCopyButton({ address }: AddressCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
      // Fallback: 텍스트 영역을 사용한 복사
      const textArea = document.createElement("textarea");
      textArea.value = address;
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

