const hapi = require('hapi');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/hapidb', { useMongoClient: true, promiseLibrary: global.Promise })
    .then(()=> { console.log('MongoDB connected.......')})
    .catch(err => console.log(err));

//Create Task model
const Task = mongoose.model('Task', {text:String});

//Init Server 
const server = new hapi.Server();

//Add connection
server.connection({
    port: 8000,
    host: 'localhost'
})

//Home Route
server.route({
    method: 'GET',
    path : '/',
    handler: (request,reply) => {
        //reply('Hello Deepankar');
        reply.view('index',{
            name: 'Deepankar Singh'
        });
    }
})

//dynamic Route
server.route({
    method: 'GET',
    path : '/user/{name}',
    handler: (request,reply) => {
        reply('Hello ' + request.params.name);
    }
})

//Static Route
server.register(require('inert'), (err)=>{
    if(err){
        throw err;
    }
    server.route({
        method: 'GET',
        path : '/about',
        handler: (request,reply) => {
            reply.file('./public/about.html');
        }
    })
    
    server.route({
        method: 'GET',
        path : '/image',
        handler: (request,reply) => {
            reply.file('./public/hapi.html');
        }
    })
})

//GET Tasks Route
server.route({
    method: 'GET',
    path : '/tasks',
    handler: (request,reply) => {
        var tasks = Task.find((err, tasks) => {
            reply.view('tasks',{
                tasks: tasks
            });
        })
    }
})

//Post Tasks Route
server.route({
    method: 'POST',
    path : '/tasks',
    handler: (request,reply) => {
        var text = request.payload.text;
        var newTask = new Task({text: text}); 
        newTask.save((err,task) => {
            if(err)  return console.log(err); 
            return reply.redirect().location('tasks');
        });
    }
})

//Vision Templates
server.register(require('vision'), (err) =>{
    if(err){
        throw err;
    }
    server.views({
        engines: {
            html: require('handlebars')
        },
        path: __dirname + '/views'
    })

})

//Start Server 
server.start((err)=>{
    if(err){
        throw err;
    }else{
        console.log(`Server started at: ${server.info.uri}`);
    }
})
