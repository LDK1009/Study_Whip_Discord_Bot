// 이 파일은 공부 채널의 ready 이벤트를 처리하는 모듈입니다.

const cron = require("node-cron");
const { sendRandomQuote } = require("./quotes");

// 이 함수는 공부 채널의 ready 이벤트를 처리합니다.
function handle(client, channelId, timezone = "Asia/Seoul") {
  // 이 반복문은 매일 8시부터 22시까지 1시간 간격으로 명언을 전송하도록 스케줄링합니다.
  for (let hour = 8; hour <= 22; hour++) {
    cron.schedule(
      `0 ${hour} * * *`,
      () => {
        sendRandomQuote(client, channelId);
      },
      {
        timezone: timezone,
      },
    );
  }

  console.log(`크론 스케줄러가 8시부터 22시까지 1시간 간격으로 채널(${channelId})에 명언을 전송하도록 설정되었습니다.`);
}

module.exports = {
  handle,
};
