// =====================================================
// CSV 내보내기 유틸 — 외부 의존성 없음
// =====================================================
// - csvEscape: 콤마/줄바꿈/따옴표 안전 인용 (RFC 4180)
// - downloadCsv: 헤더 + 행 배열을 CSV 파일로 즉시 다운로드
//   · UTF-8 BOM 추가 (Excel 한글 깨짐 방지)
//   · text/csv;charset=utf-8 MIME

export function csvEscape(v) {
  if (v == null) return ''
  const s = String(v)
  // 콤마·줄바꿈·따옴표 포함 시 큰따옴표로 감싸고 내부 따옴표 두 번
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/**
 * @param {Array<object>} rows         데이터 배열 (각 객체의 key는 headers[].key와 매칭)
 * @param {Array<{key:string,label:string}>} headers  컬럼 정의
 * @param {string} filename            저장 파일명 (.csv 확장자 포함)
 */
export function downloadCsv(rows, headers, filename) {
  const lines = [
    headers.map(h => csvEscape(h.label)).join(','),
    ...rows.map(r => headers.map(h => csvEscape(r[h.key])).join(',')),
  ]
  const csv = lines.join('\n')
  // BOM (U+FEFF) — Excel이 UTF-8 자동 인식
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
