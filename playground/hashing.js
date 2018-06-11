const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');


var data ={
    id: 10
}
var token = jwt.sign(data, '123abc');
console.log(token);


var decoded = jwt.verify(token, '123abc')

console.log(decoded);

// var message = 'I am Ivan the Admin';
//
// var hash = SHA256(message).toString();
// console.log(message,hash)
//
// var data ={
//     id : 4
// };
//
// var token = {
//     data,
//     hash:SHA256(JSON.stringify(data)+ 'sometext').toString()
// };
//
// token.data.id =5;
// token.hash =SHA256(JSON.stringify(token.data)).toString();
//
// var resultHash = SHA256(JSON.stringify(token.data)+'sometext').toString();
//
// if(resultHash === token.hash) {
//     console.log('welcome user');
// }else{
//     console.log('Haker in sight access denied');
// }