"use client";
import { useState } from "react";
import { createClient, createAccount } from "genlayer-js";

const CONTRACT_ADDRESS = "0xf6cf84E563014e1E3434e9812303A0c23cE159aA";
const defaultAccount = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const account = createAccount(defaultAccount);
const client = createClient({ 
  endpoint: "http://localhost:8080",
  account: account 
}); 

const defaultAddress = account.address;

export default function ConsentDashboard() {
  const [loading, setLoading] = useState<string | null>(null);
  
  // States: Register Purpose
  const [regPurposeId, setRegPurposeId] = useState("data_analytics_v1");
  const [regDesc, setRegDesc] = useState("We use your data to improve our services.");
  const [regUrl, setRegUrl] = useState("https://raw.githubusercontent.com/adgm-regulations/mock/main/fsra_guidance.txt");
  const [regResult, setRegResult] = useState("");

  // States: Manage Consent (Explicit <string> added to fix type mismatch)
  const [manageController, setManageController] = useState<string>(defaultAddress);
  const [managePurposeId, setManagePurposeId] = useState("data_analytics_v1");
  const [manageResult, setManageResult] = useState("");

  // States: Query State (Explicit <string> added to fix type mismatch)
  const [querySubject, setQuerySubject] = useState<string>(defaultAddress);
  const [queryController, setQueryController] = useState<string>(defaultAddress);
  const [queryPurposeId, setQueryPurposeId] = useState("data_analytics_v1");
  const [queryResult, setQueryResult] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("register");
    setRegResult("AI Validators auditing terms...");
    try {
      const res = await client.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: "register_purpose",
        args: [regPurposeId, regDesc, regUrl],
        value: BigInt(0),
      });
      setRegResult(`Success! Verdict: ${res}`);
    } catch (err: any) {
      setRegResult(`Failed: ${err.message}`);
    }
    setLoading(null);
  };

  const handleConsent = async (action: "grant" | "revoke") => {
    setLoading(action);
    setManageResult(`Executing ${action}...`);
    try {
      await client.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: action,
        args: [manageController, managePurposeId],
        value: BigInt(0),
      });
      setManageResult(`Successfully executed: ${action.toUpperCase()}`);
    } catch (err: any) {
      setManageResult(`Failed: ${err.message}`);
    }
    setLoading(null);
  };

  const handleQuery = async (type: "consent" | "purpose") => {
    setLoading(`query_${type}`);
    setQueryResult("Fetching from GenVM...");
    try {
      const functionName = type === "consent" ? "get_consent" : "get_purpose";
      const args = type === "consent" 
        ? [querySubject, queryController, queryPurposeId] 
        : [queryController, queryPurposeId];

      const res = await client.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        functionName: functionName,
        args: args,
      });
      
      try {
        const parsed = JSON.parse(res as string);
        setQueryResult(JSON.stringify(parsed, null, 2));
      } catch {
        setQueryResult(String(res));
      }
    } catch (err: any) {
      setQueryResult(`Failed: ${err.message}`);
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="border-b border-neutral-800 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-white">GenLayer Consent Registry</h1>
          <p className="text-neutral-400 mt-2">Fully testable WebUI for the Subjective AI Data Shield.</p>
          <div className="mt-4 p-3 bg-neutral-900 border border-neutral-800 rounded text-xs font-mono text-neutral-500">
            Connected Account (Signer): {defaultAddress}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 space-y-4">
            <h2 className="text-xl font-semibold text-white">1. Register Purpose (Controller)</h2>
            <form onSubmit={handleRegister} className="space-y-3">
              <input type="text" value={regPurposeId} onChange={(e) => setRegPurposeId(e.target.value)} placeholder="Purpose ID" className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm" required />
              <textarea value={regDesc} onChange={(e) => setRegDesc(e.target.value)} placeholder="Description" className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm h-16" required />
              <input type="url" value={regUrl} onChange={(e) => setRegUrl(e.target.value)} placeholder="Policy URL" className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm" required />
              <button type="submit" disabled={loading !== null} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-sm disabled:opacity-50">
                {loading === "register" ? "Auditing..." : "Audit & Register"}
              </button>
            </form>
            {regResult && <div className="text-xs font-mono p-3 bg-neutral-950 rounded border border-neutral-800 text-green-400 break-words">{regResult}</div>}
          </div>

          <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 space-y-4">
            <h2 className="text-xl font-semibold text-white">2. Manage Consent (Subject)</h2>
            <div className="space-y-3">
              <input type="text" value={manageController} onChange={(e) => setManageController(e.target.value)} placeholder="Controller Address" className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm font-mono" />
              <input type="text" value={managePurposeId} onChange={(e) => setManagePurposeId(e.target.value)} placeholder="Purpose ID" className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm" />
              <div className="flex space-x-3">
                <button onClick={() => handleConsent("grant")} disabled={loading !== null} className="flex-1 bg-green-700 hover:bg-green-600 text-white py-2 rounded text-sm disabled:opacity-50">
                  {loading === "grant" ? "Executing..." : "Grant"}
                </button>
                <button onClick={() => handleConsent("revoke")} disabled={loading !== null} className="flex-1 bg-red-700 hover:bg-red-600 text-white py-2 rounded text-sm disabled:opacity-50">
                  {loading === "revoke" ? "Executing..." : "Revoke"}
                </button>
              </div>
            </div>
            {manageResult && <div className="text-xs font-mono p-3 bg-neutral-950 rounded border border-neutral-800 text-neutral-300 break-words">{manageResult}</div>}
          </div>

          <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 space-y-4 md:col-span-2">
            <h2 className="text-xl font-semibold text-white">3. Query On-Chain State</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" value={querySubject} onChange={(e) => setQuerySubject(e.target.value)} placeholder="Subject Address (For Consent)" className="bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm font-mono" />
              <input type="text" value={queryController} onChange={(e) => setQueryController(e.target.value)} placeholder="Controller Address" className="bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm font-mono" />
              <input type="text" value={queryPurposeId} onChange={(e) => setQueryPurposeId(e.target.value)} placeholder="Purpose ID" className="bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm" />
            </div>
            <div className="flex space-x-3">
              <button onClick={() => handleQuery("consent")} disabled={loading !== null} className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded text-sm disabled:opacity-50">
                Get Consent Record
              </button>
              <button onClick={() => handleQuery("purpose")} disabled={loading !== null} className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded text-sm disabled:opacity-50">
                Get Purpose Details
              </button>
            </div>
            {queryResult && (
              <pre className="text-xs font-mono p-4 bg-black rounded border border-neutral-800 text-emerald-400 overflow-x-auto">
                {queryResult}
              </pre>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
