# My Trip 프로젝트 TODO 리스트

## Phase 1: 기본 구조 & 공통 설정

- [x] `lib/types/` 디렉토리
  - [x] `tour.ts` 타입 정의 (TourItem, TourDetail, TourIntro 등)
  - [ ] `tour.ts` 반려동물 타입 추가 (MVP 2.5)
    - [ ] PetTourInfo 인터페이스 정의
    - [ ] chkpetleash (반려동물 동반 여부)
    - [ ] chkpetsize (반려동물 크기)
    - [ ] chkpetplace (입장 가능 장소)
    - [ ] chkpetfee (추가 요금)
    - [ ] petinfo (기타 반려동물 정보)
    - [ ] parking (주차장 정보)
- [x] `lib/api/` 디렉토리
  - [x] `tour-api.ts` 한국관광공사 API 호출 함수들
    - [x] `areaCode2` 지역코드 조회
    - [x] `areaBasedList2` 지역 기반 관광정보 조회
    - [x] `searchKeyword2` 키워드 검색
    - [x] `detailCommon2` 공통 정보 조회
    - [x] `detailIntro2` 소개 정보 조회
    - [x] `detailImage2` 이미지 목록 조회
    - [ ] `detailPetTour2` 반려동물 동반 여행 정보 조회 (MVP 2.5)
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
  - [ ] 반려동물 동반 가능 표시 (MVP 2.5)
    - [ ] 반려동물 아이콘 (🐾) 표시
    - [ ] 크기 제한 뱃지 (소형견 OK, 대형견 OK 등)
    - [ ] 카드 썸네일에 뱃지 배치
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
  - [ ] 반려동물 동반 가능 필터 추가 (MVP 2.5)
    - [ ] 반려동물 필터 토글 UI
    - [ ] 반려동물 크기별 필터 (소형, 중형, 대형)
    - [ ] 실내/실외 동반 가능 여부 필터
    - [ ] 필터 상태 관리 (URL searchParams에 pet 파라미터 추가)
    - [ ] API 연동 시 반려동물 관련 파라미터 전달

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

- [x] 정렬 옵션
  - [x] 최신순 (modifiedtime 기준)
  - [x] 이름순 (가나다순)
- [x] 페이지네이션
  - [x] 페이지 번호 선택 (페이지네이션 UI 컴포넌트 구현)
  - [x] 페이지당 20개 항목

## Phase 3: 상세페이지 (`/places/[contentId]`)

### 3.1 페이지 기본 구조

- [x] `app/places/[contentId]/page.tsx` 상세페이지
  - [x] 기본 레이아웃 구조 (뒤로가기 버튼, 섹션 구분)
  - [x] 라우팅 테스트 (홈에서 클릭 시 이동)
  - [x] 단일 컬럼 레이아웃 (모바일 우선)
  - [x] 섹션별 구분선 또는 카드

### 3.2 기본 정보 섹션 (MVP 2.4.1)

- [x] `components/tour-detail/detail-info.tsx` 기본 정보 컴포넌트
  - [x] `detailCommon2` API 연동
  - [x] 관광지명 (대제목)
  - [x] 대표 이미지 (크게 표시)
  - [x] 주소 (복사 기능)
  - [x] 전화번호 (클릭 시 전화 연결)
  - [x] 홈페이지 (링크, HTML 태그 처리 포함)
  - [x] 개요 (긴 설명문, HTML 태그 제거)
  - [x] 관광 타입 및 카테고리
  - [x] 정보 없는 항목은 숨김 처리

### 3.3 지도 섹션 (MVP 2.4.4) - ⏰ 내일 구현 예정

- [ ] `components/tour-detail/detail-map.tsx` 지도 컴포넌트
  - [ ] 해당 관광지 위치 표시 (마커 1개)
  - [ ] "길찾기" 버튼 (네이버 지도 앱/웹 연동)
  - [ ] 좌표 정보 표시 (선택 사항)

### 3.4 공유 기능 (MVP 2.4.5)

- [x] `components/tour-detail/share-button.tsx` 공유 버튼 컴포넌트
  - [x] URL 복사 기능 (클립보드 API)
  - [x] 복사 완료 토스트 메시지
  - [x] 공유 아이콘 버튼 (Share2 아이콘)
- [x] Open Graph 메타태그 동적 생성
  - [x] `og:title` 관광지명
  - [x] `og:description` 관광지 설명 (100자 이내)
  - [x] `og:image` 대표 이미지 (1200x630 권장)
  - [x] `og:url` 상세페이지 URL
  - [x] `og:type` "website"

