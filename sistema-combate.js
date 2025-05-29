// =============================
// SISTEMA DE COMBATE JRPG - REGLAS Y UTILIDADES CENTRALES
// =============================

// Dados
export function d4(n=1){ return Array.from({length:n},()=>1+Math.floor(Math.random()*4)).reduce((a,b)=>a+b,0);}
export function d6(n=1){ return Array.from({length:n},()=>1+Math.floor(Math.random()*6)).reduce((a,b)=>a+b,0);}
export function d8(n=1){ return Array.from({length:n},()=>1+Math.floor(Math.random()*8)).reduce((a,b)=>a+b,0);}
export function d10(n=1){ return Array.from({length:n},()=>1+Math.floor(Math.random()*10)).reduce((a,b)=>a+b,0);}
export function d12(n=1){ return Array.from({length:n},()=>1+Math.floor(Math.random()*12)).reduce((a,b)=>a+b,0);}

// Elementos
export const ELEMENTOS = [
  "Fuego", "Hielo", "Electro", "Agua", "Viento", "Tierra", "Oscuridad", "Luz"
];

// Resistencias elementales
export const RESISTENCIAS_ELEMENTALES = {
  "Débil": 2.0,
  "Resiste": 0.5,
  "Inmune": 0.0,
  "Absorbe": -1.0,
  "Normal": 1.0
};

// Tipos de daño
export const TIPOS_DAÑO = [
  "Físico", "Mágico", "Absoluto"
];

// Estados negativos
export const ESTADOS_NEGATIVOS = [
  "Mudez", "Veneno", "Petrificación", "Ceguera", "Virus", "Pequeño", "Muerte súbita",
  "Parálisis", "Sueño", "Confusión", "Maldición", "Locura", "Transformación", "Zombie",
  "Inmóvil", "Levita", "Lento", "Quietud", "Condena", "Provocación", "Debilidad elemental"
];

// Estados positivos
export const ESTADOS_POSITIVOS = [
  "Velo", "Regen", "Antis", "Dones", "Resistencia", "Fe", "Bravura", "Tranquilidad",
  "Prisa", "Parpadeo", "Coraza", "Escudo", "Espejo", "Doble", "Duplo", "Aura", "Triple"
];

// Descripción de efectos de estados (solo para referencia interna)
export const EFECTOS_ESTADOS = {
  Mudez: { desc: "No puede usar magia." },
  Veneno: { desc: "Pierde 5% de PV cada turno." },
  Petrificación: { desc: "No puede actuar. Si todo el equipo está petrificado: K.O." },
  Ceguera: { desc: "Puntería reducida a la mitad." },
  Virus: { desc: "Resistencia y Espíritu a la mitad." },
  Pequeño: { desc: "Fuerza a la mitad, evasión +50%." },
  "Muerte súbita": { desc: "Queda K.O." },
  Parálisis: { desc: "50% de no poder actuar." },
  Sueño: { desc: "No puede actuar. Ataque físico lo despierta." },
  Confusión: { desc: "50% de atacar a aliado o a sí mismo." },
  Maldición: { desc: "No puede usar Límite." },
  Locura: { desc: "Solo ataque básico, fuerza +50%." },
  Transformación: { desc: "Solo puede usar objeto u Oink/Croac (según forma)." },
  Zombie: { desc: "Recibe daño por curas, débil a luz." },
  Inmóvil: { desc: "No puede usar habilidades." },
  Levita: { desc: "Inmune a tierra, débil a viento." },
  Lento: { desc: "Velocidad a la mitad." },
  Quietud: { desc: "No puede actuar 3 turnos." },
  Condena: { desc: "K.O. en 10 turnos." },
  Provocación: { desc: "Solo puede atacar a quien le ha provocado." },
  "Debilidad elemental": { desc: "Débil a un elemento." },
  Velo: { desc: "Reduce 50% probabilidad de estados alterados." },
  Regen: { desc: "Regenera 5% PV durante 5 turnos." },
  Antis: { desc: "Niega siguiente daño elemento dado." },
  Dones: { desc: "Daño de elemento +50% durante 3 turnos." },
  Resistencia: { desc: "Previene siguiente estado negativo." },
  Fe: { desc: "Magia +50%." },
  Bravura: { desc: "Fuerza +50%." },
  Tranquilidad: { desc: "Puntería +50%." },
  Prisa: { desc: "Velocidad +50%." },
  Parpadeo: { desc: "Evasión +50%." },
  Coraza: { desc: "Resistencia +50%." },
  Escudo: { desc: "Espíritu +50%." },
  Espejo: { desc: "Refleja la magia una vez." },
  Doble: { desc: "2 magias/turno durante 3 turnos." },
  Duplo: { desc: "PV +50%." },
  Aura: { desc: "Permite usar límite en cualquier momento (1 vez por combate)." },
  Triple: { desc: "3 magias/turno durante 3 turnos." }
};

