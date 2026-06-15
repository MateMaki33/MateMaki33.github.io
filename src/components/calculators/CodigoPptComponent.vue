<template>
  <button class="btn calc-trigger" @click="openModal">
    <span class="trigger-tag">Checklist</span>
    Código PPT · Activación
  </button>

  <dialog ref="modal" class="ppt-dialog">
    <h2>Código PPT — Trauma Potencial</h2>
    <p class="calc-hint">
      Valoración <strong>ordenada y excluyente</strong> (P0 → P3). Marca los criterios
      presentes: en cuanto se cumple uno se activa y dejan de evaluarse las prioridades inferiores.
    </p>

    <ol class="prio-flow">
      <li
        v-for="(prio, pi) in prioridades"
        :key="prio.nivel"
        class="prio"
        :class="[`c-${prio.color}`, stateClass(pi)]"
      >
        <div class="prio-bar">
          <span class="prio-head">
            <span class="prio-nivel">{{ prio.nivel }}</span>
            <span class="prio-sub">{{ prio.subtitulo }}</span>
          </span>
          <span class="prio-state" v-if="stateLabel(pi)">{{ stateLabel(pi) }}</span>
          <span class="prio-destino" v-else>{{ prio.destino }}</span>
        </div>

        <div class="crit-group">
          <label
            v-for="(crit, ci) in prio.criterios"
            :key="ci"
            class="crit"
            :class="{ on: checked[`${pi}-${ci}`], locked: !interactive(pi) }"
          >
            <input
              type="checkbox"
              v-model="checked[`${pi}-${ci}`]"
              :disabled="!interactive(pi)"
            />
            <span class="box" aria-hidden="true"></span>
            <span class="crit-text">{{ crit }}</span>
          </label>

          <p v-if="prio.nota" class="prio-nota">{{ prio.nota }}</p>
        </div>
      </li>
    </ol>

    <div class="result" :class="resultClass">
      <div class="result-icon">{{ activado ? '!' : '○' }}</div>
      <div class="result-body">
        <div class="result-title">{{ resultTitle }}</div>
        <div class="result-detail">{{ resultDetail }}</div>
      </div>
    </div>

    <form method="dialog" @submit.prevent>
      <div class="calc-actions">
        <button class="btn-ghost" type="button" @click="reset">Reiniciar</button>
        <button class="btn-glow" type="button" @click="closeModal">Cerrar</button>
      </div>
    </form>
  </dialog>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import data from '../../collections/trauma_pediatrico.json';

const ped = data.trauma_pediatrico;
const modal = ref(null);
const prioridades = ped.codigo_ppt.prioridades;

const initChecked = () => {
  const o = {};
  prioridades.forEach((p, pi) => p.criterios.forEach((_, ci) => { o[`${pi}-${ci}`] = false; }));
  return o;
};
const checked = reactive(initChecked());

// Prioridad disparadora = la más alta (menor índice, P0 evalúa primero) con algún criterio marcado
const triggeredPrio = computed(() =>
  prioridades.findIndex((p, pi) => p.criterios.some((_, ci) => checked[`${pi}-${ci}`]))
);
const activado = computed(() => triggeredPrio.value !== -1);

// Una vez activado, las prioridades por debajo de la disparadora ya no se evalúan → bloqueadas
const interactive = (pi) => !activado.value || pi <= triggeredPrio.value;

const stateLabel = (pi) => {
  if (!activado.value) return '';
  if (pi === triggeredPrio.value) return 'Cumple · activar';
  if (pi > triggeredPrio.value) return 'No se evalúa';
  return '';
};
const stateClass = (pi) => {
  if (activado.value && pi === triggeredPrio.value) return 'triggered';
  if (activado.value && pi > triggeredPrio.value) return 'locked';
  return 'active';
};

