"use client";
import { useState } from "react";
import { createClient, createAccount } from "genlayer-js";

export default function ConsentDashboard() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState<string | null>(null);
  
  // NOTE: Paste your Public Studio deployment address here in the browser UI!
  const [contractAddress, setContractAddress] = useState<string>("0xf6cf84E563014e1E3434e9812303A0c23cE159aA");

  const [regPurposeId, setRegPurposeId] = useState("data_analytics_v1");
  const [regDesc, setRegDesc] = useState("We use your data to improve our services.");
  const [regUrl, setRegUrl] = useState("https://raw.githubusercontent.com/adgm-regulations/mock/main/fsra_guidance.txt");
  const [regResult, setRegResult] = useState("");

  const [manageController, setManageController] = useState<string>("");
  const [managePurposeId, setManagePurposeId] = useState("data_analytics_v1");
  const [manageResult, setManageResult] = useState("");

  const [querySubject, setQuerySubject] = useState<string>("");
  const [queryController, setQueryController] = useState<string>("");
  const [queryPurposeId, setQueryPurposeId] = useState("data_analytics_v1");
  const [queryResult, setQueryResult] = useState("");

  const connectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        // 1. Connect to MetaMask to authenticate the user's browser
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        const address = accounts[0];
        
        // 2. Initialize a frictionless session client pointed at the public GenLayer Studio
        const sessionSigner = createAccount("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
        const glClient = createClient({ 
          endpoint: "https://studio.genlayer.com/api",
          account: sessionSigner 
        });
        
        setWalletAddress(address);
        setClient(glClient);
        
        // Auto-fill the UI inputs with the connected MetaMask address
        setManageController(address);
        setQuerySubject(address);
        setQueryController(address);
      } catch (err: any) {
        alert(`Connection failed: ${err.message}`);
      }
    } else {
      alert("No Web3 provider detected. Please install MetaMask!");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("register");
    setRegResult("AI Validators auditing terms on GenLayer StudioNet...");
    try {
      const res = await client.writeContract({
        address: contractAddress as `0x${string}`,
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
    setManageResult(`Executing ${action} on GenLayer StudioNet...`);
    try {
      await client.writeContract({
        address: contractAddress as `0x${string}`,
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
      const args = type === "consent" ? [querySubject, queryController, queryPurposeId] : [queryController, queryPurposeId];
      
      const res = await client.readContract({
        address: contractAddress as `0x${string}`,
        functionName: functionName,
        args: args,
      });
      
      try {
        setQueryResult(JSON.stringify(JSON.parse(res as string), null, 2));
      } catch {
        setQueryResult(String(res));
      }
    } catch (err: any) {
      setQueryResult(`Failed: ${err.message}`);
    }
    setLoading(null);
  };

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white p-6 font-sans">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center shadow-2xl">
          <h1 className="text-3xl font-bold mb-4 tracking-tight">AI Data Shield</h1>
          <p className="text-neutral-400 mb-8">Connect your Web3 wallet to interact with the Autonomous Consent Registry on GenLayer.</p>
          <button onClick={connectWallet} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25">
            Connect MetaMask
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="border-b border-neutral-800 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Consent Registry</h1>
            <p className="text-neutral-400 mt-2">Public StudioNet Environment</p>
          </div>
          <div className="text-right">
            <div className="inline-block p-2 px-4 bg-blue-900/30 border border-blue-900 rounded-full text-xs font-mono text-blue-400">
              Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </div>
          </div>
        </header>

        <div className="bg-amber-950/30 border border-amber-900 p-4 rounded-xl flex items-center space-x-4">
          <label className="text-sm font-semibold text-amber-500 whitespace-nowrap">Active Contract:</label>
          <input type="text" value={contractAddress} onChange={(e) => setContractAddress(e.target.value)} className="w-full bg-black/50 border border-amber-900/50 rounded px-3 py-1.5 text-sm font-mono text-amber-200 focus:outline-none focus:border-amber-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 space-y-4">
            <h2 className="text-xl font-semibold text-white">1. Register Purpose</h2>
            <form onSubmit={handleRegister} className="space-y-3">
              <input type="text" value={regPurposeId} onChange={(e) => setRegPurposeId(e.target.value)} placeholder="Purpose ID" className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm" required />
              <textarea value={regDesc} onChange={(e) => setRegDesc(e.target.value)} placeholder="Description" className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm h-16" required />
              <input type="url" value={regUrl} onChange={(e) => setRegUrl(e.target.value)} placeholder="Policy URL" className="w-full bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm" required />
              <button type="submit" disabled={loading !== null} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded text-sm disabled:opacity-50">
                {loading === "register" ? "Auditing via GenVM..." : "Audit & Register"}
              </button>
            </form>
            {regResult && <div className="text-xs font-mono p-3 bg-neutral-950 rounded border border-neutral-800 text-green-400 break-words">{regResult}</div>}
          </div>

          <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 space-y-4">
            <h2 className="text-xl font-semibold text-white">2. Manage Consent</h2>
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
              <input type="text" value={querySubject} onChange={(e) => setQuerySubject(e.target.value)} placeholder="Subject Address" className="bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm font-mono" />
              <input type="text" value={queryController} onChange={(e) => setQueryController(e.target.value)} placeholder="Controller Address" className="bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm font-mono" />
              <input type="text" value={queryPurposeId} onChange={(e) => setQueryPurposeId(e.target.value)} placeholder="Purpose ID" className="bg-neutral-950 border border-neutral-800 rounded px-3 py-2 text-sm" />
            </div>
            <div className="flex space-x-3">
              <button onClick={() => handleQuery("consent")} disabled={loading !== null} className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded text-sm disabled:opacity-50">Get Consent</button>
              <button onClick={() => handleQuery("purpose")} disabled={loading !== null} className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded text-sm disabled:opacity-50">Get Purpose Details</button>
            </div>
            {queryResult && (
              <pre className="text-xs font-mono p-4 bg-black rounded border border-neutral-800 text-emerald-400 overflow-x-auto">{queryResult}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
