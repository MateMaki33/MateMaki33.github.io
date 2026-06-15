<template>
  <div class="calc-wrapper">
    <button class="btn-glow" @click="openModal">SCQ Pediátrica · Lund-Browder</button>

    <dialog ref="modal">
      <h2>Superficie Corporal Quemada (Lund-Browder)</h2>
      <form method="dialog" @submit.prevent>

        <div class="form-group">
          <label>Edad del paciente</label>
          <div class="age-row">
            <button
              v-for="(b, i) in brackets"
              :key="b"
              type="button"
              class="age-btn"
              :class="{ active: ageIdx === i }"
              @click="ageIdx = i"
            >{{ b }}</button>
          </div>
        </div>

        <p class="hint">Marca la fracción quemada de cada región. Toca para avanzar ¼ · ½ · ¾ · total.</p>

        <div class="regions">
          <div v-for="r in regiones" :key="r.nombre" class="region">
            <div class="region-info">
              <span class="region-name">{{ r.nombre }}</span>
              <span class="region-max">máx {{ fmt(r.vals[ageIdx]) }}%</span>
            </div>
            <div class="frac">
              <button
                v-for="f in fracciones"
                :key="f.v"
                type="button"
                class="frac-btn"
                :class="{ active: estado[r.nombre] === f.v }"
                @click="estado[r.nombre] = f.v"
              >{{ f.label }}</button>
            </div>
            <span class="region-pts">{{ fmt(r.vals[ageIdx] * estado[r.nombre]) }}</span>
          </div>
        </div>

        <div class="score-panel" :class="severityClass">
          <div class="score-value">{{ fmt(totalScq) }}<small>%</small></div>
          <div class="score-details">
            <div class="score-label">SCQ total</div>
            <div class="score-interpretation">{{ gravedad }}</div>
          </div>
        </div>

        <div class="parkland">
          <div class="pk-input">
            <label>Peso (kg)</label>
            <input type="number" v-model.number="peso" min="0" placeholder="Ej. 18" />
          </div>
          <div class="pk-result" v-if="volumenTotal">
            <p><strong>Parkland 24h:</strong> {{ volumenTotal }} ml <span class="muted">(4 × kg × %SCQ)</span></p>
            <p><strong>1.ª mitad (8h):</strong> {{ mitad }} ml · <strong>2.ª (16h):</strong> {{ mitad }} ml</p>
            <p class="muted">Ringer lactato desde la hora de la quemadura. Añadir necesidades basales de mantenimiento en el niño.</p>
          </div>
          <p class="muted small" v-else>Introduce el peso para estimar la reposición (Parkland).</p>
        </div>

        <div class="calc-actions">
          <button class="btn-ghost" type="button" @click="reset">Reiniciar</button>
          <button class="btn-glow" type="button" @click="closeModal">Cerrar</button>
        </div>
      </form>
    </dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';

const modal = ref(null);

// Tabla de Lund-Browder modificada — % de Superficie Corporal Total por región
// (valores de región completa: paciente <1, 1-4, 5-9, 10-14, >15 años)
const brackets = ['<1 a', '1-4 a', '5-9 a', '10-14 a', '>15 a'];
const regiones = [
  { nombre: 'Cabeza',            vals: [19, 17, 13, 11, 9] },
  { nombre: 'Cuello',           vals: [2, 2, 2, 2, 2] },
  { nombre: 'Tronco (incl. espalda)', vals: [26, 26, 26, 26, 26] },
  { nombre: 'Brazos (ambos)',   vals: [8, 8, 8, 8, 8] },
  { nombre: 'Antebrazos (ambos)', vals: [6, 6, 6, 6, 6] },
  { nombre: 'Manos (ambas)',    vals: [5, 5, 5, 5, 5] },
  { nombre: 'Muslos (ambos)',   vals: [11, 13, 16, 17, 18] },
  { nombre: 'Piernas (ambas)',  vals: [10, 10, 10, 12, 13] },
  { nombre: 'Pies (ambos)',     vals: [7, 7, 7, 7, 7] },
  { nombre: 'Nalgas (ambas)',   vals: [5, 5, 5, 5, 5] },
  { nombre: 'Genitales',        vals: [1, 1, 1, 1, 1] },
];

