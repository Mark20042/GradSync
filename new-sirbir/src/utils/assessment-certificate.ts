import PDFDocument from "pdfkit";

export type AssessmentCertificateData = {
  userName: string;
  assessmentTitle: string;
  score: number;
  level?: string;
  issuedAt?: Date;
};

export const generateAssessmentCertificatePdf = async (
  data: AssessmentCertificateData,
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      // Create Landscape A4 Document (Width: 841.89, Height: 595.28 points)
      const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 40 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      // 1. Draw Double Border
      // Outer Navy Border (LineWidth: 5)
      doc.rect(20, 20, 801.89, 555.28).lineWidth(5).strokeColor("#1E3A8A").stroke();
      
      // Inner Amber Gold Border (LineWidth: 1.5)
      doc.rect(28, 28, 785.89, 539.28).lineWidth(1.5).strokeColor("#D97706").stroke();

      // 2. Corner Decorative Accents
      const drawCornerAccent = (x: number, y: number, xDir: number, yDir: number) => {
        doc.rect(x, y, xDir * 20, yDir * 4).fillColor("#D97706").fill();
        doc.rect(x, y, xDir * 4, yDir * 20).fillColor("#D97706").fill();
      };
      // Top-Left
      drawCornerAccent(34, 34, 1, 1);
      // Top-Right
      drawCornerAccent(807.89, 34, -1, 1);
      // Bottom-Left
      drawCornerAccent(34, 561.28, 1, -1);
      // Bottom-Right
      drawCornerAccent(807.89, 561.28, -1, -1);

      // 3. Top Platform Branding
      doc.font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#64748B")
        .text("G R A D S Y N C   V E R I F I E D   C R E D E N T I A L", 40, 58, {
          width: 761.89,
          align: "center",
        });

      // 4. Main Title
      doc.font("Helvetica-Bold")
        .fontSize(28)
        .fillColor("#1E3A8A")
        .text("CERTIFICATE OF ACHIEVEMENT", 40, 95, {
          width: 761.89,
          align: "center",
        });

      // Elegant Divider Line under title
      doc.moveTo(220, 138)
        .lineTo(621.89, 138)
        .lineWidth(1.5)
        .strokeColor("#D97706")
        .stroke();

      // 5. Presentational Tagline
      doc.font("Helvetica-Oblique")
        .fontSize(13)
        .fillColor("#64748B")
        .text("This credential is proudly presented to", 40, 160, {
          width: 761.89,
          align: "center",
        });

      // 6. Recipient Name (Massive & Bold)
      doc.font("Helvetica-Bold")
        .fontSize(36)
        .fillColor("#1E3A8A")
        .text(data.userName, 40, 190, {
          width: 761.89,
          align: "center",
        });

      // Sub-underline under the name
      doc.moveTo(250, 240)
        .lineTo(591.89, 240)
        .lineWidth(0.5)
        .strokeColor("#CBD5E1")
        .stroke();

      // 7. Achievement Statement
      doc.font("Helvetica")
        .fontSize(13)
        .fillColor("#64748B")
        .text("for successfully verifying their professional skill and competence in", 40, 260, {
          width: 761.89,
          align: "center",
        });

      // Skill Name (Large & Amber Gold)
      doc.font("Helvetica-Bold")
        .fontSize(22)
        .fillColor("#D97706")
        .text(data.assessmentTitle, 40, 290, {
          width: 761.89,
          align: "center",
        });

      // Level Indicator (if present)
      if (data.level) {
        doc.font("Helvetica-Bold")
          .fontSize(13)
          .fillColor("#0F172A")
          .text(`Level: ${data.level}`, 40, 328, {
            width: 761.89,
            align: "center",
          });
      }

      // 8. Verification Metadata Card (Filled & Outlined)
      // Centered: Card width increased to 460 for zero-overlapping column layout
      const cardWidth = 460;
      const cardX = (841.89 - cardWidth) / 2; // = 190.94
      
      // Fill background
      doc.roundedRect(cardX + 1, 363, cardWidth - 2, 66, 12)
        .fillColor("#F8FAFC")
        .fill();
      // Draw border
      doc.roundedRect(cardX, 362, cardWidth, 68, 12)
        .lineWidth(1)
        .strokeColor("#E2E8F0")
        .stroke();

      const dateStr = data.issuedAt
        ? data.issuedAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        : new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

      // Left: Score (x offset: +30)
      doc.font("Helvetica-Bold")
        .fontSize(9)
        .fillColor("#94A3B8")
        .text("VERIFIED SCORE", cardX + 30, 376);
      doc.font("Helvetica-Bold")
        .fontSize(15)
        .fillColor("#10B981")
        .text(`${Math.round(data.score)}%`, cardX + 30, 394);

      // Center: Status (x offset: +160)
      doc.font("Helvetica-Bold")
        .fontSize(9)
        .fillColor("#94A3B8")
        .text("STATUS", cardX + 160, 376);
      doc.font("Helvetica-Bold")
        .fontSize(14)
        .fillColor("#1E3A8A")
        .text("VALID / SECURE", cardX + 160, 394);

      // Right: Date (x offset: +310)
      doc.font("Helvetica-Bold")
        .fontSize(9)
        .fillColor("#94A3B8")
        .text("DATE OF ISSUE", cardX + 310, 376);
      doc.font("Helvetica-Bold")
        .fontSize(13)
        .fillColor("#475569")
        .text(dateStr, cardX + 310, 394);

      // 9. Signatures and Seal
      // Left: Board Signature (Times-Italic styled signature overlay)
      doc.font("Times-Italic")
        .fontSize(18)
        .fillColor("#1E3A8A")
        .text("GradSync Board", 80, 460, { width: 180, align: "center" });

      // Left Line (Verification Board)
      doc.moveTo(80, 490)
        .lineTo(260, 490)
        .lineWidth(1)
        .strokeColor("#CBD5E1")
        .stroke();
      doc.font("Helvetica")
        .fontSize(9)
        .fillColor("#64748B")
        .text("VERIFICATION BOARD", 80, 498, { width: 180, align: "center" });

      // Right: Director Signature (Times-Italic styled signature overlay)
      doc.font("Times-Italic")
        .fontSize(18)
        .fillColor("#1E3A8A")
        .text("Mark J. Potot", 581.89, 460, { width: 180, align: "center" });

      // Right Line (Platform Director)
      doc.moveTo(581.89, 490)
        .lineTo(761.89, 490)
        .lineWidth(1)
        .strokeColor("#CBD5E1")
        .stroke();
      doc.font("Helvetica")
        .fontSize(9)
        .fillColor("#64748B")
        .text("PLATFORM DIRECTOR", 581.89, 498, { width: 180, align: "center" });

      // Golden Circular Seal in the bottom-middle
      const sealCenterX = 420.94;
      const sealCenterY = 490;
      
      // Draw outer ribbon/badge gold circle (slightly larger: r=34)
      doc.circle(sealCenterX, sealCenterY, 34)
        .fillColor("#D97706")
        .fill();
      
      // Draw white inner border inside the seal (r=29)
      doc.circle(sealCenterX, sealCenterY, 29)
        .lineWidth(1.2)
        .strokeColor("#FFFFFF")
        .stroke();

      // Verified by GradSync label inside the seal
      doc.font("Helvetica-Bold")
        .fontSize(7)
        .fillColor("#FFFFFF")
        .text("VERIFIED BY", sealCenterX - 30, sealCenterY - 9, {
          width: 60,
          align: "center",
        });
      doc.font("Helvetica-Bold")
        .fontSize(8)
        .fillColor("#FFFFFF")
        .text("GRADSYNC", sealCenterX - 30, sealCenterY + 2, {
          width: 60,
          align: "center",
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};
