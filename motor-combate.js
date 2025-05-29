/**
 * Motor de combate RPG modular y funcional
 * - Incluye flying text, actualización de barras y menús limpios
 * - Turnos uno a uno, por velocidad.
 * - IA básica para enemigos.
 * - Integrado con helpers de UI.
 */

// ------------------------------------
// EFECTOS DE TURNO (Estados periódicos)
// ------------------------------------
function aplicarEfectosDeTurno(combatiente, helpers) {
  if (!combatiente.estados) return;
  for (let i = combatiente.estados.length - 1; i >= 0; i--) {
    const estado = combatiente.estados[i];
    switch (estado.tipo) {
      case "Veneno":
        {
          const daño = Math.max(1, Math.floor(combatiente.stats.PV * 0.1));
          combatiente.pv = Math.max(0, combatiente.pv - daño);
          if (helpers && helpers.mostrarFlyingText) {
            helpers.mostrarFlyingText(combatiente, `-${daño}`, "daño");
          }
        }
        break;
      case "Regeneracion":
        {
          const cura = Math.max(1, Math.floor(combatiente.stats.PV * 0.05));
          combatiente.pv = Math.min(combatiente.stats.PV, combatiente.pv + cura);
          if (helpers && helpers.mostrarFlyingText) {
            helpers.mostrarFlyingText(combatiente, `+${cura}`, "cura");
          }
        }
        break;
      // Más efectos periódicos...
    }
    // Actualiza duración y elimina si llega a 0
    if (estado.duracion !== undefined) {
      estado.duracion -= 1;
      if (estado.duracion <= 0) {
        combatiente.estados.splice(i, 1);
      }
    }
  }
}

// ------------------------------------
// GESTIÓN DE ESTADOS / BUFFS / DEBUFFS
// ------------------------------------
function añadirEstado(combatiente, efecto) {
  if (["Buff", "Debuff"].includes(efecto.tipo)) {
    const existente = combatiente.estados.find(e => e.tipo === efecto.tipo && e.stat === efecto.stat);
    if (existente) {
      if (efecto.duracion) existente.duracion = efecto.duracion;
      return;
    }
  }
  if (!combatiente.estados.some(e => e.tipo === efecto.tipo && (!efecto.stat || e.stat === efecto.stat))) {
    combatiente.estados.push({ ...efecto });
  }
}
function eliminarEstado(combatiente, tipo, stat = null) {
  combatiente.estados = combatiente.estados.filter(e => !(e.tipo === tipo && (!stat || e.stat === stat)));
}
function eliminarTodosEstadosNegativos(combatiente) {
  const negativos = [
    "Veneno", "Mudez", "Ceguera", "Paralizar", "Dormir", "Loco", "Maldecir", "Zombi", "Rana", "Cerdo",
    "Inmovil", "Petrificar", "Condena", "Lento", "Quietud", "Virus", "KO"
  ];
  combatiente.estados = combatiente.estados.filter(e => !negativos.includes(e.tipo));
}

// ------------------------------------
// ATAQUE FÍSICO
// ------------------------------------
function ataqueFisico(atacante, defensor, helpers) {
  let daño = Math.max(1, atacante.stats.FUE - defensor.stats.DEF);
  if (atacante.estados.some(e => e.tipo === "Buff" && e.stat === "FUE")) daño = Math.floor(daño * 1.5);
  if (defensor.estados.some(e => e.tipo === "Debuff" && e.stat === "DEF")) daño = Math.floor(daño * 1.2);
  defensor.pv = Math.max(0, defensor.pv - daño);
  if (helpers && helpers.mostrarFlyingText) {
    helpers.mostrarFlyingText(defensor, `-${daño}`, "daño");
  }
}

