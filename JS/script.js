const audio = document.getElementById("audio");
const selectorCarpeta = document.getElementById("selectorCarpeta");
const listaCanciones = document.getElementById("listaCanciones");
const cantidadCanciones = document.getElementById("cantidadCanciones");
const estadoCarpeta = document.getElementById("estadoCarpeta");
const buscar = document.getElementById("buscar");
const nombreActual = document.getElementById("nombreActual");
const artistaActual = document.getElementById("artistaActual");
const btnPlay = document.getElementById("btnPlay");
const btnAnterior = document.getElementById("btnAnterior");
const btnSiguiente = document.getElementById("btnSiguiente");
const btnAleatorio = document.getElementById("btnAleatorio");
const btnOrdenar = document.getElementById("btnOrdenar");
const barraProgreso = document.getElementById("barraProgreso");
const barraVolumen = document.getElementById("barraVolumen");
const tiempoActual = document.getElementById("tiempoActual");
const duracion = document.getElementById("duracion");
const btnBiblioteca = document.getElementById("btnBiblioteca");
const btnRepositorio = document.getElementById("btnRepositorio");
const btnLocales = document.getElementById("btnLocales");
const btnManual = document.getElementById("btnManual");
const btnVolverBiblioteca = document.getElementById("btnVolverBiblioteca");
const portadaActual = document.getElementById("portadaActual");
const iconoVolumen = document.getElementById("iconoVolumen");
const tituloSeccion = document.getElementById("tituloSeccion");
const subtituloSeccion = document.getElementById("subtituloSeccion");
const vistaReproductor = document.getElementById("vistaReproductor");
const manualUsuario = document.getElementById("manualUsuario");

const btnMiniReproductor = document.getElementById("btnMiniReproductor");
const miniReproductor = document.getElementById("miniReproductor");
const btnCerrarMini = document.getElementById("btnCerrarMini");
const miniNombre = document.getElementById("miniNombre");
const miniArtista = document.getElementById("miniArtista");
const miniPlay = document.getElementById("miniPlay");
const miniAnterior = document.getElementById("miniAnterior");
const miniSiguiente = document.getElementById("miniSiguiente");
const miniBarraProgreso = document.getElementById("miniBarraProgreso");
const miniTiempoActual = document.getElementById("miniTiempoActual");
const miniDuracion = document.getElementById("miniDuracion");
const miniBarraVolumen = document.getElementById("miniBarraVolumen");
const miniIconoVolumen = document.getElementById("miniIconoVolumen");

const formatosPermitidos = [".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac"];
let cancionesRepositorio = [];
let cancionesLocales = [];
let cancionesMostradas = [];
let indiceActual = -1;
let cancionActual = null;
let aleatorio = false;
let ordenAscendente = true;
let seccionActual = "biblioteca";
let textoBusqueda = "";
let urlActual = null;
let ventanaMini = null;
let miniAbierto = false;

async function cargarCancionesRepositorio() {
	try {
		const respuesta = await fetch("JS/canciones.json");
		if (!respuesta.ok) throw new Error();
		const canciones = await respuesta.json();

		cancionesRepositorio = canciones.map((cancion, indice) => ({
			nombre: cancion.nombre,
			nombreMostrar: quitarExtension(cancion.nombre),
			artista: cancion.artista || "Artista desconocido",
			url: `music/${encodeURIComponent(cancion.nombre)}`,
			tipo: "repositorio",
			id: `repo-${indice}`,
			archivo: null
		}));

		actualizarBiblioteca();
	} catch {
		cancionesRepositorio = [];
		actualizarBiblioteca();
	}
}

selectorCarpeta.addEventListener("change", evento => {
	const archivos = Array.from(evento.target.files).filter(archivo => {
		const extension = "." + archivo.name.split(".").pop().toLowerCase();
		return formatosPermitidos.includes(extension);
	});

	cancionesLocales = archivos.map((archivo, indice) => ({
		nombre: archivo.name,
		nombreMostrar: quitarExtension(archivo.name),
		artista: "Archivo local",
		url: null,
		tipo: "local",
		id: `local-${indice}-${archivo.name}`,
		archivo
	}));

	estadoCarpeta.textContent = archivos.length
		? `${archivos.length} archivo${archivos.length === 1 ? "" : "s"} de audio`
		: "No se encontraron archivos compatibles";

	cambiarSeccion("locales");
});

