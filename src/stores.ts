import type { State } from "./interfaces";
import { writable } from "svelte/store";
import type { Writable } from "svelte/store";

export const state: Writable<State> = writable({
    question: "Loading...",
    answers: ["..."],
    typingTimes: []
});