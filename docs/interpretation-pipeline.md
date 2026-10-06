# Saju Gyeol interpretation pipeline

사주결의 해석은 긴 문장을 바로 생성하지 않는다.
**검증된 계산 사실 → 명리 규칙에 따른 파생 판단 → 사용자용 서술**의 3층으로 분리한다.

## Layer A · Verified chart facts

계산 엔진이 결정적으로 산출할 수 있는 값만 포함한다.

현재:
- 년주 / 월주 / 일주 / 시주
- 일간
- 천간 십성
- 지지 대표 십성(정기/본기 기준)
- 표면 오행 분포
- 지장간 여·중·정

추가 예정:
- 12운성
- 합·충·형·파·해
- 공망
- 대운 방향 / 기산 시점 / 대운 배열
- 세운

이 층에는 해석 문장을 넣지 않는다.

## Layer B · Derived judgments

학파 또는 판단 규칙이 필요한 항목이다.
반드시 methodId와 confidence를 가진다.

예:
- 신강 / 신약 / 중화
- 격국
- 용신 / 희신 / 기신
- 식상 발달, 관성 약화 같은 구조적 요약
- 대운·세운에서 원국과 생기는 관계

형식 예:

```js
{
  id: "balance.day-master",
  value: "balanced-weak",
  methodId: "balance-v1",
  confidence: "medium",
  evidence: ["month.branch", "hour.branch", "stems.resource", "elements.surface"],
  alternatives: ["balanced"]
}
```

서로 다른 명리 관법에서 결과가 달라질 수 있는 경우
하나를 절대적 사실처럼 표시하지 않는다.

## Layer C · Narrative reading

사용자가 실제로 읽는 문장.

각 문장은 가능하면 다음 요소를 가진다.

```js
{
  category: "career",
  title: "표현과 기술을 결과물로 바꾸는 타입",
  summary: "...",
  evidence: ["structure.output", "tenGod.monthBranch", "element.metal.hidden"],
  confidence: "medium",
  tone: "interpretive"
}
```

UI에는 필요할 때 `왜 이렇게 읽었나요?`를 펼쳐
근거가 되는 원국 요소를 볼 수 있게 한다.

## Recommended result structure

1. 한눈에 보는 내 사주
2. 원국 핵심 구조
3. 나의 기본 기질
4. 일 / 커리어
5. 돈과 자원
6. 관계 / 연애
7. 현재 대운
8. 가까운 세운
9. 긴 흐름
10. 계산 기준과 해석 근거

처음부터 모든 섹션을 장문으로 펼치지 않는다.
핵심 요약을 먼저 보여주고 상세 해석은 카드/아코디언으로 확장한다.

## Writing rules

좋은 문장:
- "식상 계열이 두드러져, 생각을 결과물이나 표현으로 밖에 꺼내는 힘을 중요하게 읽습니다."
- "이 해석은 월지와 일지의 토 기운, 천간의 비겁·인성 배치를 함께 본 결과입니다."
- "현재 대운에서는 이 특징이 평소보다 강하게 드러날 수 있습니다."

피해야 할 문장:
- "반드시 이혼합니다."
- "주식과 코인은 하면 안 됩니다."
- "39세부터 무조건 부자가 됩니다."
- "이 사주라서 위장병이 생깁니다."
- "배우자는 대기업 전문직 남성입니다."

건강, 금융, 법률 등 현실 의사결정에 영향을 줄 수 있는 항목은
명리적 상징을 실제 진단·예측·지시로 바꾸지 않는다.

## Product principle

사주결의 차별점은 "가장 단정적인 점사"가 아니라
**계산 근거를 추적할 수 있으면서도 읽기 쉬운 해석**이다.

Pick a Card가 감정의 흐름을 읽는 서비스라면,
Saju Gyeol은 구조와 흐름을 차분히 풀어주는 서비스로 둔다.
