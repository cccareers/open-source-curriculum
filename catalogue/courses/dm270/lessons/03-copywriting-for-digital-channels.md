---
lesson_id: dm270-03
course_id: dm270
pathway: digital-marketer
title: Copywriting for Digital Channels
order: 3
kind: lesson
competency_ids:
  - D2-S1-C03
objectives:
  - Write clear, persuasive marketing copy for digital channels
  - Edit copy for clarity, voice, and a single call to action
---

## Where this lesson picks up

In dm101 you wrote a positioning statement, a voice table, and a headline-and-CTA pair. That work is assumed here. This lesson is the next five hours: drafting a full piece for a specific digital channel, and then editing it — your own copy and someone else's — until it earns the reader's time.

Editing is the larger half. Most people can produce a serviceable first draft; far fewer can look at a serviceable draft and see the 40% that should be deleted. Every worked example below is a before and an after, because that is the shape of the actual job.

Harvest Lane's voice, established before this course and used throughout:

| We are | We are not | In practice |
| --- | --- | --- |
| Direct | Blunt | "Ten inches is enough." Not "Honestly? Ten. Moving on." |
| Practical | Folksy | "Check the sun before you build." Not "Let Mother Nature be your guide!" |
| Encouraging | Cheerleading | "Leggy seedlings are normal and fixable." Not "Don't give up, gardener!" |
| Specific | Padded | "12 inches deep, 4 by 8 feet." Not "generously sized." |

Two things stay out of scope. The mechanics of writing a page for a search query — title tags, keyword placement, on-page structure for crawlers — belong to dm201. And ad copy under platform policy belongs to dm230. What you write here is copy for the pieces your own content plan commissioned.

## The one-sentence promise

Before drafting anything, write the piece's promise in one sentence, in the reader's language, and put it somewhere you can see it.

```txt
PROMISE: You will know exactly how deep to build your bed,
         and why, in under a minute.
```

Then every paragraph in the draft has to justify itself against that sentence. This is not a formality. It is the mechanism that lets you delete the paragraph about the history of raised-bed agriculture in Mesopotamia — interesting, well written, and not the promise.

A promise is not a headline. It is the private instruction that makes the headline writable. When you cannot write the promise in one sentence, the piece is trying to be two pieces, and the correct move is to split it before you write a word.

## Structure is copy

Readers on a phone do not read; they skim, and then they read the part that matched what they were skimming for. That behavior is not laziness, and copy that ignores it does not get read more carefully — it gets abandoned.

So the structure carries as much meaning as the sentences.

**Answer first.** Put the answer in the opening, then earn the rest. The old magazine shape — scene-setting, gradual reveal, conclusion — inverts everything the reader wants. If someone typed a question, the first forty words should answer it. Detail, nuance, and exceptions come after, and the people who need them will scroll.

**Subheads are the skim path.** Read only your H2s and H3s, in order. Do they tell a coherent story and let a reader jump to their question? "Getting started" and "A few considerations" tell nobody anything. "How deep for carrots and parsnips" is a signpost.

**One idea per paragraph, and short ones.** Two to four sentences on a phone. A paragraph that runs eleven lines on a narrow screen reads as a wall and gets skipped whole, including the good sentence in the middle.

**Bullets are for parallel things.** A bulleted list of items that do not share a grammatical shape or a category is harder to read than the sentence it replaced. If your bullets need three different verbs and two of them are full paragraphs, you wanted prose.

**Tables are for comparisons the reader makes.** If someone is choosing between options on more than one axis, prose is the wrong container. Harvest Lane's depth guide lives or dies on one table.

## Sentences that survive a small screen

Six edits do most of the work at sentence level. None of them are style preferences; each one measurably reduces the effort of reading.

**Front-load.** The first three words of a sentence, a subhead, a link, or a button carry most of the comprehension. "Because soil settles roughly an inch in the first season, build an inch deeper" is worse than "Build an inch deeper — soil settles about that much in the first season."

**Cut the throat-clearing.** "It's important to note that," "When it comes to," "One of the things you should consider is." These phrases delay the sentence's actual start. Delete them and the sentence almost never needs repair.

**Prefer active voice with a real subject.** "Mistakes were made in bed placement" hides who did what. "Most people put the bed where it looks nice, not where the sun is" names the reader's actual behavior, which is why it lands.

