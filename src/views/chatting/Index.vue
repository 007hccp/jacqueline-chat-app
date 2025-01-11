<template>
  <div class="chat-container">
    <!-- Chat Messages -->
    <div ref="chatWindow" class="chat-window">
      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="['message-wrapper', message.sender]"
      >
        <!-- Avatar and Name -->
        <div class="message-header">
          <img
            :src="avatar[message.sender].image"
            alt="avatar"
            class="avatar"
          />
          <!-- <template v-if="message.sender === 'bot'">
            <img
              :src="avatar[message.sender].image"
              alt="avatar"
              class="avatar"
            />
          </template>
          <template v-else>
            <div class="user-imoji">
              😀
            </div>
          </template> -->
          <!-- <div class="avatar">
          </div> -->
          <p class="name">{{ avatar[message.sender].name }}</p>
        </div>
        <!-- Message Bubble -->
        <div :class="['message', message.sender]">
          <p v-html="message.text" />
        </div>
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
  "\u{1F972}",
  // "\u{1F607}",
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
  "/sounds/positive/1F972_Positive_mixdown.mp3"
];

const NEGATIVE_SOUND_LIST = [
  "/sounds/negative/1F62B_Positive_mixdown.mp3",
  "/sounds/negative/1F612_Positive_mixdown.mp3",
  "/sounds/negative/1F613_Negative_mixdown.mp3",
  "/sounds/negative/1F614_Positive_mixdown.mp3",
  "/sounds/negative/1F621_Negative_mixdown.mp3",
  "/sounds/negative/1F622_Negative_mixdown.mp3",
  "/sounds/negative/1F627_Negative_mixdown.mp3",
  "/sounds/negative/1F630_Negative_mixdown.mp3",
  "/sounds/negative/1F633_Negative_mixdown.mp3",
  "/sounds/negative/1F922_Negative_mixdown.mp3"
];

export default {
  data() {
    return {
      inputMessage: "",
      avatar: {
        bot: {
          name: "Listener",
          // image: "\u{1F600}"
          image: "/images/bot.jpg"
        },
        user: {
          name: "You",
          // mage: "\u{1F600}",
          image: "/images/sender.jpg"
        }
      },
      messages: [
        {
          text: "Hello! How are you feeling?",
          sender: "bot"
        }
        // {
        //   text: "Hi! I have a question.",
        //   sender: "user"
        // }
      ],
      audio: null,
      isPageVisible: true
    };
  },
  mounted() {
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
  },
  beforeUnmount() {
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
  },
  methods: {
    ...mapActions(["fetchData"]),
    handleVisibilityChange() {
      this.isPageVisible = !document.hidden; // document.hidden 값을 반대로 설정

      if (!this.isPageVisible && this.audio) {
        this.audio.pause();
      }
    },
    async sendMessage() {
      if (this.inputMessage.trim() === "") return;

      // Add user message
      this.messages.push({ text: this.inputMessage, sender: "user" });

      // this.messages.push({
      //   text: `
			// 		Your sentiment is
			// 	`,
      //   sender: "bot"
      // });
      const text = this.inputMessage;
      this.inputMessage = "";

      // Simulate bot response
      const response = await this.fetchData({ text });
      const sentiment = response.data.sentiment;
      this.showEmojis(sentiment);
      this.playAudio(sentiment);
      this.messages.push({
        text: `
					Your sentiment is ${sentiment}${this.getEmoji(sentiment)}
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
      const emojisToAdd = 10; // 한 번에 추가할 이모티콘 개수

      for (let i = 0; i < emojisToAdd; i++) {
        const emoji = document.createElement("span");
        emoji.textContent = this.getEmoji(sentiment);
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
    getEmoji(sentiment) {
      const emojiList = this.getEmojiList(sentiment);
      return emojiList[Math.floor(Math.random() * emojiList.length)];
    },
    playAudio(sentiment) {
      if (this.audio) {
        this.audio.pause();
      }

      this.audio = new Audio(this.getSound(sentiment));
      this.audio.play();
      console.dir(this.audio)
    },
    getSound(sentiment) {
      let soundList;
      switch (sentiment) {
        case SENTIMENT_TYPE.POSITIVE:
        case SENTIMENT_TYPE.MIXED:
        case SENTIMENT_TYPE.NEUTRAL:
          soundList = POSITIVE_SOUND_LIST;
          break;
        case SENTIMENT_TYPE.NEGATIVE:
          soundList = NEGATIVE_SOUND_LIST;
          break;
      }

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
  height: 100svh;
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
  gap: 20px;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  &.user {
    align-items: flex-end;
  }
}

.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  gap: 10px;

  .avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
  }

  .name {
    font-size: 12px;
    font-weight: bold;
    color: #555;
    margin-right: 4px;
  }

  .user-imoji {
    height: 26px;
    width: 26px;
    font-size: 22px;
    /* border: 2px solid; */
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.message {
  max-width: 70%;
  padding: 10px;
  border-radius: 10px;
  word-wrap: break-word;
  font-size: 14px;
  text-align: left;

  &.user {
    align-self: flex-end;
    background-color: #007bff;
    color: white;
  }

  &.bot {
    align-self: flex-start;
    background-color: #e1e1e1;
    color: black;
  }
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
