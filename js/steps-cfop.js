// CFOP (Cross, F2L, OLL, PLL) with a 4-look last layer: 2-look OLL + 2-look PLL.
// Same case model as steps.js: start = solved → noise → inverse(segments). Checked by test/verify.mjs.

const SUNE = "R U R' U R U2 R'";
const T_PERM = "R U R' U' R' F R2 U' R' U' R U R' F'";
const Y_PERM = "F R U' R' U' R U R' F' R U R' U' R' F R F'";
const UA = "R U' R U R U R U' R' U' R2";
const UB = "R2 U R U R' U' R' U' R' U R'";
const H_PERM = "M2 U M2 U2 M2 U M2";
const Z_PERM = "M2 U M2 U M' U2 M2 U2 M' U2";

const kind = (h) => h.filter((v) => v).length;
const isCrossOrCenter = (h) => kind(h) === 1 || (h[1] === -1 && kind(h) === 2);
// Cross + the front-right pair we are inserting.
const isFRPair = (h) => isCrossOrCenter(h) || (h[0] === 1 && h[2] === 1 && h[1] <= 0);
// "Only yellow matters" view for OLL: first two layers in color, top shows yellow stickers only.
const yellowOnly = (h, color) => h[1] <= 0 || color === 'yellow';

const c = (en, es) => ({ en, es });

