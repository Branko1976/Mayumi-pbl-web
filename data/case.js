// =============================================================================
// CASE DATA: "Acute Agitation in a Postpartum Woman" — PBL Tutorial Scenario
// Encoded from: Student_Handout, Tutor_handout, Methamphetamine_induced_psychosis,
// About_this_Scenario (source .docx files)
// =============================================================================
//
// This file is the single source of truth for:
//   1) What information exists at each step ("ground truth" facts)
//   2) What each simulated character (Patient / Friend / Mother / Narrator) is
//      allowed to reveal at each step, used to ground the LLM roleplay
//   3) The tutor's learning objectives & rubric criteria per step, used to
//      ground the LLM-suggested scoring
//
// Steps are presented to students in this fixed order. A student must click
// "Next Step" to advance; characters/narrator will not spontaneously reveal
// information that belongs to a later step.

export const CASE_META = {
  "id": "postpartum-agitation-meth-psychosis",
  "title": "Acute Agitation in a Postpartum Woman",
  "subtitle": "PBL Tutorial Scenario — Methamphetamine-Induced Psychosis & Postpartum Comorbidity",
  "objectives": [
    "Build a broad differential diagnosis for acute agitation/psychosis and avoid premature closure on a single cause.",
    "Recognize the ethical and legal duties that arise when an agitated patient refuses treatment, forbids contact with family, or poses a risk to herself or staff.",
    "Interpret vital signs, physical exam, and laboratory findings in the context of possible infection, substance intoxication/withdrawal, and postpartum psychiatric illness.",
    "Distinguish substance abuse from substance dependence and understand why dependence is diagnosed when both sets of criteria are met.",
    "Know the acute pharmacologic management of severe agitation and the longer-term, largely non-pharmacological treatment options for methamphetamine dependence."
  ],
  "background": "This case involves a patient with an acute mental status change who presents with psychotic symptoms shortly after childbirth. Because she has multiple concurrent conditions — possible postpartum psychiatric illness, possible infection, and probable substance use — students must consider medical, psychiatric, and substance-use causes together rather than settling on a single diagnosis too early. This case also raises ethical questions (consent, confidentiality, involuntary treatment, safeguarding of her children) without a single clean answer."
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
    "key": "initial_information",
    "order": 0,
    "label": "Initial Information",
    "settingNote": "A 30-year-old woman comes to the emergency department with her friend because of agitated and restless behaviour. The friend tells the physician the patient delivered a baby last month, and that she had been attending prenatal clinic regularly. The patient is not willing to stay in bed and is pushing staff members away. She is loud, swearing at people around her, afraid, and looking behind herself constantly. She is refusing to allow the nurse to examine her or draw blood.",
    "availableCharacters": [
      "patient",
      "friend",
      "narrator"
    ],
    "revealedFacts": [
      "Patient is a 30-year-old woman, about 1.5 weeks postpartum after an uncomplicated pregnancy she attended prenatal clinic for regularly.",
      "Prior prenatal labs on record: blood type O+, antibody screen negative, VDRL negative, PPD negative, HIV negative, hepatitis B surface antigen negative, rubella immune, maternal serum triple screen within normal limits, glucose challenge test within normal limits, hemoglobin electrophoresis 97% hemoglobin A.",
      "She is agitated, loud, swears at staff, refuses to stay in bed, and pushes staff away.",
      "She appears frightened and keeps looking behind herself as if afraid of something.",
      "She is refusing to let the nurse examine her or draw blood.",
      "Her friend brought her to the ED and is the only history source available so far; the friend does not know detailed medical history."
    ],
    "tutorObjectives": [
      "Recognize this is an acute mental status change requiring urgent assessment of safety (danger to self or others).",
      "Generate a broad initial differential: delirium, postpartum psychosis, medical/infectious causes, substance intoxication or withdrawal, bipolar disorder, trauma/domestic violence or head injury.",
      "Begin gathering HPI from the friend: timing/onset/precipitants of agitation, aggravating/relieving factors, specific psychotic features, risk of harm to self or others.",
      "Approach the frightened, paranoid patient calmly rather than escalating confrontation."
    ],
    "rubric": [
      "Recognized this as an acute, potentially dangerous presentation requiring prompt safety assessment.",
      "Generated a broad initial differential diagnosis rather than anchoring on one cause (delirium, postpartum psychosis, medical/infectious cause, substance intoxication/withdrawal, bipolar disorder, trauma).",
      "Attempted to gather a structured HPI from the friend (onset, timing, precipitants, relieving/aggravating factors, psychotic features, risk of harm).",
      "Approached the frightened/paranoid patient in a calm, non-confrontational, safety-conscious way."
    ],
    "tutorOnlyNotes": "This step should orient students to an acute-agitation presentation without biasing them toward a single diagnosis. Watch for premature closure on 'postpartum depression' or 'she's just a drug user' this early — the differential should stay broad until more history and exam data arrive."
  },
  {
    "key": "session1_part1",
    "order": 1,
    "label": "Session 1 — Part 1 (History from the Mother)",
    "settingNote": "With some effort, the physician obtains contact information for the patient's mother — but the agitated patient forbids staff from contacting her family. When asked more about her condition she stops talking; when pressed she becomes more agitated. Offered medication to calm down, she becomes even more agitated, screaming she is not crazy and will not take medication. She threatens to injure or kill staff and thrashes around, banging her head against the door. Given the escalating risk to the patient and staff, the mother is contacted anyway, and she is able to provide history by phone.",
    "availableCharacters": [
      "patient",
      "friend",
      "mother",
      "narrator"
    ],
    "revealedFacts": [
      "The patient forbade staff from contacting her family, but staff contacted her mother anyway given the emergency and risk to the patient and others.",
      "The patient is a single mother with a history of 'mood swings and anger problems.'",
      "She has been on psychiatric medications in the past but her medication adherence hasn't always been good; her mother does not know exactly what medications.",
      "She was following up with a psychiatrist in the past, but it may have been a while since her last visit.",
      "She has been treated before at a local inpatient psychiatric hospital with similarly agitated presentations, but the last time was several years ago.",
      "PMHx: childhood asthma (no hospitalizations), prescribed a Proventil inhaler as needed, may have taken more than recommended.",
      "PSHx: cesarean section 7 years ago under epidural anesthesia.",
      "Allergies: none known (drug or food).",
      "Medications: Proventil inhaler prn, multivitamins, iron.",
      "Social history: smokes about half a pack (10 cigarettes) a day, is alcohol-dependent, has a history of cocaine and methamphetamine use, and has been in drug rehab in the past.",
      "She is currently unemployed, lives with her boyfriend and her three children (ages 1.5 weeks, 5, and 7), and her boyfriend may be abusive.",
      "Family history: mother 50 (mild hypertension), father 55 (heart disease, hypertension, multiple strokes), sister 26 and brother 22 (both asthma, both alcohol misuse, both diagnosed with bipolar disorder and depression), grandparents on both sides with hypertension, heart disease, and depression.",
      "Review of systems is significantly positive for insomnia."
    ],
    "tutorObjectives": [
      "Recognize the emergency exception that allows contacting the mother without the patient's consent given the risk of harm.",
      "Identify the ethical/legal duty to keep the patient and staff safe (restraints or involuntary medication only as a last resort; note the hyperthermia risk from struggling against restraints).",
      "Use the mother's history (mood swings/anger problems, inconsistent psychiatric follow-up, prior inpatient admissions, psychosocial stress of three young children including a newborn, possibly unsupportive/abusive boyfriend) to raise the risk of relapse of bipolar disorder, schizophrenia, or another psychiatric illness.",
      "Consider asthma/inhaler overuse, postpartum status (delirium from infection, anesthesia, or a postpartum mood/psychotic disorder), possible domestic violence/trauma, and substance use (stimulant intoxication or sedative withdrawal) as parallel explanations rather than jumping to one label.",
      "Plan a physical exam focusing on vitals, lungs (asthma), abdomen (postpartum), pelvic/vaginal exam, and a mental status exam.",
      "Show awareness of how personal bias could affect care of this patient and commit to a nonjudgmental, supportive approach."
    ],
    "rubric": [
      "Justified contacting the mother without the patient's consent as an emergency exception given risk of harm to the patient or others.",
      "Recognized the duty to keep patient and staff safe, treating restraints/involuntary medication as a last resort and noting the hyperthermia risk of struggling against restraints.",
      "Used the mother's history to broaden (not narrow) the differential: possible relapse of a mood/psychotic disorder, postpartum delirium/psychosis, domestic violence/trauma, and substance intoxication or withdrawal.",
      "Planned a physical exam covering vitals, lungs, abdomen, pelvic/vaginal exam, and a mental status exam.",
      "Showed awareness of potential personal bias and committed to a nonjudgmental, supportive approach to this patient."
    ],
    "tutorOnlyNotes": "Tutor note: 'How does your differential diagnosis change with this additional information? Not much — and this is a major point of this case.' The teaching point is that the mother's history broadens rather than narrows the differential; students should resist anchoring on either 'psychiatric relapse' or 'drug user' prematurely."
  },
  {
    "key": "session1_part2",
    "order": 2,
    "label": "Session 1 — Part 2 (Physical Examination)",
    "settingNote": "The team is now able to perform a physical examination and mental status examination.",
    "availableCharacters": [
      "patient",
      "narrator"
    ],
    "revealedFacts": [
      "General: anxious-appearing, very agitated woman.",
      "Vitals: BP 160/90 mmHg, HR 100 bpm, Temp 40°C, RR 24/min, Height 165 cm, Weight 65 kg.",
      "Skin: small excoriations noted on the cheeks and both forearms.",
      "HEENT: anicteric, mildly dry mucous membranes, several dental caries.",
      "Chest: lungs clear to auscultation and percussion.",
      "CV: tachycardic, normal S1/S2.",
      "Abdomen: soft, nontender, active bowel sounds, no rebound.",
      "Back: within normal limits.",
      "Pelvic exam: not done.",
      "Extremities: no clubbing or cyanosis.",
      "Psych: alert and oriented, but agitated.",
      "Neuro: cranial nerves grossly intact, full strength and sensation in all extremities, deep tendon reflexes 3+.",
      "Mental status exam: female, appears stated age, uncooperative, appears paranoid, may be responding to internal stimuli, agitated, looking around/behind herself as if afraid of something, speech not spontaneous. Suicidality/homicidality cannot be determined but she has threatened staff and does not want anyone close to her. MMSE cannot be performed due to uncooperativeness."
    ],
    "tutorObjectives": [
      "Interpret elevated BP, HR, and temperature as consistent with several possibilities: infection, blood loss, asthma/medication effects, alcohol/drug withdrawal or intoxication, trauma, or agitation itself.",
      "Note tachycardia and brisk (3+) deep tendon reflexes as suggestive of anxiety, autonomic arousal, or stimulant intoxication/withdrawal.",
      "Note the skin excoriations as a possible sign of stimulant/methamphetamine use (skin picking).",
      "Recognize the exam narrows but does not resolve the differential; underlying medical/infectious/traumatic causes must still be ruled out before attributing symptoms purely to substance use or a primary psychiatric disorder.",
      "Order a reasonable workup: complete metabolic panel, CBC, liver function tests, urinalysis and culture, urine drug screen, and consider head CT and pelvic/abdominal ultrasound."
    ],
    "rubric": [
      "Interpreted elevated BP, HR, and temperature as consistent with multiple possibilities (infection, blood loss, asthma/medication effects, alcohol/drug withdrawal or intoxication, trauma, agitation itself) rather than a single cause.",
      "Noted tachycardia and brisk (3+) DTRs as suggestive of autonomic arousal or possible stimulant intoxication/withdrawal.",
      "Identified the skin excoriations as a potentially relevant finding (e.g., stimulant-associated skin picking).",
      "Recognized the exam narrows but does not close the differential; still needs labs/imaging before attributing symptoms to one cause.",
      "Ordered a sensible workup: CMP, CBC, LFTs, urinalysis and culture, urine drug screen, and considered head CT and pelvic/abdominal ultrasound."
    ],
    "tutorOnlyNotes": "Vital signs and DTRs here are meant to nudge students toward autonomic arousal / possible stimulant effect without giving away the diagnosis. A normal abdominal and back exam argues somewhat against a localized postpartum abdominal complication, but pelvic exam could not be performed, so that is not yet excluded."
  },
  {
    "key": "session1_part3",
    "order": 3,
    "label": "Session 1 — Part 3 (Initial Labs & Treatment)",
    "settingNote": "The patient refuses further cooperation, so she is given IM lorazepam 4 mg; after 30 minutes she remains agitated, so haloperidol 10 mg is given, and she calms and falls asleep about 30 minutes later. Blood is drawn and IV fluids are started. Four hours later, despite the earlier IM doses, she is awake again with only partial improvement, getting agitated and disruptive again; a second dose of haloperidol and lorazepam is given intravenously. Her fever has decreased somewhat.",
    "availableCharacters": [
      "patient",
      "narrator"
    ],
    "revealedFacts": [
      "Basic metabolic panel: Na 146 mmol/L (mildly high, ref 135-145), K 4.4, Cl 101, Bicarb 27, BUN 15, Cr 0.7, Glucose 72 — all otherwise normal.",
      "CBC: WBC 15,300/uL (high, ref 4,800-11,000), Hemoglobin 10.9 g/dL, Hematocrit 32.7%, Platelets 167k — WBC elevated, rest near normal/mildly low.",
      "LFTs: Calcium 8.8, Total protein 6.7, Albumin 3.0, Alkaline phosphatase 470 U/L (high, ref 35-125), CPK 930 U/L (high, ref <150), SGPT 44, SGOT 43, Total bilirubin 0.9, Direct bilirubin 0.2, Amylase 104, Lipase 127 — alkaline phosphatase and CPK elevated, rest near normal.",
      "Urinalysis: specific gravity 1.035 (concentrated); urine gram stain within normal limits.",
      "Urine culture, cervical cultures, and urine drug screen are pending at this point.",
      "Head CT and abdominal ultrasound: within normal limits.",
      "A presumptive diagnosis of postpartum psychosis versus methamphetamine dependence/methamphetamine-induced psychosis is being considered at this point, pending further results.",
      "Four hours after the first round of medication, the patient was awake again with only partial improvement, becoming agitated and disruptive; she received a second IV dose of haloperidol and lorazepam.",
      "Repeat vitals after the second dose: Temp max 38.5°C (down from 40°C), BP 130-140/70-84, HR 115, RR 24; lungs clear, CV tachycardic, abdomen nontender, back normal."
    ],
    "tutorObjectives": [
      "Recognize mild hypernatremia as suggesting dehydration (infection- or drug-induced, e.g. possible methamphetamine intoxication).",
      "Recognize elevated alkaline phosphatase and CPK as most likely related to agitation/muscle activity, but also seen with stimulant intoxication.",
      "Recognize elevated WBC can reflect infection but also occurs with acute agitation and methamphetamine intoxication (via demargination), so it is not proof of infection.",
      "Use normal LFTs/MCV to argue against recent/chronic alcohol use contributing.",
      "Use the normal head CT to rule out acute head trauma, and the normal ultrasound to argue against hepatobiliary or pelvic/abdominal pathology.",
      "Connect the timing of relapse (~4 hours, after the short-half-life benzodiazepine wears off) to a substance-related or withdrawal process rather than infection, while keeping postpartum psychosis on the differential pending the drug screen.",
      "Plan to await the urine drug screen, reassess fluid status and CBC trend, and consider a psychiatry consultation."
    ],
    "rubric": [
      "Interpreted mild hypernatremia as suggesting dehydration (infectious or drug-induced).",
      "Interpreted elevated alkaline phosphatase and CPK as likely related to agitation/muscle activity, while noting they can also occur with stimulant intoxication.",
      "Recognized elevated WBC is not proof of infection here, since acute agitation and methamphetamine intoxication can also raise WBC via demargination.",
      "Used normal LFTs/MCV to argue against recent or chronic alcohol use.",
      "Used the normal head CT and normal ultrasound appropriately to rule out acute head trauma and hepatobiliary/pelvic pathology.",
      "Connected the ~4-hour relapse timing (short half-life of the benzodiazepine wearing off) to a possible substance-related process, while still keeping postpartum psychosis on the differential pending the drug screen."
    ],
    "tutorOnlyNotes": "The relapse timing (about 4 hours, the approximate duration of lorazepam's clinical effect) is a deliberate clue toward an ongoing substance effect rather than a resolving infection, but should not be treated by students as fully diagnostic yet — the urine drug screen is still pending."
  },
  {
    "key": "session2_part1",
    "order": 4,
    "label": "Session 2 — Part 1 (Follow-up Labs & Drug Screen)",
    "settingNote": "Further results are now back from the investigations ordered at the previous visit.",
    "availableCharacters": [
      "narrator"
    ],
    "revealedFacts": [
      "Repeat CBC: WBC 15,300/uL (unchanged), Hemoglobin 10.2, Hematocrit 31.4%, Platelets 118k (mildly lower than before).",
      "Urine culture from admission: within normal limits.",
      "Cervical cultures: gonorrhea negative, chlamydia negative.",
      "Abdominal-pelvic ultrasound: within normal limits.",
      "Urine drug screen: positive for methamphetamine."
    ],
    "tutorObjectives": [
      "Recognize the unchanged/non-worsening WBC without antibiotics, resolving fever with hydration, and resolving agitation with haloperidol/lorazepam as evidence against a primary infectious process.",
      "Identify the positive urine drug screen for methamphetamine as the key new finding that shifts the leading diagnosis toward methamphetamine intoxication/dependence with methamphetamine-induced psychosis.",
      "Still acknowledge postpartum psychosis as a differential that a careful history/collateral source should help clarify, rather than closing the differential prematurely."
    ],
    "rubric": [
      "Used the unchanged WBC (without antibiotics), resolving fever, and resolving agitation with medication as evidence against a primarily infectious process.",
      "Identified the positive methamphetamine urine drug screen as the key finding shifting the leading diagnosis toward methamphetamine intoxication/dependence with methamphetamine-induced psychosis.",
      "Kept postpartum psychosis on the differential rather than closing it immediately, noting that further history/collateral information would help clarify it."
    ],
    "tutorOnlyNotes": "Expected answer at this step: methamphetamine intoxication/dependence with methamphetamine-induced psychosis now ranks highest, but postpartum psychosis is not yet fully excluded — a careful history from the patient herself, once she is calm, will help."
  },
  {
    "key": "session2_part2",
    "order": 5,
    "label": "Session 2 — Part 2 (Diagnosis: Abuse vs. Dependence)",
    "settingNote": "Based on the lab results, a presumptive diagnosis of methamphetamine dependence and methamphetamine-induced psychosis is made.",
    "availableCharacters": [
      "mother",
      "narrator"
    ],
    "revealedFacts": [
      "A presumptive diagnosis of methamphetamine dependence and methamphetamine-induced psychosis has been made based on the history and positive urine drug screen.",
      "The mother has reported that the patient uses IV methamphetamine, which may be a sign of tolerance (users often progress from snorting to IV use as tolerance develops).",
      "The patient has been in a drug rehabilitation program in the past, which shows a prior desire or attempt to decrease or stop use.",
      "The patient has had severe psychiatric effects from drug use before, but has continued to use despite knowledge of these adverse effects.",
      "Background: methamphetamine (a sympathomimetic phenethylamine, sometimes called 'speed,' 'ice,' or 'crystal') can induce 'amphetamine psychosis' with chronic or high-dose use — auditory/visual hallucinations, delusions of persecution and reference, with clear consciousness and marked agitation. Reported recovery rates are roughly 64% by 10 days and 82% by 30 days after cessation, but about 5-15% of users do not fully recover long-term, psychosis can re-emerge quickly even at low doses, and psychosocial stress alone can trigger relapse of psychosis without further use."
    ],
    "tutorObjectives": [
      "State that dependence is the more severe diagnosis, and when criteria for both are met, dependence is diagnosed rather than abuse.",
      "Identify IV use reported by the mother as a possible sign of tolerance/escalation of route of use.",
      "Identify the prior drug rehabilitation history as evidence of a past attempt/desire to cut down or stop use.",
      "Identify continued use despite recurrent, known adverse psychiatric consequences (psychosis) as evidence of dependence.",
      "Recognize methamphetamine-induced psychosis as a known complication of chronic/high-dose use, with a real but incomplete long-term recovery rate and risk of relapse even without further use under psychosocial stress."
    ],
    "rubric": [
      "Stated that dependence is diagnosed over abuse when criteria for both are met, since dependence is the more severe diagnosis.",
      "Identified IV use as a possible sign of tolerance/escalating route of use.",
      "Identified the prior rehab history as evidence of a past attempt or desire to stop using.",
      "Identified continued use despite known, recurrent psychiatric consequences as evidence of dependence.",
      "Showed awareness that methamphetamine-induced psychosis can persist, recur quickly, or be triggered by stress alone even without further use."
    ],
    "tutorOnlyNotes": "Review DSM-IV-TR-style criteria for substance abuse vs. dependence with students if useful; the exact criterion list isn't reproduced in this file, but students should be able to articulate the general distinction (tolerance/escalation, unsuccessful attempts to cut down, continued use despite known harm) without necessarily citing the manual verbatim."
  },
  {
    "key": "session2_part3",
    "order": 6,
    "label": "Session 2 — Part 3 (Treatment & Disposition)",
    "settingNote": "The patient responds to the second dose of haloperidol and lorazepam and is stabilized. Her agitation and psychotic symptoms are controlled. She is now cooperative and willing to participate in treatment for her illness. She will be started on a scheduled medication regimen and sent to the psychiatric unit for stabilization and further treatment of her substance use.",
    "availableCharacters": [
      "patient",
      "mother",
      "narrator"
    ],
    "revealedFacts": [
      "The patient is now calm, cooperative, alert, and oriented, and can be interviewed directly about her own perspective, social situation, and goals.",
      "She will be started on scheduled medication and sent to the psychiatric unit for stabilization and further treatment of her drug use.",
      "Acute symptom management principles: oral medications preferred over IM/IV when feasible; use the smallest effective dose for the shortest time; haloperidol and other antipsychotics are effective for acute agitation but carry risks (lowered seizure threshold, neuroleptic malignant syndrome, tardive dyskinesia, akathisia, QT prolongation/torsades de pointes, extrapyramidal symptoms); lorazepam minimizes haloperidol use but excessive doses alone can cause delirium, confusion, and respiratory depression.",
      "Longer-term treatment for methamphetamine dependence requires a long-term approach addressing underlying medical/psychiatric conditions, supportive and motivational therapies, and behavioral interventions, individualized to the patient's abilities, preferences, and resources; there is no approved pharmacotherapy specifically for methamphetamine dependence.",
      "Non-pharmacological treatment options include: the Matrix Model (comprehensive behavioral treatment combining behavioral therapy, family education, individual counseling, 12-step support, and drug testing), motivational interviewing/motivational enhancement therapy, cognitive behavioral therapy, contingency management (tangible rewards for staying drug-free), family education, group therapy, and self-help/12-step groups."
    ],
    "tutorObjectives": [
      "Describe a nonjudgmental, explanatory-model-style approach to understanding the patient's own beliefs about her illness, expectations of care, and therapeutic goals (Kleinman's Explanatory Model).",
      "Raise the responsibility to consider social services/child protective services involvement given three young children, and to screen for and address possible intimate partner violence.",
      "Plan acute symptom management using benzodiazepines and/or antipsychotics, preferring oral route when feasible, lowest effective dose for shortest time, aware of antipsychotic risks (EPS, QT prolongation/torsades, NMS, tardive dyskinesia, akathisia) and risks of excess lorazepam alone (delirium, respiratory depression).",
      "Plan referral for a structured substance-use treatment approach, mentioning at least one nonpharmacological modality, and note there is no approved pharmacotherapy specifically for methamphetamine dependence.",
      "Note the treatment plan should be individualized to the patient's abilities, preferences, and resources, and should address underlying psychiatric conditions long-term, not just the acute presentation."
    ],
    "rubric": [
      "Described a nonjudgmental, explanatory-model-style approach to eliciting the patient's own beliefs, expectations, and goals regarding her illness.",
      "Raised the need to consider social services/child protective services involvement given her three young children, and to screen for possible intimate partner violence.",
      "Outlined an acute symptom-management plan (benzodiazepine and/or antipsychotic, oral preferred, lowest effective dose/shortest time) with awareness of the relevant medication risks.",
      "Proposed a referral for structured substance-use treatment mentioning at least one specific nonpharmacological modality (Matrix Model, MET/motivational interviewing, CBT, contingency management, family education, group therapy, or self-help/12-step groups), and noted there is no approved pharmacotherapy specific to methamphetamine dependence.",
      "Emphasized individualizing the plan to the patient's abilities/preferences/resources and addressing underlying psychiatric conditions long-term."
    ],
    "tutorOnlyNotes": "Discussion points for the group: responsibility to inform social services/child protective services and consider referral for battered-partner support; what sociocultural supports the students would recommend given this patient's history. Kleinman's Explanatory Model (Kleinman, 1978) is a useful nonjudgmental framework for eliciting a patient's own understanding of illness, applicable well beyond this one case."
  }
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
  return getStepByOrder(current.order + 1) || null;
}
export function getPreviousStep(currentKey) {
  const current = getStepByKey(currentKey);
  if (!current) return null;
  return getStepByOrder(current.order - 1) || null;
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
  "patient": {
    "name": "The Patient",
    "role": "30-year-old woman, ~1.5 weeks postpartum",
    "persona": "You are a 30-year-old woman, about 1.5 weeks postpartum. Early in the case you are severely agitated, frightened, and paranoid: you believe people are watching you or out to get you, you keep looking behind yourself, you don't want anyone to touch you or come close, and you refuse medication because you insist you are 'not crazy.' You are guarded and may go quiet, deny things, or become more agitated if pushed too hard or too fast, especially about drug use or your family situation — this guardedness and paranoia is clinically realistic and should not resolve just because the student asks nicely; it only improves after you have been medicated and stabilized in the story (you'll be told in these instructions once that has happened). Underneath the agitation, you are exhausted, overwhelmed by caring for a newborn plus two other children, and afraid of being separated from your children or judged. You have a history of methamphetamine and cocaine use, alcohol dependence, and past psychiatric treatment with inconsistent adherence, but you should not simply announce this — reveal it only gradually, resistantly, or in a way consistent with your current mental state and the facts already established in the story so far. Once the story indicates you have calmed down and stabilized (later in the case), you become cooperative, tired, a little ashamed, and willing to talk more openly and reflectively about your situation, your children, your relationship, and your drug use, if approached kindly and nonjudgmentally.",
    "speechStyle": "Early on: short, frightened, defensive, sometimes hostile or non-responsive. Later (once calm/stabilized): quieter, more open, a little weary, still guarded about judgment but willing to engage."
  },
  "friend": {
    "name": "The Friend",
    "role": "Friend who brought the patient to the ED",
    "persona": "You are the patient's friend. You brought her to the emergency department because of her agitated, restless, and frightened behaviour, which worried you. You know she had a baby about a month ago and has seemed increasingly 'off,' paranoid, and not sleeping over the last day or two. You are not a medical professional and don't know her detailed psychiatric or drug-use history in depth — you can share what you've personally observed and general concern, but you should say you don't know or suggest asking her family/mother for anything more clinical or historical than a close friend would realistically know.",
    "speechStyle": "Worried, cooperative, plain-spoken; admits when she doesn't know something rather than guessing."
  },
  "mother": {
    "name": "The Patient's Mother",
    "role": "Patient's mother (reached by phone)",
    "persona": "You are the patient's mother, reached by phone. Your daughter is a single mother with a long history of 'mood swings and anger problems.' She has been on psychiatric medications in the past but her adherence has not always been good, and you don't know exactly what medications. She followed up with a psychiatrist in the past, but it may have been a while since her last visit. She has been treated before at a local inpatient psychiatric hospital with similarly agitated presentations, but the last time was several years ago. You know about her history of drug use, including that she has used methamphetamine intravenously at times, and that she has been through a drug rehabilitation program before. You are anxious, worried, and want to help. You can share family history if asked: yourself (age 50, mild hypertension), the patient's father (55, heart disease, hypertension, multiple strokes), her sister (26, asthma, alcohol misuse, bipolar disorder and depression), her brother (22, same pattern), and grandparents on both sides with hypertension, heart disease, and depression. You love your daughter and are frightened by what's happening to her, and you're also worried about your grandchildren, especially the newborn.",
    "speechStyle": "Anxious, warm, forthcoming once asked directly; a worried parent trying to help however she can."
  },
  "narrator": {
    "name": "Clinical Narrator",
    "role": "Neutral clinical narrator / examiner",
    "persona": "You are a neutral clinical narrator. You report objective findings only: physical examination findings, vital signs, laboratory values, imaging results, and plain factual scene description. You do not roleplay emotion or opinion, and you do not interpret the findings for the student (no diagnosis, no 'this suggests...'). If asked to interpret findings, gently redirect: that's the student's clinical reasoning task, not yours. If the student asks for a test/finding that has not been revealed in this case at the current step, say plainly that this information/result is not available yet at this point in the case, or was not part of the work-up performed for this patient (do not invent results that contradict the case).",
    "speechStyle": "Plain, factual, brief, clinical register."
  }
};

export function getCharacter(key) {
  return CHARACTERS[key] || null;
}
