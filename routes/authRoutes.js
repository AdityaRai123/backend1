import express from 'express';
import connectToDatabase from '../lib/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const router = express.Router();
router.post('/register',async(req,res) =>{
    const {username, email, password} = req.body;
    try{
        const db = await connectToDatabase();
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0){
            return res.status(409).json({message:"user already esisted"})
        }
        const hashPassword = await bcrypt.hash(password,10);
        await db.query("INSERT INTO users (username, email, password) VALUES(?,?,?)",[username, email, hashPassword])
        return res.status(201).json({message:"user created Successfully"})

    }catch(err){
        return res.status(500).json(err);
    }
})
router.post('/login',async(req,res) =>{
    const {email, password} = req.body;
    try{
        const db = await connectToDatabase();
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0){
            return res.status(409).json({message:"user doesn't exist"})        
        }
        const isMatch = await bcrypt.compare(password,rows[0].password)
        if(!isMatch){
            return res.status(401).json({message:"wrong password"})
        }
        const token =jwt.sign({id:rows[0].id},"jwt-secret-key",{expiresIn:'3h'})
        
        return res.status(201).json({token:token})

    }catch(err){
        return res.status(500).json(err);
    }
})
const verifyToken = (req,res,next) =>{
    try{
        const token = req.headers['authorization'].split(' ')[1];
        if(!token){
            return res.status(403).json({message:"No Token Provided"})
        }
        const decoded = jwt.verify(token,"jwt-secret-key")
        req.userid = decoded.id;
        next()
    }catch(err){
        return res.status(500).json({message: "server error"})
    }
}
export default router;
router.get('/profile', verifyToken, async(req, res) =>{
    try{
        const db = await connectToDatabase();
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.userId]);
        if (rows.length === 0){
            return res.status(409).json({message:"user doesn't exist"})        
        }
        return res.status(201).json({user: rows[0]})
    }catch(err){
        return res.status(500).json({message: "server error"})
    }
})