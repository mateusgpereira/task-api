const app = require('../src/app')
const request = require('supertest')
const User = require('../src/models/user')
const { userOne, userOneId, populateDatabase} = require('./fixtures/db')


beforeEach(populateDatabase)

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

test('Should upload an user image', async () => {
    await request(app).post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)
    let user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async () => {
    let response = await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Tester Blowed',
            email: 'tester69@tester.com',
        })
        .expect(200)
    
    expect(response.body.name).toBe('Tester Blowed')
    expect(response.body.email).toBe('tester69@tester.com')
})

test('Should not update invalid user fields', async()=> {
    await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            nickname: 'Guri Bad'
        })
        .expect(400)
})