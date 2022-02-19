const express = require('express');
const router = express.Router();

const cloudinary = require('cloudinary');
cloudinary.config({
    'api_key': process.env.CLOUDINARY_API_KEY,
    'api_secret': process.env.CLOUDINARY_SECRET
})

// get a signature from cloudinary
router.get('/sign', async function(req,res){
    // params_to_sign is sent in the request
    // by the cloudinary widget.
    // params_to_sign will be a JSON string but
    // we need it to be a JSON object
    const paramsToSign = JSON.parse(req.query.params_to_sign);
    
    // get the API secret from our .env file
    const apiSecret = process.env.CLOUDINARY_SECRET;

    // get the signature from cloudinary
    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

    res.send(signature);   

})

module.exports = router;