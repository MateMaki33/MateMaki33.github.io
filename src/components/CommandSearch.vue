<template>
  <div class="cmd" :class="{ 'cmd--active': open }">
    <div class="cmd-field">
      <span class="cmd-icon" aria-hidden="true">⌕</span>
      <input
        ref="input"
        v-model="query"
        class="cmd-input"
        type="text"
        placeholder="Buscar código, escala o fármaco…"
        autocomplete="off"
        spellcheck="false"
        role="combobox"
        aria-expanded="true"
        aria-controls="cmd-results"
        @keydown.down.prevent="move(1)"
        @keydown.up.prevent="move(-1)"
        @keydown.enter.prevent="go(results[active])"
        @keydown.esc="clear"
        @focus="open = true"
      />
      <kbd v-if="!query" class="cmd-kbd">/</kbd>
      <button v-else class="cmd-clear" type="button" title="Limpiar" @click="clear">✕</button>
    </div>

    <ul v-if="query" id="cmd-results" class="cmd-results" role="listbox">
      <li v-if="!results.length" class="cmd-empty">Sin resultados para “{{ query }}”.</li>
      <li
        v-for="(r, i) in results"
        :key="r.kind + r.url"
        :class="['cmd-item', { 'is-active': i === active }]"
        role="option"
        :aria-selected="i === active"
        @mouseenter="active = i"
      >
        <a :href="r.url" class="cmd-link" @click="open = false">
          <span class="cmd-tag" :style="{ '--tag': r.color }">{{ r.tagLabel }}</span>
          <span class="cmd-main">
            <span class="cmd-label" v-html="r.highlight"></span>
            <span v-if="r.sub" class="cmd-sub">{{ r.sub }}</span>
          </span>
          <span class="cmd-go" aria-hidden="true">↵</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import codigos from '../data/codigos';
import escalas from '../data/escalas';
import medicamentos from '../collections/medicamentos_normalizados.json';

type Kind = 'codigo' | 'escala' | 'farmaco';
interface Entry {
  kind: Kind;
  tagLabel: string;
  color: string;
  label: string;
  sub?: string;
  url: string;
  haystack: string;
}

const TAGS: Record<Kind, { label: string; color: string }> = {
  codigo:  { label: 'Código',  color: '#56ccf2' },
  escala:  { label: 'Escala',  color: '#a78bfa' },
  farmaco: { label: 'Fármaco', color: '#34d399' },
};

const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// ── Build the flat index once ──────────────────────────────────────
const index: Entry[] = [
  ...codigos.map((c) => ({
    kind: 'codigo' as const,
    tagLabel: c.system ? `Código · ${c.system}` : 'Código',
    color: c.accent ?? TAGS.codigo.color,
    label: `Código ${c.label}`,
    sub: c.desc,
    url: `/codigos/${c.id}`,
    haystack: norm(`codigo ${c.label} ${c.system ?? ''} ${c.desc ?? ''}`),
  })),
  ...escalas.map((e) => ({
    kind: 'escala' as const,
    tagLabel: TAGS.escala.label,
    color: TAGS.escala.color,
    label: e.label,
    sub: 'Escala / calculadora',
    url: `/escalas/${e.id}`,
    haystack: norm(`escala ${e.label}`),
  })),
  ...(medicamentos as Array<{ nombre: string; marcas?: string[] }>).map((m) => ({
    kind: 'farmaco' as const,
    tagLabel: TAGS.farmaco.label,
    color: TAGS.farmaco.color,
    label: m.nombre,
    sub: m.marcas?.length ? m.marcas.join(' · ') : undefined,
    url: `/farmacos?buscar=${encodeURIComponent(m.nombre)}`,
    haystack: norm(`${m.nombre} ${(m.marcas ?? []).join(' ')}`),
  })),
];

const query = ref('');
const active = ref(0);
const open = ref(false);
const input = ref<HTMLInputElement | null>(null);

const results = computed<(Entry & { highlight: string })[]>(() => {
  const q = norm(query.value.trim());
  if (!q) return [];
  const terms = q.split(/\s+/);
  const scored = index
    .map((e) => {
      if (!terms.every((t) => e.haystack.includes(t))) return null;
      // rank: prefix match on the label wins, then earliest position
      const pos = e.haystack.indexOf(terms[0]);
      const starts = e.haystack.startsWith(terms[0]) ? 0 : 1;
      return { e, rank: starts * 1000 + pos };
    })
    .filter((x): x is { e: Entry; rank: number } => x !== null)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 10);

  return scored.map(({ e }) => ({ ...e, highlight: mark(e.label, query.value.trim()) }));
});