function cambiarSeccion(seccion) {
	manualUsuario.hidden = true;
	vistaReproductor.hidden = false;
	seccionActual = seccion;

	if (seccion === "repositorio") {
		tituloSeccion.textContent = "Repositorio";
		subtituloSeccion.textContent = "CANCIONES DEL REPOSITORIO";
	} else if (seccion === "locales") {
		tituloSeccion.textContent = "Música local";
		subtituloSeccion.textContent = "ARCHIVOS DE TU EQUIPO";
	} else {
		tituloSeccion.textContent = "Biblioteca";
		subtituloSeccion.textContent = "TU BIBLIOTECA";
	}

	actualizarBotonesMenu();
	actualizarBiblioteca();
}

function mostrarManual() {
	manualUsuario.hidden = false;
	vistaReproductor.hidden = true;
	actualizarBotonesMenu();
	manualUsuario.classList.remove("vista-entrando");
	void manualUsuario.offsetWidth;
	manualUsuario.classList.add("vista-entrando");
	manualUsuario.scrollIntoView({ behavior: "smooth", block: "start" });
}

function actualizarBotonesMenu() {
	btnBiblioteca.classList.toggle("activo", seccionActual === "biblioteca" && manualUsuario.hidden);
	btnRepositorio.classList.toggle("activo", seccionActual === "repositorio" && manualUsuario.hidden);
	btnLocales.classList.toggle("activo", seccionActual === "locales" && manualUsuario.hidden);
	btnManual.classList.toggle("activo", !manualUsuario.hidden);
}

function actualizarBiblioteca() {
	let base = [];

	if (seccionActual === "repositorio") {
		base = cancionesRepositorio;
	} else if (seccionActual === "locales") {
		base = cancionesLocales;
	} else {
		base = [...cancionesRepositorio, ...cancionesLocales];
	}

	base = [...base].sort(compararCanciones);

	if (textoBusqueda.trim()) {
		const texto = textoBusqueda.toLowerCase().trim();
		base = base.filter(cancion =>
			cancion.nombreMostrar.toLowerCase().includes(texto) ||
			cancion.artista.toLowerCase().includes(texto)
		);
	}

	cancionesMostradas = base;
	actualizarCantidadMostrada();
	mostrarCanciones();

	if (cancionActual) {
		const indice = cancionesMostradas.findIndex(cancion => cancion.id === cancionActual.id);
		indiceActual = indice;
	}

	actualizarEstadoLista();
}

function mostrarCanciones() {
	if (!cancionesMostradas.length) {
		listaCanciones.innerHTML = `
			<div class="sin-canciones mensaje-vacio">
				<h2>${textoBusqueda ? "No se encontraron canciones" : "No hay canciones disponibles"}</h2>
				<p>${textoBusqueda ? "Prueba con otro término de búsqueda." : "Agrega música para comenzar a reproducir."}</p>
			</div>
		`;
		return;
	}

	listaCanciones.innerHTML = cancionesMostradas.map((cancion, indice) => {
		const reproduciendo = cancionActual && cancionActual.id === cancion.id;
		const origen = cancion.tipo === "repositorio" ? "" : "";
		const claseOrigen = cancion.tipo === "repositorio" ? "origen-repositorio" : "origen-local";

		return `
			<div class="cancion${reproduciendo ? " reproduciendo" : ""}" data-indice="${indice}" tabindex="0">
				<div class="numero">${indice + 1}</div>
				<div class="info">
					<div class="mini-portada">🎵</div>
					<div class="datos-cancion">
						<div class="nombre-cancion">${escaparHTML(cancion.nombreMostrar)}</div>
						<div class="artista-cancion">${escaparHTML(cancion.artista)}</div>
						<div class="origen-cancion ${claseOrigen}">${origen}</div>
					</div>
				</div>
				<div class="duracion-cancion" data-duracion="${cancion.id}">--:--</div>
			</div>
		`;
	}).join("");

	listaCanciones.querySelectorAll(".cancion").forEach(elemento => {
		const indice = Number(elemento.dataset.indice);
		elemento.addEventListener("click", () => reproducirCancion(indice));
		elemento.addEventListener("keydown", evento => {
			if (evento.key === "Enter" || evento.key === " ") {
				evento.preventDefault();
				reproducirCancion(indice);
			}
		});
		obtenerDuracion(cancionesMostradas[indice], elemento.querySelector(".duracion-cancion"));
	});
}

