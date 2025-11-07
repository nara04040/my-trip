/**
 * @file region-chart.tsx
 * @description 지역별 관광지 분포 차트 컴포넌트
 *
 * 지역별 관광지 개수를 Bar Chart로 시각화하는 컴포넌트입니다.
 * recharts 기반으로 구현되며, 바를 클릭하면 해당 지역의 관광지 목록 페이지로 이동합니다.
 *
 * 주요 기능:
 * 1. 지역별 관광지 개수 Bar Chart 표시
 * 2. 바 클릭 시 해당 지역 목록 페이지로 이동
 * 3. 호버 시 툴팁 표시 (지역명 + 정확한 개수)
 * 4. 반응형 디자인
 * 5. 다크/라이트 모드 지원
 * 6. 접근성 지원 (ARIA 라벨, 키보드 네비게이션)
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.6.1 지역별 관광지 분포)
 * @see {@link /docs/TODO.md} - 작업 목록 (Phase 4.5)
 * @see {@link /lib/types/stats.ts} - 통계 타입 정의
 */

"use client";

import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { RegionStats } from "@/lib/types/stats";

interface RegionChartProps {
  /** 지역별 통계 데이터 */
  regionStats?: RegionStats[];
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 표시할 지역 개수 (기본값: 10) */
  limit?: number;
  /** 추가 클래스명 */
  className?: string;
}

/**
 * 차트 데이터 타입 (recharts 형식)
 */
interface ChartData {
  name: string;
  count: number;
  areaCode: string;
  fill: string;
}

/**
 * 차트 설정 (색상, 라벨 등)
 */
const chartConfig = {
  count: {
    label: "관광지 개수",
    color: "hsl(var(--chart-1))",
  },
} satisfies {
  count: {
    label: string;
    color: string;
  };
};

/**
 * 지역별 분포 차트 스켈레톤 컴포넌트
 */
function RegionChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[400px] w-full" />
      </CardContent>
    </Card>
  );
}

/**
 * 지역별 분포 차트 컴포넌트
 *
 * @example
 * ```tsx
 * // 기본 사용
 * <RegionChart regionStats={regionStats} />
 *
 * // 로딩 상태
 * <RegionChart isLoading={true} />
 *
 * // 커스텀 limit
 * <RegionChart regionStats={regionStats} limit={5} />
 * ```
 */
export function RegionChart({
  regionStats,
  isLoading = false,
  limit = 10,
  className,
}: RegionChartProps) {
  const router = useRouter();

  // 로딩 상태
  if (isLoading || !regionStats) {
    return (
      <div className={cn("", className)}>
        <RegionChartSkeleton />
      </div>
    );
  }

  // 데이터가 없거나 빈 배열일 경우
  if (regionStats.length === 0) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle>지역별 관광지 분포</CardTitle>
          <CardDescription>
            각 지역의 관광지 개수를 비교합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            <p>통계 데이터가 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 상위 limit개 지역만 선택 (이미 정렬되어 있음)
  const displayStats = regionStats.slice(0, limit);

  // recharts 형식으로 데이터 변환
  const chartData: ChartData[] = displayStats.map((region) => ({
    name: region.areaName,
    count: region.count,
    areaCode: region.areaCode,
    fill: chartConfig.count.color,
  }));

  // 바 클릭 핸들러
  const handleBarClick = (data: ChartData) => {
    router.push(`/?areaCode=${data.areaCode}`);
  };

  // 커스텀 툴팁 콘텐츠
  const CustomTooltipContent = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartData;
      return (
        <ChartTooltipContent>
          <div className="flex flex-col gap-2">
            <div className="font-medium">{data.name}</div>
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: data.fill }}
              />
              <span className="text-muted-foreground">
                {chartConfig.count.label}
              </span>
              <span className="font-mono font-semibold tabular-nums">
                {data.count.toLocaleString("ko-KR")}개
              </span>
            </div>
          </div>
        </ChartTooltipContent>
      );
    }
    return null;
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>지역별 관광지 분포</CardTitle>
        <CardDescription>
          각 지역의 관광지 개수를 비교합니다. 바를 클릭하면 해당 지역의 관광지
          목록을 볼 수 있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          role="img"
          aria-label="지역별 관광지 분포 차트. 바를 클릭하면 해당 지역의 관광지 목록을 볼 수 있습니다."
          aria-describedby="region-chart-description"
        >
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
                accessibilityLayer
                aria-label="지역별 관광지 분포"
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  className="text-xs"
                  tickFormatter={(value) => value.toLocaleString("ko-KR")}
                />
                <ChartTooltip content={<CustomTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill={chartConfig.count.color}
                  radius={[4, 4, 0, 0]}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  onClick={(data: any) => {
                    // recharts의 onClick은 activeTooltipIndex와 activeLabel을 제공
                    if (data && data.activeLabel) {
                      const clickedData = chartData.find(
                        (item) => item.name === data.activeLabel
                      );
                      if (clickedData) {
                        handleBarClick(clickedData);
                      }
                    }
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <p id="region-chart-description" className="sr-only">
          지역별 관광지 분포 차트. 상위 {displayStats.length}개 지역의 관광지
          개수를 표시합니다. 각 바를 클릭하면 해당 지역의 관광지 목록 페이지로
          이동합니다. 키보드로 탐색하려면 Tab 키를 사용하세요.
        </p>
        {/* 키보드 접근성을 위한 숨겨진 버튼들 (스크린 리더용) */}
        <div className="sr-only">
          {chartData.map((item, index) => (
            <button
              key={item.areaCode}
              onClick={() => handleBarClick(item)}
              aria-label={`${item.name} 지역: ${item.count.toLocaleString("ko-KR")}개 관광지. 클릭하여 목록 보기`}
            >
              {item.name}: {item.count.toLocaleString("ko-KR")}개
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

