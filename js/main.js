/* -----------------------------------------------
   0. PREFERENCIAS DE ACCESIBILIDAD
   Se aplican antes de inicializar el resto para
   que el slider y otras animaciones respeten las
   preferencias guardadas desde el primer frame.
   ----------------------------------------------- */
(function () {
    var escala = localStorage.getItem('asogam-escala');
    if (escala) document.documentElement.style.fontSize = escala;
    if (localStorage.getItem('asogam-alto-contraste') === 'true') {
        document.body.classList.add('alto-contraste');
    }
    if (localStorage.getItem('asogam-reducir-animaciones') === 'true') {
        document.body.classList.add('reducir-movimiento');
        document.documentElement.style.scrollBehavior = 'auto';
    }
}());


const banner       = document.getElementById('bannerBienvenida');
const btnCerrar    = document.getElementById('bannerCerrar');

// Clave que se guarda en localStorage
const CLAVE_VISITA = 'asogam-visita';

/**
 * Muestra el banner si el usuario no lo ha visto antes.
 * Lee localStorage al cargar la página.
 */
function iniciarBanner() {
    const yaVisito = localStorage.getItem(CLAVE_VISITA);

    if (!yaVisito) {
        // Primera visita: mostrar el banner con una pequeña demora estética
        setTimeout(function () {
            banner.classList.add('visible');
        }, 800);
    }
}

/**
 * Cierra el banner y guarda la visita en localStorage.
 * A partir de aquí el banner no volverá a aparecer.
 */
btnCerrar.addEventListener('click', function () {
    banner.classList.remove('visible');
    localStorage.setItem(CLAVE_VISITA, 'true'); // guardar que ya visitó
});

// Ejecutar al cargar la página
iniciarBanner();


/* -----------------------------------------------
   2. SLIDER DE PROYECTOS
   -----------------------------------------------
   Cada proyecto tiene 2 imágenes que alternan
   automáticamente cada 5 segundos (si el sistema
   no solicita movimiento reducido).
   El usuario puede pausar, navegar con dots o
   con las teclas ← → estando sobre el slider.
   ----------------------------------------------- */

const INTERVALO_SLIDER = 5000; // milisegundos entre cambios

/**
 * Cambia la imagen activa de un slider específico.
 * Actualiza clase activa y aria-current en los dots.
 */
function cambiarSlide(slider, indice) {
    const imagenes = slider.querySelectorAll('.proyecto-imagen');
    const dots     = slider.querySelectorAll('.slider-dot');

    imagenes.forEach(function (img) { img.classList.remove('activa'); });
    dots.forEach(function (dot) {
        dot.classList.remove('activo');
        dot.removeAttribute('aria-current');
    });

    imagenes[indice].classList.add('activa');
    dots[indice].classList.add('activo');
    dots[indice].setAttribute('aria-current', 'true');
}

/**
 * Configura el slider automático, pausa, teclado y dots.
 */
function configurarSlider(slider) {
    const imagenes      = slider.querySelectorAll('.proyecto-imagen');
    const dots          = slider.querySelectorAll('.slider-dot');
    const btnPausa      = slider.querySelector('.slider-pausa');
    const totalSlides   = imagenes.length;
    let indiceActual    = 0;
    let intervalo;
    let pausado         = false;
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        || document.body.classList.contains('reducir-movimiento');

    function iniciarIntervalo() {
        intervalo = setInterval(function () {
            indiceActual = (indiceActual + 1) % totalSlides;
            cambiarSlide(slider, indiceActual);
        }, INTERVALO_SLIDER);
    }

    // Solo auto-avanza si el usuario no prefiere movimiento reducido
    if (!sinMovimiento) {
        iniciarIntervalo();
    }

    // Pausa / reanuda (SC 2.2.2 Nivel A)
    if (btnPausa) {
        btnPausa.addEventListener('click', function () {
            pausado = !pausado;
            if (pausado) {
                clearInterval(intervalo);
                btnPausa.setAttribute('aria-label', 'Reanudar rotación automática de imágenes');
                btnPausa.textContent = '▶';
            } else {
                iniciarIntervalo();
                btnPausa.setAttribute('aria-label', 'Pausar rotación automática de imágenes');
                btnPausa.textContent = '⏸';
            }
        });
    }

    // Navegación con teclado ← → dentro del slider
    slider.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        indiceActual = e.key === 'ArrowRight'
            ? (indiceActual + 1) % totalSlides
            : (indiceActual - 1 + totalSlides) % totalSlides;
        cambiarSlide(slider, indiceActual);
        clearInterval(intervalo);
        if (!pausado && !sinMovimiento) iniciarIntervalo();
    });

    // Clic en los dots: cambio manual + reinicio del intervalo automático
    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            indiceActual = parseInt(dot.getAttribute('data-index'), 10);
            cambiarSlide(slider, indiceActual);
            clearInterval(intervalo);
            if (!pausado && !sinMovimiento) iniciarIntervalo();
        });
    });
}

