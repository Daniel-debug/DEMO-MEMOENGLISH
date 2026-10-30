const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const storage=new Map();
const context={MOCK:{times:['09:00','11:00','16:00','18:00','20:00']},isoDate:d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,URL,addEventListener(){},window:{},routes:{perfil(){}},document:{addEventListener(){}},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},journey:{completed:false},location:{replace(value){this.redirect=value;}}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../student-ui.js'),'utf8'),context);
const run=code=>vm.runInContext(code,context);
test('next class chooses earliest future reservation, ignoring cancelled and past classes',()=>{
 const result=run(`upcomingStudentBooking([
 {iso:'2026-11-03',time:'18:00',teacher:'Late',status:'Confirmada'},
 {iso:'2026-11-02',time:'10:00',teacher:'Cancelled',status:'Cancelada'},
 {iso:'2026-10-01',time:'10:00',teacher:'Past',status:'Confirmada'},
 {iso:'2026-11-02',time:'11:00',teacher:'Next',status:'Confirmada'}
 ],new Date('2026-11-01T12:00:00'))`);
 assert.equal(result.teacher,'Next');
 assert.equal(run(`upcomingStudentBooking([],new Date('2026-11-01'))`),null);
});
test('a class currently in progress remains visible for its one-hour duration',()=>{
 assert.equal(run(`upcomingStudentBooking([{iso:'2026-11-01',time:'10:00',teacher:'Live'}],new Date('2026-11-01T10:30:00')).teacher`),'Live');
 assert.equal(run(`upcomingStudentBooking([{iso:'2026-11-01',time:'10:00'}],new Date('2026-11-01T11:01:00'))`),null);
});
test('progress uses accumulated thresholds and clamps to the full program',()=>{
 for(const [count,completed] of [[0,0],[48,1],[49,1],[96,2],[97,2],[144,3]]){
  const html=run(`studentHomeProgress(${count})`);
  assert.equal((html.match(/class="is-complete"/g)||[]).length,completed);
  assert.match(html,/48 acumuladas/);assert.match(html,/96 acumuladas/);assert.match(html,/144 acumuladas/);
 }
 assert.match(run('studentHomeProgress(180)'),/value="144"/);
 assert.match(run('studentHomeProgress(-4)'),/value="0"/);
});
test('the guide remembers completion and tolerates invalid local state',()=>{
 run('saveStudentGuide(true)');assert.equal(run('studentGuideStatus().completed'),true);
 run('saveStudentGuide(false)');assert.equal(run('studentGuideStatus().seen'),true);assert.equal(run('studentGuideStatus().completed'),false);
 storage.set('ecs-student-guide-v1','invalid');assert.equal(run('studentGuideStatus()'),null);
});
test('students must finish onboarding before the dashboard',()=>{run('routes.dashboard()');assert.equal(context.location.redirect,'#/onboarding');});


test('reservation badge counts only upcoming active classes and sorts them',()=>{
 const now='2026-11-01T12:00:00';
 const result=run(`futureStudentReservations([
 {iso:'2026-11-03',time:'18:00',status:'Confirmada'},
 {iso:'2026-10-01',time:'18:00',status:'Confirmada'},
 {iso:'2026-11-02',time:'18:00',status:'Cancelada'},
 {iso:'2026-11-02',time:'09:00',status:'Confirmada'}
 ],new Date('${now}'))`);
 assert.equal(result.length,2);assert.equal(result[0].iso,'2026-11-02');
});
test('Meet actions preserve assigned rooms and reject external or unsafe destinations',()=>{
 assert.equal(run(`bookingMeetUrl({meetUrl:'https://meet.google.com/abc-defg-hij'})`),'https://meet.google.com/abc-defg-hij');
 for(const value of ['javascript:alert(1)','https://meet.google.com.evil.test/','https://example.com','http://meet.google.com/test'])assert.equal(run(`bookingMeetUrl({meetUrl:${JSON.stringify(value)}})`),'https://meet.google.com/');
 assert.equal(run('bookingMeetUrl({})'),'https://meet.google.com/');
});