**Kill the intensifiers.** Very, really, quite, extremely, incredibly, truly. Read the sentence without the word; if the meaning survives, the word was decoration. If the meaning collapses, the word was doing the job a specific number should be doing.

**Replace abstraction with the thing.** "Optimize your growing environment" is a rung above "give it six hours of sun," which is the sentence a reader can act on. Always write at the lowest rung the audience will recognize.

**Vary length, and end short.** A long sentence followed by a four-word one lands. Four long sentences in a row is where readers leave.

## Plain language and the jargon swap

Jargon is not always wrong. It is wrong when the reader does not have it, and Harvest Lane's reader has none of it. Build a swap table for your domain and keep it in the brief:

| Instead of | Write | Why |
| --- | --- | --- |
| "Amend your substrate" | "Mix compost into your soil" | Nobody outside horticulture says substrate |
| "Optimal photoperiod" | "Six to eight hours of direct sun" | The number is the useful part |
| "Determinate vs. indeterminate" | "Bush tomatoes vs. vining tomatoes" (then name the terms once) | Teach the term, don't lead with it |
| "Leverage our modular tier system" | "Stack a second tier later" | Corporate for a simple physical fact |
| "Utilize" | "Use" | Always |

The exception worth respecting: when the term is the thing your reader will need to search for or say out loud in a garden center, teach it. Write the plain version first, put the term in parentheses, and use it thereafter. That is service, not showing off.

## Accessibility is copywriting

Several of the things that make copy accessible are not design or engineering tasks. They are word choices, and they are yours.

**Link text has to make sense alone.** Screen reader users can pull up a list of every link on a page, out of context. A page of eleven links all reading "click here" or "read more" is a list of eleven identical rows. Write the destination into the link.

```txt
Before:  To find out how much soil you need, click here.
After:   Work out how much soil you need with the soil calculator.
```

**Headings must be real headings, in order.** An H2 followed by an H4 skips a level, and to someone navigating by headings the structure appears to have a hole. Equally, bolding a line to make it *look* like a heading gives a sighted reader a signpost and gives everyone else nothing. Use the heading level; style it later.

**Alt text is a copywriting job with a strict brief.** Describe what the image *communicates in this context*, in a sentence, without "image of" and without keyword stuffing. The same photograph gets different alt text in different pieces, because it is doing a different job.

```txt
Photo: a cedar bed cross-section with a ruler in it.

In the depth guide:
  alt="Cross-section of a cedar raised bed, ruler showing a
       12-inch soil depth."
On the product page:
  alt="Cedar raised bed with stackable 6-inch tiers, shown
       assembled at 12 inches."
Purely decorative (a texture strip):
  alt=""            ← empty, so screen readers skip it
```

An empty `alt=""` on a decorative image is correct and deliberate. A *missing* alt attribute is not the same thing — many screen readers then read out the filename, which is how a reader ends up hearing "I M G underscore 4 4 7 1 dot jpeg."

**Avoid directional and sensory instructions.** "See the box to the right" and "as you can see below" assume a layout and a sense. "See the depth table" works on any screen and in any reading order.

**Write in sentence case and use punctuation.** ALL CAPS is read letter by letter by some screen readers, and it is harder for everyone to scan. A row of emoji reads out its full description each time — one emoji in a social caption is fine, six as a bullet substitute is a hostile experience.

**Say the same thing the same way.** Consistent labels — "soil calculator" every time, not "the calculator," "our tool," "the soil thing" — help everyone and help translation and search tools most.

None of this makes the copy worse for a sighted reader. Every fix above also makes the page easier to skim, which is the same goal you already had.

## Persuasion after the headline

dm101 covered benefit-before-feature, specificity, and proportionate CTAs. Three more mechanisms carry a longer piece.

**Name the objection before the reader does.** Unaddressed doubt is where readers quietly leave. Harvest Lane's audience research produced one dominant objection — "the corners racked after one winter" — so the product copy meets it head on rather than claiming general quality. Copy that argues with the customer's real fear is more persuasive than copy that ignores it, and much more persuasive than copy that pretends the fear is unreasonable.

