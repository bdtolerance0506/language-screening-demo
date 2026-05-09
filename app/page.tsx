"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://xdvmwyvoeziirciullif.supabase.co",
  "sb_publishable_cH5UHB8T9HDmasfg87Qczg_usZslQQL"
);

const questions = [
  { text: "Does your child follow simple spoken instructions without gestures (for example: 'Give the cup to mom')?", domain: "receptive", reverse: false },
  { text: "Does your child understand common daily words such as eat, shoes, big, or red?", domain: "receptive", reverse: false },
  { text: "Does your child understand concepts such as big/small, more/less, or fast/slow?", domain: "receptive", reverse: false },
  { text: "Does your child understand location words such as on, under, or behind?", domain: "receptive", reverse: false },
  { text: "Does your child understand simple stories (for example predicting what might happen next or noticing when something unexpected happens)?", domain: "receptive", reverse: false },
  { text: "Does your child recognize common categories such as fruits, animals, or vehicles?", domain: "receptive", reverse: false },
  { text: "Does your child understand question words such as who, what, or where?", domain: "receptive", reverse: false },
  { text: "Does a noisy environment make it harder for your child to understand spoken language?", domain: "receptive", reverse: true },

  { text: "Does your child use many different spoken words to communicate?", domain: "expressive", reverse: false },
  { text: "Does your child combine two words together (for example 'mom hug' or 'more milk')?", domain: "expressive", reverse: false },
  { text: "Does your child express needs or wants using words?", domain: "expressive", reverse: false },
  { text: "Can unfamiliar listeners (for example grandparents or teachers) usually understand what your child says?", domain: "expressive", reverse: false },
  { text: "Does your child initiate communication with others?", domain: "expressive", reverse: false },
  { text: "Does your child imitate adult speech or intonation patterns?", domain: "expressive", reverse: false },
  { text: "Does your child use short phrases or sentences when speaking?", domain: "expressive", reverse: false },
  { text: "Does your child use pronouns appropriately for your language (for example I, me, you)?", domain: "expressive", reverse: false },
  { text: "Does your child talk about events that happened earlier in the day?", domain: "expressive", reverse: false },
  { text: "Compared with children of the same age, do you feel your child’s language is developing typically?", domain: "expressive", reverse: false },

  { text: "Does your child use language to start interactions with others?", domain: "social", reverse: false },
  { text: "Does your child share attention with you during interaction (for example looking at the same object and checking if you are also looking)?", domain: "social", reverse: false },
  { text: "Does your child take turns during play or conversation?", domain: "social", reverse: false },
  { text: "Does your child understand and use gestures such as pointing, waving, or nodding?", domain: "social", reverse: false },
  { text: "Does your child engage in simple back-and-forth conversation?", domain: "social", reverse: false },
  { text: "Does your child adjust their communication style, tone, or volume depending on the situation?", domain: "social", reverse: false },
  { text: "Does your child usually respond when spoken to?", domain: "social", reverse: false },
  { text: "Does your child frequently repeat words or phrases from TV or from other people?", domain: "social", reverse: true },
  { text: "Does your child use toys in expected ways (for example feeding a doll, pushing a toy car, or pretending with toys)?", domain: "social", reverse: false },
  { text: "Does your child follow your pointing or bring objects to show you something interesting?", domain: "social", reverse: false },

  { text: "Can unfamiliar listeners understand a large portion of your child’s speech?", domain: "speech", reverse: false },
  { text: "Does your child often replace one sound with another (for example saying 'tar' instead of 'car')?", domain: "speech", reverse: true },
  { text: "Does your child leave out sounds in words (for example 'fi' instead of 'fish')?", domain: "speech", reverse: true },
  { text: "Does your child have difficulty saying longer or more complex words?", domain: "speech", reverse: true },
  { text: "Does your child’s speech sometimes appear effortful or accompanied by unusual mouth movements?", domain: "speech", reverse: true, flag: "oral_motor" },
  { text: "Does your child produce a variety of speech sounds when talking or babbling?", domain: "speech", reverse: false },
  { text: "Does your child respond consistently when their name is called?", domain: "social", reverse: false, flag: "no_response_name" },
  { text: "Does your child show frustration when others cannot understand what they are saying?", domain: "speech", reverse: true }
];

