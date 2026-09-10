import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, ShadingType,
  LevelFormat, convertInchesToTwip,
} from "docx";
import { STEPS, CASE_META } from "@/data/case.js";
import { getLanguageLabel } from "@/data/languages.js";
import type { SessionData } from "@/lib/types";

// ── Design constants ──────────────────────────────────────────────────────────
const COLOR_INK = "1F2922";
const COLOR_SAGE = "3D6B5C";
const COLOR_CLAY = "B85C38";
const COLOR_GREY = "8A8478";
const COLOR_LINE = "DDD5C6";

const CHAR_COLORS: Record<string, string> = {
  student: "2A4D42",
  patient: "B85C38",
  friend: "3D6B5C",
  mother: "6B5B95",
  narrator: "8A8478",
};

function charLabel(sender: string): string {
  const labels: Record<string, string> = {
    student: "Student",
    patient: "Patient",
    friend: "Friend",
    mother: "Mother",
    narrator: "Narrator / Examiner",
  };
  return labels[sender] || sender;
}

function smartQ(text: string): string {
  if (!text) return text;
  return text
    .replace(/(\w)'(\w)/g, "$1\u2019$2")
    .replace(/'/g, "\u2018")
    .replace(/"(\w)/g, "\u201C$1")
    .replace(/(\w)"/g, "$1\u201D");
}

function hr(): Paragraph {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_LINE } },
    children: [],
  });
}

function stepHeading(label: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 120 },
    children: [new TextRun({ text: label, bold: true, color: COLOR_SAGE, size: 26 })],
  });
}

function bulletList(items: string[]): Paragraph[] {
  return items.map(
    (text) =>
      new Paragraph({
        numbering: { reference: "wb", level: 0 },
        spacing: { after: 60 },
        children: [new TextRun({ text: smartQ(text), color: COLOR_INK, size: 22 })],
      })
  );
}

function rubricTable(rubricItems: { criterion: string; met: boolean | string; note: string }[]): Table {
  const colW = [900, 3200, 3200];
  const headerRow = new TableRow({
    tableHeader: true,
    children: ["Met", "Criterion", "Note"].map((h, i) =>
      new TableCell({
        width: { size: colW[i], type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, color: "auto", fill: "DDD5C6" },
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20 })] })],
      })
    ),
  });
  const rows = rubricItems.map(
    (item) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: colW[0], type: WidthType.DXA },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: item.met === true ? "Yes" : item.met === "partial" ? "Partial" : "No",
                    bold: true,
                    color:
                      item.met === true ? COLOR_SAGE : item.met === "partial" ? COLOR_CLAY : COLOR_GREY,
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: colW[1], type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: smartQ(item.criterion || ""), size: 20 })] })],
          }),
          new TableCell({
            width: { size: colW[2], type: WidthType.DXA },
            children: [new Paragraph({ children: [new TextRun({ text: smartQ(item.note || ""), size: 20, color: COLOR_GREY })] })],
          }),
        ],
      })
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...rows],
  });
}

export function buildExportFilename(session: SessionData): string {
  const now = new Date();
  return `MethPsychosisPBL_${(session.displayName || "student").replace(/\s+/g, "_")}_${now.toISOString().slice(0, 10)}.docx`;
}

export async function buildTranscriptDocxBuffer(session: SessionData): Promise<Buffer> {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  const children: (Paragraph | Table)[] = [];

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: CASE_META.title, bold: true, size: 40, color: COLOR_SAGE })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: CASE_META.subtitle, size: 24, color: COLOR_GREY })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: `Student: ${session.displayName || "(unnamed)"}`, size: 24, bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: `Language: ${getLanguageLabel(session.language || "en")}`, size: 22, color: COLOR_GREY })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: `Exported: ${dateStr}`, size: 20, color: COLOR_GREY })],
    }),
    hr()
  );

  for (const step of STEPS as { key: string; label: string; settingNote: string; tutorObjectives: string[]; rubric: string[] }[]) {
    const msgs = (session.messages || []).filter((m: { stepKey: string }) => m.stepKey === step.key);
    const scoreEntry = session.scores?.[step.key];

    if (msgs.length === 0 && !scoreEntry?.ai) continue;

    children.push(stepHeading(step.label));
    children.push(
      new Paragraph({
        spacing: { after: 160 },
        children: [new TextRun({ text: smartQ(step.settingNote || ""), italics: true, color: COLOR_GREY, size: 20 })],
      })
    );

    for (const msg of msgs) {
      const color = CHAR_COLORS[msg.sender] || COLOR_GREY;
      const label = charLabel(msg.sender);
      const ts = new Date(msg.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
      children.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: `${label}`, bold: true, color, size: 20 }),
            new TextRun({ text: `   ${ts}`, color: COLOR_GREY, size: 18 }),
          ],
        }),
        new Paragraph({
          indent: { left: convertInchesToTwip(0.2) },
          spacing: { after: 120 },
          children: [new TextRun({ text: smartQ(msg.content), color: COLOR_INK, size: 22 })],
        })
      );
    }

    if (scoreEntry?.ai) {
      const ai = scoreEntry.ai;
      children.push(
        new Paragraph({
          spacing: { before: 200, after: 80 },
          children: [new TextRun({ text: "AI-Suggested Score", bold: true, size: 24, color: COLOR_SAGE })],
        }),
        new Paragraph({
          spacing: { after: 80 },
          children: [
            new TextRun({ text: `Score: `, bold: true, size: 22 }),
            new TextRun({ text: `${ai.score ?? "—"} / 100`, size: 22, bold: true, color: COLOR_CLAY }),
          ],
        }),
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: smartQ(ai.feedback || ""), size: 22 })] })
      );
      if (ai.rubric?.length) children.push(rubricTable(ai.rubric), new Paragraph({ spacing: { after: 80 }, children: [] }));
      if (ai.strengths?.length) {
        children.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Strengths", bold: true, size: 22, color: COLOR_SAGE })] }));
        children.push(...bulletList(ai.strengths));
      }
      if (ai.areas_for_improvement?.length) {
        children.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "Areas to improve", bold: true, size: 22, color: COLOR_CLAY })] }));
        children.push(...bulletList(ai.areas_for_improvement));
      }
    }

    const tutor = scoreEntry?.tutor;
    children.push(
      new Paragraph({ spacing: { before: 200, after: 80 }, children: [new TextRun({ text: "Tutor Review", bold: true, size: 24, color: COLOR_CLAY })] }),
      new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: `Tutor score: ${tutor?.score ?? "___"} / 100`, size: 22 })] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: `Comments: ${tutor?.feedback ? smartQ(tutor.feedback) : ""}`, size: 22 })] }),
      hr()
    );
  }

  const doc = new Document({
    numbering: {
      config: [{
        reference: "wb",
        levels: [{
          level: 0, format: LevelFormat.BULLET,
          text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 180 } } },
        }],
      }],
    },
    sections: [{
      properties: {
        page: { size: { width: convertInchesToTwip(8.5), height: convertInchesToTwip(11) }, margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.2), right: convertInchesToTwip(1.2) } },
      },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}
