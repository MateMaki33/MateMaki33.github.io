export interface Escala {
  id: string;
  label: string;
}

const escalas: Escala[] = [
  { id: 'glasgow', label: 'Glasgow' },
  { id: 'qsofa', label: 'qSOFA' },
  { id: 'trauma-score', label: 'Trauma Score' },
  { id: 'indice-shock', label: 'Índice de Shock' },
  { id: 'parkland', label: 'Parkland' },
  { id: 'madrid-direct', label: 'Madrid Direct' },
  { id: 'itp', label: 'Índice Trauma Pediátrico' },
  { id: 'scq-pediatrica', label: 'SCQ Pediátrica' },
];

export default escalas;
