const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const storage=new Map();
const context={URL,window:{},routes:{perfil(){}},document:{addEventListener(){}},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)},journey:{completed:false},location:{replace(value){this.redirect=value;}}};
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
