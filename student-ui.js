/* Task-focused student home and a replayable first-use guide. UI demonstration only. */
const STUDENT_GUIDE_KEY='ecs-student-guide-v1';
const STUDENT_TOUR_ENABLED=false;
let guideRequested=false;
function studentGuideStatus(){try{return JSON.parse(localStorage.getItem(STUDENT_GUIDE_KEY)||'null');}catch{return null;}}
function saveStudentGuide(completed){try{localStorage.setItem(STUDENT_GUIDE_KEY,JSON.stringify({seen:true,completed,version:1}));}catch{}}
function upcomingStudentBooking(bookings,now=new Date()){
 return bookings.filter(b=>b.iso&&!/cancelada|completada/i.test(b.status||'')).map(b=>({booking:b,at:new Date(`${b.iso}T${b.time||'00:00'}:00`)})).filter(x=>!Number.isNaN(x.at.valueOf())&&x.at.valueOf()+3600000>now.valueOf()).sort((a,b)=>a.at-b.at)[0]?.booking||null;
}
function studentHomeProgress(taken){
 const total=Math.max(0,Math.min(144,Number(taken)||0)),pct=Math.round(total/144*100);
 return `<section class="home-card home-progress" aria-labelledby="home-progress-title"><header class="home-section-head"><div><span class="home-kicker">UN PASO A LA VEZ</span><h2 id="home-progress-title">Tu camino al inglés</h2></div><span class="home-percentage">${pct}%</span></header><div class="home-progress-count"><strong>${total}</strong><span>de 144 clases completadas</span></div><progress max="144" value="${total}" aria-label="${total} de 144 clases completadas"></progress><ol class="home-stages">${[['Básico',1,48],['Intermedio',49,96],['Avanzado',97,144]].map(([name,start,end],i)=>{const completed=total>=end,current=!completed&&(i===0||total>=start);return `<li class="${completed?'is-complete':current?'is-current':''}"><span class="home-stage-number" aria-hidden="true">${completed?'✓':i+1}</span><div><b>${name}${current?'<em>Tu etapa</em>':''}</b><small>Clases ${start}–${end} · ${end} acumuladas</small></div></li>`;}).join('')}</ol><p class="home-muted">${total===144?'¡Completaste las tres etapas de tu programa!':'Cada clase tomada cuenta para tu siguiente etapa.'}</p></section>`;
}
routes.dashboard=function(){
 if(!journey.completed){location.replace('#/onboarding');return;}
 const profile=learner.profile||{},name=firstName(MOCK.student.name),pkg=learner.package,active=hasActivePackage(),scheduled=active?Number(pkg.scheduled||0):0,left=active?Math.max(0,pkg.count-scheduled):0,next=upcomingStudentBooking(state.bookings),firstVisit=!journey.welcomeSeen;
 const until=active?new Date(pkg.expires).toLocaleDateString('es-MX',{day:'numeric',month:'short'}):'';
 $('#content').innerHTML=`<div class="student-home"><header class="home-heading"><div><span class="home-kicker">${firstVisit?'BIENVENIDA A TU ESPACIO':'MI ESPACIO DE APRENDIZAJE'}</span><h1>Hola, ${safe(name)}<span aria-hidden="true">.</span></h1><p>${firstVisit?'Tu meta ya tiene un punto de partida. Vamos paso a paso.':`Tu meta: ${safe(profile.goal||'seguir aprendiendo inglés')}.`}</p></div><button type="button" class="home-help" data-open-student-guide>${simbolo.info}<span>Guía rápida</span></button></header><div class="home-layout"><div class="home-main"><section class="home-card home-next ${next?'has-class':'is-start'}"><div class="home-next-copy"><span class="home-kicker">${next?'TU PRÓXIMA CLASE':active?'TU SIGUIENTE PASO':'TODO EMPIEZA CON UNA CLASE'}</span><h2>${next?'Tu próxima cita con el inglés':active&&left?'Dale espacio a tu próxima clase':active?'Tu agenda está lista':'Un plan para empezar a hablar'}</h2>${next?`<div class="home-class-date">${simbolo.calendario}<strong>${safe(shortDate(next.iso))} · ${safe(next.time)}</strong></div><div class="home-next-teacher">${portrait(next.teacher,'EC')}<span><b>${safe(next.teacher)}</b><small>Clase individual · 60 minutos</small></span></div><a class="btn" href="#/reservas">Ver mi reserva ${ico.reservas}</a>`:`<p>${active?left?`Tienes ${left} ${left===1?'clase disponible':'clases disponibles'} para reservar antes del ${until}.`:'Consulta tus reservas para revisar tus próximas clases.':'Elige un paquete de 8, 12 o 16 clases y reserva tu primer horario antes de pasar al pago.'}</p><a class="btn" href="${active?left?'#/reservar':'#/reservas':'#/paquetes'}" ${!active?'data-home-packages':''}>${active?left?'Agendar una clase':'Ver mis reservas':'Elegir mi paquete'} <span aria-hidden="true">→</span></a><small>${active?'A tu ritmo, con la metodología de English Club.':'Un maestro que te acompaña. Una ruta de 144 clases.'}</small>`}</div>${!next?'<img class="home-next-art" src="assets/onboarding-goal.webp" width="180" height="180" alt="" aria-hidden="true">':''}</section><div class="home-balances"><a class="home-balance" href="#/tienda"><span>${ico.tienda}</span><div><small>Por agendar</small><strong>${left}<em>${left===1?'clase':'clases'}</em></strong></div><b aria-hidden="true">↗</b></a><a class="home-balance" href="#/reservas"><span>${ico.reservas}</span><div><small>Reservadas</small><strong>${scheduled}<em>${scheduled===1?'clase':'clases'}</em></strong></div><b aria-hidden="true">↗</b></a></div>${active?`<p class="home-expiry">${simbolo.info}<span>Tu paquete vence el <b>${until}</b>. <a href="#/tienda">Ver detalle</a></span></p>`:''}${studentHomeProgress(learner.taken)}</div><aside class="home-secondary"><section class="home-card home-method"><div class="home-section-head"><h2>Conoce tu método</h2><span class="home-mini-tag">ENGLISH CLUB</span></div><div class="home-method-visual" aria-hidden="true"><img src="assets/onboarding-level.webp" alt="" width="180" height="180"><span>Una meta.<br>Tres etapas.</span></div><p>Clases en vivo y práctica entre sesiones. Descubre cómo se conecta tu programa.</p><button class="home-text-button" type="button" data-open-method>Cómo vas a aprender <span aria-hidden="true">→</span></button><small>Video introductorio próximamente.</small></section><section class="home-card home-coins"><span class="home-coin-icon" aria-hidden="true">M</span><div><small>Memo coins</small><strong>${learner.coins}<em>monedas</em></strong><p>100 monedas = 1 clase grupal.<br>Práctica y canje próximamente.</p></div></section><a class="home-preferences-link" href="#/perfil">${ico.perfil}<span>Tu plan cambia contigo.<b>Actualizar preferencias</b></span><span aria-hidden="true">›</span></a></aside></div><p class="home-demo-note">Vista previa · datos de ejemplo guardados en este navegador.</p></div>`;
 $('[data-open-student-guide]').onclick=()=>openStudentGuide();$('[data-open-method]').onclick=openStudentMethod;
 $$('[data-home-packages]').forEach(a=>a.addEventListener('click',()=>{purchase={step:0,count:0,teacher:'',date:'',time:''};}));
 journey.welcomeSeen=true;saveJourney();
 if(STUDENT_TOUR_ENABLED&&(guideRequested||!studentGuideStatus()?.seen)){guideRequested=false;requestAnimationFrame(()=>{if(location.hash==='#/dashboard'&&!document.querySelector('dialog[open]'))openStudentGuide();});}
};
function openStudentMethod(){
 $('#student-method-dialog')?.remove();const modal=document.createElement('dialog');modal.id='student-method-dialog';modal.className='student-help-dialog';modal.setAttribute('aria-labelledby','method-title');
 modal.innerHTML=`<div class="student-help-content"><button class="help-close" type="button" aria-label="Cerrar metodología">×</button><span class="home-kicker">ASÍ APRENDES EN ENGLISH CLUB</span><h2 id="method-title">Una ruta clara, clase a clase.</h2><ol class="method-explanation"><li><b>Aprende con un maestro</b><p>Clases individuales en vivo con una metodología compartida.</p></li><li><b>Practica entre sesiones</b><p>Tareas, juegos y materiales acompañan lo que trabajas en clase.</p></li><li><b>Avanza por tres etapas</b><p>Básico: 1–48. Intermedio: 49–96. Avanzado: 97–144 clases.</p></li></ol><p class="home-muted">El video de la metodología estará aquí cuando esté disponible.</p><button type="button" class="btn full" data-close-method>Entendido</button></div>`;
 document.body.append(modal);$$('.help-close,[data-close-method]',modal).forEach(b=>b.onclick=()=>modal.close());modal.addEventListener('close',()=>{modal.remove();$('[data-open-method]')?.focus();},{once:true});modal.showModal();
}
const STUDENT_GUIDE_STEPS=[
 {icon:'dashboard',title:'Este es tu punto de partida',copy:'En Inicio encontrarás tu próxima clase, las clases disponibles y el avance de tu programa.',tip:'Tu acción más importante aparece primero. El resto está un poco más abajo.',label:'Inicio',visual:['Próxima clase','Clases disponibles','Tu progreso']},
 {icon:'tienda',title:'Elige el ritmo de tu aprendizaje',copy:'Desde Tienda puedes elegir un paquete de 8, 12 o 16 clases. Antes del pago, seleccionarás maestro y horario para tu primera clase.',tip:'Las clases tienen un mes de vigencia. En esta versión todo es de demostración.',label:'Tienda',visual:['1 · Paquete','2 · Primera clase','3 · Pago']},
 {icon:'reservar',title:'Ponle fecha a tus clases',copy:'Reservar te ayuda a organizar las clases de tu paquete. Mis reservas reúne las fechas que ya confirmaste.',tip:'La agenda semanal sigue en construcción; los horarios y las reservas son de ejemplo.',label:'Tu agenda',visual:['Elige maestro','Define tu horario','Revisa las fechas']},
 {icon:'mensajes',title:'Tu equipo está a un toque',copy:'El icono de mensajes en el encabezado abre tus conversaciones. Después de reservar, tu maestro te dará la bienvenida.',tip:'El contador te indica si tienes mensajes sin leer.',label:'Mensajes',visual:['Tu maestro','Tus conversaciones','Mensajes nuevos']},
 {icon:'perfil',title:'Tu plan puede cambiar contigo',copy:'Toca tu avatar y entra en Mi cuenta para actualizar tus preferencias o volver a abrir esta guía.',tip:'Puedes consultarla cuando quieras. Cambiar tus preferencias conserva tus clases y reservas.',label:'Mi cuenta',visual:['Tus preferencias','Repetir cuestionario','Volver a ver la guía']}
];
function openStudentGuide(){
 if(!STUDENT_TOUR_ENABLED)return;
 if($('#student-guide-dialog'))return;
 const modal=document.createElement('dialog');modal.id='student-guide-dialog';modal.className='student-help-dialog student-guide';modal.setAttribute('aria-labelledby','guide-title');
 let index=0,completed=false;const returnFocus=document.activeElement;
 const render=()=>{const s=STUDENT_GUIDE_STEPS[index];modal.innerHTML=`<div class="student-help-content"><button class="help-close" type="button" aria-label="Cerrar guía">×</button><div class="guide-topline"><span>GUÍA DE TU ESPACIO</span><span role="status">${index+1} de ${STUDENT_GUIDE_STEPS.length}</span></div><div class="guide-step-icon" aria-hidden="true">${ico[s.icon]}</div><h2 id="guide-title">${s.title}</h2><p class="guide-copy">${s.copy}</p><div class="guide-preview" aria-label="${s.label}"><span>${s.label}</span>${s.visual.map((text,i)=>`<div><i aria-hidden="true">${i+1}</i><b>${text}</b><span aria-hidden="true">${i<2?'›':'✓'}</span></div>`).join('')}</div><p class="guide-tip">${simbolo.info}<span>${s.tip}</span></p><div class="guide-dots" aria-hidden="true">${STUDENT_GUIDE_STEPS.map((_,i)=>`<i class="${i===index?'active':''}"></i>`).join('')}</div><div class="guide-controls"><button type="button" class="guide-back" ${index===0?'disabled':''}>Anterior</button><button type="button" class="btn guide-next">${index===STUDENT_GUIDE_STEPS.length-1?'Empezar':'Siguiente'} <span aria-hidden="true">→</span></button></div><button type="button" class="guide-later">${index===0?'Explorar por mi cuenta':'Continuar después'}</button></div>`;
 $('.help-close',modal).onclick=$('.guide-later',modal).onclick=()=>modal.close();$('.guide-back',modal).onclick=()=>{if(index>0){index--;render();$('.guide-next',modal).focus();}};
 $('.guide-next',modal).onclick=()=>{if(index===STUDENT_GUIDE_STEPS.length-1){completed=true;modal.close();}else{index++;render();$('.guide-next',modal).focus();}};
 };
 render();document.body.append(modal);modal.addEventListener('close',()=>{saveStudentGuide(completed);modal.remove();if(returnFocus?.isConnected&&returnFocus!==document.body)returnFocus.focus({preventScroll:true});else $('[data-open-student-guide]')?.focus({preventScroll:true});},{once:true});modal.showModal();
}
const profileBeforeStudentGuide=routes.perfil;
routes.perfil=function(){
 profileBeforeStudentGuide();
 $('.journey-account-preferences').insertAdjacentHTML('beforeend','<div class="account-guide-entry"><div><b>¿Cómo funciona mi espacio?</b><p>Un recorrido breve por las clases, la agenda y los mensajes.</p></div><button type="button" class="btn ghost" data-replay-student-guide>Ver guía de funcionamiento</button></div>');
 $('[data-replay-student-guide]').onclick=()=>{guideRequested=true;location.hash='#/dashboard';};
};
// Stage changes should start at the question heading, not at the old scroll position.
document.addEventListener('click',event=>{
 if(location.hash!=='#/paquetes'||!event.target.closest('[data-next],[data-back],[data-edit-class]'))return;
 requestAnimationFrame(()=>{window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});const title=$('#purchase-stage h2');if(title){title.setAttribute('tabindex','-1');title.focus({preventScroll:true});}});
});
/* Larger primary navigation, help hub and reservation actions. */
function reservationStart(booking){
 if(!booking.iso||!/^\d{2}:\d{2}$/.test(booking.time||''))return null;
 const at=new Date(`${booking.iso}T${booking.time}:00`);return Number.isNaN(at.valueOf())?null:at;
}
function futureStudentReservations(bookings=state.bookings,now=new Date()){
 return bookings.filter(b=>{if(/cancelada|completada/i.test(b.status||''))return false;const at=reservationStart(b);return at?at.valueOf()+3600000>now.valueOf():Boolean(b.live);}).sort((a,b)=>(reservationStart(a)?.valueOf()||0)-(reservationStart(b)?.valueOf()||0));
}
function upcomingReservationCount(){return futureStudentReservations().length;}
function bookingMeetUrl(booking){
 try{const url=new URL(booking.meetUrl);if(url.protocol==='https:'&&url.hostname==='meet.google.com')return url.href;}catch{}
 return 'https://meet.google.com/';
}
let reservationView='upcoming';
function renderStudentReservations(){
 const upcoming=futureStudentReservations(),ids=new Set(upcoming),past=state.bookings.filter(b=>!ids.has(b)).sort((a,b)=>(reservationStart(b)?.valueOf()||0)-(reservationStart(a)?.valueOf()||0)),items=reservationView==='past'?past:upcoming;
 $('#content').innerHTML=`${head('TU AGENDA','Mis reservas','Tus próximas clases, en un solo lugar.','<a class="btn dark" href="#/reservar">'+ico.reservar+' Reservar una clase</a>')}<div class="reservation-tabs" role="tablist" aria-label="Tipo de reservas"><button type="button" role="tab" id="reservation-tab-upcoming" aria-controls="reservation-results" aria-selected="${reservationView==='upcoming'}" data-reservation-tab="upcoming">Próximas <span>${upcoming.length}</span></button><button type="button" role="tab" id="reservation-tab-past" aria-controls="reservation-results" aria-selected="${reservationView==='past'}" data-reservation-tab="past">Historial <span>${past.length}</span></button></div><section id="reservation-results" class="reservation-results" role="tabpanel" aria-labelledby="reservation-tab-${reservationView}">${items.length?items.map(booking=>{
 const at=reservationStart(booking),day=at?at.getDate():booking.date?.split(' ')[1]||'—',month=at?at.toLocaleDateString('es-MX',{month:'short'}):'',dateText=at?at.toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long'}):booking.date||'Fecha por confirmar',idx=state.bookings.indexOf(booking);
 return `<article class="reservation-card"><div class="reservation-card-top"><div class="reservation-date"><strong>${day}</strong><span>${month}</span></div><div class="reservation-card-heading"><span class="reservation-status">${reservationView==='past'?'En historial':booking.live?'En vivo':safe(booking.status||'Confirmada')}</span><h2>${safe(booking.service||'Clase de inglés')}</h2><p>${safe(dateText)} · ${safe(booking.time||'Hora por confirmar')}</p></div></div><div class="reservation-teacher">${portrait(booking.teacher,'EC')}<span><b>${safe(booking.teacher)}</b><small>Clase individual · 60 minutos</small></span><span class="reservation-timezone">Hora de Ciudad de México</span></div>${reservationView==='upcoming'?`<div class="reservation-card-actions"><a class="btn reservation-join" href="${safe(bookingMeetUrl(booking))}" target="_blank" rel="noopener noreferrer">${ico.clases}<span>Ir a clase</span><small>Google Meet ↗</small></a><button type="button" class="btn ghost reservation-reschedule" data-reschedule-booking="${idx}">${ico.reservar} Reagendar</button></div>`:''}</article>`;
 }).join(''):empty(simbolo.calendario,reservationView==='past'?'Aún no hay historial':'Tu próxima clase empieza aquí',reservationView==='past'?'Las clases anteriores aparecerán en esta sección.':'Cuando reserves una clase, encontrarás aquí la fecha, tu maestro y el acceso a Google Meet.',reservationView==='past'?'':'<a class="btn dark" href="#/reservar">Reservar una clase</a>')}</section>${items.length&&reservationView==='upcoming'?'<p class="reservation-demo-note">Los accesos a Google Meet son de demostración hasta conectar los salones reales.</p>':''}`;
 $$('[data-reservation-tab]').forEach(button=>button.onclick=()=>{reservationView=button.dataset.reservationTab;renderStudentReservations();$(`[data-reservation-tab="${reservationView}"]`).focus();});
 const tabs=$$('[data-reservation-tab]');tabs.forEach((button,index)=>button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?1:index===0?1:0;tabs[next].click();}));
 $$('[data-reschedule-booking]').forEach(button=>button.onclick=()=>openRescheduleNotice(Number(button.dataset.rescheduleBooking)));
}
routes.reservas=renderStudentReservations;
reservas=renderStudentReservations;
function openRescheduleNotice(index){
 const booking=state.bookings[index];if(!booking||$('#reschedule-notice'))return;
 const at=reservationStart(booking),hours=at?(at.valueOf()-Date.now())/3600000:null,soon=hours!==null&&hours>=0&&hours<24,origin=document.activeElement;
 const modal=document.createElement('dialog');modal.id='reschedule-notice';modal.className='student-help-dialog';modal.setAttribute('aria-labelledby','reschedule-title');
 modal.innerHTML=`<div class="student-help-content"><button type="button" class="help-close" aria-label="Cerrar aviso">×</button><div class="guide-step-icon" aria-hidden="true">${ico.reservar}</div><h2 id="reschedule-title">Reagendar tu clase</h2><p class="guide-copy">Los cambios de horario deben solicitarse con <b>al menos 24 horas de anticipación</b> al inicio de tu clase.</p>${soon?'<p class="reschedule-rule">Tu clase comienza en menos de 24 horas.</p>':''}<div class="reschedule-pending"><b>Esta función todavía está en desarrollo.</b><p>Por ahora no es posible reagendar desde la plataforma. Tu reserva se mantiene igual.</p></div><div class="reschedule-notice-actions"><button type="button" class="btn full" data-understood-reschedule>Entendido</button><a href="#/ayuda" class="reschedule-help-link">Consultar ayuda</a></div></div>`;
 document.body.append(modal);$$('.help-close,[data-understood-reschedule],.reschedule-help-link',modal).forEach(button=>button.addEventListener('click',()=>modal.close()));modal.addEventListener('close',()=>{modal.remove();if(origin?.isConnected)origin.focus({preventScroll:true});},{once:true});modal.showModal();
}
window.rebook=openRescheduleNotice;
routes.ayuda=function(){
 $('#content').innerHTML=`<div class="help-hub">${head('ESTAMOS PARA ACOMPAÑARTE','¿En qué te ayudamos?','Encuentra tu siguiente paso, conoce tu espacio y resuelve tus dudas.')}<section class="help-welcome"><div><span class="home-kicker">EMPIEZA POR AQUÍ</span><h2>Conoce tu forma de aprender.</h2><p>Vuelve a la bienvenida y descubre el programa y la metodología de English Club.</p><button type="button" class="btn" data-help-guide>${ico.clases} Ver bienvenida</button></div><img src="assets/onboarding-pace.webp" alt="" aria-hidden="true" width="170" height="170"></section><section class="help-topic-grid" aria-label="Explora por tema"><a href="#/reservas" class="help-topic">${ico.reservas}<h2>Mis clases y Google Meet</h2><p>Consulta tus reservas y encuentra el botón para entrar a clase.</p><b>Ir a mis reservas →</b></a><a href="#/tienda" class="help-topic">${ico.tienda}<h2>Paquetes y vigencia</h2><p>Revisa las clases disponibles, la fecha de vencimiento y los paquetes.</p><b>Ver mis paquetes →</b></a><a href="#/perfil" class="help-topic">${ico.perfil}<h2>Mi cuenta y preferencias</h2><p>Actualiza tus metas y vuelve a responder el cuestionario.</p><b>Ir a mi cuenta →</b></a><button type="button" class="help-topic" data-help-method>${ico.clases}<h2>Cómo vas a aprender</h2><p>Conoce la metodología y las tres etapas de tu programa de inglés.</p><b>Conocer el programa →</b></button></section><section class="home-card help-faq"><span class="home-kicker">RESPUESTAS A MANO</span><h2>Preguntas frecuentes</h2><details><summary>¿Cómo entro a mi clase?</summary><p>Ve a Mis reservas y toca Ir a clase. Se abrirá Google Meet en otra pestaña. Por ahora los enlaces son de demostración; los salones reales se conectarán después.</p></details><details><summary>¿Puedo reagendar una clase?</summary><p>Los cambios deben solicitarse con al menos 24 horas de anticipación. El módulo está en desarrollo: por ahora Reagendar solo muestra el aviso y conserva tu reserva.</p></details><details><summary>¿Dónde veo mis clases disponibles?</summary><p>En Inicio verás cuántas clases tienes por agendar. Para consultar el paquete y su vigencia, entra en Mis paquetes desde el menú lateral o esta página.</p></details><details><summary>¿Cómo actualizo mis preferencias?</summary><p>Toca Mi cuenta en la esquina superior derecha y elige Actualizar mis preferencias. Tus clases y reservas se conservan.</p></details><details><summary>¿Cuánto dura mi paquete?</summary><p>Los paquetes tienen un mes de vigencia desde la compra. La fecha de vencimiento aparece en Inicio y Mis paquetes. Los precios y pagos actuales son simulados.</p></details></section><section class="help-contact"><div><span class="home-kicker">¿NECESITAS UNA MANO?</span><h2>Hablemos de tu duda.</h2><p>Puedes abrir la conversación de soporte o contactar a la escuela por WhatsApp.</p><small>El chat de la plataforma es una demostración.</small></div><div><a class="btn dark" href="#/mensajes" data-help-support>${ico.mensajes} Abrir chat de soporte</a><a class="btn ghost" href="https://wa.me/526442288102" target="_blank" rel="noopener noreferrer">Contactar por WhatsApp ↗</a></div></section></div>`;
 $('[data-help-guide]').onclick=startWelcomeReplay;$('[data-help-method]').onclick=openStudentMethod;$('[data-help-support]').addEventListener('click',()=>{state.chat='support';});
};
STUDENT_GUIDE_STEPS[1]={icon:'tienda',title:'Tus paquetes tienen su espacio',copy:'Encuentra Mis paquetes en el menú lateral o en Ayuda. Allí puedes consultar tus clases disponibles, la vigencia y comprar otro paquete.',tip:'La barra inferior reúne Inicio, Reservar, Mis reservas y Ayuda.',label:'Mis paquetes',visual:['Clases disponibles','Vigencia del paquete','Elegir otro paquete']};
STUDENT_GUIDE_STEPS[2].tip='En Mis reservas puedes abrir Google Meet. Reagendar requiere al menos 24 horas de anticipación; el módulo todavía está en desarrollo.';
/* Video-led welcome. The official school video can be configured here later. */
const WELCOME_VIDEO_URL='';
const WELCOME_FILM_KEY='ecs-welcome-film-v1';
let welcomeReplayRequested=false,welcomePreviewTimer=null;
const WELCOME_PREVIEW_SLIDES=[
 {image:'assets/onboarding-goal.webp',title:'Imagina lo que podrás contar.',copy:'Ese viaje, esa oportunidad, esa conversación. Tu meta importa y tus maestros te acompañarán, clase a clase.'},
 {image:'assets/onboarding-level.webp',title:'Una ruta. Tres etapas.',copy:'144 clases: básico hasta la 48, intermedio hasta la 96 y avanzado hasta la 144.'},
 {image:'assets/onboarding-pace.webp',title:'Encuentra tu ritmo.',copy:'Elige paquetes de 8, 12 o 16 clases y reserva las fechas que mejor se acomoden a tu semana.'},
 {image:'assets/onboarding-profession.webp',title:'No necesitas hacerlo perfecto.',copy:'Solo empezar. Conoce el método, elige tu primer paquete y celebremos juntos tu primera clase.'}
];
function hasSeenWelcomeFilm(){try{return localStorage.getItem(WELCOME_FILM_KEY)==='seen';}catch{return Boolean(journey.welcomeFilmSeen);}}
function stopWelcomePreview(){if(welcomePreviewTimer){clearInterval(welcomePreviewTimer);welcomePreviewTimer=null;}}
function startWelcomeReplay(){welcomeReplayRequested=true;if(location.hash==='#/dashboard')routes.dashboard();else location.hash='#/dashboard';}
function renderWelcomeFilm(){
 stopWelcomePreview();welcomeReplayRequested=false;
 const name=firstName(MOCK.student.name);
 $('#content').innerHTML=`<section class="welcome-film"><header><span class="home-kicker">BIENVENIDA A ENGLISH CLUB</span><h1>${safe(name)}, qué gusto tenerte aquí.</h1><p>Cada conversación que hoy imaginas empieza con un primer paso. Vamos a darlo contigo.</p></header>${WELCOME_VIDEO_URL?`<video class="welcome-official-video" controls playsinline preload="metadata" poster="assets/aula-560.webp" aria-label="Video de bienvenida de English Club"><source src="${safe(WELCOME_VIDEO_URL)}"></video>`:`<div class="welcome-player"><div class="welcome-film-poster"><button type="button" class="welcome-play" data-film-play aria-label="Reproducir vista previa de bienvenida"><span aria-hidden="true">▶</span></button><span class="welcome-poster-label">Tu historia en inglés empieza hoy</span><small>No tienes que saberlo todo para comenzar. Estamos contigo.</small></div><div class="welcome-preview-slide" hidden aria-live="polite"><img alt="" aria-hidden="true" width="220" height="220"><div><span>ENGLISH CLUB SCHOOL</span><h2></h2><p></p></div></div><div class="welcome-player-controls" hidden><button type="button" data-film-toggle>Pausar</button><progress max="4" value="1" aria-label="Avance de la vista previa"></progress><span data-film-count>1 / 4</span></div></div><p class="welcome-preview-note">Vista previa interactiva de la bienvenida. El video oficial de la escuela se incorporará aquí.</p>`}<div class="welcome-film-highlights"><span>${ico.clases}<b>144 clases</b> para tu programa</span><span>${ico.perfil}<b>Maestros</b> que te acompañan</span><span>${ico.reservar}<b>Tu ritmo</b> de aprendizaje</span></div><footer><p>Podrás volver a ver esta bienvenida desde Mi cuenta.</p><button type="button" class="btn" data-film-finish>Entrar a mi inicio <span aria-hidden="true">→</span></button></footer></section>`;
 $('[data-film-finish]').onclick=()=>{stopWelcomePreview();try{localStorage.setItem(WELCOME_FILM_KEY,'seen');}catch{}journey.welcomeFilmSeen=true;journey.welcomeSeen=true;saveJourney();routes.dashboard();window.scrollTo({top:0,behavior:'instant'});};
 if(WELCOME_VIDEO_URL)return;
 let index=0,playing=false;
 const controls=$('.welcome-player-controls'),slide=$('.welcome-preview-slide'),toggle=$('[data-film-toggle]');
 const update=()=>{const data=WELCOME_PREVIEW_SLIDES[index];$('img',slide).src=data.image;$('h2',slide).textContent=data.title;$('p',slide).textContent=data.copy;$('.welcome-player-controls progress').value=index+1;$('[data-film-count]').textContent=`${index+1} / 4`;if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){slide.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'ease-out'});}};
 const pause=()=>{playing=false;stopWelcomePreview();toggle.textContent=index===3?'Volver a reproducir':'Reproducir';};
 const play=()=>{if(index===3)index=0;playing=true;toggle.textContent='Pausar';update();stopWelcomePreview();welcomePreviewTimer=setInterval(()=>{if(!slide.isConnected||location.hash!=='#/dashboard'){pause();return;}if(index===3){pause();return;}index++;update();},5500);};
 $('[data-film-play]').onclick=()=>{$('.welcome-film-poster').hidden=true;slide.hidden=false;controls.hidden=false;play();toggle.focus({preventScroll:true});};
 toggle.onclick=()=>playing?pause():play();
}
addEventListener('hashchange',stopWelcomePreview);
const dashboardBeforeWelcomeFilm=routes.dashboard;
routes.dashboard=function(){
 if(!journey.completed){location.replace('#/onboarding');return;}
 if(welcomeReplayRequested||!hasSeenWelcomeFilm()){renderWelcomeFilm();return;}
 dashboardBeforeWelcomeFilm();
 const help=$('[data-open-student-guide]');if(help){help.setAttribute('aria-label','Abrir centro de ayuda');help.innerHTML=simbolo.info+'<span>Ayuda</span>';help.onclick=()=>location.hash='#/ayuda';}
 const replay=$('[data-open-method]');if(replay){replay.innerHTML='Ver bienvenida <span aria-hidden="true">→</span>';replay.onclick=startWelcomeReplay;$('.home-method>small').textContent='Bienvenida y metodología de tu programa.';}
};
const profileBeforeWelcomeFilm=routes.perfil;
routes.perfil=function(){profileBeforeWelcomeFilm();$('.account-guide-entry')?.remove();const replay=$('[data-replay-welcome]');if(replay){replay.textContent='Volver a ver la bienvenida';replay.onclick=startWelcomeReplay;}};
/* Explicit class selection replaces the automatic weekly recurrence form. */
let quickBooking=null;
function bookingWeekKey(iso){const date=new Date(iso+'T12:00:00');date.setDate(date.getDate()-((date.getDay()+6)%7));return isoDate(date);}
function bookingChoiceIssue(choice,selected,pkg,bookings,now=new Date()){
 const at=reservationStart(choice),credits=Math.max(0,Number(pkg.count)-Number(pkg.scheduled||0));
 if(!at||!MOCK.times.includes(choice.time))return 'Elige una fecha y un horario válidos.';
 if(at.valueOf()<now.valueOf()+3600000)return 'Elige un horario con al menos una hora de anticipación.';
 if(at>new Date(pkg.expires))return 'Elige una fecha dentro de la vigencia de tu paquete.';
 if(at.getDay()===0)return 'En esta demostración los horarios son de lunes a sábado.';
 if(selected.length>=credits)return 'Ya seleccionaste todas tus clases disponibles.';
 if([...bookings.filter(b=>!/cancelada/i.test(b.status||'')),...selected].some(b=>b.iso===choice.iso))return 'Ya tienes una clase seleccionada o reservada ese día.';
 const perWeek=Number(pkg.perWeek)||Math.max(1,Math.round(pkg.count/4)),week=bookingWeekKey(choice.iso);
 const inWeek=[...bookings.filter(b=>b.iso&&!/cancelada/i.test(b.status||'')),...selected].filter(b=>bookingWeekKey(b.iso)===week).length;
 if(inWeek>=perWeek)return `Tu paquete permite ${perWeek} clases por semana. Elige otra semana.`;
 return null;
}
function firstQuickBookingDate(pkg){const now=new Date(),day=new Date(now);day.setHours(12,0,0,0);for(let i=0;i<35;i++){const iso=isoDate(day);if(MOCK.times.some(time=>!bookingChoiceIssue({iso,time},[],pkg,state.bookings,now)))return iso;day.setDate(day.getDate()+1);if(day>new Date(pkg.expires))break;}return isoDate(now);}
function quickBookingLabels(){return quickBooking.classes.map((c,i)=>`<li><div><b>${safe(shortDate(c.iso))} · ${safe(c.time)}</b><span>${safe(c.teacher)}</span></div><button type="button" data-remove-quick="${i}" aria-label="Quitar clase del ${safe(shortDate(c.iso))} a las ${safe(c.time)}">×</button></li>`).join('');}
function renderQuickSelection(){
 const pkg=learner.package,left=Math.max(0,pkg.count-(pkg.scheduled||0)),count=quickBooking.classes.length;
 const summary=$('#quick-selection');summary.innerHTML=`<header><span class="home-kicker">TU SELECCIÓN</span><h2>${count?`${count} ${count===1?'clase lista':'clases listas'} para reservar`:'Añade tu próxima clase'}</h2></header>${count?`<ul class="quick-selected-list">${quickBookingLabels()}</ul>`:'<p class="quick-selection-empty">Elige un día y toca un horario para añadirlo. Puedes reservar una clase o varias.</p>'}<div class="quick-remaining"><span>Disponibles ahora</span><b>${left}</b><span>Después de confirmar</span><b>${left-count}</b></div><button type="button" class="btn full" data-review-quick ${count?'':'disabled'}>Revisar ${count||''} ${count===1?'clase':'clases'} <span aria-hidden="true">→</span></button><p class="quick-selection-note">No se reservan hasta que confirmes tu selección.</p>`;
 $$('[data-remove-quick]').forEach(button=>button.onclick=()=>{quickBooking.classes.splice(Number(button.dataset.removeQuick),1);renderQuickWeek();renderQuickSlots();renderQuickSelection();});
 $('[data-review-quick]').onclick=()=>{quickBooking.review=true;routes.reservar();window.scrollTo({top:0,behavior:'instant'});};
 let dock=$('#quick-mobile-review');if(!dock){dock=document.createElement('div');dock.id='quick-mobile-review';dock.className='quick-mobile-review';$('.quick-booking').append(dock);}
 dock.hidden=!count;dock.innerHTML=`<span><b>${count} ${count===1?'clase seleccionada':'clases seleccionadas'}</b><small>${left-count} quedarán disponibles</small></span><button type="button" class="btn" data-mobile-review>Revisar →</button>`;
 $('[data-mobile-review]').onclick=$('[data-review-quick]').onclick;
}
function weeklyBookingChoices(anchor,mode,pkg,bookings,selected,now=new Date()){
 const choices=[],skipped=[];if(mode==='once')return {choices,skipped};
 const day=new Date(anchor.iso+'T12:00:00');
 for(let i=1;i<=35;i++){day.setDate(day.getDate()+7);if(day>new Date(pkg.expires))break;const choice={iso:isoDate(day),time:anchor.time,teacher:anchor.teacher};const issue=bookingChoiceIssue(choice,[...selected,...choices],pkg,bookings,now);if(issue)skipped.push({choice,issue});else choices.push(choice);if(mode==='next')break;}
 return {choices,skipped};
}
function renderQuickRepeat(){
 let box=$('#quick-repeat');if(!box){box=document.createElement('div');box.id='quick-repeat';$('#quick-times').after(box);}
 const anchor=quickBooking.classes.find(c=>c.iso===quickBooking.date);if(!anchor){box.innerHTML='';return;}
 const day=new Date(anchor.iso+'T12:00:00').toLocaleDateString('es-MX',{weekday:'long'}),group=anchor.iso+'@'+anchor.time;
 const mode=quickBooking.repeatModes?.[group]||'once';
 box.innerHTML=`<fieldset class="quick-repeat"><legend>¿Quieres repetir los ${safe(day)} a las ${safe(anchor.time)}?</legend><p>Mismo maestro y horario. Puedes quitar cualquier fecha antes de confirmar.</p>${[['once','Solo esta clase'],['next',`Esta y el siguiente ${day}`],['all',`Todos los ${day} dentro de mi paquete`]].map(([value,label])=>`<label><input type="radio" name="quick-repeat" value="${value}" ${mode===value?'checked':''}><span>${safe(label)}</span></label>`).join('')}<small>Se respetan tus clases disponibles, vigencia y límite semanal.</small></fieldset>`;
 $$('input[name="quick-repeat"]').forEach(input=>input.onchange=()=>{
  quickBooking.classes=quickBooking.classes.filter(c=>c.repeatGroup!==group);
  const result=weeklyBookingChoices(anchor,input.value,learner.package,state.bookings,quickBooking.classes);
  quickBooking.classes.push(...result.choices.map(c=>({...c,repeatGroup:group})));
  quickBooking.repeatModes||={};quickBooking.repeatModes[group]=input.value;
  renderQuickWeek();renderQuickSlots();renderQuickSelection();
  $('#quick-live-status').textContent=input.value==='once'?'Se conserva solo esta clase.':`${result.choices.length} clases adicionales añadidas.${result.skipped.length?' Algunas fechas no se añadieron por disponibilidad o límites del paquete.':''}`;
 });
}
function renderQuickSlots(){
 const pkg=learner.package,now=new Date(),teacher=quickBooking.teacher,date=quickBooking.date;
 $('#quick-slot-title').textContent=`Horarios para el ${shortDate(date)}`;
 const already=state.bookings.some(b=>b.iso===date&&!/cancelada/i.test(b.status||'')),selected=quickBooking.classes.find(b=>b.iso===date),all=MOCK.times.map(time=>({time,chosen:selected?.time===time,issue:bookingChoiceIssue({iso:date,time,teacher},quickBooking.classes,pkg,state.bookings,now)}));
 $('#quick-times').innerHTML=all.map(({time,issue,chosen})=>`<button type="button" data-quick-time="${time}" aria-pressed="${chosen}" ${issue&&!chosen?'disabled':''} ${issue&&!chosen?`title="${safe(issue)}"`:''}>${chosen?'✓ ':''}${time}</button>`).join('');
 $('#quick-availability-note').textContent=already?'Ya tienes una reserva este día. Elige otra fecha.':selected?'Horario seleccionado. Tócalo de nuevo para quitar esta clase.':all.every(x=>x.issue)?all[0].issue:'Horarios de ejemplo · hora de Ciudad de México.';
 $$('[data-quick-time]').forEach(button=>button.onclick=()=>{
  const time=button.dataset.quickTime,index=quickBooking.classes.findIndex(c=>c.iso===date&&c.time===time);
  let message;
  if(index>=0){quickBooking.classes.splice(index,1);message='Clase quitada de tu selección. Las demás fechas se conservan.';}
  else{const choice={iso:date,time,teacher:quickBooking.teacher},issue=bookingChoiceIssue(choice,quickBooking.classes,pkg,state.bookings);if(issue){notify(issue);return;}quickBooking.classes.push(choice);message=`Clase del ${shortDate(date)} a las ${time} añadida a tu selección.`;}
  renderQuickWeek();renderQuickSlots();renderQuickSelection();$('#quick-live-status').textContent=message;
 });
 renderQuickRepeat();
}
function renderQuickWeek(){
 const pkg=learner.package,now=new Date(),start=new Date(quickBooking.weekStart+'T12:00:00'),last=new Date(start);last.setDate(start.getDate()+6);
 $('#quick-week-label').textContent=`${shortDate(isoDate(start))} — ${shortDate(isoDate(last))}`;
 $('#quick-days').innerHTML=Array.from({length:7},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);const iso=isoDate(d),valid=MOCK.times.some(time=>!bookingChoiceIssue({iso,time},[],pkg,state.bookings,now)),chosen=quickBooking.classes.some(b=>b.iso===iso);return `<button type="button" data-quick-date="${iso}" aria-pressed="${quickBooking.date===iso}" ${valid||chosen?'':'disabled'}><small>${d.toLocaleDateString('es-MX',{weekday:'short'}).replace('.','')}</small><b>${d.getDate()}</b><span>${chosen?'✓':valid?'·':'—'}</span></button>`;}).join('');
 const prev=new Date(start);prev.setDate(prev.getDate()-7);$('[data-quick-week="prev"]').disabled=isoDate(start)<=isoDate(now);$('[data-quick-week="next"]').disabled=last>=new Date(pkg.expires);
 $$('[data-quick-date]').forEach(button=>button.onclick=()=>{quickBooking.date=button.dataset.quickDate;$('#quick-other-date').value=quickBooking.date;renderQuickWeek();renderQuickSlots();});
}
function renderQuickReview(){
 const left=Math.max(0,learner.package.count-(learner.package.scheduled||0)),count=quickBooking.classes.length;
 $('#content').innerHTML=`<section class="quick-review">${head('ÚLTIMO PASO','Revisa tus clases','Estas son las clases que vas a reservar.')}<div class="home-card"><ul class="quick-selected-list">${quickBookingLabels()}</ul><p class="quick-review-count">Reservarás <b>${count} ${count===1?'clase':'clases'}</b>. Quedarán <b>${left-count}</b> por agendar.</p><p class="quick-selection-note">Reservas de demostración. El módulo de disponibilidad real sigue en construcción.</p><div class="quick-review-actions"><button type="button" class="btn ghost" data-edit-quick>Seguir eligiendo</button><button type="button" class="btn" data-confirm-quick ${count?'':'disabled'}>Confirmar ${count} ${count===1?'clase':'clases'}</button></div></div></section>`;
 $$('[data-remove-quick]').forEach(button=>button.onclick=()=>{quickBooking.classes.splice(Number(button.dataset.removeQuick),1);renderQuickReview();});
 $('[data-edit-quick]').onclick=()=>{quickBooking.review=false;routes.reservar();};
 $('[data-confirm-quick]').onclick=()=>{
  if(!hasActivePackage()){notify('Tu paquete ya no está vigente.');quickBooking=null;routes.reservar();return;}
  const pkg=learner.package,approved=[];
  for(const choice of quickBooking.classes){const issue=bookingChoiceIssue(choice,approved,pkg,state.bookings);if(issue){notify(issue);quickBooking.review=false;routes.reservar();return;}approved.push(choice);}
  if(!approved.length)return;
  const batch=Date.now();state.bookings.push(...approved.map((choice,i)=>({id:batch+i,iso:choice.iso,date:shortDate(choice.iso),time:choice.time,teacher:choice.teacher,service:'English Class',status:'Confirmada'})));
  pkg.scheduled=Number(pkg.scheduled||0)+approved.length;quickBooking=null;saveJourney();reservationView='upcoming';notify(`${approved.length} ${approved.length===1?'clase reservada':'clases reservadas'}.`);location.hash='#/reservas';
 };
}
routes.reservar=function(){
 if(!hasActivePackage()){purchase={step:0,count:0,teacher:'',date:'',time:''};location.replace('#/paquetes');return;}
 const pkg=learner.package,left=Math.max(0,pkg.count-(pkg.scheduled||0)),token=`${pkg.count}-${pkg.expires}`,until=new Date(pkg.expires).toLocaleDateString('es-MX',{day:'numeric',month:'long'});
 if(!left){$('#content').innerHTML=`${head('TU AGENDA','Tus clases ya tienen fecha','Puedes consultarlas desde Mis reservas.')}<section class="home-card quick-done">${ico.reservas}<h2>Ya reservaste todas tus clases</h2><p>Tu paquete es vigente hasta el ${until}.</p><a class="btn" href="#/reservas">Ver mis reservas</a><a class="btn ghost" href="#/tienda">Ver mis paquetes</a></section>`;return;}
 if(!quickBooking||quickBooking.token!==token){const first=firstQuickBookingDate(pkg);quickBooking={token,teacher:state.bookings.at(-1)?.teacher||MOCK.teachers[0][1],date:first,weekStart:first,classes:[],review:false};}
 if(quickBooking.review){renderQuickReview();return;}
 const teacher=MOCK.teachers.find(t=>t[1]===quickBooking.teacher)||MOCK.teachers[0],info=TEACHER_PROFILES[teacher[0]];
 $('#content').innerHTML=`<div class="quick-booking">${head('ELIGE. REVISA. CONFIRMA.','Reserva a tu ritmo','Añade las clases que quieras agendar ahora. El resto puede esperar.')}<div class="quick-credit-strip"><span><b>${left}</b> ${left===1?'clase disponible':'clases disponibles'}</span><span>Vence el ${until}</span><small>${pkg.perWeek||Math.max(1,Math.round(pkg.count/4))} clases por semana</small></div><p class="quick-demo-note">En construcción · horarios y reservas de demostración.</p><div class="quick-booking-grid"><section class="home-card quick-picker"><div class="quick-step-heading"><span>1</span><h2>¿Con quién quieres aprender?</h2></div><label class="quick-teacher-label">Tu maestro<select id="quick-teacher">${MOCK.teachers.map(t=>`<option value="${safe(t[1])}" ${quickBooking.teacher===t[1]?'selected':''}>${t[1]} · ${t[3]}</option>`).join('')}</select></label><details class="quick-teacher-details"><summary>${portrait(teacher[1],teacher[2])}<span>Conocer a ${safe(firstName(teacher[1]))}</span></summary><p>${safe(info.bio)}</p><div>${info.tags.map(tag=>`<span>${safe(tag)}</span>`).join('')}</div><small>Perfil de ejemplo, pendiente de contenido definitivo.</small></details><div class="quick-step-heading quick-date-heading"><span>2</span><h2>Elige fecha y horario</h2></div><div class="quick-week-head"><button type="button" class="quick-week-arrow" data-quick-week="prev" aria-label="Semana anterior">‹</button><b id="quick-week-label"></b><button type="button" class="quick-week-arrow" data-quick-week="next" aria-label="Semana siguiente">›</button></div><div id="quick-days" class="quick-days" role="group" aria-label="Días de clase"></div><label class="quick-other-date">¿Buscas otra fecha?<input id="quick-other-date" type="date" min="${isoDate(new Date())}" max="${isoDate(new Date(pkg.expires))}" value="${quickBooking.date}"></label><h3 id="quick-slot-title"></h3><div id="quick-times" class="quick-times" role="group" aria-labelledby="quick-slot-title"></div><p id="quick-availability-note" class="quick-availability-note"></p><p id="quick-live-status" class="quick-live-status" role="status" aria-live="polite"></p></section><aside class="home-card quick-selection" id="quick-selection" aria-label="Clases seleccionadas"></aside></div></div>`;
 $('#quick-teacher').onchange=event=>{quickBooking.teacher=event.target.value;routes.reservar();};
 $('#quick-other-date').onchange=event=>{if(!event.target.value)return;quickBooking.date=event.target.value;quickBooking.weekStart=event.target.value;renderQuickWeek();renderQuickSlots();};
 $$('[data-quick-week]').forEach(button=>button.onclick=()=>{const next=new Date(quickBooking.weekStart+'T12:00:00');next.setDate(next.getDate()+(button.dataset.quickWeek==='next'?7:-7));const today=isoDate(new Date());quickBooking.weekStart=isoDate(next)<today?today:isoDate(next);quickBooking.date=quickBooking.weekStart;$('#quick-other-date').value=quickBooking.date;renderQuickWeek();renderQuickSlots();});
 renderQuickWeek();renderQuickSlots();renderQuickSelection();
};


