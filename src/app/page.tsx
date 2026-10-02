"use client";
import { useState } from "react";
import { createClient } from "genlayer-js";

const CONTRACT_ADDRESS = "0xf6cf84E563014e1E3434e9812303A0c23cE159aA";
const client = createClient({ endpoint: "http://localhost:8080" }); 

export default function ConsentUI() {
  const [purposeId, setPurposeId] = useState("data_analytics_v1");
  const [description, setDescription] = useState("We use your data to improve our services.");
  const [policyUrl, setPolicyUrl] = useState("https://raw.githubusercontent.com/adgm-regulations/mock/main/fsra_guidance.txt");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const registerPurpose = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("AI Validators are auditing the policy URL...");
    try {
      const result = await client.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: "register_purpose",
        args: [purposeId, description, policyUrl],
        value: 0n, // <-- The required parameter Vercel was asking for
      });
      setStatus(`Verdict: ${result}`);
    } catch (err: any) {
      setStatus(`Failed: ${err.message || "AI rejected the terms as DECEPTIVE."}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="border-b border-neutral-800 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-white">AI-Audited Consent Registry</h1>
          <p className="text-neutral-400 mt-2">GenVM verifies privacy policies before allowing data collection.</p>
        </header>

        <form onSubmit={registerPurpose} className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 space-y-4">
          <h2 className="text-xl font-semibold text-white">Register Data Purpose</h2>
          
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Purpose ID</label>
            <input type="text" value={purposeId} onChange={(e) => setPurposeId(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Plain-English Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 h-20" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-1">Legal Privacy Policy URL (HTTPS)</label>
            <input type="url" value={policyUrl} onChange={(e) => setPolicyUrl(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500" required />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {loading ? "Executing Multi-LLM Consensus..." : "Audit & Register Purpose"}
          </button>
        </form>

        {status && (
          <div className={`p-4 rounded-lg border ${status.includes("TRANSPARENT") ? "bg-green-950/30 border-green-900 text-green-400" : status.includes("Failed") ? "bg-red-950/30 border-red-900 text-red-400" : "bg-blue-950/30 border-blue-900 text-blue-400"}`}>
            <p className="font-mono text-sm">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
}
