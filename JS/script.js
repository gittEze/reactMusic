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
const btnReproductorInferior = document.getElementById("btnReproductorInferior");
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

const reproductorInferior = document.getElementById("reproductorInferior");

const inferiorNombre = document.getElementById("inferiorNombre");
const inferiorArtista = document.getElementById("inferiorArtista");

const inferiorPlay = document.getElementById("inferiorPlay");
const inferiorAnterior = document.getElementById("inferiorAnterior");
const inferiorSiguiente = document.getElementById("inferiorSiguiente");

const inferiorBarraProgreso = document.getElementById("inferiorBarraProgreso");
const inferiorTiempoActual = document.getElementById("inferiorTiempoActual");
const inferiorDuracion = document.getElementById("inferiorDuracion");

const inferiorBarraVolumen = document.getElementById("inferiorBarraVolumen");
const inferiorIconoVolumen = document.getElementById("inferiorIconoVolumen");

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
let reproductorInferiorActivo = false;

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

inferiorPlay.addEventListener("click", alternarReproduccion);

inferiorAnterior.addEventListener("click", anteriorCancion);

inferiorSiguiente.addEventListener("click", siguienteCancion);

inferiorBarraProgreso.addEventListener("input", evento => {
	cambiarProgreso(evento.target.value);
});

inferiorBarraVolumen.addEventListener("input", evento => {
	actualizarVolumen(evento.target.value);
});

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
	inferiorNombre.textContent = cancion.nombreMostrar;
	inferiorArtista.textContent = cancion.artista;

	actualizarVentanaInferior();

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

	inferiorBarraProgreso.value = porcentaje;
	inferiorBarraProgreso.style.setProperty("--progreso", `${porcentaje}%`);

	tiempoActual.textContent = convertirTiempo(audio.currentTime);
	miniTiempoActual.textContent = convertirTiempo(audio.currentTime);
	inferiorTiempoActual.textContent = convertirTiempo(audio.currentTime);

	// Sincronizar Picture-in-Picture
	actualizarVentanaInferior();
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
	inferiorBarraVolumen.value = volumen;
	inferiorBarraVolumen.style.setProperty(
		"--volumen",
		`${volumen * 100}%`
	);
	localStorage.setItem("volumenMusica", volumen);
	actualizarInterfazVolumen();
	actualizarVentanaInferior();
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
	inferiorPlay.textContent = reproduciendo ? "⏸" : "▶";
	miniReproductor.classList.toggle("reproduciendo", reproduciendo);
	actualizarVentanaInferior();
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
	const tiempo = convertirTiempo(audio.duration);

	duracion.textContent = tiempo;
	miniDuracion.textContent = tiempo;
	inferiorDuracion.textContent = tiempo;
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

// =========================================
// PICTURE-IN-PICTURE DEL REPRODUCTOR INFERIOR
// =========================================

let ventanaInferior = null;
let reproductorInferiorPiP = false;

