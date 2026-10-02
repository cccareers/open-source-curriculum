---
lesson_id: se250-04
course_id: se250
pathway: technical-sales-representative
title: Turning Data into a Visual Argument
order: 4
kind: lesson
competency_ids:
  - D2-S1-C04
objectives:
  - Turn a data set into a visual argument a buyer can read in seconds
---

## A chart is a claim, not a data dump

Two slides carrying the same numbers.

**Slide A** is titled "Service Call Analysis — FY24." It holds a table: twelve months across the top, six service-call categories down the side, seventy-two cells of four-digit numbers, and a totals row. It is complete, accurate, and auditable.

**Slide B** is titled "Callback visits grew 31% while first-visit demand stayed flat." It holds two lines over twelve months. One is grey and roughly horizontal. One is orange and climbing. A small note beside the orange line reads "+31%." Underneath, in small type: *Source: Bay Ridge dispatch export, Jan–Dec, shared 14 May.*

Slide A makes the room do work. Six people silently perform subtraction, and about two of them do it correctly before you move on. Slide B makes a claim, shows the evidence for it in the same eye movement, and leaves the room free to think about what it means.

Both slides are honest. Only one is an argument.

That is the shift this lesson is about. In a sales presentation, a chart is not a place to *show the data*; it is a place to *make one point and prove it in the same glance*. The buyer's analysis team can have the table — send it, they will want it. What goes on the slide is the sentence you want them to believe, rendered visually.

A note on scope, since the boundary matters: this lesson is about converting data into a visual argument for a buyer. Analyzing a sales funnel, building forecast models, and instrumenting your own pipeline is a different discipline and belongs to se305. Here, the data is the customer's, the question is already decided, and the only remaining problem is making the answer legible.

## Start with the sentence

The chart is the last step. The first step is writing the sentence.

Before choosing any chart form, write down — in words, in the buyer's language — the single claim this visual exists to establish. Then design the smallest thing that makes that sentence obviously true.

This is sometimes called an assertion-evidence structure: the **assertion** is the headline, the **evidence** is the graphic, and the graphic's only job is to support that specific assertion. It has three practical consequences.

**The headline is a full sentence, not a label.** "Callback Rate by Month" is a label; it tells the reader what they are looking at and nothing about why. "Callbacks grew 31% while first-visit demand stayed flat" is an assertion; the reader now knows what to look for and can verify it in two seconds.

**The chart form follows from the claim.** You do not pick a bar chart because you like bar charts. You pick it because your claim is about comparing magnitudes across a handful of categories, which is what bars encode well.

**Anything that does not serve the sentence gets cut.** The other four service-call categories are real, but they are not in the sentence, so they are not on the slide.

A test that catches most bad charts: **cover the chart and read the headline; cover the headline and look at the chart.** If the headline alone tells the reader your point, and the chart alone makes the same point visible without help, the slide works. If the chart needs three sentences of narration to become meaningful, it is the wrong chart.

## Choosing the form

Chart choice is not taste. It follows from the shape of the claim. This table covers the claims that actually come up in a sales presentation.

![Decision guide from the shape of a claim to the chart form that encodes it](./img/chart-choice.png)

| The claim you are making | What the reader must do | Form that works | Common failure |
| --- | --- | --- | --- |
| A is bigger than B, across a few categories | Compare magnitudes | Horizontal bars, sorted by value | Sorting alphabetically, so the ranking is invisible |
| One item stands out among many | Find the outlier | Horizontal bars, the one item in accent, rest grey | Twenty equally coloured bars |
| Something changed over time (1–2 series) | Read a direction | Line chart | Bars for a time series, which hides the slope |
| One series moves against a field of others | See one against the pack | Lines, one in accent, the rest thin grey | Spaghetti: nine coloured lines and a legend |
| Two groups differ on the same measure | See a gap | Two lines, or a dumbbell, with the gap annotated | A grouped bar chart where the gap must be inferred |
| Before versus after, several items | See which moved and how far | Slope chart | Two separate charts side by side |
| A whole splits into 2–3 parts | Read a share | A single stacked bar, or a big number | A pie with eight slices and a legend |
| The mix changed over time | See composition shifting | 100% stacked bars, few categories | Stacked areas with six series |
| Values spread out; averages are misleading | See where the mass sits | Histogram or a dot strip | Reporting the mean and hiding a bimodal distribution |
| Two variables move together | See the relationship | Scatter, with the relevant quadrant called out | Implying causation the data cannot support |
| One number decides everything | Remember one number | The number, very large, with a sentence under it | A number with no denominator or comparison |

