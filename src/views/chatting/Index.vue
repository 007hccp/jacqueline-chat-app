<template>
  <div class="chat-container">
    <!-- Chat Messages -->
    <div ref="chatWindow" class="chat-window" :class="{'chat-window--result': isDataReady}">
      <template v-if="isDataReady">
        <SentimentResultCard :cardsData="cards" />
      </template>
      <template v-else>
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
            <p class="name">{{ avatar[message.sender].name }}</p>
          </div>
          <!-- Message Bubble -->
          <div :class="['message', message.sender]">
            <p v-html="message.text" />
          </div>
        </div>
      </template>
    </div>

    <!-- Input Area -->
    <div class="input-area">
      <input
        v-model="inputMessage"
        @keyup.enter="sendMessage"
        type="text"
        placeholder="Type a message..."
      />
      <template v-if="isReachedGoal">
        <button @click="resetApp">Reset</button>
      </template>
      <template v-else>
        <button @click="sendMessage">Send</button>
      </template>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import { gsap } from "gsap";
import SentimentResultCard from "./components/SentimentResultCard.vue";

const SENTIMENT_TYPE = {
  NEUTRAL: "NEUTRAL",
  POSITIVE: "POSITIVE",
  NEGATIVE: "NEGATIVE",
  MIXED: "MIXED"
};

const POSITIVE_EMOJI_LIST = [
  "😄",
  "😂",
  "🤣", //임시
  "😇",
  "😍",
  "😚",
  "😜",
  "😎",
  "🥳",
  "🤠"
];

const NEGATIVE_EMOJI_LIST = [
  "😒",
  "😔",
  "😫",
  "😢",
  "😡",
  "😳",
  "😰",
  "😓",
  "😧",
  "🤢"
];

const NEUTRAL_EMOJI_LIST = [
  "🤨",
  "🙄",
  "😐",
  "😯",
  "🥱",
  "🤡",
  "🤖",
  "😶",
  "😶",
  "😪"
];

const MIXED_EMOJI_LIST = [
  "😜",
  "😜",
  "😜",
  "😜",
  "😜",
  "😜",
  "😜",
  "😜",
  "😜",
  "😜"
];

const POSITIVE_SOUND_LIST = [
  {
    file: "/sounds/positive/1F604_Positive_mixdown.mp3",
    delay: 1200
  },
  {
    file: "/sounds/positive/1F602_Positive_mixdown.mp3",
    delay: 2000
  },
  {
    file: "/sounds/positive/1F972_Positive_mixdown_01.mp3",
    delay: 3000
  },
  {
    file: "/sounds/positive/1F607_Positive_mixdown_01.mp3",
    delay: 1500
  },
  {
    file: "/sounds/positive/1F60D_Positive_mixdown.mp3",
    delay: 2100
  },
  {
    file: "/sounds/positive/1F61A_Positive_mixdown_01.mp3",
    delay: 1600
  },
  {
    file: "/sounds/positive/1F61C_Positive_mixdown.mp3",
    delay: 1200
  },
  {
    file: "/sounds/positive/1F60E_Positive_mixdown.mp3",
    delay: 2200
  },
  {
    file: "/sounds/positive/1F973_Positive_mixdown.mp3",
    delay: 2000
  },
  {
    file: "/sounds/positive/1F920_Positive_mixdown_01.mp3",
    delay: 1600
  }
];

const NEGATIVE_SOUND_LIST = [
  {
    file: "/sounds/negative/1F612_Positive_mixdown_01.mp3",
    delay: 1400
  },
  {
    file: "/sounds/negative/1F614_Positive_mixdown_01.mp3",
    delay: 1600
  },
  {
    file: "/sounds/negative/1F62B_Positive_mixdown_01.mp3",
    delay: 1600
  },
  {
    file: "/sounds/negative/1F622_Negative_mixdown_01.mp3",
    delay: 1300
  },
  {
    file: "/sounds/negative/1F621_Negative_mixdown_01.mp3",
    delay: 1600
  },
  {
    file: "/sounds/negative/1F633_Negative_mixdown_01.mp3",
    delay: 1500
  },
  {
    file: "/sounds/negative/1F630_Negative_mixdown_01.mp3",
    delay: 1200
  },
  {
    file: "/sounds/negative/1F613_Negative_mixdown.mp3",
    delay: 2000
  },
  {
    file: "/sounds/negative/1F627_Negative_mixdown_01.mp3",
    delay: 1600
  },
  {
    file: "/sounds/negative/1F922_Negative_mixdown_01.mp3",
    delay: 1600
  }
];

