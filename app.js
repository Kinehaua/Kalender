(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const pad = n => String(n).padStart(2,'0');
  const key = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const parse = s => { const [y,m,d]=s.split('-').map(Number); return new Date(y,m-1,d); };
  const today = new Date(); today.setHours(0,0,0,0);
  const colors = ['#8b7cf6','#3999d5','#27a77a','#ed9c40','#e66e87','#a17acb','#718096'];
  let events = [];
  try { const saved=JSON.parse(localStorage.getItem('myCalendarEventsV1')||'[]'); if(Array.isArray(saved)) events=saved; } catch {}
  let current=new Date(today), selected=key(today), view='month';
  const save=()=>localStorage.setItem('myCalendarEventsV1',JSON.stringify(events));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const short=s=>parse(s).toLocaleDateString('de-DE',{day:'2-digit',month:'2-digit',year:'numeric'});
  const full=s=>parse(s).toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
  const sorted=a=>[...a].sort((x,y)=>x.date.localeCompare(y.date)||x.name.localeCompare(y.name));
  const dayEvents=s=>sorted(events.filter(e=>e.date===s));
  const isBusy=s=>events.some(e=>e.date===s&&e.busy);

  function card(e){
    return `<article class="event ${e.busy?'busy':''}" style="--event-color:${esc(e.color)}">
      <div class="event-head"><div style="min-width:0">
        <div class="event-title">${esc(e.name)}</div>
        <div class="event-meta">${short(e.date)}${e.busy?' · Ganztägig belegt':''}</div>
        ${e.location?`<div class="event-meta">⌖ ${esc(e.location)}</div>`:''}
      </div><div class="event-actions"><button data-edit="${esc(e.id)}" aria-label="Bearbeiten">✎</button><button data-delete="${esc(e.id)}" aria-label="Löschen">×</button></div></div>
      ${e.description?`<div class="event-desc">${esc(e.description)}</div>`:''}
    </article>`;
  }
  function renderCalendar(){
    const y=current.getFullYear(),m=current.getMonth();
    let start;
    if(view==='month'){
      $('period').textContent=current.toLocaleDateString('de-DE',{month:'long',year:'numeric'});
      start=new Date(y,m,1);start.setDate(1-(start.getDay()+6)%7);
    } else {
      const d=parse(selected);start=new Date(d);start.setDate(d.getDate()-(d.getDay()+6)%7);
      const end=new Date(start);end.setDate(start.getDate()+6);
      $('period').textContent=`${start.toLocaleDateString('de-DE',{day:'2-digit',month:'short'})} – ${end.toLocaleDateString('de-DE',{day:'2-digit',month:'short',year:'numeric'})}`;
    }
    $('viewHint').textContent=view==='month'?'Monatsübersicht':'Wochenübersicht';
    $('monthView').classList.toggle('active',view==='month');$('weekView').classList.toggle('active',view==='week');
    $('calendarGrid').classList.toggle('week',view==='week');
    $('weekdaysHead').classList.toggle('hidden',view==='week');
    const count=view==='month'?42:7;let html='';
    for(let i=0;i<count;i++){
      const d=new Date(start);d.setDate(start.getDate()+i);const s=key(d),list=dayEvents(s);
      const status=isBusy(s)?'busy':list.length?'hasevents':'free';
      html+=`<button class="day ${status} ${s===key(today)?'today':''} ${s===selected?'selected':''} ${view==='month'&&d.getMonth()!==m?'other':''}" data-date="${s}" aria-label="${full(s)}">
        <div class="daynum">${view==='week'?d.toLocaleDateString('de-DE',{weekday:'short',day:'2-digit',month:'2-digit'}):d.getDate()}</div>
        ${isBusy(s)?'<div class="dot busy">Belegt</div>':list.slice(0,2).map(e=>`<div class="dot ${e.busy?'busy':''}">${esc(e.name)}</div>`).join('')}
        ${list.length>2?`<div class="muted" style="font-size:.65rem">+${list.length-2}</div>`:''}
      </button>`;
    }
    $('calendarGrid').innerHTML=html;
    $('selectedTitle').textContent=full(selected);
    const list=dayEvents(selected);
    $('selectedEvents').innerHTML=list.length?list.map(card).join(''):'<div class="empty">Keine Termine an diesem Tag.</div>';
  }
  function renderList(){
    const q=$('search').value.trim().toLocaleLowerCase('de-DE'),f=$('filter').value,dir=$('sort').value;
    let arr=events.filter(e=>{
      const text=[e.name,e.description,e.location,e.date].join(' ').toLocaleLowerCase('de-DE');
      return (!q||text.includes(q))&&(f==='all'||(f==='busy'&&e.busy)||(f==='future'&&!e.busy&&e.date>=key(today))||(f==='past'&&!e.busy&&e.date<key(today)));
    });
    arr.sort((a,b)=>dir==='asc'?a.date.localeCompare(b.date):b.date.localeCompare(a.date));
    $('resultCount').textContent=`${arr.length} Einträge gefunden`;
    $('allEvents').innerHTML=arr.length?arr.map(card).join(''):'<div class="empty">Keine passenden Termine gefunden.</div>';
  }
  function render(){renderCalendar();renderList();}
  function switchTab(tab){
    $('calendarPage').classList.toggle('hidden',tab!=='calendar');
    $('listPage').classList.toggle('hidden',tab!=='list');
    document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  }
  function closeModal(){$('modalRoot').innerHTML='';}
  function openModal(id){
    const e=events.find(x=>x.id===id),date=e?.date||selected;
    $('modalRoot').innerHTML=`<div class="overlay" id="overlay"><div class="modal">
      <div class="toolbar"><h2>${e?'Termin bearbeiten':'Neuen Termin erstellen'}</h2><button class="soft" id="closeModal" type="button">✕</button></div>
      <form id="eventForm">
        <label>Name <span style="color:#c33">*</span><input class="field" name="name" required maxlength="100" placeholder="Name des Termins" value="${esc(e?.name||'')}"></label>
        <label>Datum <span style="color:#c33">*</span><input class="field" name="date" type="date" required value="${date}"></label>
        <div class="checkrow"><input type="checkbox" name="busy" id="busyCheck" ${e?.busy?'checked':''}><label for="busyCheck" style="margin:0">Ganztägig als belegt markieren<div class="muted" style="font-size:.75rem;font-weight:400;margin-top:3px">Neue Termine an diesem Tag lösen eine Warnung aus.</div></label></div>
        <label>Beschreibung <span class="muted">(optional)</span><textarea class="field" name="description" rows="3" maxlength="1000" placeholder="Weitere Informationen …">${esc(e?.description||'')}</textarea></label>
        <label>Ort <span class="muted">(optional)</span><input class="field" name="location" maxlength="150" placeholder="Wo findet es statt?" value="${esc(e?.location||'')}"></label>
        <div class="modal-actions" style="margin-top:20px"><button type="button" class="soft" id="cancelModal">Abbrechen</button><button type="submit" class="primary">${e?'Speichern':'Termin erstellen'}</button></div>
      </form>
    </div></div>`;
    $('closeModal').onclick=closeModal;$('cancelModal').onclick=closeModal;
    $('overlay').addEventListener('click',ev=>{if(ev.target.id==='overlay')closeModal();});
    $('eventForm').onsubmit=ev=>{
      ev.preventDefault();const f=new FormData(ev.target);
      const item={id:e?.id||`ev_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,name:f.get('name').trim(),date:f.get('date'),busy:f.get('busy')==='on',description:f.get('description').trim(),location:f.get('location').trim()};
      if(!item.name||!item.date)return;
      const conflicts=events.filter(x=>x.id!==item.id&&x.date===item.date);
      let warning=null;
      if(item.busy&&conflicts.length)warning=`An diesem Tag gibt es bereits ${conflicts.length} weitere(n) Eintrag/Einträge.`;
      else if(!item.busy&&conflicts.some(x=>x.busy))warning='Dieser Tag ist bereits als ganztägig belegt markiert.';
      if(warning&&!confirm(`⚠️ Belegungswarnung\n\n${warning}\n\nMöchtest du trotzdem speichern?`))return;
      if(e)events=events.map(x=>x.id===item.id?item:x);else events.push(item);
      selected=item.date;current=parse(item.date);save();closeModal();render();switchTab('calendar');
    };
  }
  function deleteEvent(id){
    const e=events.find(x=>x.id===id);if(!e)return;
    if(confirm(`Möchtest du „${e.name}“ wirklich löschen?`)){events=events.filter(x=>x.id!==id);save();render();}
  }
  document.addEventListener('click',ev=>{
    const b=ev.target.closest('[data-date],[data-edit],[data-delete],[data-tab]');
    if(!b)return;
    if(b.dataset.date){selected=b.dataset.date;current=parse(selected);renderCalendar();}
    if(b.dataset.edit)openModal(b.dataset.edit);
    if(b.dataset.delete)deleteEvent(b.dataset.delete);
    if(b.dataset.tab)switchTab(b.dataset.tab);
  });
  $('addTop').onclick=()=>openModal();$('addSelected').onclick=()=>openModal();
  $('prev').onclick=()=>{if(view==='month')current.setMonth(current.getMonth()-1);else{const d=parse(selected);d.setDate(d.getDate()-7);selected=key(d);current=new Date(d);}renderCalendar();};
  $('next').onclick=()=>{if(view==='month')current.setMonth(current.getMonth()+1);else{const d=parse(selected);d.setDate(d.getDate()+7);selected=key(d);current=new Date(d);}renderCalendar();};
  $('today').onclick=()=>{current=new Date(today);selected=key(today);renderCalendar();};
  $('monthView').onclick=()=>{view='month';renderCalendar();};$('weekView').onclick=()=>{view='week';renderCalendar();};
  $('search').oninput=renderList;$('filter').onchange=renderList;$('sort').onchange=renderList;
  render();
  if('serviceWorker' in navigator && location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();