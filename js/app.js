const KEYS = {
    HISTORIAL: 'surfer_historial',
    ULTIMA_VISTA: 'surfer_ultima_vista'
};

const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const guardarBusqueda = (busqueda) => {
    try {
        const historial = obtenerHistorial();
        historial.unshift(busqueda);
        localStorage.setItem(KEYS.HISTORIAL, JSON.stringify(historial.slice(0, 10)));
    } catch { }
};

const obtenerHistorial = () => {
    try {
        return JSON.parse(localStorage.getItem(KEYS.HISTORIAL)) || [];
    } catch {
        return [];
    }
};

const guardarUltimaVista = (habitacion) => {
    try {
        localStorage.setItem(KEYS.ULTIMA_VISTA, JSON.stringify({
            nombre: habitacion.nombre,
            precio: habitacion.precio
        }));
    } catch { }
};

const obtenerUltimaVista = () => {
    try {
        return JSON.parse(localStorage.getItem(KEYS.ULTIMA_VISTA));
    } catch {
        return null;
    }
};

const limpiarStorage = () => {
    try {
        localStorage.removeItem(KEYS.HISTORIAL);
        localStorage.removeItem(KEYS.ULTIMA_VISTA);
    } catch { }
};

const fechaActual = () => new Date().toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
});

const crearCardHTML = (habitacion) => `
    <div class="card" data-id="${habitacion.id}">
        <div class="card__galeria">
            <button class="card__flecha card__flecha--izq" onclick="this.parentElement.querySelector('.card__slider').scrollBy({left: -300, behavior: 'smooth'})">&#10094;</button>
            
            <div class="card__slider">
                ${habitacion.imagenes.map(img => `
                    <img src="${img}" alt="Foto de ${habitacion.nombre}" onerror="this.src='assets/img/placeholder.jpg'">
                `).join('')}
            </div>

            <button class="card__flecha card__flecha--der" onclick="this.parentElement.querySelector('.card__slider').scrollBy({left: 300, behavior: 'smooth'})">&#10095;</button>
        </div>
        <div class="card__body">
            <span class="card__badge card__badge--${habitacion.tipo}">${habitacion.tipo}</span>
            <h3 class="card__nombre">${habitacion.nombre}</h3>
            <p class="card__desc">${habitacion.recomendacion}</p>
            <ul class="card__ficha">
                <li><span>🛏️ Camas</span><strong>${habitacion.ficha.camas}</strong></li>
                <li><span>📶 WiFi</span><strong>${habitacion.ficha.wifi}</strong></li>
                <li><span>🌊 Vista</span><strong>${habitacion.ficha.vista}</strong></li>
                <li><span>💰 Precio</span><strong>USD $${habitacion.precio} / noche</strong></li>
            </ul>
            <button class="btn btn--primary btn--reservar" data-id="${habitacion.id}">
                Reservar esta habitación 🏄
            </button>
        </div>
    </div>
`;

const mostrarMatch = (habitacion) => {
    const container = document.querySelector('#match-container');
    container.innerHTML = `
        <div class="match-wrapper">
            <div class="match-header">
                <h2>¡Tu Match Perfecto!🎯</h2>
                <p>Encontramos la habitación ideal para vos</p>
            </div>
            ${crearCardHTML(habitacion)}
        </div>
    `;
    container.classList.add('visible');
    container.querySelector('.btn--reservar').addEventListener('click', () => abrirModalReserva(habitacion));
};

const mostrarSugerencias = () => {
    const container = document.querySelector('#sugerencias-container');
    container.innerHTML = `
        <div class="sugerencias-header">
            <h2>No encontramos un match exacto 🌊</h2>
            <p>Pero tenemos estas habitaciones increíbles para vos:</p>
        </div>
        <div class="grid-sugerencias">
            ${habitaciones.map(h => crearCardHTML(h)).join('')}
        </div>
    `;
    container.classList.add('visible');
    container.querySelectorAll('.btn--reservar').forEach(btn => {
        btn.addEventListener('click', () => {
            const habitacion = habitaciones.find(h => h.id === parseInt(btn.dataset.id));
            abrirModalReserva(habitacion);
        });
    });
};

const limpiarResultados = () => {
    const match = document.querySelector('#match-container');
    const sugerencias = document.querySelector('#sugerencias-container');
    match.innerHTML = '';
    match.classList.remove('visible');
    sugerencias.innerHTML = '';
    sugerencias.classList.remove('visible');
};

const mostrarError = async (mensaje) => {
    const container = document.querySelector('#error-container');
    container.textContent = mensaje;
    container.classList.add('visible');
    await esperar(4000);
    container.classList.remove('visible');
};

const renderizarHistorial = () => {
    const historial = obtenerHistorial();
    const container = document.querySelector('#historial-lista');
    if (!historial.length) {
        container.innerHTML = '<p class="historial-vacio">Aún no realizaste búsquedas.</p>';
        return;
    }
    container.innerHTML = historial.map(item => `
        <div class="historial-item">
            <span class="historial-item__nombre">${item.habitacion || 'Sin match exacto'}</span>
            <span class="historial-item__fecha">${item.fecha}</span>
            <span class="historial-item__params">${item.ambiente} · ${item.prioridad} · ${item.tipo}</span>
        </div>
    `).join('');
};