Three rules that sit above the table.

**Fewer marks beat more marks.** If the claim survives with four bars instead of eleven, use four. The other seven are appendix material.

**Horizontal bars are underrated.** Category labels read left-to-right at full size instead of being rotated forty-five degrees, and rooms read them faster.

**Pie charts are almost always a downgrade.** Humans compare lengths well and angles badly. A pie is defensible for two or three slices where one obviously dominates. Beyond that, use a sorted bar and let people read the ranking.

## The Bay Ridge rewrite, worked

Dana's operations analyst sent you their standard monthly report so you would have real numbers for the readout. Here is what came back, and what you do with it.

**What arrived.** A slide titled "Service Call Volume by Reason, FY24." A stacked column chart: twelve columns, one per month, each divided into six coloured segments — Scheduled Maintenance, Entrapment, Door Fault, Control Fault, Callback, and Other. A legend along the bottom in six-point type, ordered as the categories happened to appear in the export. The vertical axis runs 0 to 3,200 and is labelled "Calls." Under it, a second chart: a pie of the same six categories for the full year.

Diagnose it before fixing it. What claim is it making? None — it is a report, and reports are supposed to be neutral. What must the reader do to extract anything? Compare the height of one segment across twelve stacked columns, which is a task the human visual system is genuinely bad at, because only the bottom segment shares a common baseline. Which of the six categories matters to your argument? One. The pie repeats information the columns already contain and adds nothing.

**Now write the sentence.** From your lesson 3 arc, beat 2's job is to establish that something moved. The claim is: *callbacks grew while first-visit demand did not.* That is a claim about change over time, with two series, and the point is the divergence between them.

**Rebuild it.**

- Collapse six categories into the two the claim needs: **Callback visits** and **First-visit calls** (the other five summed).
- Chart form: a line chart. Two series, twelve points.
- First-visit calls: thin, grey, flat around 2,180 a month.
- Callback visits: heavier, accent colour, rising from about 440 in January to about 575 in December.
- Annotation directly on the callback line at the right end: **"+31%."** No legend — label each line at its right end, where the reader's eye already is.
- Vertical axis starting at zero, gridlines removed except a faint one at the top, tick labels at 0 / 1,000 / 2,000.
- Headline: **"Callback visits grew 31% while first-visit demand stayed flat."**
- Source line, small, bottom left: *Bay Ridge dispatch export, Jan–Dec, received 14 May.*

Same underlying data. One chart instead of two. Two series instead of six. Zero legends. And a reader who has never seen it gets the point in about two seconds — which is the actual standard, because in a room, two seconds is what you get before people start listening to you again instead of reading.

**A second chart, for the turn.** Beat 5 needs the reframe visualized. The claim there is: *callbacks are separated by parts availability, not by technician tenure.* That is a claim about two groups differing on the same measure, so it wants a comparison that shows a gap. The strongest form is two side-by-side panels of the same measure, sliced two ways:

```text
Callback rate, sliced by technician tenure
  Under 2 years   ############ 21%
  2 years or more ########### 18%

Callback rate, sliced by whether the part was on the truck
  Part on truck   ## 4%
  Part not on truck ######################################### 71%
```

Four bars, two panels, one headline: **"Tenure barely separates your callbacks. Parts availability separates them almost completely."** The visual does the argument's work — the top pair is nearly identical, the bottom pair is not, and nobody needs the arithmetic explained. This is the slide the whole presentation turns on, and it is four bars.

**The third chart, for stakes.** Beat 3 needs the renewal trajectory. Three annual points — 91%, 88%, 84% — is not enough data for a line chart to look like anything, and yet the trajectory is the argument. The right answer is often the least fashionable one: three big numbers in a row with arrows, or a single line with only three points and a dotted extension nobody labels but everybody reads. Headline: **"Renewal rate has fallen three years running: 91%, 88%, 84%."**

Note what the three charts do together. The first says *something changed.* The second says *and here is the actual cause.* The third says *and here is what it costs.* Three claims, three visuals, one argument. That sequencing is the point of the next section.

## The annotation layer

Most of the difference between a chart that reads in two seconds and one that does not is annotation, not chart type. Four elements, in order of value.

**The headline as claim.** Already covered, and it is worth more than everything else combined.

**One highlighted element.** Exactly one thing in accent colour; everything else in grey. Colour is the strongest signal available to you, and using it on eight series spends the whole budget on nothing. If two things genuinely need highlighting, you probably have two slides.