**Attach proof to every claim that could be doubted.** A claim's job is to be interesting; the proof's job is to make it believable. Pair them in the same sentence where you can: "Ten to twelve inches suits almost everything most people grow — Elena has grown 34 of the 40 crops in our seed list at that depth." Vague proof ("experts agree") is worse than none, because it advertises that you had nothing.

**Give one next step.** A section that offers a purchase, a newsletter, a related guide, and a share button offers a decision, and a decision is friction. Pick the step that is proportionate to where the reader is and cut the others. If a stakeholder insists on two CTAs, make one obviously secondary in wording and weight — but the first move is to ask which one you would keep if you could keep only one.

## Channel constraints, and what they do to a draft

The same message has to survive very different containers. Constraints are not decoration; they change what you can say.

| Channel | Practical limit | What the reader is doing | What the copy must do |
| --- | --- | --- | --- |
| On-site guide | No limit, but attention ends | Actively looking for an answer | Answer in 40 words, then depth |
| Product page section | 40–80 words per block | Comparing, half-decided | One claim, one proof, one objection |
| Social caption | First 1–2 lines before "more" | Scrolling, not looking for you | Earn the tap with line one |
| Short video script | ~130 spoken words per minute | Sound may be off | Hook in 3 seconds; work without audio |
| Email | Subject + preview line decide it | Triaging an inbox | One idea, one link |
| Button / microcopy | 2–5 words | Deciding whether to commit | Verb + what happens next |

Note the last row. Microcopy is the highest-leverage copy per word on any site, and it is usually written by nobody in particular. "Submit" is the default because a form template shipped with it.

The email row is deliberately thin here: in this course email is only a place your content lands, and dm350 owns campaign writing, deliverability, and automation.

## The editing pass

Edit in named passes. Trying to fix structure, voice, and commas simultaneously is how a draft gets shuffled for two hours and improves by nothing. Run these in order, and do not skip ahead when you spot a typo in pass one.

1. **Promise pass.** Does the piece deliver the one-sentence promise? Does it deliver anything else it should not? Cut whole sections here. This is the only pass where the word count moves a lot.
2. **Structure pass.** Read only the headings. Is the skim path coherent? Is the answer in the first paragraph? Reorder before you polish; polishing a paragraph you are about to delete is the most common waste in editing.
3. **Sentence pass.** Front-load, cut throat-clearing, kill intensifiers, break the long paragraphs. Expect to lose 15–25% of the words.
4. **Evidence pass.** Every claim: is it true, is it checkable, is the proof attached? Route the factual ones to the SME. Nothing ships that Elena has not initialled.
5. **Accessibility pass.** Heading order, link text, alt text on every meaningful image, empty alt on decorative ones, no directional instructions, real tables with header cells, sentence case.
6. **CTA and voice pass.** One primary next step. Then read it aloud. Anything you would not say to a customer standing in front of you comes out.

Read aloud is not a folk remedy. It catches the sentence with three subordinate clauses, the paragraph with no breath in it, and the phrase you copied from a competitor without noticing.

## Before and after: a blog introduction

The draft that came back for the week 1 depth guide.

```txt
BEFORE (127 words)

Raised bed gardening has exploded in popularity in recent years, and
it's easy to see why. Raised beds offer a host of benefits over
traditional in-ground gardening, from improved drainage to reduced
back strain to a longer growing season. But before you start
building, there's an important question that many beginner gardeners
overlook: how deep should your raised bed actually be? It's a
question that comes up again and again, and the answer isn't always
as straightforward as you might think. In this comprehensive guide,
we'll take a deep dive into everything you need to know about raised
bed depth, exploring the various factors that come into play and
helping you make the right decision for your garden. Let's get
started!
```

Diagnosis: 127 words and the reader still does not know how deep to build. The first three sentences are about the category, not the question. "Comprehensive guide," "deep dive," "everything you need to know," and "let's get started" are all filler that promise a future answer instead of giving one. The piece announces the question the reader already asked.

```txt
AFTER (58 words)

Ten to twelve inches is deep enough for almost everything most
people grow — tomatoes, beans, lettuce, peppers, herbs. Go to
eighteen if you want long carrots, parsnips or a decent potato crop.

Depth matters because roots stop where the soil stops. Below is the
crop-by-crop table, plus what changes when your bed sits on a patio
instead of on grass.
```

