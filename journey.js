/* Personalized first-run experience. All data belongs to this local UI demo. */
const JOURNEY_STORAGE_KEY='ecs-student-journey-demo-v1';
let journey={completed:false,welcomeSeen:false,editing:false};
function saveJourney(){
 try{localStorage.setItem(JOURNEY_STORAGE_KEY,JSON.stringify({version:1,completed:journey.completed,welcomeSeen:journey.welcomeSeen,active:state.auth&&state.role==='student',profile:learner.profile,answers:onboardingAnswers,step:onboardingStep,taken:learner.taken,coins:learner.coins,package:learner.package,purchase,bookings:state.bookings}));}catch{}
}
try{
 const saved=JSON.parse(localStorage.getItem(JOURNEY_STORAGE_KEY)||'null');
 if(saved?.version===1){
  journey.completed=Boolean(saved.completed&&saved.profile);journey.welcomeSeen=Boolean(saved.welcomeSeen);
  learner.profile=saved.profile||null;onboardingAnswers=saved.answers||{...learner.profile};
  onboardingStep=Math.max(0,Math.min(4,Number(saved.step)||0));
  learner.taken=Math.max(0,Math.min(PROGRAM_TOTAL,Number(saved.taken)||0));learner.coins=Number(saved.coins)||0;
  learner.package=saved.package||null;if(saved.purchase)purchase=saved.purchase;if(Array.isArray(saved.bookings))state.bookings=saved.bookings;
  state.auth=Boolean(saved.active);state.role='student';
 }
}catch{}
const journeyArt={
 goal:{src:'assets/onboarding-goal.webp',label:'Tu siguiente paso empieza con una meta.',copy:'Trabajo, viajes o una nueva aventura. Tu inglés tiene un propósito.'},
 industry:{src:'assets/onboarding-industry.webp',label:'El inglés también habla de lo que haces.',copy:'Queremos conocer el mundo en el que te desenvuelves.'},
 job:{src:'assets/onboarding-profession.webp',label:'Tu experiencia hace único tu camino.',copy:'Cuéntanos un poco de ti. Cada punto de partida es distinto.'},
 deadline:{src:'assets/onboarding-pace.webp',label:'Un ritmo que sí cabe en tu vida.',copy:'Lo importante es encontrar una forma de avanzar con constancia.'},
 level:{src:'assets/onboarding-level.webp',label:'No importa dónde empiezas.',copy:'Lo que cuenta es el siguiente paso que vas a dar.'}
};
function journeyKeys(){return (!onboardingAnswers.goal||['Carrera y negocios','Inglés para el trabajo'].includes(onboardingAnswers.goal))?['goal','industry','job','deadline','level']:['goal','deadline','level'];}
function journeyQuestion(){return onboardingQuestions[onboardingStep];}
function journeyFocus(){const title=$('#onboarding-question-title');if(title){title.setAttribute('tabindex','-1');title.focus({preventScroll:true});title.scrollIntoView({behavior:'instant',block:'nearest'});}}
function journeyAside(key){const art=journeyArt[key];return `<aside class="onboarding-visual journey-visual"><a class="onboarding-brand" href="${journey.editing?'#/perfil':'#/login'}" aria-label="English Club School"><img src="assets/logo-ecs-224.webp" alt="English Club School"></a><div class="journey-illustration" aria-hidden="true"><img src="${art.src}" alt="" width="600" height="600" decoding="async"></div><div class="journey-story"><span class="eyebrow">${journey.editing?'TUS PREFERENCIAS':'UN INGLÉS CON PROPÓSITO'}</span><h1>${art.label}</h1><p>${art.copy}</p><div class="journey-dots" aria-hidden="true">${journeyKeys().map(k=>`<i class="${k===key?'current':''}"></i>`).join('')}</div></div></aside>`;}
const layoutBeforeJourney=layout;
layout=function(view){
 if(state.auth&&['#/onboarding','#/onboarding-resumen'].includes(location.hash)){
  app.innerHTML='<main id="content" class="onboarding-standalone"></main>';view();return;
 }
 layoutBeforeJourney(view);
};
enter=function(role){
 state.auth=true;state.role=role;
 if(role==='student'){journey.editing=false;saveJourney();location.hash=journey.completed?'#/dashboard':'#/onboarding';}
 else location.hash='#/teacher-dashboard';
};
routes.onboarding=function(){
 if(journey.completed&&!journey.editing){location.hash='#/dashboard';return;}
 let keys=journeyKeys(),q=journeyQuestion();
 if(!keys.includes(q.key)){onboardingStep=0;q=journeyQuestion();}
 const index=keys.indexOf(q.key),value=onboardingAnswers[q.key]||'',last=index===keys.length-1;
 $('#content').innerHTML=`<section class="onboarding-wizard journey-wizard">${journeyAside(q.key)}<section class="onboarding-body"><div class="journey-form-top"><span>${journey.editing?'Actualiza tu plan':'Hagamos un plan para ti'}</span>${journey.editing?'<button class="journey-cancel" type="button">Cancelar</button>':'<small>Solo en tu primer acceso</small>'}</div><div class="onboarding-progress"><div><span>Paso ${index+1} de ${keys.length}</span><span>${{goal:'Tu objetivo',industry:'Tu área',job:'Tu ocupación',deadline:'Tu ritmo',level:'Tu punto de partida'}[q.key]}</span></div><progress aria-label="Progreso del cuestionario" max="${keys.length}" value="${index+1}"></progress></div><form class="panel onboarding-question" aria-labelledby="onboarding-question-title"><fieldset><legend id="onboarding-question-title">${q.title}</legend><p class="onboarding-hint" id="onboarding-hint">${q.hint}</p>${q.options?`<div class="onboarding-options">${q.options.map(([label,description],i)=>`<label class="onboarding-option" style="--option-delay:${i*35}ms"><input type="radio" name="${q.key}" value="${safe(label)}" ${value===label?'checked':''} required><span class="onboarding-option-copy"><b>${label}</b><small>${description}</small></span><span class="onboarding-check" aria-hidden="true">✓</span></label>`).join('')}</div>`:`<label class="onboarding-text-label" for="onboarding-answer">${q.key==='industry'?'Tu industria o área':'Tu profesión u ocupación'}<input id="onboarding-answer" name="${q.key}" value="${safe(value)}" placeholder="${q.placeholder}" maxlength="120" aria-describedby="onboarding-hint" autocomplete="off"></label>`}</fieldset><div class="onboarding-controls"><button type="button" class="btn ghost" data-journey-back ${index===0?'disabled':''}>← Anterior</button><div>${!q.options?'<button type="button" class="onboarding-skip">Omitir por ahora</button>':''}<button class="btn onboarding-continue" ${q.options&&!value?'disabled':''}>${last?'Revisar mi plan':'Continuar'} <span aria-hidden="true">→</span></button></div></div></form><p class="onboarding-footnote">Podrás cambiar tus preferencias en Mi cuenta.<br><span>Demostración · guardadas únicamente en este navegador.</span></p></section></section>`;
 const form=$('.onboarding-question'),next=$('.onboarding-continue');
 const save=()=>{onboardingAnswers[q.key]=String(new FormData(form).get(q.key)||'').trim();saveJourney();};
 const advance=()=>{const nextKeys=journeyKeys();const current=nextKeys.indexOf(q.key);if(current===nextKeys.length-1){saveJourney();location.hash='#/onboarding-resumen';return;}onboardingStep=onboardingQuestions.findIndex(item=>item.key===nextKeys[current+1]);saveJourney();routes.onboarding();journeyFocus();};
 $$('input',form).forEach(input=>input.addEventListener('input',()=>{save();if(q.options)next.disabled=!onboardingAnswers[q.key];if(q.key==='goal'){const updatedKeys=journeyKeys();$('.onboarding-progress progress').max=updatedKeys.length;$('.onboarding-progress>div>span').textContent=`Paso 1 de ${updatedKeys.length}`;$('.journey-dots').innerHTML=updatedKeys.map((key,i)=>`<i class="${i===0?'current':''}"></i>`).join('');}}));
 form.onsubmit=e=>{e.preventDefault();save();if(q.options&&!onboardingAnswers[q.key])return;advance();};
 $('[data-journey-back]').onclick=()=>{save();if(index>0){onboardingStep=onboardingQuestions.findIndex(item=>item.key===keys[index-1]);saveJourney();routes.onboarding();journeyFocus();}};
 $('.onboarding-skip')?.addEventListener('click',()=>{onboardingAnswers[q.key]='';saveJourney();advance();});
 $('.journey-cancel')?.addEventListener('click',cancelPreferenceUpdate);
 enhanceIndustrySearch();
};
function preferenceRows(profile){return onboardingQuestions.filter(q=>q.key!=='industry'&&q.key!=='job'||['Carrera y negocios','Inglés para el trabajo'].includes(profile.goal)).map(q=>`<div><dt>${{goal:'Tu objetivo',industry:'Tu área',job:'Tu ocupación',deadline:'Tu ritmo',level:'Tu nivel actual'}[q.key]}</dt><dd>${safe(profile[q.key]||'Sin especificar')}</dd></div>`).join('');}
routes['onboarding-resumen']=function(){
 if(!onboardingAnswers.goal||!onboardingAnswers.deadline||!onboardingAnswers.level){location.hash='#/onboarding';return;}
 $('#content').innerHTML=`<section class="onboarding-wizard journey-wizard">${journeyAside('level')}<section class="onboarding-body journey-summary"><span class="journey-summary-mark" aria-hidden="true">✓</span><span class="eyebrow">ESTE ES TU PUNTO DE PARTIDA</span><h2>${journey.editing?'Un plan que evoluciona contigo.':'Tu camino empieza a tomar forma.'}</h2><p>Estas preferencias nos ayudan a conocerte. Puedes actualizarlas cuando cambien tus metas.</p><dl class="journey-preferences">${preferenceRows(onboardingAnswers)}</dl><div class="journey-summary-actions"><button class="btn ghost" data-review-answers>Revisar respuestas</button><button class="btn" data-finish-journey>${journey.editing?'Guardar preferencias':'Conocer mi espacio'} →</button></div><p class="onboarding-footnote">${journey.editing?'Actualizar preferencias no cambia tu progreso ni tus reservas.':'Sin compras ni compromisos. Primero, conoce tu programa.'}</p></section></section>`;
 $('[data-review-answers]').onclick=()=>{onboardingStep=0;location.hash='#/onboarding';};
 $('[data-finish-journey]').onclick=()=>{
  const editing=journey.editing;learner.profile={...onboardingAnswers};
  if(!['Carrera y negocios','Inglés para el trabajo'].includes(learner.profile.goal)){delete learner.profile.industry;delete learner.profile.job;}
  journey.completed=true;journey.editing=false;saveJourney();location.hash=editing?'#/perfil':'#/dashboard';if(editing)notify('Preferencias actualizadas en esta demostración.');
 };
};
function startPreferenceUpdate(){journey.editing=true;onboardingAnswers={...learner.profile};onboardingStep=0;saveJourney();location.hash='#/onboarding';}
function cancelPreferenceUpdate(){journey.editing=false;onboardingAnswers={...learner.profile};onboardingStep=0;saveJourney();location.hash='#/perfil';}
function courseStage(taken){return taken>=PROGRAM_TOTAL?'Programa completado':taken>96?'Avanzado':taken>48?'Intermedio':'Básico';}
const dashboardBeforeJourney=routes.dashboard;
routes.dashboard=function(){
 if(!journey.completed){location.hash='#/onboarding';return;}
 dashboardBeforeJourney();
 const firstVisit=!journey.welcomeSeen,profile=learner.profile||{},taken=learner.taken;
 $('.content-head')?.remove();
 $('#content').insertAdjacentHTML('afterbegin',firstVisit?`<section class="journey-welcome"><div class="journey-welcome-copy"><span class="eyebrow">TU PRIMER DÍA EN ENGLISH CLUB</span><h1>Andrea, este es el comienzo<br>de tu siguiente capítulo.</h1><p>Tu meta es <b>${safe((profile.goal||'aprender inglés').toLowerCase())}</b>. Aquí tendrás una ruta clara y un equipo que te acompaña.</p><div class="journey-welcome-tags"><span>${safe(profile.level||'Tu punto de partida')}</span><span>${safe(profile.deadline||'A tu ritmo')}</span><span>144 clases · 3 etapas</span></div><button class="btn" data-begin-exploring>Conocer mi programa <span aria-hidden="true">↓</span></button></div><img src="assets/onboarding-goal.webp" alt="Una meta para tu nuevo camino con el inglés" width="420" height="420"><div class="welcome-sparks" aria-hidden="true">${Array.from({length:7},(_,i)=>`<i style="--spark:${i}"></i>`).join('')}</div></section><section class="journey-first-steps" aria-label="Tus primeros pasos"><article><span>01</span><b>Conoce el método</b><p>Descubre cómo se conectan tus clases y tu práctica.</p></article><article><span>02</span><b>Encuentra tu ritmo</b><p>Elige un paquete de 8, 12 o 16 clases.</p></article><article><span>03</span><b>Ponle fecha a tu meta</b><p>Selecciona maestro y reserva tu primera clase.</p></article></section>`:`<section class="journey-return"><div><span class="eyebrow">QUÉ BUENO VERTE DE NUEVO</span><h1>Hola, Andrea.</h1><p>Tu meta: ${safe(profile.goal||'seguir aprendiendo inglés')}. Cada clase cuenta.</p></div><a class="btn ghost" href="#/perfil">Mis preferencias</a></section>`);
 const progress=$('.program-progress');
 progress.innerHTML=`<div class="panel-head"><div><span class="eyebrow">TU CAMINO COMPLETO</span><h2>Progreso total</h2></div><b>${taken} / 144 clases</b></div><progress max="144" value="${taken}" aria-label="Clases completadas de las 144 del programa"></progress><div class="journey-milestones">${[['Básico',1,48],['Intermedio',49,96],['Avanzado',97,144]].map(([name,start,end],i)=>`<div class="${taken>=end?'completed':taken>=start-1&&(i===0||taken>start-1)?'in-progress':''}"><span class="milestone-dot" aria-hidden="true">${taken>=end?'✓':i+1}</span><b>${name}</b><small>Clases ${start}–${end}</small><em>${end} clases acumuladas</em></div>`).join('')}</div><p class="journey-stage-label">${taken===144?'¡Completaste tu programa!':`Etapa actual: <b>${courseStage(taken)}</b>. ${144-taken} clases para completar tu programa.`}</p>`;
 const method=$('.method-video');method.id='mi-programa';
 $('.video-placeholder').innerHTML='<span aria-hidden="true">▶</span><h2>Conoce tu método</h2><p>El video de bienvenida estará aquí cuando esté disponible.</p>';
 $('.demo-note').textContent='Vista previa del alumno · preferencias y progreso de ejemplo guardados en este navegador.';
 const quickLinks=document.createElement('div');quickLinks.className='journey-dashboard-note';quickLinks.innerHTML='<span>Tu plan puede cambiar contigo.</span><a href="#/perfil">Actualizar mis preferencias →</a>';$('#content').append(quickLinks);
 $('[data-begin-exploring]')?.addEventListener('click',()=>{method.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});method.classList.add('journey-panel-highlight');method.setAttribute('tabindex','-1');method.focus({preventScroll:true});});
 if(firstVisit)journey.welcomeSeen=true;
 saveJourney();
};
const profileBeforeJourney=routes.perfil;
routes.perfil=function(){
 profileBeforeJourney();
 $('.profile-summary p').textContent=`Programa · ${courseStage(learner.taken)}`;
 $('.account-panels').insertAdjacentHTML('afterbegin',`<section class="panel journey-account-preferences"><div class="panel-head"><div><span class="eyebrow">UN PLAN QUE CAMBIA CONTIGO</span><h2>Mis preferencias de aprendizaje</h2></div><span class="journey-saved-badge">${journey.completed?'Guardadas':'Pendientes'}</span></div><p>Vuelve a responder el cuestionario para ajustar tu objetivo, ritmo y punto de partida.</p><dl class="journey-preferences">${learner.profile?preferenceRows(learner.profile):'<div><dd>Aún no has completado tu perfil de aprendizaje.</dd></div>'}</dl><div class="journey-account-actions"><button class="btn" data-update-preferences>Actualizar mis preferencias →</button><button class="btn ghost" data-replay-welcome>Volver a ver la bienvenida</button></div><p class="journey-local-note">Preferencias guardadas en este navegador para la demostración.</p></section>`);
 $('[data-update-preferences]').onclick=startPreferenceUpdate;
 $('[data-replay-welcome]').onclick=()=>{journey.welcomeSeen=false;saveJourney();location.hash='#/dashboard';};
};
// Capture before the existing logout click handler; no real authentication is stored.
document.addEventListener('click',event=>{if(event.target.closest('[data-logout]')){state.auth=false;journey.editing=false;saveJourney();}},true);
addEventListener('pagehide',saveJourney);
// Resume the demo in the right place when a bookmarked login page is reopened.
addEventListener('DOMContentLoaded',()=>{
 if(state.auth&&['#/login','#/registro'].includes(location.hash))location.hash=journey.completed?'#/dashboard':'#/onboarding';
});
