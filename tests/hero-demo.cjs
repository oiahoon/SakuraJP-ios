const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict'),fs=require('fs');
const base=process.argv[2]||'http://127.0.0.1:4173';
const out=process.env.SAKURA_QA_OUTPUT || require('node:path').join(require('node:os').tmpdir(),'sakura-website-qa');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await (process.argv[3]==='webkit'?webkit:chromium).launch({headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];
 page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 const prefix=(base.includes('127.0.0.1')?'local':'production')+'-'+(process.argv[3]||'chromium');
 async function ready(){await page.goto(base,{waitUntil:'networkidle'});await page.locator('.demo-ui').waitFor({state:'visible'});}
 await ready();await page.screenshot({path:`${out}/${prefix}-hero-desktop.png`});
 const card=page.locator('.demo-card');
 assert.match(await card.innerText(),/ないでください/);
 await card.click();await page.getByRole('button',{name:'打开句解'}).click();
 assert.equal(await page.locator('.demo-segments button').count(),3);
 await page.locator('[data-part="0"]').click();assert.match(await page.locator('.demo-explanation').innerText(),/场所/);
 await page.screenshot({path:`${out}/${prefix}-sentence-desktop.png`});
 await page.locator('.demo-screen [data-action="back"]').click();assert.equal(await page.locator('[data-action="sentence"]').count(),1);
 await page.locator('.demo-screen [data-action="back"]').click();await card.waitFor();
 await page.locator('[data-action="save"]').click();await page.waitForFunction(()=>document.querySelector('.demo-word')?.textContent==='てもいい');
 await page.waitForFunction(()=>document.querySelector('.demo-card').getAnimations().length===0);
 await page.locator('[data-action="favorites"]').click();assert.equal(await page.locator('.demo-saved-row').count(),1);
 await page.locator('[data-action="saved-detail"]').click();assert.match(await page.locator('.demo-detail-word').innerText(),/ないでください/);
 await page.locator('.demo-screen [data-action="back"]').click();await page.locator('[data-action="remove"]').click();assert.match(await page.locator('.demo-empty').innerText(),/还没有收藏/);
 await page.locator('.demo-empty [data-action="discover"]').click();
 await card.focus();await page.keyboard.press('ArrowLeft');await page.waitForFunction(()=>document.querySelector('.demo-word')?.textContent==='てもいい');
 await page.waitForFunction(()=>document.querySelector('.demo-card').getAnimations().length===0);
 // Real horizontal pointer gesture saves and advances; a short drag springs back.
 let box=await card.boundingBox();let x=box.x+box.width*.4,y=box.y+100;
 await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+100,y+5,{steps:10});await page.mouse.up();
 await page.waitForFunction(()=>document.querySelector('.demo-word')?.textContent==='しか ない');
 await page.waitForFunction(()=>document.querySelector('.demo-card').getAnimations().length===0);
 box=await card.boundingBox();x=box.x+100;y=box.y+100;
 await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x+20,y,{steps:4});await page.mouse.up();
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('.demo-card')).transform==='none'||getComputedStyle(document.querySelector('.demo-card')).transform==='matrix(1, 0, 0, 1, 0, 0)');
 assert.equal(await page.locator('.demo-word').innerText(),'しか ない');
 // Real screenshot toggle preserves current session state.
 await page.getByRole('button',{name:'App 实拍',exact:true}).click();assert.ok(await page.locator('.demo-real-shot').isVisible());
 await page.getByRole('button',{name:'上手试试',exact:true}).click();assert.equal(await page.locator('.demo-word').innerText(),'しか ない');
 // Missing voice is an honest visible fallback (no sound is simulated).
 await page.evaluate(()=>{Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[],cancel:()=>{}}})});
 await page.locator('[data-action="sound"]').click();assert.match(await page.locator('.demo-feedback').innerText(),/暂无可用日语声音/);
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-action="next"]').click();
 assert.equal(await page.locator('.demo-word').innerText(),'ないでください');
 assert.equal(await page.evaluate(()=>document.getAnimations().length),0);
 await page.emulateMedia({reducedMotion:'no-preference'});
 for(const width of [390,320,768]){
  await page.setViewportSize({width,height:844});await ready();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  await page.locator('.hero-experience').scrollIntoViewIfNeeded();
  await page.screenshot({path:`${out}/${prefix}-demo-${width}.png`});
  await card.click();await page.locator('[data-action="sentence"]').click();
  await page.locator('.demo-more').scrollIntoViewIfNeeded();
  assert.ok(await page.locator('.demo-more').isVisible());
 }
 // Failure and no-JS remain a real screenshot, without dead demo controls.
 const fallback=await browser.newPage();await fallback.route('**/assets/demo/content.json',r=>r.abort());await fallback.goto(base);assert.ok(await fallback.locator('.demo-real-shot').isVisible());assert.ok(await fallback.locator('.demo-switch').isHidden());await fallback.close();
 const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(base);assert.ok(await nojs.locator('.demo-real-shot').isVisible());assert.ok(await nojs.locator('.hero-copy').isVisible());await nojs.close();
 assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/${prefix}-qa.json`,JSON.stringify({base,result:'pass',widths:[1440,768,390,320],checks:['detail > sentence > selected phrase > back','save > favorites > detail > remove','keyboard next','pointer swipe save/advance','short drag returns','screenshot toggle preserves state','no Japanese voice fallback','reduced motion no animations','scrolling detail controls on mobile','content failure screenshot','no JavaScript screenshot'],errors},null,2));
 console.log('PASS: hero interactions, gestures, 4 widths, reduced motion and fallback checks');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
