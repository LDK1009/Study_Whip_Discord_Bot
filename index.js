// 이 파일은 디스코드 봇을 실행하고, 매일 정해진 시간에 동기부여 명언을 특정 채널에 보내는 메인 엔트리입니다.

require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

// 이 상수는 .env 파일에서 읽어온 봇 토큰과 채널 ID, 타임존 설정을 보관합니다.
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const TIMEZONE = process.env.TIMEZONE || "Asia/Seoul";

// 이 배열은 각 채널별 정보와 이벤트 핸들러를 정의합니다.
const CHANNELS = [
  {
    name: "ATTENDANCE",
    id: "1468590975814205463",
    messageCreate: require("./channels/attendance/messageCreate"),
    ready: null,
    messageUpdate: null,
    messageDelete: null,
    // 기타 Discord.js 클라이언트 이벤트 핸들러들
  },
  {
    name: "RECORD",
    id: "1468595070700879935",
    messageCreate: require("./channels/record/messageCreate"),
    ready: null,
    messageUpdate: null,
    messageDelete: null,
  },
  {
    name: "CHAT",
    id: "1468896957622911035",
    messageCreate: require("./channels/chat/messageCreate"),
    ready: null,
    messageUpdate: null,
    messageDelete: null,
  },
  {
    name: "STUDY",
    id: "1468590975814205464",
    messageCreate: require("./channels/study/messageCreate"),
    ready: require("./channels/study/ready"),
    messageUpdate: null,
    messageDelete: null,
  },
  {
    name: "REST",
    id: "1468591707439370333",
    messageCreate: require("./channels/rest/messageCreate"),
    ready: null,
    messageUpdate: null,
    messageDelete: null,
  },
];

// 이 객체는 디스코드 클라이언트를 생성하고, 봇이 서버의 메시지를 보낼 수 있도록 필요한 인텐트를 설정합니다.
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, // 길드(서버) 관련 이벤트 접근
    GatewayIntentBits.GuildMessages, // 길드 내 메시지 전송/수신
    GatewayIntentBits.MessageContent, // 메시지 내용 읽기 권한
  ],
});

// 이 함수는 채널 ID로 채널 정보를 찾습니다.
function findChannelById(channelId) {
  return CHANNELS.find((channel) => channel.id === channelId);
}

// 이 이벤트 핸들러는 메시지가 생성될 때마다 실행됩니다.
client.on("messageCreate", async (message) => {
  // 봇 메시지는 무시
  if (message.author.bot) return;

  const channelId = message.channel.id;
  const channel = findChannelById(channelId);

  // 채널이 없거나 messageCreate 핸들러가 없으면 처리하지 않음
  if (!channel || !channel.messageCreate) {
    return;
  }

  // 해당 채널의 messageCreate 핸들러 실행
  const response = await channel.messageCreate.handle(message);

  // 응답이 있으면 메시지 전송
  if (response) {
    await message.channel.send(response);
  }
});

// 이 이벤트 핸들러는 봇이 준비(로그인 완료)되었을 때 한 번 실행되며, 스케줄러를 설정합니다.
client.once("clientReady", () => {
  // 각 채널의 ready 이벤트 핸들러 실행
  CHANNELS.forEach((channel) => {
    if (channel.ready) {
      channel.ready.handle(client, channel.id, TIMEZONE);
    }
  });
});

// 이 구문은 DISCORD_TOKEN을 사용해 디스코드에 로그인하여 봇을 온라인 상태로 만듭니다.
if (!DISCORD_TOKEN) {
  console.error("❌ DISCORD_TOKEN이 설정되지 않았습니다. Railway 환경 변수를 확인하세요.");
  process.exit(1);
}

client.login(DISCORD_TOKEN);
