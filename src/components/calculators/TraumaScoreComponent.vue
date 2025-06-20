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
          <p>Supervivencia: <strong>{{ tsr.ps }}</strong></p>
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
  // Valores base
  const frScore = (() => {
    if (fr.value > 29) return 4;
    if (fr.value >= 10 && fr.value <= 29) return 4;
    if (fr.value >= 6 && fr.value <= 9) return 3;
    if (fr.value >= 1 && fr.value <= 5) return 2;
    if (fr.value === 0) return 0;
    return 0;
  })();

  const tasScore = (() => {
    if (tas.value > 89) return 4;
    if (tas.value >= 76) return 3;
    if (tas.value >= 50) return 2;
    if (tas.value >= 1) return 1;
    if (tas.value === 0) return 0;
    return 0;
  })();

  const glasgowScore = (() => {
    if (glasgow.value === 15) return 4;
    if (glasgow.value >= 13) return 3;
    if (glasgow.value >= 9) return 2;
    if (glasgow.value >= 6) return 1;
    if (glasgow.value < 6) return 0;
    return 0;
  })();

  // RTS ponderado (0 a 7.8408)
  const rts =
    (0.9368 * glasgowScore) +
    (0.7326 * tasScore) +
    (0.2908 * frScore);

  // Probabilidad de supervivencia (Ps)
  const b = -0.4499 + 0.8085 * rts;
  const ps = 1 / (1 + Math.exp(-b));

  return {
    rts: rts.toFixed(2),
    ps: (ps * 100).toFixed(1) + '%'
  };
});

const rtsInterpretacion = computed(()=>{
    const score = tsr.value.rts;
    if (score >= 7.84) return "Trauma leve. Alta probabilidad de supervivencia.";
    if (score >= 6) return "Trauma moderado. Vigilancia estrecha recomendada.";
    if (score >= 4) return "Trauma grave. Riesgo vital. Requiere atención urgente.";
    return "Trauma muy grave. Estado crítico.";
});

const openModal = () => modal.value?.showModal()
const closeModal = () => modal.value?.close()
</script>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  gap: 1rem;
}

input {
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #ff9900;
  background-color: #1a1a1a;
  color: #fff7e6;
  height: 3rem;
  font-size: 1.25rem;
  box-shadow: 0 0 5px #ff9900;
  transition: all 0.3s ease;
}

input:focus {
  outline: none;
  border-color: #ffae42;
  box-shadow: 0 0 12px #ffaa33;
}

.score {
  margin: 1rem 0;
  font-size: 1.25rem;
  color: #ffc266;
}

label {
  font-size: var(--font-size-li);
  color: #ffcc99;
}

/* Animación del botón */
.btn-glow {
  position: relative;
  padding: 1rem 2rem;
  color: #fff8f0;
  background: #1a1a1a;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: bold;
  overflow: hidden;
  z-index: 1;
  box-shadow: 0 0 15px rgba(255, 140, 0, 0.4);
  transition: transform 0.3s ease;
}

.btn-glow:hover {
  transform: scale(1.05);
}

.btn-glow::before {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    from 0deg,
    #ff9900,
    #ffaa33,
    #ff6600,
    #ff9900
  );
  animation: spin 3s linear infinite;
  z-index: -1;
  border-radius: 50%;
}

.btn-glow::after {
  content: "";
  position: absolute;
  inset: 2px;
  background: #1a1a1a;
  border-radius: 10px;
  z-index: -1;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Quitar flechas de inputs number */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
