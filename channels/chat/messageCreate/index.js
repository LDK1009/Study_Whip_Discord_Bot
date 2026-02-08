// 이 파일은 잡담 채널의 messageCreate 이벤트를 처리하는 모듈입니다.

const enhanceMode = require("./enhance");
const rpsMode = require("./rps");

// 이 변수는 현재 채널의 활성화된 모드를 저장합니다.
let currentMode = null;

// 이 변수는 현재 모드를 점령한 사용자 ID를 저장합니다.
let currentUserId = null;

// 이 객체는 사용 가능한 모드들을 매핑합니다 (영어 모드명 사용).
const modes = {
  ENHANCE: enhanceMode,
  RPS: rpsMode,
};

// 이 객체는 한글 명령어를 영어 모드명으로 매핑합니다.
const commandMap = {
  강화하기: "ENHANCE",
};

// 이 함수는 현재 모드를 반환합니다.
function getCurrentMode() {
  return currentMode;
}

// 이 함수는 현재 모드를 점령한 사용자 ID를 반환합니다.
function getCurrentUserId() {
  return currentUserId;
}

// 이 함수는 모드를 점령합니다.
function occupyMode(userId) {
  currentUserId = userId;
}

// 이 함수는 모드 점령을 해제합니다.
function releaseMode() {
  currentUserId = null;
}

// 이 함수는 모드를 변경하고 초기화합니다.
function changeMode(modeName, userId = null) {
  // 기존 모드가 있으면 초기화
  if (currentMode && modes[currentMode]) {
    modes[currentMode].initialize({
      currentMode,
      currentUserId,
      occupyMode,
      releaseMode,
    });
  }
  
  // 모드 해제
  if (!modeName) {
    currentMode = null;
    currentUserId = null;
    return null;
  }
  
  // 새 모드로 변경
  if (modes[modeName]) {
    currentMode = modeName;
    currentUserId = userId;
    return modes[modeName].initialize();
  }
  
  return null;
}

// 이 함수는 다른 사용자가 모드를 점령 중인지 확인합니다.
function isModeOccupiedByOtherUser(userId) {
  return currentUserId !== null && currentUserId !== userId;
}

// 이 함수는 잡담 채널의 messageCreate 이벤트를 처리합니다.
async function handle(message) {
  const content = message.content.trim();

  // 명령어 처리 (:{기능명} 형식)
  if (content.startsWith(":")) {
    const command = content.slice(1);
    
    // 가위바위보 명령어는 모드 변경 없이 바로 처리
    if (command === "가위바위보") {
      // 다른 사용자가 모드를 점령 중인 경우 모드 변경 불가
      if (isModeOccupiedByOtherUser(message.author.id)) {
        return `${message.author}님, 다른 사용자가 모드를 사용 중입니다. 잠시 후 다시 시도해주세요.`;
      }
      // 가위바위보 모드가 활성화되어 있지 않으면 활성화
      if (currentMode !== "RPS") {
        changeMode("RPS", message.author.id);
      }
      // 가위바위보 모드 핸들러로 전달
      return await rpsMode.handle(message, content, {
        currentMode,
        currentUserId,
        occupyMode,
        releaseMode,
      });
    }
    
    // 강화하기 명령어는 모드 변경 없이 바로 처리
    if (command === "강화하기") {
      // 다른 사용자가 모드를 점령 중인 경우 모드 변경 불가
      if (isModeOccupiedByOtherUser(message.author.id)) {
        return `${message.author}님, 다른 사용자가 모드를 사용 중입니다. 잠시 후 다시 시도해주세요.`;
      }
      // 강화 모드가 활성화되어 있지 않으면 활성화
      if (currentMode !== "ENHANCE") {
        changeMode("ENHANCE", message.author.id);
      }
      // 강화 모드 핸들러로 전달
      return modes.ENHANCE.handle(message, content, {
        currentMode,
        currentUserId,
        occupyMode,
        releaseMode,
      });
    }
    
    // 다른 사용자가 모드를 점령 중인 경우 모드 변경 불가
    if (isModeOccupiedByOtherUser(message.author.id)) {
      return `${message.author}님, 다른 사용자가 모드를 사용 중입니다. 잠시 후 다시 시도해주세요.`;
    }
    
    // 한글 명령어를 영어 모드명으로 변환
    const modeName = commandMap[command] || command;
    
    // 모드 변경 처리
    if (modes[modeName]) {
      const initializedMode = changeMode(modeName, message.author.id);
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
    // 모드 핸들러에 상태 정보를 전달
    return modes[currentMode].handle(message, content, {
      currentMode,
      currentUserId,
      occupyMode,
      releaseMode,
    });
  }

  return null;
}

module.exports = {
  handle,
  getCurrentMode,
  getCurrentUserId,
  occupyMode,
  releaseMode,
  changeMode,
};
