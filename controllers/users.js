const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/users");
const nodemailer = require("nodemailer");
const mailgunTransport = require("nodemailer-mailgun-transport");
const { validationResult } = require("express-validator");

const transporter = nodemailer.createTransport(
  mailgunTransport({
    auth: {
      api_key: "502400ccff6d1c259c6e33341fa8fa09-5d9bd83c-ce1b316f",
      domain: "sandbox1de4090944f7408bac34a7e095dc83f2.mailgun.org",
    },
  })
);

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("users/login", {
    path: "/users/login",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("users/signup", {
    path: "/users/signup",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

exports.postLogin = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("users/login", {
        path: "/users/login",
        errorMessage: errors.array()[0].msg,
        oldInput: {
          email: email,
          password: password,
        },
        validationErrors: errors.array(),
      });
    }
   
    const user = await User.findOne({ email: email });
    if (!user) {
      req.flash("error", "Invalid email or password.");
      return res.redirect("/users/login");
    }
    const doMatch = await bcrypt.compare(password, user.password);
    console.log(password)
    if (doMatch) {
      req.session.isLoggedIn = true;
      req.session.user = user;

      await req.session.save()
        req.flash("info", "You've logged in successfully ");
        res.redirect("/articles");
      } else {
      req.flash("error", "Invalid email or password.");
      res.redirect("/users/login");
    }
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postSignup = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).render("users/signup", {
        path: "/users/signup",
        errorMessage: errors.array()[0].msg,
        oldInput: {
          email: email,
          password: password,
          confirmPassword: req.body.confirmPassword,
        },
        validationErrors: errors.array(),
      });
    }

    const user = await User.findOne({ email: email });
    if (user) {
      req.flash("error", "E-Mail exists already, please pick a different one.");
      return res.redirect("/users/signup");
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      email: email,
      password: hashedPassword,
    });
    await newUser.save();
    res.redirect("/users/login");
    return transporter.sendMail({
      to: email,
      from: "blog@node-complete.com",
      subject: "Signup succeeded!",
      html: "<h1>You successfully signed up!</h1>",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/articles");
  });
};

exports.getResetPassword = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("users/reset-password", {
    path: "/users/reset-password",
    errorMessage: message,
  });
};

exports.postResetPassword = async (req, res, next) => {
  crypto.randomBytes(32, async (err, buffer) => {
    const email = req.body.email;

    try {
      if (err) {
        console.log(err);
        return res.redirect("/users/reset-password");
      }
      const token = buffer.toString("hex");
      const user = await User.findOne({ email: email });
      if (!user) {
        req.flash("error", "No account with that email found.");
        return res.redirect("/users/reset-password");
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      await user.save();
      res.redirect("/users/login");
      transporter.sendMail({
        to: req.body.email,
        from: "blog@node-complete.com",
        subject: "Password reset",
        html: `
          <p>You requested a password reset</p>
          <p>Click this <a href="http://localhost:3030/users/reset-password/${token}">link</a> to set a new password.</p>
        `,
      });
    } catch (err) {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    }
  });
};

exports.getNewPassword = async (req, res, next) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    let message = req.flash("error");
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    return res.render("users/new-password", {
      path: "/users/new-password",
      errorMessage: message,
      userId: user._id,
      passwordToken: token,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postNewPassword = async (req, res, next) => {
  try {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;
    const user = await User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId,
    });
    resetUser = user;
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    resetUser.password = hashedPassword;
    resetUser.resetToken = undefined;
    resetUser.resetTokenExpiration = undefined;
    await resetUser.save();
    console.log(resetUser);
    req.flash("success", "Successfully changed password.");
    return res.redirect("/users/login");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
