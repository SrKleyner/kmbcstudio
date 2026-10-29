import { LEAD_ENDPOINT, WHATSAPP_NUMBER } from '../config';
import {
  buildLeadMessage,
  isQuizComplete,
  recommendPlan,
  type Lead,
  type QuizAnswers,
  type Recommendation,
} from '../lib/quiz';
import { buildWhatsAppUrl } from '../lib/whatsapp';

const FIELDS = ['goal', 'level', 'days', 'mode'] as const;
const REQUEST_TIMEOUT_MS = 8000;

function $<T extends HTMLElement>(selector: string, root: ParentNode = document): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
}

/** POSTs the lead as a text/plain JSON body (avoids a CORS preflight, which Apps Script cannot answer). */
async function sendLead(payload: Record<string, unknown>): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    await fetch(LEAD_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export function initTrainingQuiz(): void {
  const root = $('[data-quiz]');
  const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-step]'));
  const progress = $('[data-progress]', root);
  const stepLabel = $('[data-step-label]', root);
  const back = $<HTMLButtonElement>('[data-back]', root);
  const result = $('[data-result]', root);
  const form = $<HTMLFormElement>('[data-lead-form]', root);
  const done = $('[data-done]', root);
  const error = $('[data-form-error]', root);
  const submit = $<HTMLButtonElement>('[data-submit]', root);

  const answers: Partial<QuizAnswers> = {};
  let current = 0;
  let recommendation: Recommendation | null = null;

  function showStep(index: number): void {
    current = index;
    steps.forEach((s, i) => (s.hidden = i !== index));
    result.hidden = true;
    progress.style.width = `${((index + 1) / (steps.length + 1)) * 100}%`;
    stepLabel.textContent = `Pregunta ${index + 1} de ${steps.length}`;
    back.hidden = index === 0;
  }

  function showResult(): void {
    if (!isQuizComplete(answers)) return;
    recommendation = recommendPlan(answers);
    steps.forEach((s) => (s.hidden = true));
    result.hidden = false;
    back.hidden = false;
    progress.style.width = '100%';
    stepLabel.textContent = 'Tu plan ideal';
    $('[data-plan-name]', root).textContent = recommendation.plan.name;
    $('[data-plan-price]', root).textContent = `US$ ${recommendation.plan.price}`;
    $('[data-plan-tagline]', root).textContent = recommendation.plan.tagline;
    $('[data-plan-reason]', root).textContent = recommendation.reason;
    $('[data-plan-features]', root).replaceChildren(
      ...recommendation.plan.features.map((f) => {
        const li = document.createElement('li');
        li.textContent = f;
        li.className = 'flex gap-2';
        const check = document.createElement('span');
        check.textContent = '✓';
        check.setAttribute('aria-hidden', 'true');
        check.className = 'text-volt';
        li.prepend(check);
        return li;
      }),
    );
    $<HTMLElement>('[data-plan-mode]', root).textContent =
      answers.mode === 'in-person' ? 'Presencial' : 'Online';
    $<HTMLInputElement>('input[name="name"]', form).focus({ preventScroll: true });
  }

  root.addEventListener('change', (event) => {
    const input = event.target as HTMLInputElement;
    if (input.type !== 'radio') return;
    const key = input.name as (typeof FIELDS)[number];
    if (!FIELDS.includes(key)) return;
    if (key === 'days') answers.days = Number(input.value);
    else (answers as Record<string, string>)[key] = input.value;
    // short pause so the selection feedback is visible before moving on
    setTimeout(() => (current < steps.length - 1 ? showStep(current + 1) : showResult()), 220);
  });

  back.addEventListener('click', () => {
    if (!result.hidden) showStep(steps.length - 1);
    else if (current > 0) showStep(current - 1);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!isQuizComplete(answers) || !recommendation) return;
    const data = new FormData(form);
    const lead: Lead = {
      name: String(data.get('name') ?? '').trim(),
      whatsapp: String(data.get('whatsapp') ?? '').trim(),
    };
    const fallbackUrl = buildWhatsAppUrl(
      WHATSAPP_NUMBER,
      buildLeadMessage(lead, answers, recommendation),
    );
    error.hidden = true;
    submit.disabled = true;

    if (!LEAD_ENDPOINT) {
      submit.disabled = false;
      window.open(fallbackUrl, '_blank', 'noopener');
      return;
    }

    try {
      await sendLead({
        ...lead,
        ...answers,
        plan: recommendation.plan.name,
        createdAt: new Date().toISOString(),
      });
      form.hidden = true;
      done.hidden = false;
      $<HTMLAnchorElement>('[data-done-link]', root).href = fallbackUrl;
    } catch {
      error.hidden = false;
      window.open(fallbackUrl, '_blank', 'noopener');
    } finally {
      submit.disabled = false;
    }
  });

  showStep(0);
}
