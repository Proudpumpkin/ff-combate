import { PERSONAJES, ENEMIGOS } from './personajes-enemigos.js';
import { HECHIZOS, OBJETOS } from './hechizos-objetos-enlaces.js';
import { combate } from './motor-combate.js';

// Utilidad para clonar personajes/enemigos y sus estados
function clonarEquipo(eq) {
  return eq.map(p => ({
    ...p,
    estados: [...(p.estados || [])]
  }));
}

// Relación de botones a formaciones de enemigos (según tu HTML)
const formaciones = {
  1: ["enemy1"],
  2: ["enemy2-1", "enemy2-2", "enemy2-3"],
  3: ["enemy3-1", "enemy3-2"],
  4: ["enemy4"],
  5: ["enemy5"],
  6: ["enemy6"]
};

/*
 * --------------------------------------------------------------------------
 * NUEVO SISTEMA DE MENÚ DE COMBATE SEIRA (bloques exclusivos con submenú objetivo)
 * --------------------------------------------------------------------------
 */

/* --- DATOS VISUALES Y LÓGICA PARA EL MENÚ DE SEIRA --- */
const seiraCommands = [
    {
        key: "guard",
        title: "Guardia",
        actions: [
            {
                name: "Blasón de Escamas",
                icon: "img/skills/blason-escamas.png", // <-- PON AQUÍ LA RUTA REAL DEL ICONO
                desc: "Adopta una postura defensiva y reduce el daño recibido en un 25% hasta la próxima acción, regenera un 5% del PV máximo y recupera 1 PH.",
                target: "self"
            }
        ]
    },
    {
        key: "skills",
        title: "Habilidades",
        actions: [
            {
                name: "Ascenso Dracónido",
                icon: "img/skills/ascenso-draconido.png",
                desc: "Realiza un salto hacia el aire durante un turno en el cual se vuelve invulnerable a la mayoría de fuentes de daño, al siguiente turno cae sobre el objetivo. (2d6 + 5 + FUE) x 1.5. Consume 3 PH. Genera 1 acumulación de Ira Oceánica.",
                target: "enemy"
            },
            {
                name: "Respiro de Dragón",
                icon: "img/skills/respiro-dragon.png",
                desc: "Restaura al objetivo aliado una cantidad igual a sus PV actuales, también cura al usuario la mitad de dicha cura. No puede usarse sobre sí misma. Consume 2 PH. Genera 1 acumulación de Ira Oceánica.",
                target: "ally"
            },
            {
                name: "Oda al Mar",
                icon: "img/skills/oda-al-mar.png",
                desc: "Aumenta un 50% la FUE, la MAG y la VEL durante cinco turnos. Solo puede usarse sobre sí misma. Consume 2 PH. Genera 1 acumulación de Ira Oceánica.",
                target: "self"
            },
            {
                name: "Más y Más",
                icon: "img/skills/masymas.png",
                desc: "Concentra su energía para realizar una serie de golpes acrobáticos con la lanza que dañan a todos los enemigos. (2d8 + 5 + FUE) x 1.5. Consume 5 acumulaciones de Ira Oceánica.",
                target: "allEnemies"
            }
        ]
    },
    {
        key: "magic",
        title: "Magia",
        actions: [
            {
                name: "Aqua",
                icon: "img/magic/aqua.png",
                desc: "Daño leve de agua (2d4 + MAG) x 1.5. Consume 2 PM.",
                target: "enemy"
            },
            {
                name: "Hipotermia",
                icon: "img/magic/hipotermia.png",
                desc: "Causa debilidad a agua al 75%. Consume 3 PM.",
                target: "enemy"
            },
            {
                name: "Don de Agua",
                icon: "img/magic/dondeagua.png",
                desc: "Potencia el daño de agua un 50% durante tres turnos. Consume 4 PM.",
                target: "ally"
            }
        ]
    },
    {
        key: "limit",
        title: "Límite",
        actions: [
            {
                name: "???",
                icon: "img/limit/limit.png",
                desc: "La sangre dragontina de su interior despierta cambiando su aspecto y reforzando sus habilidades. Solo puede utilizarse cuando los PV están por debajo del 20% y está limitado a un uso por combate.",
                target: "self"
            }
        ]
    },
    {
        key: "items",
        title: "Objetos",
        actions: [
            {
                name: "Poción",
                icon: "img/items/pocion.png",
                desc: "Restaura al objetivo 20 PV.",
                target: "ally"
            },
            {
                name: "Éter",
                icon: "img/items/eter.png",
                desc: "Restaura al objetivo 5 PM.",
                target: "ally"
            },
            {
                name: "Pluma de Fénix",
                icon: "img/items/pluma-fenix.png",
                desc: "Resucita al objetivo con 5 PV.",
                target: "ally"
            }
        ]
    }
];

