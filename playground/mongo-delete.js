//const MongoClient = require('mongodb').MongoClient;
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err,db) => {
    if(err){
        return console.log('Unable to connect to server');
    }
    console.log('Connected to mongo db server');

//deleteMany
// db.collection('Todos').deleteMany({text: "Eat luch"}).then((result) => {
//     console.log(result);
//})
//deleteOne

//     db.collection('Todos').deleteOne({text: "Eat lunch"}).then((result) => {
//         console.log(result);
//     });
// //findOneAndDelete
//
// db.collection('Todos').findOneAndDelete({completed: false}).then((result) => {
//     console.log(result);
//})

    // db.collection('Users').deleteMany({user: 'Ivan'}).then((result) => {
    //     console.log(result);
    // });
    db.collection('Users').deleteOne({
        _id: new ObjectID("5b1a7c3215128072cc5e0fa9")}).then((result) => {
            console.log(result);
    });

//db.close();

});