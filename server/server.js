import express from "express";
// import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
const port = process.env.PORT;
const saltrounds = 10;
const uid = 1;

const db = new pg.Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
});

db.connect();

// app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");


// GET METHODS

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/signup", async (req, res) => {
  res.render("signup",{error:null});
});

app.get("/login", async (req, res) => {
  res.render("login",{error:null});
});

app.get("/dashboard",(req,res)=>{
    res.render("dashboard");
})

app.get("/home",(req,res)=>{
    res.render("home")
})

app.get("/upload",(req,res)=>{
    res.render("upload");
})

app.get("/progress",async(req,res)=>{
    const result = await db.query("select * from progress_photos where user_id = $1",[uid]);

    res.send(result.rows);
})


// POST METHODS

app.post("/signup", async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    
    const checkemail = await db.query("select * from users where email = $1", [
        email,
    ]);
    
    if (checkemail.rows.length > 0) {
        return res.render("signup.ejs", {
            error: "Email already exists. Try logging in.",
        });
    } else {
        bcrypt.hash(password, saltrounds, async (err, hash) => {
            await db.query(
                "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
                [name, email, hash],
            );
            res.redirect("/login");
        });
    }
});

app.post("/login",async (req,res)=>{
    const email = req.body.email;
    const password = req.body.password;
    
    const result = await db.query("select * from users where email =$1",[email]);
    
    if(result.rows.length===0){
        return res.render("login.ejs",{
            error : "user does not exist",
        })
    }else{
        bcrypt.compare(password,result.rows[0].password,(err,ismatch)=>{
            if(ismatch){
                uid = result.rows[0].id;
                res.redirect("/dashboard");
            }else{
                return res.render("login.ejs",{
                    error:"incorrect password",
                })
            }
        })
    }
})

app.post("/logout",(req,res)=>{
    res.redirect("/home");
})

app.post("/upload", async (req, res) => {
    const url = "https://dummy-image.com/test.jpg";

    const bv = req.body.body_view;
    const weight = req.body.weight;
    const notes = req.body.notes;

    await db.query(
        `INSERT INTO progress_photos
        (image_url, body_view, weight, notes, user_id)
        VALUES ($1, $2, $3, $4, $5)`,
        [url, bv, weight, notes, uid]
    );

    res.redirect("/dashboard");
});

app.listen(port, (req, res) => {
    console.log(`Server running on port ${port}`);
});