// Reset only this prototype's saved data; other localhost apps remain untouched.
routes['reiniciar-demo']=function(){
 $('#content').innerHTML=`<section class="home-card" style="max-width:620px;margin:40px auto;padding:28px"><span class="home-kicker">DEMOSTRACIÓN</span><h1>Empieza desde cero</h1><p>Se borrarán de este navegador tus respuestas al cuestionario, la sesión de prueba, preferencias, paquetes, reservas y progreso de esta demostración.</p><p>Después podrás recorrer el login, el cuestionario, su resumen y la bienvenida antes de entrar a tu inicio. El tour de la aplicación continúa desactivado.</p><p>Estos datos se guardan en el almacenamiento local del navegador (localStorage). No hay una base de datos ni una cuenta real conectada.</p><div class="journey-account-actions"><button class="btn" data-reset-demo>Reiniciar demostración</button><a class="btn ghost" href="#/login">Volver</a></div><p role="status" data-reset-status></p></section>`;
 $('[data-reset-demo]').onclick=()=>{
  try{
   [JOURNEY_STORAGE_KEY,WELCOME_FILM_KEY,STUDENT_GUIDE_KEY].forEach(key=>localStorage.removeItem(key));
   // Save an explicitly empty journey so seeded sample reservations do not return.
   localStorage.setItem(JOURNEY_STORAGE_KEY,JSON.stringify({version:1,completed:false,welcomeSeen:false,active:false,profile:null,answers:{},step:0,taken:0,coins:0,package:null,purchase:{step:0,count:0,teacher:'',date:'',time:''},bookings:[]}));
   state.auth=false;state.bookings=[];state.cart=[];learner={profile:null,package:null,taken:0,coins:0};onboardingAnswers={};onboardingStep=0;purchase={step:0,count:0,teacher:'',date:'',time:''};journey={completed:false,welcomeSeen:false,editing:false};quickBooking=null;saveJourney();
   location.replace(location.pathname+location.search+'#/login');location.reload();
  }catch{ $('[data-reset-status]').textContent='No se pudo reiniciar el almacenamiento. Revisa los permisos de este navegador e inténtalo de nuevo.'; }
 };
};
const profileBeforeDemoReset=routes.perfil;
routes.perfil=function(){
 profileBeforeDemoReset();
 const panels=$('.account-panels');
 if(panels)panels.insertAdjacentHTML('beforeend',`<section class="panel"><h2>Probar la experiencia desde cero</h2><p>Los datos de esta demostración se guardan únicamente en este navegador. Puedes reiniciar el primer acceso, incluyendo cuestionario y bienvenida.</p><a class="btn ghost" href="#/reiniciar-demo">Reiniciar demostración</a></section>`);
};

