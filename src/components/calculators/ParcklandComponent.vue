<template>
  <div class="grid">
    <button class="btn-glow" @click="openModal">Fórmula de Parkland</button>

    <dialog ref="modal">
      <h2>Reposición hídrica (Parkland)</h2>
      <form method="dialog" @submit.prevent>
        <div class="form-group">
          <label>Peso (kg):</label>
          <input type="number" v-model.number="peso" min="0" placeholder="Ej. 70" />
        </div>

        <div class="form-group">
          <label>% SCQ quemada:</label>
          <input type="number" v-model.number="scq" min="0" max="100" placeholder="Ej. 30" />
        </div>

        <div class="score" v-if="volumenTotal">
          <p><strong>Volumen total:</strong> {{ volumenTotal }} ml</p>
          <p><strong>Primeras 8h:</strong> {{ mitad }} ml</p>
          <p><strong>Siguientes 16h:</strong> {{ mitad }} ml</p>
          <p class="text-muted">Desde el momento de la quemadura.</p>
        </div>

        <button class="btn-glow" @click="closeModal">Cerrar</button>
      </form>
    </dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const modal = ref(null)

const peso = ref(70)
const scq = ref(0)

const volumenTotal = computed(() => {
  if (!peso.value || !scq.value) return null
  return Math.round(4 * peso.value * scq.value)
})

const mitad = computed(() => {
  return volumenTotal.value ? Math.round(volumenTotal.value / 2) : null
})

const openModal = () => modal.value?.showModal()
const closeModal = () => modal.value?.close()
</script>

<style scoped>
.text-muted {
  font-size: 0.82rem;
  color: rgba(228, 239, 248, 0.45);
  margin-top: 0.35rem;
}
</style>