// Inicializar todos los sliders de la página
const todosLosSliders = document.querySelectorAll('.proyecto-slider');
todosLosSliders.forEach(function (slider) {
    configurarSlider(slider);
});


/* -----------------------------------------------
   3. MENÚ HAMBURGUESA — apertura/cierre en móvil
   ----------------------------------------------- */

const menuBtn  = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

menuBtn.addEventListener('click', function () {
    const estaAbierto = navLinks.classList.contains('abierto');
    navLinks.classList.toggle('abierto');
    menuBtn.setAttribute('aria-expanded', String(!estaAbierto));
});

// Cerrar el menú al hacer clic en un enlace
navLinks.querySelectorAll('.nav-link').forEach(function (enlace) {
    enlace.addEventListener('click', function () {
        navLinks.classList.remove('abierto');
        menuBtn.setAttribute('aria-expanded', 'false');
    });
});

// Cerrar el menú al hacer clic fuera de él
document.addEventListener('click', function (evento) {
    const fueraDelNav = !menuBtn.contains(evento.target) && !navLinks.contains(evento.target);
    if (fueraDelNav && navLinks.classList.contains('abierto')) {
        navLinks.classList.remove('abierto');
        menuBtn.setAttribute('aria-expanded', 'false');
    }
});


/* -----------------------------------------------
   4. ENLACE ACTIVO EN LA NAVEGACIÓN
   Detecta qué sección es visible y resalta el link.
   ----------------------------------------------- */

const secciones        = document.querySelectorAll('section[id]');
const enlaces          = document.querySelectorAll('.nav-link');
const alturaEncabezado = document.querySelector('.encabezado').offsetHeight;

function marcarEnlaceActivo() {
    let seccionActual = '';

    secciones.forEach(function (seccion) {
        if (window.scrollY >= seccion.offsetTop - alturaEncabezado - 50) {
            seccionActual = seccion.getAttribute('id');
        }
    });

    enlaces.forEach(function (enlace) {
        enlace.classList.remove('activo');
        enlace.removeAttribute('aria-current');
        if (enlace.getAttribute('href') === '#' + seccionActual) {
            enlace.classList.add('activo');
            enlace.setAttribute('aria-current', 'true');
        }
    });
}

window.addEventListener('scroll', marcarEnlaceActivo);
marcarEnlaceActivo();


/* -----------------------------------------------
   5. BOTÓN "VOLVER ARRIBA"
   Aparece al superar 400px de scroll.
   ----------------------------------------------- */

const btnArriba = document.getElementById('btnArriba');

function actualizarBtnArriba() {
    if (window.scrollY > 400) {
        btnArriba.classList.add('visible');
    } else {
        btnArriba.classList.remove('visible');
    }
}

btnArriba.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('scroll', actualizarBtnArriba);
actualizarBtnArriba();


/* -----------------------------------------------
   6. PANEL DE ACCESIBILIDAD
   Tamaño de texto, alto contraste y reducción
   de movimiento. Preferencias guardadas en
   localStorage.
   ----------------------------------------------- */

const accFlotante    = document.getElementById('accFlotante');
const accPanel       = document.getElementById('accPanel');
const accPanelCerrar = document.getElementById('accPanelCerrar');
const accContraste   = document.getElementById('accContraste');
const accMovimiento  = document.getElementById('accMovimiento');

const ESCALAS_TEXTO  = ['75%', '87.5%', '100%', '112.5%', '125%', '137.5%'];
const ESCALA_DEFAULT = '100%';

function abrirPanel() {
    accPanel.setAttribute('aria-hidden', 'false');
    accPanel.classList.add('visible');
    accFlotante.setAttribute('aria-expanded', 'true');
    accPanelCerrar.focus();
}

