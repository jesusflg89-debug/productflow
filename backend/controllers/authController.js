// ==========================================
// PRODUCTFLOW
// CONTROLADOR DE AUTENTICACIÓN
// ==========================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");


// ==========================================
// GENERAR TOKEN JWT
// ==========================================

const generarToken = (userId) => {

  return jwt.sign(
    {
      id: userId
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN || "2h"
    }
  );

};


// ==========================================
// REGISTRAR USUARIO
// POST /api/auth/register
// ==========================================

const registrarUsuario = async (req, res) => {

  try {

    const {
      name,
      email,
      password
    } = req.body;


    // Validar campos obligatorios

    if (
      !name ||
      !email ||
      !password
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Nombre, correo electrónico y contraseña son obligatorios"
      });

    }


    // Verificar longitud mínima de contraseña

    if (password.length < 6) {

      return res.status(400).json({
        success: false,
        message:
          "La contraseña debe contener al menos 6 caracteres"
      });

    }


    // Normalizar correo

    const emailNormalizado =
      email.trim().toLowerCase();


    // Buscar usuario existente

    const usuarioExistente =
      await User.findOne({
        email: emailNormalizado
      });


    if (usuarioExistente) {

      return res.status(400).json({
        success: false,
        message:
          "Ya existe un usuario registrado con este correo electrónico"
      });

    }


    // Crear usuario
    // User.js cifra automáticamente
    // la contraseña utilizando bcryptjs

    const usuario =
      await User.create({
        name: name.trim(),
        email: emailNormalizado,
        password
      });


    // Generar token JWT

    const token =
      generarToken(
        usuario._id
      );


    return res.status(201).json({

      success: true,

      message:
        "Usuario registrado correctamente",

      token,

      user: {
        id: usuario._id,
        name: usuario.name,
        email: usuario.email
      }

    });


  } catch (error) {

    console.error(
      "Error al registrar usuario:",
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
// INICIAR SESIÓN
// POST /api/auth/login
// ==========================================

const iniciarSesion = async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;


    // Validar datos

    if (
      !email ||
      !password
    ) {

      return res.status(400).json({

        success: false,

        message:
          "Correo electrónico y contraseña son obligatorios"

      });

    }


    const emailNormalizado =
      email.trim().toLowerCase();


    /*
      password tiene select:false en User.js,
      por eso se solicita explícitamente.
    */

    const usuario =
      await User.findOne({
        email: emailNormalizado
      }).select("+password");


    if (!usuario) {

      return res.status(401).json({

        success: false,

        message:
          "Correo electrónico o contraseña incorrectos"

      });

    }


    // Comparar contraseña mediante bcryptjs

    const passwordCorrecta =
      await usuario.compararPassword(
        password
      );


    if (!passwordCorrecta) {

      return res.status(401).json({

        success: false,

        message:
          "Correo electrónico o contraseña incorrectos"

      });

    }


    // Crear JWT

    const token =
      generarToken(
        usuario._id
      );


    return res.status(200).json({

      success: true,

      message:
        "Inicio de sesión correcto",

      token,

      user: {
        id: usuario._id,
        name: usuario.name,
        email: usuario.email
      }

    });


  } catch (error) {

    console.error(
      "Error al iniciar sesión:",
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
// EXPORTAR CONTROLADORES
// ==========================================

module.exports = {
  registrarUsuario,
  iniciarSesion
};