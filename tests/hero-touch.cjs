const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await page.goto(process.argv[2]||'http://127.0.0.1:4173',{waitUntil:'networkidle'});
 await page.locator('.demo-ui').waitFor({state:'visible'});await page.locator('.demo-device').scrollIntoViewIfNeeded();
 const client=await page.context().newCDPSession(page);
 async function drag(dx,dy,cancel=false){
  const b=await page.locator('.demo-card').boundingBox(),x=b.x+90,y=b.y+80;
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
  for(let i=1;i<=10;i++)await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/10,y:y+dy*i/10}]});
  await client.send('Input.dispatchTouchEvent',{type:cancel?'touchCancel':'touchEnd',touchPoints:[]});
 }
 await drag(100,4);await page.waitForFunction(()=>document.querySelector('.demo-word')?.textContent==='てもいい');
 await page.waitForFunction(()=>document.querySelector('.demo-card').getAnimations().length===0);
 await drag(-40,2,true);await page.waitForFunction(()=>document.querySelector('.demo-card').getAnimations().length===0);
 assert.equal(await page.locator('.demo-word').innerText(),'てもいい');
 const before=await page.evaluate(()=>scrollY);await drag(0,-90);
 await page.waitForFunction(y=>scrollY>y+20,before);assert.equal(await page.locator('.demo-word').innerText(),'てもいい');
 // Switching presentation during an animation must not leave the demo locked.
 await page.getByRole('button',{name:'App 实拍',exact:true}).tap();assert.ok(await page.locator('.demo-real-shot').isVisible());
 await page.getByRole('button',{name:'上手试试',exact:true}).tap();
 await page.locator('[data-action="next"]').tap();await page.getByRole('button',{name:'App 实拍',exact:true}).tap();
 await page.getByRole('button',{name:'上手试试',exact:true}).tap();
 await page.waitForFunction(()=>document.querySelector('.demo-card').getAnimations().length===0);
 await page.locator('[data-action="next"]').tap();await page.waitForFunction(()=>document.querySelector('.demo-word')?.textContent==='ないでください');
 await page.waitForFunction(()=>document.getAnimations().length===0);
 console.log('PASS: mobile touch swipe, cancellation, vertical page scroll, toggle during transition, idle without animations');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
