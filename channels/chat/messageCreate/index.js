// 이 파일은 잡담 채널의 messageCreate 이벤트를 처리하는 모듈입니다.

const enhanceMode = require("./enhance");

// 이 변수는 현재 채널의 활성화된 모드를 저장합니다.
let currentMode = null;

// 이 객체는 사용 가능한 모드들을 매핑합니다 (영어 모드명 사용).
const modes = {
  ENHANCE: enhanceMode,
};

// 이 객체는 한글 명령어를 영어 모드명으로 매핑합니다.
const commandMap = {
  강화: "ENHANCE",
  강화하기: "ENHANCE",
};

// 이 함수는 모드를 변경하고 초기화합니다.
function changeMode(modeName) {
  // 기존 모드가 있으면 초기화
  if (currentMode && modes[currentMode]) {
    modes[currentMode].initialize();
  }
  
  // 모드 해제
  if (!modeName) {
    currentMode = null;
    return null;
  }
  
  // 새 모드로 변경
  if (modes[modeName]) {
    currentMode = modeName;
    return modes[modeName].initialize();
  }
  
  return null;
}

// 이 함수는 잡담 채널의 messageCreate 이벤트를 처리합니다.
async function handle(message) {
  const content = message.content.trim();

  // 명령어 처리 (/{기능명} 형식)
  if (content.startsWith(":")) {
    const command = content.slice(1);
    
    // 강화하기 명령어는 모드 변경 없이 바로 처리
    if (command === "강화하기") {
      // 강화 모드가 활성화되어 있지 않으면 활성화
      if (currentMode !== "ENHANCE") {
        changeMode("ENHANCE");
      }
      // 강화 모드 핸들러로 전달
      return modes.ENHANCE.handle(message, content);
    }
    
    // 한글 명령어를 영어 모드명으로 변환
    const modeName = commandMap[command] || command;
    
    // 모드 변경 처리
    if (modes[modeName]) {
      const initializedMode = changeMode(modeName);
      if (modeName === "ENHANCE") {
        return "강화 모드로 전환되었습니다! \`/강화하기\`를 입력하여 강화를 시작하세요.";
      }
      return `${initializedMode} 모드로 전환되었습니다!`;
    } else {
      // 모드 해제
      changeMode(null);
      return "모드가 해제되었습니다.";
    }
  }

  // 현재 모드에 따른 처리
  if (currentMode && modes[currentMode]) {
    return modes[currentMode].handle(message, content);
  }

  return null;
}

module.exports = {
  handle,
};