const strategies: any = {
  receptive: ["Give one instruction at a time", "Use clear and consistent language", "Reduce background noise when possible"],
  expressive: ["Expand your child’s speech", "Model short and clear sentences", "Encourage verbal requests"],
  social: ["Practice turn-taking", "Use interactive play", "Model social communication"],
  speech: ["Model clear pronunciation", "Slow down your speech", "Repeat correct forms naturally"]
};

export default function Page() {
  const [accepted, setAccepted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [rawSelected, setRawSelected] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  if (!accepted) {
    return (
      <div style={{ padding: 40, maxWidth: 800 }}>
        <h1>Important Information</h1>
        <p>This tool is a developmental screening and parent guidance system. It is NOT a medical or clinical service.</p>
        <ul>
          <li>It does NOT provide diagnosis.</li>
          <li>It does NOT provide speech or language therapy.</li>
          <li>It does NOT replace a licensed Speech-Language Pathologist.</li>
        </ul>
        <button onClick={() => setAccepted(true)}>I Understand and Continue</button>
      </div>
    );
  }

  const handleAnswer = (score: number) => {
    const q: any = questions[current];
    const final = q.reverse ? 2 - score : score;
    setSelected(final);
    setRawSelected(score);
  };

  const calculateDomains = (ans: number[]) => {
    const map: any = { receptive: [], expressive: [], social: [], speech: [] };
    questions.forEach((q: any, i) => map[q.domain].push(ans[i]));

    const out: any = {};
    Object.keys(map).forEach((d) => {
      const avg = map[d].reduce((a: number, b: number) => a + b, 0) / map[d].length;
      out[d] = avg >= 1.5 ? "Strong" : avg >= 1 ? "Mild Concern" : "At Risk";
    });
    return out;
  };

  const applyRedFlags = (ans: number[], base: string) => {
    let level = base;
    questions.forEach((q: any, i) => {
      if (q.flag === "no_response_name" && ans[i] === 0) level = "Moderate Risk";
      if (q.flag === "oral_motor" && ans[i] === 2) level = "Moderate Risk";
    });
    return level;
  };

  const next = async () => {
    if (selected === null) return alert("Please select an answer.");

    const newAnswers = [...answers];
    newAnswers[current] = selected;

    setAnswers(newAnswers);
    setSelected(null);
    setRawSelected(null);

    if (current < questions.length - 1) {
      setCurrent(current + 1);
      return;
    }

    const score = newAnswers.reduce((a, b) => a + b, 0);

    let level =
      score <= 50 ? "High Risk" :
      score <= 65 ? "Moderate Risk" :
      score <= 75 ? "Mild Risk" :
      "Typical";

    level = applyRedFlags(newAnswers, level);
    const domains = calculateDomains(newAnswers);

    const finalResult = { score, level, domains, answers: newAnswers };

    setSaving(true);

    const { error } = await supabase.from("records").insert([
      {
        score,
        level,
        domains,
        answers: newAnswers,
        raw_data: finalResult
      }
    ]);

    setSaving(false);

    if (error) {
      alert("Saved locally, but failed to upload to database. Please tell the admin.");
      console.error(error);
    }

    setResult(finalResult);
  };

  if (result) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Screening Result</h1>
        <p><b>Score:</b> {result.score}</p>
        <p><b>Risk Level:</b> {result.level}</p>

        <h3>Important</h3>
        <p>This result is based on a screening questionnaire and does NOT constitute a clinical diagnosis.</p>
        <p>If concerns persist, please seek evaluation from a licensed Speech-Language Pathologist.</p>

        <h3>Domain Breakdown</h3>
        {Object.keys(result.domains).map((d) => (
          <p key={d}>{d}: {result.domains[d]}</p>
        ))}

        <h3>Strategies</h3>
        {Object.keys(result.domains).map((d) =>
          result.domains[d] !== "Strong" ? (
            <div key={d}>
              <b>{d}</b>
              <ul>
                {strategies[d].map((s: string, i: number) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          ) : null
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Question {current + 1} / {questions.length}</h2>
      <p>{questions[current].text}</p>

      {[
        { label: "Yes", v: 2 },
        { label: "Sometimes", v: 1 },
        { label: "No", v: 0 }
      ].map((opt) => (
        <button
          key={opt.v}
          onClick={() => handleAnswer(opt.v)}
          style={{
            display: "block",
            margin: "12px 0",
            padding: 12,
            background: rawSelected === opt.v ? "#ccc" : "#eee"
          }}
        >
          {opt.label}
        </button>
      ))}

      <button onClick={next} disabled={saving}>
        {saving ? "Saving..." : "Next"}
      </button>
    </div>
  );
}