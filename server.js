import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";
import MongoStore from "connect-mongo";
import handlebars from "express-handlebars";
import mongoose from "mongoose";
import faker from "faker";
import passport from "passport";
import bCrypt from "bcrypt";
import { Strategy as LocalStrategy } from "passport-local";

import { User } from "./models/user.js";

const MONGO_DB_URI =
	"mongodb+srv://moncholoco:moncholoco@cluster0.jj0on.mongodb.net/passport?retryWrites=true&w=majority";

const app = express();

let productos = [ ];
let id=1

app.use(cookieParser());
app.use(
	session({
		store: MongoStore.create({
			mongoUrl: MONGO_DB_URI,
			ttl: 600,
		}),
		secret: "sh",
		resave: false,
		saveUninitialized: false,
		rolling: false,
		cookie: {
			maxAge: 600000,
		},
	})
);

app.engine(
	"hbs",
	handlebars({
		extname: ".hbs",
		defaultLayout: "index.hbs",
	})
);
app.set("view engine", "hbs");
app.set("views", "./views");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

passport.use(
	"login",
	new LocalStrategy(
		{
			passReqToCallback: true,
		},
		(req, username, password, cb) => {
			User.findOne({ username: username }, (err, user) => {
				if (err) return done(err);
				if (!user) {
					console.log("User Not Found with username " + username);
					return cb(null, false);
				}
				if (!validatePassword(user, password)) {
					console.log("Invalid Password");
					return cb(null, false);
				}
				return cb(null, user);
			});
		}
	)
);

const validatePassword = (user, password) => {
	return bCrypt.compareSync(password, user.password);
};

passport.use(
	"register",
	new LocalStrategy(
		{
			passReqToCallback: true,
		},
		function (req, username, password, cb) {
			const findOrCreateUser = function () {
				User.findOne({ username: username }, function (err, user) {
					if (err) {
						console.log("Error in SignUp: " + err);
						return cb(err);
					}
					if (user) {
						console.log("User already exists");
						return cb(null, false);
					} else {
						var newUser = new User();
						newUser.username = username;
						newUser.password = createHash(password);
						newUser.save((err) => {
							if (err) {
								console.log("Error in Saving user: " + err);
								throw err;
							}
							console.log("User Registration succesful");
							return cb(null, newUser);
						});
					}
				});
			};
			process.nextTick(findOrCreateUser);
		}
	)
);

var createHash = function (password) {
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};
// Con la serialización, se almacena el ID de la sesión
passport.serializeUser((user, done) => {
	done(null, user._id);
});

// Con deserializar, se obtiene el usuario a partir del ID
passport.deserializeUser((id, done) => {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});

app.get("/ses", (req, res) => {
	console.log(req.session);
	res.send("Revisar consola");
});

app.post(
	"/login",
	passport.authenticate("login", { failureRedirect: "/faillogin" }),
	(req, res) => {
		res.redirect("/");
	}
);

app.get("/faillogin", (req, res) => {
	res.render("login-error", {});
});


app.get("/register", (req, res) => {
	res.render("register");
});

app.post(
	"/register",
	passport.authenticate("register", { failureRedirect: "/failregister" }),
	(req, res) => {
		res.redirect("/");
	}
);

app.get("/failregister", (req, res) => {
	res.render("register-error", {});
});

// Cerrar sesión es una función de Passport para borrar la sesión.
// Este req.user.username es creado por Passport cuando serializa al usuario
app.get("/logout", (req, res) => {
	const { username } = req.user;
	req.logout();
	res.render("logout", { username });
});

app.get("/login", (req, res) => {
	if (req.isAuthenticated()) {
		res.redirect("/");
	} else {
		res.render("login");
	}
});

// El req.user.username no solo devuelve la ID, sino todo el usuario
app.get("/", (req, res) => {
	if (req.isAuthenticated()) {
		for (let i = 0; i < 10; i++){
            const producto = {
                nombre: faker.commerce.productName(),
                precio: faker.commerce.price(),
                foto: faker.image.imageUrl(),
                id: id++
            }
            productos.push(producto);
        }
		res.render("home", { username: req.user.username, item: productos });
        productos=[]
        id=1
	} else {
		res.redirect("login");
	}
});

const PORT = process.env.PORT || 3000;
const srv = app.listen(PORT, async () => {
	console.log(`Servidor http escuchando en el puerto ${srv.address().port}`);
	try {
		const mongo = await mongoose.connect(MONGO_DB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log("Connected DB");
	} catch (error) {
		console.log(`Error en conexión de Base de datos: ${error}`);
	}
});
srv.on("error", (error) => console.log(`Error en servidor ${error}`));