54% shorter, and the promise is delivered in the first sentence. The second paragraph does three jobs: it explains *why* in nine words, it signposts the table, and it names the one condition that changes the answer, which is the detail the support inbox kept asking about. Every claim in the new version is checkable, so Elena can initial it.

## Before and after: a product page block

```txt
BEFORE (61 words)

PREMIUM CEDAR RAISED BED KIT

Our beautifully crafted raised bed kits are made from premium,
sustainably sourced western red cedar and feature innovative
modular construction for maximum versatility. Designed with the
discerning gardener in mind, these best-in-class beds offer
unparalleled durability and timeless aesthetic appeal that will
enhance any outdoor space for years to come. Learn More
```

Diagnosis: six unsupported adjectives ("beautifully crafted," "premium," "innovative," "best-in-class," "unparalleled," "timeless"), none of which a competitor could not also print. "For years to come" is exactly the claim the audience doubts, made in the vaguest available way, so it reinforces the doubt instead of answering it. "Learn More" tells the reader nothing about where they land.

```txt
AFTER (63 words)

CEDAR RAISED BED — 4 × 8 FT, 12 IN DEEP

Western red cedar, 1.5 inches thick. The corners are bolted through
steel brackets, not screwed into end grain — which is why they do
not rack after a winter of freeze and thaw. Untreated cedar, so
nothing leaches into the soil your food grows in.

Assembles in about 25 minutes with the included hex key.

See the 12-inch kit — $189
```

Same length, entirely different content. The dimensions are in the headline because that is what a comparing reader needs first. The racking objection — lifted verbatim from a competitor's reviews — is answered with the mechanism, and "which is why" links the proof to the claim explicitly. "Untreated" answers the unspoken food-safety question. The assembly time is the kind of specific, checkable number that makes the rest of the page more believable. One CTA, with the price on it, so nobody clicks to discover a number they did not want.

## Before and after: a social caption

```txt
BEFORE (66 words)

🌱✨ NEW BLOG POST ALERT! ✨🌱

We're SO excited to share our latest comprehensive guide all about
raised bed depth!! 🙌 Whether you're a seasoned pro or just starting
out, this post has something for everyone! 💚 Check out the link in
our bio to read more and let us know your thoughts in the comments
below!! 👇👇👇

#gardening #raisedbeds #gardeninglife #growyourown #gardenersofinstagram
```

Diagnosis: the first line is about the company's publishing schedule, which nobody follows a gardening account to hear about. "Something for everyone" is a promise to nobody in particular. Ten emoji, several as decoration, each read aloud in full by a screen reader; the double exclamation marks and all-caps compound it. "Read more" gives no reason to. And it contains not one fact from the piece — it advertises that an article exists rather than being useful in the feed.

```txt
AFTER (58 words)

Ten inches. That is deep enough for tomatoes, beans, lettuce,
peppers and every herb you are likely to plant.

Go to eighteen only if you want long carrots, parsnips, or potatoes
that are not disappointing.

The mistake we see most: building deep and then discovering how much
soil that takes. Depth costs money by the cubic foot.

Full crop-by-crop table → link in bio 🌱

#raisedbedgardening #vegetablegarden #gardeningforbeginners
```

The first line stands alone and is useful before anyone taps. It gives the answer away, which feels wrong and is right — usefulness in the feed is what earns the tap and the save. The third paragraph adds something the article's opening does not, so a reader who has already read the piece still gets value. One emoji, at the end, where it is punctuation rather than a bullet. Three specific hashtags instead of five generic ones. If this ships with an image, the image needs alt text written in the platform's accessibility field, not left to the platform's automatic guess.

## Before and after: microcopy

Microcopy is where most sites leak, and it is a twenty-minute fix.

| Before | After | Why |
| --- | --- | --- |
| Submit | Add to cart — $189 | Says what happens and what it costs |
| Learn More | See the depth table | Names the destination; works as link text out of context |
| Click here for our soil calculator | Work out your soil volume | Front-loaded, no "click here", works in a link list |
| Sign up | Get the planting calendar for zone 6 | Trades a chore for a thing |
| Error: invalid input | Enter the bed length in feet, e.g. 8 | Says what to do, not what you did wrong |
| See below for details | See the crop-by-crop table | No directional reference |
| Read more → | Read the full depth guide | Distinguishable in a list of links |

