// ==========================================
// PRODUCTFLOW - FRONTEND
// app.js
// ==========================================


// ==========================================
// CONFIGURACIÓN DE LA API
// ==========================================

//const API_URL = "http://localhost:3000/api";

const API_URL =
  "https://productflow-backend-mr7v.onrender.com/api";

// ==========================================
// ADMINISTRACIÓN DE LA SESIÓN
// ==========================================

const obtenerToken = () => {
  return localStorage.getItem(
    "productflowToken"
  );
};


const obtenerUsuario = () => {

  const usuarioGuardado =
    localStorage.getItem(
      "productflowUser"
    );


  if (!usuarioGuardado) {
    return null;
  }


  try {

    return JSON.parse(
      usuarioGuardado
    );

  } catch (error) {

    console.error(
      "No se pudo leer el usuario:",
      error
    );

    return null;

  }

};


const guardarSesion = (
  token,
  usuario
) => {

  localStorage.setItem(
    "productflowToken",
    token
  );

  localStorage.setItem(
    "productflowUser",
    JSON.stringify(usuario)
  );

};


const eliminarSesion = () => {

  localStorage.removeItem(
    "productflowToken"
  );

  localStorage.removeItem(
    "productflowUser"
  );

};


const cerrarSesion = () => {

  eliminarSesion();

  window.location.href =
    "login.html";

};


// ==========================================
// MENSAJES DE LA INTERFAZ
// ==========================================

const mostrarMensaje = (
  elemento,
  mensaje,
  tipo = "error"
) => {

  if (!elemento) {
    return;
  }


  elemento.textContent = mensaje;


  elemento.classList.toggle(
    "exito",
    tipo === "exito"
  );

};


const limpiarMensaje = (
  elemento
) => {

  if (!elemento) {
    return;
  }


  elemento.textContent = "";


  elemento.classList.remove(
    "exito"
  );

};


// ==========================================
// PETICIONES A LA API
// ==========================================

const realizarPeticion = async (
  endpoint,
  opciones = {}
) => {

  const token =
    obtenerToken();


  const configuracion = {

    ...opciones,

    headers: {

      "Content-Type":
        "application/json",

      ...opciones.headers

    }

  };


  // Agregar JWT si existe

  if (token) {

    configuracion.headers.Authorization =
      `Bearer ${token}`;

  }


  try {

    const respuesta = await fetch(

      `${API_URL}${endpoint}`,

      configuracion

    );


    /*
      Algunas respuestas podrían no
      contener JSON. Primero obtenemos
      el texto y después intentamos
      convertirlo.
    */

    const contenido =
      await respuesta.text();


    let datos = {};


    if (contenido) {

      try {

        datos =
          JSON.parse(contenido);

      } catch (error) {

        throw new Error(
          "El servidor devolvió una respuesta no válida."
        );

      }

    }


    /*
      Si una ruta protegida devuelve 401,
      se elimina la sesión almacenada.
    */

    if (
      respuesta.status === 401 &&
      endpoint.startsWith("/products")
    ) {

      eliminarSesion();


      window.location.href =
        "login.html";


      throw new Error(
        "La sesión expiró. Inicia sesión nuevamente."
      );

    }


    if (!respuesta.ok) {

      throw new Error(

        datos.message ||

        `Error HTTP ${respuesta.status}`

      );

    }


    return datos;


  } catch (error) {

    /*
      fetch genera TypeError normalmente
      cuando el servidor no está disponible.
    */

    if (error instanceof TypeError) {

      throw new Error(
        "No fue posible conectar con el servidor de ProductFlow."
      );

    }


    throw error;

  }

};


// ==========================================
// REGISTRO
// register.html
// ==========================================

const formularioRegistro =
  document.querySelector(
    "#register-form"
  );


