// ==========================================
// PRODUCTFLOW
// PRUEBAS AUTOMATIZADAS DE PRODUCTOS
// Jest + Supertest
// ==========================================

const request = require("supertest");
const mongoose = require("mongoose");

const app = require("../server");

const User = require("../models/User");
const Product = require("../models/Product");

jest.setTimeout(15000);


// ==========================================
// DATOS DE PRUEBA
// ==========================================

const usuarioPrueba = {
  name: "Usuario Productos Jest",
  email: "productos.jest@example.com",
  password: "Password123"
};


const productoPrueba = {
  name: "Sensor industrial Jest",
  description:
    "Producto creado mediante una prueba automatizada.",
  category: "Sensores",
  price: 1250,
  stock: 10,
  active: true
};


let token;
let productoId;


// ==========================================
// PREPARACIÓN
// ==========================================

beforeAll(async () => {

  // Conectar con MongoDB

  if (
    mongoose.connection.readyState === 0
  ) {

    await mongoose.connect(
      process.env.MONGODB_URI,
      {
        serverSelectionTimeoutMS: 5000
      }
    );

  }


  // Limpiar información anterior

  const usuarioAnterior =
    await User.findOne({
      email: usuarioPrueba.email
    });


  if (usuarioAnterior) {

    await Product.deleteMany({
      owner: usuarioAnterior._id
    });

    await usuarioAnterior.deleteOne();

  }


  // Registrar usuario de prueba

  const respuestaRegistro =
    await request(app)

      .post("/api/auth/register")

      .send(usuarioPrueba);


  token =
    respuestaRegistro.body.token;

});


// ==========================================
// LIMPIEZA FINAL
// ==========================================

afterAll(async () => {

  const usuario =
    await User.findOne({
      email: usuarioPrueba.email
    });


  if (usuario) {

    await Product.deleteMany({
      owner: usuario._id
    });

    await usuario.deleteOne();

  }


  await mongoose.connection.close();

});


// ==========================================
// PRUEBAS DE PRODUCTOS
// ==========================================

describe(
  "CRUD de productos de ProductFlow",
  () => {


    // ======================================
    // ACCESO SIN JWT
    // ======================================

    test(
      "Debe rechazar el acceso sin token JWT",
      async () => {

        const respuesta =
          await request(app)

            .get("/api/products");


        expect(
          respuesta.statusCode
        ).toBe(401);


        expect(
          respuesta.body.success
        ).toBe(false);

      }
    );


    // ======================================
    // GET CON JWT
    // ======================================

    test(
      "Debe consultar productos con un JWT válido",
      async () => {

        const respuesta =
          await request(app)

            .get("/api/products")

            .set(
              "Authorization",
              `Bearer ${token}`
            );


        expect(
          respuesta.statusCode
        ).toBe(200);


        expect(
          respuesta.body.success
        ).toBe(true);


        expect(
          Array.isArray(
            respuesta.body.products
          )
        ).toBe(true);

      }
    );


    // ======================================
    // CREATE
    // ======================================

    test(
      "Debe crear un producto correctamente",
      async () => {

        const respuesta =
          await request(app)

            .post("/api/products")

            .set(
              "Authorization",
              `Bearer ${token}`
            )

            .send(
              productoPrueba
            );


        expect(
          respuesta.statusCode
        ).toBe(201);


        expect(
          respuesta.body.success
        ).toBe(true);


        expect(
          respuesta.body.product.name
        ).toBe(
          productoPrueba.name
        );


        expect(
          respuesta.body.product.price
        ).toBe(
          productoPrueba.price
        );


        productoId =
          respuesta.body.product._id;

      }
    );


    // ======================================
    // VALIDAR PRECIO NEGATIVO
    // ======================================

    test(
      "Debe rechazar un producto con precio negativo",
      async () => {

        const respuesta =
          await request(app)

            .post("/api/products")

            .set(
              "Authorization",
              `Bearer ${token}`
            )

            .send({
              name:
                "Producto precio inválido",

              description:
                "Prueba de validación",

              category:
                "Pruebas",

              price:
                -100,

              stock:
                5,

              active:
                true
            });


        expect(
          respuesta.statusCode
        ).toBe(400);


        expect(
          respuesta.body.success
        ).toBe(false);

      }
    );


    // ======================================
    // READ POR ID
    // ======================================

    test(
      "Debe consultar un producto por ID",
      async () => {

        const respuesta =
          await request(app)

            .get(
              `/api/products/${productoId}`
            )

            .set(
              "Authorization",
              `Bearer ${token}`
            );


        expect(
          respuesta.statusCode
        ).toBe(200);


        expect(
          respuesta.body.success
        ).toBe(true);


        expect(
          respuesta.body.product._id
        ).toBe(
          productoId
        );

      }
    );


    // ======================================
    // UPDATE
    // ======================================

    test(
      "Debe actualizar un producto correctamente",
      async () => {

        const respuesta =
          await request(app)

            .put(
              `/api/products/${productoId}`
            )

            .set(
              "Authorization",
              `Bearer ${token}`
            )

            .send({

              name:
                "Sensor industrial Jest actualizado",

              description:
                "Producto actualizado mediante Jest.",

              category:
                "Sensores industriales",

              price:
                1450,

              stock:
                15,

              active:
                true
            });


        expect(
          respuesta.statusCode
        ).toBe(200);


        expect(
          respuesta.body.success
        ).toBe(true);


        expect(
          respuesta.body.product.price
        ).toBe(1450);


        expect(
          respuesta.body.product.stock
        ).toBe(15);

      }
    );


    // ======================================
    // PRODUCTO INEXISTENTE
    // ======================================

    test(
      "Debe responder 404 para un producto inexistente",
      async () => {

        const idInexistente =
          new mongoose.Types.ObjectId();


        const respuesta =
          await request(app)

            .get(
              `/api/products/${idInexistente}`
            )

            .set(
              "Authorization",
              `Bearer ${token}`
            );


        expect(
          respuesta.statusCode
        ).toBe(404);


        expect(
          respuesta.body.success
        ).toBe(false);

      }
    );


    // ======================================
    // DELETE
    // ======================================

    test(
      "Debe eliminar un producto correctamente",
      async () => {

        const respuesta =
          await request(app)

            .delete(
              `/api/products/${productoId}`
            )

            .set(
              "Authorization",
              `Bearer ${token}`
            );


        expect(
          respuesta.statusCode
        ).toBe(200);


        expect(
          respuesta.body.success
        ).toBe(true);


        expect(
          respuesta.body.message
        ).toMatch(
          /eliminado correctamente/i
        );

      }
    );


  }
);