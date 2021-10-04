<script lang="ts">
	import { fly } from "svelte/transition";
	import { state } from "./stores";
	import { socket } from "./websocket";
	let answerSent: boolean = false;
	let myAnswer: string = "";
	async function sendAnswer(event: Event) {
		event.preventDefault();
		if (myAnswer.length < 3) {
			return;
		}
		myAnswer = myAnswer.trim();
		try {
			await socket.addAnswer(myAnswer);
			answerSent = true;
		} catch {
			answerSent = false;
		}
	}

	function signalTyping() {
		socket.signalTyping();
	}

	let numberTyping = 0;
	function updateNumberTyping(): void {
		numberTyping = $state.typingTimes.filter(
			(n) => Date.now() - n < 3000
		).length;
	}
	state.subscribe(updateNumberTyping);
	setInterval(updateNumberTyping, 200);
</script>

<main>
	<h1 class="has-text-centered">
		{$state.question}
	</h1>
	{#if numberTyping == 1}
		<p>Someone is typing...</p>
	{:else if numberTyping > 1 && numberTyping < 6}
		<p>
			{["Two", "Three", "Four", "Five"][numberTyping - 2]} people are typing...
		</p>
	{:else if numberTyping > 6}
		<p>Many people are typing...</p>
	{/if}
	{#if !answerSent}
		<fieldset class="form-group">
			<textarea
				class="has-text-centered"
				name=""
				id=""
				rows="3"
				placeholder="Your answer..."
				bind:value={myAnswer}
				on:keypress={(event) => {
					signalTyping();
					if (event.code == "Enter") sendAnswer(event);
				}}
			/>
			{#if myAnswer.length >= 3}
				<label for="paperSwitch1" class="paper-switch-tile">
					<input
						id="paperSwitch1"
						name="paperSwitch1"
						type="checkbox"
						on:change={sendAnswer}
					/>
					<div class="paper-switch-tile-card border">
						<div class="paper-switch-tile-card-front border">
							Send
						</div>
						<div
							class="paper-switch-tile-card-back border background-success"
						>
							Sent!
						</div>
					</div>
				</label>
			{/if}
		</fieldset>
	{/if}
	{#each $state.answers as answer (answer)}
		<div class="card" in:fly={{ y: 500 }}>
			<p class="card-text">
				{answer}
			</p>
		</div>
	{/each}
</main>

<style>
	main {
		margin: auto;
		width: min(90vw, 600px);
	}
	textarea {
		margin: auto;
		margin-top: 2em;
		margin-bottom: 0.5em;
		width: 100%;
	}
	.paper-switch-tile {
		display: block;
		margin: 40px 0 -40px 50%;
		width: 50%;
	}
	.card-text {
		margin: 0;
		padding: 0.5em;
		text-align: center;
	}
	.card {
		margin-bottom: 1em;
	}
</style>
