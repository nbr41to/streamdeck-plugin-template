/* global $CC, Utils, $SD */

$SD.on('connected', (jsonObj) => connected(jsonObj));
// $SD.apiでDocumentsのSent APIのメソッドが使用できる

/* DocumentsのReceivedのJSONを受け取る */
function connected(jsn) {
  console.log('connected(jsn)', jsn);
  /* 初回に実行 */
  $SD.on('com.nbr41to.practice.action.willAppear', (jsonObj) =>
    action.onWillAppear(jsonObj),
  );
  /* ボタンが押されたときに発火 */
  $SD.on('com.nbr41to.practice.action.keyUp', (jsonObj) =>
    action.onKeyUp(jsonObj),
  );
  $SD.on('com.nbr41to.practice.action.didReceiveSettings', (jsonObj) =>
    action.onDidReceiveSettings(jsonObj),
  );
  $SD.on(
    'com.nbr41to.practice.action.propertyInspectorDidAppear',
    (jsonObj) => {
      console.log(
        '%c%s',
        'color: white; background: black; font-size: 13px;',
        '[app.js]propertyInspectorDidAppear:',
      );
    },
  );
  $SD.on(
    'com.nbr41to.practice.action.propertyInspectorDidDisappear',
    (jsonObj) => {
      console.log(
        '%c%s',
        'color: white; background: red; font-size: 13px;',
        '[app.js]propertyInspectorDidDisappear:',
      );
    },
  );
}

var websocket = null;
var pluginUUID = null;
var DestinationEnum = Object.freeze({
  HARDWARE_AND_SOFTWARE: 0,
  HARDWARE_ONLY: 1,
  SOFTWARE_ONLY: 2,
});
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

// ACTIONS
const action = {
  settings: {
    channelId: '',
    apiKey: '',
  },
  onWillAppear: function (jsn) {
    console.log('onWillAppear', jsn);
    console.log('onWillAppear:jsn.payload.settings', jsn.payload.settings);
    console.log(
      'onWillAppear:Utils.getProp(jsn,payload.settings, {})',
      Utils.getProp(jsn, 'payload.settings', {}),
    );
    this.settings = jsn.payload.settings;
    console.log('this.settings', this.settings);
  },
  onKeyUp: async function (jsn) {
    // this.setImage(jsn, 'onKeyUp', 'orange');
    console.log('onKeyUp', jsn);
    // var json = {
    //   event: 'setTitle',
    //   context: jsn.context,
    //   payload: {
    //     title: '新しいタイトル',
    //     target: DestinationEnum.HARDWARE_AND_SOFTWARE,
    //   },
    // };
    // this.onSetTitle(JSON.stringify(json));

    /* URLをブラウザで開く */
    // $SD.api.openUrl(jsn.context, 'https://www.nbr41.com/');

    /* Titleの変更（デバイス側でタイトルを空にする必要あり） */
    // const dice = Math.floor(Math.random() * 6) + 1;
    // $SD.api.setTitle(
    //   jsn.context,
    //   '新' + dice,
    //   DestinationEnum.HARDWARE_AND_SOFTWARE, // default なので省略可
    // );

    /* 背景画像の変更（画像ファイルをbase64にエンコードする必要あり） */
    // const img = await getImageData('https://picsum.photos/500');
    // console.log(img);
    // $SD.api.setImage(jsn.context, img);

    /* 取得したデータを表示 */
    // youtubeの情報を取得
    const settings = jsn.payload.settings;
    const channelId = settings.channelId;
    const apiKey = settings.apiKey;

    const baseUri = 'https://www.googleapis.com/youtube/v3';
    const response = await fetch(
      `${baseUri}/channels?part=statistics,snippet&id=${channelId}&key=${apiKey}`,
    );
    if (response.ok) {
      const channel = await response.json();
      console.log(channel);

      const subscriberCount = channel.items[0].statistics.subscriberCount;
      const formattedNumber = formatNumber(Number(subscriberCount));
      $SD.api.setTitle(jsn.context, formattedNumber);

      const thumbnailUrl = channel.items[0].snippet.thumbnails.default.url;
      const img = await getImageData(thumbnailUrl);
      $SD.api.setImage(jsn.context, img);
    } else {
      $SD.api.setTitle(jsn.context, 'invalid');
    }
  },
  onDidReceiveSettings: function (jsn) {
    console.log('onDidReceiveSettings', jsn);
    this.settings = Utils.getProp(jsn, 'payload.settings', {});
  },

  /* 永続的に保存（未使用（いらなそう？）） */
  saveSettings: function (jsn, sdpi_collection) {
    console.log('saveSettings:', jsn);
    if (sdpi_collection.hasOwnProperty('key') && sdpi_collection.key != '') {
      if (sdpi_collection.value && sdpi_collection.value !== undefined) {
        this.settings[sdpi_collection.key] = sdpi_collection.value;
        console.log('setSettings....', this.settings);
        $SD.api.setSettings(jsn.context, this.settings);
      }
    }
  },
};
