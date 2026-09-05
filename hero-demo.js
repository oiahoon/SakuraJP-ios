/* A deliberately bounded, local-only web preview. It does not run SwiftUI or an LLM. */
(() => {
  const host = document.querySelector('#hero-experience');
  if (!host) return;
  const ui = host.querySelector('.demo-ui');
  const screen = host.querySelector('.demo-screen');
  const shot = host.querySelector('.demo-real-shot');
  const switcher = host.querySelector('.demo-switch');
  const instruction = host.querySelector('.demo-instruction');
  const feedback = host.querySelector('.demo-feedback');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const saved = new Set();
  let cards = [], index = 0, view = 'discover', origin = 'discover';
  let busy = false, pointer = null, frame = 0, suppressClickUntil = 0;
  let utterance = null, speechTimer = 0, inViewport = true;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon = name => {
    const paths = {
      sound: '<path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>',
      save: '<path d="M6 3h12v18l-6-4-6 4V3Z"/>',
      next: '<path d="m9 5 7 7-7 7"/>',
      leaf: '<path d="M20 3C10 2 3 6 4 13s11 10 14 2c2-5-2-7 2-12Z"/><path d="M4 21c1-7 5-10 10-12"/>',
      person: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
      wave: '<path d="M4 9v6m4-10v14m4-17v20m4-17v14m4-10v6"/>'
    };
    return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
  };
  function announce(text) { feedback.textContent = text; }
  function stopSpeech() {
    const hadSpeech = !!utterance;
    utterance = null;
    clearTimeout(speechTimer);
    if (hadSpeech && 'speechSynthesis' in window) speechSynthesis.cancel();
    ui.querySelectorAll('[data-action="sound"]').forEach(b => b.setAttribute('aria-pressed','false'));
  }
  async function motion(element, keyframes, duration = 360) {
    if (reduced.matches || !element.animate || document.hidden || ui.hidden || !inViewport) return;
    const animation = element.animate(keyframes, {duration, easing:'cubic-bezier(.22,1,.36,1)'});
    try { await animation.finished; } catch { /* Cancellation settles the same state. */ }
  }
  function settleMotion() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    const pending = pointer; pointer = null;
    if (pending?.card.hasPointerCapture(pending.id)) pending.card.releasePointerCapture(pending.id);
    ui.querySelectorAll('*').forEach(el => el.getAnimations?.().forEach(a => a.cancel()));
    const card = screen.querySelector('.demo-card');
    if (card) card.style.transform = '';
    screen.querySelector('.demo-swipe-mark')?.remove();
  }
  function focusHeading() { screen.querySelector('[data-focus]')?.focus({preventScroll:true}); }
  function render(focus = false) {
    const item = cards[index], l = item.learningPoint, e = item.example;
    stopSpeech();
    ui.querySelector('[data-action="discover"]').toggleAttribute('aria-current',view !== 'favorites' && origin !== 'favorites');
    ui.querySelector('[data-action="favorites"]').toggleAttribute('aria-current',view === 'favorites' || origin === 'favorites');
    ui.querySelectorAll('[aria-current]').forEach(el => el.setAttribute('aria-current','page'));
    const sound = `<button type="button" class="demo-round" data-action="sound" aria-label="播放日语例句" aria-pressed="false">${icon('sound')}</button>`;
    if (view === 'discover') {
      screen.innerHTML = `<div class="demo-topline"><span>今日一页</span><span>${index + 1} / ${cards.length}</span></div>
        <div class="demo-card-stage"><button type="button" class="demo-card" data-action="detail" data-focus aria-label="打开${esc(l.reading)}的学习详情">
        <span class="demo-word" lang="ja">${esc(l.reading)}</span>
        <span class="demo-label">含义</span><span class="demo-meaning">${esc(l.chinese_translation)}</span>
        <span class="demo-label">例句</span><span class="demo-example" lang="ja">${esc(e.japanese)}</span><span class="demo-translation">${esc(e.chinese)}</span>
        <span class="demo-card-hint">点开卡片，读懂这一句 <span aria-hidden="true">↗</span></span></button></div>
        <div class="demo-actions">${sound}<button type="button" data-action="save" class="demo-save" aria-label="收藏当前卡片">${icon('save')}<span>${saved.has(index)?'已收藏':'收藏'}</span></button><button type="button" class="demo-round" data-action="next" aria-label="换下一张卡片">${icon('next')}</button></div>`;
    } else if (view === 'favorites') {
      screen.innerHTML = `<h3 class="demo-page-title" tabindex="-1" data-focus>知识架 <small>${saved.size}</small></h3><p class="demo-small">本次体验中收藏的内容</p><div class="demo-saved-list">${saved.size ? [...saved].map(i=>`<div class="demo-saved-row"><button type="button" data-action="saved-detail" data-index="${i}"><span lang="ja">${esc(cards[i].learningPoint.reading)}</span><small>${esc(cards[i].example.chinese)}</small></button><button type="button" class="demo-remove" data-action="remove" data-index="${i}" aria-label="移除${esc(cards[i].learningPoint.reading)}的收藏">×</button></div>`).join('') : `<div class="demo-empty">${icon('save')}<p>还没有收藏</p><button type="button" class="demo-primary" data-action="discover">去发现</button></div>`}</div>`;
    } else if (view === 'detail') {
      screen.innerHTML = `<div class="demo-topline"><button type="button" data-action="back" aria-label="返回${origin==='favorites'?'收藏':'发现'}">‹ 返回</button><span>学习详情</span>${sound}</div><h3 class="demo-detail-word" lang="ja" tabindex="-1" data-focus>${esc(l.reading)}</h3><p class="demo-label">核心意思</p><p>${esc(l.chinese_translation)}</p><div class="demo-detail-example"><p lang="ja">${esc(e.japanese)}</p><p class="demo-small" lang="ja">${esc(e.reading)}</p><p class="demo-translation">${esc(e.chinese)}</p></div><button type="button" class="demo-primary" data-action="sentence">打开句解 <span aria-hidden="true">↗</span></button>`;
    } else {
      screen.innerHTML = `<div class="demo-topline"><button type="button" data-action="back">‹ 返回</button><h3 tabindex="-1" data-focus>句解</h3>${sound}</div><p class="demo-sentence" lang="ja">${esc(e.japanese)}</p><p class="demo-small" lang="ja">${esc(e.reading)}</p><p class="demo-translation">${esc(e.chinese)}</p>
        ${index===0 ? `<div class="demo-segments"><button type="button" data-action="segment" data-part="0" aria-pressed="false"><ruby lang="ja">ここで<rt>ここで</rt></ruby><span>场所</span></button><button type="button" data-action="segment" data-part="1" aria-pressed="false"><ruby lang="ja">写真を<rt>しゃしんを</rt></ruby><span>对象</span></button><button type="button" data-action="segment" data-part="2" aria-pressed="true"><ruby lang="ja">撮らないでください。<rt>とらないでください</rt></ruby><span>礼貌禁止</span></button></div><p class="demo-formula" lang="ja">Vない形 ＋ でください</p><p class="demo-explanation">${esc(e.grammar_analysis)}</p>` : `<div class="demo-rule"><p class="demo-label">句中结构</p><p class="demo-formula" lang="ja">${index===1?'Vて形 ＋ もいいですか':'名词 ＋ しか ＋ 否定'}</p><p>${esc(e.grammar_analysis)}</p></div>`}
        <a class="demo-more" href="grammar.html">了解 App 中的完整句解 →</a>`;
    }
    screen.scrollTop = 0;
    if (focus) focusHeading();
  }
  function navigate(next, focus = true) {
    if (busy) return;
    settleMotion();
    if (next==='discover' || next==='favorites') origin=next;
    view=next; render(focus);
    motion(screen,[{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],260);
  }
  async function advance(save, fromTransform = '') {
    if (busy || view!=='discover') return;
    busy=true; stopSpeech();
    const card=screen.querySelector('.demo-card');
    const old=index;
    try {
      if (save) saved.add(old);
      await motion(card,[{transform:fromTransform||'translateX(0)',opacity:1},{transform:`translateX(${save?1:-1}00%) rotate(${save?8:-8}deg)`,opacity:0}],220);
      index=(old+1)%cards.length;
      render(true);
      announce(save ? `已收藏「${cards[old].learningPoint.reading}」，可在下方“收藏”回看。` : `换到第 ${index+1} 张：${cards[index].learningPoint.reading}`);
      await motion(screen.querySelector('.demo-card'),[{opacity:0,transform:'translateY(16px) scale(.97)'},{opacity:1,transform:'translateY(0) scale(1)'}],380);
    } finally { busy=false; }
  }
  function speak(button) {
    if (utterance) {stopSpeech();announce('已停止播放。');return;}
    if (!('speechSynthesis' in window)) {announce('此浏览器暂不支持发音，可在 App 内听日语。');return;}
    const voice=speechSynthesis.getVoices().find(v=>/^ja(?:-|_)/i.test(v.lang));
    if (!voice) {announce('此浏览器暂无可用日语声音，可在 App 内听日语。');return;}
    const speech=new SpeechSynthesisUtterance(cards[index].example.japanese);
    speech.lang='ja-JP';speech.voice=voice;speech.rate=.85;
    utterance=speech;button.setAttribute('aria-pressed','true');
    announce('正在播放日语例句…');
    const finish=message=>{if(utterance!==speech)return;utterance=null;clearTimeout(speechTimer);button.setAttribute('aria-pressed','false');announce(message);};
    speech.onend=()=>finish('再听一遍，或者点开卡片看看。');
    speech.onerror=()=>finish('发音暂不可用，请稍后重试。');
    speechTimer=setTimeout(()=>{if(utterance===speech){stopSpeech();announce('发音暂不可用，请稍后重试。');}},20000);
    try {speechSynthesis.speak(speech);} catch {finish('发音暂不可用，请稍后重试。');}
  }
  host.addEventListener('click',event=>{
    const preview=event.target.closest('[data-preview]');
    if(preview){
      settleMotion();stopSpeech();const live=preview.dataset.preview==='demo';
      ui.hidden=!live;shot.hidden=live;
      switcher.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===preview)));
      instruction.textContent=live?'网页轻体验 · 左滑换卡，右滑收藏':'真实 App 实拍 · 2.1.17（199）';
      announce(live?'体验中的收藏仅在本页有效。':'');return;
    }
    const button=event.target.closest('[data-action]');
    if(!button||busy)return;
    const action=button.dataset.action;
    if(action==='detail' && performance.now()<suppressClickUntil)return;
    if(action==='next'||action==='save'){advance(action==='save');return;}
    if(action==='sound'){speak(button);return;}
    if(action==='discover'||action==='favorites'||action==='detail'||action==='sentence'){navigate(action);return;}
    if(action==='back'){navigate(view==='sentence'?'detail':origin);return;}
    if(action==='saved-detail'){index=Number(button.dataset.index);origin='favorites';navigate('detail');return;}
    if(action==='remove'){
      saved.delete(Number(button.dataset.index));render();
      screen.querySelector('[data-action="remove"], [data-action="discover"], [data-focus]')?.focus({preventScroll:true});
      announce('已从本次体验的收藏中移除。');return;
    }
    if(action==='segment'){
      screen.querySelectorAll('[data-action="segment"]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
      screen.querySelector('.demo-explanation').textContent=['「ここで」指出动作发生的场所：在这里。','「写真を」指出动作的对象：照片。',cards[0].example.grammar_analysis][Number(button.dataset.part)];
    }
  });
  screen.addEventListener('keydown',event=>{
    if(!event.target.matches('.demo-card')||!['ArrowLeft','ArrowRight'].includes(event.key))return;
    event.preventDefault();advance(event.key==='ArrowRight');
  });
  screen.addEventListener('pointerdown',event=>{
    const card=event.target.closest('.demo-card');
    if(!card||busy||!event.isPrimary||event.button!==0)return;
    pointer={id:event.pointerId,x:event.clientX,y:event.clientY,dx:0,card,horizontal:false};
  });
  screen.addEventListener('pointermove',event=>{
    if(!pointer||pointer.id!==event.pointerId)return;
    const p=pointer,dx=event.clientX-p.x,dy=event.clientY-p.y;
    if(!p.horizontal){
      if(Math.abs(dy)>10&&Math.abs(dy)>Math.abs(dx)){pointer=null;return;}
      if(Math.abs(dx)<8)return;
      p.horizontal=true;p.card.setPointerCapture(event.pointerId);
    }
    p.dx=dx;
    if(frame)return;
    frame=requestAnimationFrame(()=>{
      frame=0;if(pointer!==p)return;
      p.card.style.transform=reduced.matches?'':`translateX(${p.dx}px) rotate(${p.dx/30}deg)`;
      let mark=screen.querySelector('.demo-swipe-mark');
      if(!mark){mark=document.createElement('span');mark.className='demo-swipe-mark';mark.setAttribute('aria-hidden','true');p.card.before(mark);}
      mark.textContent=p.dx>0?'留':'次';mark.style.opacity=String(Math.min(.7,Math.abs(p.dx)/180));
    });
  });
  function release(event,cancelled=false){
    if(!pointer||pointer.id!==event.pointerId)return;
    const p=pointer;pointer=null;if(frame)cancelAnimationFrame(frame);frame=0;
    if(p.card.hasPointerCapture(event.pointerId))p.card.releasePointerCapture(event.pointerId);
    screen.querySelector('.demo-swipe-mark')?.remove();
    if(!p.horizontal)return;
    suppressClickUntil=performance.now()+400;
    const from=p.card.style.transform;
    if(!cancelled && Math.abs(p.dx)>p.card.clientWidth*.23){advance(p.dx>0,from);return;}
    p.card.style.transform='';
    motion(p.card,[{transform:from||'translateX(0)'},{transform:'translateX(0) rotate(0)'}],420);
  }
  screen.addEventListener('pointerup',event=>release(event));
  screen.addEventListener('pointercancel',event=>release(event,true));
  screen.addEventListener('lostpointercapture',event=>release(event,true));
  reduced.addEventListener('change',()=>{if(reduced.matches)settleMotion();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stopSpeech();settleMotion();}});
  window.addEventListener('pagehide',()=>{stopSpeech();settleMotion();});
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{
    inViewport=entries[0].isIntersecting;
    if(!inViewport){stopSpeech();settleMotion();}
  }).observe(host);
  if ('speechSynthesis' in window) speechSynthesis.getVoices();
  fetch('assets/demo/content.json').then(r=>{if(!r.ok)throw Error('demo content unavailable');return r.json();}).then(data=>{
    if(!Array.isArray(data)||data.length!==3||!data.every(x=>x.learningPoint?.reading&&x.example?.japanese))throw Error('invalid demo content');
    cards=data;render();
    const tabIcons=['leaf','wave','save','person'];
    ui.querySelectorAll('.demo-tabs > * > span').forEach((span,i)=>{span.innerHTML=icon(tabIcons[i]);});
    shot.hidden=true;ui.hidden=false;switcher.hidden=false;
    instruction.textContent='网页轻体验 · 左滑换卡，右滑收藏';
    announce('也可使用按钮；体验收藏仅在本页有效。');
  }).catch(()=>{ /* The real app screenshot remains usable when enhancement fails. */ });
})();
