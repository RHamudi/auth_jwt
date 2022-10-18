// imports
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var cors = require("cors");

const app = express();

// config json response
app.use(cors());
app.use(express.json());

// Models
const User = require("./models/User");

// app/public route
app.get("/", (req, res) => {
  res.status(200).json({ msg: "Bem vindo", status: "200" });
});

// Private Route
app.get("/user/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  // check if user exists
  const user = await User.findById(id, "-password");

  if (!user) {
    return res.status(404).json({ msg: "Usuário não encontrado" });
  }

  res.status(200).json({ user });
});

function checkToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Acesso negado!" });
  }

  try {
    const secret = process.env.SECRET;
    jwt.verify(token, secret);
    next();
  } catch (error) {
    res.status(400).json({ msg: "token invalido!" });
  }
}

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

// Login User
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  // validations
  if (!email) {
    return res.status(422).json({ msg: "O email é obrigatorio!" });
  }
  if (!password) {
    return res.status(422).json({ msg: "A senha é obrigatoria!" });
  }

  // check if user exists
  const user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json({ msg: "Usuario não encontrado!" });
  }

  // check if password match
  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(422).json({ msg: "senha inválida!" });
  }

  try {
    const secret = process.env.SECRET;

    const token = jwt.sign(
      {
        id: user._id,
      },
      secret,
      { expiresIn: 1000000000 }
    );

    res.status(200).json({
      msg: "Autenticação realizada com sucesso",
      user: user.name,
      id: user.id,
      token,
    });
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
    app.listen(8081);
    console.log("Conectou com o banco");
  })
  .catch((err) => {
    console.log(err);
  });
