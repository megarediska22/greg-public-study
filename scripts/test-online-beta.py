"""Verify built Stable and Beta artifacts on the same origin in disposable Chromium storage."""
import argparse
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory
from threading import Thread

from playwright.sync_api import expect, sync_playwright

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--chrome', default='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
args = parser.parse_args()

stable = {
    'gps.progress.v1': json.dumps({
        'version': 1, 'curriculumVersion': 2, 'completedLessons': [], 'lessons': {},
        'lastVisited': {'lessonId': 'to-be', 'stepId': 'intro'},
    }),
    'gps.adaptive.v1': '{"stable":"adaptive bytes"}',
    'gps.progress.v1.backup.1': 'stable progress copy',
    'gps.adaptive.v1.recovery.latest': 'stable adaptation copy',
    'gps.qa.progress.v1': 'local QA progress copy',
    'gps.qa.theme.v1': 'light',
    'gps.theme.v1': 'dark',
}


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def trace(context):
    context.add_init_script(f"""(() => {{
      const read = Storage.prototype.getItem, write = Storage.prototype.setItem;
      for (const [key, value] of Object.entries({json.dumps(stable)}))
        if (read.call(localStorage, key) === null) write.call(localStorage, key, value);
      window.testIo = [];
      window.testLocks = [];
      const request = navigator.locks.request.bind(navigator.locks);
      navigator.locks.request = (key, ...args) => {{ window.testLocks.push(key); return request(key, ...args); }};
      window.testRead = key => read.call(localStorage, key);
      window.testWrite = (key, value) => write.call(localStorage, key, value);
      Storage.prototype.getItem = function(key) {{
        if (this === localStorage) window.testIo.push(['read', key]);
        return read.call(this, key);
      }};
      Storage.prototype.setItem = function(key, value) {{
        if (this === localStorage) window.testIo.push(['write', key]);
        return write.call(this, key, value);
      }};
    }})();""")


def click(page, label):
    page.get_by_role('button', name=label, exact=True).click()


def assert_beta_io(page):
    for _, key in page.evaluate('testIo'):
        assert key.startswith('gps.beta.'), key
    assert all(key.startswith('gps.beta.') for key in page.evaluate('testLocks'))
    assert page.evaluate('keys => Object.fromEntries(keys.map(key => [key, testRead(key)]))', list(stable)) == stable


def theme_before_react(context, beta, regular):
    page = context.new_page()
    page.route('**/assets/*.js', lambda route: route.abort())
    page.goto(beta, wait_until='domcontentloaded')
    assert page.locator('html').get_attribute('data-theme') == 'light'
    assert_beta_io(page)
    page.evaluate("testWrite('gps.beta.theme.v1', 'dark'); testWrite('gps.theme.v1', 'light')")
    page.reload(wait_until='domcontentloaded')
    assert page.locator('html').get_attribute('data-theme') == 'dark'
    assert not any(key == 'gps.theme.v1' for _, key in page.evaluate('testIo'))
    page.goto(regular, wait_until='domcontentloaded')
    assert page.locator('html').get_attribute('data-theme') == 'light'
    assert page.evaluate("testRead('gps.beta.theme.v1')") == 'dark'
    page.close()


