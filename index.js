// const express = require('express')
// const app = express()
// app.all('/', (req, res) => {
//     console.log("Just got a request!")
//     res.send('Yo!')
// })
// app.listen(process.env.PORT || 3000)


const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const port = 8000;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const jwt = require("jsonwebtoken");

mongoose
  .connect("mongodb+srv://mrzha:passmrzha@cluster0.urmksgu.mongodb.net/", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("database connected");
  })
  .catch((err) => {
    console.log("error database ", err);
  });

app.listen(port, () => {
  console.log("run on port ", port);
});

//
//for check user
const User = require("./models/user");
const Order = require("./models/order");
//kirim email verifikasi
const sendVerificationEmail = async (email, verificationToken) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 578,
    secure: false,
    auth: {
      user: "dzavira.codes@gmail.com",
      pass: "dqwjbghmycivnguj",
    },
  });

  const mailOption = {
    from: {
      name: "Web mrzha",
      address: "mrzha.dev",
    },
    to: email,
    subject: "Verification Email",
    text: `Please click this link to verify your email http://192.168.0.125:8000/verify/${verifivationToken}`,
  };

  // send the email
  try {
    await transporter.sendMail(mailOption);
    result.status(200).json({ message: "Registration success, Check Email" });
  } catch (err) {
    console.log("error send email", err);
    result.status(404).json({ message: "Registration Failed, can't send email confirmation" });
  }
};

app.post("/register", async (req, result) => {
  try {
    const { name, email, password } = req.body;
    console.log("data body ", req.body);
    // check user
    const userExist = await User.findOne({ email });
    if (userExist) {
      return result
        .status(400)
        .json({ message: "Email already exist/registered" });
        console.log("data OK");
    }

    //create user
    const addUser = new User({ name, email, password });
    addUser.verificationToken = crypto.randomBytes(20).toString("hex");
    await addUser.save();
    //result.status(200).json({ message: "Registration success" });
    sendVerificationEmail(addUser.email, addUser.verificationToken);
  } catch (err) {
    console.log("error register ", err);
    result.status(500).json({ message: "Registration Failed a" });
  }
});

app.get("/verify/:token", async (request, result) => {
  try {
    const token = request.params.token;
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return result.status(404).json({ message: "Invalid Token" });
    }
    user.varified = true;
    user.verificationToken = undefined;
    await user.save();
    result.status(200).json({ message: "Verification success" });
  } catch (err) {
    console.log("error verify");
    result.status(500).json({ message: "Verification email failed" });
  }
});

app.get("/info", async (req,result) =>{
    try{
       return result.status(200).json({ message: "build success" });
    }
    catch(err){
      return  result.status(500).json({ message: "catch ",err }); 
    }
})