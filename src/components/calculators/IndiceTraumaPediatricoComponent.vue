<template>
  <div v-if="standalone" class="calc-page">
    <h1>Índice de Trauma Pediátrico (ITP)</h1>
    <p class="calc-hint">
      Referencia — suma las puntuaciones de las 6 categorías (rango −6 a +12). El cálculo lo
      realiza el clínico.
    </p>

    <div v-for="item in parametros" :key="item.key" class="param-ref">
      <span class="param-label">{{ item.label }}</span>
      <ul>
        <li v-for="opt in item.opciones" :key="opt.valor">
          {{ opt.texto }} — {{ opt.valor > 0 ? '+' + opt.valor : opt.valor }}
        </li>
      </ul>
    </div>

    <p class="calc-hint">ITP ≤ 8 → elevada mortalidad; valorar traslado a centro de trauma pediátrico.</p>
  </div>

  <div v-else class="calc-wrapper">
    <button class="btn-glow" @click="openModal">Índice Trauma Pediátrico</button>

    <dialog ref="modal">
      <h2>Índice de Trauma Pediátrico (ITP)</h2>
      <p class="calc-hint">
        Referencia — suma las puntuaciones de las 6 categorías (rango −6 a +12). El cálculo lo
        realiza el clínico.
      </p>

      <div v-for="item in parametros" :key="item.key" class="param-ref">
        <span class="param-label">{{ item.label }}</span>
        <ul>
          <li v-for="opt in item.opciones" :key="opt.valor">
            {{ opt.texto }} — {{ opt.valor > 0 ? '+' + opt.valor : opt.valor }}
          </li>
        </ul>
      </div>

      <p class="calc-hint">ITP ≤ 8 → elevada mortalidad; valorar traslado a centro de trauma pediátrico.</p>

      <button class="btn-glow" type="button" @click="closeModal">Cerrar</button>
    </dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  standalone: { type: Boolean, default: false },
});

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

const openModal = () => modal.value?.showModal();
const closeModal = () => modal.value?.close();
</script>

<style scoped>
.param-ref { margin-bottom: 0.75rem; }
.param-label {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-subtitle);
}
.calc-page { max-width: 640px; margin: 0 auto; }
</style>
