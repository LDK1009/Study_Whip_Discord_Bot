// 이 파일은 잡담 채널의 강화 모드를 관리하는 모듈입니다.

// 이 상수는 모드 이름을 정의합니다.
const MODE_NAME = "ENHANCE";

// 이 변수는 강화 게임 진행 상태를 저장합니다 (모드/사용자 상태는 index.js에서 관리).
let enhanceState = null;

// 이 변수는 강화 타임아웃 타이머를 저장합니다.
let enhanceTimeout = null;

// 이 배열은 레벨별 아이템 이름을 정의합니다.
const ITEM_NAMES = [
  "일반 단검", // 레벨 0
  "강화된 단검", // 레벨 1
  "카타나", // 레벨 2
  "명도 카타나", // 레벨 3
  "영롱한 보석검", // 레벨 4
  "마법의 보석검", // 레벨 5
  "전설의 검", // 레벨 6
  "신의 검", // 레벨 7
  "천상의 검", // 레벨 8
  "절대의 검", // 레벨 9 (구)
];

// 이 함수는 강화 모드를 초기 상태로 리셋합니다.
function initialize(modeManager = null) {
  // 타임아웃 타이머가 있으면 클리어
  if (enhanceTimeout) {
    clearTimeout(enhanceTimeout);
    enhanceTimeout = null;
  }
  enhanceState = null;
  if (modeManager) {
    modeManager.releaseMode();
  }
  return MODE_NAME;
}

// 이 함수는 강화 타임아웃을 설정합니다.
function setEnhanceTimeout() {
  // 기존 타임아웃이 있으면 클리어
  if (enhanceTimeout) {
    clearTimeout(enhanceTimeout);
  }

  // 5초 후 강화 상태 초기화
  enhanceTimeout = setTimeout(async () => {
    // 타임아웃 메시지 전송
    if (enhanceState && enhanceState.channel && enhanceState.userId) {
      try {
        await enhanceState.channel.send(`**강화 시간 초과**\n\n<@${enhanceState.userId}>님의 강화가 5초간 활동이 없어 종료되었습니다.\n\n이제 다른 사용자도 강화하기를 사용할 수 있습니다.`);
      } catch (error) {
        console.error("타임아웃 메시지 전송 중 오류 발생:", error);
      }
    }
    
    enhanceState = null;
    enhanceTimeout = null;
  }, 5 * 1000);
}

// 이 함수는 강화 모드의 메시지를 처리합니다.
function handle(message, content, modeManager = null) {
  // 현재 모드와 사용자 정보는 modeManager에서 가져옵니다.
  const currentMode = modeManager ? modeManager.currentMode : null;
  const currentUserId = modeManager ? modeManager.currentUserId : null;

  // 명령어 처리 (/{기능명} 형식)
  if (content.startsWith(":")) {
    const command = content.slice(1);
    
    // 강화하기 명령어 처리
    if (command === "강화하기") {
      // 다른 사용자가 강화 중인 경우
      if (enhanceState && currentUserId !== message.author.id) {
        return `${message.author}님, 다른 사용자가 강화를 진행 중입니다. 잠시 후 다시 시도해주세요.`;
      }

      // 모드 점령
      if (modeManager) {
        modeManager.occupyMode(message.author.id);
      }

      // 강화 상태가 없으면 초기화
      if (!enhanceState) {
        enhanceState = {
          userId: message.author.id, // 타임아웃 메시지용 사용자 ID 저장
          level: 0,
          itemName: ITEM_NAMES[0],
          isStarted: false,
          channel: message.channel, // 채널 정보 저장 (타임아웃 메시지 전송용)
        };
        setEnhanceTimeout();
        return `${message.author}님이 강화 모드에 진입했습니다!\n현재 아이템: **${enhanceState.itemName}** (레벨 ${enhanceState.level})\n\n다시 \`:강화하기\`를 입력하면 강화를 시작합니다.\n\n5초간 활동이 없으면 자동으로 종료됩니다.`;
      }

      // 강화 시작
      if (!enhanceState.isStarted) {
        enhanceState.isStarted = true;
        setEnhanceTimeout();
        
        // 강화 시뮬레이션 (성공률 계산)
        const successRate = Math.max(10, 100 - enhanceState.level * 10);
        const success = Math.random() * 100 < successRate;

        if (success) {
          // 강화 성공
          enhanceState.level = Math.min(9, enhanceState.level + 1);
          enhanceState.itemName = ITEM_NAMES[enhanceState.level];
          enhanceState.isStarted = false;
          
          if (enhanceState.level === 9) {
            // 최대 레벨 도달
            const result = `**강화 성공!**\n\n**최대 레벨 달성!**\n\n**${enhanceState.itemName}** (레벨 ${enhanceState.level})\n\n축하합니다! 절대의 검을 획득하셨습니다!`;
            enhanceState = null;
            if (enhanceTimeout) {
              clearTimeout(enhanceTimeout);
              enhanceTimeout = null;
            }
            if (modeManager) {
              modeManager.releaseMode();
            }
            return result;
          }
          
          return `**강화 성공!**\n\n**${enhanceState.itemName}** (레벨 ${enhanceState.level})\n\n다시 \`:강화하기\`를 입력하면 다음 레벨로 강화할 수 있습니다.`;
        } else {
          // 아이템 파괴
          const result = `**강화 실패! 아이템이 파괴되었습니다!**\n\n${enhanceState.itemName} (레벨 ${enhanceState.level})이(가) 부서졌습니다...\n\n새로운 아이템으로 다시 시작하세요.`;
          enhanceState = null;
          if (enhanceTimeout) {
            clearTimeout(enhanceTimeout);
            enhanceTimeout = null;
          }
          if (modeManager) {
            modeManager.releaseMode();
          }
          return result;
        }
      }
    }
    
    // 다른 명령어는 무시
    return null;
  }

  // 강화 모드가 활성화되어 있지 않으면 처리하지 않음
  if (currentMode !== "ENHANCE" || !enhanceState) {
    return null;
  }

  // 다른 사용자가 메시지를 보낸 경우
  if (currentUserId !== message.author.id) {
    return `${message.author}님, 다른 사용자가 강화를 진행 중입니다. 잠시 후 다시 시도해주세요.`;
  }

  // 타임아웃 리셋
  setEnhanceTimeout();

  // 일반 메시지는 무시 (강화하기 명령어만 처리)
  return null;
}

module.exports = {
  MODE_NAME,
  initialize,
  handle,
};
