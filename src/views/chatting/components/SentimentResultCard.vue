<template>
  <div>
    <!-- 문구 추가 -->
    <div class="grid-header">
      <p>Your emotion sound-emoji is ready.</p>
    </div>
    <div class="grid-container">
      <div
        v-for="(card, index) in cards"
        :key="index"
        class="card-container"
      >
        <div class="card" :class="{ flipped: card.isFlipped }">
          <div class="card-front">
            <!-- <img :src="'/images/bot.jpg'" class="card-front-image" /> -->
          </div>
          <div class="card-back">
            <div>
              <div class="card-back-emoji">
                {{ card.emoji }}
              </div>
              <div>
                {{ card.sentiment }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    // startFlipping: {
    //   type: Boolean,
    //   required: true, // 부모로부터 시작 신호
    // },
    cardsData: {
      type: Array,
      required: true, // 부모로부터 카드 데이터 배열
    },
  },
  data() {
    return {
      cards: this.cardsData.map((card) => ({
        ...card,
        isFlipped: false, // 모든 카드의 초기 상태는 뒤집히지 않음
      })),
    };
  },
  watch: {
    cardsData(newVal) {
      if (newVal) {
        this.flipCards(); // 시작 신호를 받으면 플립 시작
      }
    },
  },
  mounted() {
    this.flipCards();
  },
  methods: {
    flipCards() {
      let index = 0;
      const flipInterval = setInterval(() => {
        if (index < this.cards.length) {
          this.cards[index].isFlipped = true; // 카드 뒤집기
          index++;
        } else {
          clearInterval(flipInterval); // 모든 카드가 뒤집히면 종료
        }
      }, 200); // 각 카드가 1초 간격으로 뒤집힘
    },
  },
};
</script>

<style scoped>
/* 전체 그리드 컨테이너 */
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3개의 열 */
  gap: 20px; /* 카드 간격 */
  max-width: 800px; /* 최대 너비 */
  margin: 0 auto; /* 가운데 정렬 */
  height: 100%;
  width: calc(100% - 60px);
  padding-left: 20px;
  padding-right: 20px;
  max-height: 310px;
  grid-template-rows: repeat(3, minmax(30px, 90px));
  /* padding-top: 30svh;
  padding-bottom: 30svh; */
}

/* 카드 컨테이너 */
.card-container {
  perspective: 1000px; /* 3D 효과 */
  width: 100%;
  /* height: 0; */
  padding-bottom: 100%; /* 정사각형 비율 유지 */
  position: relative;
}

/* 카드 */
.card {
  position: absolute;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s; /* 부드러운 회전 */
  max-height: 98px;
}

/* 카드 앞면, 뒷면 */
.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  /* flex-direction: column; */
  font-size: 12px;
  font-weight: bold;
  color: white;
  border: 1px solid #ddd;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  /* padding: 16px; */
}

.card-back-emoji {
  margin-bottom: 12px;
  font-size: 32px;
}

/* 카드 앞면 */
.card-front {
  background-color: #3498db;
  border-radius: 4px;
}

/* 카드 뒷면 */
.card-back {
  background-color: black;
  transform: rotateY(180deg);
  border-radius: 4px;
}

/* 뒤집힌 카드 */
.card.flipped {
  transform: rotateY(180deg);
}

.grid-header {
  text-align: center;
  margin-bottom: 20px;
}

.grid-header h2 {
  font-size: 24px;
  margin: 0;
  color: #333;
}

.grid-header p {
  font-size: 16px;
  color: #666;
  margin: 5px 0 0;
}
</style>