// ------------------------------------
// USO DE OBJETOS
// ------------------------------------
function usarObjeto(usuario, objetivo, objeto, helpers) {
  switch (objeto.tipo) {
    case "CurarPV":
      objetivo.pv = Math.min(objetivo.stats.PV, objetivo.pv + objeto.cantidad);
      if (helpers && helpers.mostrarFlyingText) {
        helpers.mostrarFlyingText(objetivo, `+${objeto.cantidad}`, "cura");
      }
      break;
    case "CurarPM":
      objetivo.pm = Math.min(objetivo.stats.PM, objetivo.pm + objeto.cantidad);
      // Puedes agregar flyingText para PM si quieres
      break;
    case "Resucitar":
      if (objetivo.pv <= 0) {
        objetivo.pv = Math.floor(objetivo.stats.PV * objeto.cantidad);
        if (helpers && helpers.mostrarFlyingText) {
          helpers.mostrarFlyingText(objetivo, `+${objetivo.pv}`, "cura");
        }
      }
      break;
    // Más tipos...
  }
}

// ------------------------------------
// DAÑO DE MAGIA Y RESOLUCIÓN DE EFECTOS
// ------------------------------------
function calcularDañoMagia(lanzador, objetivo, hechizo) {
  let daño = hechizo.formula ? hechizo.formula(lanzador, objetivo) : (hechizo.efectos[0]?.cantidad || 0);
  if (hechizo.elemento && objetivo.debilidades && objetivo.debilidades.includes(hechizo.elemento))
    daño = Math.floor(daño * 1.5);
  if (hechizo.elemento && objetivo.resistencias && objetivo.resistencias.includes(hechizo.elemento))
    daño = Math.floor(daño * 0.5);
  if (objetivo.estados.some(e => e.tipo === "EscudoElemento" && e.elemento === hechizo.elemento))
    daño = Math.floor(daño * 0.5);
  if (objetivo.estados.some(e => e.tipo === "Reves"))
    daño = -daño;
  return daño;
}

function lanzarHechizo({ hechizo, lanzador, aliados, enemigos, target, helpers }) {
  if (lanzador.pm < hechizo.costePM) {
    return false;
  }
  lanzador.pm -= hechizo.costePM;
  let objetivos = [];

  if (hechizo.nombre === "Hecatombe") {
    objetivos = [...aliados, ...enemigos];
  } else if (hechizo.efectos.some(e => e.objetivo === "Todos")) {
    objetivos = aliados.includes(lanzador) ? aliados : enemigos;
  } else {
    objetivos = [target];
  }

  for (const obj of objetivos) {
    for (const efecto of hechizo.efectos) {
      const cantidad = hechizo.formula ? hechizo.formula(lanzador, obj) : efecto.cantidad || 0;
      switch (efecto.tipo) {
        case "CurarPV":
          obj.pv = Math.min(obj.stats.PV, obj.pv + cantidad);
          if (helpers && helpers.mostrarFlyingText) helpers.mostrarFlyingText(obj, `+${cantidad}`, "cura");
          break;
        case "CurarPVTotal":
          obj.pv = obj.stats.PV;
          if (helpers && helpers.mostrarFlyingText) helpers.mostrarFlyingText(obj, `+${obj.stats.PV}`, "cura");
          break;
        case "Daño":
          let daño = calcularDañoMagia(lanzador, obj, hechizo);
          obj.pv = Math.max(0, obj.pv - daño);
          if (helpers && helpers.mostrarFlyingText) helpers.mostrarFlyingText(obj, `-${daño}`, "daño");
          break;
        case "DañoPorc":
          const dañoPorc = Math.floor(obj.pv * (efecto.porc || 0));
          obj.pv = Math.max(0, obj.pv - dañoPorc);
          if (helpers && helpers.mostrarFlyingText) helpers.mostrarFlyingText(obj, `-${dañoPorc}`, "daño");
          break;
        // Estados y efectos especiales
        default:
          if (["Veneno", "Regeneracion", "Mudez", "Ceguera", "Paralizar", "Maldecir", "Dormir", "Loco", "Zombi", "Rana", "Cerdo", "Inmovil", "Petrificar", "Condena", "Lento", "Quietud", "Virus", "KO", "Buff", "BuffDaño", "BuffResEstados", "EscudoElemento", "EscudoElemental", "EscudoEstados", "ReflejarMagia", "Debilidad", "Reves", "RoboVida", "RoboPM", "DobleMagia", "TripleMagia", "Provocacion", "Levita", "Regeneracion"].includes(efecto.tipo)) {
            añadirEstado(obj, { ...efecto });
          } else if (efecto.tipo === "CuraEstado") {
            eliminarEstado(obj, efecto.estado);
          } else if (efecto.tipo === "CuraTodosEstados") {
            eliminarTodosEstadosNegativos(obj);
          }
          // Más efectos...
      }
    }
  }
  return true;
}

