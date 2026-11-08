export type PersonId = 'wanderson' | 'fernanda';
export type WeekdayId = 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta';

export interface ExercisePrescription {
  id: string;
  day: WeekdayId;
  dayLabel: string;
  emphasis: string;
  exercise: string;
  prescription: Record<PersonId, string>;
  rest: string;
  rir: Record<PersonId, string>;
}

export interface PersonProfile {
  id: PersonId;
  name: string;
  initials: string;
  subtitle: string;
  accent: 'emerald' | 'violet';
}

export const people: Record<PersonId, PersonProfile> = {
  wanderson: {
    id: 'wanderson',
    name: 'Wanderson',
    initials: 'W',
    subtitle: 'Plano integrado • 5 dias',
    accent: 'emerald'
  },
  fernanda: {
    id: 'fernanda',
    name: 'Fernanda',
    initials: 'F',
    subtitle: 'Plano integrado • 4 dias',
    accent: 'violet'
  }
};

export const weekdayOrder: WeekdayId[] = ['segunda', 'terca', 'quarta', 'quinta', 'sexta'];
export const weekdayLabels: Record<WeekdayId, string> = {
  segunda: 'Segunda',
  terca: 'Terça',
  quarta: 'Quarta',
  quinta: 'Quinta',
  sexta: 'Sexta'
};

const rows: Array<[WeekdayId, string, string, string, string, string, string, string]> = [
  ['segunda','Inferiores A | Quadríceps + glúteos','Agachamento no Smith ou livre','3x6–10','2x8–12','120 s','2–3','3–4'],
  ['segunda','Inferiores A | Quadríceps + glúteos','Leg press 45°','3x10–12','2x10–12','90–120 s','2','3'],
  ['segunda','Inferiores A | Quadríceps + glúteos','Cadeira extensora','2x12–15','2x12–15','60–90 s','1–2','2–3'],
  ['segunda','Inferiores A | Quadríceps + glúteos','Hip thrust','3x8–12','2x10–12','90–120 s','2','3'],
  ['segunda','Inferiores A | Quadríceps + glúteos','Abdutora','2x12–20','2x12–20','60 s','1–2','2–3'],
  ['segunda','Inferiores A | Quadríceps + glúteos','Panturrilha em pé','3x12–15','2x12–15','60 s','2','3'],
  ['terca','Superiores A | Peito + costas + ombro','Supino reto máquina ou barra','3x6–10','2x8–12','120 s','2','3'],
  ['terca','Superiores A | Peito + costas + ombro','Puxada frontal','3x8–12','2x10–12','90 s','2','3'],
  ['terca','Superiores A | Peito + costas + ombro','Supino inclinado halteres','2x8–12','2x10–12','90 s','2','3'],
  ['terca','Superiores A | Peito + costas + ombro','Remada articulada','3x8–12','2x10–12','90 s','2','3'],
  ['terca','Superiores A | Peito + costas + ombro','Elevação lateral','2x12–15','2x12–15','60 s','1–2','2–3'],
  ['terca','Superiores A | Peito + costas + ombro','Tríceps corda','2x10–15','2x10–15','60 s','1–2','2–3'],
  ['terca','Superiores A | Peito + costas + ombro','Rosca direta','2x10–12','2x10–12','60 s','1–2','2–3'],
  ['quarta','Somente Wanderson | Posteriores + glúteos','Stiff com halteres/barra','3x8–10','Descanso','120 s','2–3','-'],
  ['quarta','Somente Wanderson | Posteriores + glúteos','Mesa flexora','3x10–12','Descanso','90 s','2','-'],
  ['quarta','Somente Wanderson | Posteriores + glúteos','Glúteo máquina/cabo','3x12–15','Descanso','75 s','2','-'],
  ['quarta','Somente Wanderson | Posteriores + glúteos','Cadeira flexora','2x12–15','Descanso','75 s','2','-'],
  ['quarta','Somente Wanderson | Posteriores + glúteos','Panturrilha sentada','3x12–20','Descanso','60 s','2','-'],
  ['quinta','Superiores B | Costas + ombros + braços','Remada baixa','3x8–12','2x10–12','90 s','2','3'],
  ['quinta','Superiores B | Costas + ombros + braços','Desenvolvimento máquina','2x8–12','2x10–12','90 s','2','3'],
  ['quinta','Superiores B | Costas + ombros + braços','Puxada neutra','2x10–12','2x10–12','90 s','2','3'],
  ['quinta','Superiores B | Costas + ombros + braços','Crucifixo inverso','2x12–15','2x12–15','60 s','2','3'],
  ['quinta','Superiores B | Costas + ombros + braços','Crucifixo máquina/peck deck','2x12–15','2x12–15','60 s','2','3'],
  ['quinta','Superiores B | Costas + ombros + braços','Rosca martelo','2x10–12','2x10–12','60 s','2','3'],
  ['quinta','Superiores B | Costas + ombros + braços','Tríceps francês na polia','2x10–12','2x10–12','60 s','2','3'],
  ['sexta','Inferiores C/B | Completo com foco posterior','Agachamento hack ou Smith','2x8–12','2x8–12','120 s','2–3','3'],
  ['sexta','Inferiores C/B | Completo com foco posterior','Levantamento romeno (stiff)','2x8–12','2x8–12','120 s','2–3','3–4'],
  ['sexta','Inferiores C/B | Completo com foco posterior','Mesa flexora','2x10–15','2x10–15','90 s','2','3'],
  ['sexta','Inferiores C/B | Completo com foco posterior','Leg press 45°','2x10–12','2x10–12','90 s','2','3'],
  ['sexta','Inferiores C/B | Completo com foco posterior','Hip thrust','2x10–12','2x10–12','90 s','2','3'],
  ['sexta','Inferiores C/B | Completo com foco posterior','Abdutora','2x15–20','2x15–20','60 s','2','3'],
  ['sexta','Inferiores C/B | Completo com foco posterior','Panturrilha','2x12–20','2x12–20','60 s','2','3']
];

