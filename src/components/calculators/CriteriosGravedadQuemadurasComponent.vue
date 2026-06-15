<template>
  <div class="calc-wrapper">
    <button class="btn-glow" @click="openModal">{{ label }}</button>

    <dialog ref="modal">
      <h2>{{ data.titulo }}</h2>
      <p class="cgq-sub">Clasificación de la American Burn Association (ABA). Aplica a pacientes adultos y pediátricos.</p>

      <div
        v-for="cat in data.categorias"
        :key="cat.nombre"
        class="grav-cat"
        :class="`grav-${cat.color}`"
      >
        <h3 class="grav-name">{{ cat.nombre }}</h3>
        <ul>
          <li v-for="(c, i) in cat.criterios" :key="i">{{ c }}</li>
        </ul>
      </div>

      <p class="cgq-note">
        Para el cálculo de la superficie quemada en niños, usa la calculadora
        <strong>SCQ Pediátrica · Lund-Browder</strong>.
      </p>

      <form method="dialog">
        <button class="btn-glow">Cerrar</button>
      </form>
    </dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import quemados from '../../collections/quemados.json';

defineProps({
  label: { type: String, default: 'Criterios de Gravedad' },
});

const data = quemados.QUEMADOS.Criterios_de_gravedad;
const modal = ref(null);

const openModal = () => modal.value?.showModal();
</script>

<style scoped>
.cgq-sub {
  font-size: 0.85rem;
  color: rgba(228, 239, 248, 0.6);
  margin: 0 0 1rem;
}

.grav-cat {
  border-left: 3px solid var(--gc, #2d9cdb);
  background: rgba(5, 16, 30, 0.45);
  border-radius: 0 8px 8px 0;
  padding: 0.75rem 1rem;
  margin-bottom: 0.85rem;
}
.grav-name {
  margin: 0 0 0.3rem;
  color: var(--gc);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 1rem;
}
.grav-cat ul { margin-top: 0.3rem; }
.grav-cat li { font-size: 0.85rem; }
.grav-success  { --gc: #34d399; }
.grav-orange   { --gc: var(--neon-orange); }
.grav-critical { --gc: #f87171; }

.cgq-note {
  font-size: 0.82rem;
  color: rgba(228, 239, 248, 0.5);
  font-style: italic;
  margin: 0.5rem 0 1rem;
}
</style>
