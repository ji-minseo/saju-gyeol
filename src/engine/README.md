# Calculation engine

사주 계산만 담당하는 순수 로직을 이 디렉터리에 둡니다.

## 원칙
- UI와 해석 문장을 import하지 않는다.
- 입력과 출력 스키마를 고정한다.
- 기준이 확정된 규칙만 구현한다.
- 절기/날짜/시간 경계 케이스를 golden test로 고정한다.
- 엔진 버전 변경 시 methodology 문서에도 기준 변경을 기록한다.

## 예정 출력
- fourPillars
- fiveElements
- tenGods
- metadata: engineVersion, calculationStandard

대운/세운은 기본 명식 검증 후 별도 모듈로 확장합니다.
