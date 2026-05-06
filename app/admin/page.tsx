"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const ADMIN_PASSWORD = "heather123";

  const [input, setInput] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [json, setJson] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("config");
    if (saved) {
      setJson(saved);
    } else {
      // 👉 空白时给你一个“安全模板”（不会自动覆盖）
      setJson(`{
  "questions": [
    {
      "text": "Does your child respond when their name is called?",
      "domain": "social",
      "reverse": false,
      "flag": "no_response_name"
    }
  ],
  "strategies": {
    "receptive": ["Example strategy"],
    "expressive": ["Example strategy"],
    "social": ["Example strategy"],
    "speech": ["Example strategy"]
  }
}`);
    }
  }, []);

  const save = () => {
    try {
      JSON.parse(json);
      localStorage.setItem("config", json);
      alert("Saved successfully!");
    } catch {
      alert("JSON格式错误，请检查逗号和括号");
    }
  };

  if (!unlocked) {
    return (
      <div style={{ padding: 40 }}>
        <h1>Admin Login</h1>

        <input
          type="password"
          placeholder="Enter password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <br /><br />

        <button
          onClick={() => {
            if (input === ADMIN_PASSWORD) {
              setUnlocked(true);
            } else {
              alert("Wrong password");
            }
          }}
        >
          Enter
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Admin Panel (Locked)</h1>

      <p>⚠️ Editing this will directly change your questionnaire</p>

      <textarea
        value={json}
        onChange={(e) => setJson(e.target.value)}
        style={{
          width: "100%",
          height: 500,
          marginTop: 20,
          fontFamily: "monospace"
        }}
      />

      <br />

      <button onClick={save} style={{ marginTop: 20 }}>
        Save
      </button>
    </div>
  );
}