# Stream Deck Plugin development

公式 Doc

https://docs.elgato.com/sdk/plugins/getting-started

充実しているように見えるが、欠陥だらけ

## やったこと

### テンプレートの clone

```sh
git clone https://github.com/elgatosf/streamdeck-plugintemplate
```

公式には`https://github.com/elgatosf/streamdeck-plugin-template`をコピーするとあるが,`https://github.com/elgatosf/streamdeck-plugintemplate`こちらが良さそう

### Packaging

```sh
./DistributionTool -b -i ./Sources/com.elgato.template.sdPlugin -o Release
```

### SymLink の追加

```sh
ln -s com.nbr41to.practice.sdPlugin ~/Library/Application\ Support/com.elgato.StreamDeck/Plugins/
```

削除したい場合

```sh
unlink ~/Library/Application\ Support/com.elgato.StreamDeck/Plugins/com.nbr41to.practice.sdPlugin
```

## debag

```sh
defaults write com.elgato.StreamDeck html_remote_debugging_enabled -bool YES
```

`http://localhost:23654/`
