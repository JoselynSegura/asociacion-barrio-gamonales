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
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
