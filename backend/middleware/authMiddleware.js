// ==========================================
// PRODUCTFLOW
// MIDDLEWARE DE AUTENTICACIÓN JWT
// ==========================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");


const protegerRuta = async (
  req,
  res,
  next
) => {

  try {

    let token;


    // Obtener Bearer Token

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {

      token =
        req.headers.authorization
          .split(" ")[1];

    }


    // Verificar existencia del token

    if (!token) {

      return res.status(401).json({

        success: false,

        message:
          "Acceso no autorizado. Token no proporcionado."

      });

    }


    // Verificar JWT

    const tokenDecodificado =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );


    // Comprobar que el usuario exista

    const usuario =
      await User.findById(
        tokenDecodificado.id
      );


    if (!usuario) {

      return res.status(401).json({

        success: false,

        message:
          "El usuario asociado al token no existe."

      });

    }


    // Guardar usuario autenticado

    req.user = usuario;


    // Continuar a la ruta protegida

    next();


  } catch (error) {

    return res.status(401).json({

      success: false,

      message:
        "Token inválido o expirado."

    });

  }

};


module.exports = protegerRuta;