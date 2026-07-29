 "use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  increment,
  deleteDoc 
} from "firebase/firestore";

interface Letter {
  id: string;
  senderName: string;
  role: string;
  message: string;
  likes: number;
  createdAt: any;
}

export default function Home() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [filteredLetters, setFilteredLetters] = useState<Letter[]>([]);
  const [senderName, setSenderName] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [randomLetter, setRandomLetter] = useState<Letter | null>(null);

  // تحميل مكتبة Confetti ديناميكيًا بدون npm install
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const fetchLetters = async () => {
    try {
      const q = query(collection(db, "letters"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const list: Letter[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        list.push({ 
          id: doc.id, 
          senderName: data.senderName,
          role: data.role,
          message: data.message,
          likes: data.likes || 0,
          createdAt: data.createdAt
        });
      });
      setLetters(list);
      setFilteredLetters(list);
    } catch (error) {
      console.error("Error fetching letters: ", error);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = letters.filter(
      (item) =>
        item.senderName.toLowerCase().includes(term) ||
        item.role.toLowerCase().includes(term) ||
        item.message.toLowerCase().includes(term)
    );
    setFilteredLetters(filtered);
  }, [searchTerm, letters]);

  // إطلاق الألعاب النارية والورق الملون 🎉
  const triggerConfetti = () => {
    if (typeof (window as any).confetti === "function") {
      (window as any).confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !message) return alert("يرجى كتابة الاسم والرسالة!");

    setLoading(true);
    try {
      await addDoc(collection(db, "letters"), {
        senderName,
        role: role || "Insider Member",
        message,
        likes: 0,
        createdAt: serverTimestamp(),
      });

      triggerConfetti();
      setSenderName("");
      setRole("");
      setMessage("");
      await fetchLetters();
    } catch (error) {
      console.error("Error adding letter: ", error);
      alert("حدث خطأ أثناء الإرسال!");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id: string) => {
    if (likedPosts[id]) return;

    try {
      const letterRef = doc(db, "letters", id);
      await updateDoc(letterRef, {
        likes: increment(1)
      });
      
      setLikedPosts((prev) => ({ ...prev, [id]: true }));
      setLetters((prev) =>
        prev.map((item) => (item.id === id ? { ...item, likes: item.likes + 1 } : item))
      );
    } catch (error) {
      console.error("Error liking letter:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("هل أنت تأكد من حذف هذه الرسالة؟")) {
      try {
        await deleteDoc(doc(db, "letters", id));
        fetchLetters();
      } catch (error) {
        console.error("Error deleting letter:", error);
      }
    }
  };

  const toggleAdmin = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      const pass = prompt("أدخل كلمة سر الإدارة:");
      if (pass === "123456") {
        setIsAdmin(true);
        alert("تم تفعيل وضع الإدارة 🔓");
      } else {
        alert("كلمة السر خاطئة!");
      }
    }
  };

  const getRandomLetter = () => {
    if (letters.length === 0) return;
    const randomIndex = Math.floor(Math.random() * letters.length);
    setRandomLetter(letters[randomIndex]);
  };

  const getBadgeStyle = (roleStr: string) => {
    const r = roleStr.toUpperCase();
    if (r.includes("HR")) return { bg: "rgba(236, 72, 153, 0.15)", color: "#f472b6", border: "rgba(236, 72, 153, 0.3)", icon: "🌸" };
    if (r.includes("OC")) return { bg: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", border: "rgba(245, 158, 11, 0.3)", icon: "⚡" };
    if (r.includes("PR") || r.includes("FR")) return { bg: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "rgba(16, 185, 129, 0.3)", icon: "🤝" };
    if (r.includes("MEDIA") || r.includes("DESIGN")) return { bg: "rgba(168, 85, 247, 0.15)", color: "#c084fc", border: "rgba(168, 85, 247, 0.3)", icon: "🎨" };
    return { bg: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", border: "rgba(56, 189, 248, 0.3)", icon: "✨" };
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0b132b", color: "#f8fafc", padding: "40px 15px", fontFamily: "system-ui, -apple-system, sans-serif", direction: "rtl" }}>
      <main style={{ maxWidth: "750px", margin: "0 auto" }}>
        
        {/* Header */}
        <header style={{ textAlign: "center", marginBottom: "35px", position: "relative" }}>
          <button 
            onClick={toggleAdmin}
            style={{ position: "absolute", left: 0, top: 0, background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", opacity: 0.6 }}
            title="لوحة الإدارة"
          >
            {isAdmin ? "🔓" : "🔒"}
          </button>

          <div style={{ display: "inline-block", backgroundColor: "rgba(56, 189, 248, 0.1)", color: "#38bdf8", padding: "6px 16px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "600", marginBottom: "12px" }}>
            Insider Team Memory Wall 🚀
          </div>
          <h1 style={{ fontSize: "2.3rem", fontWeight: "800", color: "#ffffff", marginBottom: "10px", lineHeight: "1.3" }}>
            رسائل تيم Insider للمهندس محمد حازم 💌
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem", margin: 0 }}>
            شارك بكلمتك أو ذكرياتك مع المهندس محمد حازم
          </p>
        </header>

        {/* Creative Random Letter Button */}
        {letters.length > 0 && (
          <div style={{ textAlign: "center", marginBottom: "25px" }}>
            <button
              onClick={getRandomLetter}
              style={{
                backgroundColor: "#3a506b",
                color: "#f8fafc",
                border: "1px solid #5bc0be",
                padding: "10px 20px",
                borderRadius: "30px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.9rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
              }}
            >
              🎲 اقرأ رسالة عشوائية من التيم!
            </button>
          </div>
        )}

        {/* Modal for Random Letter */}
        {randomLetter && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 1000 }}>
            <div style={{ backgroundColor: "#1c2541", padding: "30px", borderRadius: "20px", maxWidth: "500px", width: "100%", border: "2px solid #5bc0be", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", position: "relative" }}>
              <button 
                onClick={() => setRandomLetter(null)}
                style={{ position: "absolute", top: "15px", left: "15px", background: "none", border: "none", color: "#94a3b8", fontSize: "1.2rem", cursor: "pointer" }}
              >
                ✖
              </button>
              <div style={{ fontSize: "2rem", marginBottom: "10px", textAlign: "center" }}>💌</div>
              <h3 style={{ margin: "0 0 5px 0", color: "#fff", textAlign: "center" }}>{randomLetter.senderName}</h3>
              <p style={{ color: "#38bdf8", fontSize: "0.85rem", textAlign: "center", marginBottom: "15px" }}>{randomLetter.role}</p>
              <p style={{ color: "#cbd5e1", lineHeight: "1.7", whiteSpace: "pre-wrap", textAlign: "center" }}>{randomLetter.message}</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <section style={{ backgroundColor: "#1c2541", padding: "28px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 10px 30px rgba(0,0,0,0.4)", marginBottom: "40px" }}>
          <h2 style={{ marginTop: 0, fontSize: "1.2rem", color: "#38bdf8", marginBottom: "20px" }}>اكتب رسالتك ✍️</h2>
          
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#e2e8f0", fontSize: "0.9rem" }}>الاسم:</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="اسمك الكريم"
                required
                style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid #3a506b", backgroundColor: "#0b132b", color: "#fff", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#e2e8f0", fontSize: "0.9rem" }}>دورك في التيم / القسم:</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="مثال: HR / OC"
                style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid #3a506b", backgroundColor: "#0b132b", color: "#fff", outline: "none" }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", color: "#e2e8f0", fontSize: "0.9rem" }}>الرسالة:</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالتك للمهندس محمد حازم..."
                required
                style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid #3a506b", backgroundColor: "#0b132b", color: "#fff", outline: "none", resize: "vertical", lineHeight: "1.6" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "5px",
                padding: "13px",
                backgroundColor: loading ? "#3a506b" : "#4895ef",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "700",
                fontSize: "1rem",
                boxShadow: "0 4px 14px rgba(72, 149, 239, 0.3)"
              }}
            >
              {loading ? "جاري الإرسال..." : "إرسال الرسالة 🎉"}
            </button>
          </form>
        </section>

        {/* Search & Display Section */}
        <section>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "25px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "1.3rem", color: "#f8fafc", margin: 0 }}>حائط الرسائل 📖</h2>
              <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{filteredLetters.length} رسالة</span>
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 ابحث بالاسم، القسم (HR / OC)، أو كلمة..."
              style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", border: "1px solid #3a506b", backgroundColor: "#1c2541", color: "#fff", outline: "none", fontSize: "0.95rem" }}
            />
          </div>

          {filteredLetters.length === 0 ? (
            <div style={{ backgroundColor: "#1c2541", padding: "30px", borderRadius: "12px", textAlign: "center", color: "#64748b", border: "1px dashed #3a506b" }}>
              لا توجد رسائل مطابقة للبحث..
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {filteredLetters.map((item) => {
                const badge = getBadgeStyle(item.role);
                return (
                  <div
                    key={item.id}
                    style={{
                      padding: "22px 24px",
                      backgroundColor: "#1c2541",
                      borderRadius: "14px",
                      borderRight: `4px solid ${badge.color}`,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                      position: "relative"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#ffffff", fontWeight: "700" }}>{item.senderName}</h3>
                      <span style={{ 
                        fontSize: "0.8rem", 
                        backgroundColor: badge.bg, 
                        color: badge.color, 
                        padding: "4px 12px", 
                        borderRadius: "20px", 
                        fontWeight: "600", 
                        border: `1px solid ${badge.border}`,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}>
                        <span>{badge.icon}</span>
                        <span>{item.role}</span>
                      </span>
                    </div>

                    <p style={{ color: "#cbd5e1", lineHeight: "1.7", whiteSpace: "pre-wrap", fontSize: "1rem", marginBottom: "15px" }}>{item.message}</p>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <button
                        onClick={() => handleLike(item.id)}
                        style={{
                          background: likedPosts[item.id] ? "rgba(239, 68, 68, 0.15)" : "rgba(255,255,255,0.05)",
                          border: "1px solid",
                          borderColor: likedPosts[item.id] ? "rgba(239, 68, 68, 0.4)" : "rgba(255,255,255,0.1)",
                          color: likedPosts[item.id] ? "#f87171" : "#94a3b8",
                          padding: "6px 14px",
                          borderRadius: "20px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "0.85rem",
                          fontWeight: "600"
                        }}
                      >
                        <span>{likedPosts[item.id] ? "❤️" : "🤍"}</span>
                        <span>{item.likes}</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          style={{ background: "#ef4444", color: "#fff", border: "none", padding: "4px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem" }}
                        >
                          حذف 🗑️
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
