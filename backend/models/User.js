const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [
        true,
        "El nombre es obligatorio"
      ],
      trim: true,
      minlength: 2,
      maxlength: 80
    },

    email: {
      type: String,
      required: [
        true,
        "El correo electrónico es obligatorio"
      ],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Ingresa un correo electrónico válido"
      ]
    },

    password: {
      type: String,
      required: [
        true,
        "La contraseña es obligatoria"
      ],
      minlength: 6,
      select: false
    }
  },
  {
    timestamps: true
  }
);


// Cifrar contraseña antes de guardar

userSchema.pre(
  "save",
  async function () {

    if (!this.isModified("password")) {
      return;
    }

    const salt =
      await bcrypt.genSalt(10);

    this.password =
      await bcrypt.hash(
        this.password,
        salt
      );
  }
);


// Comparar contraseña durante login

userSchema.methods.compararPassword =
  async function (passwordIngresada) {

    return bcrypt.compare(
      passwordIngresada,
      this.password
    );
  };


module.exports =
  mongoose.model(
    "User",
    userSchema
  );