def browser_checks(browser, regular, beta):
    ctx = browser.new_context()
    trace(ctx)
    theme_before_react(ctx, beta, regular)
    ctx.close()

    ctx = browser.new_context()
    trace(ctx)
    page = ctx.new_page()
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(beta + '#/')
    expect(page.get_by_role('link', name='Начать учиться', exact=True)).to_be_visible()
    expect(page.get_by_role('link', name='Подобрать учебный старт', exact=True)).to_be_visible()
    assert page.evaluate("testRead('gps.beta.progress.v1')") is None
    assert page.evaluate("testRead('gps.beta.adaptive.v1')") is None
    click(page, 'Включить тёмную тему')
    page.wait_for_function("testRead('gps.beta.theme.v1') === 'dark'")
    assert 'gps.beta.theme.v1' in page.evaluate('testLocks')
    assert_beta_io(page)

    page.goto(beta + '?qa=1&adaptive=1#/diagnostic')
    click(page, 'Начать диагностику')
    first = page.locator('.exercise-prompt')
    expect(first).to_be_visible()
    expect(page.locator('.qa-bar')).to_have_count(0)
    page.wait_for_function("""JSON.parse(testRead('gps.beta.adaptive.v1')).data.fastPlacement.session.presented.length === 1""")
    assert 'gps.beta.adaptive.v1' in page.evaluate('testLocks')
    assert page.evaluate("JSON.parse(testRead('gps.beta.adaptive.v1')).data.session") is None
    page.reload()
    click(page, 'Продолжить диагностику')
    expect(first).to_be_visible()
    click(page, 'Пропустить')
    page.wait_for_function("""JSON.parse(testRead('gps.beta.adaptive.v1')).data.fastPlacement.session.observations.length === 1""")
    assert_beta_io(page)

    stale = ctx.new_page()
    stale.goto(beta + '#/course/a1')
    expect(stale.get_by_role('button', name='Сбросить прогресс', exact=True)).to_be_visible()
    page.goto(beta + '#/lesson/bp-a1-01/intro')
    expect(page.locator('.lesson-heading')).to_be_visible()
    page.wait_for_function("JSON.parse(testRead('gps.beta.progress.v1')).lastVisited.lessonId === 'bp-a1-01'")
    assert 'gps.beta.progress.v1' in page.evaluate('testLocks')
    stale.goto(beta + '#/lesson/bp-pre-01/intro')
    expect(stale.get_by_text('В другой вкладке изменился прогресс.', exact=False)).to_be_visible()
    assert stale.evaluate("JSON.parse(testRead('gps.beta.progress.v1')).lastVisited.lessonId") == 'bp-a1-01'
    assert_beta_io(stale)
    stale.close()

    page.goto(beta + '#/course/a1')
    click(page, 'Сбросить прогресс')
    click(page, 'Да, сбросить')
    page.wait_for_function("""testRead('gps.beta.progress.v1') &&
      JSON.parse(testRead('gps.beta.progress.v1')).lastVisited === null &&
      !JSON.parse(testRead('gps.beta.adaptive.v1')).data.fastPlacement""")
    expect(page.get_by_role('button', name='Сбросить прогресс', exact=True)).to_be_visible()
    assert page.evaluate("Object.keys(localStorage).some(key => key.startsWith('gps.beta.progress.v1.backup.'))")
    assert page.evaluate("testRead('gps.beta.adaptive.v1.recovery.latest') !== null")
    assert page.evaluate("testRead('gps.beta.theme.v1')") == 'dark'
    assert_beta_io(page)

    page.evaluate("testWrite('gps.beta.adaptive.v1', '{damaged')")
    page.reload()
    click(page, 'Восстановить данные')
    click(page, 'Создать резервную копию и начать заново')
    page.wait_for_function("""Object.keys(localStorage).some(key =>
      key.startsWith('gps.beta.adaptive.v1.recovery.') && testRead(key) === '{damaged')""")
    expect(page.get_by_role('button', name='Сбросить прогресс', exact=True)).to_be_visible()
    assert_beta_io(page)

    beta_values = page.evaluate("Object.fromEntries(Object.keys(localStorage).filter(k=>k.startsWith('gps.beta.')).map(k=>[k,testRead(k)]))")
    page.goto(regular + '?qa=1&adaptive=1#/diagnostic')
    expect(page.get_by_role('heading', name='Здесь пока нет страницы', exact=True)).to_be_visible()
    assert all(not key.startswith('gps.beta.') for _, key in page.evaluate('testIo'))
    assert page.evaluate('keys => Object.fromEntries(keys.map(k => [k,testRead(k)]))', list(beta_values)) == beta_values
    assert not errors, errors
    ctx.close()


with TemporaryDirectory(prefix='gps-beta-test-') as temp:
    stable_dir = Path(temp) / 'greg-public-study'
    stable_dir.mkdir()
    for filename in ('index.html', 'assets'):
        (stable_dir / filename).symlink_to(root / 'dist' / filename)
    (stable_dir / 'beta').symlink_to(root / 'dist-beta', target_is_directory=True)
    with ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=temp)) as server:
        thread = Thread(target=server.serve_forever, daemon=True)
        thread.start()
        regular = f'http://127.0.0.1:{server.server_port}/greg-public-study/'
        try:
            with sync_playwright() as playwright:
                browser = playwright.chromium.launch(headless=True, executable_path=args.chrome)
                browser_checks(browser, regular, regular + 'beta/')
                browser.close()
        finally:
            server.shutdown()
            thread.join()
print('PASS same-origin Stable/Beta, early theme, no Stable/QA access from Beta, Fast draft, Web Locks, stale write, reset and exact recovery')
