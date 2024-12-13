<template>
  <div class="chat-container">
    <!-- Chat Messages -->
    <div ref="chatWindow" class="chat-window">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="['message', message.sender]"
      >
        <p v-html="message.text"/>
      </div>
    </div>

    <!-- Input Area -->
    <div class="input-area">
      <input
        v-model="inputMessage"
        @keyup.enter="sendMessage"
        type="text"
        placeholder="Type a message..."
      />
      <button @click="sendMessage">Send</button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      inputMessage: '',
      messages: [
        { text: 'Hello! How are you feeling?', sender: 'bot' },
        { text: 'Hi! I have a question.', sender: 'user' },
      ],
    };
  },
  methods: {
		...mapActions(['fetchData']),
    async sendMessage() {
      if (this.inputMessage.trim() === '') return;

      // Add user message
      this.messages.push({ text: this.inputMessage, sender: 'user' });
			
			const text = this.inputMessage;
      this.inputMessage = '';

      // Simulate bot response
			const response = await this.fetchData({ text })
			console.dir(response);
			this.messages.push({
				text: `
					sentiment: ${response.data.sentiment}<br/>
					sentimentScores<br/>
					-mixed: ${Number(response.data.sentimentScores.Mixed).toFixed(2)}<br/>
					-negative: ${Number(response.data.sentimentScores.Negative).toFixed(2)}<br/>
					-neutral: ${Number(response.data.sentimentScores.Neutral).toFixed(2)}<br/>
					-positive: ${Number(response.data.sentimentScores.Positive).toFixed(2)}
				`,
				sender: 'bot',
			})

      this.scrollToBottom(); // Scroll after user message
    },
    scrollToBottom() {
      const chatWindow = this.$refs.chatWindow;
      if (chatWindow) {
        chatWindow.scrollTop = chatWindow.scrollHeight;
      }
    },
  },
  updated() {
    this.scrollToBottom(); // Ensure scroll after DOM update
  },
};
</script>

<style lang="scss" scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100vw;
  height: 100vh;
  margin: 0 auto;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #f9f9f9;
  overflow: hidden;
}

.chat-window {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message {
  max-width: 80%;
  padding: 10px;
  border-radius: 10px;
  word-wrap: break-word;
  font-size: 14px;
	text-align: left;
}

.message.user {
  align-self: flex-end;
  background-color: #007bff;
  color: white;
}

.message.bot {
  align-self: flex-start;
  background-color: #e1e1e1;
  color: black;
}

.input-area {
  display: flex;
  padding: 10px;
  border-top: 1px solid #ccc;
  background-color: #fff;

  input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-right: 10px;
  }

  button {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;

    &:hover {
      background-color: #0056b3;
    }
  }
}
</style>