btnReproductorInferior.addEventListener("click", async () => {

	// Si la ventana ya está abierta, simplemente darle el foco
	if (ventanaInferior && !ventanaInferior.closed) {
		ventanaInferior.focus();
		return;
	}

	// Comprobar compatibilidad
	if (!("documentPictureInPicture" in window)) {
		console.warn("El navegador no soporta Document Picture-in-Picture.");
		return;
	}

	try {

		ventanaInferior = await documentPictureInPicture.requestWindow({
			width: 760,
			height: 100
		});

		reproductorInferiorPiP = true;

		// Copiar las hojas de estilo
		document.querySelectorAll("link[rel='stylesheet']").forEach(hoja => {
			const clonHoja = ventanaInferior.document.createElement("link");

			clonHoja.rel = "stylesheet";
			clonHoja.href = hoja.href;

			ventanaInferior.document.head.appendChild(clonHoja);
		});

		// Estilos específicos de la ventana PiP
		const estilo = ventanaInferior.document.createElement("style");

		estilo.textContent = `
			* {
				box-sizing: border-box;
			}

			html,
			body {
				margin: 0;
				padding: 0;
				width: 100%;
				height: 100%;
				min-width: 0;
				min-height: 0;
				overflow: hidden;
				background: #0a0e0c;
			}

			/* =========================================
			REPRODUCTOR PIP
			========================================= */

			.reproductor-inferior {
				position: fixed !important;
				inset: 0 !important;

				width: 100% !important;
				height: 100% !important;

				min-width: 0 !important;
				min-height: 0 !important;

				display: grid !important;

				/*
					PRIMERA FILA:
					canción | controles | volumen

					SEGUNDA FILA:
					progreso completo
				*/
				grid-template-columns:
					minmax(0, 1.35fr)
					minmax(65px, 0.85fr)
					minmax(75px, 1.5fr) !important;

				grid-template-rows:
					minmax(32px, 1fr)
					minmax(14px, auto) !important;

				column-gap: clamp(12px, 3vw, 32px) !important;
				row-gap: clamp(4px, 1vw, 8px) !important;

				padding:
					clamp(5px, 1.2vw, 10px)
					clamp(7px, 1.8vw, 18px) !important;

				transform: none !important;
				opacity: 1 !important;
				pointer-events: auto !important;

				background: rgba(10, 14, 12, 0.98) !important;

				border: none !important;
				box-shadow: none !important;

				overflow: hidden !important;
			}


			/* =========================================
			CANCIÓN
			========================================= */

			.inferior-cancion {
				grid-column: 1 !important;
				grid-row: 1 !important;

				display: flex !important;
				align-items: center !important;

				min-width: 0 !important;
				width: 100% !important;

				overflow: hidden !important;

				gap: clamp(5px, 1vw, 10px) !important;
			}

			.inferior-portada {
				width: clamp(24px, 5vw, 44px) !important;
				height: clamp(24px, 5vw, 44px) !important;

				min-width: 24px !important;
				min-height: 24px !important;

				flex-shrink: 0 !important;
			}

			.inferior-info {
				min-width: 0 !important;
				width: 100% !important;

				overflow: hidden !important;
			}

			#inferiorNombre {
				display: block !important;

				min-width: 0 !important;
				width: 100% !important;

				overflow: hidden !important;

				white-space: nowrap !important;
				text-overflow: ellipsis !important;

				font-size: clamp(8px, 1.6vw, 13px) !important;
			}

			#inferiorArtista {
				display: block !important;

				min-width: 0 !important;
				width: 100% !important;

				overflow: hidden !important;

				white-space: nowrap !important;
				text-overflow: ellipsis !important;

				font-size: clamp(7px, 1.25vw, 11px) !important;
			}


			/* =========================================
			CONTROLES
			========================================= */

			.inferior-controles {
				grid-column: 2 !important;
				grid-row: 1 !important;

				display: flex !important;
				align-items: center !important;
				justify-content: center !important;

				min-width: 0 !important;
				width: 100% !important;

				gap: clamp(4px, 1.4vw, 14px) !important;
			}

			.inferior-controles button {
				width: clamp(18px, 3vw, 32px) !important;
				height: clamp(18px, 3vw, 32px) !important;

				min-width: 18px !important;
				min-height: 18px !important;

				padding: 0 !important;

				flex-shrink: 1 !important;

				font-size: clamp(8px, 1.7vw, 16px) !important;
			}

			#inferiorPlay {
				width: clamp(25px, 4.2vw, 40px) !important;
				height: clamp(25px, 4.2vw, 40px) !important;

				min-width: 25px !important;
				min-height: 25px !important;

				font-size: clamp(9px, 1.6vw, 15px) !important;
			}


			/* =========================================
			VOLUMEN
			========================================= */

			.inferior-volumen {
				grid-column: 3 !important;
				grid-row: 1 !important;

				display: flex !important;
				align-items: center !important;

				min-width: 0 !important;
				width: 100% !important;

				gap: clamp(4px, 1vw, 9px) !important;
			}

			#inferiorIconoVolumen {
				flex-shrink: 0 !important;

				width: auto !important;

				font-size: clamp(8px, 1.5vw, 14px) !important;
			}

			/*
				La barra ocupa TODO el espacio
				disponible de su columna.
			*/
			#inferiorBarraVolumen {
				display: block !important;

				flex: 1 1 auto !important;

				width: 100% !important;
				min-width: 35px !important;

				height: clamp(4px, 0.7vw, 6px) !important;
			}


			/* =========================================
			BARRA DE PROGRESO
			========================================= */

			.inferior-progreso {
				grid-column: 1 / -1 !important;
				grid-row: 2 !important;

				display: flex !important;
				align-items: center !important;

				min-width: 0 !important;
				width: 100% !important;

				gap: clamp(4px, 0.8vw, 8px) !important;
			}

			.inferior-progreso span {
				flex: 0 0 auto !important;

				min-width: 20px !important;

				font-size: clamp(6px, 1.1vw, 10px) !important;

				white-space: nowrap !important;
			}

			#inferiorBarraProgreso {
				flex: 1 1 auto !important;

				width: 100% !important;
				min-width: 10px !important;

				height: clamp(4px, 0.7vw, 6px) !important;

				appearance: none !important;
				-webkit-appearance: none !important;

				border: none !important;
				border-radius: 10px !important;

				background:
					linear-gradient(
						to right,
						#1ed760 0%,
						#1ed760 var(--progreso, 0%),
						#343a37 var(--progreso, 0%),
						#343a37 100%
					) !important;
			}


			/* =========================================
			PROGRESO - CHROME / EDGE
			========================================= */

			#inferiorBarraProgreso::-webkit-slider-runnable-track {
				height: clamp(4px, 0.7vw, 6px) !important;

				border-radius: 10px !important;

				background:
					linear-gradient(
						to right,
						#1ed760 0%,
						#1ed760 var(--progreso, 0%),
						#343a37 var(--progreso, 0%),
						#343a37 100%
					) !important;
			}

			#inferiorBarraProgreso::-webkit-slider-thumb {
				appearance: none !important;
				-webkit-appearance: none !important;

				width: clamp(7px, 1.4vw, 10px) !important;
				height: clamp(7px, 1.4vw, 10px) !important;

				margin-top: -2px !important;

				border: 2px solid #1ed760 !important;
				border-radius: 50% !important;

				background: #f5f7f6 !important;
			}


			/* =========================================
			PROGRESO - FIREFOX
			========================================= */

			#inferiorBarraProgreso::-moz-range-track {
				height: clamp(4px, 0.7vw, 6px) !important;

				border-radius: 10px !important;

				background: #343a37 !important;
			}

			#inferiorBarraProgreso::-moz-range-progress {
				height: clamp(4px, 0.7vw, 6px) !important;

				border-radius: 10px !important;

				background: #1ed760 !important;
			}

			#inferiorBarraProgreso::-moz-range-thumb {
				width: clamp(7px, 1.3vw, 9px) !important;
				height: clamp(7px, 1.3vw, 9px) !important;

				border: 2px solid #1ed760 !important;
				border-radius: 50% !important;

				background: #f5f7f6 !important;
			}


			/* =========================================
			VOLUMEN - CHROME / EDGE
			========================================= */

			#inferiorBarraVolumen {
				appearance: none !important;
				-webkit-appearance: none !important;

				border: none !important;
				border-radius: 10px !important;

				background:
					linear-gradient(
						to right,
						#1ed760 0%,
						#1ed760 var(--volumen, 100%),
						#343a37 var(--volumen, 100%),
						#343a37 100%
					) !important;
			}

			#inferiorBarraVolumen::-webkit-slider-runnable-track {
				height: clamp(4px, 0.7vw, 6px) !important;

				border-radius: 10px !important;

				background:
					linear-gradient(
						to right,
						#1ed760 0%,
						#1ed760 var(--volumen, 100%),
						#343a37 var(--volumen, 100%),
						#343a37 100%
					) !important;
			}

			#inferiorBarraVolumen::-webkit-slider-thumb {
				appearance: none !important;
				-webkit-appearance: none !important;

				width: clamp(7px, 1.3vw, 9px) !important;
				height: clamp(7px, 1.3vw, 9px) !important;

				margin-top: -2px !important;

				border: 2px solid #1ed760 !important;
				border-radius: 50% !important;

				background: #f5f7f6 !important;
			}


			/* =========================================
			VOLUMEN - FIREFOX
			========================================= */

			#inferiorBarraVolumen::-moz-range-track {
				height: clamp(4px, 0.7vw, 6px) !important;

				border-radius: 10px !important;

				background: #343a37 !important;
			}

			#inferiorBarraVolumen::-moz-range-progress {
				height: clamp(4px, 0.7vw, 6px) !important;

				border-radius: 10px !important;

				background: #1ed760 !important;
			}

			#inferiorBarraVolumen::-moz-range-thumb {
				width: clamp(7px, 1.2vw, 8px) !important;
				height: clamp(7px, 1.2vw, 8px) !important;

				border: 2px solid #1ed760 !important;
				border-radius: 50% !important;

				background: #f5f7f6 !important;
			}


			/* =========================================
			VENTANA MEDIANA
			========================================= */

			@media (max-width: 500px) {

				.reproductor-inferior {
					grid-template-columns:
						minmax(0, 1.2fr)
						minmax(55px, 0.8fr)
						minmax(65px, 1.35fr) !important;

					column-gap: 12px !important;

					padding:
						5px
						8px !important;
				}

				.inferior-controles {
					gap: 5px !important;
				}

				.inferior-volumen {
					gap: 4px !important;
				}

				#inferiorBarraVolumen {
					min-width: 30px !important;
				}
			}


			/* =========================================
			VENTANA PEQUEÑA
			========================================= */

			@media (max-width: 350px) {

				.reproductor-inferior {
					grid-template-columns:
						minmax(0, 1.1fr)
						minmax(48px, 0.8fr)
						minmax(55px, 1.2fr) !important;

					column-gap: 8px !important;

					padding:
						4px
						6px !important;
				}

				.inferior-cancion {
					gap: 4px !important;
				}

				.inferior-controles {
					gap: 2px !important;
				}

				.inferior-volumen {
					gap: 3px !important;
				}

				#inferiorBarraVolumen {
					min-width: 25px !important;
				}

				.inferior-progreso {
					gap: 3px !important;
				}

				.inferior-progreso span {
					min-width: 18px !important;
				}
			}


			/* =========================================
			VENTANA MUY PEQUEÑA
			========================================= */

			@media (max-width: 260px) {

				.reproductor-inferior {
					grid-template-columns:
						minmax(0, 1fr)
						minmax(45px, auto)
						minmax(50px, 1fr) !important;

					column-gap: 5px !important;

					padding:
						3px
						5px !important;
				}

				.inferior-portada {
					width: 22px !important;
					height: 22px !important;

					min-width: 22px !important;
					min-height: 22px !important;
				}

				#inferiorNombre {
					font-size: 8px !important;
				}

				#inferiorArtista {
					font-size: 7px !important;
				}

				.inferior-controles button {
					width: 17px !important;
					height: 17px !important;

					min-width: 17px !important;
					min-height: 17px !important;

					font-size: 8px !important;
				}

				#inferiorPlay {
					width: 22px !important;
					height: 22px !important;

					min-width: 22px !important;
					min-height: 22px !important;

					font-size: 8px !important;
				}

				#inferiorIconoVolumen {
					font-size: 8px !important;
				}

				#inferiorBarraVolumen {
					min-width: 20px !important;
				}

				.inferior-progreso span {
					min-width: 16px !important;
					font-size: 6px !important;
				}
			}


			/* =========================================
			VENTANA EXTREMADAMENTE PEQUEÑA
			========================================= */

			@media (max-width: 200px) {

				.reproductor-inferior {
					grid-template-columns:
						minmax(0, 1fr)
						auto
						minmax(40px, 1fr) !important;

					column-gap: 3px !important;

					padding:
						2px
						4px !important;
				}

				.inferior-portada {
					display: none !important;
				}

				#inferiorNombre {
					font-size: 7px !important;
				}

				#inferiorArtista {
					font-size: 6px !important;
				}

				.inferior-controles {
					gap: 1px !important;
				}

				.inferior-controles button {
					width: 15px !important;
					height: 15px !important;

					min-width: 15px !important;
					min-height: 15px !important;

					font-size: 7px !important;
				}

				#inferiorPlay {
					width: 19px !important;
					height: 19px !important;

					min-width: 19px !important;
					min-height: 19px !important;
				}

				#inferiorBarraVolumen {
					min-width: 15px !important;
				}

				.inferior-progreso span {
					min-width: 14px !important;
					font-size: 5px !important;
				}
			}
		`;

		ventanaInferior.document.head.appendChild(estilo);

		const clon = reproductorInferior.cloneNode(true);

		clon.id = "reproductorInferiorPiP";

		clon.style.transform = "none";
		clon.style.opacity = "1";
		clon.style.pointerEvents = "auto";

		ventanaInferior.document.body.appendChild(clon);

		// Buscar controles dentro de la ventana PiP
		const nuevoPlay = clon.querySelector("#inferiorPlay");
		const nuevoAnterior = clon.querySelector("#inferiorAnterior");
		const nuevoSiguiente = clon.querySelector("#inferiorSiguiente");
		const nuevaBarraProgreso = clon.querySelector("#inferiorBarraProgreso");
		const nuevaBarraVolumen = clon.querySelector("#inferiorBarraVolumen");

		// Conectar controles con el reproductor principal
		nuevoPlay?.addEventListener("click", alternarReproduccion);

		nuevoAnterior?.addEventListener("click", anteriorCancion);

		nuevoSiguiente?.addEventListener("click", siguienteCancion);

		nuevaBarraProgreso?.addEventListener("input", evento => {
			cambiarProgreso(evento.target.value);
		});

		nuevaBarraVolumen?.addEventListener("input", evento => {
			actualizarVolumen(evento.target.value);
		});

		// Cuando se cierre la ventana
		ventanaInferior.addEventListener("pagehide", () => {

			reproductorInferiorPiP = false;
			ventanaInferior = null;

		});

		// Sincronizar inmediatamente
		actualizarVentanaInferior();

	} catch (error) {

		console.error(
			"No se pudo abrir el reproductor inferior en Picture-in-Picture:",
			error
		);

		reproductorInferiorPiP = false;
		ventanaInferior = null;
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

function actualizarVentanaInferior() {

	if (
		!reproductorInferiorPiP ||
		!ventanaInferior ||
		ventanaInferior.closed
	) {
		return;
	}

	const reproductor = ventanaInferior.document.getElementById(
		"reproductorInferiorPiP"
	);

	if (!reproductor) return;

	const nombre = reproductor.querySelector("#inferiorNombre");
	const artista = reproductor.querySelector("#inferiorArtista");

	const play = reproductor.querySelector("#inferiorPlay");

	const progreso = reproductor.querySelector(
		"#inferiorBarraProgreso"
	);

	const tiempo = reproductor.querySelector(
		"#inferiorTiempoActual"
	);

	const total = reproductor.querySelector(
		"#inferiorDuracion"
	);

	const volumen = reproductor.querySelector(
		"#inferiorBarraVolumen"
	);

	// Información de la canción
	if (nombre) {
		nombre.textContent = inferiorNombre.textContent;
	}

	if (artista) {
		artista.textContent = inferiorArtista.textContent;
	}

	// Play / pausa
	if (play) {
		play.textContent = audio.paused ? "▶" : "⏸";
	}

	// Progreso
	if (progreso) {
		progreso.value = inferiorBarraProgreso.value;

		progreso.style.setProperty(
			"--progreso",
			inferiorBarraProgreso.value + "%"
		);
	}

	// Tiempo actual
	if (tiempo) {
		tiempo.textContent = inferiorTiempoActual.textContent;
	}

	// Duración
	if (total) {
		total.textContent = inferiorDuracion.textContent;
	}

	// Volumen
	if (volumen) {

		volumen.value = inferiorBarraVolumen.value;

		volumen.style.setProperty(
			"--volumen",
			audio.volume * 100 + "%"
		);
	}
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