const GOAL_ANSWER_COUNT = 9;

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
      audio: null,
      isPageVisible: true,
      isWating: false,
      messages: [],
      answers: [],
      emoji: {},
      sound: {},
      cards: [],
      loopHandler: null
    };
  },
  async mounted() {
    for (const audioInfo of POSITIVE_SOUND_LIST) {
      const audio = new Audio(audioInfo.file);
      audio.preload = "auto";
      audio.load();
    }

    for (const audioInfo of NEGATIVE_SOUND_LIST) {
      const audio = new Audio(audioInfo.file);
      audio.preload = "auto";
      audio.load();
    }

    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    this.resetEmoji();
    this.resetSound();
    this.resetMessages();
  },
  beforeUnmount() {
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
  },
  components: {
    SentimentResultCard
  },
  computed: {
    isReachedGoal() {
      if (!this.answers) return false;
      return this.answers.length === GOAL_ANSWER_COUNT;
    },
    isDataReady() {
      if (!this.cards) return false;
      return this.cards.length === GOAL_ANSWER_COUNT;
    }
  },
  watch: {
    isReachedGoal(newValue) {
      if (!newValue) return;

      setTimeout(() => {
        for (const answer of this.answers) {
          this.cards.push({
            sentiment: answer.sentiment,
            emoji: this.getEmojiAndRemove(answer.sentiment)
          });
        }

        this.playAllAnswerAudio();
      }, 3000);
    }
  },
  methods: {
    ...mapActions(["fetchData"]),
    testFunc() {
      this.flipped = !this.flipped;
    },
    resetMessages() {
      this.messages = [
        {
          text: "Hello! How are you feeling?",
          sender: "bot"
        }
      ];
    },
    saveAnswer(question, answers, sentiment, audio) {
      this.answers.push({
        question,
        answers,
        sentiment,
        audio
      });
    },
    getPreviusAnswer() {
      const length = this.answers.length;
      if (length === 0) return null;

      return this.answers[length - 1].answers;
    },
    handleVisibilityChange() {
      this.isPageVisible = !document.hidden; // document.hidden 값을 반대로 설정

      if (!this.isPageVisible && this.audio) {
        this.audio.pause();
      }

      if (!this.isPageVisible && this.loopHandler) {
        clearTimeout(this.loopHandler);
        this.loopHandler = null;
      }
    },
    async resetApp() {
      if (!this.isReachedGoal || !this.isDataReady) return;

      this.resetMessages();
      this.resetEmoji();
      this.resetSound();
      this.answers = [];
      this.cards = [];
      if (this.audio) {
        this.audio.pause();
      }

      if (this.loopHandler) {
        clearTimeout(this.loopHandler);
        this.loopHandler = null;
      }
    },
    async resetEmoji() {
      this.emoji = {
        NEUTRAL: JSON.parse(JSON.stringify(NEUTRAL_EMOJI_LIST)),
        POSITIVE: JSON.parse(JSON.stringify(POSITIVE_EMOJI_LIST)),
        NEGATIVE: JSON.parse(JSON.stringify(NEGATIVE_EMOJI_LIST)),
        MIXED: JSON.parse(JSON.stringify(MIXED_EMOJI_LIST))
      };
    },
    async resetSound() {
      this.sound = {
        POSITIVE: JSON.parse(JSON.stringify(POSITIVE_SOUND_LIST)),
        NEGATIVE: JSON.parse(JSON.stringify(NEGATIVE_SOUND_LIST)),
      };
    },
    async sendMessage() {
      try {
        if (this.inputMessage.trim() === "" || this.isWating || this.isReachedGoal) return;
        this.isWating = true;

        // Add user message
        this.messages.push({ text: this.inputMessage, sender: "user" });
        const text = this.inputMessage;
        this.inputMessage = "";

        // Simulate bot response
        const response = await this.fetchData({
          text,
          previus: this.getPreviusAnswer()
        });

        const sentiment = response.data.sentiment === SENTIMENT_TYPE.MIXED ? SENTIMENT_TYPE.NEUTRAL : response.data.sentiment;
        this.showEmojis(sentiment);
        const audio = await this.playAudio(sentiment);

        this.saveAnswer(
          this.messages[this.messages.length - 1].text,
          text,
          sentiment,
          audio
        );

        this.messages.push({
          // text: `Your sentiment is ${sentiment}${this.getEmoji(sentiment)}`,
          text: this.answers.length == GOAL_ANSWER_COUNT ? 'The mirror of the emotions read by the emoji are loading...' : response.data.question,
          sender: "bot"
        });

        this.scrollToBottom(); // Scroll after user message
      } finally {
        this.isWating = false;
      }
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
      return this.emoji[sentiment];
    },
    getEmoji(sentiment) {
      const emojiList = this.getEmojiList(sentiment);
      return emojiList[Math.floor(Math.random() * emojiList.length)];
    },
    getEmojiAndRemove(sentiment) {
      const emojiList = this.getEmojiList(sentiment);
      const index = Math.floor(Math.random() * emojiList.length);
      const result = emojiList[index];
      emojiList.splice(index, 1);
      return result;
    },
    async playAudio(sentiment) {
      if (this.audio) {
        this.audio.pause();
      }

      /*
      const audioFile = this.getSound(sentiment);
      this.audio = new Audio(audioFile);
      this.audio.play();
      */
      const audioInfo = this.getSound(sentiment);
      this.audio = new Audio(audioInfo.file);
      this.audio.preload = "auto";
      await this.audio.load();
      this.audio.play();
      // this.audio.preload = "auto";
      // this.audio.addEventListener("loadeddata", () => {
      //   console.log('Audio fully loaded and can play through without buffering');
      //   this.audio.play();
      // });

      return audioInfo;
    },
    getSound(sentiment) {
      let soundList;
      switch (sentiment) {
        case SENTIMENT_TYPE.POSITIVE:
        case SENTIMENT_TYPE.MIXED:
        case SENTIMENT_TYPE.NEUTRAL:
          soundList = this.sound[SENTIMENT_TYPE.POSITIVE]; // POSITIVE_SOUND_LIST;
          break;
        case SENTIMENT_TYPE.NEGATIVE:
          soundList = this.sound[SENTIMENT_TYPE.NEGATIVE];
          break;
      }

      const index = Math.floor(Math.random() * soundList.length);
      const result = soundList[index];
      soundList.splice(index, 1);

      return result;
    },
    playAllAnswerAudio() {
      if (this.audio) {
        this.audio.pause();
      }

      this.loopWithVariableDelays(this.answers);

      // let index = 0;
      // setImmediate(() => {
      //   console.log(`${delays[index] / 1000}초 후 실행`);
      //   index = (index + 1) % delays.length; // 간격 순환
      // }, delays[index]);

      /*
      this.audio = new Audio(this.answers[index].audio);
      this.audio.play();
      console.log('첫 음악 재생');

      this.audio.addEventListener("ended", () => {
        if (!this.isDataReady) return;

        index++;
        if (index >= this.answers.length) index = 0;

        console.log(`${index}번째 음악 재생`);

        this.audio.src = this.answers[index].audio;
        this.audio.play();
      });
      */
    },
    async loopWithVariableDelays(answers) {
      let index = 0;

      const next = async () => {
        if (this.audio) {
          this.audio.pause();
        }

        this.audio = new Audio(answers[index].audio.file);
        this.audio.preload = "auto";
        await this.audio.load();
        this.audio.play();

        let delay = answers[index].audio.delay;

        console.log(`${delay / 1000}초 후 다음 파일 실행`);
        index = (index + 1) % answers.length; // 간격 순환
        this.loopHandler = setTimeout(next, delay);
      };

      await next(); // 첫 번째 실행
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

  @media (min-width: 1024px) {
    // .chat-container {
    width: 390px;
    height: 80%;
    margin: 0;
    margin-right: 96px;
    // }
  }
}

.chat-window {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;

  &--result {
    // padding-top: 30%;
    // padding-bottom: 30%;
    justify-content: center;
  }
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