### 3.5 추가 정보 섹션

- [x] `components/tour-detail/detail-intro.tsx` 운영 정보 컴포넌트
  - [x] `detailIntro2` API 연동
  - [x] 운영시간 / 개장시간
  - [x] 휴무일
  - [x] 이용요금
  - [x] 주차 가능 여부
  - [x] 수용인원
  - [x] 체험 프로그램 (있는 경우)
  - [x] 유모차/반려동물 동반 가능 여부
  - [x] HTML 태그 제거 기능 (br 태그는 줄바꿈으로 변환)
- [x] `components/tour-detail/detail-gallery.tsx` 이미지 갤러리 컴포넌트
  - [x] `detailImage2` API 연동
  - [x] 대표 이미지 + 서브 이미지들 (그리드 레이아웃)
  - [x] 이미지 클릭 시 전체화면 모달
  - [x] 이미지 슬라이드 기능 (이전/다음 버튼, 키보드 네비게이션)
  - [x] 이미지 없으면 기본 이미지
  - [x] 접근성 개선 (DialogTitle 추가, 스크린 리더 지원)

### 3.6 반려동물 정보 섹션 (MVP 2.5)

- [ ] `components/tour-detail/detail-pet-tour.tsx` 반려동물 정보 컴포넌트
  - [ ] `detailPetTour2` API 연동
  - [ ] 반려동물 동반 가능 여부 표시
    - [ ] 반려동물 아이콘 (🐾) 표시
    - [ ] 동반 가능/불가능 상태 명확히 표시
  - [ ] 반려동물 크기 제한 정보
    - [ ] 소형견 가능 여부
    - [ ] 중형견 가능 여부
    - [ ] 대형견 가능 여부
    - [ ] 크기별 뱃지 디자인
  - [ ] 반려동물 입장 가능 장소
    - [ ] 실내 동반 가능 여부
    - [ ] 실외 동반 가능 여부
    - [ ] 특정 구역 제한 정보
  - [ ] 추가 요금 정보
    - [ ] 반려동물 입장료 표시
    - [ ] 요금 없으면 "무료" 표시
  - [ ] 반려동물 전용 시설 정보
    - [ ] 주차장 정보 (반려동물 하차 공간)
    - [ ] 산책로 정보
    - [ ] 배변 봉투 제공 여부
    - [ ] 음수대 위치
  - [ ] 기타 반려동물 정보
    - [ ] 목줄 착용 의무 안내
    - [ ] 주의사항 표시
    - [ ] 문의처 정보
  - [ ] UI/UX 요구사항
    - [ ] 아이콘 기반 정보 표시 (직관적)
    - [ ] 주의사항 강조 표시
    - [ ] 정보 없는 항목은 숨김 처리
    - [ ] 모바일 반응형 디자인
    - [ ] HTML 태그 제거 기능 (br 태그는 줄바꿈으로 변환)
  - [ ] 접근성
    - [ ] 적절한 ARIA 라벨
    - [ ] 스크린 리더 지원
    - [ ] 키보드 네비게이션
- [ ] 상세페이지에 반려동물 섹션 통합
  - [ ] `app/places/[contentId]/page.tsx`에 DetailPetTour 컴포넌트 추가
  - [ ] 반려동물 정보 섹션 배치 (기본 정보 다음)
  - [ ] 반려동물 정보가 없으면 섹션 숨김
  - [ ] 로딩 상태 처리
  - [ ] 에러 처리

## Phase 4: 통계 대시보드 페이지 (`/stats`)

- 참고페이지 : https://ui.shadcn.com/docs/components/chart

### 4.1 페이지 기본 구조

- [ ] `app/stats/page.tsx` 통계 대시보드 페이지 생성
  - [ ] 기본 레이아웃 구조 (헤더, 섹션 구분)
  - [ ] 반응형 레이아웃 설정 (모바일 우선)
  - [ ] 단일 컬럼 레이아웃
  - [ ] 뒤로가기 버튼 또는 네비게이션

### 4.2 타입 정의

