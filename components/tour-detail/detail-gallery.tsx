/**
 * @file detail-gallery.tsx
 * @description 관광지 이미지 갤러리 컴포넌트
 *
 * 관광지 상세페이지에서 이미지 갤러리를 표시하는 컴포넌트입니다.
 * 대표 이미지와 서브 이미지들을 그리드 레이아웃으로 표시하고,
 * 이미지 클릭 시 전체화면 모달에서 슬라이드로 볼 수 있습니다.
 *
 * 주요 기능:
 * 1. 이미지 그리드 레이아웃 표시
 * 2. 이미지 클릭 시 전체화면 모달
 * 3. 이미지 슬라이드 기능 (이전/다음 버튼, 키보드 네비게이션)
 * 4. 이미지 없으면 기본 이미지 표시
 *
 * @see {@link /docs/PRD.md} - 프로젝트 요구사항 문서 (2.4.3 이미지 갤러리)
 * @see {@link /docs/TODO.md} - 작업 목록
 * @see {@link /docs/reference/design/DESIGN.md} - 디자인 가이드
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ImageIcon } from "lucide-react";
import type { TourImage } from "@/lib/types/tour";
import {
  Dialog,
  DialogContent,
  DialogTitle,  // 추가
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DetailGalleryProps {
  /** 관광지 이미지 목록 */
  images: TourImage[];
  /** 관광지명 (이미지 alt 텍스트용) */
  title: string;
}

/**
 * 관광지 이미지 갤러리 컴포넌트
 *
 * @example
 * ```tsx
 * <DetailGallery images={tourImages} title={tourTitle} />
 * ```
 */
export function DetailGallery({ images, title }: DetailGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // 키보드 네비게이션 (화살표 키)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;

      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, selectedIndex]);

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedIndex(null);
  };

  const handlePrevious = () => {
    if (selectedIndex === null) return;
    const newIndex =
      selectedIndex === 0 ? images.length - 1 : selectedIndex - 1;
    setSelectedIndex(newIndex);
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    const newIndex =
      selectedIndex === images.length - 1 ? 0 : selectedIndex + 1;
    setSelectedIndex(newIndex);
  };

  // 이미지가 없으면 기본 이미지 표시
  if (images.length === 0) {
    return (
      <section className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          이미지 갤러리
        </h2>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted flex items-center justify-center">
          <Image
            src="/og-image.png"
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
            unoptimized
          />
        </div>
      </section>
    );
  }

  // 첫 번째 이미지를 대표 이미지로, 나머지를 서브 이미지로
  const mainImage = images[0];
  const subImages = images.slice(1);

  return (
    <>
      <section className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          이미지 갤러리
        </h2>

        <div className="space-y-4">
          {/* 대표 이미지 */}
          <div
            className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => handleImageClick(0)}
          >
            <Image
              src={mainImage.originimgurl || mainImage.smallimageurl}
              alt={mainImage.imgname || title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
              unoptimized
            />
          </div>

          {/* 서브 이미지 그리드 (있을 경우) */}
          {subImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {subImages.map((image, index) => (
                <div
                  key={`${image.contentid}-${image.serialnum || index}`}
                  className="relative aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleImageClick(index + 1)}
                >
                  <Image
                    src={image.smallimageurl || image.originimgurl}
                    alt={image.imgname || `${title} - 이미지 ${index + 2}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    unoptimized
                  />
                  {/* 더보기 오버레이 (마지막 이미지에만) */}
                  {index === subImages.length - 1 && subImages.length >= 4 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        +{images.length - 4}개 더보기
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 전체화면 모달 */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[100vw] w-screen h-screen max-h-screen p-0 bg-black/90 border-0 shadow-none [&>button]:hidden">
          {/* 접근성을 위한 숨겨진 제목 */}
          <DialogTitle className="sr-only">
            {selectedIndex !== null
              ? `${title} - 이미지 ${selectedIndex + 1} / ${images.length}`
              : `${title} 이미지 갤러리`}
          </DialogTitle>
          
          <div className="relative w-full h-full flex items-center justify-center">
            {/* 닫기 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={handleClose}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* 이전 버튼 */}
            {images.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 z-50 text-white hover:bg-white/20"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            )}

            {/* 이미지 */}
            {selectedIndex !== null && (
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={
                    images[selectedIndex].originimgurl ||
                    images[selectedIndex].smallimageurl
                  }
                  alt={
                    images[selectedIndex].imgname ||
                    `${title} - 이미지 ${selectedIndex + 1}`
                  }
                  fill
                  className="object-contain"
                  sizes="100vw"
                  unoptimized
                />
              </div>
            )}

            {/* 다음 버튼 */}
            {images.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 z-50 text-white hover:bg-white/20"
                onClick={handleNext}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            )}

            {/* 이미지 인덱스 표시 */}
            {images.length > 1 && selectedIndex !== null && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
                {selectedIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

