const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../db.config');

const JWT_SECRET = process.env.SECRET_SESSION;

// Register route
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    // Check if user already exists
    const [existingUser] = await db.execute('SELECT * FROM user WHERE username = ?', [username]);
    if (existingUser.length > 0) {
        return res.status(409).json({ message: 'Username already exists' });
    }
    // Hash the password and save the user
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        return res.status(201).json({ message: 'User registered successfully', userId: result.username });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Login route
    // const isMatch = await bcrypt.compare(password, user.password);
        // if(!isMatch){
        //     return res.status(401).json({message: 'Invalid username or password'});
        // }
router.post('/login',(req,res)=>{
  
    const {username, password} = req.body;

    if(!username || !password){
       res.status(400).json({message: 'Username and password are required'});  
    }
    // Check if user exists and password = ? , password
    db.query('SELECT * FROM Utilizador WHERE username=?', [username], function(err, rows) { 
        if(err){
            res.status(401).json({message: 'Invalid username or password'});  
        }else if(rows.length === 0){
            res.status(401).json({message: 'Nao foi possivel fazer login, tente novamente!'});
        }
        const isMatch = bcrypt.compareSync(password,rows[0].password);
        if(!isMatch){
            res.status(401).json({message: 'Invalid username or password'});
        }else{
            const token = jwt.sign({ userId: rows[0].codigo }, JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({message: 'Login successful', user: {userId: rows[0].codigo, token, username: rows[0].username}});
        }
    }); 
});

// router.post('/login',(req,res)=>{
  
//     const {username, password} = req.body;

//     if(!username || !password){
//        res.status(400).json({message: 'Username and password are required'});  
//     }
//     db.query('SELECT * FROM user WHERE username = ? and password = ?', [username, password], function(err, rows) { 
//         if(err){
//             res.status(401).json({message: 'Invalid username or password'});
//         }else if(rows.length === 0){    
//             res.status(401).json({message: 'Nao foi possivel fazer login, tente novamente!'});
//         }else{
//             const token = jwt.sign({ userId: rows[0].id }, JWT_SECRET, { expiresIn: '1h' });
//             res.status(200).json({message: 'Login successful', user: {userId: rows[0].id, token, username: rows[0].username}});
//         }
//     });
// });
// Logout route
router.post('/logout', (req, res) => {
    if (req.session.user) {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json({ message: 'Internal server error' });
            }
            res.clearCookie('connect.sid'); // Clear the session cookie
            res.status(200).json({ message: 'Logout successful' });
        });
    }
});
//definir middleware de autenticação
const autheticateToken = (req, res, next) => {

    const token = req.headers['authorization'];
    if (!token){
        return res.status(401).json({ message: 'Access denied' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err){
           res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Rota protegida
router.get('/protected', autheticateToken,  (req, res) => {
  
        db.query('SELECT * FROM user WHERE id = ?', [req.user.id],function(err, rows) {
            if (err) {
                res.status(500).json({ message: 'Internal server error' });
            }else{
                res.status(200).json(
                    { message: 'Protected route accessed', 
                      data: rows,
                      isLoggedIn: true
                    });
            }  
        });
});
// rota para verificar p estado de login do utilizador
router.get('/status', (req, res) => {
    if (req.session.user.isLoggedIn) {
      res.status(200).json({ isLoggedIn: true, user: {userId: req.session.user.userid, username: req.session.user.username} });
    }
    res.status(200).json({ isLoggedIn: false });
});

module.exports = router;