- [ ] `lib/types/stats.ts` 통계 타입 정의 파일 생성
  - [ ] `RegionStats` 인터페이스 정의
    - [ ] 지역 코드 (areaCode)
    - [ ] 지역명 (areaName)
    - [ ] 관광지 개수 (count)
  - [ ] `TypeStats` 인터페이스 정의
    - [ ] 타입 코드 (contentTypeId)
    - [ ] 타입명 (typeName)
    - [ ] 관광지 개수 (count)
    - [ ] 비율 (percentage)
  - [ ] `StatsSummary` 인터페이스 정의
    - [ ] 전체 관광지 수 (totalCount)
    - [ ] 상위 3개 지역 (topRegions)
    - [ ] 상위 3개 타입 (topTypes)
    - [ ] 마지막 업데이트 시간 (lastUpdated)

### 4.3 통계 데이터 수집 함수

- [ ] `lib/api/stats-api.ts` 통계 API 함수 파일 생성
  - [ ] `getRegionStats()` 함수 구현
    - [ ] 모든 지역 코드 조회 (`areaCode2` API)
    - [ ] 각 지역별 관광지 개수 집계 (`areaBasedList2` API, totalCount 활용)
    - [ ] RegionStats[] 형태로 반환
    - [ ] 에러 처리
  - [ ] `getTypeStats()` 함수 구현
    - [ ] 각 타입별 관광지 개수 집계 (`areaBasedList2` API, totalCount 활용)
    - [ ] 타입 코드: 12, 14, 15, 25, 28, 32, 38, 39
    - [ ] 비율 계산 (각 타입 개수 / 전체 개수 \* 100)
    - [ ] TypeStats[] 형태로 반환
    - [ ] 에러 처리
  - [ ] `getStatsSummary()` 함수 구현
    - [ ] getRegionStats()와 getTypeStats() 병렬 호출
    - [ ] 전체 관광지 수 계산
    - [ ] Top 3 지역 추출 (개수 기준 정렬)
    - [ ] Top 3 타입 추출 (개수 기준 정렬)
    - [ ] 현재 시간을 lastUpdated로 설정
    - [ ] StatsSummary 형태로 반환
    - [ ] 에러 처리

### 4.4 통계 요약 카드

- [ ] `components/stats/stats-summary.tsx` 통계 요약 카드 컴포넌트 생성
  - [ ] StatsSummary 타입 props 받기
  - [ ] 전체 관광지 수 표시 (큰 숫자로 강조)
  - [ ] Top 3 지역 표시 (지역명 + 개수)
  - [ ] Top 3 타입 표시 (타입명 + 개수)
  - [ ] 마지막 업데이트 시간 표시 (상대 시간 표시)
  - [ ] 카드 레이아웃 디자인 (그리드 또는 플렉스)
  - [ ] 로딩 상태 처리 (Skeleton UI)
  - [ ] 아이콘 추가 (lucide-react 사용)
  - [ ] 반응형 디자인

### 4.5 지역별 분포 차트 (Bar Chart)

- [ ] shadcn/ui Chart 컴포넌트 설치
  - [ ] `pnpx shadcn@latest add chart` 실행
- [ ] `components/stats/region-chart.tsx` 지역별 분포 차트 컴포넌트 생성
  - [ ] RegionStats[] 타입 props 받기
  - [ ] recharts 기반 Bar Chart 구현
    - [ ] X축: 지역명 (areaName)
    - [ ] Y축: 관광지 개수 (count)
    - [ ] 상위 10개 지역만 표시 (또는 전체)
  - [ ] 바 클릭 핸들러 구현
    - [ ] 클릭 시 해당 지역의 관광지 목록 페이지로 이동 (`/?areaCode={code}`)
  - [ ] 호버 시 툴팁 표시 (지역명 + 정확한 개수)
  - [ ] 다크/라이트 모드 지원 (shadcn 테마 활용)
  - [ ] 반응형 디자인 (모바일/태블릿/데스크톱)
  - [ ] 로딩 상태 처리
  - [ ] 접근성
    - [ ] ARIA 라벨 추가
    - [ ] 키보드 네비게이션 지원
    - [ ] 스크린 리더 지원
  - [ ] 차트 제목 및 설명 추가

### 4.6 타입별 분포 차트 (Donut Chart)

