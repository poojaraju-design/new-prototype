export type Mode='voice'|'tap';
export type Question={text:string;options:string[];sample:string;temperature?:boolean};
export type Bundle={name:string;caption:string;icon:string;tone:string;status:string;questions:Question[];device?:boolean};
const q=(text:string,options:string[],sample=options[0]):Question=>({text,options,sample});
export const bundles:Bundle[]=[
 {name:'Joints & temperature',caption:'Morning stiffness and joint changes',icon:'temperature',tone:'focus',status:'Today’s focus',questions:[{...q('What is your temperature today?',['No temperature reading'],'37.0 °C'),temperature:true},q('How are your joints feeling this morning?',['Comfortable','A little stiff','More painful'],'A little stiff this morning.'),q('Has the stiffness changed since last week?',['Better','The same','Worse'],'The stiffness feels better than last week.'),q('Anything you would like your care team to know?',['Nothing today','Add a note'],'Nothing else today, thank you.')]},
 {name:'Medications',caption:'Refill follow-up and daily routine',icon:'pill',tone:'focus',status:'Today’s focus',questions:[q('Have you taken today’s scheduled medicines?',['Yes','Not yet','Missed a dose'],'Yes, I took them this morning.'),q('Any side effects to report?',['None','Yes'],'No side effects to report.'),q('Do you need a refill?',['No','Yes','Not sure'],'Yes, I would like to check on my refill.'),q('Any questions about your medicines?',['No','Add a note'],'No other questions today.')]},
 {name:'Blood pressure',caption:'Fresh cuff reading received',icon:'pressure',tone:'ready',status:'Reading ready',device:true,questions:[]},
 {name:'Sleep & recovery',caption:'Sleep quality and recovery',icon:'moon',tone:'due',status:'Due this week',questions:[q('How did you sleep?',['Well','Okay','Poorly']),q('How many hours did you sleep?',['Under 5','5–7','Over 7']),q('Did you wake during the night?',['No','Once','Several times']),q('Do you feel rested?',['Yes','Somewhat','No'])]},
 {name:'Nutrition',caption:'Small everyday habits, at your pace.',icon:'nutrition',tone:'optional',status:'Optional today',questions:[q('How is your appetite?',['As usual','Less than usual','More than usual']),q('Have you eaten today?',['Yes','Not yet']),q('How is drinking fluids going?',['As usual','Less than usual']),q('Any trouble eating or drinking?',['No','Add a note'])]},
 {name:'Movement',caption:'Function, grip, and daily movement',icon:'sun',tone:'optional',status:'Optional today',questions:[q('Have you moved around today?',['Yes','A little','Not yet']),q('How did activity feel?',['Comfortable','Tiring','Difficult']),q('Have you connected with someone today?',['Yes','Not yet']),q('Is there anything you need help with?',['Nothing today','Add a note'])]}
];
export type Answers=Record<number,string[]>;
export function isDone(index:number,answers:Answers){return !!bundles[index]?.device || (answers[index]?.length??0)>=4;}
export const sessionQueue=[0,1,2,3,4,5];
export function nextPriority(answers:Answers,skipped:readonly number[]=[],queue:readonly number[]=sessionQueue){return queue.find(index=>!isDone(index,answers)&&!skipped.includes(index))??-1;}
export function saveAnswer(answers:Answers,index:number,value:string):Answers {if(!value.trim()||isDone(index,answers))return answers;return {...answers,[index]:[...(answers[index]||[]),value.trim()]};}
export function toFahrenheit(c:number){return c*9/5+32;}
export function toCelsius(f:number){return (f-32)*5/9;}
export const radarOrder=[0,1,3,2,5];
export const revealOrder=[1,0,5,3,2];
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
export function getDemoSessionPlan(reply:string):{queue:number[];reason:'default'|'demo-concern'}{
 const fixtures:Record<string,number[]>={
  'I have been sleeping poorly lately.':[3,0,1,2,4,5],
  'I would like to talk about my medication refill.':[1,0,2,3,4,5]
 };
 const queue=fixtures[reply];return {queue:[...(queue??sessionQueue)],reason:queue?'demo-concern':'default'};
}

export const wellbeingTiming={greeting:4500,listenLead:650,word:380,replyHold:1000,gettingStarted:1600,handoff:650};

export type SessionRecord={id:string;startedAt:string;updatedAt:string;status:'awaiting'|'reviewed';answers:Answers;skipped:number[];queue:number[];wellbeingReply:string|null;feedback?:string;reviewedAt?:string;sample:boolean};
export function sessionSnapshot(id:string,startedAt:string,answers:Answers,skipped:readonly number[],queue:readonly number[],wellbeingReply:string|null):SessionRecord{return {id,startedAt,updatedAt:new Date().toISOString(),status:'awaiting',answers:Object.fromEntries(Object.entries(answers).map(([key,values])=>[key,[...values]])),skipped:[...skipped],queue:[...queue],wellbeingReply,sample:false};}
export function upsertSessionRecord(records:SessionRecord[],record:SessionRecord){return [...records.filter(item=>item.id!==record.id),record].sort((a,b)=>b.startedAt.localeCompare(a.startedAt));}
export const sampleSessionRecords:SessionRecord[]=[
 {id:'sample-awaiting',startedAt:'2026-10-20T16:15:00.000Z',updatedAt:'2026-10-20T16:20:00.000Z',status:'awaiting',answers:{0:['37.0 °C','Comfortable','Better','Nothing today'],1:['Yes','None']},skipped:[1,3,4,5],queue:[...sessionQueue],wellbeingReply:'I’m feeling okay today.',sample:true},
 {id:'sample-reviewed',startedAt:'2026-10-19T16:05:00.000Z',updatedAt:'2026-10-19T17:30:00.000Z',status:'reviewed',answers:{0:['No temperature reading','A little stiff','The same','Nothing today'],1:['Yes','None','No','No'],3:['Okay','5–7','Once','Somewhat']},skipped:[4,5],queue:[...sessionQueue],wellbeingReply:'I’m doing okay today.',feedback:'Thank you for your check-in. I’ve reviewed the information you shared.',reviewedAt:'2026-10-19T17:30:00.000Z',sample:true}
];

export type PatientProfile={name:string;age:number;weightKg:number;heightCm:number};
// Demo values stand in for the profile populated during first signup.
export const demoPatientProfile:PatientProfile={name:'John',age:67,weightKg:72,heightCm:173};
