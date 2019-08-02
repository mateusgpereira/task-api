const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail,sendByeEmail} = require('../emails/acount')

let upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            cb(new Error('Please update a valid img: jpg, jpeg or png'))
        }
        cb(undefined, true)
    }
})

router.get('/users/me', auth, (req, res) => {
    
    res.send(req.user)
})

router.post('/users', async (req, res) => {

    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.name, user.email)
        let token = await user.generateAuthToken()
        res.status(201).send({ user, token})
    } catch(e) {
        res.status(400).send(e)
    }
    
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()

        res.send()
    } catch(e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch(e) {
        res.status(500).send()
    }
})

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const user = await User.findById(_id)
        if(!user){
            res.status(404).send()
        }
        res.send(user)
    } catch(e) {
        res.status(404).send()
    }
    
})

router.patch('/users/me', auth,  async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', "age"]
    let isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates'})
    }

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()

        res.send(req.user)
    } catch(e) {
        res.status(400).send()

    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendByeEmail(req.user.name, req.user.email)
        res.send(req.user)

    } catch(e) {
        res.status(500).send()

    }
})

router.delete('/users/me/avatar', auth, async(req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    } catch(e) {
        res.status(400).send()
    }
    
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    let buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.get('/users/:id/avatar', async(req, res) => {
    try {
        let user = await User.findById(req.params.id)

        if(!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch(e) {
        res.status(404).send()
    }
})

router.post('/users/login', async (req, res) => {
    
    try {
        let user = await User.findByCredentials(req.body.email, req.body.password)
        let token = await user.generateAuthToken()
        if(!user) {
            return res.status(400).send()
        }

        res.send({ user, token})

    } catch(e) {
        res.status(400).send()
    }

})

module.exports = router