import { d4, d6, d8, d10 } from './sistema-combate.js';

const PERSONAJES = [
  {
    id: "Oz",
    nombre: "Oz",
    nivel: 8,
    pvMax: 80, pv: 80,
    pmMax: 12, pm: 12,
    phMax: 5, ph: 5,
    stats: { FUE: 15, MAG: 10, RES: 10, ESP: 9, VEL: 11, PUN: 7, EVA: 10 },
    habilidades: [
      {
        nombre: "Tajo descendente",
        tipo: "Físico",
        categoria: "Básico",
        objetivo: "Enemigo",
        descripcion: "Se avalanza con rapidez hacia el enemigo y con un salto corta hacia abajo con la espada. (1d6 + FUE) x 1.5. Recupera 1 PH.",
        formula: (s) => Math.round((d6(1) + s.stats.FUE) * 1.5),
        efectos: [{ tipo: "RecuperaPH", cantidad: 1 }],
        costePH: 0
      },
      {
        nombre: "Guardia: Miedo al Miedo",
        tipo: "Defensivo",
        categoria: "Guardia",
        objetivo: "Propio",
        descripcion: "Adopta una postura defensiva y reduce el daño recibido en un 25% hasta la próxima acción, regenera un 5% del PV máximo y recupera 1 PH.",
        efectos: [
          { tipo: "ReduceDaño", porc: 0.25, duracion: 1 },
          { tipo: "CuraPorcPV", porc: 0.05 },
          { tipo: "RecuperaPH", cantidad: 1 }
        ],
        costePH: 0
      },
      {
        nombre: "Ira Desmedida",
        tipo: "Físico",
        categoria: "Habilidad",
        objetivo: "Enemigo",
        descripcion: "Realiza un terrible combo de golpes llenos de furia, desprecio y odio por su rival. (3d6 + FUE) x 1.5. Consume 3 PH. Cambia la fase lunar a Menguante.",
        formula: (s) => Math.round((d6(3) + s.stats.FUE) * 1.5),
        efectos: [{ tipo: "CambiaFaseLunar", valor: "Menguante" }],
        costePH: 3
      },
      {
        nombre: "Cero Absoluto",
        tipo: "Buff",
        categoria: "Habilidad",
        objetivo: "Propio",
        descripcion: "Baja la temperatura a su alrededor y congela sus emociones, el siguiente ataque siempre acertará y será crítico. Consume 2 PH. Cambia la fase lunar a Nueva.",
        efectos: [
          { tipo: "ProximoCriticoAcertado" },
          { tipo: "CambiaFaseLunar", valor: "Nueva" }
        ],
        costePH: 2
      },
      {
        nombre: "Nadie queda Atrás",
        tipo: "Especial",
        categoria: "Habilidad",
        objetivo: "Propio",
        descripcion: "Reduce sus PV a 1 y se vuelve invulnerable a la mayoría de fuentes de daño durante los siguientes tres turnos, además, se vuelve el objetivo de todos los ataques individuales enemigos durante la duración de la habilidad. Solo puede usarse sobre sí mismo. Consume 3 PH. Cambia la fase lunar a Creciente.",
        efectos: [
          { tipo: "PVA1" },
          { tipo: "Invulnerable", duracion: 3 },
          { tipo: "Provocado", duracion: 3 },
          { tipo: "CambiaFaseLunar", valor: "Creciente" }
        ],
        costePH: 3
      },
      {
        nombre: "Impacto Iónico",
        tipo: "Físico",
        categoria: "Habilidad",
        objetivo: "TodosEnemigos",
        descripcion: "Utiliza las balas de su sablepistola para lanzar una onda de energía que impacta en todos los enemigos. (2d4 + FUE) x 1.5 Consume 2 PH. Cambia la fase lunar a Llena.",
        formula: (s) => Math.round((d4(2) + s.stats.FUE) * 1.5),
        efectos: [{ tipo: "CambiaFaseLunar", valor: "Llena" }],
        costePH: 2
      },
      {
        nombre: "Luna",
        tipo: "Especial",
        categoria: "Habilidad",
        objetivo: "Variable",
        descripcion: "Dependiendo de la fase lunar puede ejecutar una acción u otra.",
        efectos: [
          { tipo: "LunaNueva", descripcion: "Noche sin Luna (2d8 + 10 + FUE) x 1.5 a todos, requiere 2 turnos" },
          { tipo: "LunaMenguante", descripcion: "Bendición de la Liebre Lunar: VEL y EVA +50% 3 turnos" },
          { tipo: "LunaLlena", descripcion: "Crea ilusión que absorbe el siguiente ataque enemigo" },
          { tipo: "LunaCreciente", descripcion: "Cura 50% PV y PM a todos los aliados" }
        ]
      }
    ],
    magias: [
      {
        nombre: "Hielo",
        tipo: "Hielo",
        categoria: "Magia",
        objetivo: "Enemigo",
        descripcion: "Daño leve de hielo (2d4 + MAG) x 1.5. Consume 2 PM.",
        formula: (s) => Math.round((d4(2) + s.stats.MAG) * 1.5),
        costePM: 2,
        efectos: []
      },
      {
        nombre: "Hielo +",
        tipo: "Hielo",
        categoria: "Magia",
        objetivo: "Enemigo",
        descripcion: "Daño medio de hielo (2d6 + 2 + MAG) x 1.5. Consume 4 PM.",
        formula: (s) => Math.round((d6(2) + 2 + s.stats.MAG) * 1.5),
        costePM: 4,
        efectos: []
      },
      {
        nombre: "Tundra",
        tipo: "Hielo",
        categoria: "Magia",
        objetivo: "Enemigo",
        descripcion: "Causa debilidad a hielo al 75%. Consume 3 PM.",
        formula: () => 0,
        costePM: 3,
        efectos: [{ tipo: "DebilidadHielo", porc: 0.75, duracion: 3 }]
      },
      {
        nombre: "Don de Frío",
        tipo: "Buff",
        categoria: "Magia",
        objetivo: "Propio",
        descripcion: "Potencia el daño de hielo un 50% durante tres turnos. Consume 4 PM.",
        formula: () => 0,
        costePM: 4,
        efectos: [{ tipo: "BuffHielo", porc: 0.5, duracion: 3 }]
      },
      {
        nombre: "Cura",
        tipo: "Curación",
        categoria: "Magia",
        objetivo: "Aliado",
        descripcion: "Recupera PV (2d4 + MAG). Consume 2 PM.",
        formula: (s) => d4(2) + s.stats.MAG,
        costePM: 2,
        efectos: []
      },
      {
        nombre: "Omnicura",
        tipo: "Curación",
        categoria: "Magia",
        objetivo: "TodosAliados",
        descripcion: "Recupera PV a todos (2d4 + MAG). Consume 4 PM.",
        formula: (s) => d4(2) + s.stats.MAG,
        costePM: 4,
        efectos: []
      },
      {
        nombre: "Día",
        tipo: "Luz",
        categoria: "Magia",
        objetivo: "Enemigo",
        descripcion: "Daño leve de luz (2d4 + MAG) x 1.5. Consume 2 PM.",
        formula: (s) => Math.round((d4(2) + s.stats.MAG) * 1.5),
        costePM: 2,
        efectos: []
      },
      {
        nombre: "Día +",
        tipo: "Luz",
        categoria: "Magia",
        objetivo: "Enemigo",
        descripcion: "Daño medio de luz (2d6 + 2 + MAG) x 1.5. Consume 4 PM.",
        formula: (s) => Math.round((d6(2) + 2 + s.stats.MAG) * 1.5),
        costePM: 4,
        efectos: []
      }
    ],
    limite: {
      nombre: "Fundido a Negro",
      tipo: "Límite",
      categoria: "Limite",
      descripcion: "Límite aún no descrito."
    },
    estados: [],
    faseLunar: "Llena",
    sprite: {
      normal: "https://i.imgur.com/biShC3o.png",
      derrotado: "https://i.imgur.com/KygnWKe.png"
    },
    hudImage: "https://i.imgur.com/6NV2uTC.png",
    spriteId: "character-top"
  },
  {
    id: "Seira",
    nombre: "Seira",
    pvMax: 50, pv: 50,
    pmMax: 10, pm: 10,
    phMax: 5, ph: 5,
    stats: { FUE: 6, MAG: 8, RES: 6, ESP: 7, VEL: 8, PUN: 7, EVA: 7 },
    iraOceanica: 0,
    habilidades: [
      {
        nombre: "Impulso del Nenúfar",
        tipo: "Físico",
        categoria: "Básico",
        objetivo: "Enemigo",
        descripcion: "Golpea al objetivo con un ataque físico usando la lanza con agilidad y firmeza. (1d4 + FUE) x 1.5. Recupera 1 PH.",
        formula: (s) => Math.round((d4(1) + s.stats.FUE) * 1.5),
        efectos: [{ tipo: "RecuperaPH", cantidad: 1 }],
        costePH: 0
      },
      {
        nombre: "Guardia: Blasón de Escamas",
        tipo: "Defensivo",
        categoria: "Guardia",
        objetivo: "Propio",
        descripcion: "Adopta una postura defensiva y reduce el daño recibido en un 25% hasta la próxima acción, regenera un 5% del PV máximo y recupera 1 PH.",
        efectos: [
          { tipo: "ReduceDaño", porc: 0.25, duracion: 1 },
          { tipo: "CuraPorcPV", porc: 0.05 },
          { tipo: "RecuperaPH", cantidad: 1 }
        ],
        costePH: 0
      },
      {
        nombre: "Ascenso Dracónido",
        tipo: "Físico/Salto",
        categoria: "Habilidad",
        objetivo: "Enemigo",
        descripcion: "Realiza un salto hacia el aire durante un turno en el cual se vuelve invulnerable a la mayoría de fuentes de daño, al siguiente turno cae sobre el objetivo. (2d6 + 5 + FUE) x 1.5. Consume 3 PH. Genera 1 acumulación de Ira Oceánica.",
        formula: (s) => Math.round((d6(2) + 5 + s.stats.FUE) * 1.5),
        efectos: [
          { tipo: "Invulnerable1Turno" },
          { tipo: "GeneraIraOceanica", cantidad: 1 }
        ],
        costePH: 3
      },
      {
        nombre: "Respiro de Dragón",
        tipo: "Cura",
        categoria: "Habilidad",
        objetivo: "Aliado",
        descripcion: "Restablece al objetivo aliado una cantidad igual a sus PV actuales, también cura al usuario la mitad de dicha cura. No puede usarse sobre sí misma. Consume 2 PH. Genera 1 acumulación de Ira Oceánica.",
        efectos: [
          { tipo: "CuraIgualPVActual" },
          { tipo: "CuraSelfMitad" },
          { tipo: "GeneraIraOceanica", cantidad: 1 }
        ],
        costePH: 2
      },
      {
        nombre: "Oda al Mar",
        tipo: "Buff",
        categoria: "Habilidad",
        objetivo: "Propio",
        descripcion: "Aumenta un 50% la FUE, la MAG y la VEL durante cinco turnos. Solo puede usarse sobre sí misma. Consume 2 PH. Genera 1 acumulación de Ira Oceánica.",
        efectos: [
          { tipo: "Buff", stats: ["FUE", "MAG", "VEL"], porc: 0.5, duracion: 5 },
          { tipo: "GeneraIraOceanica", cantidad: 1 }
        ],
        costePH: 2
      },
      {
        nombre: "Más y Más",
        tipo: "Físico",
        categoria: "Habilidad",
        objetivo: "TodosEnemigos",
        descripcion: "Concentra su energía para realizar una serie de golpes acrobáticos con la lanza que dañan a todos los enemigos. (2d8 + 5 + FUE) x 1.5. Consume 5 acumulaciones de Ira Oceánica.",
        formula: (s) => Math.round((d8(2) + 5 + s.stats.FUE) * 1.5),
        efectos: [],
        costeIraOceanica: 5
      }
    ],
    magias: [
      {
        nombre: "Aqua",
        tipo: "Agua",
        categoria: "Magia",
        objetivo: "Enemigo",
        descripcion: "Daño leve de agua (2d4 + MAG) x 1.5. Consume 2 PM.",
        formula: (s) => Math.round((d4(2) + s.stats.MAG) * 1.5),
        costePM: 2,
        efectos: []
      },
      {
        nombre: "Hipotermia",
        tipo: "Agua",
        categoria: "Magia",
        objetivo: "Enemigo",
        descripcion: "Causa debilidad a agua al 75%. Consume 3 PM.",
        formula: () => 0,
        costePM: 3,
        efectos: [
          { tipo: "DebilidadAgua", porc: 0.75, duracion: 3 }
        ]
      },
      {
        nombre: "Don de Agua",
        tipo: "Buff",
        categoria: "Magia",
        objetivo: "Propio",
        descripcion: "Potencia el daño de agua un 50% durante tres turnos. Consume 4 PM.",
        formula: () => 0,
        costePM: 4,
        efectos: [
          { tipo: "BuffAgua", porc: 0.5, duracion: 3 }
        ]
      }
    ],
    limite: {
      nombre: "??????",
      tipo: "Límite",
      categoria: "Limite",
      descripcion: "La sangre dragontina de su interior despierta cambiando su aspecto y reforzando sus habilidades. Solo puede utilizarse cuando los PV están por debajo del 20% y está limitado a un uso por combate.",
      condicion: (self) => (self.pv / self.pvMax) < 0.2 && !self.limiteUsado,
      efectos: [
        { tipo: "FormaDragontina", duracion: 5 },
        { tipo: "LimiteUsado" }
      ]
    },
    estados: [],
    sprite: {
      normal: "https://i.imgur.com/vmVMErg.png",
      derrotado: "https://i.imgur.com/e11RO2R.png"
    },
    hudImage: "https://i.imgur.com/omKYTZg.png",
    spriteId: "character-bottom"
  }
];

