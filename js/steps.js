// Step + case definitions. Each case's starting state is: solved → `noise` → inverse(all segments),
// so playing the segments always lands on a state where this step's goal holds.
// `noise` only scrambles pieces that later steps take care of, so the demo looks realistic.
// Every case is checked by test/verify.mjs.

const SEXY = "R U R' U'";
const RIGHT = "U R U' R' U' F' U F";
const LEFT = "U' L' U L U F U' F'";
const FRURUF = "F R U R' U' F'";
const SUNE = "R U R' U R U2 R'";
const NIKLAS = "U R U' L' U R' U' L";
const TWIST = "R' D' R D";

const rep = (alg, n) => Array.from({ length: n }, (_, i) => ({ alg, label: `${i + 1}/${n}` }));

// Focus filters decide which pieces keep their colors when "Focus" is on.
const isDEdgeOrCenter = (h) => (h[1] === -1 && h.filter((v) => v).length <= 2) || h.filter((v) => v).length === 1;
const isDLayerOrCenter = (h) => h[1] === -1 || h.filter((v) => v).length === 1;
const isF2LOrCenter = (h) => h[1] <= 0 || h.filter((v) => v).length === 1;

export const STEPS = [
  {
    id: 'cross',
    cheat: [{ name: { en: 'White up', es: 'Blanco arriba' }, alg: 'F2' }, { name: { en: 'White out', es: 'Blanco afuera' }, alg: "U' R' F R" }],
    goal: 'cross',
    below: true,
    focus: isDEdgeOrCenter,
    noise: "R U R' L' U2 L B U' B' F U F' U2 R U2 R' L' U' L",
    title: { en: 'The white cross', es: 'La cruz blanca' },
    tagline: { en: 'Build a plus sign on the bottom — with matching sides.', es: 'Arma una cruz en la base, con los lados coincidiendo.' },
    body: {
      en: 'Hold the cube with the <b>white center on the bottom</b>. Find a white edge in the top layer and turn <kbd>U</kbd> until its other color sits above the center of the same color. Then bring it down using one of the cases below. Repeat for all four white edges.',
      es: 'Sostén el cubo con el <b>centro blanco abajo</b>. Busca una arista blanca en la capa superior y gira <kbd>U</kbd> hasta que su otro color quede sobre el centro del mismo color. Luego bájala con uno de los casos de abajo. Repite con las cuatro aristas blancas.',
    },
    tip: {
      en: 'Edge stuck in the bottom but in the wrong spot or flipped? Turn that face twice (e.g. <kbd>F2</kbd>) to bring it up, then treat it as a top-layer edge.',
      es: '¿Arista atrapada abajo pero mal ubicada o invertida? Gira esa cara dos veces (ej. <kbd>F2</kbd>) para subirla y trátala como una arista de arriba.',
    },
    cases: [
      { name: { en: 'White facing up', es: 'Blanco hacia arriba' }, segments: [{ alg: 'F2' }] },
      { name: { en: 'White facing out', es: 'Blanco hacia afuera' }, segments: [{ alg: "U' R' F R" }] },
      { name: { en: 'In the middle layer', es: 'En la capa media' }, segments: [{ alg: 'F' }] },
    ],
  },
  {
    id: 'corners',
    cheat: [{ alg: SEXY }],
    goal: 'firstLayer',
    below: true,
    focus: isDLayerOrCenter,
    noise: `${RIGHT} U2 ${SUNE} ${LEFT} U ${FRURUF}`,
    title: { en: 'White corners', es: 'Esquinas blancas' },
    tagline: { en: 'Finish the whole first layer.', es: 'Completa toda la primera capa.' },
    body: {
      en: 'Find a corner with white in the top layer. Turn <kbd>U</kbd> until it sits right <b>above its slot</b> (between its three matching centers) and hold that slot at the front-right. Now repeat <span class="alg-inline">R U R\' U\'</span> until the corner drops in solved — 1, 3 or 5 times depending on where white is facing.',
      es: 'Busca una esquina con blanco en la capa superior. Gira <kbd>U</kbd> hasta que quede <b>justo encima de su hueco</b> (entre sus tres centros) y sostén ese hueco adelante a la derecha. Repite <span class="alg-inline">R U R\' U\'</span> hasta que la esquina baje resuelta: 1, 3 o 5 veces según hacia dónde mire el blanco.',
    },
    tip: {
      en: 'Corner already in the bottom but wrong? Hold it at front-right and do <span class="alg-inline">R U R\' U\'</span> once to pop it up.',
      es: '¿Esquina abajo pero mal puesta? Ponla adelante a la derecha y haz <span class="alg-inline">R U R\' U\'</span> una vez para sacarla.',
    },
    cases: [
      { name: { en: 'White facing right', es: 'Blanco a la derecha' }, segments: rep(SEXY, 1) },
      { name: { en: 'White facing up', es: 'Blanco hacia arriba' }, segments: rep(SEXY, 3) },
      { name: { en: 'White facing front', es: 'Blanco al frente' }, segments: rep(SEXY, 5) },
    ],
  },
  {
    id: 'middle',
    cheat: [{ name: { en: 'Right', es: 'Derecha' }, alg: RIGHT }, { name: { en: 'Left', es: 'Izquierda' }, alg: LEFT }],
    goal: 'f2l',
    focus: isF2LOrCenter,
    noise: `${SUNE} U ${FRURUF} ${NIKLAS} U'`,
    title: { en: 'Middle layer edges', es: 'Aristas de la capa media' },
    tagline: { en: 'Two layers down, one to go.', es: 'Dos capas listas, falta una.' },
    body: {
      en: 'Find a top-layer edge <b>without yellow</b>. Turn <kbd>U</kbd> until its front color matches the front center, forming an upside-down "T". Look at its top color: if it matches the <b>right</b> center, it goes right; if it matches the <b>left</b> center, it goes left.',
      es: 'Busca una arista de arriba <b>sin amarillo</b>. Gira <kbd>U</kbd> hasta que su color frontal coincida con el centro frontal, formando una "T" invertida. Mira su color de arriba: si coincide con el centro de la <b>derecha</b>, va a la derecha; si coincide con el de la <b>izquierda</b>, va a la izquierda.',
    },
    tip: {
      en: 'Edge stuck in the middle layer but flipped or in the wrong slot? Insert any top edge there with the same algorithm to kick it out.',
      es: '¿Arista atrapada en la capa media pero invertida o en el hueco equivocado? Inserta cualquier arista de arriba ahí con el mismo algoritmo para sacarla.',
    },
    cases: [
      { name: { en: 'Goes right', es: 'Va a la derecha' }, segments: [{ alg: "U R U' R'", label: '1' }, { alg: "U' F' U F", label: '2' }] },
      { name: { en: 'Goes left', es: 'Va a la izquierda' }, segments: [{ alg: "U' L' U L", label: '1' }, { alg: "U F U' F'", label: '2' }] },
    ],
  },
  {
    id: 'ycross',
    cheat: [{ alg: FRURUF }],
    goal: 'yellowCross',
    noise: `${SUNE} U ${NIKLAS} U2 ${SUNE}`,
    title: { en: 'Yellow cross', es: 'Cruz amarilla' },
    tagline: { en: 'One algorithm, up to three times.', es: 'Un algoritmo, hasta tres veces.' },
    body: {
      en: 'Yellow stays on top from now on. Ignore the corners and look at the yellow <b>edges</b> on top: you\'ll see a dot, an "L" or a line. Hold the shape as shown and apply <span class="alg-inline">F R U R\' U\' F\'</span>. Each time you do it, the shape moves forward: dot → L → line → cross.',
      es: 'Desde ahora el amarillo queda arriba. Ignora las esquinas y mira las <b>aristas</b> amarillas de arriba: verás un punto, una "L" o una línea. Ubica la figura como se muestra y aplica <span class="alg-inline">F R U R\' U\' F\'</span>. Cada vez avanza: punto → L → línea → cruz.',
    },
    tip: {
      en: 'Hold the "L" pointing to the back-left (like 9 and 12 on a clock) and the line horizontal.',
      es: 'Pon la "L" hacia atrás a la izquierda (como las 9 y las 12 en un reloj) y la línea horizontal.',
    },
    cases: [
      { name: { en: 'Line', es: 'Línea' }, segments: [{ alg: FRURUF, label: '→ +' }] },
      { name: { en: 'L shape', es: 'Forma de L' }, segments: [{ alg: FRURUF, label: '→ —' }, { alg: FRURUF, label: '→ +' }] },
      { name: { en: 'Dot', es: 'Punto' }, segments: [{ alg: FRURUF, label: '→ L' }, { alg: 'U2', label: 'L ↖' }, { alg: FRURUF, label: '→ —' }, { alg: FRURUF, label: '→ +' }] },
    ],
  },
  {
    id: 'yedges',
    cheat: [{ alg: SUNE }],
    goal: 'yellowEdges',
    noise: `${NIKLAS} ${TWIST} ${TWIST} U ${TWIST} ${TWIST} ${TWIST} ${TWIST} U'`,
    title: { en: 'Match the yellow edges', es: 'Ubica las aristas amarillas' },
    tagline: { en: 'Line the cross up with the side centers.', es: 'Alinea la cruz con los centros laterales.' },
    body: {
      en: 'Turn <kbd>U</kbd> until <b>two</b> yellow edges match their side centers. If they are <b>next to each other</b>, hold them at the back and right and apply <span class="alg-inline">R U R\' U R U2 R\'</span>, then a final <kbd>U</kbd>. If they are <b>opposite</b>, apply it once from any angle — you\'ll get the adjacent case.',
      es: 'Gira <kbd>U</kbd> hasta que <b>dos</b> aristas amarillas coincidan con sus centros laterales. Si están <b>una al lado de la otra</b>, ponlas atrás y a la derecha y aplica <span class="alg-inline">R U R\' U R U2 R\'</span>, y luego un <kbd>U</kbd> final. Si están <b>opuestas</b>, aplícalo una vez desde cualquier lado y tendrás el caso adyacente.',
    },
    tip: {
      en: 'Corners will get shuffled here — that is fine, the next two steps fix them.',
      es: 'Las esquinas se van a mezclar aquí; no pasa nada, los próximos dos pasos las arreglan.',
    },
    cases: [
      { name: { en: 'Adjacent', es: 'Adyacentes' }, segments: [{ alg: SUNE, label: 'Sune' }, { alg: 'U', label: 'U' }] },
      { name: { en: 'Opposite', es: 'Opuestas' }, segments: [{ alg: SUNE, label: 'Sune' }, { alg: "U'", label: 'U' }, { alg: SUNE, label: 'Sune' }, { alg: 'U2', label: 'U' }] },
    ],
  },
  {
    id: 'ycorners',
    cheat: [{ alg: NIKLAS }],
    goal: 'cornersPlaced',
    noise: `${TWIST} ${TWIST} U ${TWIST} ${TWIST} ${TWIST} ${TWIST} U'`,
    title: { en: 'Place the yellow corners', es: 'Ubica las esquinas amarillas' },
    tagline: { en: 'Right spot first, right twist later.', es: 'Primero el lugar, después el giro.' },
    body: {
      en: 'A corner is "in place" when it sits between the three centers of its colors — even if it is twisted. Find one in place and hold it at the <b>front-right</b>. Apply <span class="alg-inline">U R U\' L\' U R\' U\' L</span> once or twice until all four are in place. None in place? Apply it once from anywhere and one will be.',
      es: 'Una esquina está "en su lugar" cuando queda entre los tres centros de sus colores, aunque esté girada. Busca una en su lugar y ponla <b>adelante a la derecha</b>. Aplica <span class="alg-inline">U R U\' L\' U R\' U\' L</span> una o dos veces hasta que las cuatro estén en su lugar. ¿Ninguna? Aplícalo una vez desde cualquier lado y aparecerá una.',
    },
    tip: {
      en: 'The front-right corner never moves during this algorithm — the other three rotate around it.',
      es: 'La esquina de adelante a la derecha no se mueve con este algoritmo: las otras tres giran alrededor.',
    },
    cases: [
      { name: { en: 'One in place (×1)', es: 'Una en su lugar (×1)' }, segments: rep(NIKLAS, 1) },
      { name: { en: 'One in place (×2)', es: 'Una en su lugar (×2)' }, segments: rep(NIKLAS, 2) },
      { name: { en: 'None in place', es: 'Ninguna en su lugar' }, segments: [{ alg: NIKLAS, label: '1' }, { alg: 'y', label: '↻' }, { alg: NIKLAS, label: '2' }, { alg: "y'", label: '↺' }] },
    ],
  },
  {
    id: 'twist',
    cheat: [{ alg: TWIST }],
    goal: 'solved',
    noise: '',
    title: { en: 'Twist the last corners', es: 'Gira las últimas esquinas' },
    tagline: { en: 'Trust the process. Seriously.', es: 'Confía en el proceso. En serio.' },
    body: {
      en: 'Hold the cube with an unsolved corner at the <b>front-right top</b>. Repeat <span class="alg-inline">R\' D\' R D</span> until its yellow faces up (2 or 4 times). Then turn <b>only</b> <kbd>U</kbd> to bring the next unsolved corner to the front-right and repeat. Never rotate the whole cube during this step.',
      es: 'Sostén el cubo con una esquina sin resolver <b>arriba adelante a la derecha</b>. Repite <span class="alg-inline">R\' D\' R D</span> hasta que su amarillo mire hacia arriba (2 o 4 veces). Luego gira <b>solo</b> <kbd>U</kbd> para traer la siguiente esquina sin resolver adelante a la derecha y repite. Nunca gires el cubo entero en este paso.',
    },
    tip: {
      en: 'The bottom layers will look destroyed halfway through. Don\'t panic — they come back once every corner is twisted.',
      es: 'A mitad de camino las capas de abajo se verán destruidas. No te asustes: vuelven cuando todas las esquinas estén giradas.',
    },
    cases: [
      {
        name: { en: 'Two corners', es: 'Dos esquinas' },
        segments: [...rep(TWIST, 2), { alg: 'U', label: 'U' }, ...rep(TWIST, 4), { alg: "U'", label: 'U' }],
      },
      {
        name: { en: 'Three corners', es: 'Tres esquinas' },
        segments: [...rep(TWIST, 2), { alg: 'U', label: 'U' }, ...rep(TWIST, 2), { alg: 'U', label: 'U' }, ...rep(TWIST, 2), { alg: 'U2', label: 'U' }],
      },
    ],
  },
];