Note that four of the seven rows are accessibility fixes and conversion fixes at the same time. That is the usual case, and it is the argument that wins the meeting.

## Editing someone else's expertise

Elena writes like a horticulturist, which is to say correctly and unreadably. Editing an SME is a distinct skill, and it has a protocol.

**Never change a fact silently.** Change a sentence, and if the change touches meaning, flag it in a comment: "I simplified this to 'six hours of sun' — is that accurate, or does it need the direct/indirect distinction?" An SME who finds a silent error in a published piece stops giving you drafts.

**Keep the caveats, move them.** Experts hedge because the hedge is true. The fix is placement, not deletion: give the reader the usable answer first, then the condition. "Ten to twelve inches. If you are on solid clay with no drainage, go deeper and add gravel" keeps Elena's caveat and stops it from swallowing the answer.

**Ask for the number.** When a draft says "generally quite shallow," ask "how shallow, in inches?" You will get a number, and the number is the sentence worth printing.

**Send back the strongest line.** Tell the SME which sentence you kept untouched and why. It teaches faster than any style guide and it makes the next draft better.

## Practice

Work with a real organization's copy — your employer's, a client's, or the fictional brand you defined in lesson 02. Use the same brand throughout.

**Part 1 — Voice table.** If you do not already have one, write a four-row "we are / we are not / in practice" table for the brand. Every "in practice" cell contains a real sentence you would ship and the version you would reject.

**Part 2 — Draft.** Take the content brief you wrote in lesson 02 and write the piece: 800–1,200 words, answering the brief's one question in the first forty words. Write the one-sentence promise at the top of your working document before you start and leave it in the file you submit.

**Part 3 — Six-pass edit, documented.** Edit your own draft in the six named passes, in order. After each pass record the word count and one sentence on what that pass changed. Your pass 3 should remove 15% or more of the words; if it did not, run it again with a harder eye on intensifiers and throat-clearing.

**Part 4 — Four rewrites.** Rewrite each of these, and under each write a two-to-four sentence diagnosis naming the specific defects and what you did about them. Report the before and after word counts.

```txt
(a) HOMEPAGE BLOCK
Welcome to our store! We are passionate about helping gardeners of
all levels achieve their gardening goals with our wide selection of
high-quality products and unbeatable customer service. Shop Now

(b) BLOG INTRO
Soil is arguably one of the most important aspects of any successful
garden, and choosing the right soil can often feel overwhelming for
beginners and experienced gardeners alike. In this article, we will
be taking a look at some of the various different options that are
available on the market today, so that you can make a more informed
decision about what might be right for your particular situation.

(c) SOCIAL CAPTION
🍅🍅 IT'S TOMATO SEASON!!! 🍅🍅 Who else is excited?? Drop a 🍅 in
the comments if you're planting tomatoes this year! Our full tomato
guide is live on the blog now — click the link in bio to check it
out!! You won't want to miss this one!!! 😍

(d) FORM AND BUTTON MICROCOPY
Field label: "Email"
Helper text: "Please enter a valid email address in the field above."
Button: "Submit"
Error state: "Invalid entry."
Confirmation: "Thank you for your submission."
```

**Part 5 — Accessibility pass on a real page.** Take any live page you can edit or inspect. Record every defect you find against this list, with the fix written out: link text that does not work out of context, heading levels skipped or faked with bold, images with missing, useless, or stuffed alt text, decorative images that should have empty alt, directional instructions, ALL CAPS or emoji-as-bullets, and tables shipped as screenshots. Then write the alt text for at least three images on that page, and for one of them write a second version for a different context and explain why they differ.

**Part 6 — One CTA.** Find a page or section in your organization's site with more than one call to action competing for the same reader. Write the single CTA you would keep, in five words or fewer, and three sentences defending the cut to a stakeholder who wants both.

**Deliverable — Copy Pack.** One document containing: the voice table; the promise sentence; the final piece; the six-pass edit log with word counts; the four rewrites with diagnoses and word counts; the accessibility audit with fixes and the three alt-text examples; and the single-CTA argument.
