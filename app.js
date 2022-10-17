// imports
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

// app/public route
app.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem vindo", status: "200" });
});

// Credencials
const dbUSER = process.env.DB_USER;
const dbPASS = process.env.DB_PASS;

mongoose
  .connect(
    `mongodb+srv://${dbUSER}:${dbPASS}@cluster0.hffqacf.mongodb.net/?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(3000);
    console.log("Conectou com o banco");
  })
  .catch((err) => {
    console.log(err);
  });
