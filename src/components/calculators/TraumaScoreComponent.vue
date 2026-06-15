<template>
  <div class="grid">
    <button class="btn-glow" @click="openModal">Trauma SCORE</button>

    <dialog ref="modal">
      <h2>Trauma SCORE Revisado ponderado</h2>
      <form method="dialog" @submit.prevent>
        <div class="form-group">
          <label>Frecuencia Respiratoria:</label>
          <input type="number" v-model.number="fr" min="0" />
        </div>

        <div class="form-group">
          <label>Tensión Sistólica:</label>
          <input type="number" v-model.number="tas" min="0" />
        </div>

        <div class="form-group">
          <label>Escala de Glasgow:</label>
          <input type="number" v-model.number="glasgow" min="3" max="15" />
        </div>

        <div class="score">
          <p>RTS: <strong>{{ tsr.rts }}</strong></p>
          <p>Interpretación: <strong>{{ rtsInterpretacion }}</strong></p>
        </div>

        <button class="btn-glow" @click="closeModal">Cerrar</button>
      </form>
    </dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const modal = ref(null)

const fr = ref(0)
const tas = ref(0)
const glasgow = ref(15)

const tsr = computed(() => {
  const frScore = (() => {
    if (fr.value > 29) return 4;
    if (fr.value >= 10) return 4;
    if (fr.value >= 6) return 3;
    if (fr.value >= 1) return 2;
    return 0;
  })();

  const tasScore = (() => {
    if (tas.value > 89) return 4;
    if (tas.value >= 76) return 3;
    if (tas.value >= 50) return 2;
    if (tas.value >= 1) return 1;
    return 0;
  })();

  const glasgowScore = (() => {
    if (glasgow.value === 15) return 4;
    if (glasgow.value >= 13) return 3;
    if (glasgow.value >= 9) return 2;
    if (glasgow.value >= 6) return 1;
    return 0;
  })();

  const rts =
    0.9368 * glasgowScore +
    0.7326 * tasScore +
    0.2908 * frScore;

  return {
    rts: rts.toFixed(4),
  };
});

const rtsInterpretacion = computed(() => {
  const score = parseFloat(tsr.value.rts);
  if (score >= 7.84) return "Trauma leve. Alta probabilidad de supervivencia.";
  if (score >= 6) return "Trauma moderado. Pronóstico favorable.";
  if (score >= 4) return "Trauma grave. Riesgo elevado.";
  return "Trauma muy grave. Pronóstico reservado.";
});

const openModal = () => modal.value?.showModal();
const closeModal = () => modal.value?.close();
</script>
