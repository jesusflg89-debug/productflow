// ==========================================
// PRODUCTFLOW
// SERVIDOR PRINCIPAL
// ==========================================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const conectarDB =
  require("./config/database");

const authRoutes =
  require("./routes/authRoutes");

const productRoutes =
  require("./routes/productRoutes");


// ==========================================
// VARIABLES DE ENTORNO
// ==========================================

dotenv.config();


// ==========================================
// CREAR APLICACIÓN EXPRESS
// ==========================================

const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());


// ==========================================
// RUTAS
// ==========================================

// Autenticación

app.use(
  "/api/auth",
  authRoutes
);


// Productos

app.use(
  "/api/products",
  productRoutes
);


// Health Check

app.get(
  "/api/health",
  (req, res) => {

    res.status(200).json({
      success: true,
      message:
        "API de ProductFlow funcionando"
    });

  }
);


// ==========================================
// CONFIGURACIÓN DEL PUERTO
// ==========================================

const PORT =
  process.env.PORT || 3000;


// ==========================================
// INICIAR SERVIDOR
// ==========================================

const iniciarServidor =
  async () => {

    try {

      await conectarDB();

      app.listen(
        PORT,
        () => {

          console.log(
            `Servidor ProductFlow ejecutándose en http://localhost:${PORT}`
          );

        }
      );

    } catch (error) {

      console.error(
        "Error al iniciar ProductFlow:",
        error.message
      );

      process.exit(1);

    }

  };


// ==========================================
// EVITAR ABRIR PUERTO DURANTE JEST
// ==========================================

if (
  require.main === module
) {

  iniciarServidor();

}


// ==========================================
// EXPORTAR APP PARA SUPERTEST
// ==========================================

module.exports = app;