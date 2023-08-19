# Stream Deck Plugin development

公式 Doc

https://docs.elgato.com/sdk/plugins/getting-started

充実しているように見えるが、欠陥だらけ

## やったこと

`https://github.com/elgatosf/streamdeck-plugin-template`をコピーする

clone だとダメだったから zip をダウンロードしたらいけた（たぶん何かの間違いでどっちでも問題ないはず）

SymLink の追加

```sh
ln -s com.nbr41to.practice.sdPlugin ~/Library/Application\ Support/com.elgato.StreamDeck/Plugins/
```

削除

```sh
unlink ~/Library/Application\ Support/com.elgato.StreamDeck/Plugins/com.nbr41to.practice.sdPlugin
```

## debag

```sh
defaults write com.elgato.StreamDeck html_remote_debugging_enabled -bool YES
```

`http://localhost:23654/`
