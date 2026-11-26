"""Exercise the integrated course and v2 pilot with isolated Playwright storage."""
import argparse
import json
from pathlib import Path
import subprocess
import traceback

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--dev', default='http://127.0.0.1:5193/')
parser.add_argument('--production', default='http://127.0.0.1:4193/greg-public-study/')
parser.add_argument('--chrome', default='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
parser.add_argument('--output', default='.tmp/adaptive-final-qa.json')
parser.add_argument('--case', action='append', help='Rerun only the named cases')
args = parser.parse_args()
data = json.loads(subprocess.check_output(['node', '--experimental-strip-types', 'scripts/adaptive-final-qa-data.mjs'], cwd=ROOT, text=True))
pilot = args.dev.rstrip('/') + '/?adaptive=1#'
public = args.production.rstrip('/') + '/#'
ADAPTIVE = 'gps.adaptive.v1'
PROGRESS = 'gps.progress.v1'
results = {}
errors = []


def snapshot(page, key=ADAPTIVE):
    return page.evaluate('key => JSON.parse(localStorage.getItem(key))', key)


def state(page):
    envelope = snapshot(page)
    return envelope['data'] if envelope else None


def button(page, name):
    return page.get_by_role('button', name=name, exact=True)


def heading(page, name):
    expect(page.get_by_role('heading', name=name, exact=True)).to_be_visible()


def expect_lesson(page, id):
    expect(page.locator('.lesson-heading h1')).to_contain_text(data['lessons'][id])
    assert '/lesson/' + id + '/' in page.url


def locked(page, id):
    page.goto(pilot + '/lesson/' + id + '/intro')
    heading(page, 'Урок пока заблокирован')


def start_diagnostic(page):
    button(page, 'Начать диагностику').click()
    expect(page.get_by_text('Задание 1 · Буквы и числа', exact=True)).to_be_visible()


def enter(page, route='/diagnostic'):
    page.goto(pilot + route)
    start_diagnostic(page)


def question_answer(page, question, provider, mode):
    if mode in ('skip', 'unknown'):
        button(page, 'Пропустить' if mode == 'skip' else 'Не знаю').click()
        return
    value = question['acceptedAnswers'][0] if mode == 'right' else (
        next(option for option in question['options'] if option not in question['acceptedAnswers'])
        if question['type'] == 'choice' else 'zz-invalid-test-answer')
    if question['type'] == 'choice':
        provider.get_by_role('radio', name=value, exact=True).check()
    else:
        provider.get_by_role('textbox').fill(value)


def next_diagnostic(page, mode):
    current = state(page)['session']
    index = current['cursor']
    item = data['items'][current['queue'][index]['itemId']]
    card = page.locator('fieldset.exercise-card')
    expect(card.locator('.exercise-prompt')).to_have_text(item['prompt'])
    expect(card.locator('.answer-feedback')).to_have_count(0)
    expect(card.get_by_role('button', name='Подсказка', exact=True)).to_have_count(0)
    response = mode(item)
    question_answer(page, item, card, response)
    if response not in ('skip', 'unknown'):
        button(page, 'Ответить').click()
    page.wait_for_function("""([key, cursor]) => JSON.parse(localStorage.getItem(key)).data.session.cursor === cursor""",
                           arg=[ADAPTIVE, index + 1])


def diagnostic(page, mode, upper=False):
    for _ in range(30):
        current = state(page)['session']
        if current['status'] == 'finished':
            heading(page, 'Результат диагностики')
            return state(page)
        if current['status'] == 'offer-upper':
            button(page, 'Ещё несколько заданий' if upper else 'Посмотреть результат').click()
            page.wait_for_function("key => JSON.parse(localStorage.getItem(key)).data.session.status !== 'offer-upper'", arg=ADAPTIVE)
            continue
        assert current['status'] == 'active', current['status']
        next_diagnostic(page, mode)
    raise AssertionError('Exceeded the diagnostic question budget')


def recommendation(page, saved, id):
    assert saved['results'][-1]['placement']['start']['lessonId'] == id
    heading(page, f"Рекомендуем «{data['lessons'][id]}»")


def accept(page, target, initially_locked=True):
    before = state(page)['grants']
    if initially_locked:
        locked(page, target)
    page.goto(pilot + '/diagnostic')
    button(page, 'Начать с этого урока').click()
    expect_lesson(page, target)
    assert [item['lessonId'] for item in state(page)['grants'][len(before):]] == [target]
    assert target not in (snapshot(page, PROGRESS) or {}).get('completedLessons', [])
    page.reload()
    expect_lesson(page, target)


def start_and_early(page):
    page.goto(pilot + '/')
    page.get_by_role('link', name='Начать учиться', exact=True).click()
    heading(page, 'Начать с нуля')
    expect(button(page, 'Подготовка к A1')).to_be_enabled()
    assert snapshot(page) is None and snapshot(page, PROGRESS) is None
    page.get_by_role('link', name='Подобрать учебный старт', exact=True).click()
    start_diagnostic(page)
    saved = diagnostic(page, lambda item: 'wrong' if item['group'] == 'K-P-LAT' else 'skip')
    recommendation(page, saved, 'bp-pre-01')
    assert saved['session']['cursor'] == 4 and saved['session']['reason'] == 'early-gap'
    accept(page, 'bp-pre-01', initially_locked=False)
    page.goto(pilot + '/lesson/bp-a1-01/intro')
    expect_lesson(page, 'bp-a1-01')


def begin_a1(page):
    page.goto(pilot + '/start')
    button(page, 'Сразу к A1').click()
    expect_lesson(page, 'bp-a1-01')
    assert state(page)['session'] is None
    page.reload()
    expect_lesson(page, 'bp-a1-01')


def early_a1(page):
    enter(page)
    saved = diagnostic(page, lambda item: 'right' if item['block'] == 'D0' else 'unknown')
    recommendation(page, saved, 'bp-a1-01')
    expect(page.get_by_role('heading', name='Пока мало данных')).to_be_visible()


def late_a1(page):
    enter(page)
    saved = diagnostic(page, lambda item: 'right' if item['group'] in {'K-P-LAT', 'K-P-NUM', 'K-A1-BE', 'K-A1-ASK'} else 'unknown')
    recommendation(page, saved, 'hours-and-signs')
    accept(page, 'hours-and-signs')
    locked(page, 'directions-on-foot')
    locked(page, 'do-does')
    page.goto(pilot + '/lesson/bp-a1-01/intro')
    expect_lesson(page, 'bp-a1-01')


def transition_a1(page):
    enter(page)
    saved = diagnostic(page, lambda item: 'unknown' if item['group'].startswith('K-A2-') else 'right')
    recommendation(page, saved, 'unit-042')
    accept(page, 'unit-042')
    locked(page, 'unit-043')


def a2(page):
    enter(page)
    saved = diagnostic(page, lambda _: 'right')
    recommendation(page, saved, 'unit-062')
    accept(page, 'unit-062')
    locked(page, 'unit-063')


def gap(page):
    enter(page)
    saved = diagnostic(page, lambda item: 'wrong' if item['group'] == 'K-A1-ASK' else 'right')
    recommendation(page, saved, 'do-does')
    expect(page.get_by_text('возникали трудности', exact=False)).to_be_visible()
    accept(page, 'do-does')
    locked(page, 'unit-062')


def contradictory(page):
    enter(page)
    saved = diagnostic(page, lambda item: 'wrong' if item['group'] == 'K-A1-ASK' and item['role'] == 'P'
                       else 'right' if item['group'] in {'K-P-LAT', 'K-P-NUM', 'K-A1-BE', 'K-A1-ASK'} else 'unknown')
    recommendation(page, saved, 'bp-a1-01')
    expect(page.get_by_text('ответы неоднозначны', exact=False)).to_be_visible()


def pause_retake(page):
    enter(page)
    next_diagnostic(page, lambda _: 'right')
    current = state(page)['session']
    button(page, 'Выйти и продолжить позже').click()
    heading(page, 'У вас есть незавершённая диагностика')
    page.reload()
    heading(page, 'У вас есть незавершённая диагностика')
    button(page, 'Продолжить диагностику').click()
    expect(page.get_by_text('Задание 2 · Буквы и числа', exact=True)).to_be_visible()
    resumed = state(page)['session']
    assert resumed['queue'] == current['queue'] and resumed['cursor'] == 1
    first = diagnostic(page, lambda item: 'wrong' if item['group'] == 'K-P-LAT' else 'skip')
    page.goto(pilot + '/diagnostic/new')
    start_diagnostic(page)
    second = diagnostic(page, lambda item: 'wrong' if item['group'] == 'K-P-LAT' else 'skip')
    assert first['session']['formId'] == 'pilot-form-a' and second['session']['formId'] == 'pilot-form-b'
    assert set(first['session']['exposed']).isdisjoint(second['session']['exposed'])
    page.goto(pilot + '/')
    page.get_by_role('link', name='Пройти диагностику снова', exact=True).click()
    expect(page.get_by_text('Диагностика пока недоступна.', exact=False)).to_be_visible()
    expect(button(page, 'Начать диагностику')).to_have_count(0)
    assert len(state(page)['results']) == 2


def checkpoint(page, name, mode):
    page.goto(pilot + '/checkpoint/' + name)
    heading(page, 'Контрольная')
    button(page, 'Начать контрольную').click()
    for index, item in enumerate(data['checkpoints'][name]):
        if index == 1:
            page.reload()
        expect(page.get_by_text(f"Задание {index + 1} из {len(data['checkpoints'][name])}", exact=True)).to_be_visible()
        question = data['questions'][item]
        card = page.locator('fieldset.exercise-card')
        expect(card.locator('.exercise-prompt')).to_have_text(question['prompt'])
        question_answer(page, question, card, mode)
        if mode == 'right':
            button(page, 'Ответить').click()
        page.wait_for_function("""([key, id, count]) => JSON.parse(localStorage.getItem(key)).data.checkpoints[id].items.length === count""",
                               arg=[ADAPTIVE, name, index + 1])
    expect(page.locator('fieldset.exercise-card')).to_have_count(0)


def bridge_a1(page):
    locked(page, 'unit-042')
    checkpoint(page, 'CP-A1', 'right')
    expect(page.get_by_text('Попытка завершена.', exact=True)).to_be_visible()
    button(page, 'Продолжить с опорой').click()
    expect_lesson(page, 'unit-042')
    assert [(g['lessonId'], g['reason']) for g in state(page)['grants']] == [('bp-a1-08', 'start'), ('unit-042', 'supported')]
    page.reload()
    expect_lesson(page, 'unit-042')


def bridge_061(page):
    locked(page, 'unit-062')
    checkpoint(page, 'CP-061', 'right')
    expect(page.get_by_text('Самостоятельная готовность подтверждена.', exact=True)).to_be_visible()
    button(page, 'Продолжить').click()
    expect_lesson(page, 'unit-062')
    assert [(g['lessonId'], g['reason']) for g in state(page)['grants']] == [('unit-061', 'start'), ('unit-062', 'independent')]
    page.reload()
    expect_lesson(page, 'unit-062')


def final_a2(page):
    enter(page)
    saved = diagnostic(page, lambda _: 'right', upper=True)
    recommendation(page, saved, 'bp-a2-07')
    accept(page, 'bp-a2-07')
    checkpoint(page, 'CP-A2', 'right')
    heading(page, 'Есть верный самостоятельный ответ')
    assert len(state(page)['checkpoints']['CP-A2']['items']) == 5
    expect(button(page, 'Продолжить')).to_have_count(0)
    expect(button(page, 'Продолжить с опорой')).to_have_count(0)
    assert [grant['lessonId'] for grant in state(page)['grants']] == ['bp-a2-07']


def lesson_practice(page, mode):
    id = 'bp-a1-01' if mode == 'ordinary' else 'bp-pre-02'
    base = public if mode == 'ordinary' else pilot
    if mode == 'ordinary':
        page.goto(public + '/')
        page.get_by_role('link', name='Начать учиться', exact=True).click()
        expect(page.locator('.lesson-card')).to_have_count(140)
        assert data['questionCount'] == 2267
        expect(page.get_by_text('2267 вопросов', exact=False)).to_be_visible()
    page.goto(base + '/lesson/' + id + '/intro')
    expect_lesson(page, id)
    lesson = data['course'][id]
    mapped = [item['itemId'] for item in data['practice'] if item['lessonId'] == id]
    for step in lesson['steps']:
        if step.get('optional'):
            continue
        if step['type'] == 'exercise':
            page.goto(base + '/lesson/' + id + '/' + step['id'])
            questions = step['questions']
            affected = [q for q in questions if q['id'] in mapped]
            first = affected[0] if affected else None
            if first and mode in ('H1', 'H2'):
                card = page.locator('#' + first['id'] + '-question')
                card.get_by_role('button', name='Подсказка', exact=True).click()
                if mode == 'H2':
                    card.get_by_role('button', name='Ещё подсказка', exact=True).click()
                for hint in first['hints'][:int(mode[1])]:
                    expect(card.get_by_text(hint, exact=True)).to_be_visible()
                    assert all(answer.casefold() not in hint.casefold() for answer in first['acceptedAnswers'])
                expect(page.locator('.answer-feedback')).to_have_count(0)
                page.wait_for_function("""([key, level]) => Object.values(JSON.parse(localStorage.getItem(key)).data.hints).includes(level)""",
                                       arg=[ADAPTIVE, int(mode[1])])
                page.reload()
                expect(card.get_by_role('button', name='Подсказка', exact=True)).to_be_visible()
            for question in questions:
                card = page.locator('#' + question['id'] + '-question')
                question_answer(page, question, card, 'wrong' if mode == 'ordinary' and question is questions[0]
                                or mode == 'H0' and len(affected) > 1 and affected[1] == question else 'right')
            button(page, 'Проверить ответы').click()
            if mode == 'ordinary' or mode == 'H0' and len(affected) > 1:
                incorrect = questions[0] if mode == 'ordinary' else affected[1]
                card = page.locator('#' + incorrect['id'] + '-question')
                expect(card.get_by_text('Исправьте ответ', exact=False)).to_be_visible()
                page.reload()
                expect(card.get_by_text('Исправьте ответ', exact=False)).to_be_visible()
                question_answer(page, incorrect, card, 'right')
                button(page, 'Проверить ответы').click()
            button(page, 'Продолжить').click()
        elif step['type'] == 'summary':
            button(page, 'Завершить урок').click()
        else:
            button(page, 'Разбор завершён' if step['type'] == 'review' else 'Прочитано, далее').click()
    page.wait_for_function("""([key, id]) => JSON.parse(localStorage.getItem(key)).completedLessons.includes(id)""", arg=[PROGRESS, id])
    page.reload()
    expect_lesson(page, id)
    record = snapshot(page, PROGRESS)
    if mode == 'ordinary':
        assert all(any(attempt['correct'] for attempt in entry['attempts']) for entry in record['lessons'][id]['answers'].values())
        assert any([a['correct'] for a in entry['attempts']] == [False, True] for entry in record['lessons'][id]['answers'].values())
        assert snapshot(page) is None
    else:
        events = [event for event in state(page)['history'] if event['item']['itemId'] in mapped]
        assert len(events) == (3 if mode == 'H0' else 2), events
        assisted = [event for event in events if event['assistance'] == mode and event.get('neutral') == 'assisted']
        if mode != 'H0':
            assert len(assisted) == 1 and 'sign' not in assisted[0]
            assert sum(event.get('sign') == '+' for event in events) == 1
        else:
            assert sum(event.get('sign') == '+' and event['assistance'] == 'H0' for event in events) == 1
            assert any(event.get('neutral') == 'retry' and event['outcome'] == 'correct' and 'sign' not in event for event in events)
        page.goto(pilot + '/lesson/bp-pre-03/intro')
        expect_lesson(page, 'bp-pre-03')


def deny_adaptive_writes(page):
    page.evaluate("""() => {
        const write = Storage.prototype.setItem;
        Storage.prototype.setItem = function(key, value) {
            if (key === 'gps.adaptive.v1') throw new DOMException('Test quota', 'QuotaExceededError');
            return write.call(this, key, value);
        };
    }""")


def hint_save_failure(page):
    id = 'bp-pre-02'
    page.goto(pilot + '/lesson/' + id + '/intro')
    for step in data['course'][id]['steps']:
        page.wait_for_url('**/lesson/' + id + '/' + step['id'])
        if step['id'] == 'written':
            question = next(q for q in step['questions'] if q['id'].endswith('gym-locker'))
            break
        if step['type'] == 'exercise':
            for question in step['questions']:
                question_answer(page, question, page.locator('#' + question['id'] + '-question'), 'right')
            button(page, 'Проверить ответы').click()
            button(page, 'Продолжить').click()
        else:
            button(page, 'Прочитано, далее').click()
    card = page.locator('#' + question['id'] + '-question')
    deny_adaptive_writes(page)
    card.get_by_role('button', name='Подсказка', exact=True).click()
    expect(page.get_by_text('Сохранить результат в этом браузере не удалось.', exact=True)).to_be_visible()
    expect(card.get_by_text(question['hints'][0], exact=True)).to_have_count(0)
    page.reload()
    card.get_by_role('button', name='Подсказка', exact=True).click()
    expect(card.get_by_text(question['hints'][0], exact=True)).to_be_visible()


def completion_save_failure(page):
    id = 'unit-062'
    locked(page, 'unit-063')
    page.goto(pilot + '/lesson/' + id + '/intro')
    expect_lesson(page, id)
    for step in data['course'][id]['steps']:
        page.wait_for_url('**/lesson/' + id + '/' + step['id'])
        if step['type'] == 'exercise':
            for question in step['questions']:
                question_answer(page, question, page.locator('#' + question['id'] + '-question'), 'right')
            button(page, 'Проверить ответы').click()
            button(page, 'Продолжить').click()
        elif step['type'] != 'summary':
            button(page, 'Разбор завершён' if step['type'] == 'review' else 'Прочитано, далее').click()
    deny_adaptive_writes(page)
    button(page, 'Завершить урок').click()
    expect(page.get_by_text('Сохранить результат в этом браузере не удалось.', exact=True)).to_be_visible()
    assert id in snapshot(page, PROGRESS)['completedLessons']
    assert [grant['lessonId'] for grant in state(page)['grants']] == [id]
    page.reload()
    page.goto(pilot + '/lesson/unit-063/intro')
    expect_lesson(page, 'unit-063')


def legacy(page, base, kind):
    previous = data['legacy'][kind]
    visited = previous['lastVisited']
    page.goto(base + '/lesson/' + visited['lessonId'] + '/' + visited['stepId'])
    expect_lesson(page, visited['lessonId'])
    page.reload()
    expect_lesson(page, visited['lessonId'])
    current = snapshot(page, PROGRESS)
    assert current['completedLessons'] == previous['completedLessons']
    assert current['lessons'] == previous['lessons']
    if base == pilot:
        enter(page)
        diagnostic(page, lambda _: 'right')
        page.goto(pilot + '/lesson/' + visited['lessonId'] + '/' + visited['stepId'])
        expect_lesson(page, visited['lessonId'])
        assert snapshot(page, PROGRESS)['completedLessons'] == previous['completedLessons']
        assert snapshot(page, PROGRESS)['lessons'] == previous['lessons']


def recovery(page):
    page.goto(pilot + '/diagnostic')
    expect(page.get_by_text('Сохранённые данные диагностики повреждены', exact=False)).to_be_visible()
    previous = page.evaluate("localStorage.getItem('gps.progress.v1')")
    expect(button(page, 'Начать диагностику')).to_be_disabled()
    assert page.evaluate("localStorage.getItem('gps.adaptive.v1')") == '{damaged'
    button(page, 'Восстановить данные').click()
    button(page, 'Создать резервную копию и начать заново').click()
    expect(button(page, 'Начать диагностику')).to_be_enabled()
    assert page.evaluate("""Object.keys(localStorage).some(key =>
        key.startsWith('gps.adaptive.v1.recovery.') && localStorage.getItem(key) === '{damaged')""")
    assert page.evaluate("localStorage.getItem('gps.progress.v1')") == previous


def conflict(page):
    enter(page)
    other = page.context.new_page()
    other.on('pageerror', lambda error: errors.append(str(error)))
    other.goto(pilot + '/diagnostic')
    heading(other, 'У вас есть незавершённая диагностика')
    next_diagnostic(page, lambda _: 'skip')
    button(other, 'Продолжить диагностику').click()
    expect(other.get_by_text('Прогресс изменился в другой вкладке.', exact=True)).to_be_visible()
    assert state(other)['session']['cursor'] == 1
    button(other, 'Перечитать данные').click()
    button(other, 'Продолжить диагностику').click()
    expect(other.get_by_text('Задание 2 · Буквы и числа', exact=True)).to_be_visible()
    assert len(state(other)['session']['events']) == 1


def incompatible(page):
    page.goto(pilot + '/diagnostic')
    heading(page, 'Задания обновились')
    assert state(page)['session']['bank'] == 'diagnostic-bank-v1'
    button(page, 'Начать новую диагностику').click()
    expect(page.get_by_text('Задание 1 · Буквы и числа', exact=True)).to_be_visible()
    current = state(page)
    assert current['session']['bank'] == 'diagnostic-bank-v2'
    assert current['results'][-1]['id'] == 'saved-v1-draft'
    assert current['results'][-1]['reason'] == 'incompatible' and current['results'][-1]['applied'] == []


def withdrawn(page):
    page.goto(pilot + '/lesson/unit-062/intro')
    expect_lesson(page, 'unit-062')
    enter(page)
    saved = diagnostic(page, lambda item: 'right' if item['block'] == 'D0' else 'unknown')
    expect(page.get_by_text('Раньше', exact=False)).to_have_count(0)
    expect(page.get_by_text('получалось в прошлых проверках', exact=False)).to_have_count(0)
    assert {grant['lessonId'] for grant in saved['grants']} == {'unit-062'}
    for retired in data['wrongKeys']:
        assert any(e['item']['itemId'] == retired['itemId'] and e['item']['keyRevision'] == '1' for e in saved['history'])
    page.goto(pilot + '/lesson/unit-062/intro')
    page.reload()
    expect_lesson(page, 'unit-062')


def production_isolation(page):
    page.goto(args.production.rstrip('/') + '/?adaptive=1#/diagnostic')
    heading(page, 'Здесь пока нет страницы')
    assert snapshot(page) is None
    page.get_by_role('link', name='К курсу A1', exact=True).click()
    expect(page.locator('.lesson-card')).to_have_count(140)
    page.goto(public + '/lesson/unit-062/intro')
    heading(page, 'Урок пока заблокирован')


def seeds(adaptive=None, progress=None):
    return {**({ADAPTIVE: json.dumps({'version': 1, 'data': adaptive}) if isinstance(adaptive, dict) else adaptive}
              if adaptive is not None else {}),
            **({PROGRESS: json.dumps(progress)} if progress is not None else {})}


cases = [
    ('first-early-pre', start_and_early, {}, 360, 'dark'),
    ('ordinary-a1', begin_a1, {}, 1280, 'light'),
    ('early-a1', early_a1, {}, 360, 'light'),
    ('late-a1', late_a1, {}, 1280, 'dark'),
    ('transition-a1', transition_a1, {}, 360, 'light'),
    ('a2', a2, {}, 1280, 'light'),
    ('do-does-gap', gap, {}, 360, 'dark'),
    ('contradictory', contradictory, {}, 360, 'light'),
    ('pause-retake-exhaustion', pause_retake, {}, 360, 'dark'),
    ('cp-a1', bridge_a1, seeds(data['bridgeA1']), 360, 'light'),
    ('cp-061', bridge_061, seeds(data['bridge061']), 1280, 'dark'),
    ('cp-a2', final_a2, {}, 1280, 'light'),
    ('public-lesson', lambda page: lesson_practice(page, 'ordinary'), {}, 360, 'light'),
    *[(mode, lambda page, mode=mode: lesson_practice(page, mode), seeds(data['prep']), 1280, 'dark')
      for mode in ('H0', 'H1', 'H2')],
    ('legacy-public', lambda page: legacy(page, public, 'partial'), seeds(progress=data['legacy']['partial']), 1280, 'dark'),
    ('legacy-pilot', lambda page: legacy(page, pilot, 'completed'), seeds(progress=data['legacy']['completed']), 1280, 'light'),
    ('hint-save-failure', hint_save_failure, seeds(data['prep']), 360, 'light'),
    ('completion-save-failure', completion_save_failure, seeds(data['directA2']), 1280, 'light'),
    ('corruption', recovery, seeds('{damaged', data['legacy']['completed']), 360, 'dark'),
    ('tab-conflict', conflict, {}, 1280, 'light'),
    ('v1-draft', incompatible, seeds(data['oldDraft']), 360, 'light'),
    ('v1-withdrawal', withdrawn, seeds(data['retiredKeys']), 1280, 'dark'),
    ('public-isolation', production_isolation, {}, 1280, 'light'),
]
with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True, executable_path=args.chrome)
    for name, run, initial, width, theme in cases:
        if args.case and name not in args.case:
            continue
        context = browser.new_context(viewport={'width': width, 'height': 850}, is_mobile=width == 360, has_touch=width == 360)
        values = {**initial, 'gps.theme.v1': theme}
        context.add_init_script(f"""if (!sessionStorage.getItem('adaptive-final-seeded')) {{
            for (const [key,value] of Object.entries({json.dumps(values)}))
                if (localStorage.getItem(key) === null) localStorage.setItem(key,value);
            sessionStorage.setItem('adaptive-final-seeded','1');
        }}""")
        page = context.new_page()
        page.on('pageerror', lambda error: errors.append(str(error)))
        try:
            run(page)
            expect(page.locator('html')).to_have_attribute('data-theme', theme)
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            results[name] = 'PASS'
        except Exception:
            results[name] = 'FAIL'
            traceback.print_exc()
            print('  Last URL:', page.url, flush=True)
        finally:
            context.close()
        print(f'{results[name]} {name}', flush=True)
    browser.close()
output = ROOT / args.output
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps({'cases': results, 'pageErrors': errors}, ensure_ascii=False, indent=2) + '\n')
assert results and all(result == 'PASS' for result in results.values()) and not errors, (results, errors)