const shopBeforeMobilePolish=routes.tienda;
routes.tienda=function(){
 shopBeforeMobilePolish();$('#content').classList.add('packages-view');
 const offers=$('.store-more'),balance=$('.store-balance')||$('.store-empty');
 if(offers&&balance)balance.before(offers);
 if($('.store-more h2'))$('.store-more h2').textContent='Elige tu paquete de clases';
};
addEventListener('hashchange',()=>{if(location.hash!=='#/tienda')$('#content')?.classList.remove('packages-view');});


/* A lively home built on the learner's actual demo progress. */
const dashboardBeforeMotivation=routes.dashboard;
routes.dashboard=function(){
 dashboardBeforeMotivation();
 if(!journey.completed)return;
 const home=$('.student-home');if(!home)return;
 const total=Math.max(0,Math.min(144,Number(learner.taken)||0)),stage=total<48?'Básico':total<96?'Intermedio':total<144?'Avanzado':'Programa completo',target=total<48?48:total<96?96:144,remaining=target-total;
 const profile=learner.profile||{},next=upcomingStudentBooking(state.bookings),active=hasActivePackage(),left=active?Math.max(0,learner.package.count-(learner.package.scheduled||0)):0;
 $('.home-heading h1').innerHTML=`Hola, ${safe(firstName(MOCK.student.name))}<span class="home-wave" aria-hidden="true"> ✨</span>`;
 $('.home-heading p').textContent='Un paso hoy. Más confianza mañana.';
 $('.home-heading').insertAdjacentHTML('afterend',`<section class="home-motivation" aria-labelledby="home-motivation-title"><div class="home-motivation-copy"><span class="home-kicker">TU HISTORIA EN INGLÉS</span><h2 id="home-motivation-title">${total===144?'Mira todo lo que has logrado.':total?'Lo que hoy practicas, mañana lo conversas.':'Las grandes conversaciones empiezan con un hola.'}</h2><p>${total===144?'144 clases, una meta cumplida. Celebra tu camino y sigue practicando.':`Tu meta es ${safe((profile.goal||'aprender inglés').toLowerCase())}. No necesitas hacerlo perfecto: cada clase te acerca.`}</p><div class="home-motivation-tags"><span>${ico.clases} ${safe(stage)}</span><span>${total} / 144 clases</span></div></div><div class="home-motivation-art" aria-hidden="true"><span class="home-orbit home-orbit-one"></span><span class="home-orbit home-orbit-two"></span><span class="home-art-word">Hello!</span><img src="assets/onboarding-goal.webp" width="240" height="240" alt=""><span class="home-art-star">✦</span><span class="home-art-note">A tu ritmo</span></div></section>`);
 const progress=$('.home-progress');
 progress.insertAdjacentHTML('beforeend',`<div class="home-next-milestone"><span aria-hidden="true">${total===144?'★':'⚑'}</span><div><b>${total===144?'¡Completaste tu programa!':`Tu próxima meta: ${target} clases`}</b><small>${total===144?'Cada conversación es una nueva oportunidad.':`${remaining} ${remaining===1?'clase más':'clases más'} para completar ${stage.toLowerCase()}. Paso a paso, tú puedes.`}</small></div></div>`);
 $('.home-secondary').insertAdjacentHTML('afterbegin',`<section class="home-card home-daily-step"><header><span class="home-kicker">TU IMPULSO DE HOY</span><span class="home-daily-spark" aria-hidden="true">✦</span></header><h2>${next?'Ya tienes una cita con tu meta.':left?'Hazle un espacio a tu inglés.':'Tu primera clase te espera.'}</h2><p>${next?'Revisa tu próxima clase y llega con ganas de intentarlo. Tu maestro te acompaña.':left?'Elige un horario que vaya contigo. Una clase a la vez también es avanzar.':'Conoce los paquetes y encuentra un ritmo que puedas disfrutar.'}</p><a class="home-daily-action" href="${next?'#/reservas':left?'#/reservar':'#/tienda'}">${next?'Prepararme para mi clase':left?'Elegir mi horario':'Explorar paquetes'} <span aria-hidden="true">→</span></a></section>`);
};


