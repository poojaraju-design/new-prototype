import {suppliedSessionContext} from './session-context.ts';
import type {PatientSessionContext} from './session-context.ts';
export type Mode='voice'|'tap';
export type Question={text:string;options:string[];sample:string;scale?:{min:number;max:number;lowLabel:string;highLabel:string}};
export type Bundle={name:string;caption:string;icon:string;tone:string;status:string;questions:Question[];device?:boolean};
const q=(text:string,options:string[],sample=options[0]):Question=>({text,options,sample});
export const bundles:Bundle[]=[
 {name:'Joints & Movement',caption:'Joint comfort, stiffness and daily movement',icon:'sun',tone:'focus',status:'Today’s focus',questions:[{text:'How would you rate your joint pain today?',options:[],sample:'My joint pain is 2 out of 10.',scale:{min:0,max:10,lowLabel:'No pain',highLabel:'Worst pain'}},q('Has the stiffness changed since last week?',['Better','The same','Worse'],'The stiffness feels better than last week.'),q('How has moving around felt today?',['Comfortable','Tiring','Difficult'],'Moving around has felt comfortable today.'),q('Anything you would like your care team to know?',['Nothing today','Add a note'],'Nothing else today, thank you.')]},
 {name:'Medications',caption:'Refill follow-up and daily routine',icon:'pill',tone:'focus',status:'Today’s focus',questions:[q('Have you taken today’s scheduled medicines?',['Yes','Not yet','Missed a dose'],'Yes, I took them this morning.'),q('Any side effects to report?',['None','Yes'],'No side effects to report.'),q('Do you need a refill?',['No','Yes','Not sure'],'Yes, I would like to check on my refill.'),q('Any questions about your medicines?',['No','Add a note'],'No other questions today.')]},
 {name:'Vitals',caption:'Blood pressure and temperature from your devices',icon:'pressure',tone:'ready',status:'Readings ready',device:true,questions:[]},
 {name:'Sleep & recovery',caption:'Sleep quality and recovery',icon:'moon',tone:'due',status:'Due this week',questions:[q('How did you sleep?',['Well','Okay','Poorly']),q('How many hours did you sleep?',['Under 5','5–7','Over 7']),q('Did you wake during the night?',['No','Once','Several times']),q('Do you feel rested?',['Yes','Somewhat','No'])]},
 {name:'Nutrition',caption:'Small everyday habits, at your pace.',icon:'nutrition',tone:'optional',status:'Optional today',questions:[q('How is your appetite?',['As usual','Less than usual','More than usual']),q('Have you eaten today?',['Yes','Not yet']),q('How is drinking fluids going?',['As usual','Less than usual']),q('Any trouble eating or drinking?',['No','Add a note'])]},

];
export type Answers=Record<number,string[]>;
export function isDone(index:number,answers:Answers){return !!bundles[index]?.device || (answers[index]?.length??0)>=(bundles[index]?.questions.length??Infinity);}
export const sessionQueue=[0,1,2,3,4];
export function nextPriority(answers:Answers,skipped:readonly number[]=[],queue:readonly number[]=sessionQueue){return queue.find(index=>!isDone(index,answers)&&!skipped.includes(index))??-1;}
export function saveAnswer(answers:Answers,index:number,value:string):Answers {if(!value.trim()||isDone(index,answers))return answers;return {...answers,[index]:[...(answers[index]||[]),value.trim()]};}
export const radarOrder=[0,1,3,2,4];
export const revealOrder=[1,0,4,3,2];
export const reportHistory=[
 {id:'sep20',date:'September 14–20',short:'Sep 14',completed:3,stiffness:40,sleep:5.5},
 {id:'sep27',date:'September 21–27',short:'Sep 21',completed:4,stiffness:35,sleep:6},
 {id:'oct04',date:'September 28–October 4',short:'Sep 28',completed:5,stiffness:30,sleep:6},
 {id:'oct11',date:'October 5–11',short:'Oct 5',completed:4,stiffness:25,sleep:6.5},
 {id:'oct18',date:'October 12–18',short:'Oct 12',completed:5,stiffness:20,sleep:7}
];
export function reportWeeks(id:string){const end=reportHistory.findIndex(week=>week.id===id);return end<0?[]:reportHistory.slice(Math.max(0,end-2),end+1);}

