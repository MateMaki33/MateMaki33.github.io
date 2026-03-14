export interface Codigo {
  id: string;
  label: string;
}

const codigos: Codigo[] = [
  { id: 'ictus', label: 'Ictus' },
  { id: 'infarto', label: 'Infarto' },
  { id: 'donante', label: 'Donante' },
  { id: 'crisis', label: 'Crisis' },
  { id: 'trauma', label: 'Trauma' },
  { id: 'quemados', label: 'Quemados' },
  { id: 'imv', label: 'IMV' },
  { id: 'sepsis', label: 'Sepsis' },
  { id: 'ecmo-rcp', label: 'ECMO-RCP' },
];

export default codigos;
