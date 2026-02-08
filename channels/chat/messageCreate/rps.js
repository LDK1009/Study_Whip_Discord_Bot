// 이 파일은 잡담 채널의 가위바위보 모드를 관리하는 모듈입니다.

// 이 상수는 모드 이름을 정의합니다.
const MODE_NAME = "RPS";

// 이 변수는 가위바위보 게임 진행 상태를 저장합니다 (모드/사용자 상태는 index.js에서 관리).
let rpsState = null;

// 이 배열은 가위바위보 선택지를 정의합니다.
const CHOICES = ["가위", "바위", "보"];

// 이 함수는 가위바위보 모드를 초기 상태로 리셋합니다.
function initialize(modeManager = null) {
  rpsState = null;
  if (modeManager) {
    modeManager.releaseMode();
  }
  return MODE_NAME;
}

// 이 함수는 가위바위보 결과를 판정합니다.
function judgeResult(userChoice, botChoice) {
  if (userChoice === botChoice) {
    return "무승부";
  }
  
  if (
    (userChoice === "가위" && botChoice === "보") ||
    (userChoice === "바위" && botChoice === "가위") ||
    (userChoice === "보" && botChoice === "바위")
  ) {
    return "승리";
  }
  
  return "패배";
}

// 이 함수는 가위바위보 결과를 처리하고 메시지를 반환합니다.
function processResult(state, messageOrUserId, currentUserId) {
  if (!state.userChoice || !state.botChoice) {
    return null;
  }

  // 결과 판정
  const result = judgeResult(state.userChoice, state.botChoice);
  
  // 사용자 멘션 (message 객체 또는 userId 문자열)
  const userMention = typeof messageOrUserId === 'object' && messageOrUserId.author 
    ? messageOrUserId.author 
    : `<@${typeof messageOrUserId === 'string' ? messageOrUserId : currentUserId}>`;
  
  // 결과 메시지 생성
  let resultMessage = `**가위바위보 결과**\n\n`;
  resultMessage += `${userMention}: **${state.userChoice}**\n`;
  resultMessage += `봇: **${state.botChoice}**\n\n`;
  
  if (result === "승리") {
    resultMessage += `**승리!**`;
  } else if (result === "패배") {
    resultMessage += `**패배...**`;
  } else {
    resultMessage += `**무승부!**`;
  }

  // 모드 종료
  rpsState = null;

  return resultMessage;
}

// 이 함수는 가위바위보 모드의 메시지를 처리합니다.
async function handle(message, content, modeManager = null) {
  // 현재 모드와 사용자 정보는 modeManager에서 가져옵니다.
  const currentMode = modeManager ? modeManager.currentMode : null;
  const currentUserId = modeManager ? modeManager.currentUserId : null;

  // 명령어 처리 (:{기능명} 형식)
  if (content.startsWith(":")) {
    const command = content.slice(1);
    
    // 가위바위보 명령어 처리
    if (command === "가위바위보") {
      // 다른 사용자가 가위바위보 중인 경우
      if (rpsState && currentUserId !== message.author.id) {
        return `${message.author}님, 다른 사용자가 가위바위보를 진행 중입니다. 잠시 후 다시 시도해주세요.`;
      }

      // 모드 점령
      if (modeManager) {
        modeManager.occupyMode(message.author.id);
      }

      // 가위바위보 시작
      rpsState = {
        channel: message.channel,
        startTime: Date.now(),
        waitingForInput: true, // 카운트다운 중부터 입력 받기 시작
        botChoice: null,
        userChoice: null,
        choiceTime: null, // 봇이 선택을 공개한 시간 (아직 공개 전)
      };

      // 가위바위보 모드 실행 메시지 전송
      await message.channel.send("**가위바위보 모드 실행**");

      // 카운트다운 전송
      for (let i = 3; i >= 1; i--) {
        await message.channel.send(`${i}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // 봇의 선택 (랜덤)
      const botChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];
      rpsState.botChoice = botChoice;
      rpsState.choiceTime = Date.now(); // 봇이 선택을 공개한 시간

      // 봇의 선택 공개
      await message.channel.send(`**${botChoice}**`);

      // 0.5초 후 입력 유효 시간 종료
      setTimeout(async () => {
        if (rpsState && rpsState.waitingForInput && currentUserId === message.author.id) {
          rpsState.waitingForInput = false;
          // 사용자가 입력하지 않은 경우
          if (!rpsState.userChoice) {
            await message.channel.send(`${message.author}님, 시간 초과로 무효 처리되었습니다.`);
            rpsState = null;
            if (modeManager) {
              modeManager.releaseMode();
            }
          } else if (rpsState.userChoice && rpsState.botChoice) {
            // 사용자가 입력했고 봇의 선택도 공개된 경우 결과 처리
            const resultMessage = processResult(rpsState, currentUserId, currentUserId);
            if (resultMessage) {
              await message.channel.send(resultMessage);
            }
            if (modeManager) {
              modeManager.releaseMode();
            }
          }
        }
      }, 500);

      return null; // 비동기 처리 중이므로 null 반환
    }
    
    // 다른 명령어는 무시
    return null;
  }

  // 가위바위보 모드가 활성화되어 있지 않으면 처리하지 않음
  if (currentMode !== "RPS" || !rpsState) {
    return null;
  }

  // 다른 사용자가 메시지를 보낸 경우
  if (currentUserId !== message.author.id) {
    return null; // 다른 사용자의 메시지는 무시
  }

  // 입력 대기 중이 아니면 무시
  if (!rpsState.waitingForInput) {
    return null;
  }

  // 사용자 입력 처리
  const userInput = content.trim();
  if (!CHOICES.includes(userInput)) {
    return `"${userInput}"는 유효한 선택이 아닙니다. "가위", "바위", "보" 중 하나를 입력해주세요.`;
  }

  // 입력 시간 체크
  const inputTime = Date.now();
  
  // 봇이 선택을 공개한 경우, 선택 후 0.5초 이내에 입력한 경우만 유효
  if (rpsState.choiceTime) {
    const timeSinceChoice = inputTime - rpsState.choiceTime;
    if (timeSinceChoice > 500) {
      rpsState.waitingForInput = false;
      rpsState = null;
      if (modeManager) {
        modeManager.releaseMode();
      }
      return `${message.author}님, 너무 늦게 입력하셨습니다. 무효 처리되었습니다.`;
    }
  }

  // 사용자 선택 저장
  rpsState.userChoice = userInput;

  // 봇의 선택이 이미 공개된 경우 즉시 결과 처리
  if (rpsState.botChoice) {
    rpsState.waitingForInput = false;
    const resultMessage = processResult(rpsState, message, currentUserId);
    if (modeManager) {
      modeManager.releaseMode();
    }
    return resultMessage;
  }

  // 봇의 선택이 아직 공개되지 않은 경우, 봇 선택 공개 후 결과 처리됨
  return null;
}

module.exports = {
  MODE_NAME,
  initialize,
  handle,
};
