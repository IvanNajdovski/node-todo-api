const supertest = require("supertest");
const expect = require('expect');
const{ObjectID} = require('mongodb');

const {app} = require ('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
    _id: new ObjectID(),
    text: 'first test todo'
},{
    _id: new ObjectID(),
    text: 'second test todo',
    completed: true,
    completedAt: 3422
}];


beforeEach((done) => {
   Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
}).then(()=> done())
});

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';

           supertest(app)
               .post('/todos')
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
    it('shoud not create todo with invalid bodydata',(done) => {
            supertest(app)
                .post('/todos')
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
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
        })
    .end(done);
});
});
describe('GET /todos/:id', () =>{
    it('should return todo doc', (done) => {
        supertest(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);
});
    it('should return 404 if todo not found', (done) => {
        supertest(app)
        .get(`/todos/${new ObjectID().toHexString()}`)
            .expect(404)
            .end(done);
    });
    it('should return 404 for non-object id\'s', (done) => {
        supertest(app)
        .get('/todos/123')
        .expect(404)
        .end(done);
    });

});
describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        var hexId = todos[1]._id.toHexString();
        supertest(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo._id).toBe(hexId);
        })
            .end((err,res) => {
                if (err) {
                    return done(err);
                }
                Todo.findById(hexId).then((todo) => {
                    expect(todo).toNotExist()
        done()
    }).catch((e) => {
        done(e)
    });
    });
    });
    it('should return 404 if todo not found', (done) => {
        supertest(app)
        .delete(`/todos/${new ObjectID().toHexString()}`)
        .expect(404)
        .end(done);
    });
    it('should return 404 if ObjectID is not valid',(done) => {
      supertest(app)
        .delete('/todos/123')
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
                .send({text,completed})

                .expect(200)
                .expect((res) => {
                    expect(res.body.todo.completed).toBe(true);
                    expect(res.body.todo.text).toBe("something funny");
                    expect(res.body.todo.completedAt).toBeA('number');
            })
        .end(done)

})
    it('should clear completedAt when todo is not completed',(done) => {
        var secondId = todos[1]._id.toHexString();
        var text = "Going solo";
         var completed = false;
            supertest(app)
                .patch(`/todos/${secondId}`)
                .send({text,completed})
                .expect(200)
                .expect((res) => {
                    expect(res.body.todo.text).toBe("Going solo");
                    expect(res.body.todo.completed).toBe(false);
                    expect(res.body.todo.compleatedAt).toNotExist();
            })
            .end(done)
    })
})