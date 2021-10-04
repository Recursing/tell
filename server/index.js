"use strict";
exports.__esModule = true;
var https_1 = require("https");
var http_1 = require("http");
var path = require("path");
var fs = require("fs");
var socket_io_1 = require("socket.io");
var ServerState = /** @class */ (function () {
    function ServerState() {
        this.question = "What do you think?";
        this.answers = [];
        this.typingTimes = [];
    }
    return ServerState;
}());
var state = new ServerState();
var HTTPS = path.resolve("").includes("/var/www");
var httpServer = HTTPS
    ? https_1.createServer({
        key: fs.readFileSync("privkey.pem"),
        cert: fs.readFileSync("cert.pem")
    })
    : http_1.createServer();
var io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: ["http://localhost:5000", "https://buonanno.tech"],
        methods: ["GET", "POST"]
    }
});
function saveState(fname) {
    fs.writeFileSync(fname, JSON.stringify(state));
}
var log_num = 0;
function updateState() {
    console.log(state);
    io.emit("update state", state);
    saveState(log_num + ".log.json");
    log_num = (log_num + 1) % 20;
}
io.on("connection", function (socket) {
    console.log("A user connected");
    var myUserNumber = state.typingTimes.length;
    state.typingTimes.push(0);
    socket.on("add answer", function (answer) {
        console.log("answer", answer);
        if (!state.answers.includes(answer))
            state.answers.push(answer);
        socket.emit("ok");
        updateState();
        state.typingTimes[myUserNumber] = -1;
    });
    socket.on("am typing", function () {
        if (state.typingTimes[myUserNumber] >= 0)
            state.typingTimes[myUserNumber] = Date.now();
        updateState();
    });
    socket.on("update question", function (question) {
        console.log("new question", question);
        state.question = question;
        socket.emit("ok");
        updateState();
    });
    socket.emit("update state", state);
});
httpServer.listen(8000, function () {
    console.log("Listening on *:8000");
});