// ------------------------------------
// IA BÁSICA PARA ENEMIGOS (opcional)
// ------------------------------------
function iaBasica(enemigo, heroes, enemigos) {
  if (enemigo.magias) {
    const cura = enemigo.magias.find(m => m.efectos.some(e => e.tipo === "CurarPV"));
    if (cura && enemigo.pv < enemigo.stats.PV / 2 && enemigo.pm >= cura.costePM) {
      return { tipo: "Magia", magia: cura, objetivo: enemigo };
    }
    const ofensiva = enemigo.magias.find(m => m.efectos.some(e => e.tipo === "Daño") && enemigo.pm >= m.costePM);
    if (ofensiva) {
      const vivos = heroes.filter(a => a.pv > 0);
      const target = vivos[Math.floor(Math.random() * vivos.length)];
      return { tipo: "Magia", magia: ofensiva, objetivo: target };
    }
  }
  const vivos = heroes.filter(a => a.pv > 0);
  const objetivo = vivos[Math.floor(Math.random() * vivos.length)];
  return { tipo: "Atacar", objetivo };
}

// ------------------------------------
// PROCESO DE TURNO
// ------------------------------------
async function procesarTurno(combatiente, aliados, enemigos, pedirAccionUsuario, helpers) {
  aplicarEfectosDeTurno(combatiente, helpers);
  if (combatiente.pv <= 0) return;
  if (combatiente.estados.some(e => e.tipo === "KO")) return;
  if (pedirAccionUsuario && combatiente.esJugador) {
    // El usuario decide la acción, la ejecutamos aquí
    const accion = await pedirAccionUsuario(combatiente, aliados, enemigos, []);
    if (!accion) return;
    switch (accion.tipo) {
      case "Atacar":
        ataqueFisico(combatiente, accion.objetivo, helpers);
        break;
      case "Magia":
        lanzarHechizo({
          hechizo: accion.magia,
          lanzador: combatiente,
          aliados,
          enemigos,
          target: accion.objetivo,
          helpers
        });
        break;
      case "Habilidad":
        // Si tienes habilidades activas, aquí deberías llamarlas
        // Puedes modelar igual que magia o ataque según tu sistema
        if (accion.habilidad?.tipo === "CurarPV") {
          accion.objetivo.pv = Math.min(accion.objetivo.stats.PV, accion.objetivo.pv + accion.habilidad.cantidad);
          if (helpers && helpers.mostrarFlyingText) helpers.mostrarFlyingText(accion.objetivo, `+${accion.habilidad.cantidad}`, "cura");
        } else if (accion.habilidad?.tipo === "Daño") {
          let daño = accion.habilidad.cantidad || 10;
          accion.objetivo.pv = Math.max(0, accion.objetivo.pv - daño);
          if (helpers && helpers.mostrarFlyingText) helpers.mostrarFlyingText(accion.objetivo, `-${daño}`, "daño");
        }
        // O amplía según tu sistema real
        break;
      case "Objeto":
        usarObjeto(combatiente, accion.objetivo, accion.objeto, helpers);
        break;
      case "Defender":
      case "Defensa":
      case "Guardia":
        añadirEstado(combatiente, { tipo: "Guardia", duracion: 1 });
        break;
      // ...más tipos según tu sistema
    }
    return;
  }
  // IA
  const accion = iaBasica(combatiente, aliados, enemigos);
  if (!accion) return;
  switch (accion.tipo) {
    case "Atacar":
      ataqueFisico(combatiente, accion.objetivo, helpers);
      break;
    case "Magia":
      lanzarHechizo({
        hechizo: accion.magia,
        lanzador: combatiente,
        aliados: enemigos,
        enemigos: aliados,
        target: accion.objetivo,
        helpers
      });
      break;
    case "Objeto":
      usarObjeto(combatiente, accion.objetivo, accion.objeto, helpers);
      break;
    // Más tipos...
  }
}

