/**
 * @file error-message.tsx
 * @description 에러 메시지 컴포넌트
 *
 * API 에러, 네트워크 에러 등 다양한 에러 상황을 표시하는 컴포넌트입니다.
 * 재시도 버튼을 포함하여 사용자가 쉽게 다시 시도할 수 있도록 합니다.
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 */

import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  /** 에러 메시지 */
  message?: string;
  /** 에러 타입 */
  type?: "api" | "network" | "generic";
  /** 재시도 버튼 클릭 핸들러 */
  onRetry?: () => void;
  /** 재시도 버튼 텍스트 */
  retryText?: string;
  /** 추가 클래스명 */
  className?: string;
  /** 전체 높이 사용 (중앙 정렬) */
  fullHeight?: boolean;
}

/**
 * 에러 메시지 컴포넌트
 *
 * @example
 * ```tsx
 * // API 에러
 * <ErrorMessage
 *   type="api"
 *   message="관광지 정보를 불러오는데 실패했습니다."
 *   onRetry={() => refetch()}
 * />
 *
 * // 네트워크 에러
 * <ErrorMessage
 *   type="network"
 *   message="인터넷 연결을 확인해주세요."
 *   onRetry={() => window.location.reload()}
 * />
 *
 * // 일반 에러
 * <ErrorMessage message="오류가 발생했습니다." />
 * ```
 */
export function ErrorMessage({
  message,
  type = "generic",
  onRetry,
  retryText = "다시 시도",
  className,
  fullHeight = false,
}: ErrorMessageProps) {
  const defaultMessages = {
    api: "데이터를 불러오는데 실패했습니다.",
    network: "네트워크 연결을 확인해주세요.",
    generic: "오류가 발생했습니다.",
  };

  const displayMessage = message || defaultMessages[type];

  const iconMap = {
    api: AlertCircle,
    network: WifiOff,
    generic: AlertCircle,
  };

  const Icon = iconMap[type];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-8 text-center",
        fullHeight && "min-h-[400px]",
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <Icon className="size-12 text-destructive" aria-hidden="true" />
      <div className="flex flex-col gap-2">
        <p className="text-lg font-medium text-foreground">{displayMessage}</p>
        {type === "network" && (
          <p className="text-sm text-muted-foreground">
            오프라인 상태이거나 네트워크 연결이 불안정합니다.
          </p>
        )}
      </div>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="mt-2"
          aria-label="다시 시도"
        >
          <RefreshCw className="mr-2 size-4" />
          {retryText}
        </Button>
      )}
    </div>
  );
}