**A reference line or band.** A target, a benchmark, a contract threshold, a prior-year level. A number is meaningless without a comparison, and a reference line puts the comparison inside the chart instead of in your narration. Bay Ridge's entrapment response chart is uninteresting until you draw the 30-minute target across it — then the 41-minute average becomes an obvious, visible failure.

**A short callout on the mark itself.** "+31%" placed at the end of the rising line. Not in the legend, not in a footnote — on the thing it describes, so the eye does not have to travel.

And one element that is not decoration: **a source line on every chart carrying customer data.** Small, bottom, naming the export and the date. It costs one line of six-point type and it buys you the thing you cannot otherwise get — a room that does not argue with the numbers. Bay Ridge's supervisor with nineteen years of tenure is exactly the person who will ask where the figure came from, and the correct time to answer is before he asks.

## Colour is an argument, not a palette

The rule is short: **grey is the default; accent is the exception.**

Build every chart in greys first. Then add exactly one accent colour to the element your headline is about. That single decision does more for readability than any other choice on the slide, and it makes your deck look designed rather than decorated, which is a side benefit worth having.

Three constraints on top of it:

**Do not encode meaning in colour alone.** Roughly one in twelve men has some form of colour vision deficiency, and red-versus-green is the most common failure. Label the lines directly and the problem disappears.

**Assume the projector is bad.** Pale greys, thin lines, and low-contrast type that looked fine on your laptop can be invisible in a bright conference room. Test at the actual contrast you will get, and when in doubt go darker and heavier.

**Keep the accent consistent across the deck.** If callbacks are orange on slide 4, they are orange on slide 9. Colour that changes meaning between slides quietly tells the reader that colour does not mean anything.

## Honesty, and what breaks trust

You are presenting a buyer's own numbers back to them, in a room containing at least one person who knows those numbers better than you do. Every shortcut below is one they can detect, and detection costs you the whole presentation, not just the slide.

**Truncated axes.** Starting a bar chart's axis at 84 instead of 0 turns a four-point difference into a visual cliff. For bars, where length *is* the encoding, start at zero — always. For line charts, where the encoding is slope, a non-zero baseline is legitimate, but label it clearly and never let the framing manufacture drama.

**Dual axes.** Two series on two different vertical scales lets you make any two lines cross wherever you like, and a numerate reader knows it. Use two charts stacked instead, sharing a horizontal axis.

**Percentages without denominators.** "Callbacks up 31%" is a different claim if the base is 440 a month or 4. Put the base on the slide.

**Cherry-picked windows.** If the trend only holds over the eleven months you chose, you have shown the reader a coincidence and called it a finding.

**Averages hiding distributions.** Bay Ridge's 41-minute mean entrapment response could be a tight cluster around 41 or a mass at 22 with a tail past 90. Those are different problems with different solutions, and a mean cannot distinguish them. When the distribution is the story, show the distribution.

**Their number restated as yours.** If a figure came from their export, say so. If it came from your product's benchmark data, say that too, in a different visual register. Mixing the two silently is the fastest way to have every number on the slide dismissed at once.

One more, which is less about charts than about character: **show the number that is bad for you.** If first-time fix at comparable operators only reaches the mid-70s in year one, put the mid-70s on the slide, not the 89% one flagship account reached in year three. A presentation that contains one honest disadvantage is more believable in every other respect.

## Readable in the room

A chart that works on a laptop can fail on a projector eight metres away. Four checks, all cheap.

**The squint test.** Step back three metres from the screen, or shrink the slide to a quarter size, and squint. The shape of the claim should survive. If it dissolves into texture, there are too many marks.

**The two-second test.** Show it to a colleague who has not seen it, for two seconds, then hide it and ask what it said. If they cannot state the claim, the headline is wrong or the chart is too busy.

**Direct labels, not legends.** A legend forces the reader to look away from the data, decode a colour, look back, and re-find their place. Label each series at its end and delete the legend. This one change probably does more for in-room readability than any other single edit.

**Type size floor.** Nothing on a projected slide below about eighteen points, and axis labels are not an exception. If your data needs six-point type to fit, you are showing too much data.

Delete anything that is not carrying information: gridlines you do not need, tick marks, chart borders, background fills, drop shadows, three-dimensional effects. The last one is not a style preference — a 3D bar chart distorts the very lengths the reader is being asked to compare.

## Sequencing charts into an argument

