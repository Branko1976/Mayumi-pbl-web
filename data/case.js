// =============================================================================
// CASE DATA: "A Difficult Child (Mayumi)" — PBL Tutorial Scenario
// Encoded from: Student_Handout, Tutor_handout, Depression_in_adolescence,
// About_this_Scenario (source .docx files)
// =============================================================================
//
// This file is the single source of truth for:
//   1) What information exists at each step ("ground truth" facts)
//   2) What each simulated character (Mayumi / Father / Mother / Narrator) is
//      allowed to reveal at each step, used to ground the LLM roleplay
//   3) The tutor's learning objectives & rubric criteria per step, used to
//      ground the LLM-suggested scoring
//
// Steps are presented to students in this fixed order. A student must click
// "Next Step" to advance; characters/narrator will not spontaneously reveal
// information that belongs to a later step.

export const CASE_META = {
  id: "mayumi-difficult-child",
  title: "A Difficult Child (Mayumi)",
  subtitle: "PBL Tutorial Scenario — Depression in Adolescence",
  objectives: [
    "Understand how depression presents in a general practice / outpatient setting.",
    "Know how and when to initiate antidepressant therapy, including the choices available.",
    "Know when to refer to specialist/hospital care.",
    "Understand how to treat recurrence of illness and how to prevent it.",
    "Be aware of other (non-pharmacological) forms of treatment of depression.",
  ],
  background:
    "Two thirds of people will suffer depressive symptoms at some point in their lives. " +
    "About 5% of the adult population has an episode of major depression in any given year. " +
    "Women are affected roughly twice as often as men; average age at presentation is 27. " +
    "In general practice, ~5% of consultations meet criteria for major depression, another 5% for minor depression, " +
    "and a further 10% show depressive symptoms not severe enough to need active intervention.",
};

// -----------------------------------------------------------------------------
// STEP DEFINITIONS
// -----------------------------------------------------------------------------
// Each step has:
//   key            - stable identifier
//   order          - sequence position
//   label          - shown to students
//   settingNote    - shown to student as scene-setting text when step begins
//   availableCharacters - which simulated characters can be addressed this step
//   revealedFacts  - facts the LLM characters are allowed to use this step
//                    (cumulative facts from earlier steps are always included
//                    automatically by the prompt builder)
//   tutorObjectives - what the tutor handout says students should be doing
//   rubric         - scoring criteria checked by the LLM scorer
//   tutorOnlyNotes - background/teaching notes for the tutor dashboard only,
//                    never shown to students or used in student-facing prompts

