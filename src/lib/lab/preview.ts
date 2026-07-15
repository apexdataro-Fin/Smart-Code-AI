/** Inline a small HTML wrapper for a JS/TS preview that captures console output. */
export function consoleOutputForHtml(code: string): string {
  const shim = `
    <script>
      (function () {
        var send = function (level, args) {
          var text = args.map(function (a) {
            if (typeof a === 'string') return a;
            try { return JSON.stringify(a); } catch (e) { return String(a); }
          }).join(' ');
          try {
            parent.postMessage({ type: 'console', level: level, text: text, ts: Date.now() }, '*');
          } catch (e) {}
        };
        ['log','info','warn','error'].forEach(function (level) {
          var orig = console[level];
          console[level] = function () {
            send(level, Array.prototype.slice.call(arguments));
            try { return orig.apply(console, arguments); } catch (e) {}
          };
        });
        window.addEventListener('error', function (ev) {
          send('error', [ev.message || 'خطأ']);
        });
      })();
    </script>`;
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"></head><body><div id="app"></div>${shim}<script>\ntry {\n${code}\n} catch (e) { parent.postMessage({ type: 'console', level: 'error', text: (e && e.message) || String(e), ts: Date.now() }, '*'); throw e; }\n<\/script></body></html>`;
}
