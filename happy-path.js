const PROGRAM_TOTAL = 144;
const PACKAGES = [8,12,16];
// Precios de ejemplo en USD hasta que se aprueben los definitivos.
const PACKAGE_PRICES = {8:80, 12:120, 16:160};
let learner = {profile:null, package:null, taken:0, coins:0};
let purchase = {step:0, count:0, teacher:'', date:'', time:''};
// Perfil del maestro en "Primera clase". video: ruta o URL del video de presentación ('' = pendiente).
// Las descripciones y especialidades son de ejemplo hasta validarlas con cada maestro.
const TEACHER_PROFILES = {
 ashley:{video:'', bio:'Acompaña a quienes estudian inglés como segunda lengua con clases estructuradas y mucha práctica oral.', tags:['Inglés como segunda lengua','Gramática','Pronunciación']},
 gonzalo:{video:'', bio:'Te guía por las etapas del programa de 144 clases y cuida que cada clase sume a tu meta.', tags:['Programa completo','Seguimiento','Bases sólidas']},
 jim:{video:'', bio:'Sus clases se centran en hablar desde el primer día, con temas cotidianos y de trabajo.', tags:['Conversación','Fluidez','Inglés para el trabajo']},
 memo:{video:'', bio:'Explica en español cuando hace falta: ideal si empiezas desde cero o quieres resolver dudas con confianza.', tags:['Bilingüe','Desde cero','Dudas en español']}
};
const safe = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// '2026-10-30' → 'Vie 30 oct', el formato de fecha que usa app.js en sus reservas.
const shortDate = iso => { if (!iso) return ''; const d = new Date(iso + 'T12:00:00'); const dia = d.toLocaleDateString('es-MX', {weekday:'short'}).replace('.', ''); return `${dia[0].toUpperCase()}${dia.slice(1)} ${d.getDate()} ${d.toLocaleDateString('es-MX', {month:'short'}).replace('.', '')}`; };
// Date local → 'AAAA-MM-DD'.
const isoDate = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const firstName = name => name.split(' ')[0];
// Panel de perfil del maestro, usado en "Primera clase" y en Reservar.
const teacherProfileHTML = (t, chosen, chosenText, note) => { const info=TEACHER_PROFILES[t[0]]; return `<span class="eyebrow">Conoce a tu maestro</span><div class="teacher-video">${info.video?`<video src="${safe(info.video)}" controls preload="none" playsinline aria-label="Video de presentación de ${safe(t[1])}"></video>`:`<div class="teacher-video-empty"><span aria-hidden="true">▶</span><b>Video de presentación</b><small>Disponible próximamente</small></div>`}</div><div class="teacher-profile-head">${portrait(t[1],t[2])}<div><h2>${t[1]}</h2><p>${t[3]}</p></div></div><p class="teacher-bio">${info.bio}</p><ul class="teacher-tags">${info.tags.map(x=>`<li>${x}</li>`).join('')}</ul>${chosen?`<p class="teacher-picked" role="status">✓ ${safe(chosenText)}</p>`:`<button type="button" class="btn dark teacher-pick" data-pick>Elegir a ${safe(firstName(t[1]))}</button>`}<p class="teacher-first-note">${note}</p><p class="demo-note">Video, descripción y especialidades de ejemplo, pendientes de contenido.</p>`; };
const teacherCardsHTML = () => MOCK.teachers.map(t=>`<article data-teacher-card="${t[0]}">${portrait(t[1],t[2])}<div><h3>${t[1]}</h3><p>${t[3]}</p></div><span class="teacher-chosen">✓ Tu elección</span><button type="button" class="btn ghost" data-preview="${t[0]}">Ver perfil</button></article>`).join('');
const originalLogin = login;
const originalRegister = registro;
const originalEnter = enter;
enter = role => { state.auth=true; state.role=role; location.hash=role==='student'?(learner.profile?'#/dashboard':'#/onboarding'):'#/teacher-dashboard'; };
function socialButtons(){return `<div class="social-options"><p>Acceso social · Vista previa</p><button type="button" class="btn ghost" data-social="Google">Continuar con Google</button><button type="button" class="btn ghost" data-social="Facebook">Continuar con Facebook</button><small>Demostración de interfaz. No conecta con tus cuentas.</small></div>`;}
function wireSocial(){ $$('[data-social]').forEach(b=>b.onclick=()=>{notify(`Acceso con ${b.dataset.social}: demostración`);enter('student');}); }
routes.login = () => {originalLogin();$('.login-form').insertAdjacentHTML('afterbegin',socialButtons());wireSocial();};
routes.registro = () => {originalRegister();const form=$('.login-form');form.insertAdjacentHTML('afterbegin',socialButtons());form.querySelector('input[type=password]').insertAdjacentHTML('afterend','');form.querySelector('.check').insertAdjacentHTML('beforebegin','<label>Teléfono<input type="tel" autocomplete="tel" placeholder="55 1234 5678" required></label>');wireSocial();};
routes.onboarding = () => {
 $('#content').innerHTML=`${head('Tu punto de partida','Hagamos un plan para ti','Cuéntanos qué quieres lograr con tu inglés.')}<form class="panel profile-survey"><label>¿Cuál es tu objetivo principal?<select name="goal" required><option value="">Elige tu objetivo</option>${['Carrera y negocios','Inglés para niños','Preparación de exámenes','Inglés para el trabajo','Viajes','Pasatiempos'].map(x=>`<option>${x}</option>`).join('')}</select></label><div class="two-fields"><label>Industria o área laboral<input name="industry" placeholder="Ej. tecnología, salud, educación"></label><label>Profesión u ocupación<input name="job" placeholder="Ej. estudiante, ingeniero"></label></div><label>¿En cuánto tiempo quieres lograrlo?<select name="deadline" required><option value="">Elige un plazo</option><option>9 meses</option><option>18 meses</option><option>Aún no lo sé</option></select></label><label>¿Cuál es tu nivel actual?<select name="level" required><option value="">Elige tu nivel</option><option>Desde cero</option><option>Básico</option><option>Intermedio</option><option>Avanzado</option><option>No estoy seguro</option></select></label><p>Estas respuestas personalizan esta demostración durante tu visita.</p><button class="btn dark">Ver mi plan de aprendizaje →</button></form>`;
 $('.profile-survey').onsubmit=e=>{e.preventDefault();learner.profile=Object.fromEntries(new FormData(e.target));location.hash='#/dashboard';};
};
routes.dashboard = () => {
 const scheduled=learner.package?(learner.package.scheduled||1):0,remaining=learner.package?Math.max(0,learner.package.count-scheduled):0;
 $('#content').innerHTML=`${head('MI CAMINO AL INGLÉS','Cada clase te acerca a tu meta',learner.profile?`Tu objetivo: ${safe(learner.profile.goal)}`:'Un programa, una metodología y maestros que te acompañan.')}<section class="learning-stats"><article class="panel"><small>Programa completo</small><strong>144</strong><span>clases en tu camino a B2</span></article><article class="panel"><small>Clases tomadas</small><strong>${learner.taken}</strong><span>de 144 clases</span></article><article class="panel"><small>Por agendar</small><strong>${remaining}</strong><span>${learner.package?(scheduled===1?'1 clase ya reservada':`${scheduled} clases ya reservadas`):'Elige tu primer paquete'}</span></article><article class="panel"><small>Memo coins</small><strong>${learner.coins}</strong><span>100 monedas = 1 clase grupal</span></article></section><section class="panel program-progress"><div class="panel-head"><h2>Tu progreso total</h2><b>${learner.taken} / 144 clases</b></div><progress max="144" value="${learner.taken}"></progress><div class="level-track"><span>Básico · 48 clases</span><span>Intermedio · 48 clases</span><span>Avanzado · 48 clases</span></div></section><section class="method-layout"><article class="panel method-video"><div class="video-placeholder"><span>▶</span><h2>Así vas a aprender inglés</h2><p>Video de bienvenida pendiente de English Club</p></div><div class="method-copy"><span class="eyebrow">Tu método, paso a paso</span><h2>Una ruta clara hacia tu siguiente nivel</h2><p>144 clases, tres niveles y práctica acompañada. Elige un ritmo de 4 clases por semana durante 9 meses, o 2 clases durante 18 meses.</p><p>Clases en vivo, tareas, juegos y pizarrón digital para seguir practicando.</p><a class="btn bright" href="#/paquetes">${learner.package?'Comprar otro paquete':'Elegir mi primer paquete'} →</a></div></article><aside class="panel"><span class="eyebrow">Tu siguiente paso</span><h2>${learner.package?'Tu primera clase está lista':'Comienza con una clase'}</h2><p>${learner.package?`${safe(purchase.teacher)} · ${safe(shortDate(purchase.date))} · ${safe(purchase.time)}`:'Elige un paquete, conoce a tu maestro y reserva tu primer horario antes de pagar.'}</p>${learner.package?`<p class="mock-banner">Vigencia de ejemplo: ${new Date(learner.package.expires).toLocaleDateString('es-MX')}. Tus clases tienen un mes de vigencia.</p><a class="btn dark" href="#/reservas">Ver mis reservas</a>`:'<a class="btn dark" href="#/paquetes">Explorar paquetes</a>'}<hr><h3>Práctica que suma</h3><p>Completa tareas y juegos para acumular Memo coins. El canje de clases grupales se mostrará en una próxima etapa.</p></aside></section><p class="demo-note">Vista previa del alumno · datos de ejemplo durante esta visita.</p>`;
};
routes.paquetes = () => {
 const p=purchase;
 $('#content').innerHTML=`${head('TU PROGRAMA DE INGLÉS','Comienza tu siguiente capítulo','Selecciona tu paquete y reserva la primera clase para continuar.')}<div class="stepper">${['Paquete','Primera clase','Pago'].map((x,i)=>`<div class="${i===p.step?'current':i<p.step?'done':''}"><i>${i+1}</i><span>${x}</span></div>`).join('')}</div><div class="package-layout ${p.step===1?'':'single'} ${p.step===2?'review':''}"><section id="purchase-stage" class="panel"></section>${p.step===1?'<aside class="panel" id="purchase-aside"></aside>':''}</div>`;
 const stage=$('#purchase-stage');
 if(p.step===0){stage.innerHTML=`<h2>¿A qué ritmo quieres avanzar?</h2><div class="package-cards">${PACKAGES.map(n=>`<button class="package-option ${p.count===n?'selected':''}" data-package="${n}"><small>PAQUETE MENSUAL</small><strong>${n}</strong><b>clases</b><span>${n/4} clases por semana</span><span>$${PACKAGE_PRICES[n]} USD</span><small class="price-example">Precio de ejemplo</small></button>`).join('')}</div><ul class="package-notes"><li>Tu programa completo consta de ${PROGRAM_TOTAL} clases. Cada paquete suma a ese camino.</li><li>Las clases tienen vigencia de un mes desde la compra.</li><li>Puedes cambiar de maestro y reagendar después.</li></ul><p class="demo-note">Precios de ejemplo. Pago simulado, sin cargos.</p><button class="btn dark" data-next ${!p.count?'disabled':''}>Elegir mi primera clase →</button>`;$$('[data-package]').forEach(b=>b.onclick=()=>{p.count=Number(b.dataset.package);routes.paquetes();});$('[data-next]').onclick=()=>{p.step=1;routes.paquetes();};}
 if(p.step===1){const isoDay=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,now=new Date(),minDate=isoDay(now),tomorrow=new Date(now);tomorrow.setDate(now.getDate()+1);
  // Hoy solo se ofrecen horarios con al menos una hora de anticipación; si ya no queda ninguno, se propone mañana.
  const openTimes=day=>MOCK.times.filter(t=>day!==minDate||Number(t.slice(0,2))*60+Number(t.slice(3))>=now.getHours()*60+now.getMinutes()+60),dateValue=p.date||(openTimes(minDate).length?minDate:isoDay(tomorrow)),timeOptions=day=>`<option value="">Elige horario</option>${MOCK.times.map(t=>`<option ${openTimes(day).includes(t)?'':'disabled'} ${p.time===t&&openTimes(day).includes(t)?'selected':''}>${t}</option>`).join('')}`;
  let preview=(MOCK.teachers.find(t=>t[1]===p.teacher)||MOCK.teachers[0])[0];
  stage.innerHTML=`<h2>Conoce a tu primer maestro</h2><p>Todos siguen la metodología de English Club. Horarios de ejemplo · America/Mexico_City.</p><div class="teacher-preview-grid">${teacherCardsHTML()}</div><form id="first-class"><label>Maestro<select name="teacher" required><option value="">Elige un maestro</option>${MOCK.teachers.map(t=>`<option ${p.teacher===t[1]?'selected':''}>${t[1]}</option>`).join('')}</select></label><div class="two-fields"><label>Fecha<input name="date" type="date" min="${minDate}" value="${dateValue}" required></label><label>Hora<select name="time" required>${timeOptions(dateValue)}</select></label></div><p>Tu maestro y horario pueden modificarse posteriormente.</p><div class="actions"><button type="button" class="btn ghost" data-back>Anterior</button><button class="btn dark">Revisar y continuar al pago →</button></div></form>`;
  const select=$('#first-class [name=teacher]'),aside=$('#purchase-aside');aside.classList.add('teacher-profile');
  const showProfile=()=>{const t=MOCK.teachers.find(t=>t[0]===preview),info=TEACHER_PROFILES[t[0]],chosen=select.value===t[1],first=t[1].split(' ')[0];
   $$('[data-teacher-card]').forEach(c=>{const ct=MOCK.teachers.find(x=>x[0]===c.dataset.teacherCard);c.classList.toggle('previewing',c.dataset.teacherCard===preview);c.classList.toggle('chosen',select.value===ct[1]);});
   aside.innerHTML=teacherProfileHTML(t,chosen,`${first} dará tu primera clase`,'<b>Solo es para tu primera clase.</b> Después puedes cambiar de maestro cuando quieras.');
   const pick=$('[data-pick]');if(pick)pick.onclick=()=>{select.value=t[1];showProfile();$('#first-class [name=date]').focus();};};
  showProfile();
  const mq=matchMedia('(max-width:800px)'),placeProfile=()=>{if(!aside.isConnected)return;if(mq.matches)stage.insertBefore(aside,$('#first-class'));else $('.package-layout').append(aside);};placeProfile();mq.onchange=placeProfile;
  $$('[data-preview]').forEach(b=>b.onclick=()=>{preview=b.dataset.preview;showProfile();if(matchMedia('(max-width:800px)').matches)aside.scrollIntoView({behavior:'smooth',block:'start'});});
  $('#first-class [name=date]').onchange=e=>{const time=$('#first-class [name=time]'),kept=time.value;time.innerHTML=timeOptions(e.target.value);if(openTimes(e.target.value).includes(kept))time.value=kept;};
  select.onchange=()=>{const t=MOCK.teachers.find(t=>t[1]===select.value);if(t)preview=t[0];showProfile();};
  $('[data-back]').onclick=()=>{p.step=0;routes.paquetes();};$('#first-class').onsubmit=e=>{e.preventDefault();Object.assign(p,Object.fromEntries(new FormData(e.target)));p.step=2;routes.paquetes();};}
 if(p.step===2){if(!p.count||!p.teacher||!p.date||!p.time){p.step=0;routes.paquetes();return;}
  const t=MOCK.teachers.find(x=>x[1]===p.teacher),price=PACKAGE_PRICES[p.count],until=new Date();until.setMonth(until.getMonth()+1);const untilText=until.toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'}),[dia,num]=shortDate(p.date).split(' ');
  stage.innerHTML=`<span class="eyebrow">Revisión final</span><h2>Todo listo para comenzar</h2><p class="review-lead">Revisa tu plan antes de pasar al pago.</p><div class="review-card"><div class="review-head"><span class="review-count">${p.count}</span><div><b>Paquete de ${p.count} clases</b><small>${p.count/4} clases por semana · vigente hasta el ${untilText}</small></div><strong>$${price.toFixed(2)}<small>USD</small></strong></div><div class="review-class"><span class="summary-date"><b>${num}</b><small>${dia}</small></span>${portrait(p.teacher,t?.[2])}<div><small>Tu primera clase</small><b>${safe(shortDate(p.date))} · ${safe(p.time)}</b><span>Con ${safe(p.teacher)} · 60 minutos</span></div><button type="button" class="review-change" data-edit-class>Cambiar</button></div><ul class="review-includes"><li>1 clase reservada y ${p.count-1} por agendar cuando quieras.</li><li>Puedes cambiar de maestro y horario después.</li><li>Cada clase suma a tu programa de ${PROGRAM_TOTAL} clases.</li></ul><div class="review-total"><span>Total</span><b>$${price.toFixed(2)} USD</b></div></div><form id="review-form"><label class="check"><input type="checkbox" required><span>Entiendo que las clases tienen vigencia de un mes desde la compra.</span></label><div class="actions"><button type="button" class="btn ghost" data-back>Anterior</button><button class="btn dark">Continuar al pago →</button></div></form>`;
  $('[data-back]').onclick=$('[data-edit-class]').onclick=()=>{p.step=1;routes.paquetes();};
  // El cobro lo hace el checkout de app.js: el paquete va al carrito y la primera clase queda pendiente de pago.
  $('#review-form').onsubmit=e=>{e.preventDefault();state.cart=[[`paquete-${p.count}`,`Paquete de ${p.count} clases`,`${p.count/4} clases por semana · vigencia de un mes`,price]];state.pendingBooking={id:Date.now(),iso:p.date,date:shortDate(p.date),time:p.time,teacher:p.teacher,service:'English Class',status:'Confirmada'};state.paymentDone=false;state.purchaseKind='booking';p.awaitingPayment=true;location.hash='#/checkout';};}
};
// Al aprobarse el pago del checkout, el paquete se acredita al alumno.
const originalPaymentSuccess=paymentSuccess;
paymentSuccess=function(){if(purchase.awaitingPayment){const expires=new Date();expires.setMonth(expires.getMonth()+1);const prev=learner.package&&new Date(learner.package.expires)>new Date()?learner.package:null;learner.package={count:(prev?prev.count:0)+purchase.count,scheduled:(prev?(prev.scheduled||1):0)+1,perWeek:purchase.count/4,expires:expires.toISOString(),welcomeRead:prev?.welcomeRead||[]};purchase.awaitingPayment=false;if(typeof saveJourney==='function')saveJourney();}originalPaymentSuccess();};
// Reservar con paquete vigente: maestro + horario semanal que se repite hasta agotar las clases o la vigencia.
const WEEK_DAYS=[[1,'Lun','Lunes'],[2,'Mar','Martes'],[3,'Mié','Miércoles'],[4,'Jue','Jueves'],[5,'Vie','Viernes'],[6,'Sáb','Sábado']];
const DEFAULT_DAYS={1:[3],2:[2,4],3:[1,3,5],4:[1,2,4,5]};
let schedule=null;
const WIP_BANNER='<div class="wip-banner" role="note"><span>En construcción</span><p><b>Estamos trabajando en esta sección.</b> Puedes probar cómo funcionará; las reservas que hagas aquí son de ejemplo.</p></div>';
const hasActivePackage=()=>Boolean(learner.package&&new Date(learner.package.expires)>=new Date());
const scheduleDates=()=>{const pkg=learner.package,left=pkg.count-(pkg.scheduled||0),end=new Date(pkg.expires),booked=new Set(state.bookings.map(b=>b.iso).filter(Boolean)),list=[],d=new Date();d.setHours(12,0,0,0);
 while(list.filter(x=>!x.skip).length<left){d.setDate(d.getDate()+1);if(d>end)break;const time=schedule.days[d.getDay()];if(!time)continue;const iso=isoDate(d);if(booked.has(iso))continue;list.push({iso,time,skip:schedule.skip.has(iso),day:new Date(d)});}
 return {list,left};};
