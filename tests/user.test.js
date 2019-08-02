const app = require('../src/app')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const request = require('supertest')
const User = require('../src/models/user')

let userOneId = mongoose.Types.ObjectId()
let userOne = {
    _id: userOneId,
    name: 'Mike Tester',
    email: 'mike@testerexample.com',
    password: 'senhadusguri71',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}

beforeEach(async () => {
    await User.deleteMany()
    await new User(userOne).save()
})

test('Should signup a user', async () => {
    let response = await request(app).post('/users').send({
        name: 'Andrew Tester',
        email: 'andrew@testerexample.com',
        password: 'senhadusguri71'
    }).expect(201)

    const user = await User.findById(response.body.user._id)
    expect(user).not.toBe(null)

    expect(response.body).toMatchObject({
        user: {
            name: 'Andrew Tester',
            email: 'andrew@testerexample.com',
        }
    })
    

    expect(response.body.user.password).not.toBe('senhadusguri71')

})

test('Should login a user', async () => {
    let response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    let user = await User.findById(response.body.user._id)

    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexistenet user', async () => {
    await request(app).post('/users/login').send({
        email: 'arrombado@nonemail.com',
        password: 'forgetit24'
    }).expect(400)
})

test('Should get a user profile', async () => {
    await request(app).get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for a unauthenticated user', async () => {
    await request(app).get('/users/me')
        .send()
        .expect(401)
})

test('Should delete an account for a user', async () => {
    await request(app).delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    let user = await User.findById(userOne._id)
    expect(user).toBe(null)
})

test('Should not delete an account for an unauthenticated user', async () => {
    await request(app).delete('/users/me')
        .send()
        .expect(401)
})