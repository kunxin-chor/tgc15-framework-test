const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const router = express.Router();
const { User } = require('../../models');
const { CheckIfAuthenticatedWithJWT, checkIfAuthenticatedWithJWT} = require('../../middlewares');

const generateAccessToken = function(user) {
    // create the token with jwt.sign()
    // 1st arg: the information/data in the token
    // 2nd arg: the token secret
    // 3rd arg: the expiry
    const token = jwt.sign({
        'username': user.get('username'),
        'id': user.get('id'),
        'email':user.get('email')
    },process.env.TOKEN_SECRET,{
        'expiresIn':'1h'  // h is for hour, m is for minutes, w is for week
    });
    return token;
}

function getHashedPassword(password){
    // create a sha256 hashing algo
    const sha256 = crypto.createHash('sha256');
    // create the hash as hexdecimal
    const hash = sha256.update(password).digest('base64');
    return hash;
}

router.post('/login', async function(req,res){
    let userEmail = req.body.email;
    let password =req.body.password;
    
    // find the user by the email and check if the user exists
    let user = await User.where({
        'email': userEmail
    }).fetch({
        'require': false
    })

    // check if the user is legit
    // - check if user is not null
    // - check if the hashed password in user matches hashed version of
    // the provided password
    if (user && user.get('password') == getHashedPassword(password)) {
        // generate the JWT
        let accessToken = generateAccessToken(user);
        res.json({
            'accessToken':accessToken
        })
    } else {
        // indicate that there is an error logging in
        res.statusCode = 401;
        res.send({
            'error':"Wrong email or password"
        })
    }
})

// simply send back the user name and email
// if the user provides a valid JWT
router.get('/profile', checkIfAuthenticatedWithJWT, function(req,res){
    res.json({
        'username': req.user.username,
        'email': req.user.email
    })
})

module.exports = router;