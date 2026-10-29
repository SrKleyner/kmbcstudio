import { describe, expect, it } from 'vitest';
import {
  PLANS,
  buildLeadMessage,
  isQuizComplete,
  recommendPlan,
  type QuizAnswers,
} from './quiz';

const base: QuizAnswers = { goal: 'muscle', level: 'beginner', days: 3, mode: 'online' };

describe('recommendPlan', () => {
  it('recommends the starter plan for beginners training few days', () => {
    expect(recommendPlan({ ...base, days: 2 }).plan.id).toBe('inicio');
  });

  it('recommends the progress plan for mid commitment', () => {
    expect(recommendPlan({ ...base, level: 'intermediate', days: 3 }).plan.id).toBe('progreso');
  });

  it('recommends the elite plan for advanced athletes training often', () => {
    expect(recommendPlan({ ...base, level: 'advanced', days: 5 }).plan.id).toBe('elite');
  });

  it('keeps the chosen training mode in the result', () => {
    expect(recommendPlan({ ...base, mode: 'in-person' }).mode).toBe('in-person');
  });

  it('never exceeds the available plans for any answer combination', () => {
    const ids = PLANS.map((p) => p.id);
    for (const level of ['beginner', 'intermediate', 'advanced'] as const) {
      for (const days of [2, 3, 4, 5] as const) {
        expect(ids).toContain(recommendPlan({ ...base, level, days }).plan.id);
      }
    }
  });

  it('adds a goal-specific reason', () => {
    expect(recommendPlan({ ...base, goal: 'fat-loss' }).reason).toMatch(/grasa/i);
  });
});

describe('isQuizComplete', () => {
  it('requires all four answers', () => {
    expect(isQuizComplete({})).toBe(false);
    expect(isQuizComplete({ goal: 'muscle', level: 'beginner', days: 3 })).toBe(false);
    expect(isQuizComplete(base)).toBe(true);
  });
});

describe('buildLeadMessage', () => {
  it('summarises the lead and the quiz result in Spanish', () => {
    const msg = buildLeadMessage(
      { name: 'Luis', whatsapp: '+58 412 0000000' },
      { ...base, level: 'intermediate', mode: 'in-person' },
      recommendPlan({ ...base, level: 'intermediate', mode: 'in-person' }),
    );
    expect(msg).toContain('Hola Forja Training');
    expect(msg).toContain('Nombre: Luis');
    expect(msg).toContain('Objetivo: Ganar músculo');
    expect(msg).toContain('Nivel: Intermedio');
    expect(msg).toContain('Días por semana: 3');
    expect(msg).toContain('Modalidad: Presencial');
    expect(msg).toContain('Plan recomendado: Forja Progreso');
  });
});
