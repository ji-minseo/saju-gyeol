# External cross-validation report

Updated: 2026-10-06

This report separates independent external fixtures from internal invariant coverage.
Passing an internal invariant is not counted as an external match.

## Independent external fixtures

Primary authority: Korea Astronomy and Space Science Institute (KASI) calendar/almanac material.

### KASI 2000 almanac
- 12 published Gregorian month-first day pillars (일진): 12 / 12 matched.
- 12 published Jie boundaries used by the Saju month engine: 12 / 12 matched to the published minute tolerance (< 90 seconds).
- The Li Chun fixture also verifies that both year and month pillars change across the boundary.
- 12 published Korean lunar month starts: 12 / 12 matched.

### KASI 2001 almanac
- Normal lunar fourth month start: matched.
- Leap lunar fourth month start: matched.

### Korea-specific lunar dates
KASI documents dates on which Korean and Chinese lunar calendars can differ because the conjunction falls on different civil dates.
The following Korean lunar New Year fixtures match:
- 1988-02-18
- 1997-02-08
- 2027-02-07
- 2028-01-27

### Existing KASI 2026 fixture
- 12 Jie boundaries already covered by the solar-term provider regression suite: 12 / 12 matched to the published minute tolerance.

External assertions currently locked in CI: 54.
This number counts explicit independently sourced assertions, not generated internal cases.

## Internal invariant / exhaustive coverage

Not counted as external cross-validation:
- ten gods: complete 10 x 10 matrix
- twelve stages: complete 10 x 12 matrix
- hidden stems: all 12 branches
- void: all 60 day pillars
- branch relation pair sets
- daeun direction: every year-stem polarity x both sexes
- 1988 Seoul DST gap/repeated-time handling
- Gregorian leap-day validation
- Jie-boundary before/after behavior sampled across 1970, 1980, 1990, 2000, 2010, 2020, 2030, 2050 and 2100
- midnight vs zi-start day-boundary behavior
- Korean lunar invalid-date and invalid-leap-month rejection

## What this does not prove

- It is not a comparison against hundreds of independent commercial manse services.
- Daeun start-age conventions vary by school; the current 3-days-per-year rule is explicitly a selected policy.
- True solar time / longitude correction is not implemented.
- Overseas births are not supported.
- Hidden-stem weighting, strength/weakness and yongshin are not automatically judged.

## Sources

- KASI 2000 월력요항: 24절기, 음력-양력 대조표, 각월 1일 일진.
- KASI 2001 월력요항: 윤4월 대조표.
- KASI calendar data / 2026 fixtures.
- KASI notice on Korea/China lunar-date divergence.
- Korea Astronomy and Space Science Institute lunar/solar OpenAPI metadata.
