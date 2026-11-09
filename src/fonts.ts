// Font inclusi nel progetto: nessun download durante il render.
// Nel codice dei video si usano con fontFamily: 'Montserrat' | 'Poppins' | 'Bebas Neue'.
import '@fontsource/montserrat/latin-400.css';
import '@fontsource/montserrat/latin-600.css';
import '@fontsource/montserrat/latin-800.css';
import '@fontsource/montserrat/latin-900.css';
import '@fontsource/poppins/latin-400.css';
import '@fontsource/poppins/latin-600.css';
import '@fontsource/poppins/latin-800.css';
import '@fontsource/bebas-neue/latin-400.css';
import { continueRender, delayRender } from 'remotion';

const FACES = [
  '400 40px Montserrat', '600 40px Montserrat', '800 40px Montserrat', '900 40px Montserrat',
  '400 40px Poppins', '600 40px Poppins', '800 40px Poppins',
  '400 40px "Bebas Neue"',
];

// Il render parte solo quando tutti i font sono caricati, così nessun frame usa un font di riserva.
const handle = delayRender('Caricamento font');
Promise.all(FACES.map((f) => document.fonts.load(f)))
  .then(() => continueRender(handle))
  .catch(() => continueRender(handle));
