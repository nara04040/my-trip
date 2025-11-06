/**
 * @file loading-spinner.tsx
 * @description 로딩 스피너 컴포넌트
 *
 * 다양한 크기와 스타일의 로딩 스피너를 제공합니다.
 * 지도, 버튼, 전체 페이지 등 다양한 상황에서 사용할 수 있습니다.
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 */

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  /** 스피너 크기 */
  size?: "sm" | "md" | "lg";
  /** 추가 클래스명 */
  className?: string;
  /** 텍스트 표시 여부 */
  showText?: boolean;
  /** 커스텀 텍스트 */
  text?: string;
}

const sizeMap = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
};

/**
 * 로딩 스피너 컴포넌트
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <LoadingSpinner />
 *
 * // 큰 스피너 + 텍스트
 * <LoadingSpinner size="lg" showText text="지도를 불러오는 중..." />
 *
 * // 버튼 내부 사용
 * <Button disabled>
 *   <LoadingSpinner size="sm" />
 *   저장 중...
 * </Button>
 * ```
 */
export function LoadingSpinner({
  size = "md",
  className,
  showText = false,
  text = "로딩 중...",
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
    >
      <Loader2
        className={cn(
          "animate-spin text-primary",
          sizeMap[size],
          !showText && className
        )}
        aria-label="로딩 중"
      />
      {showText && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
}

