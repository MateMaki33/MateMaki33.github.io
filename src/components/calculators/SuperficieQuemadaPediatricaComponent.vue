<template>
  <div class="calc-wrapper">
    <button class="btn-glow" @click="openModal">SCQ Pediátrica · Lund-Browder</button>

    <dialog ref="modal">
      <h2>Superficie Corporal Quemada (Lund-Browder)</h2>
      <p class="calc-hint">
        Referencia — % de superficie corporal por región y franja de edad. La suma y el cálculo de
        reposición hídrica los realiza el clínico.
      </p>

      <div class="scq-table-wrap">
        <table class="scq-table">
          <thead>
            <tr>
              <th>Región</th>
              <th v-for="b in brackets" :key="b">{{ b }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in regiones" :key="r.nombre">
              <td>{{ r.nombre }}</td>
              <td v-for="(v, i) in r.vals" :key="i">{{ v }}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="calc-hint">
        Parkland: 4 × peso (kg) × % SCQ = ml en 24h (mitad en las primeras 8h). Ringer lactato +
        necesidades basales de mantenimiento en el niño.
      </p>

      <button class="btn-glow" type="button" @click="closeModal">Cerrar</button>
    </dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';

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

const openModal = () => modal.value?.showModal();
const closeModal = () => modal.value?.close();
</script>

<style scoped>
.scq-table-wrap { overflow-x: auto; margin-bottom: 0.9rem; }
.scq-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.scq-table th, .scq-table td {
  padding: 0.4rem 0.55rem;
  text-align: center;
  border-bottom: 1px solid rgba(45, 156, 219, 0.14);
  white-space: nowrap;
}
.scq-table th {
  color: var(--color-subtitle);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.72rem;
  text-transform: uppercase;
}
.scq-table td:first-child, .scq-table th:first-child { text-align: left; }
</style>
