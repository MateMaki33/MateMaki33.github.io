<template>
  <button class="btn calc-trigger" @click="openModal">
    <span class="trigger-tag">Rellenar</span>
    Prealerta · ATMISTER
  </button>

  <dialog ref="modal" class="atm-dialog">
    <h2>Prealerta Estructurada — ATMISTER</h2>
    <p class="calc-hint">Rellena los campos del aviso. Se genera un mensaje estructurado listo para transmitir al centro útil.</p>

    <div class="fields">
      <div class="field full">
        <label>{{ letra('A') }} · Edad / Sexo</label>
        <div class="row-2">
          <input v-model="f.edad" type="text" placeholder="Edad (p.ej. 4 años)" />
          <select v-model="f.sexo">
            <option value="">Sexo…</option>
            <option>Varón</option>
            <option>Mujer</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label>{{ letra('T') }} · Hora del incidente</label>
        <input v-model="f.hora" type="time" />
      </div>

      <div class="field">
        <label>{{ letra('E') }} · E.T.A. (min)</label>
        <input v-model="f.eta" type="number" min="0" placeholder="Tiempo de llegada" />
      </div>

      <div class="field full">
        <label>{{ letra('M') }} · Mecanismo lesional</label>
        <textarea v-model="f.mecanismo" rows="2" placeholder="Atropello, caída de altura, colisión…"></textarea>
      </div>

      <div class="field full">
        <label>{{ letra('I') }} · Lesiones sospechadas</label>
        <textarea v-model="f.lesiones" rows="2" placeholder="TCE, fractura de pelvis, quemaduras…"></textarea>
      </div>

      <div class="field full">
        <label>{{ letra('S') }} · Constantes y Glasgow</label>
        <div class="vitals">
          <input v-model="f.fc" type="text" placeholder="FC" />
          <input v-model="f.fr" type="text" placeholder="FR" />
          <input v-model="f.ta" type="text" placeholder="TA" />
          <input v-model="f.spo2" type="text" placeholder="SatO₂" />
          <input v-model="f.gcs" type="text" placeholder="GCS" />
          <input v-model="f.itp" type="text" placeholder="ITP" />
        </div>
      </div>

      <div class="field full">
        <label>{{ letra('T', 2) }} · Tratamiento realizado</label>
        <textarea v-model="f.tratamiento" rows="2" placeholder="O₂, vía/IO, fluidos, analgesia, inmovilización…"></textarea>
      </div>

      <div class="field full">
        <label>{{ letra('R') }} · Necesidades / Requerimientos</label>
        <textarea v-model="f.requerimientos" rows="2" placeholder="Box de críticos, cirugía, hemoderivados, pediatra…"></textarea>
      </div>
    </div>

    <div class="report">
      <div class="report-head">
        <span class="report-label">Aviso estructurado</span>
        <button type="button" class="copy-btn" :class="{ done: copied }" @click="copy">
          {{ copied ? '✓ Copiado' : 'Copiar' }}
        </button>
      </div>
      <pre class="report-body">{{ reporte }}</pre>
    </div>

    <details class="checklist">
      <summary>Información a comunicar</summary>
      <ul>
        <li v-for="(item, i) in ped.prealerta.informacion" :key="i">{{ item }}</li>
      </ul>
    </details>

    <form method="dialog" @submit.prevent>
      <div class="calc-actions">
        <button class="btn-ghost" type="button" @click="reset">Limpiar</button>
        <button class="btn-glow" type="button" @click="closeModal">Cerrar</button>
      </div>
    </form>
  </dialog>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import data from '../../collections/trauma_pediatrico.json';

const ped = data.trauma_pediatrico;
const modal = ref(null);
const copied = ref(false);

// Mapa de letra → texto español (ATMISTER tiene dos "T")
const letra = (l, ordinal = 1) => {
  const matches = ped.prealerta.atmister.filter((a) => a.letra === l);
  const m = matches[ordinal - 1] || matches[0];
  return m ? `${m.letra} — ${m.es}` : l;
};

const blank = () => ({
  edad: '', sexo: '', hora: '', eta: '',
  mecanismo: '', lesiones: '',
  fc: '', fr: '', ta: '', spo2: '', gcs: '', itp: '',
  tratamiento: '', requerimientos: '',
});
const f = reactive(blank());

