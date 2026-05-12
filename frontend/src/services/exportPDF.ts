import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { MCQQuestion, MathQuestion, Question, QuestionPaper } from '../types';

const MCQ_LABELS = ['A', 'B', 'C', 'D'];

function buildPaperHTML(paper: QuestionPaper, includeAnswers: boolean): string {
  const grouped: Record<string, Question[]> = {};
  for (const q of paper.questions) {
    (grouped[q.type] ??= []).push(q);
  }

  let counter = 1;
  let sections = '';

  for (const [type, questions] of Object.entries(grouped)) {
    let items = '';
    for (const q of questions) {
      let body = '';

      if (q.type === 'MCQ') {
        const mcq = q as MCQQuestion;
        const optionItems = mcq.options.map((opt, i) => {
          const highlight = includeAnswers && opt === mcq.answer
            ? 'color:#155724;font-weight:600;'
            : '';
          return `<div style="${highlight}margin-bottom:2px;">
            <span style="color:#555;margin-right:4px;">${MCQ_LABELS[i]}.</span>${opt}
          </div>`;
        }).join('');
        body = `<div style="margin-left:16px;margin-top:4px;">${optionItems}</div>`;
      }

      if (q.type === 'True/False') {
        const trueStyle = includeAnswers && q.answer === 'True' ? 'color:#155724;font-weight:600;' : 'color:#555;';
        const falseStyle = includeAnswers && q.answer === 'False' ? 'color:#155724;font-weight:600;' : 'color:#555;';
        body = `<div style="margin-left:16px;margin-top:4px;display:flex;gap:24px;">
          <span style="${trueStyle}">True</span>
          <span style="${falseStyle}">False</span>
        </div>`;
      }

      if (q.type === 'Math Problem' && includeAnswers) {
        const math = q as MathQuestion;
        const stepsHtml = math.steps
          ? `<div style="white-space:pre-wrap;color:#555;font-size:12px;margin-bottom:4px;">${math.steps}</div>`
          : '';
        body = `<div style="margin-left:16px;margin-top:4px;">
          ${stepsHtml}
          ${math.answer ? `<div style="color:#155724;font-weight:600;font-size:12px;">= ${math.answer}</div>` : ''}
        </div>`;
      } else if (includeAnswers && q.answer && q.type !== 'MCQ' && q.type !== 'True/False') {
        body = `<div style="margin-left:16px;margin-top:4px;color:#155724;font-style:italic;font-size:12px;">
          Answer: ${q.answer}
        </div>`;
      }

      items += `<div style="margin-bottom:14px;">
        <div style="font-weight:500;">
          <span style="color:#555;margin-right:6px;">${counter++}.</span>${q.question}
        </div>
        ${body}
      </div>`;
    }

    sections += `<div style="margin-bottom:28px;">
      <div style="text-transform:uppercase;font-size:11px;font-weight:700;
                  border-bottom:1px solid #000;padding-bottom:4px;margin-bottom:12px;">
        ${type}
      </div>
      ${items}
    </div>`;
  }

  return `<div style="font-family:Georgia,serif;font-size:13px;line-height:1.65;
                       color:#000;padding:48px 56px;background:#fff;width:794px;">
    <h2 style="text-align:center;margin:0 0 4px;font-size:20px;">
      ${paper.title || 'Question Paper'}
    </h2>
    <p style="text-align:center;color:#666;font-size:11px;margin:0 0 36px;">
      ${paper.questions.length} question${paper.questions.length !== 1 ? 's' : ''}
      ${includeAnswers ? ' · Answer key included' : ''}
    </p>
    ${sections}
  </div>`;
}

function buildAnswerKeyHTML(paper: QuestionPaper): string {
  let rows = '';
  let counter = 1;

  for (const q of paper.questions) {
    let answerText: string;

    if (q.type === 'MCQ') {
      const mcq = q as MCQQuestion;
      const idx = mcq.options.indexOf(mcq.answer ?? '');
      const label = idx >= 0 ? `${MCQ_LABELS[idx]}. ` : '';
      answerText = `${label}${mcq.answer ?? '—'}`;
    } else if (q.type === 'Math Problem') {
      const math = q as MathQuestion;
      answerText = [math.steps, math.answer ? `= ${math.answer}` : ''].filter(Boolean).join('\n');
    } else {
      answerText = q.answer ?? '—';
    }

    const bg = counter % 2 === 0 ? '#f9f9f9' : '#fff';
    rows += `<tr style="background:${bg};">
      <td style="padding:8px 12px;color:#555;width:40px;vertical-align:top;">${counter++}.</td>
      <td style="padding:8px 12px;color:#555;vertical-align:top;width:100px;">${q.type}</td>
      <td style="padding:8px 12px;font-weight:600;vertical-align:top;white-space:pre-wrap;">${answerText}</td>
    </tr>`;
  }

  return `<div style="font-family:Georgia,serif;font-size:13px;line-height:1.65;
                       color:#000;padding:48px 56px;background:#fff;width:794px;">
    <h2 style="text-align:center;margin:0 0 4px;font-size:20px;">
      ${paper.title || 'Question Paper'}
    </h2>
    <p style="text-align:center;color:#666;font-size:11px;margin:0 0 36px;font-style:italic;">
      Answer Key
    </p>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead>
        <tr style="border-bottom:2px solid #000;">
          <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;">#</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;">Type</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;text-transform:uppercase;">Answer</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

async function captureAndSave(html: string, filename: string): Promise<void> {
  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:-99999px;left:-99999px;width:794px;background:#fff;';
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: 794,
      windowWidth: 794,
    });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height / canvas.width) * imgW;
    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    let heightLeft = imgH;
    let yPos = 0;
    pdf.addImage(imgData, 'JPEG', 0, yPos, imgW, imgH);
    heightLeft -= pageH;

    while (heightLeft > 0) {
      yPos -= pageH;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, yPos, imgW, imgH);
      heightLeft -= pageH;
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(container);
  }
}

function toSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/, '');
}

export async function exportAnswerKey(paper: QuestionPaper): Promise<void> {
  const slug = toSlug(paper.title || 'question-paper');
  await captureAndSave(buildAnswerKeyHTML(paper), `${slug}-answer-key.pdf`);
}

export async function exportToPDF(paper: QuestionPaper, includeAnswers: boolean): Promise<void> {
  const slug = toSlug(paper.title || 'question-paper');
  await captureAndSave(buildPaperHTML(paper, includeAnswers), `${slug}.pdf`);
}