if (formularioRegistro) {

  const mensajeRegistro =
    document.querySelector(
      "#mensaje-registro"
    );


  formularioRegistro.addEventListener(
    "submit",
    async (evento) => {

      evento.preventDefault();


      limpiarMensaje(
        mensajeRegistro
      );


      const name =
        document.querySelector(
          "#name"
        ).value.trim();


      const email =
        document.querySelector(
          "#email"
        ).value.trim();


      const password =
        document.querySelector(
          "#password"
        ).value;


      const confirmarPassword =
        document.querySelector(
          "#confirm-password"
        ).value;


      // Validaciones del frontend

      if (
        !name ||
        !email ||
        !password ||
        !confirmarPassword
      ) {

        mostrarMensaje(
          mensajeRegistro,
          "Completa todos los campos."
        );

        return;

      }


      if (name.length < 2) {

        mostrarMensaje(
          mensajeRegistro,
          "El nombre debe contener al menos 2 caracteres."
        );

        return;

      }


      if (password.length < 6) {

        mostrarMensaje(
          mensajeRegistro,
          "La contraseña debe contener al menos 6 caracteres."
        );

        return;

      }


      if (
        password !==
        confirmarPassword
      ) {

        mostrarMensaje(
          mensajeRegistro,
          "Las contraseñas no coinciden."
        );

        return;

      }


      const boton =
        formularioRegistro.querySelector(
          'button[type="submit"]'
        );


      boton.disabled = true;

      boton.textContent =
        "Creando cuenta...";


      try {

        const datos =
          await realizarPeticion(
            "/auth/register",
            {

              method: "POST",

              body: JSON.stringify({
                name,
                email,
                password
              })

            }
          );


        guardarSesion(
          datos.token,
          datos.user
        );


        mostrarMensaje(
          mensajeRegistro,
          "Cuenta creada correctamente.",
          "exito"
        );


        setTimeout(() => {

          window.location.href =
            "index.html";

        }, 700);


      } catch (error) {

        mostrarMensaje(
          mensajeRegistro,
          error.message
        );


      } finally {

        boton.disabled = false;

        boton.textContent =
          "Crear cuenta";

      }

    }
  );

}


// ==========================================
// LOGIN
// login.html
// ==========================================

const formularioLogin =
  document.querySelector(
    "#login-form"
  );


if (formularioLogin) {

  const mensajeLogin =
    document.querySelector(
      "#mensaje-login"
    );


  /*
    Si ya existe una sesión,
    abrir directamente el dashboard.
  */

  if (obtenerToken()) {

    window.location.href =
      "index.html";

  }


  formularioLogin.addEventListener(
    "submit",
    async (evento) => {

      evento.preventDefault();


      limpiarMensaje(
        mensajeLogin
      );


      const email =
        document.querySelector(
          "#email"
        ).value.trim();


      const password =
        document.querySelector(
          "#password"
        ).value;


      if (!email || !password) {

        mostrarMensaje(
          mensajeLogin,
          "Ingresa el correo electrónico y la contraseña."
        );

        return;

      }


      const boton =
        formularioLogin.querySelector(
          'button[type="submit"]'
        );


      boton.disabled = true;

      boton.textContent =
        "Iniciando sesión...";


      try {

        const datos =
          await realizarPeticion(
            "/auth/login",
            {

              method: "POST",

              body: JSON.stringify({
                email,
                password
              })

            }
          );


        guardarSesion(
          datos.token,
          datos.user
        );


        mostrarMensaje(
          mensajeLogin,
          "Inicio de sesión correcto.",
          "exito"
        );


        setTimeout(() => {

          window.location.href =
            "index.html";

        }, 500);


      } catch (error) {

        mostrarMensaje(
          mensajeLogin,
          error.message
        );


      } finally {

        boton.disabled = false;

        boton.textContent =
          "Iniciar sesión";

      }

    }
  );

}


// ==========================================
// DASHBOARD DE PRODUCTOS
// index.html
// ==========================================

const formularioProducto =
  document.querySelector(
    "#product-form"
  );