function mark(label: string, q: string) {
  const nl = norm(label);
  const i = nl.indexOf(norm(q));
  if (i < 0) return escapeHtml(label);
  return (
    escapeHtml(label.slice(0, i)) +
    '<mark>' + escapeHtml(label.slice(i, i + q.length)) + '</mark>' +
    escapeHtml(label.slice(i + q.length))
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
}

function move(dir: number) {
  if (!results.value.length) return;
  active.value = (active.value + dir + results.value.length) % results.value.length;
}

function go(r?: Entry) {
  if (!r) return;
  window.location.href = r.url;
}

function clear() {
  query.value = '';
  active.value = 0;
  input.value?.blur();
  open.value = false;
}

// Reset highlight to top whenever the query changes length meaningfully
function onGlobalKey(e: KeyboardEvent) {
  if (e.key === '/' && document.activeElement !== input.value) {
    const tag = (document.activeElement as HTMLElement | null)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    e.preventDefault();
    input.value?.focus();
  }
}

onMounted(() => {
  document.addEventListener('keydown', onGlobalKey);
});
onBeforeUnmount(() => document.removeEventListener('keydown', onGlobalKey));
</script>

<style scoped>
.cmd {
  width: 100%;
  max-width: 680px;
  position: relative;
  z-index: 30;
}

.cmd-field {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(5, 16, 30, 0.92);
  border: 1px solid rgba(45, 156, 219, 0.35);
  border-radius: 14px;
  padding: 0 1rem;
  height: 3.4rem;
  box-shadow: 0 4px 28px rgba(0, 0, 0, 0.45), inset 0 0 0 1px rgba(255, 255, 255, 0.02);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.cmd--active .cmd-field {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(45, 156, 219, 0.18), 0 8px 36px rgba(0, 0, 0, 0.5);
}

.cmd-icon {
  font-size: 1.45rem;
  color: var(--color-primary);
  line-height: 1;
  flex-shrink: 0;
}

.cmd-input {
  flex: 1;
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  height: auto;
  padding: 0;
  font-family: var(--font-display);
  font-size: 1.1rem;
  letter-spacing: 0.02em;
  color: var(--color-text);
}
.cmd-input:focus { outline: none; box-shadow: none !important; }

.cmd-kbd {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: rgba(228, 239, 248, 0.45);
  border: 1px solid rgba(45, 156, 219, 0.28);
  border-radius: 6px;
  padding: 0.1rem 0.5rem;
  flex-shrink: 0;
}

.cmd-clear {
  background: none;
  border: none;
  color: rgba(228, 239, 248, 0.5);
  cursor: pointer;
  font-size: 0.95rem;
  flex-shrink: 0;
  transition: color 0.15s ease;
}
.cmd-clear:hover { color: var(--color-subtitle); }

/* ── Results ── */
.cmd-results {
  list-style: none;
  margin: 0.6rem 0 0;
  padding: 0.4rem;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(8, 20, 38, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(45, 156, 219, 0.28);
  border-radius: 14px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.65);
  max-height: 60vh;
  overflow-y: auto;
  animation: cmdIn 0.16s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes cmdIn {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.cmd-empty {
  padding: 0.9rem 1rem;
  font-size: 0.9rem;
  color: rgba(228, 239, 248, 0.5);
}
.cmd-empty::before { display: none; }

.cmd-item { margin: 0; padding: 0; }
.cmd-item::before { display: none; }

.cmd-link {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.6rem 0.75rem;
  border-radius: 9px;
  text-decoration: none;
  color: var(--color-text);
}

.cmd-item.is-active .cmd-link {
  background: rgba(45, 156, 219, 0.14);
}

.cmd-tag {
  font-family: var(--font-display);
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--tag);
  background: color-mix(in srgb, var(--tag) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--tag) 40%, transparent);
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 5.5rem;
  text-align: center;
}

.cmd-main {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
  min-width: 0;
  flex: 1;
}

.cmd-label {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.02em;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cmd-label :deep(mark) {
  background: transparent;
  color: var(--color-subtitle);
  font-weight: 700;
}

.cmd-sub {
  font-size: 0.78rem;
  color: rgba(228, 239, 248, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cmd-go {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--color-primary);
  opacity: 0;
  flex-shrink: 0;
}
.cmd-item.is-active .cmd-go { opacity: 0.8; }

@media (max-width: 600px) {
  .cmd-tag { min-width: 4.2rem; font-size: 0.56rem; padding: 0.22rem 0.35rem; }
  .cmd-input { font-size: 1rem; }
}
</style>