// Fórmula de impacto (ataque físico)
export function calcularImpacto(ataque, defensa) {
  const tiradaAtacante = d10() + (ataque.punteria || 0) + (ataque.nivel || 0);
  const tiradaDefensor = d10() + (defensa.evasion || 0);
  const resultado = tiradaAtacante - tiradaDefensor;
  if (resultado > 10) return "Crítico";
  if (resultado > 0) return "Certero";
  if (resultado === 0) return "Bloqueado";
  return "Esquivado";
}

// Daño final
export function calcularDaño({ base, defensa, resistenciaElemental, tipoDaño = "Físico" }) {
  let daño;
  if (tipoDaño === "Absoluto") {
    daño = base;
  } else {
    daño = base - (defensa || 0);
    if (resistenciaElemental !== undefined) {
      daño = daño * resistenciaElemental;
    }
  }
  return Math.round(daño);
}

// Probabilidad de estado alterado
export function calcularProbEstado({ baseProb, resistenciaEstado }) {
  let prob = baseProb;
  if (resistenciaEstado === "Resiste") prob *= 0.5;
  if (resistenciaEstado === "Inmune") prob = 0;
  return prob;
}

// Límite (solo usable si PV ≤ 20% o con Aura, una vez por combate)
export const REGLA_LIMITE = {
  disponible: ({ pv, pvMax, usadoEsteCombate, estados }) =>
    (!!estados?.Aura || pv <= pvMax * 0.2) && !usadoEsteCombate
};

// Defensa (reduce daño 25% hasta próxima acción, regenera 5% PV y +1 PH)
export const REGLA_DEFENDER = {
  reduccionDanio: 0.25,
  regenPorcPV: 0.05,
  recuperaPH: 1
};

// Huir solo con magia especial y no contra bosses
export const REGLA_HUIR = {
  permitido: ({ esBoss, magiaHuida }) => !esBoss && !!magiaHuida
};

// Turnos extra (Doble: 2 magias/turno, Triple: 3 magias/turno)
export const REGLA_TURNOS_EXTRA = {
  Doble: 2,
  Triple: 3
};

// Objetos como comando (siempre permitido)
export const OBJETOS_COMO_COMANDO = true;

// Limpiar todos los estados al terminar el combate
export const LIMPIAR_ESTADOS_AL_FINAL = true;

// Resurrección: magias y objetos autorizados
export const REGLA_RESURRECCION = {
  magias: ["Resurgir", "Lázaro", "Lázaro +"],
  objetos: ["Pluma de fénix"]
};

// Eliminación de estados: negativos con hechizos/objetos; positivos de enemigos solo con Antimagia
export const REGLA_ELIMINAR_ESTADOS = {
  estadosNegativos: "Se pueden eliminar con hechizos y objetos específicos.",
  estadosPositivos: "Solo pueden eliminarse con hechizos tipo Antimagia sobre los enemigos."
};

// Derrota: sin penalización, termina el combate
export const REGLA_DERROTA = {
  penalizacion: "Ninguna"
};

// Estados simultáneos: sin límite, pero no repetidos
export const REGLA_ESTADOS_SIMULTANEOS = {
  limite: "Sin límite, pero no pueden repetirse."
};

// Acciones automáticas: no existen fuera de lo que elige jugador o IA
export const ACCIONES_AUTOMATICAS = false;

// Espejo: lógica de rebote de magia
export function resolverEspejo({lanzador, objetivo, magia, aliados, enemigos}) {
  if (!objetivo.estados?.includes("Espejo")) return { rebota: false };
  let rebotaA = null;
  if (lanzador.esJugador && objetivo === lanzador) {
    rebotaA = enemigos.find(e => e.pv > 0);
  } else if (objetivo.esJugador) {
    rebotaA = lanzador;
  } else if (lanzador.esJugador) {
    rebotaA = lanzador;
  }
  return { rebota: true, nuevoObjetivo: rebotaA };
}

// Curación sobre Zombie: la cura daña
export function aplicarCura(objetivo, cantidad) {
  if (objetivo.estados?.includes("Zombie")) {
    objetivo.pv = Math.max(0, objetivo.pv - cantidad);
    return { tipo: "Daño", cantidad: cantidad };
  } else {
    objetivo.pv = Math.min(objetivo.pvMax, objetivo.pv + cantidad);
    return { tipo: "Cura", cantidad: cantidad };
  }
}