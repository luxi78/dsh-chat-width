/**
 * Chat Width — a General settings row that switches the conversation between
 * the shipped centred column and the full width of the centre column.
 *
 * The switch only flips one root attribute and one localStorage flag; the
 * conversation's own layout variables do the rest, so turning it off restores
 * whatever width the conversation had (including a handle-dragged width).
 */

window.__ModuleLoader__.load({
  id: 'dsh-chat-width',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'chat-width';
    const ROW_ID = 'chat-width';
    const STORAGE_KEY = 'dsh.chat.fullWidth';
    const ROOT_ATTRIBUTE = 'data-dsh-chat-full';

    /**
     * `--dsh-chat-content-width` is declared by the conversation body from the
     * measured column and the user's dragged preference. Declaring it again on
     * the scroll element (a descendant of that body) wins for the whole
     * transcript, and the composer derives from it, so one rule widens the tab.
     */
    const STYLES = [
      '.dcw-row{border-bottom:.5px solid var(--dsw-alias-border-l2);display:flex;align-items:center;justify-content:space-between;gap:24px;padding:16px 0}',
      '.dcw-title{color:var(--dsw-alias-label-primary);font-size:14px;line-height:20px}',
      '.dcw-description{color:var(--dsw-alias-label-secondary);margin-top:4px;font-size:12px;line-height:18px}',
      /* Copied from the host Switch primitive so the control matches every other row. */
      '.dcw-switch{box-sizing:border-box;position:relative;flex:0 0 auto;width:36px;height:20px;padding:2px;border:0;border-radius:999px;corner-shape:round;background:var(--dsw-alias-border-l3);cursor:pointer}',
      '.dcw-switch[aria-checked="true"]{background:var(--dsw-alias-brand-primary)}',
      '.dcw-switch:disabled{cursor:default;opacity:.5}',
      '.dcw-switch:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));outline-offset:2px}',
      '.dcw-thumb{display:block;width:16px;height:16px;border-radius:50%;corner-shape:round;background:var(--dsw-alias-label-primary-foreground);transition:transform .12s ease}',
      '.dcw-switch[aria-checked="false"] .dcw-thumb{background:var(--dsw-alias-switch-thumb)}',
      '.dcw-switch[aria-checked="true"] .dcw-thumb{transform:translate(16px)}',
      'html[data-dsh-chat-full] [data-conversation-scroll]{--dsh-chat-content-width:100%;--dsh-composer-card-max-width:100%}',
    ].join('');

    const LOCALES = {
      en: {
        title: 'Full-width chat',
        description: 'Span the transcript and composer across the centre column. Off restores the default width; the drag handles keep working while it is off.',
      },
      zh: {
        title: '聊天内容铺满',
        description: '开启后对话与输入框铺满中间区域。关闭则恢复默认宽度；关闭时仍可拖拽边缘调整。',
      },
    };

    function readFullWidth() {
      try {
        return window.localStorage.getItem(STORAGE_KEY) === '1';
      } catch (error) {
        return false;
      }
    }

    function writeFullWidth(enabled) {
      try {
        if (enabled) window.localStorage.setItem(STORAGE_KEY, '1');
        else window.localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        /* Private-mode storage failures leave the switch working for this page view. */
      }
      publishFullWidth(enabled);
    }

    function publishFullWidth(enabled) {
      if (enabled) document.documentElement.setAttribute(ROOT_ATTRIBUTE, '');
      else document.documentElement.removeAttribute(ROOT_ATTRIBUTE);
    }

    /** The General row: title, explanation, and a host-styled switch. */
    function ChatWidthRow(props) {
      const translate = typeof props.t === 'function' ? props.t : fallbackT;
      const [enabled, setEnabled] = React.useState(readFullWidth);
      return h(
        'div',
        { className: 'dcw-row' },
        h(
          'div',
          null,
          h('div', { className: 'dcw-title' }, translate('title')),
          h('div', { className: 'dcw-description' }, translate('description')),
        ),
        h(
          'button',
          {
            type: 'button',
            role: 'switch',
            className: 'dcw-switch',
            'aria-checked': enabled,
            'aria-label': translate('title'),
            onClick: () => {
              const next = !enabled;
              setEnabled(next);
              writeFullWidth(next);
            },
          },
          h('span', { className: 'dcw-thumb' }),
        ),
      );
    }

    let fallbackT = (key) => key;

    function apply(ctx) {
      const bound = ctx.locale.bind(NS);
      fallbackT = bound;

      ctx.effect(() => ctx.locale.register(NS, LOCALES), 'chat-width: dictionaries');

      ctx.effect(() => {
        const tag = document.createElement('style');
        tag.dataset.plugin = 'dsh-chat-width';
        tag.dataset.pluginCss = 'dsh-chat-width/chat-width.css';
        tag.textContent = STYLES;
        document.head.appendChild(tag);
        return () => {
          tag.remove();
        };
      }, 'chat-width: styles');

      ctx.effect(() => {
        publishFullWidth(readFullWidth());
        return () => {
          document.documentElement.removeAttribute(ROOT_ATTRIBUTE);
        };
      }, 'chat-width: stored mode');

      ctx.slots.inject('settings.general.item', () =>
        ctx.slots.register(
          { name: 'settings.general.item', id: ROW_ID, order: 21, locale: NS },
          ChatWidthRow,
        ),
      );
    }

    return { inject: ['slots', 'locale'], apply };
  },
});
