'use client';

import Image from 'next/image';

const screenshots = [
  {
    src: '/screenshots/gaslink/01-camera.png',
    title: '계량기 자동 인식',
    desc: '카메라로 계량기 검침부를 촬영하면 OCR로 지침을 자동 인식. Native 바코드 스캐너와 동일한 I/F로 연동.',
  },
  {
    src: '/screenshots/gaslink/02-meter-reading.png',
    title: '검침 등록',
    desc: '지침 직접 입력·사진 촬영·자동인식 3가지 방식 지원. 전월/전년동월 지침·사용량 비교 표시로 이상값 즉시 감지.',
  },
  {
    src: '/screenshots/gaslink/03-map.png',
    title: '지도 검색',
    desc: '네이버 지도 기반 고객 위치 클러스터링. 현재 위치에서 거리순 정렬 및 작업 시작 원터치 전환.',
  },
  {
    src: '/screenshots/gaslink/04-inspection.png',
    title: '정기 점검',
    desc: '기본점검·보일러·연소기·점검결과 멀티 탭 구조. 설치장소 적합 여부·배관 매립·안전기기 등 항목별 사진 첨부.',
  },
  {
    src: '/screenshots/gaslink/05-visit.png',
    title: '방문 업무 (자재·공임비)',
    desc: '전입 시공 시 호스·밸브 등 품목별 단가/수량 입력. 합계 실시간 계산 및 결제 단계까지 스텝 진행.',
  },
  {
    src: '/screenshots/gaslink/06-meter-replace.png',
    title: '계량기 교체',
    desc: '철거·설치 계량기 기물번호 바코드 스캔 입력. 등급·모델·제조사·AMI 종류 등 교체 이력 자동 기록.',
  },
  {
    src: '/screenshots/gaslink/07-arrears.png',
    title: '체납 업무',
    desc: '납부자 정보·납기구분·분납 여부 한눈에 확인. 자동이체·가상계좌 조회 및 총 체납금액 즉시 표시.',
  },
];

export function GasLinkScreenshots({
  props,
}: {
  props: { orientation?: 'horizontal' | 'vertical' | null };
}) {
  const isVertical = props.orientation === 'vertical';

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isVertical ? '1fr' : 'repeat(2, 1fr)',
        gap: '16px',
      }}
    >
      {screenshots.map((s) => (
        <div
          key={s.src}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          <Image
            src={s.src}
            alt={s.title}
            width={1080}
            height={1920}
            sizes={isVertical ? '100vw' : '(max-width: 768px) 100vw, 50vw'}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              background: '#f8fafc',
            }}
          />
          <div style={{ padding: '8px 10px 10px' }}>
            <div
              style={{ fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}
            >
              {s.title}
            </div>
            <div
              style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}
            >
              {s.desc}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
