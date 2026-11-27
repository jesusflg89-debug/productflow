// ==========================================
// PRODUCTFLOW
// RUTAS DE AUTENTICACIÓN
// ==========================================

const express = require("express");

const {
  registrarUsuario,
  iniciarSesion
} = require("../controllers/authController");


// Crear router de Express
const router = express.Router();


// ==========================================
// REGISTRO DE USUARIO
// POST /api/auth/register
// ==========================================

router.post(
  "/register",
  registrarUsuario
);


// ==========================================
// INICIO DE SESIÓN
// POST /api/auth/login
// ==========================================

router.post(
  "/login",
  iniciarSesion
);


// ==========================================
// EXPORTAR ROUTER
// ==========================================

module.exports = router;