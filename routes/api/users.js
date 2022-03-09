const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const router = express.Router();
const { User, BlacklistedToken } = require('../../models');
const { CheckIfAuthenticatedWithJWT, checkIfAuthenticatedWithJWT} = require('../../middlewares');

const generateToken = function(user, secret, expiresIn) {
    // create the token with jwt.sign()
    // 1st arg: the information/data in the token
    // 2nd arg: the token secret
    // 3rd arg: the expiry
    const token = jwt.sign({
        'username': user.username,
        'id': user.id,
        'email':user.email
    },secret,{
        'expiresIn':expiresIn  // h is for hour, m is for minutes, w is for week
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
        let accessToken = generateToken(user.toJSON(), process.env.TOKEN_SECRET, "15min");
        // the refreshToken should expire later than the accessToken
        let refreshToken = generateToken(user.toJSON(), process.env.REFRESH_TOKEN_SECRET, "1h");
        res.json({
            'accessToken':accessToken,
            'refreshToken':refreshToken
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


// given a refresh token, return a new access token for the user
router.post('/refresh', async function(req,res){
    let refreshToken = req.body.refreshToken;

     // if no refresh token provided, then we report an error
     if (!refreshToken) {
        res.sendStatus(401); // forbidden
        return;
    }


    // check if the refreshToken is in the blacklist
    let result = await BlacklistedToken.where({
        'token': refreshToken
    }).fetch({
        require: false
    })

    // if the refresh token is already black list
    if (result) {
        // tell the user that they cannot use it to get a new access token
        res.status(401);
        res.json({
            'message':"The refresh token has already expired or logged out"
        });
        return;
    }
    
   
    // if a refreshtoken given, verify whether it is legit
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, function(err, user){
        if (err) {
            res.sendStatus(403);
        } else {
            // get a new access token
            let accessToken = generateToken(user, process.env.TOKEN_SECRET, '15m');
            res.json({
                'accessToken': accessToken
            })
        }
        
    })
})

router.post('/logout', async function(req,res){
    let refreshToken = req.body.refreshToken;

    //check if a refresh token is in the body
    if (!refreshToken) {
        // if not, then it's an error
        res.sendStatus(401);
    } else {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async function(err,user){
            // check if there is an error
            if (err) {
                res.sendStatus(403);
                return;
            } else {
                const token = new BlacklistedToken();
                token.set('token', refreshToken);
                token.set('date_created', new Date());
                await token.save();
                res.json({
                    'message':'logged out'
                })
            }
        })
    }
})

module.exports = router;