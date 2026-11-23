'use strict';
const KEY='clar-board-v1';
const $=s=>document.querySelector(s),makeId=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);
let lang='ca';
function resolveLanguage(tag) {
  if (!tag) return null;
  const normalized = tag.toLowerCase().replaceAll('_', '-');
  if (normalized === 'ar-eg') return 'arz';
  const base = normalized.split('-')[0];
  return Object.hasOwn(copy, base) ? base : null;
}
const requestedLanguage = new URL(location.href).searchParams.get('lang');
let canonicalLanguage = resolveLanguage(requestedLanguage) || document.documentElement.dataset.route || 'x-default';
const assetBase = document.baseURI;
document.querySelector('base').href = assetBase;
let savedLanguage;
try { savedLanguage = localStorage.getItem('clar-language'); } catch {}
lang = resolveLanguage(requestedLanguage) || resolveLanguage(document.documentElement.dataset.route) || resolveLanguage(savedLanguage)
  || Array.from(navigator.languages || [], resolveLanguage).find(Boolean) || 'ca';
const selector = document.querySelector('#language');
for (const [code, locale] of Object.entries(copy).sort((a,b) => a[1].name.localeCompare(b[1].name, 'en'))) {
  const option = new Option(locale.name, code);
  option.lang = code;
  option.dir = 'auto';
  selector.append(option);
}
const t=key=>copy[lang][key];
let personal=[],demoTasks=copy.ca.sample.map((text,i)=>({id:makeId(),text,q:Math.floor(i/2),done:false,sampleIndex:i})),demo=false,filterDone=false,editing=null,undoState=null,toastTimer,dragged=null,saveFailed=false;
try{const raw=localStorage.getItem(KEY);if(raw){const parsed=JSON.parse(raw);if(!Array.isArray(parsed.tasks))throw Error('Invalid storage');personal=parsed.tasks.filter(t=>typeof t.id==='string'&&typeof t.text==='string'&&Number.isInteger(t.q)&&t.q>=0&&t.q<4&&typeof t.done==='boolean');demo=false}}catch{saveFailed=true}
const tasks=()=>demo?demoTasks:personal;
const taskText=task=>demo&&Number.isInteger(task.sampleIndex)?t('sample')[task.sampleIndex]:task.text;
function persist(){if(demo)return;try{localStorage.setItem(KEY,JSON.stringify({tasks:personal}));saveFailed=false}catch{saveFailed=true}}
function remember(){undoState={personal:structuredClone(personal),demoTasks:structuredClone(demoTasks),demo}}
function notify(message,canUndo=true){clearTimeout(toastTimer);$('#toast-text').textContent=message;$('#undo').hidden=!canUndo;$('#toast').hidden=false;toastTimer=setTimeout(()=>{$('#toast').hidden=true},5000)}
function mutate(fn,message){remember();fn();persist();render();if(message)notify(message)}
function node(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el}
function translate(){
 document.documentElement.dir = ['ar', 'arz', 'ur'].includes(lang) ? 'rtl' : 'ltr';
 document.documentElement.lang = lang;
 document.querySelector('meta[name=description]').content = t('board') + '. ' + t('instructions');
 document.querySelector('link[rel=canonical]').href = document.querySelector('link[hreflang="' + canonicalLanguage + '"]').href;
 $('#language').value = lang;
 $('#language').setAttribute('aria-label', t('language'));
 document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));document.querySelectorAll('[data-close]').forEach(b=>b.setAttribute('aria-label',t('close')));
 for(const [id,key] of [['help','help'],['export','export'],['board','board']]){$('#'+id).setAttribute('aria-label',t(key));$('#'+id).title=t(key)}
 $('.tabs').setAttribute('aria-label',t('task'));const dl=$('#help-quadrants');dl.replaceChildren();t('titles').forEach((title,i)=>dl.append(node('dt','',title),node('dd','',t('hints')[i])));
}
function showOptions(task){editing=task.id;$('#task-dialog-title').textContent=taskText(task);const select=$('#move-task');select.replaceChildren();t('titles').forEach((title,i)=>{const option=node('option','',title);option.value=i;option.selected=i===task.q;select.append(option)});$('#task-dialog').showModal()}
function render(){
 translate();const list=tasks();$('#pending-count').textContent=list.filter(t=>!t.done).length;$('#done-count').textContent=list.filter(t=>t.done).length;
 $('#pending-tab').setAttribute('aria-selected',!filterDone);$('#done-tab').setAttribute('aria-selected',filterDone);$('#pending-tab').tabIndex=filterDone?-1:0;$('#done-tab').tabIndex=filterDone?0:-1;
 $('#example').textContent = demo ? t('back') : t('example');
 $('#save-status').replaceChildren(node('span','save-dot'),document.createTextNode(demo?t('demoStatus'):saveFailed?t('saveError'):t('saved')));$('#save-status').title=t('privacy');
 const board=$('#board');board.replaceChildren();
 t('titles').forEach((title,i)=>{
  const card=node('article','quadrant');card.dataset.q=i;card.setAttribute('aria-labelledby','q-title-'+i);
  const visible=list.filter(task=>task.q===i&&task.done===filterDone),header=node('div','q-header'),heading=node('h2','',title);heading.id='q-title-'+i;heading.title=t('hints')[i];header.append(heading,node('span','q-count',visible.length));card.append(header);
  const ul=node('ul','task-list');ul.setAttribute('aria-label',title);ul.tabIndex=0;
  visible.forEach(task=>{
   const label=taskText(task),row=node('li','task'+(task.done?' is-done':''));row.draggable=true;row.dataset.id=task.id;
   const check=node('button','check',task.done?'✓':'');check.setAttribute('role','checkbox');check.setAttribute('aria-checked',task.done);check.setAttribute('aria-label',(task.done?t('restore'):t('complete'))+': '+label);check.onclick=()=>mutate(()=>{task.done=!task.done},t(task.done?'restored':'completed'));
   const text=node('span','task-text',label),more=node('button','task-more','···');more.setAttribute('aria-label',t('options')+': '+label);more.setAttribute('aria-haspopup','dialog');more.onclick=()=>showOptions(task);row.append(check,text,more);
   row.ondragstart=e=>{dragged=task.id;e.dataTransfer.setData('text/plain',task.id);e.dataTransfer.effectAllowed='move';row.classList.add('dragging')};row.ondragend=()=>{dragged=null;row.classList.remove('dragging');document.querySelectorAll('.drag-over').forEach(c=>c.classList.remove('drag-over'))};ul.append(row);
  });
  if(!visible.length){const empty=node('li','empty','—');empty.setAttribute('aria-label',t('empty'));ul.append(empty)}card.append(ul);
  if(!filterDone){const form=node('form','add-form'),plus=node('span','','+'),input=node('input');plus.setAttribute('aria-hidden','true');input.placeholder=t('add');input.maxLength=240;input.autocomplete='off';input.setAttribute('aria-label',t('addTo')+' '+title);input.id='add-'+i;const submit=node('button','','↵');submit.type='submit';submit.setAttribute('aria-label',t('addTo')+' '+title);form.append(plus,input,submit);
   form.onsubmit=e=>{e.preventDefault();const value=input.value.trim();if(!value)return;mutate(()=>tasks().push({id:makeId(),text:value,q:i,done:false}),t('added'));$('#add-'+i).focus()};
   input.addEventListener('paste',e=>{const pasted=e.clipboardData.getData('text');if(!pasted.includes('\n'))return;e.preventDefault();const lines=pasted.split(/\r?\n/).map(v=>v.trim().slice(0,240)).filter(Boolean);if(!lines.length)return;mutate(()=>lines.forEach(text=>tasks().push({id:makeId(),text,q:i,done:false})),t('added')+' · '+lines.length);$('#add-'+i).focus()});card.append(form);
  }
  card.ondragover=e=>{if(dragged){e.preventDefault();e.dataTransfer.dropEffect='move';card.classList.add('drag-over')}};card.ondragleave=e=>{if(!card.contains(e.relatedTarget))card.classList.remove('drag-over')};card.ondrop=e=>{e.preventDefault();const task=tasks().find(t=>t.id===dragged);if(!task)return;const before=e.target.closest('.task');mutate(()=>{const current=tasks();current.splice(current.indexOf(task),1);task.q=i;const index=before?current.findIndex(t=>t.id===before.dataset.id):-1;if(index>=0)current.splice(index,0,task);else current.push(task)},t('ordered'));dragged=null};board.append(card);
 });
}
$('#language').onchange=e=>{
 const drafts=Array.from(document.querySelectorAll('.add-form input'),el=>({id:el.id,value:el.value}));lang=e.target.value;try{localStorage.setItem('clar-language',lang)}catch{}
 if (location.protocol !== 'file:') {
   history.replaceState(null, '', new URL(lang + '.html', assetBase));
 }
 canonicalLanguage = lang;
 $('#toast').hidden = true;
 render();
 drafts.forEach(d => { if ($('#' + d.id)) $('#' + d.id).value = d.value; });
};
$('#pending-tab').onclick=()=>{filterDone=false;render()};$('#done-tab').onclick=()=>{filterDone=true;render()};
document.querySelectorAll('[role=tab]').forEach(b=>b.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();filterDone=!filterDone;render();$(filterDone?'#done-tab':'#pending-tab').focus()}});
$('#example').onclick = () => {
  demo = !demo;
  filterDone = false;
  undoState = null;
  $('#toast').hidden = true;
  render();
};
$('#help').onclick=()=>$('#help-dialog').showModal();document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$('#'+b.dataset.close).close());
$('#move-task').onchange=e=>{const q=Number(e.target.value),task=tasks().find(t=>t.id===editing);if(task)mutate(()=>{task.q=q},t('moved'));$('#task-dialog').close()};
$('#edit-task').onclick=()=>{const task=tasks().find(t=>t.id===editing);if(!task)return;$('#task-dialog').close();$('#edit-text').value=taskText(task);$('#edit-dialog').showModal();$('#edit-text').focus()};
$('#delete-task').onclick=()=>{mutate(()=>{const list=tasks(),index=list.findIndex(t=>t.id===editing);if(index>=0)list.splice(index,1)},t('removed'));$('#task-dialog').close()};
$('#edit-form').onsubmit=e=>{e.preventDefault();const value=$('#edit-text').value.trim();if(!value)return;const task=tasks().find(t=>t.id===editing);if(task)mutate(()=>{task.text=value;delete task.sampleIndex},t('updated'));$('#edit-dialog').close()};
$('#undo').onclick=()=>{if(!undoState)return;({personal,demoTasks,demo}=undoState);undoState=null;persist();render();$('#toast').hidden=true};
$('#export').onclick=()=>{const text=t('titles').map((title,i)=>title.toUpperCase()+'\n'+tasks().filter(t=>t.q===i).map(task=>(task.done?'[x] ':'[ ] ')+taskText(task)).join('\n')).join('\n\n');const url=URL.createObjectURL(new Blob(['PrioriQuad · '+t('title')+'\n\n'+text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='prioriquad-'+lang+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify(t('downloaded'),false)};
render();

