import io from "socket.io-client";
import type { Socket } from "socket.io-client";
import type { State } from "./interfaces";
import { state } from "./stores";

class MySocket {
    private socket: Socket;
    constructor() {
        const protocol = document.location.hostname === "localhost" ? "ws" : "wss";
        this.socket = io(`${protocol}://${document.location.hostname}:8000`);
        this.socket.on("update state", (new_state: State) => {
            console.log(new_state);
            state.set(new_state);
        });
    }

    async updateQuestion(question: string) {
        this.socket.emit("update question", question);
        return new Promise((resolve, reject) => {
            this.socket.on("ok", resolve);
            this.socket.on("error", reject);
        });
    }

    async addAnswer(answer: string) {
        console.log("Sending answer: " + answer);
        this.socket.emit("add answer", answer);
        return new Promise((resolve, reject) => {
            this.socket.on("ok", resolve);
            this.socket.on("error", reject);
        });
    }

    #lastTime = 0;
    #timeoutHandle: NodeJS.Timeout | null = null;
    #DELAY = 500;
    signalTyping() {
        if (this.#timeoutHandle != null) {
            clearTimeout(this.#timeoutHandle);
        }
        this.#timeoutHandle = setTimeout(
            () => {
                this.socket.emit("am typing");
                this.#lastTime = Date.now();
            },
            Math.max(0, this.#DELAY - (Date.now() - this.#lastTime)));
    }
}

export const socket = new MySocket();
