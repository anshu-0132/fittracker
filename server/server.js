import express from "express";
// import cors from "cors";
import pg from "pg"
import dotenv from "dotenv"

dotenv.config()

const app = express();
const port = process.env.PORT;

const db = new pg.Client({
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    port:process.env.DB_PORT,
    database:process.env.DB_DATABASE,
    host:process.env.DB_HOST
})

db.connect();

// app.use(cors());
app.use(express.json())

app.get("/test",async (req,res)=>{
    try{
        const result =await db.query("select NOW()");
        res.json(result.rows)
    }catch(err){
        console.log(err);
        res.status(500).send("database error");
    }
})

app.post("/submit",(req,res)=>{

})

app.listen(port,(req,res)=>{
    console.log(`Server running on port ${port}`);
})