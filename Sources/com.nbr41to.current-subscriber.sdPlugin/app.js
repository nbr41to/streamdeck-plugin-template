/* global $CC, Utils, $SD */

$SD.on('connected', (jsonObj) => connected(jsonObj));

function connected(jsn) {
  /* 描画時に発火 */
  $SD.on('com.nbr41to.current-subscriber.action.willAppear', (jsonObj) =>
    action.onInitialize(jsonObj),
  );
  /* ボタンが押されたときに発火 */
  $SD.on('com.nbr41to.current-subscriber.action.keyDown', (jsonObj) =>
    action.onFetchData(jsonObj.context, jsonObj.payload.settings),
  );
  $SD.on('com.nbr41to.current-subscriber.action.keyUp', (jsonObj) =>
    action.onKeyUp(jsonObj),
  );
  /* 設定の変更時に発火（onBlur） */
  $SD.on(
    'com.nbr41to.current-subscriber.action.didReceiveSettings',
    (jsonObj) => action.onSetSettings(jsonObj),
  );
}

/* 画像の取得とEncode */
async function getImageData(url) {
  const response = await fetch(url);
  const blob = await response.blob();

  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/* 登録者数の整形 */
function formatNumber(number) {
  if (number < 1000) {
    return number.toString();
  }
  const units = ['', 'k', 'M', 'G', 'T'];
  const decimals = 2; // 表示する小数点以下の桁数
  const unitIndex = Math.floor(Math.log10(number) / 3);
  const formattedNumber = (number / Math.pow(1000, unitIndex)).toFixed(
    decimals,
  );

  return `${formattedNumber}${units[unitIndex]}`;
}

/**
 * ACTIONS
 */
const action = {
  settings: {
    channelId: '',
    apiKey: '',
    url: '',
  },
  /* 初回に実行 */
  onInitialize: function (jsn) {
    const setting = jsn.payload.settings;
    this.settings = setting; // 設定を更新
    this.onFetchData(jsn.context, setting); // 設定内容でデータを取得
  },

  /* ボタンを押したときに */
  onKeyUp: async function (jsn) {
    const { url, channelId } = jsn.payload.settings;
    if (!url && !channelId) return;
    /* ブラウザで開く */
    $SD.api.openUrl(
      jsn.context,
      url ? url : 'https://www.youtube.com/channel/' + channelId,
    ); // 優先順位は url > channelId
  },

  /* 設定を更新 */
  onSetSettings: function (jsn) {
    this.settings = jsn.payload.settings;
  },

  /* youtubeの情報を取得 */
  onFetchData: async function (context, settings) {
    const { channelId, apiKey } = settings;
    const baseUri = 'https://www.googleapis.com/youtube/v3';
    try {
      const response = await fetch(
        `${baseUri}/channels?part=statistics,snippet&id=${channelId}&key=${apiKey}`,
      );
      if (!response.ok) throw new Error('Failed to fetch');
      const channel = await response.json();
      /* チャンネル登録者の更新 */
      const subscriberCount = channel.items[0].statistics.subscriberCount;
      const formattedNumber = formatNumber(Number(subscriberCount));
      $SD.api.setTitle(context, formattedNumber);
      /* サムネイル画像の更新 */
      const thumbnailUrl = channel.items[0].snippet.thumbnails.default.url;
      const img = await getImageData(thumbnailUrl);
      $SD.api.setImage(context, img);
    } catch (error) {
      console.error(error);
      $SD.api.setTitle(context, 'invalid');
    }
  },
};
