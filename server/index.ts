import { createServer as createHttpsServer } from "https";
import { createServer as createHttpServer } from "http";
import * as path from "path";
import * as fs from "fs";

import { Server, Socket } from "socket.io";
import type { State } from "./interfaces";

class ServerState implements State {
    question = "What do you think?";
    answers = [];
    typingTimes = [];
}

const state = new ServerState();

const HTTPS = path.resolve("").includes("/var/www");
const httpServer = HTTPS
    ? createHttpsServer({
        key: fs.readFileSync("privkey.pem"),
        cert: fs.readFileSync("cert.pem"),
    })
    : createHttpServer();

const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5000", "https://buonanno.tech"],
        methods: ["GET", "POST"],
    },
});

function saveState(fname: string) {
    fs.writeFileSync(fname, JSON.stringify(state));
}

let log_num = 0;
function updateState() {
    console.log(state);
    io.emit("update state", state);
    saveState(log_num + ".log.json");
    log_num = (log_num + 1) % 20;
}

io.on("connection", (socket: Socket) => {
    console.log("A user connected");
    let myUserNumber = state.typingTimes.length;
    state.typingTimes.push(0);

    socket.on("add answer", (answer: string) => {
        console.log("answer", answer);
        if (!state.answers.includes(answer))
            state.answers.push(answer);
        socket.emit("ok");
        updateState();
        state.typingTimes[myUserNumber] = -1;
    });
    socket.on("am typing", () => {
        if (state.typingTimes[myUserNumber] >= 0)
            state.typingTimes[myUserNumber] = Date.now();
        updateState();
    });

    socket.emit("update state", state);
});

httpServer.listen(8000, () => {
    console.log("Listening on *:8000");
});