function obtenerDuracion(cancion, elemento) {
	const audioTemporal = new Audio();

	audioTemporal.addEventListener("loadedmetadata", () => {
		elemento.textContent = convertirTiempo(audioTemporal.duration);

		if (cancion.tipo === "local" && audioTemporal.src.startsWith("blob:")) {
			URL.revokeObjectURL(audioTemporal.src);
		}
	});

	audioTemporal.addEventListener("error", () => {
		elemento.textContent = "--:--";

		if (cancion.tipo === "local" && audioTemporal.src.startsWith("blob:")) {
			URL.revokeObjectURL(audioTemporal.src);
		}
	});

	if (cancion.tipo === "local") {
		const url = URL.createObjectURL(cancion.archivo);
		audioTemporal.src = url;
	} else {
		audioTemporal.src = cancion.url;
	}
}

function reproducirCancion(indice) {
	if (indice < 0 || indice >= cancionesMostradas.length) return;

	const cancion = cancionesMostradas[indice];

	if (urlActual) {
		URL.revokeObjectURL(urlActual);
		urlActual = null;
	}

	cancionActual = cancion;
	indiceActual = indice;

	if (cancion.tipo === "local") {
		urlActual = URL.createObjectURL(cancion.archivo);
		audio.src = urlActual;
	} else {
		audio.src = cancion.url;
	}

	audio.currentTime = 0;
	barraProgreso.value = 0;
	barraProgreso.style.setProperty("--progreso", "0%");
	tiempoActual.textContent = "0:00";
	duracion.textContent = "0:00";

	nombreActual.textContent = cancion.nombreMostrar;
	artistaActual.textContent = cancion.artista;
	miniNombre.textContent = cancion.nombreMostrar;
	miniArtista.textContent = cancion.artista;

	actualizarEstadoReproductor();
	actualizarBiblioteca();

	audio.play().catch(() => {});
}

function alternarReproduccion() {
	if (!cancionActual) {
		if (cancionesMostradas.length) reproducirCancion(0);
		return;
	}

	if (audio.paused) {
		audio.play().catch(() => {});
	} else {
		audio.pause();
	}
}

function siguienteCancion() {
	if (!cancionesMostradas.length) return;

	let siguiente;

	if (aleatorio) {
		if (cancionesMostradas.length === 1) {
			siguiente = 0;
		} else {
			do {
				siguiente = Math.floor(Math.random() * cancionesMostradas.length);
			} while (siguiente === indiceActual);
		}
	} else {
		siguiente = (indiceActual + 1) % cancionesMostradas.length;
	}

	reproducirCancion(siguiente);
}

function anteriorCancion() {
	if (!cancionesMostradas.length) return;

	if (audio.currentTime > 3) {
		audio.currentTime = 0;
		return;
	}

	const anterior = (indiceActual - 1 + cancionesMostradas.length) % cancionesMostradas.length;
	reproducirCancion(anterior);
}

function actualizarProgreso() {
	if (!audio.duration || !isFinite(audio.duration)) return;

	const porcentaje = (audio.currentTime / audio.duration) * 100;
	barraProgreso.value = porcentaje;
	barraProgreso.style.setProperty("--progreso", `${porcentaje}%`);
	miniBarraProgreso.value = porcentaje;
	miniBarraProgreso.style.setProperty("--progreso", `${porcentaje}%`);
	tiempoActual.textContent = convertirTiempo(audio.currentTime);
	miniTiempoActual.textContent = convertirTiempo(audio.currentTime);
}

function cambiarProgreso(valor) {
	if (!audio.duration || !isFinite(audio.duration)) return;

	audio.currentTime = (Number(valor) / 100) * audio.duration;
	actualizarProgreso();
}

function actualizarVolumen(valor) {
	const volumen = Number(valor);
	audio.volume = volumen;
	audio.muted = volumen === 0;
	barraVolumen.value = volumen;
	miniBarraVolumen.value = volumen;
	barraVolumen.style.setProperty("--volumen", `${volumen * 100}%`);
	miniBarraVolumen.style.setProperty("--volumen", `${volumen * 100}%`);
	localStorage.setItem("volumenMusica", volumen);
	actualizarInterfazVolumen();
}

