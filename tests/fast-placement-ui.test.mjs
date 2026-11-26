import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import { openAdaptiveHost } from '../src/lib/adaptiveHost.ts';
import { adaptivePilot } from '../src/content/adaptivePilot.ts';
import { storage } from './fixtures/adaptive.mjs';

let server, FastPlacementPage, FastCards, AdaptiveContext, ProgressContext;
before(async () => {
  server = await createServer({server:{middlewareMode:true,hmr:false,ws:false},appType:'custom'});
  ({FastPlacementPage}=await server.ssrLoadModule('/src/components/adaptive/FastPlacementPage.tsx'));
  ({FastCards}=await server.ssrLoadModule('/src/components/adaptive/FastCards.tsx'));
  ({AdaptiveContext}=await server.ssrLoadModule('/src/components/adaptive/AdaptiveContext.tsx'));
  ({ProgressContext}=await server.ssrLoadModule('/src/lib/ProgressContext.tsx'));
});
after(async()=>await server?.close());
function render(host,route='/diagnostic') {
  return renderToStaticMarkup(createElement(AdaptiveContext,{value:{host,busy:false,write:async operation=>['saved','unchanged'].includes(await operation())}},
    createElement(ProgressContext,{value:{progress:host.session.progress,dispatch(){},reset(){}}},
      createElement(FastPlacementPage,{route}))));
}
test('real host offers fast voluntary entry and retains the previous draft read-only',async()=>{
  const host=await openAdaptiveHost(storage(),adaptivePilot);
  const html=render(host);
  assert.match(html,/Печатать не нужно|Печатать не нужно/i);
  assert.match(html,/Начать диагностику/);
  assert.doesNotMatch(html,/type="text"|8–12|20–28/);
});
test('duplicate token instances render separately with keyboard and tap controls',()=>{
  const tokens=[{id:'the-1',label:'the'},{id:'the-2',label:'the'},{id:'map',label:'map'}];
  const html=renderToStaticMarkup(createElement(FastCards,{tokens,selected:['the-2','map'],busy:false,change:async()=>true}));
  assert.match(html,/data-token="the-1"/);
  assert.match(html,/data-token="the-2"/);
  assert.match(html,/Передвинуть «map» влево, слово 2/);
  assert.match(html,/Убрать «the», слово 1/);
  assert.doesNotMatch(html,/draggable=|type="text"/);
});
test('two early results exhaust real forms without touching course progress or independent history',async()=>{
  const disk=storage();
  const host=await openAdaptiveHost(disk,adaptivePilot);
  for(const id of ['first','second']){
    await host.engine.fast.begin(id);
    for(let at=0;at<2;at++){
      const view=host.engine.fast.view();
      const item=adaptivePilot.fastBank.forms.flatMap(form=>Object.values(form.slots).flat()).find(item=>item.id===view.prompt.id);
      const wrong=item.options.find(option=>!item.acceptedOptionIds.includes(option.id));
      await host.engine.fast.submit(view.cursor,{type:'option',optionId:wrong.id});
    }
    assert.equal(host.engine.fast.result().presented,2);
    assert.match(render(host),/Предварительный результат/);
  }
  assert.equal(host.engine.fast.entry().canStart,false);
  assert.match(render(host,'/diagnostic/new'),/Свежих вариантов сейчас нет/);
  assert.equal(disk.getItem('gps.progress.v1'),null);
  assert.ok(host.engine.knowledge().every(item=>item.state==='UNKNOWN'));
});
