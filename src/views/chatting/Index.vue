<template>
  <div class="chat-container">
    <!-- Chat Messages -->
    <div ref="chatWindow" class="chat-window">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="['message', message.sender]"
      >
        <!-- <div v-if="message.sender === ""></div> -->
        <p v-html="message.text" />
      </div>
      <!-- <div ref="emojiContainer" class="emoji-container"></div> -->
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
import { mapActions } from "vuex";
import { gsap } from "gsap";

const SENTIMENT_TYPE = {
  NEUTRAL: "NEUTRAL",
  POSITIVE: "POSITIVE",
  NEGATIVE: "NEGATIVE",
  MIXED: "MIXED"
};

const POSITIVE_EMOJI_LIST = [
  "\u{1F604}",
  "\u{1F602}",
  // "\u{1F972}",
  "\u{1F607}",
  "\u{1F60D}",
  "\u{1F61A}",
  "\u{1F61C}",
  "\u{1F60E}",
  "\u{1F973}",
  "\u{1F920}"
];

const NEGATIVE_EMOJI_LIST = [
  "\u{1F612}",
  "\u{1F614}",
  "\u{1F62B}",
  "\u{1F622}",
  "\u{1F621}",
  "\u{1F633}",
  "\u{1F630}",
  "\u{1F613}",
  "\u{1F627}",
  "\u{1F922}"
];

const NEUTRAL_EMOJI_LIST = [
  "\u{1FAE1}",
  "\u{1FAE0}",
  "\u{1F610}",
  "\u{1F62F}",
  "\u{1F971}",
  "\u{1F921}",
  "\u{1F916}",
  "\u{1F636}",
  "\u{1F636}",
  "\u{1F62A}"
];

const MIXED_EMOJI_LIST = [
  "\u{1FAE1}",
  "\u{1FAE1}",
  "\u{1FAE1}",
  "\u{1FAE1}",
  "\u{1FAE1}",
  "\u{1FAE1}",
  "\u{1FAE1}",
  "\u{1FAE1}",
  "\u{1FAE1}",
  "\u{1FAE1}"
];

const POSITIVE_SOUND_LIST = [
  "/sounds/positive/1F60D_Positive_mixdown.mp3",
  "/sounds/positive/1F60E_Positive_mixdown.mp3",
  "/sounds/positive/1F61A_Positive_mixdown.mp3",
  "/sounds/positive/1F61C_Positive_mixdown.mp3",
  "/sounds/positive/1F602_Positive_mixdown.mp3",
  "/sounds/positive/1F604_Positive_mixdown.mp3",
  "/sounds/positive/1F607_Positive_mixdown.mp3",
  "/sounds/positive/1F972_Positive_mixdown.mp3",
]

export default {
  data() {
    return {
      inputMessage: "",
      messages: [
        { text: "Hello! How are you feeling?", sender: "bot" },
        { text: "Hi! I have aX question.", sender: "user" }
      ],
      audio: null
    };
  },
  methods: {
    ...mapActions(["fetchData"]),
    async sendMessage() {
      if (this.inputMessage.trim() === "") return;

      // Add user message
      this.messages.push({ text: this.inputMessage, sender: "user" });

      const text = this.inputMessage;
      this.inputMessage = "";

      // Simulate bot response
      const response = await this.fetchData({ text });
      this.showEmojis(response.data.sentiment);
      this.playAudio(response.data.sentiment);

      this.messages.push({
        text: `
					sentiment: ${response.data.sentiment}<br/>
					sentimentScores<br/>
					-mixed: ${Number(response.data.sentimentScores.Mixed).toFixed(2)}<br/>
					-negative: ${Number(response.data.sentimentScores.Negative).toFixed(2)}<br/>
					-neutral: ${Number(response.data.sentimentScores.Neutral).toFixed(2)}<br/>
					-positive: ${Number(response.data.sentimentScores.Positive).toFixed(2)}
				`,
        sender: "bot"
      });

      this.scrollToBottom(); // Scroll after user message
    },
    scrollToBottom() {
      const chatWindow = this.$refs.chatWindow;
      if (chatWindow) {
        chatWindow.scrollTop = chatWindow.scrollHeight;
      }
    },
    showEmojis(sentiment) {
      const emojiList = this.getEmojiList(sentiment);
      const emojisToAdd = 10; // 한 번에 추가할 이모티콘 개수

      for (let i = 0; i < emojisToAdd; i++) {
        const emoji = document.createElement("span");
        emoji.textContent =
          emojiList[Math.floor(Math.random() * emojiList.length)];
        emoji.style.position = "absolute";
        emoji.style.left = `${Math.random() * 100}%`;
        emoji.style.bottom = "0";

        // 랜덤 크기 설정
        const randomSize = Math.random() * 5 + 1; // 크기를 1rem ~ 3rem로 설정
        emoji.style.fontSize = `${randomSize}rem`;
        emoji.style.zIndex = "999";

        this.$refs.chatWindow.appendChild(emoji);

        // GSAP 애니메이션FF
        gsap.to(emoji, {
          // y: -400,
          y: -window.innerHeight - 150,
          opacity: 0,
          duration: 3,
          onComplete: () => emoji.remove(),
          delay: Math.random() * 0.5 // 애니메이션 시작 지연 시간 (랜덤)
        });
      }
    },
    getEmojiList(sentiment) {
      switch (sentiment) {
        case SENTIMENT_TYPE.MIXED:
          return MIXED_EMOJI_LIST;
        case SENTIMENT_TYPE.NEGATIVE:
          return NEGATIVE_EMOJI_LIST;
        case SENTIMENT_TYPE.NEUTRAL:
          return NEUTRAL_EMOJI_LIST;
        case SENTIMENT_TYPE.POSITIVE:
          return POSITIVE_EMOJI_LIST;
        default:
          return ["🎉", "❤️", "😂", "👍", "✨", "🥳"];
      }
    },
    playAudio(/*sentiment*/) {
      this.audio = new Audio(this.getSound());
      this.audio.play();
    },
    getSound(/*sentiment*/) {
      const soundList = POSITIVE_SOUND_LIST;
      // TODO: switch

      return soundList[Math.floor(Math.random() * soundList.length)];
    }
  },
  updated() {
    this.scrollToBottom(); // Ensure scroll after DOM update
  }
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

.emoji-container {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  background-color: #f0f0f0;
}
</style>
