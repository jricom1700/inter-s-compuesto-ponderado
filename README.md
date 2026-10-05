#  Calculadora de Interés Compuesto y Tasa Ponderada

Simulador financiero diseñado para modelar con precisión el rendimiento de portafolios distribuidos en múltiples instrumentos y cuentas de renta fija en México. 

A diferencia de las calculadoras tradicionales que asumen una tasa plana, esta herramienta permite configurar **tasas diferenciadas** y **límites máximos de saldo por cuenta**, calculando la **tasa ponderada real** y proyectando el crecimiento compuesto del capital de forma realista.

---

##  ¿Qué problema resuelve?

En México, muchas opciones de inversión y cuentas de ahorro remuneradas manejan condiciones segmentadas:
- Una tasa promocional o alta hasta cierto monto tope (límite de saldo).
- Rendimiento reducido o nulo para el capital excedente.
- Diferentes frecuencias de capitalización según la entidad.

Esta calculadora permite simular escenarios reales donde el dinero se reparte entre varias instituciones, respetando los topes individuales y mostrando cuál es el rendimiento efectivo global de todo tu portafolio.

---

## Características

- **Límites de Saldo por Cuenta:** Configura topes máximos por institución para calcular rendimientos únicamente sobre el monto permitido a cada tasa.
- **Tasa Ponderada Real:** Obtén la tasa global efectiva que realmente genera tu capital considerando la distribución entre todas las cuentas.
- **Interés Compuesto Dinámico:** Simulación de reinversión periódica para observar el crecimiento del patrimonio a través del tiempo.
- **Comparativa Multi-Instrumento:** Modela escenarios combinando distintos montos y tasas para optimizar la asignación de tu dinero.
- **Persistencia en Navegador:** Guarda tus configuraciones y distribuciones localmente mediante `localStorage` sin enviar información privada a servidores externos.

---

##  Tecnologías

- **Framework:** [Astro](https://astro.build/)
- **Frontend / Lógica:** TypeScript / React
- **Estilos:** Tailwind CSS
- **Módulos:** Cálculos financieros puros (`src/utils/finance.ts`) y almacenamiento local (`src/utils/storage.ts`)

---

## Instalación y Uso Local

1. **Clonar repositorio:**
   ```bash
   git clone [https://github.com/jricom1700/inter-s-compuesto-ponderado.git](https://github.com/jricom1700/inter-s-compuesto-ponderado.git)
   cd inter-s-compuesto-ponderado