const constantes = computed(() => {
  const parts = [];
  if (f.fc) parts.push(`FC ${f.fc}`);
  if (f.fr) parts.push(`FR ${f.fr}`);
  if (f.ta) parts.push(`TA ${f.ta}`);
  if (f.spo2) parts.push(`SatO₂ ${f.spo2}`);
  if (f.gcs) parts.push(`GCS ${f.gcs}`);
  if (f.itp) parts.push(`ITP ${f.itp}`);
  return parts.join(' · ');
});

const reporte = computed(() => {
  const ageSex = [f.edad, f.sexo].filter(Boolean).join(' / ');
  const lines = [
    'PREALERTA · TRAUMA PEDIÁTRICO',
    `A — Edad/Sexo: ${ageSex || '—'}`,
    `T — Hora incidente: ${f.hora || '—'}`,
    `M — Mecanismo: ${f.mecanismo || '—'}`,
    `I — Lesiones: ${f.lesiones || '—'}`,
    `S — Constantes/GCS: ${constantes.value || '—'}`,
    `T — Tratamiento: ${f.tratamiento || '—'}`,
    `E — E.T.A.: ${f.eta ? f.eta + ' min' : '—'}`,
    `R — Necesidades: ${f.requerimientos || '—'}`,
  ];
  return lines.join('\n');
});

const copy = async () => {
  try {
    await navigator.clipboard.writeText(reporte.value);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 1800);
  } catch (e) {
    // Clipboard no disponible: selección manual del <pre>
  }
};

const reset = () => Object.assign(f, blank());
const openModal = () => modal.value?.showModal();
const closeModal = () => modal.value?.close();
</script>

<style scoped>
.fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1.1rem;
}
.field { display: flex; flex-direction: column; gap: 0.35rem; }
.field.full { grid-column: 1 / -1; }
.field label {
  font-size: 0.72rem;
  letter-spacing: 0.05em;
}
.row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
.vitals { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.4rem; }

textarea {
  padding: 0.6rem 0.8rem;
  border-radius: var(--radius-default, 8px);
  border: 1px solid rgba(45, 156, 219, 0.3);
  background: rgba(5, 16, 30, 0.9);
  color: var(--color-text);
  font-size: 0.92rem;
  font-family: var(--font-family);
  resize: vertical;
  width: 100%;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(45, 156, 219, 0.18);
}
.vitals input { height: 2.6rem; padding: 0.4rem 0.6rem; font-size: 0.9rem; }

.report {
  border: 1px solid rgba(45, 156, 219, 0.3);
  border-radius: 10px;
  background: rgba(5, 16, 30, 0.7);
  overflow: hidden;
  margin-bottom: 1rem;
}
.report-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0.85rem;
  background: rgba(45, 156, 219, 0.08);
  border-bottom: 1px solid rgba(45, 156, 219, 0.2);
}
.report-label {
  font-family: var(--font-display);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-subtitle);
}
.copy-btn {
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.35rem 0.85rem;
  border-radius: 6px;
  border: 1px solid rgba(45, 156, 219, 0.4);
  background: rgba(45, 156, 219, 0.12);
  color: var(--color-btn-text);
  cursor: pointer;
  transition: all 0.2s ease;
}
.copy-btn:hover { background: rgba(45, 156, 219, 0.25); color: #fff; }
.copy-btn.done { background: rgba(16, 185, 129, 0.2); border-color: #10b981; color: #6ee7b7; }
.report-body {
  margin: 0;
  padding: 0.85rem;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  line-height: 1.6;
  color: rgba(228, 239, 248, 0.9);
  white-space: pre-wrap;
  word-break: break-word;
}

.checklist {
  margin-bottom: 1rem;
  border: 1px solid rgba(45, 156, 219, 0.18);
  border-radius: 8px;
  padding: 0.5rem 0.85rem;
}
.checklist summary {
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--color-subtitle);
}
.checklist ul { margin: 0.6rem 0 0.2rem; }
.checklist li { font-size: 0.82rem; }

@media (max-width: 560px) {
  .fields { grid-template-columns: 1fr; }
  .vitals { grid-template-columns: repeat(2, 1fr); }
}
</style>