export const STEPS = [
  {
    key: "initial_information",
    order: 0,
    label: "Initial Information",
    settingNote:
      "Mayumi's parents have made an appointment with you for their daughter. The school principal " +
      "contacted them because Mayumi's behaviour has changed over the last 6 months: increasing absence " +
      "and deteriorating school performance. At home she is careless and hot-tempered. " +
      "The parents arrive late to the consultation because Mayumi refused to come with them.",
    availableCharacters: ["father", "mother", "narrator"],
    revealedFacts: [
      "Mayumi is 15 years old.",
      "School principal contacted parents about 6 months of behavioural change: increasing absence, deteriorating performance.",
      "At home Mayumi is careless and hot-tempered (a change from before).",
      "Mayumi became more turbulent after her first menstruation at age 13.",
      "Mayumi is now part of a 'gang' that freely uses alcohol.",
      "She has left home several times without notice, staying away 2-3 nights in a row.",
      "Previously she was quiet, unsure of herself, and somewhat perfectionistic.",
      "She used to be trustworthy; now she lies whenever she likes, especially about her friends.",
      "Parents are late to this consultation because Mayumi refused to come with them.",
    ],
    tutorObjectives: [
      "Elicit the timeline and nature of the behavioural change (onset ~6 months ago).",
      "Note the change from a previous baseline personality (quiet, unsure, perfectionistic) to current presentation (careless, defiant, negative, lying).",
      "Recognize concerning psychosocial risk markers early: alcohol use, running away overnight, gang affiliation, declining school performance.",
      "Begin building rapport with parents as informants; consider what they may not know or may be minimizing.",
    ],
    rubric: [
      "Asked about onset/timing and possible precipitating factors for the behavioural change.",
      "Asked about the nature and progression of symptoms (school, home, mood, behaviour).",
      "Asked about safety-relevant behaviours (overnight absences, alcohol, gang involvement) without judgment.",
      "Showed attention to parents' perspective and emotional state, not just the index patient.",
    ],
    tutorOnlyNotes:
      "This step should orient students to a behavioural-change presentation without yet biasing them toward " +
      "a single diagnosis. The differential at this point should be broad: depression, substance use disorder, " +
      "conduct disorder, normal adolescent individuation/rebellion, abuse/trauma, medical causes. Watch for premature closure.",
  },
  {
    key: "session1_part1",
    order: 1,
    label: "Session 1 — Part 1 (Chief Complaint)",
    settingNote:
      "Mayumi, a 15-year-old girl, is presented to the child psychiatry department by her parents. " +
      "Chief complaint: being careless, defiant and negative, as well as increasing absence and deteriorating school performance.",
    availableCharacters: ["father", "mother", "narrator"],
    revealedFacts: [
      "Formal chief complaint as stated above.",
    ],
    tutorObjectives: [
      "Articulate a clear chief complaint and begin a structured HPI: timing, onset, precipitating factors.",
      "Ask about agitation and what relieves it.",
      "Screen for specific psychotic features.",
      "Screen for potential for harm to self or others.",
      "Recognize that for an adolescent, a confidential, structured interview (HEADSS) will be needed: Home, Education, Activities, Drugs/alcohol, Sex, Suicidal thoughts — and that confidentiality must be explained.",
      "Consider that for younger children, history should also come from parents/school/other professionals, what's been tried, and what other family members think.",
    ],
    rubric: [
      "Established a clear, organized chief complaint / HPI structure (onset, timing, precipitants).",
      "Asked specifically about psychotic features and risk of harm to self/others.",
      "Demonstrated awareness that adolescent interviews need confidentiality and a structured approach (e.g., HEADSS), even if not all letters are covered yet.",
      "Did not jump to a single diagnosis prematurely; kept differential open.",
    ],
    tutorOnlyNotes:
      "Tutor note: 'How does your differential diagnosis change with this additional information? Not much — " +
      "and this is a major point of this case.' The teaching point is that the chief complaint alone is nonspecific; " +
      "many conditions in adolescence present with defiance/decline in school performance.",
  },
  {
    key: "session1_part2",
    order: 2,
    label: "Session 1 — Part 2 (Home Visit / Interview with Mayumi)",
    settingNote:
      "The parents ask you to meet Mayumi at home. She is in her room with the stereo blasting; her father turns " +
      "the music off, which makes her aggressive — she yells that they never leave her alone. She wears a leather " +
      "jacket and dirty jeans; she and her room are untidy. At first she only gives an unfriendly look and turns " +
      "away. You sit down, explain why you're there and what your role is, and tell her you can see she's not " +
      "feeling well and think there's a way to help. After a while she is willing to talk.",
    availableCharacters: ["mayumi", "father", "mother", "narrator"],
    revealedFacts: [
      "Mayumi doesn't enjoy school and wants to quit: 'It's no use, anyway...'",
      "She frequently has headaches.",
      "At night she 'must' leave home because she can't sleep; drinking alcohol helps her get to sleep.",
      "She says it's nice to get away from all the reproaches at home.",
      "She feels she will never be able to please her parents.",
      "She feels nobody understands her, neither at home nor at school.",
      "She says to the interviewer: 'I bet you aren't worth the trouble either...'",
      "Parents believe their domestic situation/marriage is good and stable.",
      "Mayumi is the younger of two siblings; her 18-year-old brother is healthy and reportedly has no problems.",
      "Mayumi's mother has, from time to time (especially spring and fall), been tired and down, and has had abdominal pain and irritable bowel symptoms.",
      "Mayumi's maternal grandmother was periodically depressed.",
    ],
    tutorObjectives: [
      "Recognize anhedonia, hopelessness, low self-worth, and irritability as depressive symptoms, not just 'bad behaviour'.",
      "Identify headaches and sleep disturbance as possible somatic/depressive symptoms.",
      "Identify alcohol use as self-medication for insomnia — a risk behaviour requiring direct, non-judgmental exploration (the 'D' in HEADSS).",
      "Note family psychiatric history: maternal mood symptoms and maternal grandmother's depression — relevant family history of mood disorder.",
      "Continue ruling out physical trauma/abuse, recent substance use, and signs/symptoms of infection.",
      "Explore the patient's/family's own explanatory model of the illness and any use of complementary/alternative medicine or traditional healers.",
      "Note that the differential should still remain broad even with this additional information.",
    ],
    rubric: [
      "Recognized and named depressive symptoms in Mayumi's statements (hopelessness, anhedonia, worthlessness, irritability) rather than only labeling her 'defiant'.",
      "Asked about sleep, headaches, and other somatic symptoms.",
      "Explored alcohol use specifically and non-judgmentally, asked why she uses it (self-medication for sleep).",
      "Took a family psychiatric history (mother's mood symptoms, maternal grandmother's depression).",
      "Asked about safety: self-harm or suicidal ideation, and physical abuse/trauma.",
      "Showed empathic, rapport-building communication style appropriate for a guarded adolescent.",
    ],
    tutorOnlyNotes:
      "Risk factors taught in this scenario: Child — male gender (less relevant here), low intelligence, difficult " +
      "temperament, physical illness, developmental delay. Family — traumatic stress, ineffective/inconsistent or " +
      "punitive parenting, family disharmony, parental mental illness, family isolation/lack of other caring adults. " +
      "Environment — social deprivation, peer relationship problems, social stressors, excessive screen time. " +
      "Maternal mood symptoms + maternal grandmother's depression are a deliberate clue toward a genetic/family loading " +
      "for mood disorder, which becomes important later when the mother is also diagnosed with depression.",
  },
  {
    key: "session1_part3",
    order: 3,
    label: "Session 1 — Part 3 (Examination & MFQ)",
    settingNote:
      "Mayumi agrees to visit your office one week later. You perform a somatic examination with normal findings " +
      "and order further investigations. Mayumi fills out the Mood and Feelings Questionnaire (MFQ) — Long Version " +
      "(33 items, scored 0-2 per item, maximum 66).",
    availableCharacters: ["mayumi", "narrator"],
    revealedFacts: [
      "Somatic (physical) examination: normal findings.",
      // --- MFQ Long Version — Mayumi's completed responses ---
      // Scoring: NOT TRUE = 0, SOMETIMES = 1, TRUE = 2
      "MFQ item 1  — I felt miserable or unhappy:                      TRUE (2)",
      "MFQ item 2  — I didn't enjoy anything at all:                   TRUE (2)",
      "MFQ item 3  — I was less hungry than usual:                     NOT TRUE (0)",
      "MFQ item 4  — I ate more than usual:                            NOT TRUE (0)",
      "MFQ item 5  — I felt so tired I just sat around and did nothing: SOMETIMES (1)",
      "MFQ item 6  — I was moving and walking more slowly than usual:  NOT TRUE (0)",
      "MFQ item 7  — I was very restless:                              SOMETIMES (1)",
      "MFQ item 8  — I felt no good anymore:                           TRUE (2)",
      "MFQ item 9  — I blamed myself for things that weren't my fault: TRUE (2)",
      "MFQ item 10 — It was hard for me to make up my mind:            NOT TRUE (0)",
      "MFQ item 11 — I felt grumpy and cross with my parents:          TRUE (2)",
      "MFQ item 12 — I felt like talking less than usual:              SOMETIMES (1)",
      "MFQ item 13 — I was talking more slowly than usual:             NOT TRUE (0)",
      "MFQ item 14 — I cried a lot:                                    NOT TRUE (0)",
      "MFQ item 15 — I thought there was nothing good for me in the future: TRUE (2)",
      "MFQ item 16 — I thought that life wasn't worth living:          SOMETIMES (1)",
      "MFQ item 17 — I thought about death or dying:                   NOT TRUE (0)",
      "MFQ item 18 — I thought my family would be better off without me: NOT TRUE (0)",
      "MFQ item 19 — I thought about killing myself:                   NOT TRUE (0)",
      "MFQ item 20 — I didn't want to see my friends:                  TRUE (2)",
      "MFQ item 21 — I found it hard to think properly or concentrate: SOMETIMES (1)",
      "MFQ item 22 — I thought bad things would happen to me:          NOT TRUE (0)",
      "MFQ item 23 — I hated myself:                                   SOMETIMES (1)",
      "MFQ item 24 — I felt I was a bad person:                        TRUE (2)",
      "MFQ item 25 — I thought I looked ugly:                          SOMETIMES (1)",
      "MFQ item 26 — I worried about aches and pains:                  NOT TRUE (0)",
      "MFQ item 27 — I felt lonely:                                    TRUE (2)",
      "MFQ item 28 — I thought nobody really loved me:                 TRUE (2)",
      "MFQ item 29 — I didn't feel good in school:                     TRUE (2)",
      "MFQ item 30 — I thought I could never be as good as other kids: TRUE (2)",
      "MFQ item 31 — I did everything wrong:                           NOT TRUE (0)",
      "MFQ item 32 — I didn't sleep as well as I usually sleep:        SOMETIMES (1)",
      "MFQ item 33 — I slept a lot more than usual:                    SOMETIMES (1)",
      // --- Totals and subscale summary ---
      "MFQ Total score: 33 / 66 (long version clinical threshold: ≥27 suggests probable depression).",
      "Items scored TRUE (2 points each, n=12): 1, 2, 8, 9, 11, 15, 20, 24, 27, 28, 29, 30 → subtotal 24.",
      "Items scored SOMETIMES (1 point each, n=9): 5, 7, 12, 16, 21, 23, 25, 32, 33 → subtotal 9.",
      "Items scored NOT TRUE (0 points each, n=12): 3, 4, 6, 10, 13, 14, 17, 18, 19, 22, 26, 31 → subtotal 0.",
      // --- Clinically notable item-level patterns ---
      "Suicidality screen (items 16-19): item 16 (life not worth living) SOMETIMES; items 17, 18, 19 NOT TRUE. No active suicidal ideation endorsed.",
      "Mood/affect core (items 1,2,8): all TRUE — pervasive unhappiness, anhedonia, worthlessness.",
      "Self-blame / negative cognition (items 9,23,24,30): items 9 and 24 TRUE; 23 and 30 SOMETIMES — consistent negative self-schema.",
      "Social withdrawal (item 20): TRUE — consistent with earlier clinical observation.",
      "Hopelessness (item 15): TRUE — 'nothing good for me in the future.'",
      "Sleep disturbance (items 32,33): both SOMETIMES — consistent with reported alcohol use to aid sleep.",
      "Neurovegetative symptoms (items 3,4,5,6,13): appetite change absent; fatigue mild (SOMETIMES); psychomotor changes absent — atypical/non-melancholic profile.",
      "Irritability (item 11 — grumpy/cross with parents): TRUE — prominent feature, consistent with adolescent-onset presentation.",
    ],
    tutorObjectives: [
      "Recognize that a normal physical exam does not rule out depression — it helps exclude organic causes.",
      "Understand the purpose, scoring, and interpretive limits of the MFQ as a screening tool, including that a score of 33/66 is well above the long-version threshold of ≥27.",
      "Identify the clinically significant item-level patterns in Mayumi's MFQ: pervasive low mood and anhedonia, prominent hopelessness and negative self-schema, social withdrawal, irritability, and mild sleep disturbance — but relative absence of psychomotor slowing, appetite change, and (crucially) no active suicidal ideation endorsed.",
      "Note the partial suicidality screen: item 16 (life not worth living) is SOMETIMES — a clinical red flag requiring direct, compassionate follow-up in person, even though active suicidal ideation (items 17-19) was not endorsed.",
      "Decide what further investigations are indicated and why: labs to exclude organic mimics (CBC, TSH/FT4, CRP, monospot, glucose, ferritin, B12, folate, vitamin D) and imaging/EEG if indicated.",
      "Reconsider the differential diagnosis: MFQ score of 33 on top of the clinical picture significantly raises MDD to the leading diagnosis.",
    ],
    rubric: [
      "Correctly interpreted the normal physical exam as excluding gross organic pathology, not ruling out depression.",
      "Correctly interpreted the MFQ score of 33/66 as clinically significant — above the ≥27 threshold — without over-relying on the number alone.",
      "Identified the key symptom clusters in Mayumi's responses: core mood symptoms (items 1,2,8 all TRUE), hopelessness (item 15 TRUE), negative self-schema (items 9,24 TRUE), and social withdrawal (item 20 TRUE).",
      "Recognised that item 16 (life not worth living: SOMETIMES) requires direct clinical follow-up even though active suicidal ideation was not endorsed — and would (or did) address this with Mayumi directly.",
      "Proposed a reasonable, justified list of further investigations to exclude organic mimics of depression.",
      "Updated the differential diagnosis appropriately, raising MDD to the top while keeping substance use and psychosocial factors in view.",
    ],
    tutorOnlyNotes:
      "MFQ (Long Version) completed by Mayumi: total 33/66. Clinical threshold ≥27 indicates probable depression. " +
      "Key teaching points from her specific responses: (1) The absence of active suicidal ideation (items 17-19 all NOT TRUE) is reassuring but does NOT close the conversation — item 16 (SOMETIMES) demands a direct follow-up question, which is a critical clinical skill students must demonstrate. " +
      "(2) The non-melancholic profile (no appetite change, no psychomotor slowing, no excessive crying) alongside prominent irritability and negative cognition is classic for adolescent-onset depression, where the presentation often looks more like 'behaviour problems' than textbook adult MDD. " +
      "(3) The MFQ is a self-report screening tool, not a diagnostic instrument — a score of 33 means 'screen positive,' not 'diagnosis of MDD.' Diagnosis still requires a full clinical interview. " +
      "MFQ developed by Adrian Angold & Elizabeth J. Costello (1987). Cut-point of ≥27 (long version) is widely cited but context-dependent.",
  },
  {
    key: "session2_part1",
    order: 4,
    label: "Session 2 — Part 1 (Lab & Imaging Results)",
    settingNote: "Results are back from the investigations ordered at the previous visit.",
    availableCharacters: ["narrator"],
    revealedFacts: [
      "Hb 13.5 g/dL (ref 11.7-15.3) — normal.",
      "WBC 6 x10^9/L (ref 4.1-9.8) — normal.",
      "MCH 28 pg (ref 25.0-35.0) — normal.",
      "MCV 90 fL (ref 81-95) — normal.",
      "Thrombocytes 200 x10^9/L (ref 164-370) — normal.",
      "CRP 5 mg/L (ref <5) — borderline/essentially normal, no significant inflammation.",
      "Monospot: Negative (rules out acute infectious mononucleosis).",
      "Glucose 8.0 mmol/L (ref <11.1) — normal, no diabetes.",
      "TSH 2.4 mIE/L (ref for 11-15y 0.56-5.44) — normal thyroid function.",
      "FT4 15.2 pmol/L (ref 11.6-19.1) — normal.",
      "Ferritin 56 μg/L (ref 10-167) — normal iron stores.",
      "Vitamin B12 360 pmol/L (ref 150-600) — normal.",
      "Vitamin D 62 nmol/L (ref 37-108) — normal/sufficient.",
      "Folate 22 nmol/L (ref 9-36) — normal.",
      "Cerebral MRI: normal.",
      "Standard EEG: normal for age.",
    ],
    tutorObjectives: [
      "Correctly interpret each lab value against the reference range provided.",
      "Conclude that there is no organic/medical explanation (anemia, thyroid disease, infection, vitamin deficiency, diabetes, structural brain lesion, epileptiform activity) for the presentation.",
      "Recognize that a fully normal work-up, combined with the clinical picture and MFQ findings, raises depression (with prominent irritability/behavioural features, as is common in adolescents) to the top of the differential.",
      "Discuss how to proceed with management given these results.",
    ],
    rubric: [
      "Reviewed and correctly characterized each lab/imaging result as normal (or explained why borderline values like CRP are not significant).",
      "Explicitly stated that the work-up excludes the major organic differentials considered.",
      "Concluded that major depressive disorder is now the leading diagnosis, with substance use and family psychosocial stress as contributing/comorbid factors.",
      "Articulated a sensible next-step management plan (e.g., specialist consultation, starting treatment, follow-up plan) rather than just stopping at 'results are normal.'",
    ],
    tutorOnlyNotes:
      "Tutor instruction here: review lab results reflecting on normal values, and ask what diagnosis ranks highest now. " +
      "Expected answer: Major Depressive Disorder (adolescent-onset, with irritability and behavioural disturbance as " +
      "prominent atypical features), now that organic causes are excluded.",
  },
  {
    key: "session2_part2",
    order: 5,
    label: "Session 2 — Part 2 (Management, Course, and Outcome)",
    settingNote:
      "After consulting the nearest Child and Adolescent Psychiatric (CAP) outpatient unit, antidepressant " +
      "medication is started and weekly CBT-based consultations begin.",
    availableCharacters: ["mother", "father", "narrator"],
    revealedFacts: [
      "After consulting the nearest CAP outpatient unit, treatment with an SSRI (fluoxetine) was initiated, plus weekly CBT-based consultations.",
      "Mayumi's depression improved with these measures over time; she became lively and energetic again.",
      "She gradually resumed schoolwork, began experiencing success, and started making plans for further education.",
      "She continued to struggle with her parents for a while, but her aggression gradually evolved into constructive self-assertion.",
      "The doctor also diagnosed depression in Mayumi's mother and achieved good results with antidepressant medication for her.",
      "Mayumi's mother later disclosed she had suffered periodic depression since she was young, and had been very depressed when Mayumi was a young child.",
      "Students are referred to a CBT demonstration video for review of CBT technique (not part of the clinical content itself).",
    ],
    tutorObjectives: [
      "Discuss when/why to refer to specialist child & adolescent psychiatry services (this case did consult CAP).",
      "Know first-line treatment choices for adolescent MDD: SSRI (fluoxetine is a standard first-line choice in this age group) plus psychotherapy (CBT), per guidelines.",
      "Discuss antidepressant initiation principles: indications (moderate-severe severity, psychotic features, prior positive response, patient preference, psychotherapy unavailable), monitoring for the FDA-class boxed warning of increased suicidality risk in youth on antidepressants, and need for close follow-up (e.g., weekly contact early in treatment).",
      "Discuss the responsibility of informing social services / safeguarding considerations given the case's sociocultural and family history, and what supports might be recommended.",
      "Recognize that the mother's own (previously unrecognized/undertreated) depression — and the family loading suggested by the grandmother's history — is clinically relevant: maternal depression affects child development and family functioning, and treating it is part of comprehensive care.",
      "Discuss relapse prevention and ongoing management of recurrence risk.",
      "Be aware of non-pharmacological treatment options: CBT (goal-directed, focuses on changing maladaptive thought/behaviour patterns) and other modalities (psychotherapy broadly, group therapy).",
    ],
    rubric: [
      "Identified SSRI (fluoxetine) plus CBT as an appropriate evidence-based first-line treatment combination for adolescent major depression.",
      "Discussed the boxed warning regarding increased suicidality risk with antidepressants in youth and the need for close monitoring/follow-up.",
      "Raised the question of safeguarding / social services involvement and considered appropriate psychosocial supports given the family's history.",
      "Recognized the significance of the mother's depression diagnosis and family history of depression (grandmother) for both Mayumi's care and the family unit as a whole.",
      "Discussed relapse prevention / long-term follow-up, not just acute treatment.",
      "Could describe, at a basic level, what CBT is and why it's used here.",
    ],
    tutorOnlyNotes:
      "Tutor handout flags 'discuss the responsibility of informing social services' and 'what supports would you " +
      "recommend given this patient's sociocultural history' as explicit discussion points, plus reviewing the CBT " +
      "demonstration video (https://www.youtube.com/watch?v=JKUFWK6iSsw) for technique. The video itself is a tutor-" +
      "facilitated group discussion item, not something the chatbot needs to discuss in character.",
  },
];

