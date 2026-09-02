<template>
  <div class="grid">
    <button class="btn-glow" @click="openModal">Trauma SCORE</button>

    <dialog ref="modal">
      <h2>Trauma SCORE Revisado (RTS)</h2>
      <p class="calc-hint">
        RTS = 0,9368 × puntos Glasgow + 0,7326 × puntos TAS + 0,2908 × puntos FR. Referencia — el
        clínico aplica la fórmula.
      </p>

      <div class="rts-block">
        <h3>Glasgow</h3>
        <ul>
          <li>13-15 — 4 puntos</li>
          <li>9-12 — 3 puntos</li>
          <li>6-8 — 2 puntos</li>
          <li>4-5 — 1 punto</li>
          <li>3 — 0 puntos</li>
        </ul>
      </div>

      <div class="rts-block">
        <h3>Tensión sistólica (mmHg)</h3>
        <ul>
          <li>&gt;89 — 4 puntos</li>
          <li>76-89 — 3 puntos</li>
          <li>50-75 — 2 puntos</li>
          <li>1-49 — 1 punto</li>
          <li>0 — 0 puntos</li>
        </ul>
      </div>

      <div class="rts-block">
        <h3>Frecuencia respiratoria (rpm)</h3>
        <ul>
          <li>10-29 — 4 puntos</li>
          <li>&gt;29 — 3 puntos</li>
          <li>6-9 — 2 puntos</li>
          <li>1-5 — 1 punto</li>
          <li>0 — 0 puntos</li>
        </ul>
      </div>

      <p class="calc-hint">Referencia: ≥7,84 leve · 6-7,84 moderado · 4-6 grave · &lt;4 muy grave.</p>

      <button class="btn-glow" @click="closeModal">Cerrar</button>
    </dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const modal = ref(null)
const openModal = () => modal.value?.showModal()
const closeModal = () => modal.value?.close()
</script>

<style scoped>
.rts-block { margin-bottom: 0.85rem; }
.rts-block h3 {
  font-family: var(--font-display);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-subtitle);
  margin: 0 0 0.3rem;
}
</style>
