# dsh-chat-width

A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) plugin that adds one switch to **Settings → General**:

> **Full-width chat** — span the transcript and the composer across the whole centre column instead of the default centred reading column.

Turning it off restores whatever width you had before, including a width you dragged by hand, so the switch and the built-in drag handles never fight each other.

## Install

Ask the Harness agent to install the bundle, pointing at this repository:

```
plugin_manager(action: "install_bundle", target: "github:luxi78/dsh-chat-width")
```

Or clone it and install from the local directory:

```bash
git clone https://github.com/luxi78/dsh-chat-width.git
```

```
plugin_manager(action: "install_bundle", target: "<absolute path to the clone>")
```

Then open **Settings → General** and flip **Full-width chat**. That entry also appears in the plugin list, where it can be disabled or uninstalled later.

## How it works

The conversation column is capped by CSS variables that the shipped conversation UI derives from the measured centre column:

- `--dsh-chat-content-width` (transcript)
- `--dsh-composer-card-max-width` (composer)

The plugin never touches those values or the DOM of the conversation. It puts a `data-dsh-chat-full` attribute on `<html>` and ships one rule that redefines both variables on `[data-conversation-scroll]`:

```css
html[data-dsh-chat-full] [data-conversation-scroll] {
  --dsh-chat-content-width: 100%;
  --dsh-composer-card-max-width: 100%;
}
```

Removing the attribute restores the original values, which is why toggling off is instant and lossless. The whole setting is a single `localStorage` flag (`dsh.chat.fullWidth`), scoped to the Harness web origin.

## Compatibility

| | |
| --- | --- |
| Harness client | `0.2.x` (developed and verified against `0.2.1-rc.5`) |
| Platform | Desktop app and `dsh web` (the client half declares `platform: web`) |
| Build step | none — plain ES module, static CSS, one SVG |

The plugin depends on two internals of `@deepseek-ai/dsh-client-ui-conversation` that are not public API: the `[data-conversation-scroll]` attribute and the two CSS variable names above. If a future Harness release renames them, the switch stays visible but stops widening anything. Pin the Harness version, or update this plugin, when that happens.

## Layout of the package

```
client.js         the whole feature: settings row, switch, injected styles
index.js          Host half (empty — nothing runs on the Host side)
cordis.patch.yml  bundle patch: one inserted plugin row
locale/*.json     title and description shown in the plugin list
icon.svg          plugin artwork
```

## Uninstall

```
plugin_manager(action: "remove_bundle", target: "dsh-chat-width")
```

Removing the bundle also reverts the page to the default column on the next load.

## License

MIT — see [LICENSE](LICENSE).
