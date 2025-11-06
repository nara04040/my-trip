# My Trip 프로젝트 TODO 리스트

## Phase 1: 기본 구조 & 공통 설정

- [x] `lib/types/` 디렉토리
  - [x] `tour.ts` 타입 정의 (TourItem, TourDetail, TourIntro 등)
- [x] `lib/api/` 디렉토리
  - [x] `tour-api.ts` 한국관광공사 API 호출 함수들
    - [x] `areaCode2` 지역코드 조회
    - [x] `areaBasedList2` 지역 기반 관광정보 조회
    - [x] `searchKeyword2` 키워드 검색
    - [x] `detailCommon2` 공통 정보 조회
    - [x] `detailIntro2` 소개 정보 조회
    - [x] `detailImage2` 이미지 목록 조회
    - [x] `supabase-api.ts` Supabase 쿼리 함수들 (북마크)
    - [x] 북마크 추가/삭제
    - [x] 북마크 목록 조회
    - [x] 북마크 여부 확인
- [x] `components/ui/` 디렉토리
  - [x] 기본 shadcn/ui 컴포넌트 (button, dialog, form, input, label, textarea, accordion)
  - [x] 공통 컴포넌트 (로딩 스피너, 에러 메시지, 스켈레톤 UI)
- [x] `app/` 디렉토리
  - [x] `layout.tsx` 레이아웃 구조 (헤더 포함, Navbar 통합)
- [x] 환경변수 설정
  - [x] `.env` 파일에 한국관광공사 API 키 설정
  - [ ] `.env` 파일에 네이버 지도 클라이언트 ID 설정 (내일 구현 예정)

## Phase 2: 홈페이지 (`/`) - 관광지 목록

### 2.1 페이지 기본 구조
- [x] `app/page.tsx` 홈페이지 레이아웃
  - [x] 기본 UI 구조 (헤더, 메인 영역)
  - [x] 반응형 레이아웃 설정

### 2.2 관광지 목록 기능 (MVP 2.1)
- [x] `components/tour-card.tsx` 관광지 카드 컴포넌트
  - [x] 썸네일 이미지 표시 (없으면 기본 이미지)
  - [x] 관광지명
  - [x] 주소
  - [x] 관광 타입 뱃지
  - [ ] 간단한 개요 (1-2줄) - TourItem 타입에 overview 필드 없음, 상세페이지에서 구현 예정
- [x] `components/tour-list.tsx` 관광지 목록 컴포넌트
  - [x] 카드 형태의 그리드 레이아웃
  - [x] 하드코딩 데이터로 테스트
  - [x] API 연동하여 실제 데이터 표시 (Server Component에서 getAreaBasedList 호출)
  - [x] 로딩 상태 (스켈레톤 UI)
  - [x] 에러 처리 (에러 발생 시 ErrorMessage 표시 및 재시도 버튼)

### 2.3 필터 기능 추가
- [x] `components/tour-filters.tsx` 필터 컴포넌트
  - [x] 지역 필터 UI (시/도 단위 선택, "전체" 옵션)
  - [x] 관광 타입 필터 UI (12, 14, 15, 25, 28, 32, 38, 39, "전체")
  - [x] 필터 상태 관리 (URL searchParams 기반)
  - [x] 필터링된 결과 표시 (Server Component에서 필터 파라미터 기반 API 호출)

### 2.4 검색 기능 추가 (MVP 2.3)
- [x] `components/tour-search.tsx` 검색창 컴포넌트
  - [x] 검색창 UI (헤더에 고정, 모바일 반응형)
  - [x] 검색 아이콘 표시
  - [x] 엔터 또는 검색 버튼 클릭으로 검색 실행
  - [x] 검색 중 로딩 스피너 (TourList의 isLoading 활용)
  - [x] `searchKeyword2` API 연동
  - [x] 검색 결과 표시 (기존 TourList 컴포넌트 재사용)
  - [x] 검색 결과 개수 표시
  - [x] 결과 없음 시 안내 메시지
  - [x] 검색 + 필터 조합 동작 (URL searchParams 통합 관리)

