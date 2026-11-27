// ==========================================
// PRODUCTFLOW
// PRUEBAS DE AUTENTICACIÓN
// Jest + Supertest
// ==========================================

const request = require("supertest");
const mongoose = require("mongoose");

const app = require("../server");
const User = require("../models/User");

jest.setTimeout(15000);

// ==========================================
// CONFIGURACIÓN DE PRUEBAS
// ==========================================

const usuarioPrueba = {
  name: "Usuario Jest",
  email: "usuario.jest@example.com",
  password: "Password123"
};


// Antes de ejecutar las pruebas
beforeAll(async () => {

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

  await User.deleteOne({
    email: usuarioPrueba.email
  });

});


// Después de todas las pruebas
afterAll(async () => {

  // Limpiar usuario de prueba

  await User.deleteOne({
    email: usuarioPrueba.email
  });


  // Cerrar MongoDB

  await mongoose.connection.close();

});


// ==========================================
// SUITE DE AUTENTICACIÓN
// ==========================================

describe(
  "Autenticación de ProductFlow",
  () => {


    // ======================================
    // REGISTRO CORRECTO
    // ======================================

    test(
      "Debe registrar un usuario correctamente",
      async () => {

        const respuesta =
          await request(app)

            .post("/api/auth/register")

            .send(usuarioPrueba);


        expect(
          respuesta.statusCode
        ).toBe(201);


        expect(
          respuesta.body.success
        ).toBe(true);


        expect(
          respuesta.body
        ).toHaveProperty("token");


        expect(
          respuesta.body.user.email
        ).toBe(
          usuarioPrueba.email
        );

      }
    );


    // ======================================
    // CAMPOS INCOMPLETOS
    // ======================================

    test(
      "Debe rechazar un registro con campos faltantes",
      async () => {

        const respuesta =
          await request(app)

            .post("/api/auth/register")

            .send({
              email: "incompleto@example.com"
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
    // CORREO DUPLICADO
    // ======================================

    test(
      "Debe rechazar un correo duplicado",
      async () => {

        const respuesta =
          await request(app)

            .post("/api/auth/register")

            .send(usuarioPrueba);


        expect(
          respuesta.statusCode
        ).toBe(400);


        expect(
          respuesta.body.success
        ).toBe(false);


        expect(
          respuesta.body.message
        ).toMatch(
          /Ya existe/i
        );

      }
    );


    // ======================================
    // LOGIN CORRECTO
    // ======================================

    test(
      "Debe iniciar sesión correctamente",
      async () => {

        const respuesta =
          await request(app)

            .post("/api/auth/login")

            .send({

              email:
                usuarioPrueba.email,

              password:
                usuarioPrueba.password

            });


        expect(
          respuesta.statusCode
        ).toBe(200);


        expect(
          respuesta.body.success
        ).toBe(true);


        expect(
          respuesta.body
        ).toHaveProperty("token");


        expect(
          respuesta.body.user.email
        ).toBe(
          usuarioPrueba.email
        );

      }
    );


    // ======================================
    // CONTRASEÑA INCORRECTA
    // ======================================

    test(
      "Debe rechazar una contraseña incorrecta",
      async () => {

        const respuesta =
          await request(app)

            .post("/api/auth/login")

            .send({

              email:
                usuarioPrueba.email,

              password:
                "PasswordIncorrecto"

            });


        expect(
          respuesta.statusCode
        ).toBe(401);


        expect(
          respuesta.body.success
        ).toBe(false);

      }
    );

  }
);