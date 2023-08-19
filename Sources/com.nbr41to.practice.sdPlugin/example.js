/* global $CC, Utils, $SD */

/**
 * プラグインを素早くセットアップし、
 * Stream Deckから送られてくるイベントをあなたのプラグインに登録するために、
 * 私たちが作成したラッパーをいくつか紹介します。
 * あなたのプラグインを素早くセットアップし、
 * Stream Deck からあなたのプラグインに送られるイベントを購読するのに役立ちます。
 */

/**
 * プラグインのインスタンスが登録されると、
 * 'connected' イベントがプラグインに送信されます。
 * イベントは、プラグインのインスタンスが
 * Stream Deck ソフトウェアに登録された後、プラグインに送信されます。
 * これは現在のウェブソケット
 * と現在の環境に関するその他の情報を JSON オブジェクトで伝えます。
 * あなたのプラグインで使用したいイベントを購読するために、
 * このイベントを使用することができます。
 */

$SD.on('connected', (jsonObj) => connected(jsonObj));

function connected(jsn) {
  // Subscribe to the willAppear and other events
  $SD.on('com.elgato.template.action.willAppear', (jsonObj) =>
    action.onWillAppear(jsonObj),
  );
  $SD.on('com.elgato.template.action.keyUp', (jsonObj) =>
    action.onKeyUp(jsonObj),
  );
  $SD.on('com.elgato.template.action.sendToPlugin', (jsonObj) =>
    action.onSendToPlugin(jsonObj),
  );
  $SD.on('com.elgato.template.action.didReceiveSettings', (jsonObj) =>
    action.onDidReceiveSettings(jsonObj),
  );
  $SD.on('com.elgato.template.action.propertyInspectorDidAppear', (jsonObj) => {
    console.log(
      '%c%s',
      'color: white; background: black; font-size: 13px;',
      '[app.js]propertyInspectorDidAppear:',
    );
  });
  $SD.on(
    'com.elgato.template.action.propertyInspectorDidDisappear',
    (jsonObj) => {
      console.log(
        '%c%s',
        'color: white; background: red; font-size: 13px;',
        '[app.js]propertyInspectorDidDisappear:',
      );
    },
  );
}

// ACTIONS

const action = {
  settings: {},
  onDidReceiveSettings: function (jsn) {
    console.log(
      '%c%s',
      'color: white; background: red; font-size: 15px;',
      '[app.js]onDidReceiveSettings:',
    );

    this.settings = Utils.getProp(jsn, 'payload.settings', {});
    this.doSomeThing(this.settings, 'onDidReceiveSettings', 'orange');

    /**
     * この例では、id='mynameinput' の HTML-input 要素を
     * Property Inspector の DOM に配置します。
     * をProperty InspectorのDOMに入れます。その入力フィールドにデータを入力すると
     * プラグインは更新された 'didReceiveSettings' を受け取ります。
     * プラグインは更新された 'didReceiveSettings' イベントを受け取ります。
     * ここでこの設定を探し、それを使ってキーのタイトルを変更します。
     * キーのタイトルを変更するために使います。
     */

    this.setTitle(jsn);
  },

  /**
   * willAppear'イベントは、キーが表示される直前の最初のイベントです。
   * このイベントは、プラグインをセットアップし、
   * 現在の設定（もしあれば）を確認するのに適した場所です。
   * このイベントは、プラグインをセットアップし、
   * 現在の設定（もしあれば）を見るのによい場所です、
   * このイベントは、あなたのプラグインを設定し、
   * 現在の設定（もしあれば）を見るのによい場所です。
   */

  onWillAppear: function (jsn) {
    console.log(
      "You can cache your settings in 'onWillAppear'",
      jsn.payload.settings,
    );
    /**
     * willAppearイベントは保存された設定を保持します。これらの設定は
     * プラグインをセットアップするか、後で使うために設定を保存します。
     * 後で設定を要求したい場合は、'getSettings' イベントを使用します。
     * 'getSettings'イベントを使用して行うことができます。
     * (上記の 'didReceiveSettings' で)
     *
     * $SD.api.getSettings(jsn.context);
     */
    this.settings = jsn.payload.settings;

    // セッティングのプリフィルには何も入っていない。
    if (!this.settings || Object.keys(this.settings).length === 0) {
      this.settings.mynameinput = 'TEMPLATE';
    }
    this.setTitle(jsn);
  },

  onKeyUp: function (jsn) {
    this.doSomeThing(jsn, 'onKeyUp', 'green');
  },

  onSendToPlugin: function (jsn) {
    /**
     * これは、Property Inspector から直接送られるメッセージです。
     * これは、Property Inspector から直接送られるメッセージです。
     * このイベントは、Property Inspector から送信できます。
     */

    const sdpi_collection = Utils.getProp(jsn, 'payload.sdpi_collection', {});
    if (sdpi_collection.value && sdpi_collection.value !== undefined) {
      this.doSomeThing(
        { [sdpi_collection.key]: sdpi_collection.value },
        'onSendToPlugin',
        'fuchsia',
      );
    }
  },

  /**
   * このスニペットは、Stream Deckソフトウェアに設定を永続的に保存する方法を示しています。
   * このプラグイン例では使用していません。
   */

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

  /**
   * ここでは、設定に保存された内容に基づいてキーのタイトルを変更する方法を示す、
   * 簡単なデモ・ラッパーを紹介します。
   * 設定に保存されているものに基づいて、
   * キーのタイトルを変更する方法を示す簡単なデモです。
   * このデモでは）Property Inspectorの名前フィールドに何かを入力すると、
   * キーのタイトルが表示されます、キーのタイトルを取得します。
   *
   * @param {JSON} jsn // The JSON object passed from Stream Deck to the plugin, which contains the plugin's context
   *
   */

  setTitle: function (jsn) {
    if (this.settings && this.settings.hasOwnProperty('mynameinput')) {
      console.log(
        'watch the key on your StreamDeck - it got a new title...',
        this.settings.mynameinput,
      );
      $SD.api.setTitle(jsn.context, this.settings.mynameinput);
    }
  },

  /**
   * 最後に、上記の様々なイベントから呼び出されるメソッドを紹介しよう。
   * これは、興味深いメッセージをストリーム・デッキから受信したときに、
   * どのように動作させるかについてのアイデアです。
   * ストリーム・デッキから。
   */

  doSomeThing: function (inJsonData, caller, tagColor) {
    console.log(
      '%c%s',
      `color: white; background: ${tagColor || 'grey'}; font-size: 15px;`,
      `[app.js]doSomeThing from: ${caller}`,
    );
    // console.log(inJsonData);
  },
};