### 2.5 지도 연동 (MVP 2.2) - ⏰ 내일 구현 예정
- [ ] `components/naver-map.tsx` 네이버 지도 컴포넌트
  - [ ] 기본 지도 표시 (Naver Maps API v3 NCP)
  - [ ] 초기 중심 좌표 설정 (선택된 지역 기준)
  - [ ] 줌 레벨 자동 조정
  - [ ] 관광지 마커 표시
  - [ ] 마커 클릭 시 인포윈도우
    - [ ] 관광지명
    - [ ] 간단한 설명
    - [ ] "상세보기" 버튼
  - [ ] 마커 색상 구분 (관광 타입별, 선택 사항)
  - [ ] 지도 컨트롤 (줌 인/아웃, 지도 유형 선택)
- [ ] 리스트-지도 연동
  - [ ] 리스트 항목 클릭 시 해당 마커로 지도 이동
  - [ ] 리스트 항목 호버 시 해당 마커 강조 (선택 사항)
- [ ] 반응형 레이아웃
  - [ ] 데스크톱: 리스트(좌측) + 지도(우측) 분할 레이아웃
  - [ ] 모바일: 탭 형태로 리스트/지도 전환
  - [ ] 지도 최소 높이 설정 (400px 모바일, 600px 데스크톱)

### 2.6 정렬 & 페이지네이션
- [ ] 정렬 옵션
  - [ ] 최신순 (modifiedtime 기준)
  - [ ] 이름순 (가나다순)
- [ ] 페이지네이션
  - [ ] 페이지 번호 선택 또는 무한 스크롤
  - [ ] 페이지당 10-20개 항목

## Phase 3: 상세페이지 (`/places/[contentId]`)

### 3.1 페이지 기본 구조
- [ ] `app/places/[contentId]/page.tsx` 상세페이지
  - [ ] 기본 레이아웃 구조 (뒤로가기 버튼, 섹션 구분)
  - [ ] 라우팅 테스트 (홈에서 클릭 시 이동)
  - [ ] 단일 컬럼 레이아웃 (모바일 우선)
  - [ ] 섹션별 구분선 또는 카드

### 3.2 기본 정보 섹션 (MVP 2.4.1)
- [ ] `components/tour-detail/detail-info.tsx` 기본 정보 컴포넌트
  - [ ] `detailCommon2` API 연동
  - [ ] 관광지명 (대제목)
  - [ ] 대표 이미지 (크게 표시)
  - [ ] 주소 (복사 기능)
  - [ ] 전화번호 (클릭 시 전화 연결)
  - [ ] 홈페이지 (링크)
  - [ ] 개요 (긴 설명문)
  - [ ] 관광 타입 및 카테고리
  - [ ] 정보 없는 항목은 숨김 처리

### 3.3 지도 섹션 (MVP 2.4.4) - ⏰ 내일 구현 예정
- [ ] `components/tour-detail/detail-map.tsx` 지도 컴포넌트
  - [ ] 해당 관광지 위치 표시 (마커 1개)
  - [ ] "길찾기" 버튼 (네이버 지도 앱/웹 연동)
  - [ ] 좌표 정보 표시 (선택 사항)

### 3.4 공유 기능 (MVP 2.4.5)
- [ ] `components/tour-detail/share-button.tsx` 공유 버튼 컴포넌트
  - [ ] URL 복사 기능 (클립보드 API)
  - [ ] 복사 완료 토스트 메시지
  - [ ] 공유 아이콘 버튼 (Share/Link 아이콘)
- [ ] Open Graph 메타태그 동적 생성
  - [ ] `og:title` 관광지명
  - [ ] `og:description` 관광지 설명 (100자 이내)
  - [ ] `og:image` 대표 이미지 (1200x630 권장)
  - [ ] `og:url` 상세페이지 URL
  - [ ] `og:type` "website"