One good chart makes a point. Three good charts in the right order make an argument, and the ordering is a rhetorical decision, not a data one.

The three-move sequence that fits most sales narratives:

1. **It is real and it is moving.** The change over time. Establishes that something happened.
2. **Here is what is actually driving it.** The segmentation or comparison. This is where a reframe lives, and it is where your understanding of their operation becomes visible.
3. **Here is what it costs, and what it will cost.** The stakes, with a trajectory.

Map that against lesson 3's arc and the fit is exact: chart 1 serves beat 2, chart 2 serves beat 5's reframe, chart 3 serves beat 3. The narrative decides the charts. If you find yourself with a chart that does not attach to a beat, it belongs in the appendix, and if a beat has no evidence attached, that is the gap to fill before you build anything else.

**One chart per slide, one claim per chart.** Two charts on a slide means two claims competing, and the reader resolves the competition by reading neither.

## Practice

You are preparing the data slides for the **Fairmount Distribution** readout. Fairmount has sent you a spreadsheet export; the relevant contents are below. Your narrative from lesson 3 is the input — every chart must attach to a beat.

**Order accuracy by DC, last twelve months (percent of order lines picked correctly):**

| DC | Jan | Apr | Jul | Oct | Dec |
| --- | --- | --- | --- | --- | --- |
| Ashland | 98.1 | 98.0 | 97.9 | 98.0 | 97.9 |
| Brant | 97.4 | 97.1 | 96.6 | 96.2 | 95.8 |
| Cordell | 97.8 | 97.7 | 97.8 | 97.6 | 97.7 |
| Dunmore | 97.5 | 97.4 | 97.2 | 97.3 | 97.2 |

**Mispick rate by item location stability (network, full year):**

- Items whose pick location was unchanged for 30+ days: **0.9%** mispick rate, **8.9M** lines picked
- Items whose pick location changed within 30 days: **2.8%** mispick rate, **1.4M** lines picked

**Mispick rate by associate tenure (network, full year):**

- Under 5 weeks: **1.4%** mispick rate, **3.2M** lines picked
- 5 weeks and over: **1.2%** mispick rate, **7.1M** lines picked

**Location changes per month, by DC (count of items relocated):**

| DC | Monthly average |
| --- | --- |
| Ashland | 310 |
| Brant | 2,940 |
| Cordell | 505 |
| Dunmore | 690 |

**Credits issued, by quarter:** Q1 2,880 · Q2 3,150 · Q3 3,410 · Q4 3,690, at an average $74 each.

**Customer service-level agreement:** two major customers require **99.5%** order accuracy.

**Exercise 1 — write the sentences first.** Before drawing anything, write the three claims your data slides must establish, one sentence each, in Fairmount's language. Map each to a beat from your lesson 3 narrative. Any claim that does not attach to a beat gets cut here, not later.

**Exercise 2 — choose the forms.** For each of your three claims, name the chart form using the chart-choice table, and write one sentence justifying it from the *shape of the claim* rather than from preference. Then name one form you considered and rejected, and why.

**Exercise 3 — specify the segmentation chart in full.** Fairmount believes mispicks are a discipline-and-tenure problem. Using the tenure and location-stability data, specify the chart that refutes this: form, exactly which marks appear, which single element carries the accent colour, the annotation, the axis treatment, the headline as a full sentence, and the source line. State how many marks are on the slide in total.

**Exercise 4 — rewrite a bad chart.** Fairmount's analyst sends you a slide titled "Order Accuracy — Trailing 12 Months." It is a grouped bar chart with four DCs times twelve months — forty-eight bars in four colours, a legend at the bottom, and a vertical axis running from 95.5 to 98.5. Write a diagnosis naming at least four specific defects, then specify the replacement: form, series, accent, reference line, annotation, axis baseline, headline, source line. Explain in one sentence why the original's axis range is the most serious of the defects.

**Exercise 5 — the number with a denominator.** Write the single-number slide for the credits data: the number, the sentence beneath it, and the comparison that makes it meaningful. Then state what the number would be missing if you showed only the annual credit total, and add whatever it needs.

**Exercise 6 — apply the honesty checks.** Go through your three specified charts against the six honesty failures in this lesson. For each chart, name any that apply and say what you changed. Then identify the one figure in the data above that is *unfavourable* to your argument, and say where in the deck you would put it and why.

**Exercise 7 — sequence and squint.** Put your three charts in presentation order and write the one-sentence transition you would say between each pair. Then, for the chart you consider most complex, describe what survives the squint test and what you would delete if it did not.
