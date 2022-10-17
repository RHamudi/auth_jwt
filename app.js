// imports
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

// config json response
app.use(express.json());

// Models
const User = require("./models/User");

// app/public route
app.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem vindo", status: "200" });
});

// Register User
app.post("/auth/register", async (req, res) => {
  const { name, email, password, confirmpassword } = req.body;

  // Validações
  if (!name) {
    return res.status(422).json({ msg: "O nome é obrigatorio!" });
  }
  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatorio!" });
  }
  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatoria!" });
  }
  if (password != confirmpassword) {
    return res.status(422).json({ msg: "Digite senhas identicas!" });
  }
  // check user if exists
  const userExists = await User.findOne({ email: email });

  if (userExists) {
    res.status(422).json({ msg: "Email já utilizado!" });
  }

  // Create password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user
  const user = new User({
    name,
    email,
    password: passwordHash,
  });

  try {
    await user.save();
    res.status(201).json({ msg: "Usuario criado com sucesso!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: error });
  }
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
