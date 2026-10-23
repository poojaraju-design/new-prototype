// The session UI reads only these five context sections from a session JSON payload.
export type SessionContextData={
 context_summary?:string;
 symptoms?:{active_symptoms?:{symptom:string;locations?:string[];status?:string}[];severity_and_timing?:{onset?:string;monitoring_course?:{date:string;documented_severity:string;note?:string}[]};functional_impact?:string[];self_management_impact?:string[];documented_negatives?:string[]};
 medication_compliance?:{adherence_events?:{medication:string;event:string;follow_up_status?:string}[];barriers?:{barrier:string;affected_medication?:string;patient_characterization?:string}[];current_documented_status?:string;reported_side_effects?:string[];medication_reconciliation_relevance?:{status?:string;reason?:string;evidence_references?:string[]}};
 relevant_observations?:{observation:string;interpretation_boundary?:string}[];
 nursing_attention_items?:{attention_type:string;priority?:string;observation:string;nursing_relevance?:string;handoff_or_communication_need?:string;evidence_references?:string[]}[];
};
export type PatientSessionContext={specialty:string;updatedAt:string;data:SessionContextData};
export function extractSessionContext(payload:{context?:SessionContextData}):SessionContextData{const source=payload.context??{};return {context_summary:source.context_summary,symptoms:source.symptoms,medication_compliance:source.medication_compliance,relevant_observations:source.relevant_observations,nursing_attention_items:source.nursing_attention_items};}

export const suppliedSessionContext:PatientSessionContext = {
  "specialty": "Rheumatology",
  "updatedAt": "2026-09-21T22:05:00Z",
  "data": {
    "context_summary": "Post-session nursing context: the patient reported hand and knee joint pain/swelling after an unplanned all-day hike and a travel-related methotrexate refill delay. Symptoms remained present but were documented as mildly improving on September 21. Methotrexate was resumed when the refill arrived; folic acid and adalimumab were reported as continued. No fever, rash, or new medication side effects were reported.",
    "symptoms": {
      "active_symptoms": [
        {
          "symptom": "Joint pain and swelling",
          "locations": [
            "hands",
            "knees"
          ],
          "status": "present, improving but unresolved"
        },
        {
          "symptom": "Sleep disruption due to joint discomfort",
          "status": "reported over several nights; improving"
        }
      ],
      "severity_and_timing": {
        "onset": "Reported to have begun the day after an unplanned all-day hike, approximately five days before the completed session.",
        "monitoring_course": [
          {
            "date": "2026-09-19",
            "documented_severity": "moderate"
          },
          {
            "date": "2026-09-20",
            "documented_severity": "moderate"
          },
          {
            "date": "2026-09-21",
            "documented_severity": "mild",
            "note": "improving"
          }
        ]
      },
      "functional_impact": [
        "Sleep was disrupted for several nights because of joint discomfort.",
        "No further functional limitation was documented in the supplied record."
      ],
      "self_management_impact": [
        "The patient reported an unplanned all-day hike of approximately 32,000 steps before symptom onset; the session identifies this as a possible overexertion trigger.",
        "A delayed refill while traveling led to a missed weekly methotrexate dose; the record states this was logistical rather than intentional non-adherence."
      ],
      "documented_negatives": [
        "Fever denied; recorded temperatures were 98.6°F, 98.5°F, and 98.4°F from September 19 through 21.",
        "Rash denied.",
        "New medication side effects denied."
      ]
    },
    "medication_compliance": {
      "adherence_events": [
        {
          "medication": "methotrexate 15 mg weekly",
          "event": "One weekly dose documented as not taken on 2026-09-19 because a refill was delayed while traveling.",
          "follow_up_status": "Documented as taken on 2026-09-21 after the refill arrived."
        },
        {
          "medication": "folic acid 1 mg daily",
          "event": "Reported as continued; daily medicine logs were documented as taken."
        },
        {
          "medication": "adalimumab 40 mg every 2 weeks",
          "event": "Reported in the completed session as continued on schedule."
        }
      ],
      "barriers": [
        {
          "barrier": "Travel-related delayed refill",
          "affected_medication": "methotrexate",
          "patient_characterization": "logistical; not deliberate non-adherence"
        }
      ],
      "current_documented_status": "Methotrexate was reported as resumed once the refill arrived. Folic acid and adalimumab were reported as continued. Acetaminophen was being used as needed for joint pain; NSAIDs were being avoided because of documented ibuprofen-related gastrointestinal upset.",
      "reported_side_effects": [],
      "medication_reconciliation_relevance": {
        "status": "relevant",
        "reason": "The record contains a missed methotrexate dose due to refill access, followed by reported resumption. Confirming the current medication-access and dosing status would make the record internally clear.",
        "evidence_references": [
          "session:sess_syn_activity_spike_001",
          "monitoring:weekly_methotrexate:2026-09-19",
          "monitoring:weekly_methotrexate:2026-09-21"
        ]
      }
    },
    "relevant_observations": [
      {
        "observation": "The completed session reports approximately 32,000 steps during an unplanned all-day hike versus a usual 5,000 to 6,000 steps per day.",
        "interpretation_boundary": "This is patient-reported in the session narrative."
      },
      {
        "observation": "HealthKit 7-day mean steps were 7,742.9 with 100% coverage, compared with a 30-day mean of 5,966.7 with 93.3% coverage.",
        "interpretation_boundary": "These are windowed averages and do not themselves establish a single-day 32,000-step event."
      },
      {
        "observation": "Average recorded sleep was 5.6 hours across five of seven nights, compared with 6.8 hours across 22 of 30 nights.",
        "interpretation_boundary": "The session attributes several disrupted nights to joint discomfort; the aggregate sleep data do not establish cause."
      },
      {
        "observation": "SpO2, temperature, pulse, and blood pressure entries from September 19 through 21 were documented with normal clinical-severity labels.",
        "interpretation_boundary": "These observations do not replace clinical assessment."
      }
    ],
    "nursing_attention_items": [
      {
        "attention_type": "medication_access_and_reconciliation",
        "priority": "moderate",
        "observation": "One weekly methotrexate dose was missed because a refill was delayed during travel; a later entry documents that the dose was resumed.",
        "nursing_relevance": "The record supports checking that the documented medication status and practical access issue are understood and accurately reflected.",
        "handoff_or_communication_need": "Medication-access barrier and documented resumption are suitable for routine nursing follow-up or handoff; no medication change is inferred.",
        "evidence_references": [
          "session:sess_syn_activity_spike_001",
          "monitoring:weekly_methotrexate:2026-09-19",
          "monitoring:weekly_methotrexate:2026-09-21",
          "flag:medication_adherence_lapse"
        ]
      },
      {
        "attention_type": "symptom_and_self_management_follow_up",
        "priority": "moderate",
        "observation": "Hand and knee joint pain/swelling followed unusual exertion, remained present across three monitoring days, and was documented as mildly improving on September 21.",
        "nursing_relevance": "The record supports awareness of current unresolved symptoms, sleep disruption, and the patient-reported self-management context.",
        "handoff_or_communication_need": "The symptom course and activity context are suitable for routine nursing follow-up or handoff; no new diagnosis or treatment instruction is inferred.",
        "evidence_references": [
          "session:sess_syn_activity_spike_001",
          "monitoring:joint_pain_swelling:2026-09-19",
          "monitoring:joint_pain_swelling:2026-09-20",
          "monitoring:joint_pain_swelling:2026-09-21",
          "flag:activity_overexertion_flare_trigger"
        ]
      }
    ]
  }
};