function cerrarPanel() {
    accPanel.setAttribute('aria-hidden', 'true');
    accPanel.classList.remove('visible');
    accFlotante.setAttribute('aria-expanded', 'false');
    accFlotante.focus();
}

accFlotante.addEventListener('click', function () {
    if (accPanel.getAttribute('aria-hidden') === 'false') {
        cerrarPanel();
    } else {
        abrirPanel();
    }
});

accPanelCerrar.addEventListener('click', cerrarPanel);

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && accPanel.getAttribute('aria-hidden') === 'false') {
        cerrarPanel();
    }
});

document.addEventListener('click', function (e) {
    const dentroDelPanel = accPanel.contains(e.target) || accFlotante.contains(e.target);
    if (!dentroDelPanel && accPanel.getAttribute('aria-hidden') === 'false') {
        cerrarPanel();
    }
});

accPanel.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    const focusables = Array.from(accPanel.querySelectorAll('button'));
    const primero    = focusables[0];
    const ultimo     = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
    }
});

// --- Tamaño del texto ---
function obtenerNivelEscala() {
    const actual = document.documentElement.style.fontSize || ESCALA_DEFAULT;
    const idx    = ESCALAS_TEXTO.indexOf(actual);
    return idx >= 0 ? idx : 2;
}

function aplicarEscala(fontSize) {
    document.documentElement.style.fontSize = fontSize;
    if (fontSize === ESCALA_DEFAULT) {
        localStorage.removeItem('asogam-escala');
    } else {
        localStorage.setItem('asogam-escala', fontSize);
    }
}

document.getElementById('accTextoAumentar').addEventListener('click', function () {
    const idx = obtenerNivelEscala();
    if (idx < ESCALAS_TEXTO.length - 1) aplicarEscala(ESCALAS_TEXTO[idx + 1]);
});

document.getElementById('accTextoReducir').addEventListener('click', function () {
    const idx = obtenerNivelEscala();
    if (idx > 0) aplicarEscala(ESCALAS_TEXTO[idx - 1]);
});

document.getElementById('accTextoRestablecer').addEventListener('click', function () {
    aplicarEscala(ESCALA_DEFAULT);
});

// --- Alto contraste ---
var altoContraste = document.body.classList.contains('alto-contraste');

function sincronizarContraste() {
    accContraste.setAttribute('aria-pressed', String(altoContraste));
    accContraste.classList.toggle('acc-btn-activo', altoContraste);
    accContraste.setAttribute('aria-label', altoContraste
        ? 'Desactivar alto contraste' : 'Activar alto contraste');
}

accContraste.addEventListener('click', function () {
    altoContraste = !altoContraste;
    document.body.classList.toggle('alto-contraste', altoContraste);
    localStorage.setItem('asogam-alto-contraste', String(altoContraste));
    sincronizarContraste();
});

sincronizarContraste();

// --- Reducir animaciones ---
var reducirMovimiento = document.body.classList.contains('reducir-movimiento');

function sincronizarMovimiento() {
    accMovimiento.setAttribute('aria-pressed', String(reducirMovimiento));
    accMovimiento.classList.toggle('acc-btn-activo', reducirMovimiento);
    accMovimiento.setAttribute('aria-label', reducirMovimiento
        ? 'Reactivar animaciones' : 'Reducir animaciones');
}

accMovimiento.addEventListener('click', function () {
    reducirMovimiento = !reducirMovimiento;
    document.body.classList.toggle('reducir-movimiento', reducirMovimiento);
    document.documentElement.style.scrollBehavior = reducirMovimiento ? 'auto' : '';
    localStorage.setItem('asogam-reducir-animaciones', String(reducirMovimiento));
    sincronizarMovimiento();
});

sincronizarMovimiento();


/* -----------------------------------------------
   7. NAVBAR — COMPORTAMIENTO EN SCROLL
   Se expande al estar en el hero; se comprime
   al salir de la primera sección.
   ----------------------------------------------- */

const encabezadoEl = document.querySelector('.encabezado');
const seccionHero  = document.getElementById('inicio');

function actualizarNavbar() {
    if (window.scrollY >= seccionHero.offsetHeight) {
        encabezadoEl.classList.add('compacto');
    } else {
        encabezadoEl.classList.remove('compacto');
    }
}

window.addEventListener('scroll', actualizarNavbar);
actualizarNavbar();