export const STEP_ORDER = STEPS.map((s) => s.key);

export function getStepByKey(key) {
  return STEPS.find((s) => s.key === key) || null;
}

export function getStepByOrder(order) {
  return STEPS.find((s) => s.order === order) || null;
}

export function getNextStep(currentKey) {
  const current = getStepByKey(currentKey);
  if (!current) return STEPS[0];
  return getStepByOrder(current.order + 1) || null; // null = case complete
}

export function getPreviousStep(currentKey) {
  const current = getStepByKey(currentKey);
  if (!current) return null;
  return getStepByOrder(current.order - 1) || null; // null = already at the first step
}

export function getAllFactsUpToStep(stepKey) {
  const current = getStepByKey(stepKey);
  if (!current) return [];
  return STEPS.filter((s) => s.order <= current.order).flatMap((s) => s.revealedFacts);
}

// -----------------------------------------------------------------------------
// CHARACTER DEFINITIONS
// -----------------------------------------------------------------------------
// Used to ground the LLM's persona, tone, and guardrails for each simulated
// character the student can address. "narrator" is a special pseudo-character
// used for exam findings / lab results / scene description rather than a person.

export const CHARACTERS = {
  mayumi: {
    name: "Mayumi",
    role: "15-year-old patient",
    persona:
      "You are Mayumi, a 15-year-old girl. You are guarded, irritable, and initially hostile or dismissive " +
      "toward adults, especially clinicians, because you feel nobody understands you and you expect to be judged " +
      "or lectured. Underneath the defiance you feel hopeless, exhausted, and like you can never live up to your " +
      "parents' expectations. You have trouble sleeping and sometimes drink alcohol at night to fall asleep. You " +
      "get frequent headaches. You don't want to talk about your friends or what you do at night unless the " +
      "interviewer asks in a way that feels safe, non-judgmental, and genuinely curious rather than accusatory. " +
      "You warm up slowly if the interviewer is patient, explains their role, and doesn't lecture you. " +
      "Speak in short, sometimes sullen or sarcastic teenage sentences. Don't volunteer everything at once — " +
      "make the student work for it, the way a real guarded adolescent patient would, but don't be needlessly " +
      "obstructive forever if they ask a clear, kind, direct question.",
    speechStyle: "Short sentences, occasional sarcasm, reluctant, terse when guarded, more open once rapport is built.",
  },
  father: {
    name: "Mayumi's Father",
    role: "Mayumi's father",
    persona:
      "You are Mayumi's father. You are worried and somewhat at a loss about what has happened to your daughter. " +
      "You believe your marriage and home life are basically good and stable, and you may understate or not " +
      "recognize family stress (e.g., you may not immediately volunteer details about your wife's low moods unless " +
      "specifically and sensitively asked). You turned off Mayumi's stereo during the home visit, which upset her. " +
      "You are cooperative with the clinician and want to help, but you can come across as a bit rigid or " +
      "frustrated with Mayumi's behaviour ('she used to be such a good girl'). You're not hiding anything " +
      "deliberately, you just see things from a parent's worried, slightly defensive perspective.",
    speechStyle: "Concerned, a little defensive about the family, practical and matter-of-fact.",
  },
  mother: {
    name: "Mayumi's Mother",
    role: "Mayumi's mother",
    persona:
      "You are Mayumi's mother. Like your husband, you think your marriage and home situation are basically good. " +
      "If asked directly and sensitively about your own health and mood, you can disclose that you've had " +
      "periods — especially in spring and fall — of feeling tired and down, plus abdominal pain and symptoms " +
      "of irritable bowel; you don't necessarily think of this as 'depression' unless a clinician frames it that " +
      "way for you. You know your own mother (Mayumi's grandmother) was periodically depressed. Later in the case " +
      "(only once the student has reached that point in the story), you can share that you've actually struggled " +
      "with periodic depression since you were young, and were quite depressed when Mayumi was a small child — " +
      "but only reveal this once it's appropriate to the current step, not before. You love Mayumi and are " +
      "frightened by how much she's changed.",
    speechStyle: "Warm but anxious, a little guarded about her own health until asked kindly and directly.",
  },
  narrator: {
    name: "Clinical Narrator",
    role: "Neutral clinical narrator / examiner",
    persona:
      "You are a neutral clinical narrator. You report objective findings only: physical examination findings, " +
      "questionnaire results, lab values, imaging/EEG results, and plain factual scene description. You do not " +
      "roleplay emotion or opinion, and you do not interpret the findings for the student (no diagnosis, no " +
      "'this suggests...'). If asked to interpret findings, gently redirect: that's the student's clinical " +
      "reasoning task, not yours. If the student asks for a test/finding that has not been revealed in this case " +
      "at the current step, say plainly that this information/result is not available yet at this point in the " +
      "case, or was not part of the work-up performed for this patient (do not invent results that contradict the case).",
    speechStyle: "Plain, factual, brief, clinical register.",
  },
};

export function getCharacter(key) {
  return CHARACTERS[key] || null;
}
