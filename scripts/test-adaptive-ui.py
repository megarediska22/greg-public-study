"""Run Stage 06 browser checks in disposable Chromium contexts."""
import argparse
from playwright.sync_api import sync_playwright, expect

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--dev', default='http://127.0.0.1:5178')
parser.add_argument('--production', default='http://127.0.0.1:4178/greg-public-study/')
parser.add_argument('--chrome', default='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
args = parser.parse_args()
fixture = args.dev + '/tests/fixtures/adaptive-ui.html'
errors = []
checks = []


def page_for(browser, width=360, dark=False, seed=None):
    ctx = browser.new_context(viewport={'width': width, 'height': 850}, is_mobile=width == 360, has_touch=width == 360)
    theme = 'dark' if dark else 'light'
    ctx.add_init_script(f"localStorage.setItem('gps.theme.v1', '{theme}')")
    if seed:
        import json
        ctx.add_init_script(f"""if (!sessionStorage.getItem('seeded')) {{
            for (const [key,value] of Object.entries({json.dumps(seed)})) localStorage.setItem(key,value);
            sessionStorage.setItem('seeded','1')
        }}""")
    page = ctx.new_page()
    page.on('pageerror', lambda err: errors.append(str(err)))
    return ctx, page


def button(page, name):
    return page.get_by_role('button', name=name, exact=True)


def heading(page, name):
    expect(page.get_by_role('heading', name=name, exact=True)).to_be_visible()


def start(page):
    button(page, 'Начать диагностику').click()
    expect(page.get_by_text('Задание 1 · Буквы и числа', exact=True)).to_be_visible()


def no_leak(page):
    expect(page.get_by_text('Fixture key', exact=True)).to_have_count(0)
    expect(page.get_by_text('Образец ответа', exact=False)).to_have_count(0)
    expect(page.get_by_role('button', name='Подсказка', exact=True)).to_have_count(0)


def width_ok(page):
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), page.url


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True, executable_path=args.chrome)
    for width in (360, 1280):
        for dark in (False, True):
            ctx, page = page_for(browser, width, dark)
            page.goto(fixture + '#/start')
            heading(page, 'Начать с нуля')
            expect(button(page, 'Подготовка к A1')).to_be_enabled()
            width_ok(page)
            page.get_by_role('link', name='Подобрать учебный старт').click()
            start(page)
            no_leak(page)
            width_ok(page)
            page.get_by_role('radio', name='west').check()
            button(page, 'Ответить').click()
            field = page.get_by_role('textbox', name='Ваш ответ')
            expect(field).to_be_visible()
            expect(field).to_have_attribute('enterkeyhint', 'send')
            field.press('Enter')
            expect(page.get_by_text('Задание 2 · Буквы и числа', exact=True)).to_be_visible()
            field.fill('quartz')
            field.press('Enter')
            expect(page.get_by_text('Задание 3 · Буквы и числа', exact=True)).to_be_visible()
            button(page, 'Выйти и продолжить позже').click()
            heading(page, 'У вас есть незавершённая диагностика')
            expect(page.get_by_role('heading', name='У вас есть незавершённая диагностика')).to_be_focused()
            page.reload()
            heading(page, 'У вас есть незавершённая диагностика')
            button(page, 'Продолжить диагностику').click()
            expect(page.get_by_text('Задание 3 · Буквы и числа', exact=True)).to_be_visible()
            no_leak(page)
            width_ok(page)
            ctx.close()
            checks.append((width, dark, 'entry, keyboard, pause, reload, resume'))

    ctx, page = page_for(browser, 1280)
    page.goto(fixture + '#/start')
    button(page, 'Сразу к A1').click()
    expect(page).to_have_url(fixture + '#/lesson/bp-a1-01/intro')
    button(page, 'Прочитано, далее').click()
    expect(page).to_have_url(fixture + '#/lesson/bp-a1-01/theory')
    page.goto(fixture + '#/diagnostic')
    start(page)
    for _ in range(28):
        if button(page, 'Посмотреть результат').count():
            button(page, 'Посмотреть результат').click()
            break
        expect(button(page, 'Ответить')).to_be_visible()
        previous = page.locator('fieldset.exercise-card').element_handle()
        radio = page.get_by_role('radio', name='west')
        if radio.count():
            radio.check()
            button(page, 'Ответить').click()
        else:
            page.get_by_role('textbox', name='Ваш ответ').fill('quartz')
            button(page, 'Ответить').click()
        page.wait_for_function('(card) => !card.isConnected', arg=previous)
    heading(page, 'Результат диагностики')
    width_ok(page)
    raw = page.evaluate("JSON.parse(localStorage.getItem('gps.adaptive.v1')).data")
    recommendation = raw['results'][-1]['placement']['start']['lessonId']
    assert recommendation != 'bp-a1-01'
    assert all(grant['lessonId'] != recommendation for grant in raw['grants'])
    page.goto(fixture + '#/lesson/' + recommendation + '/intro')
    heading(page, 'Урок пока заблокирован')
    page.goto(fixture + '#/diagnostic')
    button(page, 'Начать с этого урока').click()
    expect(page.locator('.lesson-heading')).to_be_visible()
    assert '/lesson/' + recommendation + '/' in page.url
    page.reload()
    expect(page.locator('.lesson-heading')).to_be_visible()
    page.goto(fixture + '#/lesson/bp-a1-01/theory')
    expect(page.locator('.lesson-heading')).to_be_visible()
    page.goto(fixture + '#/diagnostic/new')
    start(page)
    button(page, 'Не знаю').click()
    expect(page.get_by_text('Задание 2 · Буквы и числа', exact=True)).to_be_visible()
    button(page, 'Пропустить').click()
    expect(page.get_by_text('Задание 3 · Буквы и числа', exact=True)).to_be_visible()
    button(page, 'Выйти и продолжить позже').click()
    button(page, 'Завершить сейчас').click()
    heading(page, 'Результат диагностики')
    expect(page.get_by_role('heading', name='Результат диагностики')).to_be_focused()
    expect(page.get_by_text('Данных пока мало.', exact=True)).to_be_visible()
    button(page, 'Продолжить с моего урока').click()
    expect(page).to_have_url(fixture + '#/lesson/bp-a1-01/theory')
    ctx.close()
    checks.append('ordinary A1, explicit later grant, old progress, retake, neutral responses, decline')

    ctx, page = page_for(browser)
    page.goto(fixture + '#/diagnostic')
    start(page)
    page.goto(fixture + '?incompatible#/diagnostic')
    heading(page, 'Задания обновились')
    expect(button(page, 'Начать новую диагностику')).to_be_enabled()
    button(page, 'Начать новую диагностику').click()
    expect(page.get_by_text('Задание 1 · Буквы и числа', exact=True)).to_be_visible()
    ctx.close()
    checks.append('incompatible draft and explicit restart')

    ctx, page = page_for(browser, seed={'gps.adaptive.v1': '{damaged'})
    page.goto(fixture + '#/diagnostic')
    expect(page.get_by_text('Сохранённые данные диагностики повреждены', exact=False)).to_be_visible()
    button(page, 'Восстановить данные').click()
    button(page, 'Создать резервную копию и начать заново').click()
    expect(button(page, 'Начать диагностику')).to_be_enabled()
    assert page.evaluate("""Object.keys(localStorage).some(key =>
        key.startsWith('gps.adaptive.v1.recovery.') && localStorage.getItem(key)==='{damaged')""")
    ctx.close()
    checks.append('protected storage and confirmed exact-byte recovery')

    ctx, page = page_for(browser)
    page.goto(fixture + '#/diagnostic')
    start(page)
    other = ctx.new_page()
    other.goto(fixture + '#/diagnostic')
    heading(other, 'У вас есть незавершённая диагностика')
    button(page, 'Не знаю').click()
    expect(page.get_by_text('Задание 2 · Буквы и числа', exact=True)).to_be_visible()
    button(other, 'Продолжить диагностику').click()
    expect(other.get_by_text('Прогресс изменился в другой вкладке.', exact=True)).to_be_visible()
    button(other, 'Перечитать данные').click()
    button(other, 'Продолжить диагностику').click()
    expect(other.get_by_text('Задание 2 · Буквы и числа', exact=True)).to_be_visible()
    ctx.close()
    checks.append('two tabs and explicit reread')

    ctx, page = page_for(browser)
    page.goto(args.dev + '/?adaptive=1#/diagnostic')
    expect(button(page, 'Начать диагностику')).to_be_enabled()
    page.goto(args.dev + '/?adaptive=1#/checkpoint/CP-061')
    heading(page, 'Контрольная пока недоступна')
    ctx.close()
    checks.append('installed diagnostic bank and locked checkpoint before entitlement')

    ctx, page = page_for(browser, 360, True)
    page.goto(fixture + '?checkpoint#/checkpoint/CP-061')
    heading(page, 'Контрольная')
    button(page, 'Начать контрольную').click()
    expect(page.get_by_text('Задание 1 из 2', exact=True)).to_be_visible()
    button(page, 'Пропустить').click()
    expect(page.get_by_text('Задание 2 из 2', exact=True)).to_be_visible()
    button(page, 'Не знаю').click()
    expect(page.get_by_text('Попытка завершена.', exact=True)).to_be_visible()
    assert '/checkpoint/' in page.url
    button(page, 'Продолжить с опорой').click()
    expect(page).to_have_url(fixture + '?checkpoint#/lesson/unit-062/intro')
    expect(page.locator('.lesson-heading')).to_be_visible()
    ctx.close()
    checks.append('approved-item adapter with test mapping and explicit supported checkpoint grant')


    ctx, page = page_for(browser)
    page.goto(args.production.rstrip('/') + '/?adaptive=1#/diagnostic')
    heading(page, 'Здесь пока нет страницы')
    assert page.evaluate("localStorage.getItem('gps.adaptive.v1') === null")
    page.get_by_role('link', name='К курсу A1').click()
    expect(page.locator('.lesson-card')).to_have_count(140)
    expect(page.get_by_role('link', name='Подобрать учебный старт')).to_have_count(0)
    ctx.close()
    checks.append('production feature off and all 140 lessons')
    browser.close()

assert not errors, errors
print(f'{len(checks)} browser scenarios passed; no uncaught page errors.')
for check in checks:
    print(check)