routes.reservar=()=>{
 if(!hasActivePackage()){purchase={step:0,count:0,teacher:'',date:'',time:''};location.hash='#/paquetes';return;}
 const pkg=learner.package,perWeek=pkg.perWeek||Math.max(1,Math.round(pkg.count/4)),left=pkg.count-(pkg.scheduled||0),until=new Date(pkg.expires).toLocaleDateString('es-MX',{day:'numeric',month:'long'});
 if(left<=0){$('#content').innerHTML=`${head('Reservar','Agenda tus clases','')}${WIP_BANNER}<section class="panel sched-done"><span class="review-count">✓</span><h2>Ya agendaste todas tus clases</h2><p>Tus clases son vigentes hasta el ${until}. Cuando quieras más, encuéntralas en la Tienda.</p><div class="actions"><a class="btn dark" href="#/reservas">Ver mis reservas</a><a class="btn ghost" href="#/tienda">Ir a la tienda</a></div></section>`;return;}
 if(!schedule){const last=state.bookings.find(b=>b.teacher)||{},time=last.time||'18:00';schedule={teacher:last.teacher||MOCK.teachers[0][1],days:Object.fromEntries((DEFAULT_DAYS[perWeek]||DEFAULT_DAYS[3]).map(d=>[d,time])),skip:new Set()};}
 let preview=(MOCK.teachers.find(t=>t[1]===schedule.teacher)||MOCK.teachers[0])[0];
 $('#content').innerHTML=`${head('Reservar','Agenda tus clases',`Te quedan ${left} ${left===1?'clase':'clases'} por agendar · vigentes hasta el ${until}.`)}${WIP_BANNER}<div class="package-layout"><section class="panel" id="schedule-stage"><div class="sched-step" id="sched-teacher"><h2><span>1</span>Tu maestro</h2><p>Toma tus clases con el mismo maestro o cámbialo cuando quieras.</p><div class="teacher-preview-grid">${teacherCardsHTML()}</div></div><div class="sched-step"><h2><span>2</span>Tus días y horario</h2><p>Tu paquete incluye <b>${perWeek} ${perWeek===1?'clase':'clases'} por semana</b>. Elige los días y la hora de cada uno.</p><div class="day-chips" role="group" aria-label="Días de clase"></div><div class="day-times"></div></div><div class="sched-step"><h2><span>3</span>Revisa tus fechas</h2><p>Tu horario se repite cada semana. Si quitas una fecha, se agrega la siguiente disponible.</p><div class="sched-weeks"></div></div><div class="sched-bar"></div></section><aside class="panel teacher-profile" id="purchase-aside"></aside></div>`;
 const aside=$('#purchase-aside'),stage=$('#schedule-stage');
 const showProfile=()=>{const t=MOCK.teachers.find(x=>x[0]===preview);$$('[data-teacher-card]').forEach(c=>{c.classList.toggle('previewing',c.dataset.teacherCard===preview);c.classList.toggle('chosen',MOCK.teachers.find(x=>x[0]===c.dataset.teacherCard)[1]===schedule.teacher);});aside.innerHTML=teacherProfileHTML(t,schedule.teacher===t[1],`${firstName(t[1])} dará tus clases`,'<b>Puedes cambiar de maestro</b> en cualquier momento desde Reservar.');const pick=$('[data-pick]',aside);if(pick)pick.onclick=()=>{schedule.teacher=t[1];showProfile();renderPlan();};};
 const renderDays=()=>{const chosen=Object.keys(schedule.days).map(Number);$('.day-chips').innerHTML=WEEK_DAYS.map(([n,s])=>`<button type="button" class="day-chip" data-day="${n}" aria-pressed="${chosen.includes(n)}">${s}</button>`).join('')+`<span class="day-count">${chosen.length} de ${perWeek}</span>`;$('.day-times').innerHTML=WEEK_DAYS.filter(([n])=>chosen.includes(n)).map(([n,,name])=>`<label><span>${name}</span><select data-day-time="${n}">${MOCK.times.map(t=>`<option ${schedule.days[n]===t?'selected':''}>${t}</option>`).join('')}</select></label>`).join('');
  $$('[data-day]').forEach(b=>b.onclick=()=>{const n=Number(b.dataset.day);if(schedule.days[n])delete schedule.days[n];else if(Object.keys(schedule.days).length>=perWeek){notify(`Tu paquete incluye ${perWeek} clases por semana. Quita un día para elegir otro.`);return;}else schedule.days[n]=Object.values(schedule.days)[0]||'18:00';renderDays();renderPlan();});
  $$('[data-day-time]').forEach(s=>s.onchange=()=>{schedule.days[s.dataset.dayTime]=s.value;renderPlan();});};
 const renderPlan=()=>{const {list}=scheduleDates(),active=list.filter(x=>!x.skip),weeks=[];list.forEach(x=>{const monday=new Date(x.day);monday.setDate(monday.getDate()-((monday.getDay()+6)%7));const key=isoDate(monday);let w=weeks.find(y=>y.key===key);if(!w)weeks.push(w={key,monday,items:[]});w.items.push(x);});
  $('.sched-weeks').innerHTML=weeks.length?weeks.map(w=>`<section class="sched-week"><h3>Semana del ${w.monday.getDate()} de ${w.monday.toLocaleDateString('es-MX',{month:'long'})}</h3><ul>${w.items.map(x=>{const [dia,num]=shortDate(x.iso).split(' ');return `<li class="${x.skip?'skipped':''}"><span class="summary-date"><b>${num}</b><small>${dia}</small></span><span><b>${shortDate(x.iso)}</b><small>${x.time} · 60 minutos</small></span><button type="button" data-skip="${x.iso}">${x.skip?'Agregar':'Quitar'}</button></li>`;}).join('')}</ul></section>`).join(''):`<p class="sched-empty">Elige al menos un día para ver tus fechas.</p>`;
  const n=active.length;$('.sched-bar').innerHTML=`<span><b>${n} ${n===1?'clase':'clases'} con ${safe(schedule.teacher)}</b><small>${n&&n<left?`${left-n} quedarán por agendar; podrás agendarlas después.`:n?'Todas tus clases quedarán agendadas.':'Aún no hay fechas seleccionadas.'}</small></span><button type="button" class="btn dark" data-confirm ${n?'':'disabled'}>Reservar ${n} ${n===1?'clase':'clases'} →</button>`;
  $$('[data-skip]').forEach(b=>b.onclick=()=>{const iso=b.dataset.skip;schedule.skip.has(iso)?schedule.skip.delete(iso):schedule.skip.add(iso);renderPlan();});
  $('[data-confirm]').onclick=()=>{active.forEach((x,i)=>state.bookings.push({id:Date.now()+i,iso:x.iso,date:shortDate(x.iso),time:x.time,teacher:schedule.teacher,service:'English Class',status:'Confirmada'}));pkg.scheduled=(pkg.scheduled||0)+n;const who=schedule.teacher;schedule=null;if(typeof saveJourney==='function')saveJourney();notify(`${n} ${n===1?'clase reservada':'clases reservadas'} con ${who}.`);location.hash='#/reservas';};};
 showProfile();renderDays();renderPlan();
 const mq=matchMedia('(max-width:800px)'),placeProfile=()=>{if(!aside.isConnected)return;if(mq.matches)$('#sched-teacher').after(aside);else $('.package-layout').append(aside);};placeProfile();mq.onchange=placeProfile;
 $$('[data-preview]').forEach(b=>b.onclick=()=>{preview=b.dataset.preview;showProfile();if(mq.matches)aside.scrollIntoView({behavior:'smooth',block:'start'});});
};
// Tienda: clases compradas y disponibles, y compra de más paquetes.
routes.tienda=()=>{const pkg=learner.package,active=hasActivePackage(),scheduled=active?(pkg.scheduled||0):0,left=active?Math.max(0,pkg.count-scheduled):0,days=active?Math.max(0,Math.ceil((new Date(pkg.expires)-new Date())/864e5)):0;
 $('#content').innerHTML=`${head('Tienda','Mis clases','Consulta las clases que tienes disponibles y compra más cuando lo necesites.')}${active?`<section class="panel store-balance"><div class="store-balance-main"><span class="eyebrow">Clases disponibles</span><strong>${left}</strong><span>${left===1?'clase':'clases'} por agendar</span></div><div class="store-balance-detail"><dl><div><dt>Compradas</dt><dd>${pkg.count}</dd></div><div><dt>Reservadas</dt><dd>${scheduled}</dd></div><div><dt>Tomadas</dt><dd>${learner.taken}</dd></div></dl><progress max="${pkg.count}" value="${scheduled}" aria-label="Clases reservadas de tu paquete"></progress><p>Vigentes hasta el ${new Date(pkg.expires).toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'})} · ${days} ${days===1?'día restante':'días restantes'}</p><div class="actions">${left?'<a class="btn dark" href="#/reservar">Agendar mis clases →</a>':''}<a class="btn ghost" href="#/reservas">Ver mis reservas</a></div></div></section>`:`<section class="panel store-empty"><h2>Aún no tienes clases disponibles</h2><p>Elige un paquete para empezar tu programa de ${PROGRAM_TOTAL} clases.</p></section>`}<section class="store-more"><h2>${active?'Comprar más clases':'Elige tu paquete'}</h2><div class="package-cards">${PACKAGES.map(n=>`<button type="button" class="package-option" data-buy="${n}"><small>PAQUETE MENSUAL</small><strong>${n}</strong><b>clases</b><span>${n/4} clases por semana</span><span>$${PACKAGE_PRICES[n]} USD</span><small class="price-example">Precio de ejemplo</small></button>`).join('')}</div><p class="demo-note">Precios de ejemplo. Pago simulado, sin cargos.</p></section>`;
 $$('[data-buy]').forEach(b=>b.onclick=()=>{purchase={step:1,count:Number(b.dataset.buy),teacher:'',date:'',time:''};location.hash='#/paquetes';});};
// Mensajes: cada maestro con clases reservadas da la bienvenida y recuerda la primera clase.
const syncTeacherWelcome=()=>{if(!learner.package)return;const read=learner.package.welcomeRead||(learner.package.welcomeRead=[]);MOCK.conversations.forEach(c=>{if(c[0].startsWith('t-')&&!c[4]&&!read.includes(c[0]))read.push(c[0]);});
 MOCK.teachers.forEach(t=>{const id='t-'+t[0];if(MOCK.conversations.some(c=>c[0]===id))return;const first=state.bookings.filter(b=>b.teacher===t[1]).sort((a,b)=>String(a.iso).localeCompare(String(b.iso)))[0];if(!first)return;
  MOCK.messages[id]=[[t[1],`¡Hola, ${firstName(MOCK.student.name)}! Soy ${firstName(t[1])}, ${t[3].charAt(0).toLowerCase()+t[3].slice(1)} en English Club. Te espero en nuestra clase del ${first.date} a las ${first.time}. Si tienes alguna duda antes, escríbeme por aquí.`,0]];
  MOCK.conversations.unshift([id,t[1],t[2],'Te espero en nuestra clase.',read.includes(id)?0:1,t[4]]);});};
const baseLayout=layout;
layout=function(view){syncTeacherWelcome();baseLayout(view);};
state.bookings=[];MOCK.conversations=MOCK.conversations.filter(c=>c[0]!=='teacher');state.chat='';
// Acceso exclusivo de alumnos; el portal docente se diseñará por separado.
function studentAuth(register=false){
 $('#content').innerHTML=`<header class="student-auth-header"><a href="#/login" aria-label="English Club School, inicio"><img src="assets/logo-ecs-224.webp" alt="English Club School"></a><span>Tu camino al inglés</span></header><section class="student-auth-main"><form class="student-auth-form"><h1>${register?'Crea tu cuenta':'Inicia sesión'}</h1><p class="student-auth-switch">${register?'¿Ya tienes una cuenta? <a href="#/login">Inicia sesión</a>':'¿Aún no tienes cuenta? <a href="#/registro">Regístrate como alumno</a>'}</p><div class="student-social"><button type="button" data-social="Google"><span class="google-letter" aria-hidden="true">G</span>Continuar con Google</button><button type="button" data-social="Facebook"><span class="facebook-letter" aria-hidden="true">f</span>Continuar con Facebook</button></div><div class="auth-divider"><span>o</span></div>${register?'<div class="two-fields"><label>Nombre<input name="firstName" autocomplete="given-name" placeholder="Tu nombre" required></label><label>Apellido<input name="lastName" autocomplete="family-name" placeholder="Tu apellido" required></label></div>':''}<label>Correo electrónico<input name="email" type="email" autocomplete="email" placeholder="Tu correo electrónico" required></label><label>Contraseña<input name="password" type="password" autocomplete="${register?'new-password':'current-password'}" placeholder="Tu contraseña" ${register?'minlength="8"':''} required></label>${register?'<label>Teléfono<input name="phone" type="tel" autocomplete="tel" placeholder="55 1234 5678" required></label>':'<button type="button" class="student-forgot">¿Olvidaste tu contraseña?</button>'}<button class="btn student-auth-submit full">${register?'Crear cuenta':'Iniciar sesión'} <span aria-hidden="true">→</span></button><p class="student-demo-note">Vista previa de la interfaz. Puedes usar datos de ejemplo o continuar con un acceso social simulado.</p></form></section><footer class="student-auth-footer">English Club School <span>Aprende con un propósito.</span></footer>`;
 $('#content').classList.add('student-auth-shell');
 $('.student-auth-form').onsubmit=e=>{e.preventDefault();enter('student');};
 $('.student-forgot')?.addEventListener('click',()=>notify('La recuperación de contraseña se conectará en otra etapa.'));
 wireSocial();
}
routes.login=()=>studentAuth(false);
routes.registro=()=>studentAuth(true);
const studentProfile=routes.perfil;
routes.perfil=()=>{studentProfile();$('[data-role]')?.remove();};
routes['teacher-dashboard']=()=>{state.role='student';location.hash='#/dashboard';};
const centeredStudentAuth=studentAuth;
studentAuth=function(register=false){
 centeredStudentAuth(register);
 $('.student-auth-main').insertAdjacentHTML('afterbegin',`<aside class="auth-story" aria-label="Aprende con English Club"><div class="auth-story-copy"><span class="eyebrow">ENGLISH CLUB SCHOOL</span><h2>Tu inglés.<br>Tu ritmo.<br><em>Tu siguiente paso.</em></h2><p>Una metodología clara y un equipo que te acompaña, clase a clase.</p><div class="auth-story-tags"><span>Clases en vivo</span><span>Maestros preparados</span><span>Una ruta para ti</span></div></div><div class="auth-story-team"><div>${MOCK.teachers.slice(0,3).map(t=>portrait(t[1],t[2],'auth-person')).join('')}</div><span><b>Aprende acompañado</b><small>Conoce a tu equipo al reservar</small></span></div><span class="auth-story-caption">El siguiente capítulo empieza contigo.</span></aside>`);
 $('#content').classList.add('hybrid-auth');
};
const LANDING_URL='https://daniel-debug.github.io/DEMO-LANDING-MEMOENGLISH/';
function publicNavbar(){
 const links=[['metodo','Método'],['plataforma','Plataforma'],['cursos','Cursos'],['precios','Precios'],['maestros','Maestros']];
 const items=links.map(([id,label])=>`<a href="${LANDING_URL}#${id}">${label}</a>`).join('');
 return `<header class="public-header"><div class="public-navbar"><a class="public-brand" href="${LANDING_URL}#inicio" aria-label="English Club School, inicio"><img src="assets/logo-ecs-224.webp" alt="English Club School" width="224" height="102"></a><nav class="public-links" aria-label="Principal">${items}</nav><div class="public-actions"><a class="public-phone" href="tel:+526442288102">+52 (644) 28-8102</a><a class="public-login" href="#/login" ${location.hash.includes('registro')?'':'aria-current="page"'}>Inicia sesión</a><span class="public-separator" aria-hidden="true"></span><a class="public-cta" href="https://wa.me/526442288102?text=Quiero%20tomar%20una%20clase%20muestra" target="_blank" rel="noopener noreferrer">Clase gratis</a><button class="public-menu-toggle" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="public-mobile-menu"><span></span><span></span><span></span></button></div></div><nav id="public-mobile-menu" class="public-mobile-menu" aria-label="Menú móvil" hidden>${items}<a href="#/login" ${location.hash.includes('registro')?'':'aria-current="page"'}>Inicia sesión</a><a href="${LANDING_URL}#inicio">Volver al inicio</a></nav></header>`;
}
const hybridStudentAuth=studentAuth;
studentAuth=function(register=false){
 hybridStudentAuth(register);
 $('.student-auth-header').outerHTML=publicNavbar();
 const toggle=$('.public-menu-toggle'),menu=$('#public-mobile-menu');
 const close=()=>{menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Abrir menú');};
 toggle.onclick=()=>{const open=menu.hidden;menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');};
 $('.public-header').addEventListener('keydown',e=>{if(e.key==='Escape'){close();toggle.focus();}});
 $$('a',menu).forEach(link=>link.addEventListener('click',close));
};
// Guide the free-class action into the student access flow.
const authWithPublicNavigation=studentAuth;
studentAuth=function(register=false){
 authWithPublicNavigation(register);
 const cta=$('.public-cta'),form=$('.student-auth-form');
 cta.href=register?'#/registro':'#/login';
 cta.removeAttribute('target');cta.removeAttribute('rel');
 cta.addEventListener('click',event=>{
  event.preventDefault();
  let notice=$('#free-class-notice');
  if(!notice){
   notice=document.createElement('div');notice.id='free-class-notice';notice.className='free-class-notice';notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');
   $('.student-auth-switch').insertAdjacentElement('afterend',notice);
  }
  notice.textContent=register?'Crea tu cuenta para agendar tu clase gratis. Si ya tienes una, inicia sesión.':'Para agendar tu clase gratis, inicia sesión o crea tu cuenta. También puedes continuar con Google o Facebook.';
  form.classList.remove('free-class-highlight');
  requestAnimationFrame(()=>{form.classList.add('free-class-highlight');});
  notice.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});
  const email=$('input[name="email"]',form);email.setAttribute('aria-describedby','free-class-notice');email.focus({preventScroll:true});
 });
 form.addEventListener('animationend',event=>{if(event.animationName==='free-class-nudge')form.classList.remove('free-class-highlight');});
};
const socialLogos={
 Google:`<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 38.03 46.98 31.88 46.98 24.55Z"/><path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.87 23.87 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/></svg>`,
 Facebook:`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="#1877F2" d="M24 12a12 12 0 1 0-13.875 11.855V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953h-1.513c-1.49 0-1.956.925-1.956 1.874V12h3.328l-.532 3.469h-2.796v8.386A12.003 12.003 0 0 0 24 12Z"/><path fill="#fff" d="m16.671 15.469.532-3.469h-3.328V9.749c0-.949.465-1.874 1.956-1.874h1.513V4.922s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669V12H7.078v3.469h3.047v8.386a12.09 12.09 0 0 0 3.75 0v-8.386h2.796Z"/></svg>`,
 Apple:`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M17.05 12.54c.03 3.16 2.77 4.21 2.8 4.22-.02.07-.44 1.5-1.45 2.98-.88 1.28-1.79 2.56-3.23 2.59-1.42.03-1.88-.84-3.51-.84-1.62 0-2.13.81-3.48.87-1.39.05-2.45-1.39-3.33-2.66-1.81-2.61-3.2-7.37-1.34-10.59.92-1.6 2.57-2.62 4.36-2.65 1.36-.03 2.65.93 3.48.93.84 0 2.4-1.15 4.04-.98.69.03 2.62.28 3.86 2.1-.1.07-2.3 1.34-2.2 4.03ZM14.39 4.64c.73-.88 1.22-2.11 1.09-3.34-1.05.04-2.33.7-3.08 1.58-.68.78-1.27 2.04-1.11 3.24 1.17.09 2.36-.6 3.1-1.48Z"/></svg>`
};
const studentAuthBeforeSocialIcons=studentAuth;
studentAuth=function(register=false){
 studentAuthBeforeSocialIcons(register);
 $('.student-social').innerHTML=['Google','Facebook','Apple'].map(provider=>`<button type="button" data-social="${provider}"><span class="social-provider-icon">${socialLogos[provider]}</span>Continuar con ${provider}</button>`).join('');
 wireSocial();
};
// Local-only provider sign-in preview. No credentials or external requests.
wireSocial=function(){
 $$('[data-social]').forEach(button=>button.onclick=()=>openFakeSocialLogin(button.dataset.social));
};
function openFakeSocialLogin(provider){
 const previousFocus=document.activeElement;
 $('#social-login-dialog')?.remove();
 const modal=document.createElement('dialog');
 modal.id='social-login-dialog';modal.className='social-login-dialog';
 modal.innerHTML=`<form method="dialog" class="social-login-preview"><button type="button" class="social-preview-close" aria-label="Cerrar simulación">×</button><div class="social-preview-provider">${socialLogos[provider]}</div><span class="social-preview-badge">SIMULACIÓN</span><h2>Inicia sesión con ${safe(provider)}</h2><p>Elige una cuenta de ejemplo para continuar en English Club School.</p><button type="button" class="social-preview-account"><span class="social-preview-avatar">AD</span><span><b>Andrea García</b><small>andrea@example.com</small></span><span aria-hidden="true">→</span></button><p class="social-preview-disclaimer">Esta es una demostración. No se conectará con ${safe(provider)} ni se solicitarán tus credenciales.</p><div class="social-preview-status" role="status" aria-live="polite"></div><button type="button" class="btn ghost full social-preview-cancel">Cancelar</button></form>`;
 document.body.append(modal);
 let completionTimer;
 const dismiss=()=>modal.close();
 $('.social-preview-close',modal).onclick=dismiss;
 $('.social-preview-cancel',modal).onclick=dismiss;
 modal.addEventListener('close',()=>{clearTimeout(completionTimer);modal.remove();previousFocus?.focus();},{once:true});
 $('.social-preview-account',modal).onclick=()=>{
  const account=$('.social-preview-account',modal);account.disabled=true;
  account.classList.add('is-signing-in');
  $('.social-preview-status',modal).innerHTML='<span class="social-preview-spinner" aria-hidden="true"></span> Iniciando sesión de demostración…';
  completionTimer=setTimeout(()=>{if(!modal.open)return;modal.close();enter('student');notify(`Sesión de ejemplo iniciada con ${provider}.`);},1100);
 };
 modal.showModal();
}
// Student profiling preview: one question per screen, answers retained in memory.
const onboardingQuestions=[
 {key:'goal',title:'¿Para qué quieres aprender inglés?',hint:'Elige el objetivo que más se acerca a lo que buscas.',options:[['Carrera y negocios','Crecer profesionalmente y abrir nuevas oportunidades.'],['Inglés para niños','Acompañar sus primeros pasos con el idioma.'],['Preparación de exámenes','Prepararte para una evaluación de inglés.'],['Inglés para el trabajo','Comunicarte con más seguridad en tu día a día laboral.'],['Viajes','Disfrutar nuevas experiencias y conectar con otras personas.'],['Pasatiempos','Aprender por gusto y seguir tus intereses.']]},
 {key:'industry',title:'¿En qué industria o área te desarrollas?',hint:'Así podremos conocer mejor tu contexto. Esta pregunta es opcional.',placeholder:'Ej. tecnología, salud, educación o comercio'},
 {key:'job',title:'¿Cuál es tu profesión u ocupación?',hint:'Puedes contarnos a qué te dedicas o qué estudias. Esta pregunta es opcional.',placeholder:'Ej. estudiante, ingeniero o emprendedor'},
 {key:'deadline',title:'¿En cuánto tiempo quieres lograr tu objetivo?',hint:'Es una referencia para conocer tu meta, no un compromiso de compra.',options:[['9 meses','Me interesa avanzar con un ritmo más intensivo.'],['18 meses','Prefiero avanzar con un ritmo más flexible.'],['Aún no lo sé','Quiero conocer el programa antes de decidir.']]},
 {key:'level',title:'¿Cuál es tu nivel actual de inglés?',hint:'Elige cómo te sientes hoy. Esto no es un examen de nivel.',options:[['Desde cero','Estoy empezando a conocer el idioma.'],['Básico','Conozco palabras y puedo usar frases sencillas.'],['Intermedio','Puedo conversar sobre temas cotidianos.'],['Avanzado','Me comunico con soltura y quiero perfeccionarme.'],['No estoy seguro','Necesito ayuda para identificar mi punto de partida.']]}
];
let onboardingStep=0,onboardingAnswers={};
routes.onboarding=function(){
 const q=onboardingQuestions[onboardingStep],value=onboardingAnswers[q.key]||'',last=onboardingStep===onboardingQuestions.length-1;
 $('#content').innerHTML=`<section class="onboarding-wizard"><header class="onboarding-intro"><span class="eyebrow">TU PUNTO DE PARTIDA</span><h1>Hagamos un plan para ti</h1><p>Unas preguntas para conocerte y acompañarte mejor.</p></header><div class="onboarding-progress"><div><span>Paso ${onboardingStep+1} de ${onboardingQuestions.length}</span><span>${['Tu objetivo','Tu área','Tu ocupación','Tu plazo','Tu nivel'][onboardingStep]}</span></div><progress aria-label="Progreso del cuestionario" max="5" value="${onboardingStep+1}"></progress></div><form class="panel onboarding-question" aria-labelledby="onboarding-question-title"><fieldset><legend id="onboarding-question-title">${q.title}</legend><p class="onboarding-hint" id="onboarding-hint">${q.hint}</p>${q.options?`<div class="onboarding-options ${q.key==='goal'?'onboarding-goals':''}">${q.options.map(([label,description],i)=>`<label class="onboarding-option"><input type="radio" name="${q.key}" value="${safe(label)}" ${value===label?'checked':''} required aria-describedby="onboarding-option-${i}"><span class="onboarding-option-copy"><b>${label}</b><small id="onboarding-option-${i}">${description}</small></span><span class="onboarding-check" aria-hidden="true">✓</span></label>`).join('')}</div>`:`<label class="onboarding-text-label" for="onboarding-answer">${q.key==='industry'?'Tu industria o área':'Tu profesión u ocupación'}<input id="onboarding-answer" name="${q.key}" value="${safe(value)}" placeholder="${q.placeholder}" maxlength="120" aria-describedby="onboarding-hint" autocomplete="organization-title"></label>`}</fieldset><div class="onboarding-controls"><button type="button" class="btn ghost" data-onboarding-back ${onboardingStep===0?'disabled':''}>← Anterior</button><div>${!q.options?'<button type="button" class="onboarding-skip">Omitir por ahora</button>':''}<button class="btn onboarding-continue" ${q.options&&!value?'disabled':''}>${last?'Ver mi plan':'Continuar'} <span aria-hidden="true">→</span></button></div></div></form><p class="onboarding-footnote">Vista previa · tus respuestas se conservan durante esta visita.</p></section>`;
 const form=$('.onboarding-question'),next=$('.onboarding-continue');
 const save=()=>{onboardingAnswers[q.key]=String(new FormData(form).get(q.key)||'').trim();};
 const advance=()=>{if(last){learner.profile={...onboardingAnswers};location.hash='#/dashboard';}else{onboardingStep++;routes.onboarding();focusQuestion();}};
 $$('input',form).forEach(input=>input.addEventListener('input',()=>{save();if(q.options)next.disabled=!onboardingAnswers[q.key];}));
 form.onsubmit=e=>{e.preventDefault();save();if(q.options&&!onboardingAnswers[q.key])return;advance();};
 $('[data-onboarding-back]').onclick=()=>{save();if(onboardingStep>0){onboardingStep--;routes.onboarding();focusQuestion();}};
 $('.onboarding-skip')?.addEventListener('click',()=>{onboardingAnswers[q.key]='';advance();});
};
function focusQuestion(){const heading=$('#onboarding-question-title');heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});heading.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
// Keep the first-run questionnaire outside the student dashboard navigation.
const portalLayout=layout;
layout=function(view){
 if(state.auth&&location.hash.split('?')[0]==='#/onboarding'){
  app.innerHTML='<main id="content" class="onboarding-standalone"></main>';view();return;
 }
 portalLayout(view);
};
const renderOnboardingQuestions=routes.onboarding;
routes.onboarding=function(){
 renderOnboardingQuestions();
 const wizard=$('.onboarding-wizard'),intro=$('.onboarding-intro'),question=$('.onboarding-question'),progress=$('.onboarding-progress'),footnote=$('.onboarding-footnote');
 const visual=document.createElement('aside');visual.className='onboarding-visual';
 visual.innerHTML=`<a class="onboarding-brand" href="#/dashboard" aria-label="English Club School, inicio"><img src="assets/logo-ecs-224.webp" alt="English Club School"></a><div class="onboarding-art" aria-hidden="true"><svg viewBox="0 0 280 240" fill="none"><ellipse cx="140" cy="216" rx="87" ry="11" fill="#23374c" opacity=".08"/><path d="m94 169-15 46m104-46 17 46" stroke="#33506e" stroke-width="10" stroke-linecap="round"/><circle cx="140" cy="113" r="84" fill="#fff" stroke="#33506e" stroke-width="3"/><circle cx="140" cy="113" r="61" fill="#fff3ae" stroke="#33506e" stroke-width="2"/><circle cx="140" cy="113" r="38" fill="#fff" stroke="#33506e" stroke-width="2"/><circle cx="140" cy="113" r="15" fill="#fcda00" stroke="#33506e" stroke-width="2"/><path d="m140 113 87-73m-5 4 1-22 13 7 13 9-22 2" stroke="#23374c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="m223 23 13 6 13 9-22 2Z" fill="#fcda00" stroke="#23374c" stroke-width="2"/><path d="m44 65 4-8m-8 2 12 4m166 107 4-8m-8 2 12 4" stroke="#b39817" stroke-width="2" stroke-linecap="round"/></svg></div>`;
 visual.append(intro);
 const body=document.createElement('section');body.className='onboarding-body';body.append(progress,question,footnote);
 wizard.replaceChildren(visual,body);
};
const industrySuggestions=['Tecnología e informática','Salud y medicina','Educación','Comercio y ventas','Administración y negocios','Finanzas y contabilidad','Ingeniería y manufactura','Turismo y hotelería','Marketing y comunicación','Arte y diseño','Derecho','Logística y transporte','Estudiante','Actualmente no trabajo'];
function enhanceIndustrySearch(){
 if(onboardingQuestions[onboardingStep].key!=='industry')return;
 const input=$('#onboarding-answer');
 input.type='search';input.autocomplete='off';input.placeholder='Busca o selecciona tu industria';
 input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-expanded','false');input.setAttribute('aria-controls','industry-options');
 const wrapper=document.createElement('div');wrapper.className='industry-selector';
 input.parentNode.insertBefore(wrapper,input);wrapper.append(input);
 wrapper.insertAdjacentHTML('beforeend','<span class="industry-search-icon" aria-hidden="true">⌕</span><ul id="industry-options" role="listbox" aria-label="Industrias y áreas" hidden></ul>');
 const list=$('#industry-options'),status=document.createElement('p');status.className='industry-search-status';status.setAttribute('role','status');input.closest('label').insertAdjacentElement('afterend',status);
 let active=-1,visible=[],custom=false;
 const normalize=text=>text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const close=()=>{list.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');active=-1;};
 const select=value=>{custom=value==='Otra';input.value=custom?'':value;input.placeholder=custom?'Escribe tu industria o área':'Busca o selecciona tu industria';status.textContent=custom?'Escribe tu área en el campo. También puedes omitir esta pregunta.':'';input.dispatchEvent(new Event('input',{bubbles:true}));close();input.focus();};
 const render=()=>{
  if(custom)return;
  const term=normalize(input.value.trim());visible=industrySuggestions.filter(value=>normalize(value).includes(term));
  const found=visible.length;visible.push('Otra');active=-1;
  list.innerHTML=`${!found?'<li class="industry-no-results" role="presentation">No encontramos coincidencias.</li>':''}${visible.map((value,index)=>`<li id="industry-option-${index}" role="option" aria-selected="false" data-industry-index="${index}">${safe(value)}${value==='Otra'?'<small>Escribir una diferente</small>':''}</li>`).join('')}`;
  list.hidden=false;input.setAttribute('aria-expanded','true');input.removeAttribute('aria-activedescendant');
  $$('[data-industry-index]',list).forEach(option=>{option.addEventListener('pointerdown',e=>e.preventDefault());option.onclick=()=>select(visible[Number(option.dataset.industryIndex)]);});
 };
 const highlight=index=>{active=index;$$('[role=option]',list).forEach((option,i)=>{option.setAttribute('aria-selected',String(i===active));if(i===active){input.setAttribute('aria-activedescendant',option.id);option.scrollIntoView({block:'nearest'});}});};
 input.addEventListener('focus',render);
 input.addEventListener('input',()=>{if(custom){onboardingAnswers.industry=input.value.trim();return;}status.textContent='';render();});
 input.addEventListener('blur',close);
 input.addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();return;}
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){
   e.preventDefault();if(list.hidden){custom=false;render();}
   highlight(e.key==='ArrowDown'?(active+1)%visible.length:(active<=0?visible.length-1:active-1));
  }else if(e.key==='Enter'&&!list.hidden){e.preventDefault();if(active>=0)select(visible[active]);}
 });
}
const onboardingBeforeIndustrySearch=routes.onboarding;
routes.onboarding=function(){onboardingBeforeIndustrySearch();enhanceIndustrySearch();};
