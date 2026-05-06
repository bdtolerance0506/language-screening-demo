"use client";

import { useState, useEffect } from "react";

export default function Page() {
  const [config, setConfig] = useState<any>(null);
  const [accepted, setAccepted] = useState(false);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [meta, setMeta] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [rawSelected, setRawSelected] = useState<number | null>(null);

  const [result, setResult] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [engagement, setEngagement] = useState(0);

  useEffect(() => {
    const cfg = localStorage.getItem("config");
    const rec = localStorage.getItem("records");
    const eng = localStorage.getItem("engagement");

    if (cfg) setConfig(JSON.parse(cfg));
    if (rec) setRecords(JSON.parse(rec));
    if (eng) setEngagement(JSON.parse(eng));
  }, []);

  if (!config) {
    return <div style={{ padding: 40 }}>Go to /admin and Save first</div>;
  }

  // ===== DISCLAIMER =====
  if (!accepted) {
    return (
      <div style={{ padding: 40, maxWidth: 800 }}>
        <h1>Important Information</h1>

        <p>
          This tool is a developmental screening and guidance system.
          It is NOT a medical or clinical service.
        </p>

        <ul>
          <li>NOT diagnosis</li>
          <li>NOT therapy</li>
          <li>NOT replacement for SLP</li>
        </ul>

        <p>
          If concerned, please consult a licensed professional.
        </p>

        <button onClick={() => setAccepted(true)}>
          I Understand and Continue
        </button>
      </div>
    );
  }

  // ===== LOGIC =====
  const handleAnswer = (score: number) => {
    const q = config.questions[current];
    const final = q.reverse ? 2 - score : score;

    setSelected(final);
    setRawSelected(score);

    const newMeta = [...meta];
    newMeta[current] = q.flag || null;
    setMeta(newMeta);
  };

  const applyRedFlags = (answers: number[], meta: any[], base: string) => {
    let level = base;

    meta.forEach((flag, i) => {
      const score = answers[i];

      if (flag === "no_response_name" && score === 0) {
        level = "Moderate Risk";
      }

      if (flag === "oral_motor" && score === 2) {
        level = "Moderate Risk";
      }
    });

    return level;
  };

  const calculateDomains = (answers: number[]) => {
    const map: any = { receptive: [], expressive: [], social: [], speech: [] };

    config.questions.forEach((q: any, i: number) => {
      map[q.domain].push(answers[i]);
    });

    const result: any = {};

    Object.keys(map).forEach((d) => {
      const avg =
        map[d].reduce((a: number, b: number) => a + b, 0) / map[d].length;

      result[d] =
        avg >= 1.5 ? "Strong" : avg >= 1 ? "Mild Concern" : "At Risk";
    });

    return result;
  };

  const getTrend = (records: any[]) => {
    if (records.length < 2) return "Not enough data";

    const first = records[0].score;
    const last = records[records.length - 1].score;

    if (last > first) return "Improving";
    if (last === first) return "Stable";
    return "Needs Attention";
  };

  const next = () => {
    if (selected === null) return alert("Please select");

    const newAns = [...answers];
    newAns[current] = selected;

    setAnswers(newAns);
    setSelected(null);
    setRawSelected(null);

    if (current < config.questions.length - 1) {
      setCurrent(current + 1);
    } else {
      const total = newAns.reduce((a, b) => a + b, 0);

      let level =
        total <= 50
          ? "High Risk"
          : total <= 65
          ? "Moderate Risk"
          : total <= 75
          ? "Mild Risk"
          : "Typical";

      const finalLevel = applyRedFlags(newAns, meta, level);
      const domains = calculateDomains(newAns);

      const record = {
        score: total,
        level: finalLevel,
        domains,
        date: new Date().toISOString(),
      };

      const existing = JSON.parse(localStorage.getItem("records") || "[]");
      existing.push(record);
      localStorage.setItem("records", JSON.stringify(existing));

      setRecords(existing);
      setResult(record);
    }
  };

  const logPractice = () => {
    const val = engagement + 1;
    setEngagement(val);
    localStorage.setItem("engagement", JSON.stringify(val));
  };

  // ===== RESULT =====
  if (result) {
    const latest = records[records.length - 1];

    return (
      <div style={{ padding: 40 }}>
        <h1>Result</h1>

        <p>Score: {result.score}</p>
        <p>Risk: {result.level}</p>

        <h3>Important</h3>
        <p>This is NOT a diagnosis.</p>

        <h3>Domain Breakdown</h3>
        {Object.keys(latest.domains).map((d) => (
          <p key={d}>
            {d}: {latest.domains[d]}
          </p>
        ))}

        <h3>Strategies</h3>
        {Object.keys(latest.domains).map((d) =>
          latest.domains[d] !== "Strong" ? (
            <div key={d}>
              <b>{d}</b>
              <ul>
                {config.strategies[d].map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null
        )}

        <h3>Practice Tracking</h3>
        <button onClick={logPractice}>+ Practice</button>
        <p>Total Days: {engagement}</p>

        <h3>Progress</h3>
        {records.map((r, i) => (
          <p key={i}>
            #{i + 1}: {r.score} ({r.level})
          </p>
        ))}

        <p>Trend: {getTrend(records)}</p>

        <button onClick={() => window.location.reload()}>
          Restart
        </button>
      </div>
    );
  }

  // ===== QUESTION =====
  return (
    <div style={{ padding: 40 }}>
      <h2>
        Question {current + 1} / {config.questions.length}
      </h2>

      <p>{config.questions[current].text}</p>

      {[
        { label: "Yes", v: 2 },
        { label: "Sometimes", v: 1 },
        { label: "No", v: 0 },
      ].map((opt) => (
        <button
          key={opt.v}
          onClick={() => handleAnswer(opt.v)}
          style={{
            display: "block",
            margin: "12px 0",
            padding: 12,
            background: rawSelected === opt.v ? "#ccc" : "#eee",
          }}
        >
          {opt.label}
        </button>
      ))}

      <button onClick={next}>Next</button>
    </div>
  );
}