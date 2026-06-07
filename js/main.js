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
   automáticamente cada 5 segundos.
   El usuario también puede cambiar la imagen
   haciendo clic en los puntos (dots).
   ----------------------------------------------- */

const INTERVALO_SLIDER = 5000; // milisegundos entre cambios

/**
 * Cambia la imagen activa de un slider específico.
 * @param {HTMLElement} slider - el contenedor del slider
 * @param {number}      indice - índice de la imagen a mostrar
 */
function cambiarSlide(slider, indice) {
    const imagenes = slider.querySelectorAll('.proyecto-imagen');
    const dots     = slider.querySelectorAll('.slider-dot');

    // Quitar clase "activa" de la imagen y dot actuales
    imagenes.forEach(function (img) { img.classList.remove('activa'); });
    dots.forEach(function (dot)     { dot.classList.remove('activo'); });

    // Agregar clase "activa" a la imagen y dot del índice indicado
    imagenes[indice].classList.add('activa');
    dots[indice].classList.add('activo');
}

/**
 * Configura el slider automático y los botones de un proyecto.
 * @param {HTMLElement} slider - el contenedor con data-proyecto
 */
function configurarSlider(slider) {
    const imagenes   = slider.querySelectorAll('.proyecto-imagen');
    const dots       = slider.querySelectorAll('.slider-dot');
    const totalSlides = imagenes.length;
    let indiceActual  = 0;

    // Rotación automática cada INTERVALO_SLIDER milisegundos
    const intervalo = setInterval(function () {
        indiceActual = (indiceActual + 1) % totalSlides; // ciclo: 0 → 1 → 0 → 1...
        cambiarSlide(slider, indiceActual);
    }, INTERVALO_SLIDER);

    // Clic en los dots: cambio manual de imagen
    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            indiceActual = parseInt(dot.getAttribute('data-index'));
            cambiarSlide(slider, indiceActual);

            // Reiniciar el intervalo para que no cambie justo después del clic
            clearInterval(intervalo);
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

const secciones = document.querySelectorAll('section[id]');
const enlaces   = document.querySelectorAll('.nav-link');

function marcarEnlaceActivo() {
    let seccionActual = '';

    secciones.forEach(function (seccion) {
        if (window.scrollY >= seccion.offsetTop - 120) {
            seccionActual = seccion.getAttribute('id');
        }
    });

    enlaces.forEach(function (enlace) {
        enlace.classList.remove('activo');
        if (enlace.getAttribute('href') === '#' + seccionActual) {
            enlace.classList.add('activo');
        }
    });
}

window.addEventListener('scroll', marcarEnlaceActivo);
marcarEnlaceActivo();
