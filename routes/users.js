const express = require('express');
const router = express.Router();  // create a new router object

const { createUserForm, bootstrapField } = require('../forms');
const { User } = require('../models');

router.get('/register', function(req,res){
    const form = createUserForm();
    res.render('users/register', {
        'form': form.toHTML(bootstrapField)
    })
})

router.post('/register', function(req,res){
    const registerForm = createUserForm();
    registerForm.handle(req,{
        'success': async function(form) {
            // create a new user model instance
            // an instance of a model refers to one row in the table
            const user = new User({
                'username': form.data.username,
                'password': form.data.password,
                'email': form.data.email
            })

            // save the model
            await user.save(); 
            req.flash("success_messages", "Account created successfully");
            res.redirect('/users/login')
        },
        'error':function(form) {
            res.render('users/register',{
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/login', function(req,res){
    res.render('users/login');
})

// export out the router object
module.exports = router;