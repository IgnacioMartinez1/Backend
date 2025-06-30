const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const userModel = require("../models/User");
const { createHash, isValidPassword } = require("../utils/hash");

const initializePassport = () => {
  // Estrategia de registro
  passport.use(
    "register",
    new LocalStrategy(
      { passReqToCallback: true, usernameField: "email" },
      async (req, email, password, done) => {
        const { first_name, last_name, age, cart, role } = req.body;
        try {
          let userFound = await userModel.findOne({ email });
          if (userFound) {
            return done(null, false, { message: "Usuario ya existe" });
          }
          const newUser = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
            cart,
            role,
          };
          const user = await userModel.create(newUser);
          return done(null, user);
        } catch (err) {
          done(err);
        }
      }
    )
  );

  // Estrategia de login
  passport.use(
    "login",
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await userModel.findOne({ email });
          if (!user)
            return done(null, false, { message: "Usuario no encontrado" });
          if (!user.password || !isValidPassword(password, user.password))
            return done(null, false, { message: "Contraseña incorrecta" });
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Estrategia JWT
  passport.use(
    "jwt",
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: "jwtSecret", // Usa variable de entorno en producción
      },
      async (jwt_payload, done) => {
        try {
          const user = await userModel.findById(jwt_payload.id);
          if (!user) return done(null, false);
          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      let user = await userModel.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};

module.exports = initializePassport;
