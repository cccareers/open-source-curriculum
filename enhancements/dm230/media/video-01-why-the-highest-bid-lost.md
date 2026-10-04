---
course_id: dm230
media_id: dm230-v01
type: video-script
title: "Why the Highest Bid Lost: Working an Ad Rank Auction by Hand"
format: whiteboard
target_runtime: "7 min"
related_lessons:
  - dm230-02
objectives:
  - Explain how a paid search auction decides which ad shows and what it costs
  - Describe how quality signals affect cost per click and ad position
competency_ids:
  - D3-S1-C01
---

## Purpose

After watching, the learner can rank four advertisers by Ad Rank, price each click with the second-price rule using the course's teaching simplification, and explain in one sentence why the highest bidder finished last and paid the most.

## Audience and prerequisites

Learners starting lesson 02. Comfortable with multiplication and division; no account access needed.

## Script

| Time | Visual / On screen | Narration |
|---|---|---|
| 0:00 | Whiteboard: a search box with "emergency ac repair columbus", clock reading 8:14 p.m., a phone icon. | "A homeowner in Westerville types this at 8:14 on a July night. In about a tenth of a second, four HVAC companies go to auction for that one search. Let's run it by hand." |
| 0:20 | Caption: "Teaching simplification: Ad Rank = max bid x quality index. Not the production formula." | "We'll use the simplification from lesson two. Ad Rank equals your max bid times a quality index. The real formula has more inputs, like context and expected asset impact, but this version gets every decision in this video right." |
| 0:40 | Four rows drawn: Olentangy $18.00 x 3.0; Buckeye $16.00 x 5.0; Northgate $12.00 x 8.0; Capital City $10.00 x 9.0. | "Four advertisers. Olentangy bids eighteen dollars with a quality index of three. Buckeye bids sixteen with five. Northgate bids twelve with eight. Capital City bids ten with nine." |
| 1:05 | Presenter multiplies and writes Ad Rank: 54, 80, 96, 90. | "Multiply. Olentangy: fifty-four. Buckeye: eighty. Northgate: ninety-six. Capital City: ninety." |
| 1:25 | Rows rewritten in order: 1 Northgate 96; 2 Capital City 90; 3 Buckeye 80; 4 Olentangy 54. Threshold line drawn at 40. | "Sort by Ad Rank. Northgate is first with a twelve-dollar bid. Olentangy, the biggest bidder, is last. Everyone clears the minimum threshold of forty for these slots, so all four show." |
| 1:50 | Arrow from each row to the row below it, labelled "sets your price". | "Now the part most people get wrong. You don't pay your bid. You pay just enough to stay ahead of the advertiser directly below you, measured in your own quality terms." |
| 2:10 | Formula boxed: actual CPC = (Ad Rank below / your quality) + $0.01, capped at your max bid. | "The rule: take the Ad Rank of whoever is below you, divide by your own quality index, add one cent. Never more than your max bid." |
| 2:30 | Northgate: 90 / 8.0 = 11.25 + 0.01 = $11.26. | "Northgate. Capital City is below with ninety. Ninety divided by eight is eleven twenty-five. Plus a cent: eleven twenty-six." |
| 2:55 | Capital City: 80 / 9.0 = 8.889 + 0.01 = $8.90 (rounded). | "Capital City. Buckeye's eighty below. Eighty divided by nine is eight eighty-nine, plus a cent, rounds to eight ninety." |
| 3:15 | Buckeye: 54 / 5.0 = 10.80 + 0.01 = $10.81. | "Buckeye. Olentangy's fifty-four below. Divided by five: ten eighty. Ten eighty-one." |
| 3:30 | Olentangy: 40 / 3.0 = 13.333 + 0.01 = $13.34 (threshold in the numerator). | "Olentangy has nobody below, so the threshold of forty goes on top. Forty divided by three is thirteen thirty-three. Thirteen thirty-four, the highest price on the page." |
| 3:55 | Final table with Position, Bid, Paid. Circle Olentangy: bid most, last place, paid most. | "Look at Olentangy. Highest bid, last place, highest price. That's not a penalty somebody imposed. It's arithmetic: their quality index sits in the denominator of their price." |
| 4:20 | Circle Capital City (#2, $8.90) and Buckeye (#3, $10.81). | "And position two pays less than position three. Your price is set by whoever is below you, not by where you are." |
| 4:40 | New scene: Olentangy quality drops to 1.5. 18 x 1.5 = 27 < 40. Bid raised to $25: 25 x 1.5 = 37.5 < 40. Red X, plus the word "No impressions". | "Now suppose Olentangy's quality falls to one point five. Eighteen times one point five is twenty-seven, below the threshold. They vanish. Their manager raises the bid to twenty-five. Thirty-seven point five. Still below forty. Still nothing. The bid is the wrong lever." |
| 5:20 | New scene: Northgate average CPC $8.20 at quality 5.0. Back-solve: 8.20 = X/5 + 0.01 → X = 40.95. Quality to 7.6: 40.95/7.6 + 0.01 = $5.40. | "One more. Northgate's AC Repair ad group averages eight twenty a click at a quality index of five. Work backwards and the advertiser below averages an Ad Rank of about forty-one. Raise quality to seven point six, change nothing else, and the price falls to five forty." |
| 6:00 | Arithmetic panel: $3,200 / $5.40 = 592 clicks; x 11% = 65 leads vs 43; CPA $49.23 vs $74.42. | "Same budget, about five hundred ninety clicks instead of three ninety, sixty-five leads instead of forty-three, and a cost per lead under the sixty-dollar target for the first time. No bid change." |
| 6:35 | Summary card: 1. Ad Rank = bid x quality. 2. Price set by the ad below you. 3. Quality is in the denominator. | "Three things to take away. Rank is bid times quality. Your price is set by whoever is below you. And quality sits in the denominator of every click you buy." |
| 6:55 | End card: "Now do Practice Exercise 1 in lesson 02." | "Pause here and work the five-advertiser auction in the practice section." |

## On-screen assets and B-roll

- Whiteboard or digital canvas with a pre-drawn four-row table.
- Formula card reused at 2:10 and in the summary.
- Optional: stylised (not real) search results page to show the four ads stacking.

## Accessibility

- Captions verbatim; every number written is also spoken.
- Circled or highlighted rows are also labelled in words ("highest bid", "last place").
- Avoid red/green as the only distinction for "shows" and "does not show"; use a check and a cross with text.

## Check for understanding

1. Advertiser X bids $6 at quality 9; Advertiser Y bids $10 at quality 5. Who ranks higher, and what does the winner pay if the threshold is 30? **Answer:** X (54 vs 50). X pays 50 / 9 + 0.01 = $5.57.
2. Why can moving up a position raise your CPC even if your bid did not change? **Answer:** you now sit above a different, usually stronger, advertiser, and your price is set by the Ad Rank of whoever is directly below you.
3. An ad shows no impressions, lost IS (rank) is high, and all three Quality Score components read "Below average." What is the first fix? **Answer:** improve quality (ad relevance, expected CTR, landing page); raising the bid is the expensive lever and may not clear the threshold.
