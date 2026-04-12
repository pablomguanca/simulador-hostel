let habitaciones = [];

const cargarHabitaciones = async () => {
    const loader = document.querySelector('#loader');
    if (loader) loader.classList.add('visible');

    try {
        const respuesta = await fetch('./data/habitaciones.json');

        if (!respuesta.ok) {
            throw new Error(`Error ${respuesta.status}`);
        }

        habitaciones = await respuesta.json();

        if (typeof iniciarApp === 'function') {
            iniciarApp();
        }

    } catch (error) {
        if (typeof mostrarError === 'function') {
            mostrarError('No pudimos cargar las habitaciones. Por favor, recargá la página.');
        }
    } finally {
        if (loader) loader.classList.remove('visible');
    }
};

document.addEventListener('DOMContentLoaded', cargarHabitaciones);