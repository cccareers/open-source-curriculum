---
lesson_id: APP104-03
course_id: APP104
pathway: workforce-development-professional
title: Activity Codes and PIRL Flags
order: 3
kind: lesson
competency_ids:
  - D2-S4-C02
objectives:
  - Select the correct activity codes and PIRL flags for apprenticeship-related services.
---

## How a case note becomes a performance record

Everything your board reports about an apprentice starts as an activity you record in CalJOBS. The system turns those activities, plus the flags and fields on the participant's record, into the Participant Individual Record Layout (PIRL) that goes to the Department of Labor. If the activity is wrong, or the apprenticeship flag is never set, the federal record says this person was in some other kind of training, or in no training at all.

That chain is the whole point of this lesson:

1. **Service delivered** (what actually happened with the participant)
2. **CalJOBS activity code** (how you record that service)
3. **PIRL elements** (what the federal record shows, including apprenticeship status and type of training)
4. **Performance and reporting** (what your board gets credit for)

Case managers own step 2. MIS administrators and data staff own the checks between steps 2 and 4. Both need to know the codes.

## The codes this course focuses on

CCC's catalog for this course names a small set of codes that matter most for apprentices:

| Code | Where it lives | What you need to know |
| --- | --- | --- |
| Activity codes 300, 301, 428 | CalJOBS activity codes | The apprenticeship-related activity codes this course covers. Each has its own definition and use; look up the current definition before you choose one. |
| PIRL element 931 | Federal PIRL | The element the catalog ties to apprenticeship status. If it is not set correctly, the apprentice is not counted as an apprentice in federal reporting. |
| Type-of-training code 09 | PIRL type-of-training values | The type-of-training value the catalog associates with Registered Apprenticeship. |

This course deliberately does not restate the full definition of each activity code. Definitions, allowable uses, and which fields they populate change with state directives and CalJOBS releases. **Check the current CalJOBS activity code guidance from EDD and the current PIRL specification from DOL before you code.** Bookmark both; your MIS administrator should know the current versions.

## Selecting the right code: a decision checklist

When you are about to record a service for an apprentice, work through these questions in order:

- **Is this a training service or a career service?** Paying for related technical instruction or supporting OJT is training. A resume review or labor market information session is a career service. Apprenticeship-specific activity codes belong only on the services they define.
- **Is the person a registered apprentice right now?** A pre-apprentice or someone still applying is not yet a registered apprentice. Coding them as one overstates your apprenticeship numbers.
- **Which of the course's codes matches the service definition exactly?** Read the definition, not just the title. If none matches, use the code that does describe the service and ask your MIS administrator whether an apprenticeship flag still applies.
- **Does the activity carry the right type of training?** For a training service tied to the Registered Apprenticeship program, confirm that the record carries the apprenticeship type-of-training value (the catalog identifies code 09).
- **Is the apprenticeship status element set?** Confirm the participant record shows the apprentice correctly for PIRL element 931, following current PIRL instructions.
- **Do dates line up?** Activity start dates should match the apprenticeship start and the case note. A training activity that starts before enrollment, or months after the apprentice began, will be questioned.

## Worked example

Continuing with Darnell from the previous lesson. He is co-enrolled in Dislocated Worker and is a registered first-year electrical apprentice. Over his first month the case manager:

- Pays his related-instruction fee through a training service.
- Buys his required tool kit as a supportive service.
- Holds a career services appointment to build his individual employment plan.

The case manager's coding plan:

| Service | Type | Coding approach |
| --- | --- | --- |
| Related-instruction fee | Training, tied to RA | The course activity code whose definition matches RA-related training; type of training shows apprenticeship (09); apprenticeship status set for element 931 |
| Tool kit | Supportive service | The supportive service code your board uses; not an apprenticeship training code |
| IEP appointment | Career service | The appropriate career services code |

Notice that only one of the three services is an apprenticeship training activity. Coding all three as apprenticeship activities is a common error and inflates the record.

## Data staff: a monthly check

MIS administrators and data staff can catch errors before they reach the PIRL. A simple monthly pull:

1. List every participant with an apprenticeship-related activity code (300, 301, or 428).
2. For each, confirm the apprenticeship status element and type-of-training value are populated as the current PIRL requires.
3. List every participant whose case notes or employer field mention a registered apprenticeship sponsor but who has no apprenticeship-related activity. These are your likely missed apprentices.
4. Send exceptions back to the case manager with the specific field to correct.

## Discussion prompt

Ask the group: when your office has miscoded an apprentice, which step in the chain broke? Was it the service decision, the code choice, or a flag nobody set?

## Practice

Using Darnell's file and the current CalJOBS activity code guidance and PIRL specification:

1. Look up activity codes 300, 301, and 428 and write a one-line definition of each in your own words, with the source and date of the guidance you used.
2. For each of Darnell's three services in the worked example, name the exact activity code you would record and the PIRL fields you expect it to populate.
3. Draft a three-item exception list for a data staff review: one apprentice missing the status flag, one non-apprentice wrongly coded as an apprentice, and one apprentice with mismatched dates. For each, write the correction note you would send to the case manager.
