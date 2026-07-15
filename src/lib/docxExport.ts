import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx';
import { book } from '@/data/book';
import type { ContentNode } from '@/data/types';

// RTL paragraph options — bidirectional is set per-section in docx v9
const rtlOptions = {
  alignment: AlignmentType.RIGHT,
};

function contentNodesToParagraphs(nodes: ContentNode[]): (Paragraph | Table)[] {
  const result: (Paragraph | Table)[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case 'h1':
        result.push(new Paragraph({
          ...rtlOptions,
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun({ text: node.content, bold: true, size: 36 })],
          spacing: { before: 400, after: 200 },
        }));
        break;

      case 'h2':
        result.push(new Paragraph({
          ...rtlOptions,
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: node.content, bold: true, size: 28 })],
          spacing: { before: 320, after: 160 },
        }));
        break;

      case 'h3':
        result.push(new Paragraph({
          ...rtlOptions,
          heading: HeadingLevel.HEADING_3,
          children: [new TextRun({ text: node.content, bold: true, size: 24 })],
          spacing: { before: 240, after: 120 },
        }));
        break;

      case 'h4':
        result.push(new Paragraph({
          ...rtlOptions,
          children: [new TextRun({ text: node.content, bold: true, size: 22 })],
          spacing: { before: 200, after: 100 },
        }));
        break;

      case 'p':
        result.push(new Paragraph({
          ...rtlOptions,
          children: [new TextRun({ text: node.content, size: 22 })],
          spacing: { after: 140 },
        }));
        break;

      case 'code': {
        const lines = ((node.title ? `// ${node.title}\n` : '') + node.content).split('\n');
        for (const line of lines) {
          result.push(new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [new TextRun({
              text: line || ' ',
              font: 'Courier New',
              size: 18,
              color: '333333',
            })],
            shading: { color: 'F5F5F5', fill: 'F5F5F5' },
            spacing: { before: 0, after: 0 },
            indent: { left: 360 },
          }));
        }
        result.push(new Paragraph({ children: [new TextRun({ text: '' })], spacing: { after: 140 } }));
        break;
      }

      case 'ascii': {
        const asciiLines = node.content.split('\n');
        for (const line of asciiLines) {
          result.push(new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [new TextRun({ text: line || ' ', font: 'Courier New', size: 18 })],
            shading: { color: 'F0F4FF', fill: 'F0F4FF' },
            spacing: { before: 0, after: 0 },
            indent: { left: 360 },
          }));
        }
        result.push(new Paragraph({ children: [new TextRun({ text: '' })], spacing: { after: 120 } }));
        break;
      }

      case 'callout': {
        const calloutLabel = {
          note: '📝 ملاحظة',
          warning: '⚠️ تحذير',
          'best-practice': '✅ أفضل الممارسات',
          'ai-tip': '✨ نصيحة ذكاء اصطناعي',
          mistake: '❌ خطأ شائع',
        }[node.calloutType] ?? 'ملاحظة';

        result.push(new Paragraph({
          ...rtlOptions,
          children: [new TextRun({ text: node.title ?? calloutLabel, bold: true, size: 22 })],
          shading: { color: 'EFF6FF', fill: 'EFF6FF' },
          spacing: { before: 160, after: 80 },
          indent: { left: 360, right: 360 },
          border: {
            left: { style: BorderStyle.SINGLE, size: 12, color: '3B82F6', space: 12 },
          },
        }));

        const nestedParas = contentNodesToParagraphs(node.content);
        for (const p of nestedParas) {
          if (p instanceof Paragraph) {
            result.push(new Paragraph({
              ...rtlOptions,
              children: (p as any).options?.children ?? [],
              shading: { color: 'EFF6FF', fill: 'EFF6FF' },
              spacing: { after: 80 },
              indent: { left: 360, right: 360 },
            }));
          }
        }
        result.push(new Paragraph({ children: [new TextRun({ text: '' })], spacing: { after: 120 } }));
        break;
      }

      case 'ul':
        for (const item of node.items) {
          const texts = item.filter(n => n.type === 'p').map(n => (n as { type: 'p'; content: string }).content).join(' ');
          result.push(new Paragraph({
            ...rtlOptions,
            bullet: { level: 0 },
            children: [new TextRun({ text: `• ${texts}`, size: 22 })],
            spacing: { after: 80 },
            indent: { left: 360 },
          }));
        }
        break;

      case 'ol':
        node.items.forEach((item, idx) => {
          const texts = item.filter(n => n.type === 'p').map(n => (n as { type: 'p'; content: string }).content).join(' ');
          result.push(new Paragraph({
            ...rtlOptions,
            children: [new TextRun({ text: `${idx + 1}. ${texts}`, size: 22 })],
            spacing: { after: 80 },
            indent: { left: 360 },
          }));
        });
        break;

      case 'table': {
        const tableRows: TableRow[] = [
          new TableRow({
            children: node.headers.map(h =>
              new TableCell({
                children: [new Paragraph({
                  ...rtlOptions,
                  children: [new TextRun({ text: h, bold: true, size: 20 })],
                })],
                shading: { color: 'E2E8F0', fill: 'E2E8F0' },
              })
            ),
          }),
          ...node.rows.map(row =>
            new TableRow({
              children: row.map((cell, j) =>
                new TableCell({
                  children: [new Paragraph({
                    ...rtlOptions,
                    children: [new TextRun({
                      text: cell,
                      size: 20,
                      font: j === 0 ? 'Courier New' : undefined,
                    })],
                  })],
                })
              ),
            })
          ),
        ];

        result.push(new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          // P0 fix: mark whole table as visually RTL so columns lay out
          // right-to-left in Word, matching the right-aligned paragraph
          // children. Cell paragraphs alone are not enough on DOCX column
          // layout — without this, the export renders columns LTR.
          visuallyRightToLeft: true,
        }));
        result.push(new Paragraph({ children: [new TextRun({ text: '' })], spacing: { after: 160 } }));
        break;
      }

      case 'project': {
        result.push(new Paragraph({
          ...rtlOptions,
          children: [new TextRun({ text: `🚀 مشروع عملي: ${node.title}`, bold: true, size: 24, color: '2563EB' })],
          shading: { color: 'EFF6FF', fill: 'EFF6FF' },
          spacing: { before: 200, after: 100 },
          indent: { left: 200, right: 200 },
        }));
        const projectParas = contentNodesToParagraphs(node.content);
        result.push(...projectParas);
        result.push(new Paragraph({ children: [new TextRun({ text: '' })], spacing: { after: 160 } }));
        break;
      }

      case 'active-recall': {
        result.push(new Paragraph({
          ...rtlOptions,
          children: [new TextRun({ text: '🧠 المراجعة النشطة (Active Recall)', bold: true, size: 24 })],
          spacing: { before: 200, after: 120 },
          shading: { color: 'F5F3FF', fill: 'F5F3FF' },
          indent: { left: 200, right: 200 },
        }));
        node.questions.forEach((qa, i) => {
          result.push(new Paragraph({
            ...rtlOptions,
            children: [new TextRun({ text: `س${i + 1}: ${qa.q}`, bold: true, size: 22, color: '6D28D9' })],
            spacing: { before: 120, after: 60 },
            indent: { left: 360, right: 360 },
          }));
          result.push(new Paragraph({
            ...rtlOptions,
            children: [new TextRun({ text: `ج: ${qa.a}`, size: 22, color: '374151' })],
            spacing: { after: 100 },
            indent: { left: 360, right: 360 },
          }));
        });
        break;
      }

      // ── Book 2 extensions ──
      case 'mermaid': {
        // Mermaid diagrams render as a labeled code block with caption
        const caption = node.caption ? `📊 ${node.caption}` : '📊 مخطط Mermaid';
        result.push(new Paragraph({
          ...rtlOptions,
          children: [new TextRun({ text: caption, bold: true, size: 22, color: '2563EB' })],
          shading: { color: 'F0F4FF', fill: 'F0F4FF' },
          spacing: { before: 160, after: 80 },
          indent: { left: 360, right: 360 },
          border: {
            left: { style: BorderStyle.SINGLE, size: 8, color: '60A5FA', space: 8 },
          },
        }));
        // Include the raw mermaid content as a code block
        const mmdLines = node.content.split('\n');
        for (const line of mmdLines) {
          result.push(new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [new TextRun({ text: line || ' ', font: 'Courier New', size: 16, color: '6B7280' })],
            spacing: { before: 0, after: 0 },
            indent: { left: 360 },
          }));
        }
        result.push(new Paragraph({ children: [new TextRun({ text: '' })], spacing: { after: 140 } }));
        break;
      }

      case 'formula': {
        // Render LaTeX formulas as a styled math block
        const formulaLabel = node.caption ? `📐 ${node.caption}` : '📐 صيغة رياضية';
        result.push(new Paragraph({
          ...rtlOptions,
          children: [new TextRun({ text: formulaLabel, bold: true, size: 22, color: '7C3AED' })],
          spacing: { before: 160, after: 60 },
        }));
        result.push(new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: node.latex, font: 'Courier New', size: 22, color: '1E40AF' })],
          shading: { color: 'F5F3FF', fill: 'F5F3FF' },
          spacing: { before: 40, after: 40 },
          indent: { left: 360, right: 360 },
        }));
        result.push(new Paragraph({ children: [new TextRun({ text: '' })], spacing: { after: 140 } }));
        break;
      }

      case 'colab-link': {
        // Google Colab link rendered as a note
        const colabTitle = node.title ? `🔗 ${node.title}` : '🔗 افتح في Google Colab';
        result.push(new Paragraph({
          ...rtlOptions,
          children: [new TextRun({ text: colabTitle, bold: true, size: 22, color: '2563EB' })],
          spacing: { before: 120, after: 60 },
          indent: { left: 200, right: 200 },
        }));
        result.push(new Paragraph({
          alignment: AlignmentType.LEFT,
          children: [new TextRun({ text: node.notebookUrl, font: 'Courier New', size: 18, color: '6B7280', italics: true })],
          spacing: { after: 120 },
          indent: { left: 360 },
        }));
        break;
      }
    }
  }

  return result;
}

