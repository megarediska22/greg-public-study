"""Focused real-bank Fast Placement UI checks with isolated browser storage."""
import argparse
import json
import subprocess
from playwright.sync_api import sync_playwright, expect

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--dev', default='http://127.0.0.1:5198')
parser.add_argument('--only-upper', action='store_true')
args = parser.parse_args()
base = args.dev.rstrip('/') + '/?adaptive=1#'
data = json.loads(subprocess.check_output(['node', '--input-type=module', '-e',
    "import {adaptivePilot as a} from './src/content/adaptivePilot.ts'; console.log(JSON.stringify(a.fastBank));"], text=True))
items = {item['id']: item for form in data['forms'] for pool in form['slots'].values() for item in pool}
progress = json.dumps({'version':1,'curriculumVersion':2,'completedLessons':[],
    'lessons':{'to-be':{'completedSteps':['intro'],'answers':{}}},
    'lastVisited':{'lessonId':'to-be','stepId':'theory'}})
def state(page):
    return page.evaluate("JSON.parse(localStorage.getItem('gps.adaptive.v1')).data.fastPlacement.session")
def click(page, text):
    page.get_by_role('button', name=text, exact=True).click()
def answer(page, right=True):
    expect(page.locator('.exercise-prompt')).to_be_visible()
    before = state(page)
    pin = before['presented'][-1]
    item = items[pin['itemId']]
    expect(page.locator('.exercise-prompt')).to_have_text(item['prompt'])
    assert page.locator('input[type=text]').count() == 0
    if item['format'] == 'cards':
        sequence = item['acceptedSequences'][0]
        available = list(item['tokens'])
        for word in sequence:
            token = next(t for t in available if t.get('equivalent',t['label']) == word)
            available.remove(token)
            bank = page.get_by_role('group', name='Доступные слова', exact=True)
            bank.get_by_role('button',name=token['label'],exact=True).first.click()
            page.wait_for_function("n => JSON.parse(localStorage.getItem('gps.adaptive.v1')).data.fastPlacement.session.selection?.tokenIds.length===n", arg=len(item['tokens'])-len(available))
    else:
        option = next(o for o in item['options'] if (o['id'] in item['acceptedOptionIds']) == right)
        page.get_by_role('radio',name=option['label'],exact=True).click()
        page.wait_for_function("id => JSON.parse(localStorage.getItem('gps.adaptive.v1')).data.fastPlacement.session.selection?.optionId===id",arg=option['id'])
    expect(page.get_by_role('button',name='Проверить ответ',exact=True)).to_be_enabled()
    click(page,'Проверить ответ')
    page.wait_for_function("n => {let s=JSON.parse(localStorage.getItem('gps.adaptive.v1')).data.fastPlacement.session;return s.presented.length>n||s.status==='finished'}",arg=len(before['presented']))

