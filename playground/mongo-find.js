//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err,db) => {
    if(err){
        return console.log('Unable to connect to server');
    }
    console.log('Connected to mongo db server');

// db.collection('Todos').find({
//     _id: new ObjectID('5b1a6f64cdd31529a0a2eb83');
// }).toArray().then((doc) => {
//     console.log('Todos');
//     console.log(JSON.stringify(doc, undefined, 2));
// },(err) => {
//     console.log('unable to fetch todos',err);
// });

// db.collection('Todos').find().count().then((count) => {
//     console.log(`Todos count: ${count}`);
//
// },(err) => {
//     console.log('unable to fetch todos',err);
// });
    db.collection('Users').find({user: 'Dime'}).count().then((numb) => {
         console.log(`Number of users with name Dime`);
    console.log(numb);
    },(err) => {
         console.log('Unable to get users with name Ivan')
});
    db.collection('Users').find({user: 'Dime'}).toArray().then((users) => {
        console.log(`Users with name Dime`);
        console.log(JSON.stringify(users,undefined,2));
    },(err) => {
        console.log('Unable to get users with name Ivan')
});

//db.close();

});