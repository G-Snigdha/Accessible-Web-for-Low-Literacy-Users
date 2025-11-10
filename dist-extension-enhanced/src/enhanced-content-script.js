import { c as b, j as t, r as c } from "./client-Cz3TYUeU.js";
import { chromeAI as d } from "./chromeAI.js";
const S = {
  accessibility: {
    enableTextToSpeech: !0,
    speechRate: 1,
    speechVoice: "",
    enableKeyboardShortcuts: !0,
    showTooltips: !0,
    highlightDifficultWords: !0,
    fontSize: "medium",
    enableHighContrast: !1
  },
  aiPreferences: {
    defaultSimplificationLevel: "medium",
    preferredLanguage: "en",
    autoDetectLanguage: !0,
    processOnSelect: !1
  },
  interface: {
    sidebarPosition: "right",
    theme: "light",
    enableAnimations: !0
  }
}, j = ({ message: p, type: e, onClose: i }) => {
  c.useEffect(() => {
    const a = setTimeout(i, 5e3);
    return () => clearTimeout(a);
  }, [i]);
  const r = {
    success: "#10b981",
    error: "#ef4444",
    info: "#3b82f6",
    warning: "#f59e0b"
  };
  return /* @__PURE__ */ t.jsxs(
    "div",
    {
      style: {
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "16px 20px",
        background: r[e],
        color: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        zIndex: 1e6,
        maxWidth: "400px",
        fontSize: "14px",
        cursor: "pointer",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        animation: "slideIn 0.3s ease-out"
      },
      onClick: i,
      children: [
        /* @__PURE__ */ t.jsxs("span", { style: { fontSize: "16px" }, children: [
          e === "success" && "✅",
          e === "error" && "❌",
          e === "info" && "ℹ️",
          e === "warning" && "⚠️"
        ] }),
        p
      ]
    }
  );
}, v = ({ selectedText: p, position: e, onAction: i, onClose: r }) => {
  const a = [
    { key: "simplify", label: "✨ Simplify", color: "#667eea" },
    { key: "proofread", label: "🔤 Proofread", color: "#f093fb" },
    { key: "translate", label: "🌐 Translate", color: "#4facfe" },
    { key: "speak", label: "🔊 Speak", color: "#43e97b" },
    { key: "explain", label: "💡 Explain", color: "#fa709a" }
  ];
  return /* @__PURE__ */ t.jsxs(
    "div",
    {
      style: {
        position: "fixed",
        left: `${Math.min(e.x, window.innerWidth - 280)}px`,
        top: `${Math.max(e.y - 60, 10)}px`,
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        padding: "8px",
        zIndex: 1e6,
        display: "flex",
        gap: "4px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        animation: "fadeIn 0.2s ease-out"
      },
      children: [
        a.map((s) => /* @__PURE__ */ t.jsx(
          "button",
          {
            onClick: () => i(s.key, p),
            style: {
              padding: "8px 12px",
              border: "none",
              borderRadius: "8px",
              background: s.color,
              color: "white",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: 500,
              whiteSpace: "nowrap",
              transition: "all 0.2s"
            },
            onMouseEnter: (n) => {
              n.currentTarget.style.transform = "scale(1.05)";
            },
            onMouseLeave: (n) => {
              n.currentTarget.style.transform = "scale(1)";
            },
            children: s.label
          },
          s.key
        )),
        /* @__PURE__ */ t.jsx(
          "button",
          {
            onClick: r,
            style: {
              padding: "8px",
              border: "none",
              borderRadius: "8px",
              background: "#6b7280",
              color: "white",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center"
            },
            children: "✕"
          }
        )
      ]
    }
  );
}, R = ({ isVisible: p, position: e, theme: i, onClose: r, onAction: a }) => {
  const [s, n] = c.useState("ai"), [l, f] = c.useState(""), [g, h] = c.useState(""), [u, m] = c.useState(!1), [x, w] = c.useState("simplify"), k = {
    position: "fixed",
    top: "0",
    [e]: "0",
    width: "380px",
    height: "100vh",
    background: i === "dark" ? "#1f2937" : "#ffffff",
    color: i === "dark" ? "#f9fafb" : "#111827",
    boxShadow: e === "right" ? "-4px 0 20px rgba(0,0,0,0.1)" : "4px 0 20px rgba(0,0,0,0.1)",
    zIndex: 999999,
    fontFamily: "system-ui, -apple-system, sans-serif",
    display: p ? "flex" : "none",
    flexDirection: "column",
    overflow: "hidden",
    transform: `translateX(${p ? "0" : e === "right" ? "100%" : "-100%"})`,
    transition: "transform 0.3s ease-in-out"
  }, T = async () => {
    if (l.trim()) {
      m(!0), h("Processing...");
      try {
        let o;
        switch (x) {
          case "simplify":
            o = await d.prompt(
              `Simplify this text to make it easier to understand. Keep the same meaning but use simpler words and shorter sentences:

${l}`,
              { systemPrompt: "You are a helpful assistant that simplifies text for better readability." }
            );
            break;
          case "proofread":
            o = await d.proofread(l);
            break;
          case "translate":
            o = await d.translate(l, {
              sourceLanguage: "en",
              targetLanguage: "es"
            });
            break;
          case "explain":
            o = await d.prompt(
              `Explain this text in simple terms, as if talking to someone who might not be familiar with the topic:

${l}`,
              { systemPrompt: "You are a helpful teacher that explains complex topics in simple, easy-to-understand language." }
            );
            break;
        }
        if (o.success && o.data) {
          const y = typeof o.data == "string" ? o.data : typeof o.data == "object" && "correctedText" in o.data ? o.data.correctedText : "Processing completed";
          h(y), a("text-processed", { original: l, processed: y, type: x });
        } else
          h(`Error: ${o.error || "Processing failed"}`);
      } catch (o) {
        h(`Error: ${o instanceof Error ? o.message : "Unknown error"}`);
      } finally {
        m(!1);
      }
    }
  };
  return /* @__PURE__ */ t.jsxs("div", { style: k, children: [
    /* @__PURE__ */ t.jsxs("div", { style: {
      padding: "16px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    }, children: [
      /* @__PURE__ */ t.jsx("h2", { style: { margin: 0, fontSize: "18px", fontWeight: 600 }, children: "🧠 AI Assistant" }),
      /* @__PURE__ */ t.jsx(
        "button",
        {
          onClick: r,
          style: {
            background: "rgba(255,255,255,0.2)",
            border: "none",
            color: "white",
            borderRadius: "6px",
            padding: "8px",
            cursor: "pointer",
            fontSize: "14px"
          },
          children: "✕"
        }
      )
    ] }),
    /* @__PURE__ */ t.jsx("div", { style: {
      display: "flex",
      background: i === "dark" ? "#374151" : "#f3f4f6",
      padding: "4px"
    }, children: [
      { id: "ai", label: "🧠 AI Tools", icon: "🧠" },
      { id: "settings", label: "⚙️ Settings", icon: "⚙️" },
      { id: "history", label: "📜 History", icon: "📜" }
    ].map((o) => /* @__PURE__ */ t.jsx(
      "button",
      {
        onClick: () => n(o.id),
        style: {
          flex: 1,
          padding: "8px 12px",
          border: "none",
          borderRadius: "6px",
          background: s === o.id ? "white" : "transparent",
          color: s === o.id ? "#333" : i === "dark" ? "#d1d5db" : "#6b7280",
          cursor: "pointer",
          fontSize: "12px",
          fontWeight: s === o.id ? 600 : 400
        },
        children: o.label
      },
      o.id
    )) }),
    /* @__PURE__ */ t.jsxs("div", { style: { flex: 1, overflow: "auto", padding: "16px" }, children: [
      s === "ai" && /* @__PURE__ */ t.jsxs("div", { children: [
        /* @__PURE__ */ t.jsxs("div", { style: { marginBottom: "16px" }, children: [
          /* @__PURE__ */ t.jsx("label", { style: { display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500 }, children: "Choose AI Feature:" }),
          /* @__PURE__ */ t.jsxs(
            "select",
            {
              value: x,
              onChange: (o) => w(o.target.value),
              style: {
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: `1px solid ${i === "dark" ? "#4b5563" : "#d1d5db"}`,
                background: i === "dark" ? "#374151" : "white",
                color: i === "dark" ? "#f9fafb" : "#111827",
                fontSize: "14px"
              },
              children: [
                /* @__PURE__ */ t.jsx("option", { value: "simplify", children: "✨ Simplify Text" }),
                /* @__PURE__ */ t.jsx("option", { value: "proofread", children: "🔤 Proofread & Fix" }),
                /* @__PURE__ */ t.jsx("option", { value: "translate", children: "🌐 Translate" }),
                /* @__PURE__ */ t.jsx("option", { value: "explain", children: "💡 Explain Concepts" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ t.jsxs("div", { style: { marginBottom: "16px" }, children: [
          /* @__PURE__ */ t.jsx("label", { style: { display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500 }, children: "Input Text:" }),
          /* @__PURE__ */ t.jsx(
            "textarea",
            {
              value: l,
              onChange: (o) => f(o.target.value),
              placeholder: "Paste or type text here...",
              style: {
                width: "100%",
                height: "120px",
                padding: "12px",
                borderRadius: "8px",
                border: `1px solid ${i === "dark" ? "#4b5563" : "#d1d5db"}`,
                background: i === "dark" ? "#374151" : "white",
                color: i === "dark" ? "#f9fafb" : "#111827",
                fontSize: "14px",
                fontFamily: "inherit",
                resize: "vertical"
              }
            }
          )
        ] }),
        /* @__PURE__ */ t.jsx(
          "button",
          {
            onClick: T,
            disabled: u || !l.trim(),
            style: {
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              background: u || !l.trim() ? "#9ca3af" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontSize: "14px",
              fontWeight: 600,
              cursor: u || !l.trim() ? "not-allowed" : "pointer",
              marginBottom: "16px"
            },
            children: u ? "⏳ Processing..." : "✨ Process Text"
          }
        ),
        g && /* @__PURE__ */ t.jsxs("div", { children: [
          /* @__PURE__ */ t.jsx("label", { style: { display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500 }, children: "Result:" }),
          /* @__PURE__ */ t.jsx(
            "div",
            {
              style: {
                padding: "12px",
                borderRadius: "8px",
                background: i === "dark" ? "#1f2937" : "#f9fafb",
                border: `1px solid ${i === "dark" ? "#374151" : "#e5e7eb"}`,
                fontSize: "14px",
                lineHeight: "1.5",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                maxHeight: "200px",
                overflowY: "auto"
              },
              children: g
            }
          )
        ] })
      ] }),
      s === "settings" && /* @__PURE__ */ t.jsxs("div", { children: [
        /* @__PURE__ */ t.jsx("h3", { style: { margin: "0 0 16px", fontSize: "16px" }, children: "Quick Settings" }),
        /* @__PURE__ */ t.jsx("div", { style: { marginBottom: "16px" }, children: /* @__PURE__ */ t.jsxs("label", { style: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }, children: [
          /* @__PURE__ */ t.jsx("input", { type: "checkbox", defaultChecked: !0 }),
          /* @__PURE__ */ t.jsx("span", { style: { fontSize: "14px" }, children: "Enable keyboard shortcuts" })
        ] }) }),
        /* @__PURE__ */ t.jsx("div", { style: { marginBottom: "16px" }, children: /* @__PURE__ */ t.jsxs("label", { style: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }, children: [
          /* @__PURE__ */ t.jsx("input", { type: "checkbox", defaultChecked: !0 }),
          /* @__PURE__ */ t.jsx("span", { style: { fontSize: "14px" }, children: "Text-to-speech enabled" })
        ] }) }),
        /* @__PURE__ */ t.jsx("div", { style: { marginBottom: "16px" }, children: /* @__PURE__ */ t.jsxs("label", { style: { display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }, children: [
          /* @__PURE__ */ t.jsx("input", { type: "checkbox", defaultChecked: !0 }),
          /* @__PURE__ */ t.jsx("span", { style: { fontSize: "14px" }, children: "Auto-process selected text" })
        ] }) }),
        /* @__PURE__ */ t.jsx(
          "button",
          {
            onClick: () => chrome.runtime.openOptionsPage(),
            style: {
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background: "white",
              color: "#374151",
              fontSize: "14px",
              cursor: "pointer"
            },
            children: "⚙️ Open Full Settings"
          }
        )
      ] }),
      s === "history" && /* @__PURE__ */ t.jsxs("div", { children: [
        /* @__PURE__ */ t.jsx("h3", { style: { margin: "0 0 16px", fontSize: "16px" }, children: "Recent Activity" }),
        /* @__PURE__ */ t.jsx("p", { style: { fontSize: "14px", color: "#6b7280" }, children: "Your processing history will appear here..." })
      ] })
    ] })
  ] });
};
class E {
  constructor() {
    this.settings = S, this.sidebarVisible = !1, this.sidebarRoot = null, this.notificationRoot = null, this.toolbarRoot = null, this.currentSpeech = null, this.init();
  }
  async init() {
    await this.loadSettings(), this.setupEventListeners(), this.setupKeyboardShortcuts(), this.setupTextSelection(), this.setupNotificationSystem(), this.applyAccessibilitySettings(), console.log("🧠 Enhanced Accessible Web Extension loaded");
  }
  async loadSettings() {
    try {
      const e = await chrome.storage.sync.get("extensionSettings");
      e.extensionSettings && (this.settings = { ...S, ...e.extensionSettings });
    } catch (e) {
      console.error("Failed to load settings:", e);
    }
  }
  setupEventListeners() {
    chrome.runtime.onMessage.addListener((e, i, r) => (this.handleMessage(e, i, r), !0));
  }
  handleMessage(e, i, r) {
    switch (e.action) {
      case "toggle-sidebar":
        this.toggleSidebar(), r({ success: !0 });
        break;
      case "speak-text":
        this.speakText(e.text), r({ success: !0 });
        break;
      case "process-selection":
        this.processSelectedText(e.type).then((a) => {
          r(a);
        });
        break;
      default:
        r({ success: !1, error: "Unknown action" });
    }
  }
  setupKeyboardShortcuts() {
    this.settings.accessibility.enableKeyboardShortcuts && document.addEventListener("keydown", async (e) => {
      e.altKey && e.shiftKey && e.key === "S" && (e.preventDefault(), this.toggleSidebar()), e.altKey && e.key === "s" && (e.preventDefault(), await this.processSelectedText("simplify")), e.altKey && e.key === "p" && (e.preventDefault(), await this.processSelectedText("proofread")), e.altKey && e.key === "t" && (e.preventDefault(), await this.processSelectedText("translate")), e.altKey && e.key === "l" && (e.preventDefault(), await this.processSelectedText("speak")), e.altKey && e.key === "e" && (e.preventDefault(), await this.processSelectedText("explain")), e.key === "Escape" && (this.currentSpeech && (speechSynthesis.cancel(), this.currentSpeech = null), this.sidebarVisible && (e.preventDefault(), this.hideSidebar()), this.hideFloatingToolbar());
    });
  }
  setupTextSelection() {
    let e;
    document.addEventListener("mouseup", () => {
      clearTimeout(e), e = setTimeout(() => {
        const i = window.getSelection(), r = i == null ? void 0 : i.toString().trim();
        r && r.length > 10 && (this.settings.aiPreferences.processOnSelect ? this.processSelectedText("simplify") : this.showFloatingToolbar(r, {
          x: i.getRangeAt(0).getBoundingClientRect().left,
          y: i.getRangeAt(0).getBoundingClientRect().top
        }));
      }, 300);
    }), document.addEventListener("mousedown", () => {
      clearTimeout(e), this.hideFloatingToolbar();
    });
  }
  setupNotificationSystem() {
    const e = document.createElement("div");
    e.id = "accessible-web-notifications", document.body.appendChild(e), this.notificationRoot = b(e);
  }
  showNotification(e, i = "info") {
    if (!this.notificationRoot) return;
    let r = !0;
    const a = () => r ? /* @__PURE__ */ t.jsx(
      j,
      {
        message: e,
        type: i,
        onClose: () => {
          r = !1, this.notificationRoot.render(null);
        }
      }
    ) : null;
    this.notificationRoot.render(/* @__PURE__ */ t.jsx(a, {}));
  }
  showFloatingToolbar(e, i) {
    this.hideFloatingToolbar();
    const r = document.createElement("div");
    r.id = "accessible-web-toolbar", document.body.appendChild(r), this.toolbarRoot = b(r);
    const a = () => {
      const [s, n] = c.useState(!0);
      return s ? /* @__PURE__ */ t.jsx(
        v,
        {
          selectedText: e,
          position: i,
          onAction: (l, f) => {
            this.processSelectedText(l, f), n(!1);
          },
          onClose: () => n(!1)
        }
      ) : null;
    };
    this.toolbarRoot.render(/* @__PURE__ */ t.jsx(a, {})), setTimeout(() => {
      this.hideFloatingToolbar();
    }, 1e4);
  }
  hideFloatingToolbar() {
    if (this.toolbarRoot) {
      this.toolbarRoot.render(null);
      const e = document.getElementById("accessible-web-toolbar");
      e && e.remove(), this.toolbarRoot = null;
    }
  }
  toggleSidebar() {
    this.sidebarVisible ? this.hideSidebar() : this.showSidebar();
  }
  showSidebar() {
    if (this.sidebarVisible) return;
    const e = document.createElement("div");
    e.id = "accessible-web-sidebar", document.body.appendChild(e), this.sidebarRoot = b(e);
    const i = () => {
      const [r, a] = c.useState(!0);
      return /* @__PURE__ */ t.jsx(
        R,
        {
          isVisible: r,
          position: this.settings.interface.sidebarPosition,
          theme: this.settings.interface.theme,
          onClose: () => {
            a(!1), this.hideSidebar();
          },
          onAction: (s, n) => {
            console.log("Sidebar action:", s, n);
          }
        }
      );
    };
    this.sidebarRoot.render(/* @__PURE__ */ t.jsx(i, {})), this.sidebarVisible = !0, chrome.storage.local.set({ sidebarEnabled: !0 });
  }
  hideSidebar() {
    if (this.sidebarVisible) {
      if (this.sidebarRoot) {
        this.sidebarRoot.render(null);
        const e = document.getElementById("accessible-web-sidebar");
        e && e.remove(), this.sidebarRoot = null;
      }
      this.sidebarVisible = !1, chrome.storage.local.set({ sidebarEnabled: !1 });
    }
  }
  async processSelectedText(e, i) {
    const r = window.getSelection(), a = i || (r ? r.toString().trim() : "");
    if (!a)
      return this.showNotification("Please select some text first", "warning"), { success: !1, error: "No text selected" };
    try {
      let s;
      switch (e) {
        case "simplify":
          s = await d.prompt(
            `Simplify this text to make it easier to understand. Keep the same meaning but use simpler words and shorter sentences:

${a}`,
            { systemPrompt: "You are a helpful assistant that simplifies text for better readability." }
          );
          break;
        case "proofread":
          s = await d.proofread(a);
          break;
        case "translate":
          s = await d.translate(a, {
            sourceLanguage: "en",
            targetLanguage: this.settings.aiPreferences.preferredLanguage
          });
          break;
        case "speak":
          return this.speakText(a), { success: !0, message: "Text is being read aloud" };
        case "explain":
          s = await d.prompt(
            `Explain this text in simple terms, as if talking to someone who might not be familiar with the topic:

${a}`,
            { systemPrompt: "You are a helpful teacher that explains complex topics in simple, easy-to-understand language." }
          );
          break;
        default:
          throw new Error("Unknown action");
      }
      if (s && s.success && s.data) {
        const n = typeof s.data == "string" ? s.data : typeof s.data == "object" && "correctedText" in s.data ? s.data.correctedText : "Processing completed";
        return this.showNotification(`✨ ${e.charAt(0).toUpperCase() + e.slice(1)} completed!`, "success"), navigator.clipboard.writeText(n).then(() => {
          this.showNotification("Result copied to clipboard!", "info");
        }), { success: !0, data: n };
      } else
        throw new Error((s == null ? void 0 : s.error) || "Processing failed");
    } catch (s) {
      const n = s instanceof Error ? s.message : "Unknown error occurred";
      return this.showNotification(`❌ Error: ${n}`, "error"), { success: !1, error: n };
    }
  }
  speakText(e) {
    if (!this.settings.accessibility.enableTextToSpeech) {
      this.showNotification("Text-to-speech is disabled in settings", "warning");
      return;
    }
    if (this.currentSpeech && speechSynthesis.cancel(), this.currentSpeech = new SpeechSynthesisUtterance(e), this.currentSpeech.rate = this.settings.accessibility.speechRate, this.settings.accessibility.speechVoice) {
      const r = speechSynthesis.getVoices().find((a) => a.name === this.settings.accessibility.speechVoice);
      r && (this.currentSpeech.voice = r);
    }
    this.currentSpeech.onstart = () => {
      this.showNotification("🔊 Reading text aloud...", "info");
    }, this.currentSpeech.onend = () => {
      this.currentSpeech = null;
    }, this.currentSpeech.onerror = () => {
      this.showNotification("❌ Text-to-speech error", "error"), this.currentSpeech = null;
    }, speechSynthesis.speak(this.currentSpeech);
  }
  applyAccessibilitySettings() {
    if (this.settings.accessibility.fontSize !== "medium") {
      const e = document.createElement("style"), i = {
        small: "0.9em",
        medium: "1em",
        large: "1.2em",
        xlarge: "1.4em"
      };
      e.textContent = `
        * { font-size: ${i[this.settings.accessibility.fontSize]} !important; }
      `, document.head.appendChild(e);
    }
    if (this.settings.accessibility.enableHighContrast) {
      const e = document.createElement("style");
      e.textContent = `
        * {
          background: black !important;
          color: white !important;
          border-color: white !important;
        }
        a, a * { color: yellow !important; }
        img { filter: contrast(1.5) brightness(1.2); }
      `, document.head.appendChild(e);
    }
    if (this.settings.interface.enableAnimations) {
      const e = document.createElement("style");
      e.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `, document.head.appendChild(e);
    }
  }
}
new E();