test('the automatic tour is explicitly disabled',()=>{
 assert.equal(run('STUDENT_TOUR_ENABLED'),false);
 assert.equal(run('openStudentGuide()'),undefined);
});
test('individual slot validation respects credits, expiry, duplicate dates and package pace',()=>{
 const pkg={count:8,scheduled:1,perWeek:2,expires:'2026-12-01T23:59:59'};
 const now='2026-11-02T12:00:00';
 const issue=(choice,selected=[],bookings=[],plan=pkg)=>run(`bookingChoiceIssue(${JSON.stringify(choice)},${JSON.stringify(selected)},${JSON.stringify(plan)},${JSON.stringify(bookings)},new Date('${now}'))`);
 const choice={iso:'2026-11-03',time:'18:00',teacher:'Ashley Lara'};
 assert.equal(issue(choice),null);
 assert.match(issue(choice,[choice]),/ese día/);
 assert.match(issue(choice,[],[choice]),/ese día/);
 assert.match(issue(choice,[],[],{...pkg,count:1,scheduled:1}),/disponibles/);
 assert.match(issue({iso:'2026-12-02',time:'18:00'}),/vigencia/);
 assert.match(issue({iso:'2026-11-02',time:'09:00'}),/anticipación/);
 assert.match(issue({iso:'2026-11-08',time:'18:00'}),/lunes a sábado/);
 assert.match(issue({iso:'2026-11-05',time:'18:00'},[{iso:'2026-11-03',time:'18:00'}],[{iso:'2026-11-02',time:'09:00'}]),/por semana/);
 assert.equal(issue(choice,[],[{...choice,status:'Cancelada'}]),null);
});
test('calendar weeks share a Monday key across month boundaries',()=>{
 assert.equal(run("bookingWeekKey('2026-10-31')"),'2026-10-26');
 assert.equal(run("bookingWeekKey('2026-11-01')"),'2026-10-26');
 assert.equal(run("bookingWeekKey('2026-11-02')"),'2026-11-02');
});

test('weekly repeat offers one extra week or bounded series without exceeding credits',()=>{
 const base=`{iso:'2026-11-02',time:'09:00',teacher:'Ashley'}`;
 const pkg=`{count:3,scheduled:0,perWeek:2,expires:'2026-11-30T23:59:59'}`;
 const call=mode=>run(`weeklyBookingChoices(${base},'${mode}',${pkg},[],[${base}],new Date('2026-11-01T12:00:00'))`);
 assert.equal(call('once').choices.length,0);
 assert.equal(call('next').choices[0].iso,'2026-11-09');
 assert.equal(call('next').choices.length,1);
 assert.equal(call('all').choices.length,2);
 assert.ok(call('all').skipped.length>0);
});
test('weekly repeat skips booked dates and never crosses package expiry',()=>{
 const result=run(`weeklyBookingChoices({iso:'2026-11-02',time:'09:00',teacher:'Ashley'},'all',{count:8,scheduled:1,perWeek:2,expires:'2026-11-23T23:59:59'},[{iso:'2026-11-09',time:'11:00'}],[{iso:'2026-11-02',time:'09:00'}],new Date('2026-11-01T12:00:00'))`);
 assert.deepEqual(Array.from(result.choices,c=>c.iso),['2026-11-16','2026-11-23']);
 assert.equal(result.skipped.length,1);
});


test('following bookings exclude the primary, cancelled, completed and past reservations',()=>{
 const numbers=run(`followingStudentBookings([
 {id:4,iso:'2026-11-06',time:'10:00',status:'Confirmada'},
 {id:2,iso:'2026-11-03',time:'10:00',status:'Confirmada'},
 {id:1,iso:'2026-11-02',time:'10:00',status:'Confirmada'},
 {id:3,iso:'2026-11-04',time:'10:00',status:'Confirmada'},
 {id:5,iso:'2026-11-02',time:'09:00',status:'Cancelada'},
 {id:6,iso:'2026-11-02',time:'09:30',status:'Completada'},
 {id:7,iso:'2026-10-01',time:'10:00',status:'Confirmada'}
 ],new Date('2026-11-01T12:00:00')).map(b=>b.id).join(',')`);
 assert.equal(numbers,'2,3');
 assert.equal(run(`followingStudentBookings([],new Date('2026-11-01')).length`),0);
 assert.equal(run(`followingStudentBookings([{iso:'2026-11-02',time:'10:00'}],new Date('2026-11-01')).length`),0);
});
