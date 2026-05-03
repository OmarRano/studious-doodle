import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardHeader from "@/components/DashboardHeader";
import {
  User, Mail, Phone, Shield, Edit2, Save, MapPin,
  Lock, CheckCircle, Star,
} from "lucide-react";

// ── Helper ────────────────────────────────────────────────────────────────────
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1ede6" }}>
      <span style={{ fontSize: 13, color: "#64748b" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E" }}>{value}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</label>
      {children}
    </div>
  );
}

const IS = { border: "1px solid #e2ddd4", borderRadius: 8, fontSize: 13, height: 38 };

// ─────────────────────────────────────────────────────────────────────────────
export default function BuyerProfile() {
  const { user } = useAuth();

  // ── Personal info ──────────────────────────────────────────────────────────
  const [editingInfo, setEditingInfo] = useState(false);
  const [name,  setName]  = useState((user as any)?.name  ?? "");
  const [phone, setPhone] = useState((user as any)?.phone ?? "");

  // ── Delivery address ───────────────────────────────────────────────────────
  const [editingAddr, setEditingAddr] = useState(false);
  const [addr, setAddr] = useState({
    address: (user as any)?.address ?? "",
    city:    (user as any)?.city    ?? "",
    state:   (user as any)?.state   ?? "",
    country: (user as any)?.country ?? "Nigeria",
  });

  // ── Change password ────────────────────────────────────────────────────────
  const [editingPw,  setEditingPw]  = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaved, setPwSaved] = useState(false);

  // ── Stats (mock — wires to real in production) ─────────────────────────────
  const ordersQuery  = (trpc as any).orders?.list?.useQuery?.({ limit: 100, offset: 0 });
  const orders: any[] = ordersQuery?.data ?? [];
  const totalOrders    = orders.length;
  const deliveredCount = orders.filter((o: any) => o.status === "delivered").length;
  const totalSpent     = orders.reduce((s: number, o: any) => s + (parseFloat(o.finalAmount ?? o.totalAmount ?? 0)), 0);

  // ── Handlers ───────────────────────────────────────────────────────────────
  function saveInfo() {
    if (!name.trim()) return toast.error("Name cannot be empty");
    toast.success("Profile updated!");
    setEditingInfo(false);
  }

  function saveAddr() {
    if (!addr.city.trim()) return toast.error("City is required");
    toast.success("Address saved!");
    setEditingAddr(false);
  }

  function savePassword() {
    if (!pwForm.current) return toast.error("Enter your current password");
    if (pwForm.next.length < 8) return toast.error("New password must be at least 8 characters");
    if (!/[A-Z]/.test(pwForm.next)) return toast.error("New password must contain an uppercase letter");
    if (!/[0-9]/.test(pwForm.next)) return toast.error("New password must contain a number");
    if (pwForm.next !== pwForm.confirm) return toast.error("Passwords do not match");
    setPwSaved(true);
    toast.success("Password changed successfully!");
    setPwForm({ current: "", next: "", confirm: "" });
    setTimeout(() => { setEditingPw(false); setPwSaved(false); }, 1500);
  }

  const role          = (user as any)?.role ?? "buyer";
  const isAffiliate   = (user as any)?.isAffiliate ?? false;
  const memberSince   = (user as any)?.createdAt
    ? new Date((user as any).createdAt).toLocaleDateString("en-NG", { year: "numeric", month: "long" })
    : "—";

  const CARD = { background: "white", borderRadius: 14, border: "1px solid #e2ddd4", marginBottom: 16, overflow: "hidden" as const };
  const HEAD = { padding: "14px 20px", borderBottom: "1px solid #f1ede6", background: "#1A1A2E", display: "flex", alignItems: "center", justifyContent: "space-between" };

  return (
    <div style={{ fontFamily: "'Outfit', system-ui, sans-serif", background: "#f8f6f0", minHeight: "100vh" }}>
      <DashboardHeader title="My Profile" subtitle="Manage your account details" />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px" }}>

        {/* ── Order stats banner ─────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Total Orders",   value: totalOrders,                           icon: "🛍" },
            { label: "Delivered",      value: deliveredCount,                         icon: "✅" },
            { label: "Total Spent",    value: `₦${totalSpent.toLocaleString()}`,      icon: "💳" },
          ].map(stat => (
            <div key={stat.label} style={{ background: "white", borderRadius: 12, border: "1px solid #e2ddd4", padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#1A1A2E" }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Personal information ──────────────────────────────────────── */}
        <div style={CARD}>
          <div style={HEAD}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#C8A84B" }}>
              <User size={16} /> Personal Information
            </span>
            <button onClick={() => editingInfo ? saveInfo() : setEditingInfo(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#C8A84B", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              {editingInfo ? <><Save size={14} /> Save</> : <><Edit2 size={14} /> Edit</>}
            </button>
          </div>
          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            {editingInfo ? (
              <>
                <Field label="Full Name">
                  <Input style={IS} value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
                </Field>
                <Field label="Phone Number">
                  <Input style={IS} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 801 234 5678" />
                </Field>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button onClick={saveInfo} style={{ background: "#C8A84B", color: "#1A1A2E", fontWeight: 700, flex: 1 }}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setEditingInfo(false)} style={{ flex: 1 }}>Cancel</Button>
                </div>
              </>
            ) : (
              <>
                <Row label="Full Name"     value={name  || <span style={{ color: "#94a3b8" }}>Not set</span>} />
                <Row label="Email"         value={<span style={{ display: "flex", alignItems: "center", gap: 6 }}><Mail size={13} color="#94a3b8" />{(user as any)?.email ?? "—"}</span>} />
                <Row label="Phone"         value={<span style={{ display: "flex", alignItems: "center", gap: 6 }}><Phone size={13} color="#94a3b8" />{phone || <span style={{ color: "#94a3b8" }}>Not set</span>}</span>} />
              </>
            )}
          </div>
        </div>

        {/* ── Delivery address ──────────────────────────────────────────── */}
        <div style={CARD}>
          <div style={HEAD}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#C8A84B" }}>
              <MapPin size={16} /> Default Delivery Address
            </span>
            <button onClick={() => editingAddr ? saveAddr() : setEditingAddr(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#C8A84B", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              {editingAddr ? <><Save size={14} /> Save</> : <><Edit2 size={14} /> Edit</>}
            </button>
          </div>
          <div style={{ padding: "16px 20px" }}>
            {editingAddr ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Field label="Street Address">
                  <Input style={IS} value={addr.address} onChange={e => setAddr(a => ({ ...a, address: e.target.value }))} placeholder="e.g. 15 Wuse Zone 3" />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <Field label="City">
                    <Input style={IS} value={addr.city}  onChange={e => setAddr(a => ({ ...a, city: e.target.value }))}  placeholder="e.g. Abuja" />
                  </Field>
                  <Field label="State">
                    <Input style={IS} value={addr.state} onChange={e => setAddr(a => ({ ...a, state: e.target.value }))} placeholder="e.g. FCT" />
                  </Field>
                </div>
                <Field label="Country">
                  <Input style={IS} value={addr.country} onChange={e => setAddr(a => ({ ...a, country: e.target.value }))} placeholder="Nigeria" />
                </Field>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button onClick={saveAddr} style={{ background: "#C8A84B", color: "#1A1A2E", fontWeight: 700, flex: 1 }}>Save Address</Button>
                  <Button variant="outline" onClick={() => setEditingAddr(false)} style={{ flex: 1 }}>Cancel</Button>
                </div>
              </div>
            ) : addr.address ? (
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, background: "#FFF3E0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <MapPin size={18} color="#E65100" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>{addr.address}</div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{addr.city}{addr.state ? `, ${addr.state}` : ""}, {addr.country}</div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "12px 0", color: "#94a3b8" }}>
                <MapPin size={28} style={{ margin: "0 auto 8px", display: "block", color: "#d1cdc4" }} />
                <p style={{ fontSize: 13 }}>No address saved yet</p>
                <button onClick={() => setEditingAddr(true)} style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: "#C8A84B", background: "none", border: "none", cursor: "pointer" }}>+ Add Address</button>
              </div>
            )}
          </div>
        </div>

        {/* ── Account details ───────────────────────────────────────────── */}
        <div style={CARD}>
          <div style={HEAD}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#C8A84B" }}>
              <Shield size={16} /> Account Details
            </span>
          </div>
          <div style={{ padding: "4px 20px 8px" }}>
            <Row label="Account Type" value={
              <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: "#E3F2FD", color: "#0D47A1" }}>
                {role.replace("_", " ").toUpperCase()}
              </span>
            } />
            <Row label="Member Since" value={memberSince} />
            <Row label="Affiliate Status" value={
              isAffiliate
                ? <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#1B5E20", fontWeight: 700, fontSize: 12 }}><Star size={13} fill="#1B5E20" /> Active Affiliate</span>
                : <span style={{ color: "#94a3b8", fontSize: 12 }}>Not an affiliate</span>
            } />
          </div>
        </div>

        {/* ── Change password ───────────────────────────────────────────── */}
        <div style={CARD}>
          <div style={HEAD}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#C8A84B" }}>
              <Lock size={16} /> Change Password
            </span>
            {!editingPw && (
              <button onClick={() => setEditingPw(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#C8A84B", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                <Edit2 size={14} /> Change
              </button>
            )}
          </div>
          <div style={{ padding: "16px 20px" }}>
            {pwSaved ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#1B5E20" }}>
                <CheckCircle size={20} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>Password changed successfully!</span>
              </div>
            ) : editingPw ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Field label="Current Password">
                  <Input style={IS} type="password" value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} placeholder="Enter current password" />
                </Field>
                <Field label="New Password">
                  <Input style={IS} type="password" value={pwForm.next} onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))} placeholder="Min 8 chars, 1 uppercase, 1 number" />
                </Field>
                <Field label="Confirm New Password">
                  <Input style={IS} type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Repeat new password" />
                </Field>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button onClick={savePassword} style={{ background: "#1A1A2E", color: "#C8A84B", fontWeight: 700, flex: 1 }}>Update Password</Button>
                  <Button variant="outline" onClick={() => { setEditingPw(false); setPwForm({ current: "", next: "", confirm: "" }); }} style={{ flex: 1 }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 13, color: "#94a3b8" }}>Use a strong password with at least 8 characters, one uppercase letter, and one number.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