function actualizarInterfazVolumen() {
	const volumen = audio.volume;
	const contenedor = document.querySelector(".volumen-control");
	const miniContenedor = document.querySelector(".mini-volumen");

	[contenedor, miniContenedor].forEach(elemento => {
		if (!elemento) return;
		elemento.classList.remove("volumen-bajo", "volumen-medio", "volumen-alto", "volumen-maximo", "silenciado");
	});

	let icono = "🔊";

	if (volumen === 0 || audio.muted) {
		icono = "🔇";
		contenedor?.classList.add("silenciado");
		miniContenedor?.classList.add("silenciado");
	} else if (volumen < 0.35) {
		icono = "🔈";
		contenedor?.classList.add("volumen-bajo");
		miniContenedor?.classList.add("volumen-bajo");
	} else if (volumen < 0.75) {
		icono = "🔉";
		contenedor?.classList.add("volumen-medio");
		miniContenedor?.classList.add("volumen-medio");
	} else if (volumen < 1) {
		icono = "🔊";
		contenedor?.classList.add("volumen-alto");
		miniContenedor?.classList.add("volumen-alto");
	} else {
		icono = "🔊";
		contenedor?.classList.add("volumen-maximo");
		miniContenedor?.classList.add("volumen-maximo");
	}

	iconoVolumen.textContent = icono;
	miniIconoVolumen.textContent = icono;
}

function actualizarEstadoReproductor() {
	const reproduciendo = !audio.paused && !!cancionActual;
	const reproductor = document.querySelector(".reproductor");

	reproductor.classList.toggle("reproduciendo", reproduciendo);
	btnPlay.textContent = reproduciendo ? "⏸" : "▶";
	miniPlay.textContent = reproduciendo ? "⏸" : "▶";
	miniReproductor.classList.toggle("reproduciendo", reproduciendo);
}

function actualizarEstadoLista() {
	listaCanciones.querySelectorAll(".cancion").forEach((elemento, indice) => {
		elemento.classList.toggle("reproduciendo", !!cancionActual && cancionesMostradas[indice]?.id === cancionActual.id);
	});
}

function actualizarCantidadMostrada() {
	const cantidad = cancionesMostradas.length;
	cantidadCanciones.textContent = `${cantidad} canción${cantidad === 1 ? "" : "es"}`;
}

function convertirTiempo(segundos) {
	if (!isFinite(segundos) || segundos < 0) return "0:00";

	const minutos = Math.floor(segundos / 60);
	const segundosRestantes = Math.floor(segundos % 60).toString().padStart(2, "0");

	return `${minutos}:${segundosRestantes}`;
}

function quitarExtension(nombre) {
	return nombre.replace(/\.[^/.]+$/, "");
}

function escaparHTML(texto) {
	const div = document.createElement("div");
	div.textContent = texto;
	return div.innerHTML;
}

function compararCanciones(a, b) {
	const resultado = a.nombreMostrar.localeCompare(b.nombreMostrar, "es", {
		sensitivity: "base"
	});

	return ordenAscendente ? resultado : -resultado;
}

btnBiblioteca.addEventListener("click", () => cambiarSeccion("biblioteca"));
btnRepositorio.addEventListener("click", () => cambiarSeccion("repositorio"));
btnLocales.addEventListener("click", () => cambiarSeccion("locales"));
btnManual.addEventListener("click", mostrarManual);
btnVolverBiblioteca.addEventListener("click", () => cambiarSeccion("biblioteca"));

btnPlay.addEventListener("click", alternarReproduccion);
btnAnterior.addEventListener("click", anteriorCancion);
btnSiguiente.addEventListener("click", siguienteCancion);

btnAleatorio.addEventListener("click", () => {
	aleatorio = !aleatorio;
	btnAleatorio.classList.toggle("activo", aleatorio);
	btnAleatorio.setAttribute("aria-pressed", aleatorio);
});

btnOrdenar.addEventListener("click", () => {
	ordenAscendente = !ordenAscendente;
	actualizarBiblioteca();
});

buscar.addEventListener("input", evento => {
	textoBusqueda = evento.target.value;
	actualizarBiblioteca();
});

barraProgreso.addEventListener("input", evento => cambiarProgreso(evento.target.value));

barraVolumen.addEventListener("input", evento => actualizarVolumen(evento.target.value));

audio.addEventListener("timeupdate", actualizarProgreso);

audio.addEventListener("loadedmetadata", () => {
	duracion.textContent = convertirTiempo(audio.duration);
	miniDuracion.textContent = convertirTiempo(audio.duration);
});

audio.addEventListener("play", actualizarEstadoReproductor);
audio.addEventListener("playing", actualizarEstadoReproductor);
audio.addEventListener("pause", actualizarEstadoReproductor);
audio.addEventListener("ended", siguienteCancion);