if (formularioProducto) {

  const token =
    obtenerToken();


  const usuario =
    obtenerUsuario();


  /*
    Proteger la página principal.
  */

  if (!token || !usuario) {

    window.location.href =
      "login.html";

  }


  // Elementos del dashboard

  const nombreUsuario =
    document.querySelector(
      "#nombre-usuario"
    );


  const botonLogout =
    document.querySelector(
      "#btn-logout"
    );


  const botonRecargar =
    document.querySelector(
      "#btn-recargar"
    );


  const entradaNombre =
    document.querySelector(
      "#product-name"
    );


  const entradaDescripcion =
    document.querySelector(
      "#product-description"
    );


  const entradaCategoria =
    document.querySelector(
      "#product-category"
    );


  const entradaPrecio =
    document.querySelector(
      "#product-price"
    );


  const entradaStock =
    document.querySelector(
      "#product-stock"
    );


  const entradaActivo =
    document.querySelector(
      "#product-active"
    );


  const mensajeProducto =
    document.querySelector(
      "#mensaje-producto"
    );


  const mensajeAPI =
    document.querySelector(
      "#mensaje-api"
    );


  const listaProductos =
    document.querySelector(
      "#lista-productos"
    );


  const listaVacia =
    document.querySelector(
      "#lista-vacia"
    );


  const totalProductos =
    document.querySelector(
      "#total-productos"
    );


  const productosActivos =
    document.querySelector(
      "#productos-activos"
    );


  const existenciaTotal =
    document.querySelector(
      "#existencia-total"
    );


  let productos = [];


  // Mostrar usuario

  if (nombreUsuario && usuario) {

    nombreUsuario.textContent =
      usuario.name;

  }


  // Cerrar sesión

  if (botonLogout) {

    botonLogout.addEventListener(
      "click",
      cerrarSesion
    );

  }


  // Actualizar manualmente

  if (botonRecargar) {

    botonRecargar.addEventListener(
      "click",
      () => {

        obtenerProductos();

      }
    );

  }


  // ========================================
  // ESCAPAR HTML
  // ========================================

  const escaparHTML = (
    texto
  ) => {

    const elemento =
      document.createElement("div");


    elemento.textContent =
      texto || "";


    return elemento.innerHTML;

  };


  // ========================================
  // FORMATEAR PRECIO
  // ========================================

  const formatearPrecio = (
    precio
  ) => {

    return new Intl.NumberFormat(
      "es-MX",
      {
        style: "currency",
        currency: "MXN"
      }
    ).format(precio);

  };


  // ========================================
  // ACTUALIZAR RESUMEN
  // ========================================

  const actualizarResumen = () => {

    const total =
      productos.length;


    const activos =
      productos.filter(
        (producto) =>
          producto.active
      ).length;


    const unidades =
      productos.reduce(
        (
          acumulado,
          producto
        ) => {

          return acumulado +
            Number(
              producto.stock || 0
            );

        },
        0
      );


    totalProductos.textContent =
      total;


    productosActivos.textContent =
      activos;


    existenciaTotal.textContent =
      unidades;

  };


  // ========================================
  // RENDERIZAR PRODUCTOS
  // ========================================

  const renderizarProductos = () => {

    listaProductos.innerHTML = "";


    productos.forEach(
      (producto) => {

        const tarjeta =
          document.createElement(
            "article"
          );


        tarjeta.className =
          producto.active
            ? "product-card"
            : "product-card inactive";


        tarjeta.innerHTML = `

          <div class="product-info">

            <h3>
              ${escaparHTML(producto.name)}
            </h3>

            <p class="product-description">
              ${
                escaparHTML(
                  producto.description
                ) ||
                "Sin descripción"
              }
            </p>

            <div class="product-details">

              <span>
                Categoría:
                <strong>
                  ${escaparHTML(
                    producto.category
                  )}
                </strong>
              </span>

              <span>
                Precio:
                <strong>
                  ${formatearPrecio(
                    producto.price
                  )}
                </strong>
              </span>

              <span>
                Stock:
                <strong>
                  ${producto.stock}
                </strong>
              </span>

            </div>

            <span class="product-status">
              ${
                producto.active
                  ? "Activo"
                  : "Inactivo"
              }
            </span>

          </div>


          <div class="product-actions">

            <button
              type="button"
              class="btn-edit"
              data-action="edit"
              data-id="${producto._id}"
            >
              Editar
            </button>

            <button
              type="button"
              class="btn-delete"
              data-action="delete"
              data-id="${producto._id}"
            >
              Eliminar
            </button>

          </div>

        `;


        listaProductos.appendChild(
          tarjeta
        );

      }
    );


    listaVacia.hidden =
      productos.length > 0;


    actualizarResumen();

  };


  // ========================================
  // OBTENER PRODUCTOS
  // GET /api/products
  // ========================================

  const obtenerProductos =
    async () => {

      limpiarMensaje(
        mensajeAPI
      );


      try {

        const datos =
          await realizarPeticion(
            "/products"
          );


        productos =
          datos.products || [];


        renderizarProductos();


      } catch (error) {

        mostrarMensaje(
          mensajeAPI,
          error.message
        );

      }

    };


  // ========================================
  // CREAR PRODUCTO
  // POST /api/products
  // ========================================

  formularioProducto.addEventListener(
    "submit",
    async (evento) => {

      evento.preventDefault();


      limpiarMensaje(
        mensajeProducto
      );


      const name =
        entradaNombre.value.trim();


      const description =
        entradaDescripcion.value.trim();


      const category =
        entradaCategoria.value.trim();


      const price =
        Number(
          entradaPrecio.value
        );


      const stock =
        Number(
          entradaStock.value
        );


      const active =
        entradaActivo.checked;


      // Validaciones

      if (
        !name ||
        !category ||
        entradaPrecio.value === "" ||
        entradaStock.value === ""
      ) {

        mostrarMensaje(
          mensajeProducto,
          "Nombre, categoría, precio y existencia son obligatorios."
        );

        return;

      }


      if (name.length < 2) {

        mostrarMensaje(
          mensajeProducto,
          "El nombre debe contener al menos 2 caracteres."
        );

        return;

      }


      if (
        Number.isNaN(price) ||
        price < 0
      ) {

        mostrarMensaje(
          mensajeProducto,
          "Ingresa un precio válido."
        );

        return;

      }


      if (
        Number.isNaN(stock) ||
        stock < 0 ||
        !Number.isInteger(stock)
      ) {

        mostrarMensaje(
          mensajeProducto,
          "La existencia debe ser un número entero igual o mayor que cero."
        );

        return;

      }


      const boton =
        formularioProducto.querySelector(
          'button[type="submit"]'
        );


      boton.disabled = true;

      boton.textContent =
        "Agregando...";


      try {

        await realizarPeticion(
          "/products",
          {

            method: "POST",

            body: JSON.stringify({
              name,
              description,
              category,
              price,
              stock,
              active
            })

          }
        );


        formularioProducto.reset();


        entradaActivo.checked =
          true;


        mostrarMensaje(
          mensajeProducto,
          "Producto agregado correctamente.",
          "exito"
        );


        await obtenerProductos();


      } catch (error) {

        mostrarMensaje(
          mensajeProducto,
          error.message
        );


      } finally {

        boton.disabled = false;

        boton.textContent =
          "Agregar producto";

      }

    }
  );


  // ========================================
  // EDITAR Y ELIMINAR
  // ========================================

  listaProductos.addEventListener(
    "click",
    async (evento) => {

      const boton =
        evento.target.closest(
          "button"
        );


      if (!boton) {
        return;
      }


      const id =
        boton.dataset.id;


      const accion =
        boton.dataset.action;


      const producto =
        productos.find(
          (elemento) =>
            elemento._id === id
        );


      if (!producto) {
        return;
      }


      boton.disabled = true;


      try {

        // ==================================
        // EDITAR
        // ==================================

        if (accion === "edit") {

          let nuevoNombre =
            window.prompt(
              "Nombre del producto:",
              producto.name
            );


          if (nuevoNombre === null) {

            boton.disabled = false;

            return;

          }


          nuevoNombre =
            nuevoNombre.trim();


          if (
            nuevoNombre.length < 2
          ) {

            mostrarMensaje(
              mensajeAPI,
              "El nombre debe contener al menos 2 caracteres."
            );

            boton.disabled = false;

            return;

          }


          let nuevaDescripcion =
            window.prompt(
              "Descripción:",
              producto.description || ""
            );


          if (
            nuevaDescripcion === null
          ) {

            boton.disabled = false;

            return;

          }


          nuevaDescripcion =
            nuevaDescripcion.trim();


          let nuevaCategoria =
            window.prompt(
              "Categoría:",
              producto.category
            );


          if (
            nuevaCategoria === null
          ) {

            boton.disabled = false;

            return;

          }


          nuevaCategoria =
            nuevaCategoria.trim();


          if (!nuevaCategoria) {

            mostrarMensaje(
              mensajeAPI,
              "La categoría es obligatoria."
            );

            boton.disabled = false;

            return;

          }


          const nuevoPrecioTexto =
            window.prompt(
              "Precio:",
              producto.price
            );


          if (
            nuevoPrecioTexto === null
          ) {

            boton.disabled = false;

            return;

          }


          const nuevoPrecio =
            Number(
              nuevoPrecioTexto
            );


          if (
            Number.isNaN(
              nuevoPrecio
            ) ||
            nuevoPrecio < 0
          ) {

            mostrarMensaje(
              mensajeAPI,
              "El precio no es válido."
            );

            boton.disabled = false;

            return;

          }


          const nuevoStockTexto =
            window.prompt(
              "Existencia:",
              producto.stock
            );


          if (
            nuevoStockTexto === null
          ) {

            boton.disabled = false;

            return;

          }


          const nuevoStock =
            Number(
              nuevoStockTexto
            );


          if (
            Number.isNaN(nuevoStock) ||
            nuevoStock < 0 ||
            !Number.isInteger(
              nuevoStock
            )
          ) {

            mostrarMensaje(
              mensajeAPI,
              "La existencia no es válida."
            );

            boton.disabled = false;

            return;

          }


          const activo =
            window.confirm(
              "Selecciona Aceptar si el producto está activo o Cancelar si está inactivo."
            );


          await realizarPeticion(
            `/products/${id}`,
            {

              method: "PUT",

              body: JSON.stringify({

                name:
                  nuevoNombre,

                description:
                  nuevaDescripcion,

                category:
                  nuevaCategoria,

                price:
                  nuevoPrecio,

                stock:
                  nuevoStock,

                active:
                  activo

              })

            }
          );


          mostrarMensaje(
            mensajeAPI,
            "Producto actualizado correctamente.",
            "exito"
          );

        }


        // ==================================
        // ELIMINAR
        // ==================================

        if (accion === "delete") {

          const confirmar =
            window.confirm(
              `¿Deseas eliminar el producto "${producto.name}"?`
            );


          if (!confirmar) {

            boton.disabled = false;

            return;

          }


          await realizarPeticion(
            `/products/${id}`,
            {
              method: "DELETE"
            }
          );


          mostrarMensaje(
            mensajeAPI,
            "Producto eliminado correctamente.",
            "exito"
          );

        }


        await obtenerProductos();


      } catch (error) {

        mostrarMensaje(
          mensajeAPI,
          error.message
        );


      } finally {

        boton.disabled = false;

      }

    }
  );


  // ========================================
  // CARGA INICIAL
  // ========================================

  obtenerProductos();

}