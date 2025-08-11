"use client"

// Inyecta una capa ligera de variables CSS para look & feel enterprise sin tocar tu globals.css.
// Puedes ajustar colores, radios, densidad y tipografía desde aquí.
export function EnterpriseTokens() {
  return (
    <style
      // global para que aplique a la página actual
      // Nota: si prefieres, movemos esto a layout o a un CSS global.
      jsx
      global
    >{`
      :root {
        --ent-radius: 10px;
        --ent-card-padding: 14px;
        --ent-table-row-padding-y: 10px;
        --ent-table-row-padding-x: 12px;
        --ent-chip-bg: hsl(240 4.8% 95.9%);
        --ent-chip-fg: hsl(240 5.9% 10%);
        --ent-accent: 210 6% 12%;
        --ent-accent-2: 210 6% 35%;
      }
      .ent-card { border-radius: var(--ent-radius); }
      .ent-compact td, .ent-compact th { padding-top: var(--ent-table-row-padding-y); padding-bottom: var(--ent-table-row-padding-y); }
      .ent-compact td, .ent-compact th { padding-left: var(--ent-table-row-padding-x); padding-right: var(--ent-table-row-padding-x); }
      .chip {
        background: var(--ent-chip-bg);
        color: var(--ent-chip-fg);
        border: 1px solid hsl(220 13% 91%);
        border-radius: 9999px;
        padding: 2px 8px;
        font-size: 12px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .chip button { font-size: 12px; opacity: .7 }
      .chip button:hover { opacity: 1 }
    `}</style>
  )
}