// ------------------------------------
// ORQUESTADOR DE COMBATE
// ------------------------------------
function siguienteCombatiente(turno, todos) {
  const vivosNoActuados = todos.filter(c => c.pv > 0 && !turno.has(c));
  if (!vivosNoActuados.length) return null;
  vivosNoActuados.sort((a, b) => b.stats.VEL - a.stats.VEL);
  return vivosNoActuados[0];
}

async function combate(heroes, enemigos, pedirAccionUsuario, helpers = {}) {
  for (let h of heroes) h.esJugador = true;
  for (let e of enemigos) e.esJugador = false;

  let ronda = 1;
  let finalizado = false;
  while (!finalizado) {
    const todos = [...heroes, ...enemigos].filter(c => c.pv > 0);
    let turno = new Set();
    let siguiente;
    while ((siguiente = siguienteCombatiente(turno, todos))) {
      turno.add(siguiente);
      const aliados = heroes.includes(siguiente) ? heroes : enemigos;
      const rivales = heroes.includes(siguiente) ? enemigos : heroes;
      await procesarTurno(siguiente, aliados, rivales, pedirAccionUsuario, helpers);

      // --- Actualiza barras visualmente tras cada turno ---
      if (helpers && helpers.animarBarra) {
        for (const p of [...heroes, ...enemigos]) {
          // Busca HUD por nombre o domId
          let hud = null;
          if (p.esJugador) {
            hud = Array.from(document.querySelectorAll('.personaje-hud'))
              .find(h => h.querySelector('.nombre').textContent.trim() === p.nombre);
          } else if (p.domId) {
            hud = document.getElementById('hud-' + p.domId);
          }
          if (hud) {
            // PV
            const pvBar = hud.querySelector('.pv-barra');
            if (pvBar) helpers.animarBarra(pvBar, Number(pvBar.querySelector('div').textContent.split(' / ')[0]), p.pv, p.stats.PV, "pv");
            // PM
            const pmBar = hud.querySelector('.pm-barra');
            if (pmBar && typeof p.pm === "number" && typeof p.stats.PM === "number")
              helpers.animarBarra(pmBar, Number(pmBar.querySelector('div').textContent.split(' / ')[0]), p.pm, p.stats.PM, "pm");
            // PH
            const phBar = hud.querySelector('.ph-barra');
            if (phBar && typeof p.ph === "number" && typeof p.stats.PH === "number")
              helpers.animarBarra(phBar, Number(phBar.querySelector('div').textContent.split(' / ')[0]), p.ph, p.stats.PH, "ph");
          }
        }
      }

      if (heroes.every(p => p.pv <= 0)) { finalizado = true; break; }
      if (enemigos.every(e => e.pv <= 0)) { finalizado = true; break; }
    }
    ronda++;
  }
}

// ------------------------------------
// EXPORTS
// ------------------------------------
export {
  aplicarEfectosDeTurno,
  añadirEstado,
  eliminarEstado,
  eliminarTodosEstadosNegativos,
  ataqueFisico,
  usarObjeto,
  lanzarHechizo,
  calcularDañoMagia,
  iaBasica,
  procesarTurno,
  combate,
};