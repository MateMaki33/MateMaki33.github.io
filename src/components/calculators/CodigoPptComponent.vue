<template>
  <button class="btn calc-trigger" @click="openModal">
    <span class="trigger-tag">Referencia</span>
    Código PPT · Criterios
  </button>

  <dialog ref="modal" class="ppt-dialog">
    <h2>Código PPT — Trauma Potencial</h2>
    <p class="calc-hint">
      Valoración <strong>ordenada y excluyente</strong> (P0 → P3): en cuanto se cumple un criterio
      de la prioridad más alta, se activa esa prioridad y no se valoran las inferiores. Tabla de
      referencia — la activación la determina el clínico.
    </p>

    <ol class="prio-flow">
      <li v-for="prio in prioridades" :key="prio.nivel" class="prio" :class="`c-${prio.color}`">
        <div class="prio-bar">
          <span class="prio-head">
            <span class="prio-nivel">{{ prio.nivel }}</span>
            <span class="prio-sub">{{ prio.subtitulo }}</span>
          </span>
          <span class="prio-destino">{{ prio.destino }}</span>
        </div>

        <ul class="crit-list">
          <li v-for="(crit, ci) in prio.criterios" :key="ci">{{ crit }}</li>
        </ul>

        <p v-if="prio.nota" class="prio-nota">{{ prio.nota }}</p>
      </li>
    </ol>

    <form method="dialog" @submit.prevent>
      <button class="btn-glow" type="button" @click="closeModal">Cerrar</button>
    </form>
  </dialog>
</template>

<script setup>
import { ref } from 'vue';
import data from '../../collections/trauma_pediatrico.json';

const ped = data.trauma_pediatrico;
const modal = ref(null);
const prioridades = ped.codigo_ppt.prioridades;

const openModal = () => modal.value?.showModal();
const closeModal = () => modal.value?.close();
</script>

<style scoped>
.prio-flow { display: flex; flex-direction: column; gap: 0.6rem; list-style: none; margin: 0; padding: 0; }

.prio {
  padding: 1rem;
  border: 1px solid rgba(45, 156, 219, 0.2);
  border-left: 3px solid var(--accent, #2d9cdb);
  border-radius: 8px;
  background: rgba(5, 16, 30, 0.4);
}
.prio.c-critical { --accent: #ef4444; }
.prio.c-orange   { --accent: var(--neon-orange); }
.prio.c-cyan     { --accent: var(--color-primary); }

.prio-bar { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.5rem; flex-wrap: wrap; }
.prio-head { display: flex; flex-direction: column; gap: 0.05rem; flex: 1; min-width: 0; }
.prio-nivel {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.92rem;
  letter-spacing: 0.04em;
  color: var(--accent);
  text-transform: uppercase;
}
.prio-sub { font-size: 0.74rem; color: rgba(228, 239, 248, 0.55); }
.prio-destino {
  font-family: var(--font-display);
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(228, 239, 248, 0.5);
  white-space: nowrap;
}

.crit-list { margin: 0; padding-left: 1.1rem; }
.crit-list li { font-size: 0.85rem; line-height: 1.4; color: rgba(228, 239, 248, 0.85); margin-bottom: 0.2rem; }

.prio-nota {
  margin: 0.4rem 0 0;
  font-size: 0.76rem;
  font-style: italic;
  color: rgba(228, 239, 248, 0.5);
}
</style>
