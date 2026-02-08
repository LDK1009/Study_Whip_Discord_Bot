// 이 파일은 잡담 채널의 messageCreate 이벤트를 처리하는 모듈입니다.

const enhanceMode = require("./enhance");
const rpsMode = require("./rps");

// 이 변수는 현재 채널의 활성화된 모드를 저장합니다.
let currentMode = null;

// 이 변수는 현재 모드를 점령한 사용자 ID를 저장합니다.
let currentUserId = null;

// 이 객체는 사용 가능한 모드들을 매핑합니다.
const modes = {
  ENHANCE: enhanceMode,
  RPS: rpsMode,
};

// 이 객체는 명령어와 모드의 매핑을 정의합니다.
const commandToMode = {
  "가위바위보": "RPS",
  "강화하기": "ENHANCE",
};

// 이 함수는 모드를 점령합니다.
function occupyMode(userId) {
  currentUserId = userId;
}

// 이 함수는 모드 점령을 해제합니다.
function releaseMode() {
  currentUserId = null;
}

// 이 함수는 모드를 초기화합니다.
function resetMode() {
  if (currentMode && modes[currentMode]) {
    modes[currentMode].initialize();
  }
  currentMode = null;
  currentUserId = null;
}

// 이 함수는 모드 컨트롤러 객체를 생성합니다.
function createModeController() {
  return {
    currentMode,
    currentUserId,
    occupyMode,
    releaseMode,
    resetMode,
  };
}

// 이 함수는 잡담 채널의 messageCreate 이벤트를 처리합니다.
async function handle(message) {
  const content = message.content.trim();
  const modeController = createModeController();

  // 명령어 처리 (:{기능명} 형식)
  if (content.startsWith(":")) {
    const command = content.slice(1);
    
    // 명령어에 해당하는 모드 확인
    const targetMode = commandToMode[command];
    
    if (targetMode) {
      // 다른 사용자가 모드를 점령 중인 경우
      if (currentUserId !== null && currentUserId !== message.author.id) {
        return `${message.author}님, 다른 사용자가 모드를 사용 중입니다. 잠시 후 다시 시도해주세요.`;
      }
      
      // 모드 활성화 및 점령
      if (currentMode !== targetMode) {
        resetMode();
        currentMode = targetMode;
      }
      occupyMode(message.author.id);
      
      // 모드 핸들러로 전달 (명령어 포함)
      return await modes[targetMode].handle(message, content, modeController);
    }
    
    // 알 수 없는 명령어
    return null;
  }

  // 현재 모드가 활성화되어 있으면 모드 핸들러로 전달
  if (currentMode && modes[currentMode]) {
    return await modes[currentMode].handle(message, content, modeController);
  }

  return null;
}

module.exports = {
  handle,
};
