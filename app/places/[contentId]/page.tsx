/**
 * @file page.tsx
 * @description 관광지 상세페이지
 *
 * 관광지의 상세 정보를 표시하는 페이지입니다.
 * Server Component에서 한국관광공사 API를 호출하여 실제 데이터를 가져옵니다.
 *
 * 주요 기능:
 * 1. 관광지 기본 정보 표시 (3.2 완료)
 * 2. 지도 섹션 (3.3 완료)
 *    - 네이버 지도에 단일 마커 표시
 *    - 길찾기 버튼 (네이버 지도 앱/웹 연동)
 *    - 좌표 복사 기능
 * 3. 공유 기능 (3.4 완료)
 *    - URL 복사 기능
 *    - Open Graph 메타태그 동적 생성
 * 4. 운영 정보 섹션 (3.5 완료)
 *    - 운영시간, 휴무일, 이용요금, 주차, 수용인원, 체험 프로그램, 유모차/반려동물 동반
 * 5. 이미지 갤러리 섹션 (3.5 완료)
 *    - 이미지 그리드 레이아웃, 전체화면 모달, 슬라이드 기능
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서
 * @see {@link /docs/TODO.md} - 작업 목록
 * @see {@link /docs/reference/design/DESIGN.md} - 디자인 가이드
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  getDetailCommon,
  getDetailIntro,
  getDetailImage,
} from "@/lib/api/tour-api";
import type { ContentTypeId } from "@/lib/types/tour";
import { Button } from "@/components/ui/button";
import { DetailInfo } from "@/components/tour-detail/detail-info";
import { DetailIntro } from "@/components/tour-detail/detail-intro";
import { DetailGallery } from "@/components/tour-detail/detail-gallery";
import { DetailMapWrapper } from "@/components/tour-detail/detail-map-wrapper";
import { ShareButton } from "@/components/tour-detail/share-button";

interface PlaceDetailPageProps {
  params: Promise<{
    contentId: string;
  }>;
}

/**
 * HTML 태그 제거 및 텍스트 정리 유틸리티 함수
 */
function cleanHtmlText(text: string): string {
  return text
    .replace(/<[^>]*>/g, "") // HTML 태그 제거
    .replace(/&nbsp;/g, " ") // &nbsp;를 공백으로
    .replace(/&amp;/g, "&") // &amp;를 &로
    .replace(/&lt;/g, "<") // &lt;를 <로
    .replace(/&gt;/g, ">") // &gt;를 >로
    .replace(/&quot;/g, '"') // &quot;를 "로
    .trim();
}

/**
 * 절대 URL 생성 함수
 */