/* Las dos reservas posteriores acompañan a la clase principal, sin repetirla. */
function followingStudentBookings(bookings=state.bookings,now=new Date()){
 const first=upcomingStudentBooking(bookings,now);
 if(!first)return [];
 return bookings.filter(b=>b!==first&&b.iso&&!/cancelada|completada/i.test(b.status||'')).map(b=>({booking:b,at:new Date(`${b.iso}T${b.time||'00:00'}:00`).valueOf()})).filter(x=>Number.isFinite(x.at)&&x.at+3600000>now.valueOf()).sort((a,b)=>a.at-b.at).slice(0,2).map(x=>x.booking);
}
const dashboardBeforeFollowingClasses=routes.dashboard;
routes.dashboard=function(){
 dashboardBeforeFollowingClasses();
 if(!journey.completed)return;
 const card=$('.student-home .home-next.has-class');if(!card)return;
 const following=followingStudentBookings();
 card.classList.add('has-following');
 card.insertAdjacentHTML('beforeend',`<aside class="home-upcoming" aria-labelledby="home-upcoming-title"><header><h3 id="home-upcoming-title">Próximas clases</h3><small>Después de tu próxima clase</small></header>${following.length?`<ol>${following.map((b,i)=>`<li><a href="#/reservas"><span class="home-upcoming-order">${i===0?'Siguiente':'Después'}</span><b>${safe(shortDate(b.iso))}<span> · ${safe(b.time||'00:00')}</span></b><small>Con ${safe(b.teacher||'tu profesor')}</small></a></li>`).join('')}</ol>`:'<p>Aún no tienes más clases reservadas.</p><a class="home-upcoming-book" href="#/reservar">Agendar otra clase →</a>'}</aside>`);
};
