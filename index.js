// 이 파일은 디스코드 봇을 실행하고, 매일 정해진 시간에 동기부여 명언을 특정 채널에 보내는 메인 엔트리입니다.

require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const cron = require("node-cron");

// 이 객체는 디스코드 클라이언트를 생성하고, 봇이 서버의 메시지를 보낼 수 있도록 필요한 인텐트를 설정합니다.
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // 길드(서버) 관련 이벤트 접근
    GatewayIntentBits.GuildMessages, // 길드 내 메시지 전송/수신
  ],
});

// 이 상수는 .env 파일에서 읽어온 봇 토큰과 채널 ID, 타임존 설정을 보관합니다.
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID;
const TIMEZONE = process.env.TIMEZONE || "Asia/Seoul";

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
];

// 이 함수는 지정된 채널에 랜덤 명언을 선택해 전송하는 역할을 합니다.
async function sendRandomQuote(channelId) {
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

// 이 이벤트 핸들러는 봇이 준비(로그인 완료)되었을 때 한 번 실행되며, 스케줄러를 설정합니다.
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  if (!TARGET_CHANNEL_ID) {
    console.error("TARGET_CHANNEL_ID가 설정되지 않았습니다. .env 파일을 확인하세요.");
    return;
  }

  //////////////// 테스트용 코드
  // 이 코드는 테스트를 위해 3초마다 명언을 전송하도록 설정합니다.
  setInterval(() => {
    sendRandomQuote(TARGET_CHANNEL_ID);
  }, 3000);
  //////////////// 테스트용 코드 끝 ////////////////

  // 이 크론 작업은 매일 오전 8시에 명언을 전송하도록 스케줄링합니다.
  cron.schedule(
    "0 8 * * *",
    () => {
      sendRandomQuote(TARGET_CHANNEL_ID);
    },
    {
      timezone: TIMEZONE,
    },
  );

  // 이 크론 작업은 매일 낮 12시에 명언을 전송하도록 스케줄링합니다.
  cron.schedule(
    "0 12 * * *",
    () => {
      sendRandomQuote(TARGET_CHANNEL_ID);
    },
    {
      timezone: TIMEZONE,
    },
  );

  // 이 크론 작업은 매일 오후 6시에 명언을 전송하도록 스케줄링합니다.
  cron.schedule(
    "0 18 * * *",
    () => {
      sendRandomQuote(TARGET_CHANNEL_ID);
    },
    {
      timezone: TIMEZONE,
    },
  );

  console.log("크론 스케줄러가 8시 / 12시 / 18시에 실행되도록 설정되었습니다.");
});

// 이 구문은 DISCORD_TOKEN을 사용해 디스코드에 로그인하여 봇을 온라인 상태로 만듭니다.
client.login(DISCORD_TOKEN);
