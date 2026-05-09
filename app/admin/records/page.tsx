"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
 "https://xdvmwyvoeziirciullif.supabase.co",
 "sb_publishable_cH5UHB8T9HDmasfg87Qczg_usZslQQL"
);

export default function RecordsDashboard() {
 const ADMIN_PASSWORD = "heather123";

 const [input, setInput] = useState("");
 const [unlocked, setUnlocked] = useState(false);
 const [records, setRecords] = useState<any[]>([]);

 async function loadRecords() {
   const { data, error } = await supabase
     .from("records")
     .select("*")
     .order("created_at", { ascending: false });

   if (error) {
     alert("Failed to load records");
     console.error(error);
     return;
   }

   setRecords(data || []);
 }

 useEffect(() => {
   if (unlocked) {
     loadRecords();
   }
 }, [unlocked]);

 if (!unlocked) {
   return (
     <div style={{ padding: 40 }}>
       <h1>Records Dashboard Login</h1>

       <input
         type="password"
         placeholder="Enter admin password"
         value={input}
         onChange={(e) => setInput(e.target.value)}
         style={{ padding: 10 }}
       />

       <br />
       <br />

       <button
         onClick={() => {
           if (input === ADMIN_PASSWORD) {
             setUnlocked(true);
           } else {
             alert("Wrong password");
           }
         }}

         Enter
       </button>
     </div>
   );
 }

 return (
   <div style={{ padding: 40 }}>
     <h1>Admin Records Dashboard</h1>

     <button onClick={loadRecords}>Refresh Records</button>

     <p>Total submissions: {records.length}</p>

     {records.map((r) => (
       <div
         key={r.id}
         style={{
           border: "1px solid #ccc",
           padding: 15,
           marginTop: 15,
         }}

         <p>Submitted: {r.created_at}</p>
         <p>Score: {r.score}</p>
         <p>Risk Level: {r.level}</p>

         <p>Receptive: {r.domains?.receptive || "N/A"}</p>
         <p>Expressive: {r.domains?.expressive || "N/A"}</p>
         <p>Social: {r.domains?.social || "N/A"}</p>
         <p>Speech: {r.domains?.speech || "N/A"}</p>
       </div>
     ))}
   </div>
 );
}
