export type MassUnit = 'mcg' | 'mg' | 'g' | 'UI'
export type TimeUnit = 'min' | 'h' | 'bolo'

export function massToMg(value: number, unit: MassUnit): number {
  switch (unit) {
    case 'mcg': return value * 0.001
    case 'mg':  return value
    case 'g':   return value * 1000
    case 'UI':  return value   // UI quedan como escalar; la concentración ya es en UI/ml
    default: throw new Error(`Unidad desconocida: ${unit}`)
  }
}

// Convierte strings como "2 g", "300 mg", "500 mcg", "10.000 UI"
export function parseQuantityString(str: string): { value: number; unit: MassUnit } | null {
  if (!str?.trim()) return null
  // Eliminar separador de miles español (punto antes de 3 dígitos seguido de no-dígito o fin)
  const cleaned = str.trim().replace(/\.(?=\d{3}(?:[^\d]|$))/g, '').replace(',', '.')
  const match = cleaned.match(/^([\d.]+)\s*(mcg|µg|μg|mg|g|UI|U\.I\.|IU)\b/i)
  if (!match) return null
  const value = parseFloat(match[1])
  if (isNaN(value) || value < 0) return null
  const rawUnit = match[2].toLowerCase().replace(/\./g, '')
  let unit: MassUnit
  switch (rawUnit) {
    case 'mcg': case 'µg': case 'μg': unit = 'mcg'; break
    case 'mg': unit = 'mg'; break
    case 'g':  unit = 'g';  break
    case 'ui': case 'iu':  unit = 'UI'; break
    default: return null
  }
  return { value, unit }
}

export function parseQuantityToMg(str: string): number | null {
  const parsed = parseQuantityString(str)
  if (!parsed) return null
  return massToMg(parsed.value, parsed.unit)
}

function trimNum(n: number, decimals: number): string {
  return parseFloat(n.toFixed(decimals)).toString()
}

export function formatMg(mg: number): string {
  if (mg >= 1_000_000) return `${trimNum(mg / 1_000_000, 3)} kg`
  if (mg >= 1000)      return `${trimNum(mg / 1000, 3)} g`
  if (mg < 0.001)      return `${trimNum(mg * 1_000_000, 1)} mcg (total)`
  return `${trimNum(mg, 3)} mg`
}
