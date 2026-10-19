export const UI = {
  en: {
    heroEyebrow: '3×3 · Beginner method',
    heroTitle: 'Solve the cube,<br><em>one layer</em> at a time.',
    heroLead: 'Seven short steps, each with a live 3D cube that shows you exactly which moves to make. Drag it, slow it down, step through it move by move.',
    heroCta: 'Start with the notation',
    heroSkip: 'Jump to step 1',
    statSteps: 'steps',
    statAlgs: 'algorithms',
    statTime: 'to learn',
    dragHint: 'Drag to look around',
    notationEyebrow: 'Before we start',
    notationTitle: 'Speak cube',
    notationBody: 'Every move is a letter for the face you turn, looking straight at that face. A plain letter is a <b>clockwise</b> quarter turn, an apostrophe <code>\'</code> means <b>counter-clockwise</b>, and a <code>2</code> means a half turn. <code>y</code> turns the whole cube like <code>U</code>.',
    notationKeys: 'Try the buttons, or your keyboard: <kbd>U</kbd> <kbd>D</kbd> <kbd>R</kbd> <kbd>L</kbd> <kbd>F</kbd> <kbd>B</kbd> — hold <kbd>Shift</kbd> for the prime move.',
    faces: { U: 'Up', D: 'Down', R: 'Right', L: 'Left', F: 'Front', B: 'Back' },
    scramble: 'Scramble',
    reset: 'Reset',
    step: 'Step',
    focusOn: 'Focus on',
    focusOff: 'Focus off',
    drag: 'drag to rotate',
    dragBelow: 'seen from below · drag to rotate',
    learned: 'I got this one',
    finaleEyebrow: 'Step 7 done',
    finaleTitle: 'You solved the cube.',
    finaleBody: 'Keep this cheat sheet handy. After a few solves your hands will remember it for you.',
    backTop: 'Solve it again',
    footer: 'Made with Three.js · <a href="https://github.com/patriciomase/rubik-solver">source on GitHub</a>',
  },
  es: {
    heroEyebrow: '3×3 · Método principiante',
    heroTitle: 'Resuelve el cubo,<br><em>capa por capa</em>.',
    heroLead: 'Siete pasos cortos, cada uno con un cubo 3D en vivo que te muestra exactamente qué movimientos hacer. Arrástralo, ve más lento, avanza movimiento por movimiento.',
    heroCta: 'Empieza por la notación',
    heroSkip: 'Ir al paso 1',
    statSteps: 'pasos',
    statAlgs: 'algoritmos',
    statTime: 'para aprender',
    dragHint: 'Arrastra para mirar',
    notationEyebrow: 'Antes de empezar',
    notationTitle: 'Habla cubo',
    notationBody: 'Cada movimiento es la letra de la cara que giras, mirándola de frente. Una letra sola es un cuarto de vuelta en sentido <b>horario</b>, un apóstrofo <code>\'</code> es <b>antihorario</b>, y un <code>2</code> es media vuelta. <code>y</code> gira el cubo entero como <code>U</code>.',
    notationKeys: 'Prueba los botones o tu teclado: <kbd>U</kbd> <kbd>D</kbd> <kbd>R</kbd> <kbd>L</kbd> <kbd>F</kbd> <kbd>B</kbd>; mantén <kbd>Shift</kbd> para el movimiento inverso.',
    faces: { U: 'Arriba', D: 'Abajo', R: 'Derecha', L: 'Izquierda', F: 'Frente', B: 'Atrás' },
    scramble: 'Mezclar',
    reset: 'Reiniciar',
    step: 'Paso',
    focusOn: 'Foco activado',
    focusOff: 'Foco desactivado',
    drag: 'arrastra para girar',
    dragBelow: 'visto desde abajo · arrastra para girar',
    learned: 'Ya lo aprendí',
    finaleEyebrow: 'Paso 7 listo',
    finaleTitle: 'Resolviste el cubo.',
    finaleBody: 'Ten a mano este resumen. Después de unas cuantas resoluciones tus manos lo recordarán solas.',
    backTop: 'Resolverlo otra vez',
    footer: 'Hecho con Three.js · <a href="https://github.com/patriciomase/rubik-solver">código en GitHub</a>',
  },
};

export function initialLang() {
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'en' || saved === 'es') return saved;
  } catch {}
  return (navigator.language || 'en').toLowerCase().startsWith('es') ? 'es' : 'en';
}

export function saveLang(lang) {
  try { localStorage.setItem('lang', lang); } catch {}
}
