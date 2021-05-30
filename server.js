const config = require("./public/javascript/config");
const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const ejs = require('ejs');
const pgPersistance = require('./public/javascript/pg-persistance');

let userBins = {};

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.json());
app.use('/scripts', express.static(__dirname + '/node_modules/socket.io/client-dist/'));

app.get("/", (req, res) => {
  res.status(200).render('home');
});

app.get("/:randomkey", async (req, res) => {
  let randomKey = req.params.randomkey;
  let host = config.HOST === 'localhost' ? `${config.HOST}:${config.PORT}` : config.HOST;
  userBins[`/${randomKey}`] = randomKey;

  let binContents = await pgPersistance.getBinContents(randomKey);



  res.status(200).render('table', {requests:binContents, url: `http://${host}/r/${randomKey}`});
});

io.on('connection', (socket) => {
  // console.log('connected');
  let binKey;
  socket.on('binUrl', (url) => {
    let room = userBins[url];
    binKey = url;

    socket.join(room);
  })

  socket.on('disconnect', () => {
    // console.log('disconnected');
    delete userBins[binKey]
  })
})


app.post("/r/:randomkey", async (req, res) => {
  let headers = JSON.stringify(req.headers);
  let randomKey = req.params.randomkey;
  
  
  let randomKeyId = await pgPersistance.getRandomKeyId(randomKey);
  let newReqId = await pgPersistance.saveHookData(randomKeyId, headers, JSON.stringify(req.body));
  let hookData = await pgPersistance.getHookData(newReqId);
  
  let room = userBins[`/${randomKey}`]
  let file = __dirname + '/views/table-partial.ejs';

  ejs.renderFile(file, {request: hookData}, function(err, str){
    io.in(room).emit("message", str);
  });
  
  io.in(room).emit("animatebin");
  res.status(200).end();
});

app.post("/create", async (req, res) => {
  let randomKey = new Date().getTime().toString(16);
  await pgPersistance.createBin(randomKey);

  res.status(200).send(randomKey);
})

http.listen(config.PORT, () => {
  console.log(`Example app listening at port:${config.PORT}`);
});