checks=[]
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
    for width in ([] if args.only_upper else [360,1280]):
        for theme in ['light','dark']:
            ctx=browser.new_context(viewport={'width':width,'height':850},has_touch=width==360)
            ctx.add_init_script(f"""if(!sessionStorage.getItem('seed')) {{
                localStorage.setItem('gps.progress.v1', {json.dumps(progress)});
                localStorage.setItem('gps.theme.v1','{theme}');
                sessionStorage.setItem('seed','1');
            }}""")
            page=ctx.new_page()
            errors=[]
            page.on('pageerror',lambda e: errors.append(str(e)))
            page.goto(base+'/')
            resume=page.get_by_role('link',name='Продолжить обучение',exact=True)
            expect(resume).to_have_attribute('href','#/lesson/to-be/theory')
            page.get_by_role('link',name='Подобрать учебный старт').click()
            click(page,'Начать диагностику')
            expect(page.locator('.exercise-prompt')).to_be_visible()
            answer(page);answer(page)
            expect(page.get_by_role('group',name='Доступные слова')).to_be_visible()
            card=page.get_by_role('group',name='Доступные слова').get_by_role('button').first
            card.focus();card.press('Enter')
            page.wait_for_function("JSON.parse(localStorage.getItem('gps.adaptive.v1')).data.fastPlacement.session.selection?.tokenIds.length===1")
            selected=state(page)['selection']
            page.reload()
            click(page,'Продолжить диагностику')
            assert state(page)['selection']==selected
            click(page,'Выйти и продолжить позже')
            expect(page.get_by_role('heading',name='У вас есть незавершённая диагностика')).to_be_focused()
            click(page,'Продолжить диагностику')
            selected_group=page.get_by_role('group',name='Собранный ответ',exact=True)
            selected_group.get_by_role('button',name='Убрать',exact=False).first.click()
            page.wait_for_function("JSON.parse(localStorage.getItem('gps.adaptive.v1')).data.fastPlacement.session.selection.tokenIds.length===0")
            bank=page.get_by_role('group',name='Доступные слова',exact=True)
            for n in [1,2]:
                bank.get_by_role('button').first.click()
                page.wait_for_function("n=>JSON.parse(localStorage.getItem('gps.adaptive.v1')).data.fastPlacement.session.selection?.tokenIds.length===n",arg=n)
            old=state(page)['selection']['tokenIds']
            selected_group.get_by_role('button',name='влево',exact=False).last.click()
            page.wait_for_function("ids=>JSON.stringify(JSON.parse(localStorage.getItem('gps.adaptive.v1')).data.fastPlacement.session.selection.tokenIds)===JSON.stringify(ids)",arg=old[::-1])
            assert len(state(page)['observations'])==2
            click(page,'Пропустить')
            page.wait_for_function("JSON.parse(localStorage.getItem('gps.adaptive.v1')).data.fastPlacement.session.observations.length===3")
            click(page,'Посмотреть предварительный результат')
            expect(page.get_by_role('heading',name='Предварительный результат')).to_be_focused()
            expect(page.get_by_text('Пока недостаточно данных для точной рекомендации.',exact=True)).to_be_visible()
            assert page.evaluate("localStorage.getItem('gps.progress.v1')")==progress
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
            page.get_by_role('link',name='Пройти другой вариант').click()
            click(page,'Начать диагностику')
            expect(page.locator('.exercise-prompt')).to_be_visible()
            answer(page,False);answer(page,False)
            expect(page.get_by_role('heading',name='Предварительный результат')).to_be_visible()
            assert len(state(page)['presented'])==2
            expect(page.get_by_role('button',name='Начать с этого урока')).to_be_visible()
            page.goto(base+'/')
            expect(page.get_by_role('link',name='Пройти диагностику снова')).to_have_count(0)
            resume=page.get_by_role('link',name='Продолжить обучение',exact=True)
            resume.focus();resume.press('Enter')
            expect(page.locator('.lesson-heading')).to_be_visible()
            assert page.url.endswith('/lesson/to-be/theory')
            assert not errors,errors
            checks.append([width,theme,'cards/edit/reload/skip/early/exhaustion/resume'])
            ctx.close()

    for width, theme in [(360,'dark'),(1280,'light')]:
        ctx=browser.new_context(viewport={'width':width,'height':850})
        ctx.add_init_script(f"localStorage.setItem('gps.theme.v1','{theme}')")
        page=ctx.new_page()
        page.goto(base+'/diagnostic')
        click(page,'Начать диагностику')
        expect(page.locator('.exercise-prompt')).to_be_visible()
        for n in range(15):
            if state(page)['status']=='finished': break
            answer(page)
        expect(page.get_by_role('heading',name='Предварительный результат')).to_be_visible()
        assert len(state(page)['presented'])==10

        assert page.evaluate("JSON.parse(localStorage.getItem('gps.adaptive.v1')).data.grants.length")==0
        click(page,'Начать с этого урока')
        expect(page.locator('.lesson-heading')).to_be_visible()
        assert '/lesson/unit-062/' in page.url
        page.reload()
        expect(page.locator('.lesson-heading')).to_be_visible()
        assert page.evaluate("JSON.parse(localStorage.getItem('gps.adaptive.v1')).data.grants.length")==1
        page.goto(base+'/diagnostic/new')
        click(page,'Начать диагностику')
        expect(page.locator('.exercise-prompt')).to_be_visible()
        for n in range(15):
            if state(page)['status']=='finished': break
            answer(page)
        expect(page.get_by_role('heading',name='Предварительный результат')).to_be_visible()
        assert any(items[pin['itemId']]['format']=='cards' and len(set(t['label'].lower() for t in items[pin['itemId']]['tokens']))<len(items[pin['itemId']]['tokens']) for pin in state(page)['presented'])
        checks.append([width,theme,'both 10-item upper routes, duplicate cards, explicit single grant'])
        print(checks[-1],flush=True)
        ctx.close()
    browser.close()
print(json.dumps(checks,ensure_ascii=False))
