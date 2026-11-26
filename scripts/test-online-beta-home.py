"""Check the built Beta landing without query flags in isolated Chromium profiles."""
import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

parser=argparse.ArgumentParser(description=__doc__)
parser.add_argument('--url',default='http://127.0.0.1:4211/greg-public-study/beta/')
args=parser.parse_args()
copy='Экспериментальная версия. Диагностика помогает подобрать подходящий урок, но не является официальным определением уровня английского'
results=[]
Path('.tmp/beta-home').mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
    for width in [360,1280]:
        for theme in ['light','dark']:
            ctx=browser.new_context(viewport={'width':width,'height':850},has_touch=width==360)
            ctx.add_init_script(f"localStorage.setItem('gps.beta.theme.v1','{theme}');localStorage.setItem('gps.theme.v1','stable-sentinel')")
            page=ctx.new_page()
            errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.goto(args.url)
            diagnostic=page.get_by_role('link',name='Подобрать учебный старт',exact=True)
            expect(diagnostic).to_be_visible()
            expect(diagnostic).to_have_attribute('href','#/diagnostic')
            expect(page.get_by_text(copy,exact=True)).to_be_visible()
            expect(page.locator('html')).to_have_attribute('data-theme',theme)
            assert diagnostic.bounding_box()['y']+diagnostic.bounding_box()['height'] <= 850
            assert page.get_by_role('link',name='Начать обучение без диагностики').bounding_box()['y'] < 850
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            page.screenshot(path=f'.tmp/beta-home/{width}-{theme}.png')
            diagnostic.focus()
            expect(diagnostic).to_be_focused()
            diagnostic.press('Enter')
            start=page.get_by_role('button',name='Начать диагностику',exact=True)
            expect(start).to_be_visible()
            start.click()
            expect(page.locator('.exercise-prompt')).to_be_visible()
            assert page.locator('input[type=text]').count()==0
            assert page.evaluate("localStorage.getItem('gps.theme.v1')")== 'stable-sentinel'
            ctx.close()
            ctx=browser.new_context(viewport={'width':width,'height':850})
            page=ctx.new_page()
            page.goto(args.url)
            page.get_by_role('link',name='Начать обучение без диагностики').click()
            expect(page.locator('.lesson-card')).to_have_count(140)
            page.get_by_role('link',name='Начать A1',exact=True).click()
            expect(page.locator('.lesson-heading')).to_be_visible()
            assert page.evaluate("localStorage.getItem('gps.beta.adaptive.v1')") is None
            page.get_by_role('button',name='Прочитано, далее',exact=True).click()
            expect(page).to_have_url(args.url+'#/lesson/bp-a1-01/theory')
            page.wait_for_function("JSON.parse(localStorage.getItem('gps.beta.progress.v1'))?.lastVisited?.stepId === 'theory'")
            page.goto(args.url)
            resume=page.get_by_role('link',name='Продолжить обучение',exact=True)
            expect(resume).to_have_class('button button-primary')
            expect(resume).to_have_attribute('href','#/lesson/bp-a1-01/theory')
            expect(page.get_by_role('link',name='Подобрать учебный старт')).to_have_class('button button-secondary')
            page.reload()
            expect(resume).to_have_attribute('href','#/lesson/bp-a1-01/theory')
            assert not errors,errors
            ctx.close()
            results.append([width,theme,'diagnostic entry and ordinary learning with restored resume'])
    browser.close()
print(json.dumps(results,ensure_ascii=False))