const ENEMIGOS = {
  "enemy1": {
    id: "enemy1",
    domId: "enemy1",
    nombre: "Buel",
    nivel: 4,
    pvMax: 60, pv: 60,
    stats: { FUE: 5, MAG: 7, RES: 5, ESP: 5, VEL: 5, PUN: 6, EVA: 7 },
    habilidades: [
      {
        nombre: "Placaje",
        tipo: "Físico",
        categoria: "Básico",
        descripcion: "(2d4 + FUE) x 1.5.",
        formula: (e) => Math.round((d4(2) + e.stats.FUE) * 1.5),
        efectos: []
      }
    ],
    magias: [
      {
        nombre: "Piro",
        tipo: "Fuego",
        categoria: "Magia",
        descripcion: "Daño leve de fuego (2d4 + MAG) x 1.5. Consume 2 PM.",
        formula: (e) => Math.round((d4(2) + e.stats.MAG) * 1.5),
        costePM: 2,
        efectos: []
      },
      {
        nombre: "Electro",
        tipo: "Electro",
        categoria: "Magia",
        descripcion: "Daño leve de electro (2d4 + MAG) x 1.5. Consume 2 PM.",
        formula: (e) => Math.round((d4(2) + e.stats.MAG) * 1.5),
        costePM: 2,
        efectos: []
      },
      {
        nombre: "Fe",
        tipo: "Buff",
        categoria: "Magia",
        descripcion: "Aumenta la magia un 50%. Consume 5 PM.",
        formula: null,
        costePM: 5,
        efectos: [{ tipo: "Buff", stats: ["MAG"], porc: 0.5, duracion: 5 }]
      }
    ],
    debil: ["Viento"],
    inmune: ["Tierra"],
    absorbe: [],
    pasiva: null,
    spriteId: "enemy1",
    sprite: "https://i.imgur.com/7teJ44G.png"
  },
  "enemy2-1": {
    id: "enemy2-1",
    domId: "enemy2-1",
    nombre: "Murciélago rojo",
    nivel: 4,
    pvMax: 35, pv: 35,
    stats: { FUE: 5, MAG: 6, RES: 5, ESP: 5, VEL: 6, PUN: 5, EVA: 8 },
    habilidades: [
      {
        nombre: "Mordisco",
        tipo: "Físico",
        categoria: "Básico",
        descripcion: "(2d4 + FUE) x 1.5. Se recupera como PV todo el daño causado.",
        formula: (e) => Math.round((d4(2) + e.stats.FUE) * 1.5),
        efectos: [{ tipo: "RoboVida", porc: 1 }]
      },
      {
        nombre: "Ondas ultrasónicas",
        tipo: "Físico",
        categoria: "Habilidad",
        descripcion: "(2d4 + FUE) x 1.5. Afecta a todos, tiene un 25% de posibilidades de causar Sueño.",
        formula: (e) => Math.round((d4(2) + e.stats.FUE) * 1.5),
        objetivo: "Todos",
        efectos: [{ tipo: "ProbSueño", prob: 0.25 }]
      }
    ],
    magias: [
      {
        nombre: "Piro",
        tipo: "Fuego",
        categoria: "Magia",
        descripcion: "Daño leve de fuego (2d4 + MAG) x 1.5. Consume 2 PM",
        formula: (e) => Math.round((d4(2) + e.stats.MAG) * 1.5),
        costePM: 2,
        efectos: []
      }
    ],
    debil: ["Viento"],
    inmune: ["Tierra"],
    absorbe: [],
    pasiva: null,
    spriteId: "enemy2-1",
    sprite: "https://i.imgur.com/0HfalZb.png"
  },
  "enemy2-2": {
    id: "enemy2-2",
    domId: "enemy2-2",
    nombre: "Murciélago rojo",
    nivel: 4,
    pvMax: 35, pv: 35,
    stats: { FUE: 5, MAG: 6, RES: 5, ESP: 5, VEL: 6, PUN: 5, EVA: 8 },
    habilidades: [
      {
        nombre: "Mordisco",
        tipo: "Físico",
        categoria: "Básico",
        descripcion: "(2d4 + FUE) x 1.5. Se recupera como PV todo el daño causado.",
        formula: (e) => Math.round((d4(2) + e.stats.FUE) * 1.5),
        efectos: [{ tipo: "RoboVida", porc: 1 }]
      },
      {
        nombre: "Ondas ultrasónicas",
        tipo: "Físico",
        categoria: "Habilidad",
        descripcion: "(2d4 + FUE) x 1.5. Afecta a todos, tiene un 25% de posibilidades de causar Sueño.",
        formula: (e) => Math.round((d4(2) + e.stats.FUE) * 1.5),
        objetivo: "Todos",
        efectos: [{ tipo: "ProbSueño", prob: 0.25 }]
      }
    ],
    magias: [
      {
        nombre: "Piro",
        tipo: "Fuego",
        categoria: "Magia",
        descripcion: "Daño leve de fuego (2d4 + MAG) x 1.5. Consume 2 PM",
        formula: (e) => Math.round((d4(2) + e.stats.MAG) * 1.5),
        costePM: 2,
        efectos: []
      }
    ],
    debil: ["Viento"],
    inmune: ["Tierra"],
    absorbe: [],
    pasiva: null,
    spriteId: "enemy2-2",
    sprite: "https://i.imgur.com/0HfalZb.png"
  },
  "enemy2-3": {
    id: "enemy2-3",
    domId: "enemy2-3",
    nombre: "Murciélago rojo",
    nivel: 4,
    pvMax: 35, pv: 35,
    stats: { FUE: 5, MAG: 6, RES: 5, ESP: 5, VEL: 6, PUN: 5, EVA: 8 },
    habilidades: [
      {
        nombre: "Mordisco",
        tipo: "Físico",
        categoria: "Básico",
        descripcion: "(2d4 + FUE) x 1.5. Se recupera como PV todo el daño causado.",
        formula: (e) => Math.round((d4(2) + e.stats.FUE) * 1.5),
        efectos: [{ tipo: "RoboVida", porc: 1 }]
      },
      {
        nombre: "Ondas ultrasónicas",
        tipo: "Físico",
        categoria: "Habilidad",
        descripcion: "(2d4 + FUE) x 1.5. Afecta a todos, tiene un 25% de posibilidades de causar Sueño.",
        formula: (e) => Math.round((d4(2) + e.stats.FUE) * 1.5),
        objetivo: "Todos",
        efectos: [{ tipo: "ProbSueño", prob: 0.25 }]
      }
    ],
    magias: [
      {
        nombre: "Piro",
        tipo: "Fuego",
        categoria: "Magia",
        descripcion: "Daño leve de fuego (2d4 + MAG) x 1.5. Consume 2 PM",
        formula: (e) => Math.round((d4(2) + e.stats.MAG) * 1.5),
        costePM: 2,
        efectos: []
      }
    ],
    debil: ["Viento"],
    inmune: ["Tierra"],
    absorbe: [],
    pasiva: null,
    spriteId: "enemy2-3",
    sprite: "https://i.imgur.com/0HfalZb.png"
  },
  "enemy3-1": {
    id: "enemy3-1",
    domId: "enemy3-1",
    nombre: "Flan picante",
    nivel: 5,
    pvMax: 60, pv: 60,
    stats: { FUE: 8, MAG: 8, RES: 12, ESP: 6, VEL: 6, PUN: 6, EVA: 4 },
    habilidades: [
      {
        nombre: "Aplastamiento",
        tipo: "Físico",
        categoria: "Básico",
        descripcion: "(2d4 + 2 + FUE) x 1.5.",
        formula: (e) => Math.round((d4(2) + 2 + e.stats.FUE) * 1.5),
        efectos: []
      },
      {
        nombre: "Aprisionar",
        tipo: "Control",
        categoria: "Habilidad",
        descripcion: "Atrapa al objetivo y hace que no pueda actuar hasta el siguiente turno.",
        formula: null,
        efectos: [{ tipo: "Atrapado", duracion: 1 }]
      }
    ],
    magias: [
      {
        nombre: "Piro",
        tipo: "Fuego",
        categoria: "Magia",
        descripcion: "Daño leve de fuego (2d4 + MAG) x 1.5. Consume 2 PM.",
        formula: (e) => Math.round((d4(2) + e.stats.MAG) * 1.5),
        costePM: 2,
        efectos: []
      },
      {
        nombre: "Piro +",
        tipo: "Fuego",
        categoria: "Magia",
        descripcion: "Daño medio de fuego (2d6 + 2 + MAG) x 1.5. Consume 4 PM.",
        formula: (e) => Math.round((d6(2) + 2 + e.stats.MAG) * 1.5),
        costePM: 4,
        efectos: []
      }
    ],
    debil: ["Hielo", "Agua"],
    inmune: [],
    absorbe: ["Fuego"],
    pasiva: "Mitad daño físico",
    spriteId: "enemy3-1",
    sprite: "https://i.imgur.com/U1RHNtb.png"
  },
  "enemy3-2": {
    id: "enemy3-2",
    domId: "enemy3-2",
    nombre: "Flan picante",
    nivel: 5,
    pvMax: 60, pv: 60,
    stats: { FUE: 8, MAG: 8, RES: 12, ESP: 6, VEL: 6, PUN: 6, EVA: 4 },
    habilidades: [
      {
        nombre: "Aplastamiento",
        tipo: "Físico",
        categoria: "Básico",
        descripcion: "(2d4 + 2 + FUE) x 1.5.",
        formula: (e) => Math.round((d4(2) + 2 + e.stats.FUE) * 1.5),
        efectos: []
      },
      {
        nombre: "Aprisionar",
        tipo: "Control",
        categoria: "Habilidad",
        descripcion: "Atrapa al objetivo y hace que no pueda actuar hasta el siguiente turno.",
        formula: null,
        efectos: [{ tipo: "Atrapado", duracion: 1 }]
      }
    ],
    magias: [
      {
        nombre: "Piro",
        tipo: "Fuego",
        categoria: "Magia",
        descripcion: "Daño leve de fuego (2d4 + MAG) x 1.5. Consume 2 PM.",
        formula: (e) => Math.round((d4(2) + e.stats.MAG) * 1.5),
        costePM: 2,
        efectos: []
      },
      {
        nombre: "Piro +",
        tipo: "Fuego",
        categoria: "Magia",
        descripcion: "Daño medio de fuego (2d6 + 2 + MAG) x 1.5. Consume 4 PM.",
        formula: (e) => Math.round((d6(2) + 2 + e.stats.MAG) * 1.5),
        costePM: 4,
        efectos: []
      }
    ],
    debil: ["Hielo", "Agua"],
    inmune: [],
    absorbe: ["Fuego"],
    pasiva: "Mitad daño físico",
    spriteId: "enemy3-2",
    sprite: "https://i.imgur.com/U1RHNtb.png"
  },
  "enemy4": {
    id: "enemy4",
    domId: "enemy4",
    nombre: "Bomb",
    nivel: 5,
    pvMax: 90, pv: 90,
    stats: { FUE: 7, MAG: 9, RES: 7, ESP: 7, VEL: 7, PUN: 7, EVA: 6 },
    habilidades: [
      {
        nombre: "Golpetazo",
        tipo: "Físico",
        categoria: "Básico",
        descripcion: "(2d4 + FUE) x 1.5.",
        formula: (e) => Math.round((d4(2) + e.stats.FUE) * 1.5),
        efectos: []
      },
      {
        nombre: "Expansión",
        tipo: "Buff",
        categoria: "Habilidad",
        descripcion: "Gana un punto extra en todas sus estadísticas menos PV.",
        formula: null,
        efectos: [{ tipo: "Buff", stats: ["FUE","MAG","RES","ESP","VEL","PUN","EVA"], cantidad: 1, duracion: null }]
      },
      {
        nombre: "Kamikaze",
        tipo: "Físico",
        categoria: "Habilidad",
        descripcion: "Después de haber aumentado su tamaño dos veces con Expansión puede utilizar Kamikaze autodestruyéndose y causando daño a todos. (3d6 + 5 + FUE) x 1.5.",
        formula: (e) => Math.round((d6(3) + 5 + e.stats.FUE) * 1.5),
        objetivo: "Todos",
        efectos: [{ tipo: "Autodestruirse" }]
      }
    ],
    magias: [
      {
        nombre: "Piro",
        tipo: "Fuego",
        categoria: "Magia",
        descripcion: "Daño leve de fuego (2d4 + MAG) x 1.5. Consume 2 PM.",
        formula: (e) => Math.round((d4(2) + e.stats.MAG) * 1.5),
        costePM: 2,
        efectos: []
      },
      {
        nombre: "Piro +",
        tipo: "Fuego",
        categoria: "Magia",
        descripcion: "Daño medio de fuego (2d6 + 2 + MAG) x 1.5. Consume 4 PM.",
        formula: (e) => Math.round((d6(2) + 2 + e.stats.MAG) * 1.5),
        costePM: 4,
        efectos: []
      }
    ],
    debil: ["Hielo", "Agua"],
    inmune: [],
    absorbe: ["Fuego"],
    pasiva: null,
    spriteId: "enemy4",
    sprite: "https://i.imgur.com/Ue9VN8A.png"
  },
  "enemy5": {
    id: "enemy5",
    domId: "enemy5",
    nombre: "Ifrit",
    nivel: 8,
    pvMax: 150, pv: 150,
    stats: { FUE: 12, MAG: 12, RES: 9, ESP: 12, VEL: 7, PUN: 9, EVA: 8 },
    habilidades: [
      {
        nombre: "Acometida",
        tipo: "Físico",
        categoria: "Básico",
        descripcion: "(2d6 + 2 + FUE) x 1.5. Ataca a un objetivo, gana un punto de VEL con cada uso.",
        formula: (e) => Math.round((d6(2) + 2 + e.stats.FUE) * 1.5),
        efectos: [{ tipo: "GanaVEL", cantidad: 1 }]
      },
      {
        nombre: "Ignición",
        tipo: "Buff",
        categoria: "Habilidad",
        descripcion: "Aumenta su propia FUE y MAG un 50% durante cinco turnos.",
        formula: null,
        efectos: [{ tipo: "Buff", stats: ["FUE", "MAG"], porc: 0.5, duracion: 5 }]
      },
      {
        nombre: "Garras del averno",
        tipo: "Físico",
        categoria: "Habilidad",
        descripcion: "(3d6 + FUE) x 1.5. Ataca a todos.",
        formula: (e) => Math.round((d6(3) + e.stats.FUE) * 1.5),
        objetivo: "Todos",
        efectos: []
      },
      {
        nombre: "Orbes candentes",
        tipo: "Fuego",
        categoria: "Habilidad",
        descripcion: "(3d6 + MAG) x 1.5. Ataca a todos con daño mágico de fuego.",
        formula: (e) => Math.round((d6(3) + e.stats.MAG) * 1.5),
        objetivo: "Todos",
        efectos: []
      },
      {
        nombre: "Fuego Infernal",
        tipo: "Fuego absoluto",
        categoria: "Habilidad",
        descripcion: "Daño de fuego a todos (3d10 + 10) x 1.5. Necesita dos turnos previos para poder usarlo, es daño absoluto por lo que no se tienen en cuenta la resistencia ni el espíritu del objetivo al calcular el daño. Si durante los dos turnos previos a su uso Ifrit recibe 50 puntos de daño, el ataque se cancela.",
        formula: (e) => Math.round((d10(3) + 10) * 1.5),
        objetivo: "Todos",
        efectos: [{ tipo: "Carga", turnos: 2 }, { tipo: "Absoluto" }]
      }
    ],
    magias: [
      {
        nombre: "Piro",
        tipo: "Fuego",
        categoria: "Magia",
        descripcion: "Daño leve de fuego (2d4 + MAG) x 1.5. Consume 2 PM.",
        formula: (e) => Math.round((d4(2) + e.stats.MAG) * 1.5),
        costePM: 2,
        efectos: []
      },
      {
        nombre: "Piro +",
        tipo: "Fuego",
        categoria: "Magia",
        descripcion: "Daño medio de fuego (2d6 + 2 + MAG) x 1.5. Consume 4 PM.",
        formula: (e) => Math.round((d6(2) + 2 + e.stats.MAG) * 1.5),
        costePM: 4,
        efectos: []
      }
    ],
    debil: ["Hielo", "Agua"],
    inmune: [],
    absorbe: ["Fuego"],
    pasiva: "Al llegar su PV al 50% invoca dos Uñas de Ifrit como aliadas. Mientras las Uñas estén vivas Ifrit no puede recibir ningún daño.",
    spriteId: "enemy5",
    sprite: "https://i.imgur.com/3F1U3BE.png"
  },
  "enemy5-ally1": {
    id: "enemy5-ally1",
    domId: "enemy5-ally1",
    nombre: "Uña de Ifrit",
    nivel: 5,
    pvMax: 50, pv: 50,
    stats: { FUE: 4, MAG: 12, RES: 10, ESP: 10, VEL: 4, PUN: 10, EVA: 0 },
    habilidades: [],
    magias: [
      {
        nombre: "Piro",
        tipo: "Fuego",
        categoria: "Magia",
        descripcion: "Daño leve de fuego (2d4 + MAG) x 1.5. Consume 2 PM.",
        formula: (e) => Math.round((d4(2) + e.stats.MAG) * 1.5),
        costePM: 2,
        efectos: []
      },
      {
        nombre: "Piro +",
        tipo: "Fuego",
        categoria: "Magia",
        descripcion: "Daño medio de fuego (2d6 + 2 + MAG) x 1.5. Consume 4 PM.",
        formula: (e) => Math.round((d6(2) + 2 + e.stats.MAG) * 1.5),
        costePM: 4,
        efectos: []
      }
    ],
    debil: ["Hielo", "Agua"],
    inmune: [],
    absorbe: ["Fuego"],
    pasiva: "Mientras las Uñas estén vivas Ifrit no puede recibir ningún daño",
    spriteId: "enemy5-ally1",
    sprite: "https://i.imgur.com/Gy33kHk.png"
  },
  "enemy5-ally2": {
    id: "enemy5-ally2",
    domId: "enemy5-ally2",
    nombre: "Uña de Ifrit",
    nivel: 5,
    pvMax: 50, pv: 50,
    stats: { FUE: 4, MAG: 12, RES: 10, ESP: 10, VEL: 4, PUN: 10, EVA: 0 },
    habilidades: [],
    magias: [
      {
        nombre: "Piro",
        tipo: "Fuego",
        categoria: "Magia",
        descripcion: "Daño leve de fuego (2d4 + MAG) x 1.5. Consume 2 PM.",
        formula: (e) => Math.round((d4(2) + e.stats.MAG) * 1.5),
        costePM: 2,
        efectos: []
      },
      {
        nombre: "Piro +",
        tipo: "Fuego",
        categoria: "Magia",
        descripcion: "Daño medio de fuego (2d6 + 2 + MAG) x 1.5. Consume 4 PM.",
        formula: (e) => Math.round((d6(2) + 2 + e.stats.MAG) * 1.5),
        costePM: 4,
        efectos: []
      }
    ],
    debil: ["Hielo", "Agua"],
    inmune: [],
    absorbe: ["Fuego"],
    pasiva: "Mientras las Uñas estén vivas Ifrit no puede recibir ningún daño",
    spriteId: "enemy5-ally2",
    sprite: "https://i.imgur.com/Gy33kHk.png"
  },
  "enemy6": {
    id: "enemy6",
    domId: "enemy6",
    nombre: "Ifrit Desencadenado",
    nivel: 8,
    pvMax: 200, pv: 200,
    stats: { FUE: 14, MAG: 14, RES: 11, ESP: 14, VEL: 9, PUN: 10, EVA: 8 },
    habilidades: [
      {
        nombre: "Embestida Escarlata",
        tipo: "Físico",
        categoria: "Básico",
        descripcion: "(2d6 + 2 + FUE) x 1.5. Ataca a un objetivo, gana un punto de VEL con cada uso.",
        formula: (e) => Math.round((d6(2) + 2 + e.stats.FUE) * 1.5),
        efectos: [{ tipo: "GanaVEL", cantidad: 1 }]
      },
      {
        nombre: "Ignición",
        tipo: "Buff",
        categoria: "Habilidad",
        descripcion: "Aumenta su propia FUE y MAG un 50% durante cinco turnos.",
        formula: null,
        efectos: [{ tipo: "Buff", stats: ["FUE", "MAG"], porc: 0.5, duracion: 5 }]
      },
      {
        nombre: "Garras del averno",
        tipo: "Físico",
        categoria: "Habilidad",
        descripcion: "(3d6 + FUE) x 1.5. Ataca a todos.",
        formula: (e) => Math.round((d6(3) + e.stats.FUE) * 1.5),
        objetivo: "Todos",
        efectos: []
      },
      {
        nombre: "Orbes candentes",
        tipo: "Fuego",
        categoria: "Habilidad",
        descripcion: "(3d6 + MAG) x 1.5. Ataca a todos con daño mágico de fuego.",
        formula: (e) => Math.round((d6(3) + e.stats.MAG) * 1.5),
        objetivo: "Todos",
        efectos: []
      },
      {
        nombre: "Fuego Infernal",
        tipo: "Fuego absoluto",
        categoria: "Habilidad",
        descripcion: "Daño de fuego a todos (3d10 + 10) x 1.5. Necesita dos turnos previos para poder usarlo, es daño absoluto por lo que no se tienen en cuenta la resistencia ni el espíritu del objetivo al calcular el daño. Si durante los dos turnos previos a su uso Ifrit recibe 50 puntos de daño, el ataque se cancela.",
        formula: (e) => Math.round((d10(3) + 10) * 1.5),
        objetivo: "Todos",
        efectos: [{ tipo: "Carga", turnos: 2 }, { tipo: "Absoluto" }]
      }
    ],
    magias: [
      {
        nombre: "Piro +",
        tipo: "Fuego",
        categoria: "Magia",
        descripcion: "Daño medio de fuego (2d6 + 2 + MAG) x 1.5. Consume 4 PM.",
        formula: (e) => Math.round((d6(2) + 2 + e.stats.MAG) * 1.5),
        costePM: 4,
        efectos: []
      }
    ],
    debil: ["Hielo", "Agua"],
    inmune: [],
    absorbe: ["Fuego"],
    pasiva: null,
    spriteId: "enemy6",
    sprite: "https://i.imgur.com/6e9etOK.png"
  }
};

export {
  PERSONAJES,
  ENEMIGOS
};