import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

test('Beta home explains voluntary placement and prioritises a saved lesson', async () => {
  const server = await createServer({mode:'beta',server:{middlewareMode:true,hmr:false,ws:false},appType:'custom'});
  try {
    const { HomePage } = await server.ssrLoadModule('/src/pages/HomePage.tsx');
    const { AdaptiveContext } = await server.ssrLoadModule('/src/components/adaptive/AdaptiveContext.tsx');
    const { ProgressContext } = await server.ssrLoadModule('/src/lib/ProgressContext.tsx');
    const { openAdaptiveHost } = await server.ssrLoadModule('/src/lib/adaptiveHost.ts');
    const { adaptivePilot } = await server.ssrLoadModule('/src/content/adaptivePilot.ts');
    const { emptyProgress } = await server.ssrLoadModule('/src/lib/progress.ts');
    const host = await openAdaptiveHost({getItem:()=>null,setItem(){}}, adaptivePilot);
    const render = progress => renderToStaticMarkup(createElement(AdaptiveContext,{value:{host,busy:false,write:async()=>true}},
      createElement(ProgressContext,{value:{progress,dispatch(){},reset(){}}},createElement(HomePage))));
    const fresh = render(emptyProgress());
    assert.match(fresh,/Beta · /);
    assert.match(fresh,/Экспериментальная версия. Диагностика помогает подобрать подходящий урок, но не является официальным определением уровня английского/);
    assert.match(fresh,/href="#\/diagnostic"[^>]*>Подобрать учебный старт/);
    assert.match(fresh,/Начать обучение без диагностики/);
    const returned = render({...emptyProgress(),lastVisited:{lessonId:'to-be',stepId:'theory'}});
    assert.match(returned,/class="button button-primary" href="#\/lesson\/to-be\/theory">Продолжить обучение/);
    assert.match(returned,/class="button button-secondary" href="#\/diagnostic">Подобрать учебный старт/);
    assert.ok(returned.indexOf('Продолжить обучение') < returned.indexOf('Подобрать учебный старт'));
  } finally {await server.close();}
});