// Scripted fixtures simulate a backend decision; these are not clinical triage rules.
export const wellbeingDemo={question:'Hi John, how are you feeling today? Is there anything new or different you’d like to tell me?',reply:'I’m feeling okay today. Nothing new to report.'};
export type DeviceReading={kind:'blood-pressure'|'temperature';label:string;value:string;unit:string;recordedAt:string;deviceName:string;fresh:boolean};
export function createDemoVitals(recordedAt=new Date().toISOString()):DeviceReading[]{return [{kind:'blood-pressure',label:'Blood pressure',value:'120/78',unit:'mmHg',recordedAt,deviceName:'Blood pressure cuff',fresh:true},{kind:'temperature',label:'Temperature',value:'36.8',unit:'°C',recordedAt,deviceName:'Thermometer',fresh:true}];}
export const demoVitals=createDemoVitals();
// Freshness is supplied by the device/backend; the UI does not decide clinical thresholds.
export function getDeviceFollowUp(concern:'fever'|null,readings:readonly DeviceReading[]){return concern==='fever'&&!readings.some(reading=>reading.kind==='temperature'&&reading.fresh)?'temperature' as const:null;}
export function getDemoSessionPlan(reply:string,readings:readonly DeviceReading[]=demoVitals):{queue:number[];reason:'default'|'demo-concern';readingRequest:'temperature'|null}{
 const fixtures:Record<string,number[]>={
  'I have been sleeping poorly lately.':[3,0,1,2,4],
  'I would like to talk about my medication refill.':[1,0,2,3,4]
 };
 const concern=reply==='I feel a fever coming on.'?'fever':null;
 const queue=concern==='fever'?[2,0,1,3,4]:fixtures[reply];return {queue:[...(queue??sessionQueue)],reason:queue||concern?'demo-concern':'default',readingRequest:getDeviceFollowUp(concern,readings)};
}

export const wellbeingTiming={greeting:4500,listenLead:650,word:380,replyHold:1000,gettingStarted:1600,handoff:650};

export type SessionRecord={id:string;startedAt:string;updatedAt:string;status:'awaiting'|'reviewed'|'not-recorded';answers:Answers;skipped:number[];queue:number[];wellbeingReply:string|null;feedback?:string;reviewedAt?:string;sample:boolean;vitals:DeviceReading[];context?:PatientSessionContext};
export function sessionSnapshot(id:string,startedAt:string,answers:Answers,skipped:readonly number[],queue:readonly number[],wellbeingReply:string|null,vitals:readonly DeviceReading[]=demoVitals):SessionRecord{return {id,startedAt,updatedAt:new Date().toISOString(),status:'awaiting',answers:Object.fromEntries(Object.entries(answers).map(([key,values])=>[key,[...values]])),skipped:[...skipped],queue:[...queue],wellbeingReply,sample:false,vitals:vitals.map(reading=>({...reading}))};}
export function upsertSessionRecord(records:SessionRecord[],record:SessionRecord){return [...records.filter(item=>item.id!==record.id),record].sort((a,b)=>b.startedAt.localeCompare(a.startedAt));}
export const sampleSessionRecords:SessionRecord[]=[
 {id:'sample-awaiting',startedAt:'2026-10-20T16:15:00.000Z',updatedAt:'2026-10-20T16:20:00.000Z',status:'awaiting',answers:{0:['Comfortable','Better','Comfortable','Nothing today'],1:['Yes','None']},skipped:[1,3,4],queue:[...sessionQueue],wellbeingReply:'I’m feeling okay today.',sample:true,vitals:createDemoVitals('2026-10-20T16:15:00.000Z')},
 {id:'sample-reviewed',startedAt:'2026-10-19T16:05:00.000Z',updatedAt:'2026-10-19T17:30:00.000Z',status:'reviewed',answers:{0:['A little stiff','The same','Tiring','Nothing today'],1:['Yes','None','No','No'],3:['Okay','5–7','Once','Somewhat']},skipped:[4],queue:[...sessionQueue],wellbeingReply:'I’m doing okay today.',feedback:'Thank you for your check-in. I’ve reviewed the information you shared.',reviewedAt:'2026-10-19T17:30:00.000Z',sample:true,vitals:createDemoVitals('2026-10-19T16:05:00.000Z')},
 {id:'sample-sess_syn_activity_spike_001',startedAt:suppliedSessionContext.updatedAt,updatedAt:suppliedSessionContext.updatedAt,status:'reviewed',answers:{},skipped:[],queue:[],wellbeingReply:null,sample:true,vitals:[],context:suppliedSessionContext}
];

export type PatientProfile={name:string;age:number;weightKg:number;heightCm:number};
// Demo values stand in for the profile populated during first signup.
export const demoPatientProfile:PatientProfile={name:'John',age:67,weightKg:72,heightCm:173};

// Daily sample readings are scoped to each report's Monday–Sunday range.
export function reportDays(id:string){const report=reportHistory.find(week=>week.id===id);const starts:Record<string,string>={sep20:'2026-09-14',sep27:'2026-09-21',oct04:'2026-09-28',oct11:'2026-10-05',oct18:'2026-10-12'};if(!report||!starts[id])return [];return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day,index)=>{const date=new Date(`${starts[id]}T12:00:00Z`);date.setUTCDate(date.getUTCDate()+index);return {date:date.toISOString().slice(0,10),day,label:`${day} ${date.getUTCDate()}`,completed:Math.max(0,report.completed-[0,1,0,1,0,0,0][index]),stiffness:report.stiffness+[10,5,0,-5,0,-5,-5][index],sleep:report.sleep+[-.5,0,.5,-.5,0,.5,0][index]};});}
