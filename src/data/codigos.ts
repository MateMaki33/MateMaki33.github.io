export interface Codigo {
  id: string;
  label: string;
  /** Clinical system tag shown on the dashboard card (e.g. NEURO, CARDIO). */
  system?: string;
  /** Accent colour (hex) used for the card's icon, tag and left rule. */
  accent?: string;
  /** Icon key resolved by the dashboard (see CodigoIcon map). */
  icon?: string;
  /** One-line orientation shown under the label on the dashboard. */
  desc?: string;
}

const codigos: Codigo[] = [
  { id: 'ictus',    label: 'Ictus',    system: 'Neuro',       accent: '#a78bfa', icon: 'brain',     desc: 'Activación y ventana terapéutica' },
  { id: 'infarto',  label: 'Infarto',  system: 'Cardio',      accent: '#f87171', icon: 'heart',     desc: 'SCACEST · código infarto' },
  { id: 'sepsis',   label: 'Sepsis',   system: 'Infeccioso',  accent: '#34d399', icon: 'droplet',   desc: 'Sepsis y shock séptico' },
  { id: 'trauma',   label: 'Trauma',   system: 'Trauma',      accent: '#f59e0b', icon: 'pulse',     desc: 'Trauma grave · ABCDE' },
  { id: 'quemados', label: 'Quemados', system: 'Trauma',      accent: '#fb923c', icon: 'flame',     desc: 'Gran quemado · Parkland' },
  { id: 'ecmo-rcp', label: 'ECMO-RCP', system: 'Parada',      accent: '#ef4444', icon: 'bolt',      desc: 'PCR refractaria · ECMO' },
  { id: 'crisis',   label: 'Crisis',   system: 'Salud mental',accent: '#818cf8', icon: 'head',      desc: 'Crisis · agitación' },
  { id: 'imv',      label: 'IMV',      system: 'Catástrofe',  accent: '#eab308', icon: 'users',     desc: 'Incidente múltiples víctimas' },
  { id: 'donante',  label: 'Donante',  system: 'Donación',    accent: '#56ccf2', icon: 'cross',     desc: 'Donante en asistolia' },
];

export default codigos;
