<template>
  <div class="calc-wrapper">
    <button class="btn-glow" @click="openModal">Índice Trauma Pediátrico</button>

    <dialog ref="modal">
      <h2>Índice de Trauma Pediátrico (ITP)</h2>
      <form method="dialog" @submit.prevent>

        <div
          v-for="item in parametros"
          :key="item.key"
          class="param"
        >
          <span class="param-label">{{ item.label }}</span>
          <div class="seg">
            <button
              v-for="opt in item.opciones"
              :key="opt.valor"
              type="button"
              class="seg-btn"
              :class="[`v${opt.valor}`, { active: scores[item.key] === opt.valor }]"
              @click="scores[item.key] = opt.valor"
            >
              <span class="seg-pts">{{ opt.valor > 0 ? '+' + opt.valor : opt.valor }}</span>
              <span class="seg-desc">{{ opt.texto }}</span>
            </button>
          </div>
        </div>

        <div class="score-panel" :class="severityClass">
          <div class="score-value">{{ total }}</div>
          <div class="score-details">
            <div class="score-label">ITP · rango −6 a +12</div>
            <div class="score-interpretation">{{ interpretacion }}</div>
          </div>
        </div>

        <p class="alert" v-if="total <= 8">
          ITP ≤ 8 → elevada mortalidad. Traslado a centro de trauma pediátrico.
        </p>

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

const parametros = [
  {
    key: 'peso', label: 'Peso',
    opciones: [
      { valor: 2, texto: '>20 kg' },
      { valor: 1, texto: '10-20 kg' },
      { valor: -1, texto: '<10 kg' },
    ],
  },
  {
    key: 'via', label: 'Vía aérea',
    opciones: [
      { valor: 2, texto: 'Normal' },
      { valor: 1, texto: 'Sostenible · intervención elemental' },
      { valor: -1, texto: 'Insostenible · intervención avanzada' },
    ],
  },
  {
    key: 'pulsos', label: 'Pulsos / TAS',
    opciones: [
      { valor: 2, texto: 'PC+ / PP+ (TAS >90)' },
      { valor: 1, texto: 'PC+ / PP– (TAS 50-90)' },
      { valor: -1, texto: 'PC– / PP– (TAS <50)' },
    ],
  },
  {
    key: 'conciencia', label: 'Conciencia',
    opciones: [
      { valor: 2, texto: 'Alerta' },
      { valor: 1, texto: 'Obnubilado / pérdida transitoria' },
      { valor: -1, texto: 'Coma' },
    ],
  },
  {
    key: 'fracturas', label: 'Fracturas',
    opciones: [
      { valor: 2, texto: 'No' },
      { valor: 1, texto: 'Única y cerrada' },
      { valor: -1, texto: 'Múltiples y/o abiertas' },
    ],
  },
  {
    key: 'heridas', label: 'Heridas',
    opciones: [
      { valor: 2, texto: 'No' },
      { valor: 1, texto: 'Menores' },
      { valor: -1, texto: 'Mayores o penetrantes' },
    ],
  },
];

const defaults = () => ({ peso: 2, via: 2, pulsos: 2, conciencia: 2, fracturas: 2, heridas: 2 });
const scores = reactive(defaults());

const total = computed(() =>
  parametros.reduce((sum, p) => sum + scores[p.key], 0)
);

const interpretacion = computed(() => {
  const t = total.value;
  if (t > 8) return 'Lesión leve · buen pronóstico';
  if (t >= 6) return 'Potencialmente grave · trauma center';
  if (t >= 0) return 'Lesión grave · alta mortalidad';
  return 'Crítico · mortalidad muy elevada';
});

const severityClass = computed(() => {
  const t = total.value;
  if (t > 8) return 'score-mild';
  if (t >= 6) return 'score-moderate';
  return 'score-severe';
});

const reset = () => Object.assign(scores, defaults());
const openModal = () => modal.value?.showModal();
const closeModal = () => modal.value?.close();
</script>

<style scoped>
.param {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.9rem;
}
.param-label {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-subtitle);
}

.seg {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4rem;
}
.seg-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.5rem 0.4rem;
  background: rgba(5, 16, 30, 0.6);
  border: 1px solid rgba(45, 156, 219, 0.18);
  border-radius: 8px;
  color: rgba(228, 239, 248, 0.7);
  cursor: pointer;
  transition: all 0.15s ease;
  min-height: 56px;
  text-align: center;
}
.seg-btn:hover { border-color: rgba(45, 156, 219, 0.5); }
.seg-pts {
  font-family: var(--font-mono);
  font-size: 1.05rem;
  font-weight: 500;
  line-height: 1;
}
.seg-desc {
  font-family: var(--font-family);
  font-size: 0.68rem;
  line-height: 1.15;
}

.seg-btn.active { color: #fff; font-weight: 600; }
.seg-btn.v2.active  { background: rgba(16, 185, 129, 0.18); border-color: #10b981; box-shadow: 0 0 16px rgba(16, 185, 129, 0.3); }
.seg-btn.v1.active  { background: rgba(245, 158, 11, 0.18); border-color: var(--neon-orange); box-shadow: 0 0 16px rgba(245, 158, 11, 0.28); }
.seg-btn.v-1.active { background: rgba(239, 68, 68, 0.18); border-color: #ef4444; box-shadow: 0 0 16px rgba(239, 68, 68, 0.3); }

.alert {
  margin: 0 0 1rem;
  padding: 0.7rem 0.9rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-left: 3px solid #ef4444;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #fca5a5;
}
</style>