document.addEventListener("keydown", evento => {
	const elemento = document.activeElement;
	const escribiendo = elemento && ["INPUT", "TEXTAREA", "SELECT"].includes(elemento.tagName);

	if (escribiendo) return;

	if (evento.code === "Space") {
		evento.preventDefault();
		alternarReproduccion();
	} else if (evento.key === "ArrowRight") {
		evento.preventDefault();
		siguienteCancion();
	} else if (evento.key === "ArrowLeft") {
		evento.preventDefault();
		anteriorCancion();
	}
});

btnMiniReproductor.addEventListener("click", async () => {
	if (!("documentPictureInPicture" in window)) return;
	if (ventanaMini && !ventanaMini.closed) {
		ventanaMini.focus();
		return;
	}

	try {
		ventanaMini = await documentPictureInPicture.requestWindow({
			width: 350,
			height: 250
		});

		miniAbierto = true;

		document.querySelectorAll("link[rel='stylesheet']").forEach(hoja => {
			const clon = ventanaMini.document.createElement("link");
			clon.rel = "stylesheet";
			clon.href = hoja.href;
			ventanaMini.document.head.appendChild(clon);
		});

		const estilo = ventanaMini.document.createElement("style");
		estilo.textContent = `
			html,body{
				margin:0;
				width:100%;
				height:100%;
				overflow:hidden;
				background:#101312;
			}
		`;
		ventanaMini.document.head.appendChild(estilo);

		const clon = miniReproductor.cloneNode(true);
		clon.hidden = false;
		clon.id = "miniReproductorVentana";
		ventanaMini.document.body.appendChild(clon);

		const nuevoPlay = clon.querySelector("#miniPlay");
		const nuevoAnterior = clon.querySelector("#miniAnterior");
		const nuevoSiguiente = clon.querySelector("#miniSiguiente");
		const nuevaBarraProgreso = clon.querySelector("#miniBarraProgreso");
		const nuevaBarraVolumen = clon.querySelector("#miniBarraVolumen");

		nuevoPlay.addEventListener("click", alternarReproduccion);
		nuevoAnterior.addEventListener("click", anteriorCancion);
		nuevoSiguiente.addEventListener("click", siguienteCancion);
		nuevaBarraProgreso.addEventListener("input", evento => cambiarProgreso(evento.target.value));
		nuevaBarraVolumen.addEventListener("input", evento => actualizarVolumen(evento.target.value));

		ventanaMini.addEventListener("pagehide", () => {
			miniAbierto = false;
			ventanaMini = null;
		});

		actualizarMiniVentana();
	} catch {
		miniAbierto = false;
		ventanaMini = null;
	}
});

function actualizarMiniVentana() {
	if (!miniAbierto || !ventanaMini || ventanaMini.closed) return;

	const mini = ventanaMini.document.getElementById("miniReproductorVentana");
	if (!mini) return;

	const nombre = mini.querySelector("#miniNombre");
	const artista = mini.querySelector("#miniArtista");
	const play = mini.querySelector("#miniPlay");
	const progreso = mini.querySelector("#miniBarraProgreso");
	const tiempo = mini.querySelector("#miniTiempoActual");
	const total = mini.querySelector("#miniDuracion");
	const volumen = mini.querySelector("#miniBarraVolumen");
	const icono = mini.querySelector("#miniIconoVolumen");

	if (nombre) nombre.textContent = miniNombre.textContent;
	if (artista) artista.textContent = miniArtista.textContent;
	if (play) play.textContent = audio.paused ? "▶" : "⏸";
	if (progreso) {
		progreso.value = barraProgreso.value;
		progreso.style.setProperty("--progreso", barraProgreso.value + "%");
	}
	if (tiempo) tiempo.textContent = tiempoActual.textContent;
	if (total) total.textContent = duracion.textContent;
	if (volumen) {
		volumen.value = barraVolumen.value;
		volumen.style.setProperty("--volumen", audio.volume * 100 + "%");
	}
	if (icono) icono.textContent = iconoVolumen.textContent;
}

setInterval(actualizarMiniVentana, 200);

const volumenGuardado = localStorage.getItem("volumenMusica");
audio.volume = volumenGuardado !== null ? Number(volumenGuardado) : 1;
barraVolumen.value = audio.volume;
miniBarraVolumen.value = audio.volume;
barraVolumen.style.setProperty("--volumen", `${audio.volume * 100}%`);
miniBarraVolumen.style.setProperty("--volumen", `${audio.volume * 100}%`);

actualizarInterfazVolumen();
actualizarEstadoReproductor();
actualizarBotonesMenu();
actualizarBiblioteca();
cargarCancionesRepositorio();

window.addEventListener("beforeunload", () => {
	if (urlActual) URL.revokeObjectURL(urlActual);
});