// --- BLOQUES DE MENÚ Y SUBMENÚ OBJETIVO ---
let currentOpen = null;
let currentAction = null;

// NOTA: ¡Pon aquí tus datos reales de enemigos y aliados!
const exampleEnemies = [
    { id: 'enemy1', name: 'Goblin' },
    { id: 'enemy2', name: 'Lobo Salvaje' }
];
const exampleAllies = [
    { id: 'seira', name: 'Seira' },
    { id: 'oz', name: 'Oz' }
];

function renderCombatMenuSeira() {
    const container = document.getElementById('combat-menu-seira');
    let html = '';
    seiraCommands.forEach((command, i) => {
        html += `
        <div class="combat-command-block${currentOpen === i ? ' open' : ''}" data-command-idx="${i}">
            <div class="combat-command-title">${command.title}</div>
            ${currentOpen === i ? `
            <div class="combat-command-content">
                ${command.actions.map((action, j) => `
                    <div class="combat-action" data-action-idx="${j}" data-command-idx="${i}">
                        <img class="combat-action-icon" src="${action.icon}" alt="" />
                        <div class="combat-action-info">
                            <div class="combat-action-name">${action.name}</div>
                            <div class="combat-action-desc">${action.desc}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
        </div>
        `;
    });
    container.innerHTML = html;

    // Eventos de abrir/cerrar bloques
    document.querySelectorAll('#combat-menu-seira .combat-command-title').forEach((el, i) => {
        el.onclick = () => {
            if (currentOpen === i) {
                currentOpen = null;
            } else {
                currentOpen = i;
            }
            renderCombatMenuSeira();
        };
    });

    // Eventos de seleccionar acción
    document.querySelectorAll('.combat-action').forEach(el => {
        el.onclick = () => {
            const cmdIdx = +el.getAttribute('data-command-idx');
            const actIdx = +el.getAttribute('data-action-idx');
            currentAction = seiraCommands[cmdIdx].actions[actIdx];
            // Oculta menú y muestra selección de objetivo
            document.getElementById('combat-menu-seira').style.display = 'none';
            renderTargetSelectionSeira(currentAction);
        };
    });
}

function renderTargetSelectionSeira(action) {
    const container = document.getElementById('target-selection-seira');
    let targets = [];
    let title = "Elige objetivo";
    // Lógica según tipo de objetivo
    switch (action.target) {
        case "enemy": targets = exampleEnemies; title = "Elige enemigo"; break;
        case "allEnemies": targets = exampleEnemies; title = "Elige enemigo (se aplicará a todos)"; break;
        case "ally": targets = exampleAllies; title = "Elige aliado"; break;
        case "self": targets = [exampleAllies[0]]; title = "Solo puedes elegir a Seira"; break;
        default: targets = exampleEnemies.concat(exampleAllies); break;
    }
    let html = `
        <div class="target-title">${title}</div>
        <div class="target-list">
            ${targets.map(t => `<div class="target-option" data-id="${t.id}">${t.name}</div>`).join('')}
        </div>
    `;
    container.innerHTML = html;
    container.style.display = '';

    // Evento de seleccionar objetivo
    document.querySelectorAll('.target-option').forEach(el => {
        el.onclick = () => {
            const targetId = el.getAttribute('data-id');
            handleActionSeira(action, targetId);
        };
    });
}

// Aquí iría la lógica de aplicar la acción real de Seira (modifica según tu sistema de combate)
function handleActionSeira(action, targetId) {
    // ---- Aquí pones tu lógica de combate real ----
    alert(`Seira usa "${action.name}" sobre el objetivo ${targetId}.`);
    // ---------------------------------------------
    // Oculta selección de objetivo y vuelve a mostrar el menú principal
    document.getElementById('target-selection-seira').style.display = 'none';
    document.getElementById('combat-menu-seira').style.display = '';
    // Aquí deberías pasar el turno al siguiente personaje o enemigo
}

// --- Inicializa el menú al cargar la batalla (cuando sea el turno de Seira) ---
// Llama a renderCombatMenuSeira() cuando sea el turno de Seira.
// Por ejemplo:
// renderCombatMenuSeira();

/* -------------------------------------------------------------------------- */
/* ----------------------- FIN NUEVO MENÚ SEIRA ----------------------------- */
/* -------------------------------------------------------------------------- */

// Utilidad para resaltar el HUD del personaje cuyo turno es
function resaltarTurno(nombre) {
  document.querySelectorAll('.personaje-hud').forEach(hud => hud.classList.remove('activo'));
  const hud = Array.from(document.querySelectorAll('.personaje-hud'))
    .find(h => h.querySelector('.nombre').textContent.trim() === nombre);
  if (hud) hud.classList.add('activo');
}

// Utilidad para esperar un click en un botón (devuelve el value del botón pulsado)
function esperarBoton(selector) {
  return new Promise(resolve => {
    const handler = e => {
      if (e.target.matches(selector)) {
        // menuDiv.removeEventListener('click', handler); // No usar más menuDiv aquí
        resolve(e.target.value);
      }
    };
    document.addEventListener('click', handler, { once: true });
  });
}

function esperarBotonTarget(selector) {
  return new Promise(resolve => {
    const handler = e => {
      if (e.target.matches(selector)) {
        // menuDiv.removeEventListener('click', handler);
        resolve(e.target.dataset.target);
      }
    };
    document.addEventListener('click', handler, { once: true });
  });
}

// Utilidad para mostrar una lista de botones con descripción emergente
function renderBotonDescripcion(lista, claseBtn, tipo="magia") {
  return lista.map((item, idx) => `
    <button class="${claseBtn}" value="${item.nombre}" 
      style="margin:2px;position:relative;" 
      onmouseenter="document.getElementById('${tipo}-desc-${idx}').style.display='block'"
      onmouseleave="document.getElementById('${tipo}-desc-${idx}').style.display='none'">
      ${item.nombre}${item.costePM ? " (" + item.costePM + " PM)" : (item.costePH ? " (" + item.costePH + " PH)" : "")}
      <div id="${tipo}-desc-${idx}" 
        style="display:none; position:absolute; left:0; top:100%; background:#292929; color:#fff; font-size:12px; z-index:100; border-radius:6px; padding:8px; min-width:170px; max-width:300px; box-shadow:0 3px 12px #000a;">
        <b>${item.nombre}</b><br>
        <span style="font-style:italic;">${item.descripcion || "Sin descripción."}</span>
      </div>
    </button>
  `).join(" ");
}

// Flying text para daño/curación
function mostrarFlyingText(target, texto, tipo="daño") {
  let parent = null;
  // Decide sobre qué ponerlo: personaje (HUD) o enemigo (sprite)
  if (target.domId) {
    parent = document.getElementById(target.domId); // debe tener domId correcto
  } else {
    const hud = Array.from(document.querySelectorAll('.personaje-hud'))
      .find(h => h.querySelector('.nombre').textContent.trim() === target.nombre);
    parent = hud;
  }
  if (!parent) return;

  const flying = document.createElement("div");
  flying.textContent = texto;
  flying.style.position = "absolute";
  flying.style.left = "50%";
  flying.style.top = "10%";
  flying.style.transform = "translate(-50%, 0)";
  flying.style.fontWeight = "bold";
  flying.style.fontSize = "32px";
  flying.style.color = tipo === "cura" ? "#22ff66" : "#fff";
  flying.style.textShadow = "2px 2px 8px #000, 0 0 12px #000";
  flying.style.pointerEvents = "none";
  flying.style.opacity = "1";
  flying.style.zIndex = 9999;
  flying.style.transition = "all 1.1s cubic-bezier(.4,0,.6,1)";

  parent.appendChild(flying);

  setTimeout(() => {
    flying.style.top = "-40px";
    flying.style.opacity = "0";
  }, 30);

  setTimeout(() => {
    if (flying.parentNode) flying.parentNode.removeChild(flying);
  }, 1200);
}

// Anima la barra visualmente (PV, PM, PH)
function animarBarra(barraElem, valorActual, valorNuevo, maxValor, tipo) {
  const relleno = barraElem.querySelector('div');
  const texto = barraElem.querySelector('div[class$="-text"]');
  let start = valorActual;
  let end = valorNuevo;
  let now = start;
  const duration = 450;
  const startTime = performance.now();
  function step(ts) {
    const t = Math.min(1, (ts - startTime) / duration);
    now = Math.round(start + (end - start) * t);
    const pct = Math.max(0, Math.min(100, now/maxValor*100));
    relleno.style.width = pct + "%";
    texto.textContent = `${now} / ${maxValor}`;
    if (tipo === "pv") relleno.style.backgroundColor = pct <= 20 ? "darkred" : "#22c55e";
    if (tipo === "pm") relleno.style.backgroundColor = '#3b82f6';
    if (tipo === "ph") relleno.style.backgroundColor = '#facc15';
    if (t < 1) requestAnimationFrame(step);
    else {
      relleno.style.width = (end/maxValor*100) + "%";
      texto.textContent = `${end} / ${maxValor}`;
    }
  }
  requestAnimationFrame(step);
}

// --- NUEVO: FILTRO DE HABILIDADES ---
// Excluye ataque básico, guardia y habilidades no usables
function habilidadesFiltradas(jugador) {
  return (jugador.habilidades || [])
    .filter(h =>
      h.categoria &&
      h.categoria !== "Magia" &&
      h.categoria !== "Limite" &&
      h.usableEnCombate !== false &&
      !["Ataque", "Defensa", "Guardia"].includes(h.nombre) &&
      typeof h.objetivo === "string" && h.objetivo.length > 0
    );
}

// Menú de combate clásico (antiguo, puedes eliminarlo si no lo usas)
async function pedirAccionUsuario(jugador, aliados, enemigos, logs) {
  // Puedes comentar o eliminar todo este bloque si vas a usar SOLO el nuevo menú de Seira
  // ...
}

// Lógica para lanzar el combate al pulsar los botones de enemigo
for (let i = 1; i <= 6; i++) {
  const btn = document.querySelector(`#enemy-buttons-group button:nth-child(${i})`);
  if (!btn) continue;
  btn.addEventListener("click", async () => {
    const heroes = clonarEquipo(PERSONAJES);
    const ids = formaciones[i];
    const enemigos = clonarEquipo(ids.map(id => ENEMIGOS[id]).filter(e => !!e));
    // menuDiv.innerHTML = "";

    // Ejemplo de iniciar menú Seira:
    renderCombatMenuSeira();

    // Aquí tu lógica de combate, por ejemplo:
    // await combate(heroes, enemigos, pedirAccionUsuario, {
    //   mostrarFlyingText,
    //   animarBarra
    // });

    document.querySelectorAll('.personaje-hud').forEach(hud => hud.classList.remove('activo'));
    // menuDiv.innerHTML = `<button id="cerrar-menu" style="margin-top:10px;">Cerrar menú</button>`;
    // document.getElementById("cerrar-menu").onclick = ()=> menuDiv.innerHTML = "";
  });
}

window.renderBotonDescripcion = renderBotonDescripcion;
export { mostrarFlyingText, animarBarra };

import { PERSONAJES, ENEMIGOS } from './personajes-enemigos.js';
import { HECHIZOS, OBJETOS } from './hechizos-objetos-enlaces.js';
import { combate } from './motor-combate.js';

// Utilidad para clonar personajes/enemigos y sus estados
function clonarEquipo(eq) {
  return eq.map(p => ({
    ...p,
    estados: [...(p.estados || [])]
  }));
}

// Encuentra a Oz en el array de personajes
function getOz() {
  return PERSONAJES.find(p => p.id === "Oz");
}

// Genera el menú de comandos para Oz dinámicamente usando sus datos reales
function buildOzCommands() {
  const oz = getOz();
  if (!oz) return [];

  // Iconos sugeridos, puedes cambiarlos por los tuyos
  const skillIcon = name => `img/skills/${name.toLowerCase().replace(/ /g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, "")}.png`;
  const magicIcon = name => `img/magic/${name.toLowerCase().replace(/ /g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, "")}.png`;
  const limitIcon = name => `img/limit/limit.png`;
  const itemIcon = name => `img/items/${name.toLowerCase().replace(/ /g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, "")}.png`;

  // Bloque Guardia
  const guardia = oz.habilidades.find(h => h.categoria === "Guardia");
  const guardBlock = guardia ? [{
    key: "guard",
    title: "Guardia",
    actions: [{
      name: guardia.nombre,
      icon: skillIcon(guardia.nombre),
      desc: guardia.descripcion,
      target: "self"
    }]
  }] : [];

  // Bloque Habilidades
  const habilidades = oz.habilidades.filter(h => h.categoria !== "Guardia" && h.categoria !== "Habilidad" && h.categoria !== "Especial" && h.categoria !== "Básico");
  const otrasHabilidades = oz.habilidades.filter(h => ["Habilidad", "Especial", "Básico"].includes(h.categoria) && h.nombre !== guardia?.nombre);
  const habBlock = habilidades.length || otrasHabilidades.length ? [{
    key: "skills",
    title: "Habilidades",
    actions: [...habilidades, ...otrasHabilidades].map(h => ({
      name: h.nombre,
      icon: skillIcon(h.nombre),
      desc: h.descripcion,
      target: h.objetivo === "TodosEnemigos" ? "allEnemies" :
             h.objetivo === "Aliado" ? "ally" :
             h.objetivo === "Propio" ? "self" :
             h.objetivo === "Variable" ? "all" :
             "enemy"
    }))
  }] : [];

  // Bloque Magia
  const magias = (oz.magias || []);
  const magBlock = magias.length ? [{
    key: "magic",
    title: "Magia",
    actions: magias.map(m => ({
      name: m.nombre,
      icon: magicIcon(m.nombre),
      desc: m.descripcion,
      target: m.objetivo === "TodosAliados" ? "allAllies" :
             m.objetivo === "Aliado" ? "ally" :
             m.objetivo === "Propio" ? "self" :
             m.objetivo === "TodosEnemigos" ? "allEnemies" :
             "enemy"
    }))
  }] : [];

  // Bloque Límite
  const limit = oz.limite;
  const limitBlock = limit ? [{
    key: "limit",
    title: "Límite",
    actions: [{
      name: limit.nombre,
      icon: limitIcon(limit.nombre),
      desc: limit.descripcion,
      target: "enemy" // ajusta si tu límite es grupal o sobre Oz
    }]
  }] : [];

  // Bloque Objetos (puedes personalizar los objetos disponibles)
  const itemsBlock = [{
    key: "items",
    title: "Objetos",
    actions: OBJETOS.map(obj => ({
      name: obj.nombre,
      icon: itemIcon(obj.nombre),
      desc: obj.descripcion,
      target: obj.tipo === "CurarPV" || obj.tipo === "CurarPM" || obj.tipo === "Resucitar" ? "ally" : "enemy"
    }))
  }];

  // Une los bloques
  return [
    ...guardBlock,
    ...habBlock,
    ...magBlock,
    ...limitBlock,
    ...itemsBlock
  ];
}

// -------------------- COMPONENTES VISUALES DEL MENÚ DE OZ --------------------

let currentOpenOz = null;
let currentActionOz = null;

function renderCombatMenuOz() {
  const ozCommands = buildOzCommands();
  const container = document.getElementById('combat-menu-oz');
  let html = '';
  ozCommands.forEach((command, i) => {
    html += `
      <div class="combat-command-block${currentOpenOz === i ? ' open' : ''}" data-command-idx="${i}">
        <div class="combat-command-title">${command.title}</div>
        ${currentOpenOz === i ? `
        <div class="combat-command-content">
          ${command.actions.map((action, j) => `
            <div class="combat-action" data-action-idx="${j}" data-command-idx="${i}">
              <img class="combat-action-icon" src="${action.icon}" alt="" />
              <div class="combat-action-info">
                <div class="combat-action-name">${action.name}</div>
                <div class="combat-action-desc">${action.desc}</div>
              </div>
            </div>
          `).join('')}
        </div>
        ` : ''}
      </div>
    `;
  });
  container.innerHTML = html;

  // Eventos de abrir/cerrar bloques
  document.querySelectorAll('#combat-menu-oz .combat-command-title').forEach((el, i) => {
    el.onclick = () => {
      if (currentOpenOz === i) {
        currentOpenOz = null;
      } else {
        currentOpenOz = i;
      }
      renderCombatMenuOz();
    };
  });

  // Eventos de seleccionar acción
  document.querySelectorAll('.combat-action').forEach(el => {
    el.onclick = () => {
      const cmdIdx = +el.getAttribute('data-command-idx');
      const actIdx = +el.getAttribute('data-action-idx');
      currentActionOz = buildOzCommands()[cmdIdx].actions[actIdx];
      document.getElementById('combat-menu-oz').style.display = 'none';
      renderTargetSelectionOz(currentActionOz);
    };
  });
}

function renderTargetSelectionOz(action) {
  const container = document.getElementById('target-selection-oz');
  // Usa tus datos de personajes y enemigos reales para el combate actual
  // Por ahora, ejemplo sencillo:
  let targets = [];
  let title = "Elige objetivo";
  // Debes adaptar esto para usar los arrays de personajes/enemigos de la batalla real
  switch (action.target) {
    case "enemy":
    case "allEnemies":
      targets = Object.values(ENEMIGOS); title = "Elige enemigo"; break;
    case "ally":
    case "allAllies":
      targets = PERSONAJES; title = "Elige aliado"; break;
    case "self":
      targets = [getOz()]; title = "Oz"; break;
    default:
      targets = Object.values(ENEMIGOS).concat(PERSONAJES);
      break;
  }
  let html = `
    <div class="target-title">${title}</div>
    <div class="target-list">
      ${targets.map(t => `<div class="target-option" data-id="${t.id}">${t.nombre}</div>`).join('')}
    </div>
  `;
  container.innerHTML = html;
  container.style.display = '';

  // Evento de seleccionar objetivo
  document.querySelectorAll('.target-option').forEach(el => {
    el.onclick = () => {
      const targetId = el.getAttribute('data-id');
      handleActionOz(action, targetId);
    };
  });
}

// Aquí va la lógica real para aplicar la acción de Oz (debes conectar con tu sistema de combate)
function handleActionOz(action, targetId) {
  alert(`Oz usa "${action.name}" sobre el objetivo ${targetId}.`);
  document.getElementById('target-selection-oz').style.display = 'none';
  document.getElementById('combat-menu-oz').style.display = '';
  // Aquí deberías pasar el turno, aplicar el efecto real, etc.
}

// Inicializa el menú de Oz cuando sea su turno
// Llama a renderCombatMenuOz() cuando sea el turno de Oz

// Exporta si lo necesitas
export { renderCombatMenuOz };
