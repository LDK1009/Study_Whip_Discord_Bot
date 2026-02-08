// 이 파일은 잡담 채널의 가위바위보 모드를 관리하는 모듈입니다.

// 이 상수는 모드 이름을 정의합니다.
const MODE_NAME = "RPS";

// 이 변수는 가위바위보 게임 진행 상태를 저장합니다 (모드/사용자 상태는 index.js에서 관리).
let rpsState = null;

// 이 배열은 가위바위보 선택지를 정의합니다.
const CHOICES = ["가위", "바위", "보"];

// 이 함수는 가위바위보 모드를 초기 상태로 리셋합니다.
function initialize() {
  rpsState = null;
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
    resultMessage += `**${userMention} 승리!**`;
  } else if (result === "패배") {
    resultMessage += `**${userMention} 패배...**`;
  } else {
    resultMessage += `**무승부!**`;
  }

  // 모드 종료
  rpsState = null;

  return resultMessage;
}

// 이 함수는 가위바위보 게임을 시작합니다.
async function startGame(message, modeController) {
  // 가위바위보 시작
  rpsState = {
    channel: message.channel,
    startTime: Date.now(),
    waitingForInput: true, // 카운트다운 중에만 입력 받기
    botChoice: null,
    userChoice: null,
  };

  // 가위바위보 모드 실행 메시지 전송
  await message.channel.send("**가위바위보 모드 실행**");

  // 카운트다운 전송 (카운트다운 중에만 입력 받음)
  for (let i = 3; i >= 1; i--) {
    await message.channel.send(`${i}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // 카운트다운 종료 - 입력 받기 종료
  rpsState.waitingForInput = false;

  // 봇의 선택 (랜덤)
  const botChoice = CHOICES[Math.floor(Math.random() * CHOICES.length)];
  rpsState.botChoice = botChoice;

  // 봇의 선택 공개
  await message.channel.send(`**${botChoice}**`);

  // 사용자가 입력하지 않은 경우
  if (!rpsState.userChoice) {
    await message.channel.send(`${message.author}님, 시간 초과로 무효 처리되었습니다.`);
    rpsState = null;
    modeController.resetMode();
  } else if (rpsState.userChoice && rpsState.botChoice) {
    // 사용자가 입력했고 봇의 선택도 공개된 경우 결과 처리
    const resultMessage = processResult(rpsState, modeController.currentUserId, modeController.currentUserId);
    if (resultMessage) {
      await message.channel.send(resultMessage);
    }
    modeController.resetMode();
  }
}

// 이 함수는 가위바위보 모드의 메시지를 처리합니다.
async function handle(message, content, modeController) {
  const currentUserId = modeController.currentUserId;

  // 명령어 처리 (가위바위보 시작)
  if (content === ":가위바위보") {
    await startGame(message, modeController);
    return null; // 비동기 처리 중이므로 null 반환
  }

  // 게임이 진행 중이 아니면 처리하지 않음
  if (!rpsState) {
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

  // 사용자 선택 저장
  rpsState.userChoice = userInput;

  // 카운트다운 중에 입력했으므로 저장만 하고 결과는 카운트다운 종료 후 처리됨
  return null;
}

module.exports = {
  MODE_NAME,
  initialize,
  handle,
};
