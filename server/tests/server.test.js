const supertest = require("supertest");
const expect = require('expect');
const{ObjectID} = require('mongodb');

const {app} = require ('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

           supertest(app)
                .post('/todos')
                .set('x-auth', users[0].tokens[0].token)
                .send({text})
                 .expect(200)
                .expect((res) =>{
                   expect(res.body.text).toBe(text);
                })
                .end((err,res) =>{
                    if(err){
                        return done(err);
                    }
                    Todo.find({text}).then((todos) =>{
                        expect(todos.length).toBe(1);
                        expect(todos[0].text).toBe(text);
                        done();
                    }).catch((e) => {
                        done(e)
                     });
                });
});
    it('shoud not create todo with invalid body data',(done) => {
            supertest(app)
                .post('/todos')
                .set('x-auth', users[0].tokens[0].token)
                .send({})
                .expect(400)
                .end((err,res) =>{
                if(err){
                    return done(err);
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2)
                    done();
                }).catch((e) => {
                     done(e)
                });
                });
    });
});

describe('GET/ todos',() => {
    it('should get all todos',(done) => {
        supertest(app)
            .get('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(1);
             })
            .end(done);
});
});
describe('GET /todos/:id', () =>{
    it('should return todo doc', (done) => {
        supertest(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
});
    it('should not return todo doc created by other user', (done) => {
        supertest(app)
            .get(`/todos/${todos[1]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
             .expect(404)
            .end(done);
});
    it('should return 404 if todo not found', (done) => {
        supertest(app)
        .get(`/todos/${new ObjectID().toHexString()}`)
        .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
    it('should return 404 for non-object id\'s', (done) => {
        supertest(app)
        .get('/todos/123')
        .set('x-auth', users[0].tokens[0].token)
        .expect(404)
        .end(done);
    });

});
describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        var hexId = todos[1]._id.toHexString();
        supertest(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(hexId);
             })
            .end((err,res) => {
                if (err) {
                    return done(err);
                }
                Todo.findById(hexId).then((todo) => {
                    expect(todo).toBeFalsy()
                    done()
                }).catch((e) => {
                    done(e)
                });
            });
    });
    it('should not remove a todo from another user', (done) => {
        var hexId = todos[0]._id.toHexString();
            supertest(app)
                .delete(`/todos/${hexId}`)
                .set('x-auth', users[1].tokens[0].token)
                .expect(404)
                .end((err,res) => {
                    if (err) {
                        return done(err);
                     }
                    Todo.findById(hexId).then((todo) => {
                         expect(todo).toBeTruthy()
                    done()
                    }).catch((e) => {
             done(e)
                    });
                });
    });
    it('should return 404 if todo not found', (done) => {
        supertest(app)
        .delete(`/todos/${new ObjectID().toHexString()}`)
        .set('x-auth', users[1].tokens[0].token)
        .expect(404)
        .end(done);
    });
    it('should return 404 if ObjectID is not valid',(done) => {
      supertest(app)
        .delete('/todos/123')
        .set('x-auth', users[1].tokens[0].token)
        .expect(404)
        .end(done);
    });
});

describe('PATCH /todos/:id', () =>{
    it('should update the todo', (done) =>{
        var firstID = todos[0]._id.toHexString();
        var text = "something funny";
        var completed = true;
            supertest(app)
                .patch(`/todos/${firstID}`)
                .set('x-auth', users[0].tokens[0].token)
                .send({text,completed})
                .expect(200)
                .expect((res) => {
                    expect(res.body.todo.completed).toBe(true);
                    expect(res.body.todo.text).toBe("something funny");
                    expect(typeof res.body.todo.completedAt).toBe('number');
                })
                .end(done)

});
    it('should not update the todo from another user', (done) =>{
        var firstID = todos[0]._id.toHexString();
        var text = "something funny";
        var completed = true;
            supertest(app)
                .patch(`/todos/${firstID}`)
                .set('x-auth', users[1].tokens[0].token)
                .send({text,completed})
                .expect(404)
                .end(done)

    });
    it('should clear completedAt when todo is not completed',(done) => {
        var secondId = todos[1]._id.toHexString();
        var text = "Going solo";
         var completed = false;
            supertest(app)
                .patch(`/todos/${secondId}`)
                .set('x-auth', users[1].tokens[0].token)
                .send({text,completed})
                .expect(200)
                .expect((res) => {
                    expect(res.body.todo.text).toBe("Going solo");
                    expect(res.body.todo.completed).toBe(false);
                    expect(res.body.todo.compleatedAt).toBeFalsy();
                 })
                .end(done)
    });
});
describe ('Get /users/me', () =>{
    it('should return user if authenticated', (done) => {
        supertest(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });
    it('should return 401 if not authenticated', (done) => {
        supertest(app)
        .get('/users/me')
        .expect(401)
        .expect((res) => {
            expect(res.body).toEqual({})
         })
        .end(done)

    });
});
describe ('POST /users', () => {
    it('should create a user', (done) => {
        var email = 'exampe@example.com'
        var password = '123aew?'
            supertest(app)
                .post('/users')
                .send({email,password})
                .expect(200)
                .expect((res) => {
                    expect(res.body.email).toBe(email);
                    expect(res.headers['x-auth']).toBeTruthy();
                    expect(res.body._id).toBeTruthy();
                })
                .end((err) => {
                    if (err){
                        return done(err);
                    }
                        User.findOne({email}).then((user) => {
                            expect(user).toBeTruthy();
                            expect(user.password).not.toBe(password);
                            done();
                        }).catch((e) => done(e))
                });
    });
    it('should return validation errors if request invalid', (done) =>{
        var email = 'example.com';
        var password = 'e123224';
            supertest(app)
                .post('/users')
                .send({email,password})
                .expect(400)
                .end((err,res) =>{
                    if(err){
                        done(err)
                    }
                    User.find().then((users) => {
                        expect(users.length).toBe(2)
                     done()
                    }).catch((e) =>{
                        done(e)
                    });
            });
    });
it('should return validation errors if password below 6 caracters invalid', (done) =>{
    var email = 'example.com';
    var password = 'e123';
        supertest(app)
            .post('/users')
            .send({email,password})
            .expect(400)
            .end((err,res) =>{
                if(err){
                     done(err)
                }
                User.find().then((users) => {
                    expect(users.length).toBe(2)
                    done()
                }).catch((e) =>{
                     done(e)
                });
});
});
    it('shoult not create user if email in use', (done) => {
    var email = users[0].email;
    var password = '123456';
        supertest(app)
            .post('/users')
            .send({email,password})
            .expect(400)
            .end((err,res) => {
                if(err){
                    done(err)
                }
                User.find().then((users) => {
                    expect(users.length).toBe(2)
                    done()
                }).catch((e) =>{
                    done(e)
                });
        });
    });
});

describe('POST /users/login', () =>{
    it('should login user and return auth token', (done) => {
        supertest(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeTruthy();
            })
            .end((err,res) => {
                if(err) {
                    return done(err)
                }
                User.findById(users[1]._id).then((user) => {
                    expect(user.toObject().tokens[1]).toMatchObject({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch((e) => done(e))
            });
});
    it('should reject invalid login', (done) => {
        supertest(app)
        .post('/users/login')
        .send({
            email: users[1].email,
            password: '1232412'
        })
        .expect(400)
        .expect((res) => {
            expect(res.headers['x-auth']).toBeFalsy()
    })
        .end((err,res) =>{
            if(err){
                return done(err)
            }
            User.findById(users[1]._id).then((user) => {
                expect(user.tokens.length).toBe(1)
                done();
}).catch((e) => done(e))
})
        });
});
describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', (done) => {
        supertest(app)
            .delete(`/users/me/token`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end((err,res) => {
                if(err){
                    done(err)
                }
            User.findById(users[0]._id).then((user) => {
                expect(user.tokens.length).toBe(0)
                done()
        }).catch((e) => done(e))

        })
});
});
