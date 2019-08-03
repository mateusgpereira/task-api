const app = require('../src/app')
const request = require('supertest')
const Task = require('../src/models/task')
const {userOne, userTwo, userTwoId, taskOneId, populateDatabase} = require('./fixtures/db')

beforeEach(populateDatabase)

test('Should create a task for a user', async()=> {
    let response = await request(app).post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'Test my application'
        })
        .expect(201)
    let task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toBe(false)
})

test('Should get all tasks for an authenticated user', async()=> {
    let response = await request(app).get('/tasks/')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toBe(2)
})

test('Should not delete a taks from another user', async()=> {
    await request(app).delete(`/tasks/${taskOneId}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)

    let task = await Task.findById(taskOneId)
    expect(task).not.toBeNull()
})