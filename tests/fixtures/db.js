const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

let userOneId = mongoose.Types.ObjectId()
let userTwoId = mongoose.Types.ObjectId()
let userOne = {
    _id: userOneId,
    name: 'Mike Tester',
    email: 'mike@testerexample.com',
    password: 'senhadusguri71',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}

let userTwo = {
    _id: userTwoId,
    name: 'Jonny Tester',
    email: 'jo@tester.com',
    password: 'senhadusguri71',
    tokens: [{
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }]
}

let taskOneId = mongoose.Types.ObjectId()

let taskOne = {
    _id: taskOneId,
    description: 'First task',
    owner: userOneId
}

let taskTwo = {
    description: 'Second task',
    owner: userOneId
}

let taskThree = {
    description: 'Third task',
    owner: userTwoId,
    completed: true
}



const populateDatabase = async()=> {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {
    userOne,
    userOneId,
    userTwo,
    userTwoId,
    taskOneId,
    populateDatabase
}