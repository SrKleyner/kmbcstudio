export type Goal = 'fat-loss' | 'muscle' | 'performance' | 'health';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Mode = 'online' | 'in-person';

export interface QuizAnswers {
  goal: Goal;
  level: Level;
  days: number;
  mode: Mode;
}

export interface Plan {
  id: 'inicio' | 'progreso' | 'elite';
  name: string;
  /** Monthly price in USD. */
  price: number;
  tagline: string;
  features: string[];
}

export interface Recommendation {
  plan: Plan;
  mode: Mode;
  reason: string;
}

export interface Lead {
  name: string;
  whatsapp: string;
}

export const PLANS: Plan[] = [
  {
    id: 'inicio',
    name: 'Forja Inicio',
    price: 39,
    tagline: 'Construye el hábito y la técnica correcta',
    features: ['Rutina de 2-3 días', 'Guía de técnica en video', 'Chat de seguimiento semanal'],
  },
  {
    id: 'progreso',
    name: 'Forja Progreso',
    price: 69,
    tagline: 'Resultados medibles mes a mes',
    features: ['Plan personalizado 3-4 días', 'Pauta de nutrición', 'Ajustes cada 2 semanas'],
  },
  {
    id: 'elite',
    name: 'Forja Elite',
    price: 119,
    tagline: 'Acompañamiento total para llevarte al límite',
    features: ['Programación avanzada 5 días', 'Coach personal diario', 'Nutrición y suplementación'],
  },
];

const LEVEL_SCORE: Record<Level, number> = { beginner: 0, intermediate: 1, advanced: 2 };

const GOAL_REASON: Record<Goal, string> = {
  'fat-loss': 'Está diseñado para perder grasa de forma sostenida sin perder músculo.',
  muscle: 'Prioriza la progresión de cargas para ganar masa muscular.',
  performance: 'Trabaja fuerza, potencia y resistencia para rendir más.',
  health: 'Mejora tu energía, movilidad y salud general con constancia.',
};

export const GOAL_LABEL: Record<Goal, string> = {
  'fat-loss': 'Perder grasa',
  muscle: 'Ganar músculo',
  performance: 'Mejorar rendimiento',
  health: 'Salud y bienestar',
};

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

export const MODE_LABEL: Record<Mode, string> = {
  online: 'Online',
  'in-person': 'Presencial',
};

function daysScore(days: number): number {
  if (days <= 2) return 0;
  if (days === 3) return 1;
  return 2;
}

export function recommendPlan(answers: QuizAnswers): Recommendation {
  const score = LEVEL_SCORE[answers.level] + daysScore(answers.days);
  const plan = score <= 1 ? PLANS[0] : score <= 3 ? PLANS[1] : PLANS[2];
  return { plan, mode: answers.mode, reason: GOAL_REASON[answers.goal] };
}

export function isQuizComplete(answers: Partial<QuizAnswers>): answers is QuizAnswers {
  return Boolean(answers.goal && answers.level && answers.days && answers.mode);
}

export function buildLeadMessage(lead: Lead, answers: QuizAnswers, rec: Recommendation): string {
  return [
    'Hola Forja Training, quiero empezar. Este es mi resultado del quiz:',
    '',
    `Nombre: ${lead.name}`,
    `Objetivo: ${GOAL_LABEL[answers.goal]}`,
    `Nivel: ${LEVEL_LABEL[answers.level]}`,
    `Días por semana: ${answers.days}`,
    `Modalidad: ${MODE_LABEL[answers.mode]}`,
    `Plan recomendado: ${rec.plan.name} (US$ ${rec.plan.price}/mes)`,
  ].join('\n');
}
