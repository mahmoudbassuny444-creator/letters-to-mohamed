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
  const [cardColor, setCardColor] = useState("#1e293b");
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(false);
  const [likedPosts, setLikedPosts] = useState<{ [key: string]: boolean }>({});
  const [isAdmin, setIsAdmin] = useState(false);

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

      // تشغيل أنيميشن الأوراق الملونة 🎉
      confetti({
        particleCount: 100,
        spread: 70,
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
    try {
      await deleteDoc(doc(db, "letters", id));
      setLetters((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting letter:", error);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0b132b 0%, #1c2541 50%, #3a506b 100%)",
        color: "#fff",
        padding: "40px 20px",
        fontFamily: "system-ui, sans-serif",
        direction: "rtl"
      }}
    >
      <div style={{ maxWidth: "650px", margin: "0 auto" }}>
        
        {/* الهيدر والعنوان بنفس الصيغة اللي في الصورة */}
        <header style={{ textAlign: "center", marginBottom: "30px" }}>
          <h1 style={{ fontSize: "2.2rem", fontWeight: "bold", marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            رسائل تيم Insider للمهندس محمد حازم 💌
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
            شارك بكلمتك أو ذكرياتك مع المهندس محمد حازم
          </p>
        </header>

        {/* نموذج كتابة الرسالة */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
            marginBottom: "40px"
          }}
        >
          <h2 style={{ fontSize: "1.2rem", marginBottom: "15px", color: "#38bdf8" }}>
            اكتب رسالتك ✍️
          </h2>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem" }}>اسمك الكريم</label>
            <input
              type="text"
              placeholder="اسمك (اختياري)..."
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(0,0,0,0.2)",
                color: "#fff",
                outline: "none"
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem" }}>دورك في التيم / القسم:</label>
            <input
              type="text"
              placeholder="مثال: HR / OC..."
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(0,0,0,0.2)",
                color: "#fff",
                outline: "none"
              }}
            />
          </div>

          {/* اختيار لون الكارت */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem" }}>اختر لون كارت الرسالة 🎨</label>
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { name: "أزرق كحلي", hex: "#1e293b" },
                { name: "بنفسجي", hex: "#4c1d95" },
                { name: "نيلي deep", hex: "#1e3a8a" },
                { name: "كرمزي", hex: "#831843" },
                { name: "زيتي", hex: "#064e3b" },
              ].map((c) => (
                <button
                  type="button"
                  key={c.hex}
                  onClick={() => setCardColor(c.hex)}
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: c.hex,
                    border: cardColor === c.hex ? "3px solid #38bdf8" : "1px solid transparent",
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    transform: cardColor === c.hex ? "scale(1.15)" : "scale(1)"
                  }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem" }}>الرسالة:</label>
            <textarea
              rows={4}
              placeholder="اكتب رسالتك للمهندس محمد حازم..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "rgba(0,0,0,0.2)",
                color: "#fff",
                outline: "none",
                resize: "vertical"
              }}
              required
            />
          </div>

          {/* معاينة الرسالة Live Preview */}
          {message.trim() && (
            <div style={{ marginBottom: "20px" }}>
              <span style={{ fontSize: "0.8rem", color: "#38bdf8", display: "block", marginBottom: "6px" }}>
                👀 معاينة قبل الإرسال:
              </span>
              <div
                style={{
                  background: cardColor,
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  padding: "16px",
                  opacity: 0.9
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
              padding: "12px",
              borderRadius: "8px",
              background: "#0284c7",
              color: "#fff",
              fontWeight: "bold",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            {loading ? "جاري الإرسال..." : "إرسال الرسالة 🚀"}
          </button>
        </form>

        {/* عرض قائمة الرسائل */}
        <section>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "20px", fontWeight: "bold" }}>
            اقرأ رسائل عفوية من التيم! 💬 ({letters.length})
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {letters.map((item) => (
              <div
                key={item.id}
                style={{
                  background: item.cardColor || "#1e293b",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "14px",
                  padding: "20px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#38bdf8" }}>{item.senderName}</h3>
                    <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{item.role}</span>
                  </div>

                  <button
                    onClick={() => handleLike(item.id)}
                    style={{
                      background: likedPosts[item.id] ? "rgba(239, 68, 68, 0.2)" : "rgba(255,255,255,0.1)",
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
                </div>

                <p style={{ lineHeight: "1.6", whiteSpace: "pre-wrap", margin: "10px 0 0 0" }}>
                  {item.message}
                </p>

                {isAdmin && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      marginTop: "12px",
                      background: "#ef4444",
                      color: "#fff",
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.8rem"
                    }}
                  >
                    حذف 🗑️
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