- [ ] `components/stats/type-chart.tsx` 타입별 분포 차트 컴포넌트 생성
  - [ ] TypeStats[] 타입 props 받기
  - [ ] recharts 기반 Donut Chart 구현
    - [ ] 타입별 비율 및 개수 표시
    - [ ] 각 섹션에 타입명 라벨
    - [ ] 중앙에 전체 개수 표시 (선택 사항)
  - [ ] 섹션 클릭 핸들러 구현
    - [ ] 클릭 시 해당 타입의 관광지 목록 페이지로 이동 (`/?contentTypeId={id}`)
  - [ ] 호버 시 툴팁 표시 (타입명 + 개수 + 비율)
  - [ ] 범례 표시 (타입명 + 개수 + 비율)
  - [ ] 다크/라이트 모드 지원 (shadcn 테마 활용)
  - [ ] 반응형 디자인 (모바일/태블릿/데스크톱)
  - [ ] 로딩 상태 처리
  - [ ] 접근성
    - [ ] ARIA 라벨 추가
    - [ ] 스크린 리더 지원
  - [ ] 차트 제목 및 설명 추가

### 4.7 페이지 통합 및 최적화

- [ ] `app/stats/page.tsx`에 모든 컴포넌트 통합
  - [ ] getStatsSummary() 호출하여 데이터 가져오기
  - [ ] 통계 요약 카드 배치 (상단)
  - [ ] 지역별 분포 차트 배치 (중단)
  - [ ] 타입별 분포 차트 배치 (하단)
  - [ ] 섹션별 구분선 또는 간격 설정
- [ ] Server Component로 구현
- [ ] Next.js 데이터 캐싱 설정
  - [ ] `export const revalidate = 3600` (1시간마다 재검증)
- [ ] 에러 처리
  - [ ] API 에러 시 에러 메시지 표시
  - [ ] 재시도 버튼 제공
  - [ ] 에러 바운더리 추가 (선택 사항)
- [ ] 네비게이션에 통계 페이지 링크 추가
  - [ ] `components/navbar.tsx` 또는 헤더에 "통계" 메뉴 추가
  - [ ] 아이콘 추가 (BarChart3 또는 PieChart)
- [ ] 메타데이터 설정
  - [ ] 페이지 제목 설정 (예: "통계 - My Trip")
  - [ ] 페이지 설명 설정
  - [ ] Open Graph 메타태그 (선택 사항)
- [ ] 최종 페이지 확인
  - [ ] 모바일 반응형 확인
  - [ ] 다크/라이트 모드 확인
  - [ ] 차트 인터랙션 테스트 (클릭, 호버)
  - [ ] 로딩 상태 확인
  - [ ] 에러 처리 확인

## Phase 5: 북마크 페이지 (`/bookmarks`) - 선택 사항

### 5.1 Supabase 설정

- [x] `supabase/migrations/mytrip_schema.sql` 마이그레이션 파일 (이미 완료)
  - [x] `bookmarks` 테이블 생성
  - [x] RLS 비활성화 (개발 환경)

### 5.2 북마크 기능 구현

- [ ] `components/bookmarks/bookmark-button.tsx` 북마크 버튼 컴포넌트
  - [ ] 별 아이콘 (채워짐/비어있음)
  - [ ] 북마크 추가/제거 기능
  - [ ] Supabase DB 연동
  - [ ] 인증된 사용자 확인
  - [ ] 로그인하지 않은 경우: 로그인 유도 또는 localStorage 임시 저장
- [ ] 상세페이지에 북마크 버튼 추가
  - [ ] `app/places/[contentId]/page.tsx`에 북마크 버튼 통합
  - [ ] 북마크 상태 확인 및 표시

### 5.3 북마크 목록 페이지

- [ ] `app/bookmarks/page.tsx` 북마크 목록 페이지
  - [ ] 인증된 사용자만 접근 가능
- [ ] `components/bookmarks/bookmark-list.tsx` 북마크 목록 컴포넌트
  - [ ] 북마크한 관광지 목록 표시
  - [ ] 카드 레이아웃 (Phase 2.2와 동일한 tour-card 사용)
  - [ ] 정렬 옵션 (최신순, 이름순, 지역별)
  - [ ] 일괄 삭제 기능

## Phase 6: 최적화 & 배포

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
    - [ ] 홈페이지 Open Graph 메타태그 추가
      - [ ] `app/layout.tsx` 메타데이터 개선
      - [ ] `og:title` 사이트명 (예: "My Trip - 한국 관광지 탐험")
      - [ ] `og:description` 사이트 설명 (예: "한국의 다양한 관광지를 탐색하고 여행을 계획해보세요")
      - [ ] `og:image` 기본 OG 이미지 (`/og-image.png` 사용)
      - [ ] `og:url` 홈페이지 절대 URL
      - [ ] `og:type` "website"
    - [ ] 환경변수 설정
      - [ ] `NEXT_PUBLIC_SITE_URL` 환경변수 추가 (배포 URL)
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
