// ==========================================
// PRODUCTFLOW
// CONTROLADOR DE PRODUCTOS
// ==========================================

const Product = require("../models/Product");


// ==========================================
// CREAR PRODUCTO
// POST /api/products
// ==========================================

const crearProducto = async (req, res) => {

  try {

    const {
      name,
      description,
      category,
      price,
      stock,
      active
    } = req.body;


    // Validar campos obligatorios

    if (
      !name ||
      !category ||
      price === undefined ||
      stock === undefined
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Nombre, categoría, precio y existencia son obligatorios"

      });

    }


    if (price < 0) {

      return res.status(400).json({

        success: false,

        message:
          "El precio no puede ser negativo"

      });

    }


    if (stock < 0) {

      return res.status(400).json({

        success: false,

        message:
          "La existencia no puede ser negativa"

      });

    }


    // Crear producto vinculado
    // al usuario autenticado

    const producto =
      await Product.create({

        name: name.trim(),

        description:
          description
            ? description.trim()
            : "",

        category:
          category.trim(),

        price,

        stock,

        active:
          active !== undefined
            ? active
            : true,

        owner:
          req.user._id

      });


    return res.status(201).json({

      success: true,

      message:
        "Producto creado correctamente",

      product:
        producto

    });


  } catch (error) {

    console.error(
      "Error al crear producto:",
      error.message
    );


    return res.status(500).json({

      success: false,

      message:
        "Error interno del servidor"

    });

  }

};


// ==========================================
// OBTENER TODOS LOS PRODUCTOS
// GET /api/products
// ==========================================

const obtenerProductos =
  async (req, res) => {

    try {

      const productos =
        await Product.find({

          owner:
            req.user._id

        }).sort({

          createdAt: -1

        });


      return res.status(200).json({

        success: true,

        count:
          productos.length,

        products:
          productos

      });


    } catch (error) {

      console.error(
        "Error al obtener productos:",
        error.message
      );


      return res.status(500).json({

        success: false,

        message:
          "Error interno del servidor"

      });

    }

  };


// ==========================================
// OBTENER PRODUCTO POR ID
// GET /api/products/:id
// ==========================================

const obtenerProductoPorId =
  async (req, res) => {

    try {

      const producto =
        await Product.findOne({

          _id:
            req.params.id,

          owner:
            req.user._id

        });


      if (!producto) {

        return res.status(404).json({

          success: false,

          message:
            "Producto no encontrado"

        });

      }


      return res.status(200).json({

        success: true,

        product:
          producto

      });


    } catch (error) {

      return res.status(400).json({

        success: false,

        message:
          "Identificador de producto inválido"

      });

    }

  };


// ==========================================
// ACTUALIZAR PRODUCTO
// PUT /api/products/:id
// ==========================================

const actualizarProducto =
  async (req, res) => {

    try {

      const producto =
        await Product.findOne({

          _id:
            req.params.id,

          owner:
            req.user._id

        });


      if (!producto) {

        return res.status(404).json({

          success: false,

          message:
            "Producto no encontrado"

        });

      }


      const {
        name,
        description,
        category,
        price,
        stock,
        active
      } = req.body;


      if (name !== undefined) {

        if (
          typeof name !== "string" ||
          name.trim().length < 2
        ) {

          return res.status(400).json({

            success: false,

            message:
              "El nombre del producto no es válido"

          });

        }

        producto.name =
          name.trim();

      }


      if (description !== undefined) {

        producto.description =
          description.trim();

      }


      if (category !== undefined) {

        producto.category =
          category.trim();

      }


      if (price !== undefined) {

        if (price < 0) {

          return res.status(400).json({

            success: false,

            message:
              "El precio no puede ser negativo"

          });

        }

        producto.price =
          price;

      }


      if (stock !== undefined) {

        if (stock < 0) {

          return res.status(400).json({

            success: false,

            message:
              "La existencia no puede ser negativa"

          });

        }

        producto.stock =
          stock;

      }


      if (active !== undefined) {

        producto.active =
          Boolean(active);

      }


      await producto.save();


      return res.status(200).json({

        success: true,

        message:
          "Producto actualizado correctamente",

        product:
          producto

      });


    } catch (error) {

      console.error(
        "Error al actualizar producto:",
        error.message
      );


      return res.status(400).json({

        success: false,

        message:
          "No fue posible actualizar el producto"

      });

    }

  };


// ==========================================
// ELIMINAR PRODUCTO
// DELETE /api/products/:id
// ==========================================

const eliminarProducto =
  async (req, res) => {

    try {

      const producto =
        await Product.findOne({

          _id:
            req.params.id,

          owner:
            req.user._id

        });


      if (!producto) {

        return res.status(404).json({

          success: false,

          message:
            "Producto no encontrado"

        });

      }


      await producto.deleteOne();


      return res.status(200).json({

        success: true,

        message:
          "Producto eliminado correctamente"

      });


    } catch (error) {

      console.error(
        "Error al eliminar producto:",
        error.message
      );


      return res.status(400).json({

        success: false,

        message:
          "No fue posible eliminar el producto"

      });

    }

  };


// ==========================================
// EXPORTAR CONTROLADORES
// ==========================================

module.exports = {

  crearProducto,

  obtenerProductos,

  obtenerProductoPorId,

  actualizarProducto,

  eliminarProducto

};