function getAbsoluteUrl(path: string): string {
  // 환경변수에서 사이트 URL 가져오기
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000";

  // 프로토콜이 없으면 https 추가 (Vercel URL의 경우)
  const baseUrl = siteUrl.startsWith("http")
    ? siteUrl
    : `https://${siteUrl}`;

  // 경로가 /로 시작하지 않으면 추가
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

/**
 * 동적 메타데이터 생성 함수
 *
 * Next.js 15 App Router의 generateMetadata를 사용하여
 * 각 관광지 상세페이지에 맞는 Open Graph 메타태그를 동적으로 생성합니다.
 */
export async function generateMetadata({
  params,
}: PlaceDetailPageProps): Promise<Metadata> {
  const { contentId } = await params;

  // 관광지 상세 정보 조회
  let tourDetail;
  try {
    tourDetail = await getDetailCommon(contentId);
  } catch (error) {
    console.error("Failed to fetch tour detail for metadata:", error);
    // 에러 발생 시 기본 메타데이터 반환
    return {
      title: "관광지 상세 | My Trip",
      description: "한국의 다양한 관광지를 탐험해보세요.",
    };
  }

  // 데이터가 없으면 기본 메타데이터 반환
  if (!tourDetail) {
    return {
      title: "관광지 상세 | My Trip",
      description: "한국의 다양한 관광지를 탐험해보세요.",
    };
  }

  // 설명 텍스트 처리 (HTML 태그 제거, 100자 이내)
  const description = tourDetail.overview
    ? cleanHtmlText(tourDetail.overview).slice(0, 100)
    : `${tourDetail.title}에 대한 정보를 확인해보세요.`;

  // 이미지 URL 처리
  const imageUrl =
    tourDetail.firstimage ||
    tourDetail.firstimage2 ||
    getAbsoluteUrl("/og-image.png");

  // 절대 URL로 변환 (이미지가 상대 경로인 경우)
  const absoluteImageUrl = imageUrl.startsWith("http")
    ? imageUrl
    : getAbsoluteUrl(imageUrl);

  // 상세페이지 절대 URL
  const pageUrl = getAbsoluteUrl(`/places/${contentId}`);

  return {
    title: `${tourDetail.title} | My Trip`,
    description,
    openGraph: {
      type: "website",
      url: pageUrl,
      title: tourDetail.title,
      description,
      images: [
        {
          url: absoluteImageUrl,
          width: 1200,
          height: 630,
          alt: tourDetail.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: tourDetail.title,
      description,
      images: [absoluteImageUrl],
    },
  };
}

/**
 * 관광지 상세페이지 컴포넌트
 *
 * Server Component에서 한국관광공사 API를 호출하여 관광지 상세 정보를 가져옵니다.
 * 데이터가 없으면 404 페이지로 리다이렉트합니다.
 *
 * @param params URL 파라미터
 *   - contentId: 관광지 콘텐츠 ID
 */
export default async function PlaceDetailPage({
  params,
}: PlaceDetailPageProps) {
  const { contentId } = await params;

  // 관광지 상세 정보 조회
  let tourDetail;
  try {
    tourDetail = await getDetailCommon(contentId);
  } catch (error) {
    console.error("Failed to fetch tour detail:", error);
    notFound();
  }

  // 데이터가 없으면 404 페이지로 리다이렉트
  if (!tourDetail) {
    notFound();
  }

  // 운영 정보 조회 (contenttypeid가 유효한 경우에만)
  let tourIntro = null;
  try {
    // contenttypeid가 ContentTypeId 타입인지 확인
    const validContentTypeIds = [
      "12",
      "14",
      "15",
      "25",
      "28",
      "32",
      "38",
      "39",
    ];
    if (validContentTypeIds.includes(tourDetail.contenttypeid)) {
      tourIntro = await getDetailIntro(
        contentId,
        tourDetail.contenttypeid as ContentTypeId
      );
    }
  } catch (error) {
    // 운영 정보 조회 실패 시에도 페이지는 계속 표시 (기본 정보만 표시)
    console.error("Failed to fetch tour intro:", error);
  }

  // 이미지 목록 조회
  let tourImages = [];
  try {
    tourImages = await getDetailImage(contentId);
  } catch (error) {
    // 이미지 조회 실패 시에도 페이지는 계속 표시 (이미지 갤러리만 표시 안 함)
    console.error("Failed to fetch tour images:", error);
  }

  return (
    <main className="container max-w-4xl py-8 px-4 md:px-6">
      {/* 뒤로가기 버튼 및 공유 버튼 */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            뒤로가기
          </Button>
        </Link>
        <ShareButton />
      </div>

      {/* 기본 정보 섹션 */}
      <DetailInfo tour={tourDetail} />

      {/* 섹션 구분선 */}
      <hr className="my-8 border-border" />

      {/* 운영 정보 섹션 */}
      {tourIntro && (
        <>
          <DetailIntro tourIntro={tourIntro} />
          <hr className="my-8 border-border" />
        </>
      )}

      {/* 이미지 갤러리 섹션 */}
      <DetailGallery images={tourImages} title={tourDetail.title} />

      {/* 지도 섹션 */}
      <hr className="my-8 border-border" />
      <DetailMapWrapper tour={tourDetail} />
    </main>
  );
}

