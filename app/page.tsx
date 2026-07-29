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
import confetti from "canvas-confetti";

interface Letter {
  id: string;
  senderName: string;
  role: string;
  message: string;
  likes?: number;
  cardColor?: string;
  createdAt?: any;
}

export default function Home() {
  const [senderName, setSenderName] = useState("");
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [cardColor, setCardColor] = useState("rgba(15, 23, 42, 0.75)");
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState<{ [key: string]: boolean }>({});
  
  // نظام الأدمن والباسورد المحدث
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const ADMIN_PASSWORD = "19112001";

  const fetchLetters = async () => {
    try {
      const q = query(collection(db, "letters"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const list: Letter[] = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Letter);
      });
      setLetters(list);
    } catch (error) {
      console.error("Error fetching letters:", error);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, "letters"), {
        senderName: senderName.trim() || "فاعل خير 🕵️‍♂️",
        role: role.trim() || "عضو في التيم",
        message: message.trim(),
        cardColor: cardColor,
        likes: 0,
        createdAt: serverTimestamp(),
      });

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      setSenderName("");
      setRole("");
      setMessage("");
      fetchLetters();
    } catch (error) {
      console.error("Error adding letter:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id: string) => {
    if (likedPosts[id]) return;
    try {
      const letterRef = doc(db, "letters", id);
      await updateDoc(letterRef, { likes: increment(1) });
      setLikedPosts((prev) => ({ ...prev, [id]: true }));
      setLetters((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, likes: (item.likes || 0) + 1 } : item
        )
      );
    } catch (error) {
      console.error("Error liking letter:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, "letters", id));
      setLetters((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting letter:", error);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowPasswordModal(false);
      setPasswordInput("");
      alert("تم تسجيل الدخول كأدمن بنجاح! 🔓");
    } else {
      alert("كلمة المرور غير صحيحة ❌");
    }
  };

  const handleRandomLetter = () => {
    if (letters.length === 0) return;
    const randomIndex = Math.floor(Math.random() * letters.length);
    const randomMsg = letters[randomIndex];
    alert(`💌 رسالة من: ${randomMsg.senderName} (${randomMsg.role})\n\n"${randomMsg.message}"`);
  };

  return (
    <>
      <style jsx global>{`
        @keyframes movingGradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <main
        style={{
          minHeight: "100vh",
          background: "linear-gradient(-45deg, #0b0f19, #1e1b4b, #0f172a, #311042, #172554)",
          backgroundSize: "400% 400%",
          animation: "movingGradient 10s ease infinite",
          color: "#fff",
          padding: "40px 20px",
          fontFamily: "system-ui, sans-serif",
          direction: "rtl"
        }}
      >
        <div style={{ maxWidth: "650px", margin: "0 auto" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span
              style={{
                background: "rgba(56, 189, 248, 0.12)",
                color: "#38bdf8",
                padding: "6px 16px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                border: "1px solid rgba(56, 189, 248, 0.25)"
              }}
            >
              🚀 Insider Team Memory Wall
            </span>

            {!isAdmin ? (
              <button
                onClick={() => setShowPasswordModal(true)}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#94a3b8",
                  padding: "4px 12px",
                  borderRadius: "15px",
                  fontSize: "0.75rem",
                  cursor: "pointer"
                }}
              >
                🔐 دخول أدمن
              </button>
            ) : (
              <button
                onClick={() => setIsAdmin(false)}
                style={{
                  background: "rgba(239, 68, 68, 0.2)",
                  border: "1px solid #ef4444",
                  color: "#ef4444",
                  padding: "4px 12px",
                  borderRadius: "15px",
                  fontSize: "0.75rem",
                  cursor: "pointer"
                }}
              >
                🔒 تسجيل خروج الأدمن
              </button>
            )}
          </div>

          {showPasswordModal && (
            <div style={{
              background: "rgba(0,0,0,0.85)",
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
              padding: "20px"
            }}>
              <form onSubmit={handleAdminLogin} style={{
                background: "#1e293b",
                padding: "24px",
                borderRadius: "16px",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                width: "100%",
                maxWidth: "350px",
                textAlign: "center"
              }}>
                <h3 style={{ marginBottom: "15px", color: "#38bdf8" }}>أدخل باسورد الأدمن 🔑</h3>
                <input
                  type="password"
                  placeholder="كلمة المرور..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    background: "rgba(0,0,0,0.4)",
                    color: "#fff",
                    marginBottom: "15px",
                    outline: "none"
                  }}
                  autoFocus
                />
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" style={{ flex: 1, padding: "10px", background: "#0284c7", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                    دخول
                  </button>
                  <button type="button" onClick={() => setShowPasswordModal(false)} style={{ flex: 1, padding: "10px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}>
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          )}

          <header style={{ textAlign: "center", marginBottom: "25px" }}>
            <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "10px" }}>
              رسائل تيم Insider للمهندس محمد حازم ❤️
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
              شارك بكلمتك أو ذكرياتك مع المهندس محمد حازم
            </p>

            <button
              onClick={handleRandomLetter}
              style={{
                marginTop: "15px",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "#38bdf8",
                padding: "8px 20px",
                borderRadius: "25px",
                cursor: "pointer",
                fontSize: "0.9rem",
                backdropFilter: "blur(10px)"
              }}
            >
              🎲 اقرأ رسالة عشوائية من التيم!
            </button>
          </header>

          <form
            onSubmit={handleSubmit}
            style={{
              background: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              marginBottom: "40px"
            }}
          >
            <h2 style={{ fontSize: "1.2rem", marginBottom: "20px", color: "#38bdf8", fontWeight: "bold" }}>
              اكتب رسالتك ✍️
            </h2>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "#e2e8f0" }}>
                الاسم:
              </label>
              <input
                type="text"
                placeholder="اسمك الكريم..."
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(0, 0, 0, 0.3)",
                  color: "#fff",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "#e2e8f0" }}>
                دورك في التيم / القسم:
              </label>
              <input
                type="text"
                placeholder="مثال: HR / OC"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(0, 0, 0, 0.3)",
                  color: "#fff",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", color: "#94a3b8" }}>
                اختر لون كارت الرسالة 🎨
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                {[
                  { name: "كحلي", hex: "rgba(15, 23, 42, 0.85)" },
                  { name: "بنفسجي", hex: "rgba(76, 29, 149, 0.85)" },
                  { name: "نيلي", hex: "rgba(30, 58, 138, 0.85)" },
                  { name: "كرمزي", hex: "rgba(131, 24, 67, 0.85)" },
                  { name: "زيتي", hex: "rgba(6, 78, 59, 0.85)" },
                ].map((c) => (
                  <button
                    type="button"
                    key={c.hex}
                    onClick={() => setCardColor(c.hex)}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: c.hex,
                      border: cardColor === c.hex ? "2px solid #38bdf8" : "1px solid rgba(255,255,255,0.2)",
                      cursor: "pointer",
                      transform: cardColor === c.hex ? "scale(1.2)" : "scale(1)"
                    }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "#e2e8f0" }}>
                الرسالة:
              </label>
              <textarea
                rows={4}
                placeholder="اكتب رسالتك للمهندس محمد حازم..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(0, 0, 0, 0.3)",
                  color: "#fff",
                  outline: "none",
                  resize: "vertical"
                }}
                required
              />
            </div>

            {message.trim() && (
              <div style={{ marginBottom: "20px" }}>
                <span style={{ fontSize: "0.88rem", color: "#38bdf8", display: "block", marginBottom: "6px" }}>
                  👀 معاينة شكل الرسالة:
                </span>
                <div
                  style={{
                    background: cardColor,
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "14px",
                    padding: "16px"
                  }}
                >
                  <div style={{ fontWeight: "bold", fontSize: "1rem", color: "#38bdf8" }}>
                    {senderName.trim() || "فاعل خير 🕵️‍♂️"}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "8px" }}>
                    {role.trim() || "عضو في التيم"}
                  </div>
                  <p style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: "0.95rem" }}>{message}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "10px",
                background: "#0284c7",
                color: "#fff",
                fontWeight: "bold",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "1rem"
              }}
            >
              {loading ? "جاري الإرسال..." : "إرسال الرسالة 🚀"}
            </button>
          </form>

          <section>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "20px", fontWeight: "bold" }}>
              الرسائل والذكريات 💬
            </h2>

            {!isAdmin ? (
              <div style={{
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px dashed rgba(255,255,255,0.2)",
                borderRadius: "14px",
                padding: "30px",
                textAlign: "center",
                color: "#94a3b8"
              }}>
                <p style={{ fontSize: "1.05rem", marginBottom: "10px" }}>🔒 حائط الرسائل مخفي حالياً لحفظ الخصوصية.</p>
                <p style={{ fontSize: "0.85rem" }}>إذا كنت المهندس محمد حازم أو الأدمن، اضغط على زر <b>"دخول أدمن"</b> فوق خالص وأدخل كلمة المرور لقراءة الحائط بالكامل.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ background: "rgba(34, 197, 94, 0.15)", border: "1px solid #22c55e", padding: "10px 15px", borderRadius: "10px", color: "#22c55e", fontSize: "0.9rem", textAlign: "center" }}>
                  🔓 أنت مسجل كأدمن الآن. عدد الرسائل الكلي: ({letters.length})
                </div>

                {letters.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: item.cardColor || "rgba(15, 23, 42, 0.75)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "14px",
                      padding: "20px",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#38bdf8" }}>{item.senderName}</h3>
                        <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{item.role}</span>
                      </div>

                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <button
                          onClick={() => handleLike(item.id)}
                          style={{
                            background: likedPosts[item.id] ? "rgba(239, 68, 68, 0.2)" : "rgba(255,255,255,0.08)",
                            border: "none",
                            borderRadius: "20px",
                            padding: "6px 12px",
                            color: likedPosts[item.id] ? "#ef4444" : "#fff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.85rem"
                          }}
                        >
                          <span>{likedPosts[item.id] ? "❤️" : "🤍"}</span>
                          <span>{item.likes || 0}</span>
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          style={{
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                            padding: "6px 10px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "0.8rem"
                          }}
                          title="حذف الرسالة"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <p style={{ lineHeight: "1.6", whiteSpace: "pre-wrap", margin: "10px 0 0 0" }}>
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
