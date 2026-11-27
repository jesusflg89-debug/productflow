const mongoose = require("mongoose");

const conectarDB = async () => {
  try {

    console.log(
      "Intentando conectar con MongoDB..."
    );

    const conexion = await mongoose.connect(
      process.env.MONGODB_URI,
      {
        serverSelectionTimeoutMS: 5000
      }
    );

    console.log(
      `MongoDB conectado: ${conexion.connection.host}`
    );

  } catch (error) {

    console.error(
      "Error al conectar con MongoDB:",
      error.message
    );

    process.exit(1);
  }
};

// MUY IMPORTANTE
module.exports = conectarDB;