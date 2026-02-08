// 이 파일은 공부 채널의 명언 관련 유틸리티 함수를 관리하는 모듈입니다.

// 이 배열은 봇이 랜덤으로 선택해 보낼 100개의 실제 인물들의 동기부여 명언을 보관합니다.
const QUOTES = [
  { quote: "성공한 사람이 되려고 노력하기보다 가치 있는 사람이 되려고 노력하라.", author: "Albert Einstein" },
  { quote: "미래는 당신이 오늘 무엇을 하느냐에 달려있다.", author: "Mahatma Gandhi" },
  { quote: "성공은 준비된 자에게 찾아오는 기회다.", author: "Louis Pasteur" },
  { quote: "실패는 성공의 어머니다.", author: "Thomas Edison" },
  {
    quote: "인생에서 가장 큰 영광은 넘어지지 않는 것이 아니라 넘어질 때마다 일어서는 것이다.",
    author: "Nelson Mandela",
  },
  { quote: "당신이 할 수 있다고 믿든 할 수 없다고 믿든, 당신이 옳다.", author: "Henry Ford" },
  { quote: "성공은 최종 목적지가 아니라 여정이다.", author: "Arthur Ashe" },
  { quote: "위대한 일들은 작은 일들을 꾸준히 해나가는 데서 이루어진다.", author: "Vincent van Gogh" },
  { quote: "성공의 비밀은 시작하는 것이다.", author: "Mark Twain" },
  { quote: "당신의 시간은 한정되어 있다. 다른 사람의 인생을 살면서 낭비하지 마라.", author: "Steve Jobs" },
  { quote: "나는 실패한 게 아니다. 단지 1만 가지 효과가 없는 방법을 찾았을 뿐이다.", author: "Thomas Edison" },
  { quote: "성공하려면 실패할 용기가 있어야 한다.", author: "Sylvester Stallone" },
  { quote: "꿈을 포기하지 마라. 꿈이 없으면 살아갈 이유도 없다.", author: "Martin Luther King Jr." },
  { quote: "인생은 자전거를 타는 것과 같다. 균형을 잡으려면 움직여야 한다.", author: "Albert Einstein" },
  { quote: "행동하지 않으면 아무 일도 일어나지 않는다.", author: "Mahatma Gandhi" },
  { quote: "성공의 열쇠는 실패를 두려워하지 않는 것이다.", author: "Bill Gates" },
  { quote: "당신이 원하는 것을 얻지 못한다면, 그 이유는 당신이 충분히 원하지 않기 때문이다.", author: "Oprah Winfrey" },
  { quote: "성공은 1%의 영감과 99%의 땀으로 이루어진다.", author: "Thomas Edison" },
  { quote: "포기하지 않는 한, 당신은 실패한 게 아니다.", author: "Napoleon Hill" },
  { quote: "인내는 쓰지만 그 열매는 달다.", author: "Aristotle" },
  { quote: "모든 위대한 성취는 처음에는 불가능해 보였다.", author: "Nelson Mandela" },
  { quote: "성공의 비결은 실패를 두려워하지 않는 것이다.", author: "Bill Gates" },
  { quote: "당신이 원하는 것을 얻지 못한다면, 그 이유는 당신이 충분히 원하지 않기 때문이다.", author: "Oprah Winfrey" },
  { quote: "성공은 1%의 영감과 99%의 땀으로 이루어진다.", author: "Thomas Edison" },
  { quote: "포기하지 않는 한, 당신은 실패한 게 아니다.", author: "Napoleon Hill" },
];

// 이 함수는 지정된 채널에 랜덤 명언을 선택해 전송하는 역할을 합니다.
async function sendRandomQuote(client, channelId) {
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      console.error("채널을 찾을 수 없습니다. CHANNEL_ID를 확인하세요.");
      return;
    }

    // 이 부분은 QUOTES 배열에서 임의의 명언 하나를 뽑아서 메시지로 전송합니다.
    const randomIndex = Math.floor(Math.random() * QUOTES.length);
    const quote = QUOTES[randomIndex];
    await channel.send(`━━━━━━━━━━━━━━━━━━━━\n\n## *"${quote.quote}"*\n\n₰ ${quote.author}\n\n━━━━━━━━━━━━━━━━━━━━`);
  } catch (error) {
    console.error("명언 전송 중 오류 발생:", error);
  }
}

module.exports = {
  sendRandomQuote,
};
