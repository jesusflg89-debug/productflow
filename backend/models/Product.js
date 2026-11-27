const mongoose = require("mongoose");

const productSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: [
          true,
          "El nombre del producto es obligatorio"
        ],
        trim: true,
        minlength: 2,
        maxlength: 120
      },

      description: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ""
      },

      category: {
        type: String,
        required: [
          true,
          "La categoría es obligatoria"
        ],
        trim: true,
        maxlength: 80
      },

      price: {
        type: Number,
        required: [
          true,
          "El precio es obligatorio"
        ],
        min: [
          0,
          "El precio no puede ser negativo"
        ]
      },

      stock: {
        type: Number,
        required: [
          true,
          "La existencia es obligatoria"
        ],
        min: [
          0,
          "La existencia no puede ser negativa"
        ],
        default: 0
      },

      active: {
        type: Boolean,
        default: true
      },

      owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    },
    {
      timestamps: true
    }
  );


module.exports =
  mongoose.model(
    "Product",
    productSchema
  );