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
];

export default escalas;