const fracciones = [
  { v: 0, label: '0' },
  { v: 0.25, label: '¼' },
  { v: 0.5, label: '½' },
  { v: 0.75, label: '¾' },
  { v: 1, label: '1' },
];

const ageIdx = ref(1);
const peso = ref(null);

const initEstado = () => Object.fromEntries(regiones.map((r) => [r.nombre, 0]));
const estado = reactive(initEstado());

const fmt = (n) => Number(n.toFixed(2)).toString().replace('.', ',');

const totalScq = computed(() =>
  regiones.reduce((sum, r) => sum + r.vals[ageIdx.value] * estado[r.nombre], 0)
);

// Criterios pediátricos (ABA) por % SCQ 2.º grado
const gravedad = computed(() => {
  const s = totalScq.value;
  if (s === 0) return 'Sin superficie marcada';
  if (s <= 10) return 'Quemadura menor (niño)';
  if (s <= 20) return 'Quemadura moderada (niño)';
  return 'Quemadura mayor (niño)';
});

const severityClass = computed(() => {
  const s = totalScq.value;
  if (s === 0) return 'score-neutral';
  if (s <= 10) return 'score-mild';
  if (s <= 20) return 'score-moderate';
  return 'score-severe';
});

const volumenTotal = computed(() => {
  if (!peso.value || !totalScq.value) return null;
  return Math.round(4 * peso.value * totalScq.value);
});
const mitad = computed(() => (volumenTotal.value ? Math.round(volumenTotal.value / 2) : null));

const reset = () => {
  Object.assign(estado, initEstado());
  peso.value = null;
};
const openModal = () => modal.value?.showModal();
const closeModal = () => modal.value?.close();
</script>

<style scoped>
/* Wider gap variant for the age selector group */
.form-group { gap: 0.5rem; margin-bottom: 0.9rem; }

.age-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.4rem; }
.age-btn {
  padding: 0.55rem 0.3rem;
  background: rgba(5, 16, 30, 0.6);
  border: 1px solid rgba(45, 156, 219, 0.2);
  border-radius: 8px;
  color: rgba(228, 239, 248, 0.7);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s ease;
}
.age-btn:hover { border-color: rgba(45, 156, 219, 0.5); }
.age-btn.active {
  background: rgba(45, 156, 219, 0.2);
  border-color: var(--color-primary);
  color: #fff;
  box-shadow: 0 0 16px rgba(45, 156, 219, 0.3);
}

.hint {
  font-size: 0.78rem;
  color: rgba(228, 239, 248, 0.5);
  margin: 0 0 0.75rem;
}

.regions { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
.region {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.6rem;
  background: rgba(5, 16, 30, 0.45);
  border: 1px solid rgba(45, 156, 219, 0.12);
  border-radius: 8px;
}
.region-info { display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
.region-name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.86rem;
  color: var(--color-text);
  letter-spacing: 0.02em;
}
.region-max { font-size: 0.68rem; color: rgba(228, 239, 248, 0.4); }

.frac { display: flex; gap: 0.2rem; }
.frac-btn {
  width: 1.9rem;
  height: 1.9rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(5, 16, 30, 0.7);
  border: 1px solid rgba(45, 156, 219, 0.18);
  border-radius: 6px;
  color: rgba(228, 239, 248, 0.55);
  font-family: var(--font-mono);
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.12s ease;
}
.frac-btn:hover { border-color: rgba(45, 156, 219, 0.45); }
.frac-btn.active {
  background: var(--neon-orange);
  border-color: var(--neon-glow);
  color: #1a1206;
  font-weight: 700;
}

.region-pts {
  font-family: var(--font-mono);
  font-size: 0.92rem;
  font-weight: 500;
  color: var(--color-subtitle);
  min-width: 2.6rem;
  text-align: right;
}

.parkland {
  padding: 0.85rem 1rem;
  background: rgba(45, 156, 219, 0.05);
  border: 1px solid rgba(45, 156, 219, 0.18);
  border-radius: 8px;
  margin-bottom: 1rem;
}
.pk-input { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.6rem; }
.pk-result p { margin: 0.3rem 0; font-size: 0.9rem; }
.muted { color: rgba(228, 239, 248, 0.45); font-weight: 400; }
.small { font-size: 0.82rem; }

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
input[type="number"] { -moz-appearance: textfield; }
</style>