const mostrarUltimaVista = () => {
    const ultima = obtenerUltimaVista();
    const banner = document.querySelector('#banner-ultima-vista');
    if (!ultima) return;
    banner.innerHTML = `<p>👁️ La última vez miraste <strong>${ultima.nombre}</strong> - USD $${ultima.precio}/noche</p>`;
    banner.classList.add('visible');
};

const abrirModalReserva = (habitacion) => {
    const modal = document.querySelector('#modal-reserva');
    document.querySelector('#reserva-nombre').value = 'Bauti Martinelli';
    document.querySelector('#reserva-email').value = 'b.martinelli@email.com';
    document.querySelector('#reserva-habitacion').textContent = habitacion.nombre;
    document.querySelector('#reserva-precio').textContent = `USD $${habitacion.precio} / noche`;
    modal.dataset.habitacionId = habitacion.id;
    modal.classList.add('visible');
    document.querySelector('#modal-overlay').classList.add('visible');
    document.body.style.overflow = 'hidden';
};

const cerrarModal = () => {
    document.querySelector('#modal-reserva').classList.remove('visible');
    document.querySelector('#modal-overlay').classList.remove('visible');
    document.body.style.overflow = '';
};

const buscarHabitacion = (ambiente, prioridad, tipo) => {
    return habitaciones.find(h =>
        h.ambiente === ambiente &&
        h.prioridad === prioridad &&
        h.tipo === tipo
    );
};

const manejarBusqueda = async (evento) => {
    evento.preventDefault();
    limpiarResultados();
    const ambiente = document.querySelector('#ambiente').value;
    const prioridad = document.querySelector('#prioridad').value;
    const tipo = document.querySelector('#tipo').value;
    const match = buscarHabitacion(ambiente, prioridad, tipo);

    guardarBusqueda({
        ambiente, prioridad, tipo,
        habitacion: match ? match.nombre : null,
        fecha: fechaActual()
    });

    if (match) {
        guardarUltimaVista(match);
        mostrarMatch(match);
    } else {
        mostrarSugerencias();
    }

    renderizarHistorial();
    await esperar(100);
    document.querySelector('#resultados').scrollIntoView({ behavior: 'smooth' });
};

const manejarReserva = async (evento) => {
    evento.preventDefault();
    const nombre = document.querySelector('#reserva-nombre').value.trim();
    const email = document.querySelector('#reserva-email').value.trim();

    if (!nombre || !email) {
        await mostrarError('Por favor completá tu nombre y email para continuar.');
        return;
    }

    const id = parseInt(document.querySelector('#modal-reserva').dataset.habitacionId);
    const habitacion = habitaciones.find(h => h.id === id);
    cerrarModal();

    await Swal.fire({
        title: '¡Reserva confirmada! 🏄‍♂️',
        html: `
        <p>¡Gracias <strong>${nombre}</strong>! Tu habitación <strong>${habitacion.nombre}</strong> está reservada.</p>
        <p>Te enviamos la confirmación a <strong>${email}</strong></p>
        <br>
        <p>💰 <strong>USD $${habitacion.precio} / noche</strong></p>
        <p class="swal-operacion">Nº operación: #SRF-${Date.now().toString().slice(-6)}</p>
    `,
        icon: 'success',
        confirmButtonText: 'Hacer otra búsqueda 🌊',
        customClass: {
            popup: 'swal-custom-popup',
            title: 'swal-custom-title',
            htmlContainer: 'swal-custom-html',
            confirmButton: 'swal-custom-confirm'
        }
    });

    document.querySelector('#form-simulador').reset();
    limpiarResultados();
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const iniciarContadorSesion = () => {
    let segundos = 0;
    setInterval(() => {
        segundos++;
        const display = document.querySelector('#timer-sesion');
        if (display) display.textContent = `Tiempo activo: ${segundos}s`;
    }, 1000);
};

const iniciarApp = () => {
    document.querySelector('#form-simulador').addEventListener('submit', manejarBusqueda);
    document.querySelector('#form-reserva').addEventListener('submit', manejarReserva);
    document.querySelector('#btn-cerrar-modal').addEventListener('click', cerrarModal);
    document.querySelector('#modal-overlay').addEventListener('click', cerrarModal);

    const panelHistorial = document.querySelector('#panel-historial');
    const panelOverlay = document.querySelector('#panel-overlay');

    document.querySelector('#btn-toggle-historial').addEventListener('click', () => {
        panelHistorial.classList.add('visible');
        panelOverlay.classList.add('visible');
    });

    document.querySelector('#btn-cerrar-historial').addEventListener('click', () => {
        panelHistorial.classList.remove('visible');
        panelOverlay.classList.remove('visible');
    });

    document.querySelector('#btn-limpiar-historial').addEventListener('click', async () => {
        limpiarStorage();
        renderizarHistorial();
        document.querySelector('#banner-ultima-vista').classList.remove('visible');

        await Swal.fire({
            title: 'Historial limpiado',
            icon: 'info',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
                popup: 'swal-custom-popup',
                title: 'swal-custom-title',
                htmlContainer: 'swal-custom-html',
                confirmButton: 'swal-custom-confirm'
            }
        });
    });

    iniciarContadorSesion();
    renderizarHistorial();
    mostrarUltimaVista();
};

iniciarApp();