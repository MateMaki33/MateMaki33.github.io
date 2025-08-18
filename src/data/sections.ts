export interface Section {
  path: string;
  label: string;
}

const sections: Section[] = [
  { path: '/ictus', label: 'Ictus' },
  { path: '/infarto', label: 'Infarto' },
  { path: '/crisis', label: 'Crisis' },
  { path: '/donante', label: 'Donante' },
  { path: '/trauma', label: 'Trauma' },
  { path: '/sepsis', label: 'Sepsis' },
  { path: '/quemados', label: 'Quemados' },
  { path: '/imv', label: 'IMV' },
  { path: '/ecmo-rcp', label: 'ECMO-RCP' }
];

export default sections;
