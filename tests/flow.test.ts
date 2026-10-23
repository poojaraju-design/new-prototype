import test from 'node:test';
import assert from 'node:assert/strict';
import {bundles,isDone,nextPriority,saveAnswer,reportWeeks,revealOrder,getDemoSessionPlan,wellbeingDemo,sessionSnapshot,upsertSessionRecord,createDemoVitals,getDeviceFollowUp} from '../src/data.ts';

test('priority sequence starts with Joints, then Medications and skips device-filled BP',()=>{
 let answers={};assert.equal(nextPriority(answers),0);
 for(let n=0;n<4;n++) answers=saveAnswer(answers,0,`Answer ${n}`);
 assert.equal(nextPriority(answers),1);assert.equal(isDone(2,answers),true);
 for(let n=0;n<4;n++) answers=saveAnswer(answers,1,`Answer ${n}`);
 assert.equal(nextPriority(answers),3);
});
test('answers remain immutable, empty values do not commit, completed bundles do not grow',()=>{
 const initial={};const first=saveAnswer(initial,0,'Comfortable');assert.deepEqual(initial,{});assert.deepEqual(first,{0:['Comfortable']});
 assert.equal(saveAnswer(first,0,'  '),first);
 let complete=first;for(let i=0;i<3;i++)complete=saveAnswer(complete,0,'Yes');
 assert.equal(saveAnswer(complete,0,'One more'),complete);
 assert.equal(saveAnswer(complete,2,'Device answer'),complete);
});
test('Back / Resume reads the first unanswered question without committing a draft',()=>{
 const answers=saveAnswer({},0,'Comfortable');const index=answers[0].length;
 assert.match(bundles[0].questions[index].text,/stiffness changed/);
 assert.equal(index,1);assert.equal(answers[0].length,1);
});
test('Vitals is a device-only bundle and Joints & Movement excludes numerical vital questions',()=>{assert.equal(bundles[2].name,'Vitals');assert.equal(bundles[2].device,true);assert.equal(bundles[2].questions.length,0);assert.equal(bundles[0].name,'Joints & Movement');assert.match(bundles[0].questions[2].text,/moving around/);assert.equal(bundles.some(bundle=>bundle.name==='Movement'),false);assert.equal(bundles.some(bundle=>bundle.questions.some(question=>/temperature|blood pressure/i.test(question.text))),false);});
test('each report shows only its preceding three weeks and matches the selected week',()=>{
 assert.deepEqual(reportWeeks('oct18').map(w=>w.completed),[5,4,5]);
 assert.deepEqual(reportWeeks('oct11').map(w=>w.id),['sep27','oct04','oct11']);
 assert.deepEqual(reportWeeks('oct04').map(w=>w.id),['sep20','sep27','oct04']);
 assert.deepEqual(reportWeeks('missing'),[]);
});
test('radar reveals outermost cues first and all names exactly once',()=>{
 assert.deepEqual(revealOrder,[1,0,4,3,2]);assert.equal(new Set(revealOrder).size,5);
 assert.deepEqual([...revealOrder].sort(),[0,1,2,3,4]);
});

test('priority follows the supplied queue and excludes skipped, completed, and device bundles',()=>{
 assert.equal(nextPriority({},[0]),1);
 assert.equal(nextPriority({},[],[3,1,0]),3);
 assert.equal(nextPriority({3:['a','b','c','d']},[1],[3,2,1,0]),0);
 assert.equal(nextPriority({},[0,1,3,4,5]),-1);
});

test('demo backend uses explicit response fixtures and defaults for other replies',()=>{
 const fallback=getDemoSessionPlan(wellbeingDemo.reply);assert.equal(fallback.reason,'default');assert.deepEqual(fallback.queue,[0,1,2,3,4]);
 assert.deepEqual(getDemoSessionPlan('I have been sleeping poorly lately.').queue,[3,0,1,2,4]);
 assert.deepEqual(getDemoSessionPlan('I would like to talk about my medication refill.').queue,[1,0,2,3,4]);
 assert.equal(getDemoSessionPlan('a different reply').reason,'default');
});

test('session snapshots copy answers and queues and upsert by ID with newest sessions first',()=>{
 const answers={0:['Comfortable']},skipped=[1],queue=[0,1,2];
 const record=sessionSnapshot('one','2026-10-21T10:00:00.000Z',answers,skipped,queue,null);
 answers[0].push('Comfortable');skipped.push(3);queue.reverse();
 assert.deepEqual(record.answers[0],['Comfortable']);assert.deepEqual(record.skipped,[1]);assert.deepEqual(record.queue,[0,1,2]);
 const later=sessionSnapshot('two','2026-10-21T11:00:00.000Z',{},[],[],null);
 const records=upsertSessionRecord(upsertSessionRecord([],record),later);assert.deepEqual(records.map(item=>item.id),['two','one']);
 assert.equal(upsertSessionRecord(records,{...record,answers:{0:['updated']}}).length,2);
 assert.equal(record.status,'awaiting');
});

test('fever follow-up uses backend freshness, including missing readings, without asking for values',()=>{const fresh=createDemoVitals();assert.equal(getDeviceFollowUp('fever',fresh),null);const stale=fresh.map(reading=>({...reading,fresh:reading.kind!=='temperature'}));assert.equal(getDeviceFollowUp('fever',stale),'temperature');assert.equal(getDeviceFollowUp('fever',[]),'temperature');assert.equal(getDeviceFollowUp(null,stale),null);assert.equal(getDemoSessionPlan('I feel a fever coming on.',stale).readingRequest,'temperature');assert.equal(getDemoSessionPlan('I feel a fever coming on.',fresh).readingRequest,null);});
test('vital snapshots retain the device readings for that session',()=>{const readings=createDemoVitals('2026-10-23T15:00:00.000Z');const snapshot=sessionSnapshot('vitals','2026-10-23T15:00:00.000Z',{},[],[0,1,2,3,4],null,readings);readings[0].value='changed';assert.equal(snapshot.vitals[0].value,'120/78');assert.equal(snapshot.vitals[1].recordedAt,'2026-10-23T15:00:00.000Z');});