export async function downloadDocx(): Promise<void> {
  const allChildren: (Paragraph | Table)[] = [];

  // Cover page
  allChildren.push(
    new Paragraph({
      ...rtlOptions,
      children: [new TextRun({ text: 'Smart Code', bold: true, size: 72, color: '2563EB' })],
      spacing: { before: 2000, after: 400 },
    }),
    new Paragraph({
      ...rtlOptions,
      children: [new TextRun({ text: book.subtitle, bold: true, size: 36, color: '374151' })],
      spacing: { after: 400 },
    }),
    new Paragraph({
      ...rtlOptions,
      children: [new TextRun({ text: `إصدار ${book.version}`, size: 28, color: '6B7280' })],
      spacing: { after: 2000 },
    }),
  );

  // Stages and Units
  for (const stage of book.stages) {
    // Stage header
    allChildren.push(
      new Paragraph({
        ...rtlOptions,
        pageBreakBefore: true,
        children: [new TextRun({
          text: `المرحلة ${stage.stageNumber}: ${stage.title}`,
          bold: true, size: 48, color: '1D4ED8',
        })],
        spacing: { before: 400, after: 400 },
      }),
    );

    for (const unit of stage.units) {
      // Unit header
      allChildren.push(
        new Paragraph({
          ...rtlOptions,
          pageBreakBefore: true,
          children: [new TextRun({ text: `الوحدة ${unit.unitNumber}: ${unit.title}`, bold: true, size: 36, color: '1E40AF' })],
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          ...rtlOptions,
          children: [new TextRun({ text: unit.description, size: 24, color: '6B7280', italics: true })],
          spacing: { after: 300 },
        }),
      );

      // Unit content
      const contentParas = contentNodesToParagraphs(unit.content);
      allChildren.push(...contentParas);
    }
  }

  const doc = new Document({
    creator: 'Smart Code AI',
    title: book.title + ' — ' + book.subtitle,
    description: book.subtitle,
    styles: {
      default: {
        document: {
          run: { font: 'Arial', rightToLeft: true },
          paragraph: { alignment: AlignmentType.RIGHT },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: allChildren,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Smart-Code-Book-2026.docx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