export const STEPS = [
  {
    id: 'cross',
    group: 'C',
    goal: 'cross',
    below: true,
    focus: isCrossOrCenter,
    noise: "R U R' L' U2 L B U' B' F U F' U2 R U2 R' L' U' L",
    title: c('Cross on the bottom', 'Cruz abajo'),
    tagline: c('Same cross, no flipping, fewer moves.', 'La misma cruz, sin dar vuelta el cubo y con menos movimientos.'),
    body: c(
      'Build the white cross <b>directly on the bottom</b> — no daisy, no flipping the cube. Use the 15 seconds of inspection to plan it all; good crosses take <b>8 moves or fewer</b>. The new trick: you can turn <kbd>D</kbd> to bring the target slot to the edge, and turn it back after.',
      'Arma la cruz blanca <b>directamente abajo</b>: sin margarita y sin dar vuelta el cubo. Usa los 15 segundos de inspección para planearla completa; una buena cruz lleva <b>8 movimientos o menos</b>. El truco nuevo: puedes girar <kbd>D</kbd> para llevar el hueco hacia la arista y luego devolverlo.',
    ),
    tip: c(
      'Don\'t solve edges one at a time in isolation — look for moves that fix two at once, and solve them relative to each other first; one <kbd>D</kbd> turn at the end lines everything up.',
      'No resuelvas las aristas de a una por separado: busca movimientos que arreglen dos a la vez y resuélvelas primero entre sí; un giro de <kbd>D</kbd> al final alinea todo.',
    ),
    cheat: [{ name: c('Use D to move the slot', 'Usa D para mover el hueco'), alg: "D R' D'" }],
    cases: [
      {
        name: c('Edge in the middle layer', 'Arista en la capa media'),
        hint: c('Green-white edge at front-right with white facing front. Move the slot under it, drop it, put the slot back.', 'Arista verde-blanca adelante a la derecha con el blanco al frente. Mueve el hueco debajo, bájala y devuelve el hueco.'),
        segments: [{ alg: 'D', label: 'slot' }, { alg: "R'", label: 'drop' }, { alg: "D'", label: 'back' }],
      },
      {
        name: c('In the wrong bottom slot', 'En el hueco equivocado'),
        hint: c('Green-white edge is sitting in the orange slot; the orange edge is on top. One turn swaps them.', 'La arista verde-blanca está en el hueco naranja y la naranja está arriba. Un giro las intercambia.'),
        segments: [{ alg: 'R2' }, { alg: 'U' }, { alg: 'F2' }],
      },
      {
        name: c('Flipped in place', 'Invertida en su lugar'),
        hint: c('Right spot, wrong way round: white facing front. Lift it out and bring it back in flipped.', 'Lugar correcto pero al revés: el blanco mira al frente. Sácala y vuelve a meterla girada.'),
        segments: [{ alg: "F'" }, { alg: "D R' D'" }],
      },
    ],
  },
  {
    id: 'f2l',
    group: 'F',
    goal: 'f2l',
    focus: isFRPair,
    noise: `${SUNE} U2 ${T_PERM} U ${Y_PERM}`,
    title: c('F2L: pair & insert', 'F2L: emparejar e insertar'),
    tagline: c('The biggest speed-up: corner + edge in one go.', 'La gran mejora: esquina + arista de una vez.'),
    body: c(
      'Instead of a corner, then an edge, CFOP solves each first-two-layers slot in one go. Find a white corner and its matching edge, <b>join them into a pair in the top layer</b>, then drop the pair into its slot. Every case below is for the <b>front-right</b> slot; mirror it for the left.',
      'En vez de esquina y después arista, CFOP resuelve cada hueco de las dos primeras capas de una vez. Busca una esquina blanca y su arista, <b>únelas en un par en la capa de arriba</b> y luego baja el par a su hueco. Cada caso de abajo es para el hueco de <b>adelante a la derecha</b>; espéjalo para la izquierda.',
    ),
    tip: c(
      'This is "intuitive" F2L: watch how each case first separates or joins the pieces, then inserts. Once you see the pattern you can solve cases you\'ve never memorised. Use the Focus toggle to see only the pair.',
      'Esto es F2L "intuitivo": mira cómo cada caso primero separa o une las piezas y luego inserta. Cuando veas el patrón podrás resolver casos que nunca memorizaste. Usa el Foco para ver solo el par.',
    ),
    cheat: [
      { name: c('Basic insert', 'Inserción básica'), alg: "U R U' R'" },
      { name: c('Corner white up', 'Esquina blanco arriba'), alg: "R U2 R' U' R U R'" },
    ],
    cases: [
      {
        name: c('Basic insert', 'Inserción básica'),
        hint: c('Corner above the slot with white facing front; edge next to it on the right.', 'Esquina sobre el hueco con el blanco al frente; arista a su derecha.'),
        segments: [{ alg: 'U', label: 'set up' }, { alg: "R U' R'", label: 'insert' }],
      },
      {
        name: c('Basic insert (left)', 'Inserción básica (izq.)'),
        hint: c('Mirror: white facing right; edge in front of it.', 'Espejo: blanco a la derecha; arista delante.'),
        segments: [{ alg: "U'", label: 'set up' }, { alg: "F' U F", label: 'insert' }],
      },
      {
        name: c('Edge at the back', 'Arista atrás'),
        hint: c('White facing right, edge across the top at the back: the R turn carries the edge over to meet the corner.', 'Blanco a la derecha, arista atrás arriba: el giro R lleva la arista hasta la esquina.'),
        segments: [{ alg: "R U R'", label: 'pair + insert' }],
      },
      {
        name: c('Corner white up', 'Esquina blanco arriba'),
        hint: c('White sticker on top. Break it out, re-pair, insert.', 'Blanco arriba. Sepáralos, vuelve a emparejar e inserta.'),
        segments: [{ alg: "R U2 R'", label: 'hide' }, { alg: "U' R U R'", label: 'insert' }],
      },
      {
        name: c('Corner solved, edge on top', 'Esquina lista, arista arriba'),
        hint: c('You already know this one — it is the beginner middle-layer algorithm!', '¡Este ya lo conoces: es el algoritmo de la capa media del método principiante!'),
        segments: [{ alg: "U R U' R'" }, { alg: "U' F' U F" }],
      },
      {
        name: c('Corner twisted in slot', 'Esquina girada en el hueco'),
        hint: c('Corner in its slot but white faces front; edge on top on the right.', 'Esquina en su hueco con el blanco al frente; arista arriba a la derecha.'),
        segments: [{ alg: "R U' R'", label: 'lift' }, { alg: "U R U' R'", label: 'insert' }],
      },
      {
        name: c('Both stuck in slot', 'Ambas atrapadas'),
        hint: c('Edge correct, corner twisted. Pull the pair out, rebuild it, put it back.', 'Arista bien, esquina girada. Saca el par, rearmalo y vuelve a meterlo.'),
        segments: [{ alg: "R U' R'", label: 'out' }, { alg: "U' R U R'", label: 'pair' }, { alg: "U' R U2 R'", label: 'insert' }],
      },
    ],
  },
  {
    id: 'oll-edges',
    group: 'O',
    goal: 'yellowCross',
    focus: yellowOnly,
    noise: `${SUNE} U ${T_PERM} U' ${UA}`,
    title: c('OLL 1: yellow cross', 'OLL 1: cruz amarilla'),
    tagline: c('One algorithm per shape — no repeating.', 'Un algoritmo por figura, sin repetir.'),
    body: c(
      'OLL = <b>Orient the Last Layer</b>: make the whole top yellow. In the 2-look version you do it in two passes, edges first. You already know the line algorithm; add a <b>wide</b> <kbd>f</kbd> version for the L and combine both for the dot.',
      'OLL = <b>Orientar la Última Capa</b>: dejar todo el techo amarillo. En la versión de 2 pasos lo haces en dos tandas, aristas primero. El algoritmo de la línea ya lo conoces; suma una versión con <kbd>f</kbd> <b>ancho</b> para la L y combina ambos para el punto.',
    ),
    tip: c(
      'Lowercase <kbd>f</kbd> means turn the front <b>two</b> layers together. The Focus view shows only yellow on top — that\'s all you need to look at here.',
      'La <kbd>f</kbd> minúscula significa girar las <b>dos</b> capas frontales juntas. La vista Foco muestra solo el amarillo de arriba: es lo único que importa acá.',
    ),
    cheat: [
      { name: c('Line', 'Línea'), alg: "F R U R' U' F'" },
      { name: c('L shape', 'L'), alg: "f R U R' U' f'" },
      { name: c('Dot', 'Punto'), alg: "F R U R' U' F' f R U R' U' f'" },
    ],
    cases: [
      { name: c('Line', 'Línea'), hint: c('Hold the line horizontal.', 'Pon la línea horizontal.'), segments: [{ alg: "F R U R' U' F'" }] },
      { name: c('L shape', 'Forma de L'), hint: c('Hold the L pointing to the front and right.', 'Pon la L apuntando al frente y a la derecha.'), segments: [{ alg: "f R U R' U' f'" }] },
      { name: c('Dot', 'Punto'), hint: c('No yellow edges up. Do the line alg, then the L alg straight away.', 'Ninguna arista amarilla arriba. Haz el de la línea y enseguida el de la L.'), segments: [{ alg: "F R U R' U' F'", label: '→ L' }, { alg: "f R U R' U' f'", label: '→ +' }] },
    ],
  },
  {
    id: 'oll-corners',
    group: 'O',
    goal: 'oll',
    focus: yellowOnly,
    noise: `${T_PERM} U ${UA} U2`,
    title: c('OLL 2: yellow corners', 'OLL 2: esquinas amarillas'),
    tagline: c('Seven patterns, seven algorithms.', 'Siete patrones, siete algoritmos.'),
    body: c(
      'With the cross done, there are only <b>7 ways</b> the corners can be twisted. Count the corners already yellow-up (0, 1 or 2), look at where the other yellow stickers point, and match the pattern. Turn <kbd>U</kbd> until it looks exactly like the demo before starting.',
      'Con la cruz lista, las esquinas solo pueden estar giradas de <b>7 formas</b>. Cuenta cuántas esquinas ya tienen el amarillo arriba (0, 1 o 2), mira hacia dónde apuntan los otros amarillos y busca el patrón. Gira <kbd>U</kbd> hasta que se vea igual que la demo antes de empezar.',
    ),
    tip: c(
      'Learn Sune and Antisune first — they appear the most, and every other case can be solved by repeating them. Learn the rest as you go.',
      'Aprende primero Sune y Antisune: son los que más aparecen y cualquier otro caso se puede resolver repitiéndolos. El resto apréndelo con el tiempo.',
    ),
    cheat: [
      { name: c('Sune', 'Sune'), alg: SUNE },
      { name: c('Antisune', 'Antisune'), alg: "R U2 R' U' R U' R'" },
      { name: c('H', 'H'), alg: "F R U R' U' R U R' U' R U R' U' F'" },
      { name: c('Pi', 'Pi'), alg: "R U2 R2 U' R2 U' R2 U2 R" },
      { name: c('Headlights', 'Faros'), alg: "R2 D R' U2 R D' R' U2 R'" },
      { name: c('T', 'T'), alg: "r U R' U' r' F R F'" },
      { name: c('Bowtie', 'Moño'), alg: "F' r U R' U' r' F R" },
    ],
    cases: [
      { name: c('Sune', 'Sune'), hint: c('1 corner up, at front-left. The front-right corner\'s yellow faces you.', '1 esquina arriba, adelante a la izquierda. El amarillo de la esquina de adelante a la derecha te mira.'), segments: [{ alg: SUNE }] },
      { name: c('Antisune', 'Antisune'), hint: c('1 corner up, at back-right. The front-left corner\'s yellow faces you.', '1 esquina arriba, atrás a la derecha. El amarillo de la esquina de adelante a la izquierda te mira.'), segments: [{ alg: "R U2 R' U' R U' R'" }] },
      { name: c('H', 'H'), hint: c('0 up. Two yellows face you and two face the back.', '0 arriba. Dos amarillos te miran y dos miran atrás.'), segments: [{ alg: "F R U R' U' R U R' U' R U R' U' F'" }] },
      { name: c('Pi', 'Pi'), hint: c('0 up. Two yellows face left; the others face front and back.', '0 arriba. Dos amarillos miran a la izquierda; los otros al frente y atrás.'), segments: [{ alg: "R U2 R2 U' R2 U' R2 U2 R" }] },
      { name: c('Headlights', 'Faros'), hint: c('2 up at the back; the front two both face you, like headlights.', '2 arriba atrás; las dos de adelante te miran, como faros.'), segments: [{ alg: "R2 D R' U2 R D' R' U2 R'" }] },
      { name: c('T', 'T'), hint: c('2 up on the right; the left ones face front and back.', '2 arriba a la derecha; las de la izquierda miran al frente y atrás.'), segments: [{ alg: "r U R' U' r' F R F'" }] },
      { name: c('Bowtie', 'Moño'), hint: c('2 up on a diagonal (front-left, back-right). Front-right yellow faces you.', '2 arriba en diagonal (adelante-izq., atrás-der.). El amarillo de adelante a la derecha te mira.'), segments: [{ alg: "F' r U R' U' r' F R" }] },
    ],
  },
  {
    id: 'pll-corners',
    group: 'P',
    goal: 'pllCorners',
    noise: UA,
    title: c('PLL 1: swap corners', 'PLL 1: cambiar esquinas'),
    tagline: c('Look for headlights.', 'Busca los faros.'),
    body: c(
      'PLL = <b>Permute the Last Layer</b>: the top is all yellow, now move pieces to their places. Look at the side stickers of the corners. <b>Headlights</b> are two corners on the same side with matching colors. Headlights on one side → hold them on the <b>left</b> and do the T-perm. No headlights anywhere → Y-perm.',
      'PLL = <b>Permutar la Última Capa</b>: el techo ya es amarillo, ahora cada pieza va a su lugar. Mira los stickers laterales de las esquinas. Los <b>faros</b> son dos esquinas del mismo lado con el mismo color. Faros en un lado → ponlos a la <b>izquierda</b> y haz la T-perm. Sin faros en ningún lado → Y-perm.',
    ),
    tip: c(
      'Headlights on all four sides means the corners are already done — skip to the next step.',
      'Si hay faros en los cuatro lados, las esquinas ya están: pasa al siguiente paso.',
    ),
    cheat: [
      { name: c('T-perm', 'T-perm'), alg: T_PERM },
      { name: c('Y-perm', 'Y-perm'), alg: Y_PERM },
    ],
    cases: [
      { name: c('Headlights → T-perm', 'Faros → T-perm'), hint: c('Matching corners on the left side. Swaps the two right corners.', 'Esquinas iguales del lado izquierdo. Intercambia las dos esquinas de la derecha.'), segments: [{ alg: T_PERM }] },
      { name: c('No headlights → Y-perm', 'Sin faros → Y-perm'), hint: c('No side has matching corners. Swaps two diagonal corners.', 'Ningún lado tiene esquinas iguales. Intercambia dos esquinas en diagonal.'), segments: [{ alg: Y_PERM }] },
    ],
  },
  {
    id: 'pll-edges',
    group: 'P',
    goal: 'solved',
    noise: '',
    title: c('PLL 2: cycle edges', 'PLL 2: ciclar aristas'),
    tagline: c('Four cases and you\'re done.', 'Cuatro casos y listo.'),
    body: c(
      'Corners are in place; now only the edges move. If one side is fully solved (a <b>bar</b>), hold it at the <b>back</b> and do a U-perm — check where the front edge needs to go to pick Ua or Ub. No bar: it\'s an H-perm (opposite swaps) or a Z-perm (neighbour swaps).',
      'Las esquinas ya están; ahora solo se mueven las aristas. Si un lado está completo (una <b>barra</b>), ponlo <b>atrás</b> y haz una U-perm: mira a dónde tiene que ir la arista de adelante para elegir Ua o Ub. Sin barra: es H-perm (cambios opuestos) o Z-perm (cambios entre vecinas).',
    ),
    tip: c(
      '<kbd>M</kbd> is the middle slice between L and R, turning the same way as <kbd>L</kbd>. Flick it with your ring finger from the back.',
      '<kbd>M</kbd> es la capa del medio entre L y R, y gira igual que <kbd>L</kbd>. Empújala con el dedo anular desde atrás.',
    ),
    cheat: [
      { name: c('Ua', 'Ua'), alg: UA },
      { name: c('Ub', 'Ub'), alg: UB },
      { name: c('H', 'H'), alg: H_PERM },
      { name: c('Z', 'Z'), alg: Z_PERM },
    ],
    cases: [
      { name: c('Ua', 'Ua'), hint: c('Bar at the back. The front edge belongs on the right.', 'Barra atrás. La arista de adelante va a la derecha.'), segments: [{ alg: UA }] },
      { name: c('Ub', 'Ub'), hint: c('Bar at the back. The front edge belongs on the left.', 'Barra atrás. La arista de adelante va a la izquierda.'), segments: [{ alg: UB }] },
      { name: c('H', 'H'), hint: c('No bar. Front↔back and left↔right are swapped.', 'Sin barra. Adelante↔atrás e izquierda↔derecha están cambiadas.'), segments: [{ alg: H_PERM }] },
      { name: c('Z', 'Z'), hint: c('No bar. Front↔right and back↔left are swapped.', 'Sin barra. Adelante↔derecha y atrás↔izquierda están cambiadas.'), segments: [{ alg: Z_PERM }] },
    ],
  },
  {
    id: 'full',
    group: '∑',
    goal: 'solved',
    noise: '',
    showScramble: true,
    title: c('Put it all together', 'Todo junto'),
    tagline: c('One full CFOP solve, start to finish.', 'Una resolución CFOP completa, de principio a fin.'),
    body: c(
      'Here is a complete solve from a scramble: cross, four F2L pairs, two looks of OLL, two looks of PLL, and a final <kbd>U</kbd> to line up the top. About <b>65 moves</b> — the beginner method usually takes over 120. Grab your cube, apply the scramble, and follow along.',
      'Acá tienes una resolución completa desde una mezcla: cruz, cuatro pares de F2L, dos pasos de OLL, dos de PLL y un <kbd>U</kbd> final para alinear el techo. Unos <b>65 movimientos</b>: con el método principiante suelen ser más de 120. Toma tu cubo, aplica la mezcla y síguela.',
    ),
    tip: c(
      'Next level: learn full OLL (57 cases) and PLL (21) to do the last layer in 2 looks instead of 4, and practise F2L "lookahead" — finding the next pair while inserting the current one.',
      'Siguiente nivel: aprende OLL completo (57 casos) y PLL (21) para hacer la última capa en 2 pasos en vez de 4, y practica el "lookahead" en F2L: buscar el próximo par mientras insertas el actual.',
    ),
    cheat: [],
    cases: [
      {
        name: c('Example solve', 'Resolución de ejemplo'),
        segments: [
          { alg: "D' R2 F' L D2 B U' R'", label: 'Cross', goal: 'cross' },
          { alg: "U R U' R'", label: 'Pair 1' },
          { alg: "U' L' U L", label: 'Pair 2' },
          { alg: "U' R' U R", label: 'Pair 3' },
          { alg: "U L U' L'", label: 'Pair 4', goal: 'f2l' },
          { alg: "F R U R' U' F'", label: 'OLL 1', goal: 'yellowCross' },
          { alg: SUNE, label: 'OLL 2', goal: 'oll' },
          { alg: `U ${T_PERM}`, label: 'PLL 1' },
          { alg: UA, label: 'PLL 2' },
          { alg: "U'", label: 'AUF', goal: 'solved' },
        ],
      },
    ],
  },
];