export const exercises: ExercisePrescription[] = rows.map((r, index) => ({
  id: `ex-${String(index + 1).padStart(2, '0')}`,
  day: r[0],
  dayLabel: weekdayLabels[r[0]],
  emphasis: r[1],
  exercise: r[2],
  prescription: { wanderson: r[3], fernanda: r[4] },
  rest: r[5],
  rir: { wanderson: r[6], fernanda: r[7] }
}));

export const guidance = [
  ['Origem','Reorganização da planilha App_Treino_Wanderson_AppSheet_Ready; não é o treino original.'],
  ['Objetivo','Reduzir gordura sem sacrificar força/massa magra; ênfase em pernas e glúteos.'],
  ['Aquecimento','5–8 min caminhada/bike + 1–2 séries leves no primeiro exercício multiarticular.'],
  ['RIR','Repetições em reserva: 2 = seria possível fazer mais 2 repetições boas.'],
  ['Progressão','Quando completar o limite superior das repetições com técnica e RIR alvo, subir carga 2–5%.'],
  ['Sem falha','Não é necessário atingir falha muscular em todas as séries.'],
  ['Cardio','Ter/Qui: 15–20 min moderados após musculação, Seg/Sex: opcional 10–15 min; quarta só Wanderson 15–25 min leve se recuperado.'],
  ['Experiência Fernanda','Volume proposto assume iniciante/intermediária; revisar com experiência real e tolerância.'],
  ['Quarta','Fernanda descansa; quarta somente Wanderson.'],
  ['Reavaliação','30/11/2026: peso, cintura, abdome, fotos comparáveis e bioimpedância em condições similares.'],
  ['Atenção','Interromper com dor aguda, tontura ou sintoma incomum; ajustar cargas e técnica.']
] as const;

export const nutritionReference = {
  fernanda: {
    weight: 70.75,
    basal: 1289,
    totalMin: 1804.6,
    totalMax: 1997.95,
    calorieMin: 1404.6,
    calorieMax: 1747.95,
    proteinMin: 99.05,
    note: 'Faixas estimadas da planilha. Não são prescrição nutricional. Altura e idade ainda precisam ser confirmadas.'
  },
  wanderson: {
    weight: 104,
    basal: 1868.75,
    totalMin: 2616.25,
    totalMax: 2990,
    calorieMin: 2116.25,
    calorieMax: 2690,
    proteinMin: null,
    note: 'Faixas estimadas da planilha. Não são prescrição nutricional; peso de referência deve ser confirmado.'
  }
} as const;

export const baseline = {
  fernanda: [
    ['Peso kg', 70.75],
    ['Gordura %', 39.8],
    ['Massa muscular kg', 40],
    ['Cintura cm', 95],
    ['Abdômen cm', 101],
    ['Quadril cm', 111],
    ['Gordura visceral índice', 14],
    ['Fotos comparáveis', 'A confirmar']
  ],
  wanderson: []
} as const;
