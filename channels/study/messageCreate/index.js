// 이 파일은 공부 채널의 messageCreate 이벤트를 처리하는 모듈입니다.
// 공부 채널은 명언 발송 기능만 제공하므로 메시지 처리가 필요 없습니다.

// 이 함수는 공부 채널의 messageCreate 이벤트를 처리합니다.
async function handle(message) {
  // 공부 채널은 명언 발송만 제공하므로 메시지 처리 없음
  return null;
}

module.exports = {
  handle,
};
