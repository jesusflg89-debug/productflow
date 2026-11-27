// ==========================================
// PRODUCTFLOW
// RUTAS DE PRODUCTOS
// ==========================================

const express = require("express");

const protegerRuta =
  require("../middleware/authMiddleware");

const {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto
} = require("../controllers/productController");


const router = express.Router();


// ==========================================
// PROTEGER TODAS LAS RUTAS DE PRODUCTOS
// ==========================================

router.use(protegerRuta);


// ==========================================
// CREATE
// POST /api/products
// ==========================================

router.post(
  "/",
  crearProducto
);


// ==========================================
// READ
// GET /api/products
// ==========================================

router.get(
  "/",
  obtenerProductos
);


// ==========================================
// READ POR ID
// GET /api/products/:id
// ==========================================

router.get(
  "/:id",
  obtenerProductoPorId
);


// ==========================================
// UPDATE
// PUT /api/products/:id
// ==========================================

router.put(
  "/:id",
  actualizarProducto
);


// ==========================================
// DELETE
// DELETE /api/products/:id
// ==========================================

router.delete(
  "/:id",
  eliminarProducto
);


// ==========================================
// EXPORTAR ROUTER
// ==========================================

module.exports = router;