const resultClass = computed(() =>
  activado.value ? `r-${prioridades[triggeredPrio.value].color}` : 'r-pending'
);
const resultTitle = computed(() =>
  activado.value ? 'Código PPT ACTIVADO' : 'Sin criterios marcados'
);
const resultDetail = computed(() => {
  if (activado.value) {
    const p = prioridades[triggeredPrio.value];
    return `${p.nivel} (${p.subtitulo}) cumplida → Traslado a ${p.destino}.`;
  }
  return 'Si no se cumple ningún criterio, no se activa el Código PPT.';
});

const reset = () => Object.assign(checked, initChecked());
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
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}
.prio.c-critical { --accent: #ef4444; }
.prio.c-orange   { --accent: var(--neon-orange); }
.prio.c-cyan     { --accent: var(--color-primary); }
.prio.triggered  { box-shadow: 0 0 18px -4px var(--accent); border-color: var(--accent); }
.prio.locked     { opacity: 0.45; }

.prio-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.85rem;
}
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
.prio-destino,
.prio-state {
  font-family: var(--font-display);
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(228, 239, 248, 0.35);
  white-space: nowrap;
}
.prio.triggered .prio-state { color: var(--accent); font-weight: 700; }

.crit {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.85rem;
  border-top: 1px solid rgba(45, 156, 219, 0.1);
  cursor: pointer;
  transition: background 0.15s ease;
}
.crit:hover { background: rgba(45, 156, 219, 0.05); }
.crit.on { background: rgba(45, 156, 219, 0.07); }
.crit.locked { cursor: not-allowed; }
.crit.locked:hover { background: transparent; }
.crit.locked .box { opacity: 0.4; }
.crit.locked .crit-text { color: rgba(228, 239, 248, 0.5); }
.crit input { position: absolute; opacity: 0; pointer-events: none; width: 0; height: 0; }
.box {
  flex-shrink: 0;
  width: 1.15rem;
  height: 1.15rem;
  margin-top: 0.1rem;
  border: 1.5px solid rgba(45, 156, 219, 0.45);
  border-radius: 5px;
  position: relative;
  transition: all 0.15s ease;
}
.crit.on .box {
  background: var(--accent);
  border-color: var(--accent);
}
.crit.on .box::after {
  content: '';
  position: absolute;
  left: 0.34rem;
  top: 0.12rem;
  width: 0.28rem;
  height: 0.55rem;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}
.crit-text {
  font-size: 0.85rem;
  line-height: 1.35;
  color: rgba(228, 239, 248, 0.85);
}
.crit.on .crit-text { color: #fff; }

.prio-nota {
  margin: 0;
  padding: 0.55rem 0.85rem;
  font-size: 0.76rem;
  font-style: italic;
  color: rgba(228, 239, 248, 0.5);
  border-top: 1px solid rgba(45, 156, 219, 0.1);
}

.result {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  margin: 1.1rem 0 0.75rem;
  border: 1px solid;
  transition: all 0.3s ease;
}
.result-icon {
  font-family: var(--font-mono);
  font-size: 1.8rem;
  font-weight: 700;
  width: 2.6rem;
  height: 2.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}
.result-title {
  font-family: var(--font-display);
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}
.result-detail { font-size: 0.82rem; line-height: 1.4; opacity: 0.85; }

.r-pending { background: rgba(45, 156, 219, 0.06); border-color: rgba(45, 156, 219, 0.25); }
.r-pending .result-icon { background: rgba(45, 156, 219, 0.12); color: var(--color-subtitle); }
.r-pending .result-title { color: var(--color-subtitle); }
.r-critical { background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.4); }
.r-critical .result-icon { background: rgba(239, 68, 68, 0.18); color: #f87171; }
.r-critical .result-title { color: #fca5a5; }
.r-orange { background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.4); }
.r-orange .result-icon { background: rgba(245, 158, 11, 0.18); color: var(--neon-glow); }
.r-orange .result-title { color: var(--neon-glow); }
.r-cyan { background: rgba(45, 156, 219, 0.1); border-color: rgba(45, 156, 219, 0.4); }
.r-cyan .result-icon { background: rgba(45, 156, 219, 0.18); color: var(--color-subtitle); }
.r-cyan .result-title { color: var(--color-subtitle); }
</style>
