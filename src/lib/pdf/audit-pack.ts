import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { format } from "date-fns";
import type { AuditLogEntry } from "@/types";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 50;
const LINE_HEIGHT = 14;
const LINES_PER_PAGE = Math.floor((PAGE_HEIGHT - MARGIN * 2) / LINE_HEIGHT) - 4;

export async function buildAuditPackPdf(params: {
  organizationName: string;
  organizationId: string;
  logs: AuditLogEntry[];
}): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const generatedAt = format(new Date(), "yyyy-MM-dd HH:mm:ss 'UTC'");

  const headerLines = [
    "AgentScale — Governance Audit Pack",
    `Organization: ${params.organizationName}`,
    `Organization ID: ${params.organizationId}`,
    `Generated: ${generatedAt}`,
    `Events: ${params.logs.length}`,
    "",
  ];

  const eventLines =
    params.logs.length === 0
      ? ["No audit events recorded."]
      : params.logs.map((log) => {
          const when = format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss");
          const actor = log.actor_name ?? "System";
          const meta = JSON.stringify(log.metadata);
          return `[${when}] ${actor} | ${log.action} | ${log.entity_type} | ${meta}`;
        });

  const allLines = [...headerLines, "---", "", ...eventLines];
  let lineIndex = 0;

  while (lineIndex < allLines.length) {
    const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = PAGE_HEIGHT - MARGIN;

    if (lineIndex === 0) {
      page.drawText("AgentScale — Governance Audit Pack", {
        x: MARGIN,
        y,
        size: 16,
        font: bold,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= LINE_HEIGHT * 2;
      lineIndex = 1;
      while (lineIndex < headerLines.length && y > MARGIN) {
        page.drawText(headerLines[lineIndex] ?? "", {
          x: MARGIN,
          y,
          size: 10,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
        y -= LINE_HEIGHT;
        lineIndex++;
      }
      lineIndex = headerLines.length;
      y -= LINE_HEIGHT;
    }

    const chunk = allLines.slice(lineIndex, lineIndex + LINES_PER_PAGE);
    for (const line of chunk) {
      if (y < MARGIN) break;
      const truncated = line.length > 95 ? `${line.slice(0, 92)}...` : line;
      page.drawText(truncated, {
        x: MARGIN,
        y,
        size: 9,
        font,
        color: rgb(0.15, 0.15, 0.15),
      });
      y -= LINE_HEIGHT;
      lineIndex++;
    }
  }

  return pdf.save();
}
