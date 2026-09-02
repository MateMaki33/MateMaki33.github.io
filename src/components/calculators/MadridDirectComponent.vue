<template>
  <div class="grid">
    <button class="btn-glow" @click="openModal">Escala Madrid Direct</button>

    <dialog ref="modal">
      <h2>Escala Madrid Direct</h2>
      <p class="calc-hint">Referencia — el clínico calcula la puntuación total.</p>

      <div v-for="(item, index) in escalaItems.slice(0, 5)" :key="index" class="md-item">
        <span class="md-label">{{ item.nombre }}</span>
        <ul>
          <li v-for="p in item.puntos" :key="p.valor">{{ p.descripcion }} — {{ p.valor }}</li>
        </ul>
      </div>

      <div class="md-item">
        <span class="md-label">Penalizaciones</span>
        <ul>
          <li>TAS 180-189 mmHg — −1</li>
          <li>TAS 190-199 mmHg — −2</li>
          <li>TAS 200-209 mmHg — −3</li>
          <li>TAS &gt;209 mmHg — −4</li>
          <li>Edad &gt;85 años — −1 por cada año por encima de 85</li>
        </ul>
      </div>

      <div class="md-item">
        <span class="md-label">Interpretación</span>
        <ul>
          <li v-for="i in interpretacionPuntos" :key="i.rango">{{ i.rango }} → {{ i.accion }}</li>
        </ul>
      </div>

      <button class="btn-glow" @click="closeModal">Cerrar</button>
    </dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ictusData from '../../collections/ictus.json'

const modal = ref(null)
const escalaItems = ictusData.codigo_ictus.evaluacion_inicial.escala_madrid_direct.items
const interpretacionPuntos = ictusData.codigo_ictus.evaluacion_inicial.escala_madrid_direct.interpretacion_puntuacion

const openModal = () => modal.value?.showModal()
const closeModal = () => modal.value?.close()
</script>

<style scoped>
.md-item { margin-bottom: 0.8rem; }
.md-label {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.82rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-subtitle);
}
</style>