### 3.5 추가 정보 섹션 (향후 구현)
- [ ] `components/tour-detail/detail-intro.tsx` 운영 정보 컴포넌트
  - [ ] `detailIntro2` API 연동
  - [ ] 운영시간 / 개장시간
  - [ ] 휴무일
  - [ ] 이용요금
  - [ ] 주차 가능 여부
  - [ ] 수용인원
  - [ ] 체험 프로그램 (있는 경우)
  - [ ] 유모차/반려동물 동반 가능 여부
- [ ] `components/tour-detail/detail-gallery.tsx` 이미지 갤러리 컴포넌트
  - [ ] `detailImage2` API 연동
  - [ ] 대표 이미지 + 서브 이미지들
  - [ ] 이미지 클릭 시 전체화면 모달
  - [ ] 이미지 슬라이드 기능 (swiper 또는 캐러셀)
  - [ ] 이미지 없으면 기본 이미지

## Phase 4: 북마크 페이지 (`/bookmarks`) - 선택 사항

### 4.1 Supabase 설정
- [x] `supabase/migrations/mytrip_schema.sql` 마이그레이션 파일 (이미 완료)
  - [x] `bookmarks` 테이블 생성
  - [x] RLS 비활성화 (개발 환경)

### 4.2 북마크 기능 구현
- [ ] `components/bookmarks/bookmark-button.tsx` 북마크 버튼 컴포넌트
  - [ ] 별 아이콘 (채워짐/비어있음)
  - [ ] 북마크 추가/제거 기능
  - [ ] Supabase DB 연동
  - [ ] 인증된 사용자 확인
  - [ ] 로그인하지 않은 경우: 로그인 유도 또는 localStorage 임시 저장
- [ ] 상세페이지에 북마크 버튼 추가
  - [ ] `app/places/[contentId]/page.tsx`에 북마크 버튼 통합
  - [ ] 북마크 상태 확인 및 표시

### 4.3 북마크 목록 페이지
- [ ] `app/bookmarks/page.tsx` 북마크 목록 페이지
  - [ ] 인증된 사용자만 접근 가능
- [ ] `components/bookmarks/bookmark-list.tsx` 북마크 목록 컴포넌트
  - [ ] 북마크한 관광지 목록 표시
  - [ ] 카드 레이아웃 (Phase 2.2와 동일한 tour-card 사용)
  - [ ] 정렬 옵션 (최신순, 이름순, 지역별)
  - [ ] 일괄 삭제 기능

## Phase 5: 최적화 & 배포

- [ ] 이미지 최적화
  - [x] `next.config.ts` 기본 설정 (존재)
  - [ ] `next.config.ts` 외부 도메인 설정 (한국관광공사 이미지 도메인 추가 필요)
  - [ ] 이미지 레이지 로딩
  - [ ] Placeholder 이미지 처리
- [ ] 전역 에러 핸들링 개선
  - [ ] API 에러: 에러 메시지 표시 + 재시도 버튼
  - [ ] 네트워크 에러: 오프라인 안내
- [ ] `app/not-found.tsx` 404 페이지
- [ ] SEO 최적화
  - [ ] `app/sitemap.ts` 사이트맵 생성
  - [ ] `app/robots.ts` robots.txt 설정
  - [ ] 메타태그 최적화
- [ ] 성능 측정
  - [ ] Lighthouse 점수 > 80
  - [ ] 페이지 로딩 시간 < 3초
- [ ] 환경변수 보안 검증
  - [ ] 필수 환경변수 체크
  - [ ] API 키 유효성 검증
- [ ] Vercel 배포 및 테스트
  - [ ] 프로덕션 환경 설정
  - [ ] 배포 후 기능 테스트

## 추가 설정 파일

- [x] `app/favicon.ico` 파일
- [ ] `app/manifest.ts` 파일
- [x] `public/` 디렉토리
  - [x] `icons/` 디렉토리 (PWA 아이콘)
  - [x] `logo.png` 파일
  - [x] `og-image.png` 파일 (기본 OG 이미지)