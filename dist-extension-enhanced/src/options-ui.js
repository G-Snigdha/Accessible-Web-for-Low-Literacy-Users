import { c as R, j as e, r as c } from "./client-Cz3TYUeU.js";
/* empty css                   */
const h = {
  accessibility: {
    enableHighContrast: !1,
    fontSize: "medium",
    readingMode: !1,
    highlightDifficultWords: !0,
    enableTextToSpeech: !0,
    speechRate: 1,
    speechVoice: "",
    enableKeyboardShortcuts: !0,
    showTooltips: !0
  },
  aiPreferences: {
    defaultSimplificationLevel: "medium",
    preferredLanguage: "en",
    autoDetectLanguage: !0,
    enableSmartSuggestions: !0,
    processOnSelect: !1,
    showConfidenceScores: !1
  },
  interface: {
    theme: "auto",
    sidebarPosition: "right",
    compactMode: !1,
    enableAnimations: !0,
    notificationLevel: "important",
    autoSaveResults: !0
  },
  privacy: {
    saveHistory: !0,
    maxHistoryItems: 100,
    enableAnalytics: !1,
    shareUsageStats: !1
  }
}, T = () => {
  const [i, p] = c.useState(h), [o, m] = c.useState("accessibility"), [y, j] = c.useState([]), [d, g] = c.useState(!1), [l, x] = c.useState("idle");
  c.useEffect(() => {
    S(), k();
  }, []);
  const S = async () => {
    try {
      const t = await chrome.storage.sync.get("extensionSettings");
      t.extensionSettings && p({ ...h, ...t.extensionSettings });
    } catch (t) {
      console.error("Failed to load settings:", t);
    }
  }, v = async () => {
    x("saving");
    try {
      await chrome.storage.sync.set({ extensionSettings: i }), x("saved"), setTimeout(() => x("idle"), 2e3);
    } catch (t) {
      console.error("Failed to save settings:", t), x("error");
    }
  }, k = () => {
    const t = () => {
      const n = speechSynthesis.getVoices();
      if (j(n), !i.accessibility.speechVoice && n.length > 0) {
        const a = n.find((r) => r.default) || n[0];
        s("accessibility", "speechVoice", a.name);
      }
    };
    t(), speechSynthesis.addEventListener("voiceschanged", t);
  }, s = (t, n, a) => {
    p((r) => ({
      ...r,
      [t]: {
        ...r[t],
        [n]: a
      }
    }));
  }, z = () => {
    if (d) return;
    g(!0);
    const t = new SpeechSynthesisUtterance("This is how your selected voice will sound when reading text aloud."), n = y.find((a) => a.name === i.accessibility.speechVoice);
    n && (t.voice = n), t.rate = i.accessibility.speechRate, t.onend = () => g(!1), t.onerror = () => g(!1), speechSynthesis.speak(t);
  }, C = () => {
    confirm("Reset all settings to defaults? This cannot be undone.") && p(h);
  }, w = () => {
    const t = JSON.stringify(i, null, 2), n = new Blob([t], { type: "application/json" }), a = document.createElement("a");
    a.href = URL.createObjectURL(n), a.download = `accessible-web-settings-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`, a.click();
  }, I = (t) => {
    var r;
    const n = (r = t.target.files) == null ? void 0 : r[0];
    if (!n) return;
    const a = new FileReader();
    a.onload = (A) => {
      var u;
      try {
        const f = JSON.parse((u = A.target) == null ? void 0 : u.result);
        p({ ...h, ...f }), alert("Settings imported successfully!");
      } catch {
        alert("Invalid settings file. Please check the file format.");
      }
    }, a.readAsText(n);
  };
  return /* @__PURE__ */ e.jsxs("div", { style: { fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: "1000px", margin: "0 auto", padding: "20px" }, children: [
    /* @__PURE__ */ e.jsxs("header", { style: { textAlign: "center", marginBottom: "40px", padding: "20px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", borderRadius: "12px" }, children: [
      /* @__PURE__ */ e.jsx("h1", { style: { margin: 0, fontSize: "28px", fontWeight: 600 }, children: "🧠 Accessible Web Extension" }),
      /* @__PURE__ */ e.jsx("p", { style: { margin: "8px 0 0", fontSize: "16px", opacity: 0.9 }, children: "Settings & Accessibility Options" })
    ] }),
    /* @__PURE__ */ e.jsx("nav", { style: { display: "flex", gap: "4px", marginBottom: "24px", background: "#f5f5f5", padding: "4px", borderRadius: "12px" }, children: [
      { id: "accessibility", label: "♿ Accessibility", icon: "♿" },
      { id: "ai", label: "🧠 AI Preferences", icon: "🧠" },
      { id: "interface", label: "🎨 Interface", icon: "🎨" },
      { id: "privacy", label: "🔒 Privacy", icon: "🔒" },
      { id: "keyboard", label: "⌨️ Shortcuts", icon: "⌨️" }
    ].map((t) => /* @__PURE__ */ e.jsx(
      "button",
      {
        onClick: () => m(t.id),
        style: {
          flex: 1,
          padding: "12px 16px",
          border: "none",
          borderRadius: "8px",
          background: o === t.id ? "white" : "transparent",
          color: o === t.id ? "#333" : "#666",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: o === t.id ? 600 : 400,
          boxShadow: o === t.id ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
          transition: "all 0.2s"
        },
        children: t.label
      },
      t.id
    )) }),
    /* @__PURE__ */ e.jsxs("div", { style: { background: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }, children: [
      o === "accessibility" && /* @__PURE__ */ e.jsxs("div", { children: [
        /* @__PURE__ */ e.jsx("h2", { style: { margin: "0 0 20px", fontSize: "20px", color: "#333" }, children: "♿ Accessibility Settings" }),
        /* @__PURE__ */ e.jsxs("div", { style: { display: "grid", gap: "20px" }, children: [
          /* @__PURE__ */ e.jsxs("section", { children: [
            /* @__PURE__ */ e.jsx("h3", { style: { margin: "0 0 12px", fontSize: "16px", color: "#555" }, children: "👁️ Visual Accessibility" }),
            /* @__PURE__ */ e.jsxs("label", { style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", cursor: "pointer" }, children: [
              /* @__PURE__ */ e.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: i.accessibility.enableHighContrast,
                  onChange: (t) => s("accessibility", "enableHighContrast", t.target.checked)
                }
              ),
              /* @__PURE__ */ e.jsx("span", { children: "Enable High Contrast Mode" })
            ] }),
            /* @__PURE__ */ e.jsxs("div", { style: { marginBottom: "12px" }, children: [
              /* @__PURE__ */ e.jsx("label", { style: { display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }, children: "Font Size" }),
              /* @__PURE__ */ e.jsxs(
                "select",
                {
                  value: i.accessibility.fontSize,
                  onChange: (t) => s("accessibility", "fontSize", t.target.value),
                  style: { padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px" },
                  children: [
                    /* @__PURE__ */ e.jsx("option", { value: "small", children: "Small" }),
                    /* @__PURE__ */ e.jsx("option", { value: "medium", children: "Medium (Default)" }),
                    /* @__PURE__ */ e.jsx("option", { value: "large", children: "Large" }),
                    /* @__PURE__ */ e.jsx("option", { value: "xlarge", children: "Extra Large" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ e.jsxs("label", { style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", cursor: "pointer" }, children: [
              /* @__PURE__ */ e.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: i.accessibility.readingMode,
                  onChange: (t) => s("accessibility", "readingMode", t.target.checked)
                }
              ),
              /* @__PURE__ */ e.jsx("span", { children: "Enable Reading Mode (Focus on text content)" })
            ] }),
            /* @__PURE__ */ e.jsxs("label", { style: { display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }, children: [
              /* @__PURE__ */ e.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: i.accessibility.highlightDifficultWords,
                  onChange: (t) => s("accessibility", "highlightDifficultWords", t.target.checked)
                }
              ),
              /* @__PURE__ */ e.jsx("span", { children: "Highlight Difficult Words" })
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("section", { children: [
            /* @__PURE__ */ e.jsx("h3", { style: { margin: "0 0 12px", fontSize: "16px", color: "#555" }, children: "🔊 Audio Accessibility" }),
            /* @__PURE__ */ e.jsxs("label", { style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", cursor: "pointer" }, children: [
              /* @__PURE__ */ e.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: i.accessibility.enableTextToSpeech,
                  onChange: (t) => s("accessibility", "enableTextToSpeech", t.target.checked)
                }
              ),
              /* @__PURE__ */ e.jsx("span", { children: "Enable Text-to-Speech" })
            ] }),
            i.accessibility.enableTextToSpeech && /* @__PURE__ */ e.jsxs(e.Fragment, { children: [
              /* @__PURE__ */ e.jsxs("div", { style: { marginBottom: "12px" }, children: [
                /* @__PURE__ */ e.jsx("label", { style: { display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }, children: "Voice" }),
                /* @__PURE__ */ e.jsxs("div", { style: { display: "flex", gap: "8px", alignItems: "center" }, children: [
                  /* @__PURE__ */ e.jsx(
                    "select",
                    {
                      value: i.accessibility.speechVoice,
                      onChange: (t) => s("accessibility", "speechVoice", t.target.value),
                      style: { flex: 1, padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px" },
                      children: y.map((t) => /* @__PURE__ */ e.jsxs("option", { value: t.name, children: [
                        t.name,
                        " (",
                        t.lang,
                        ")"
                      ] }, t.name))
                    }
                  ),
                  /* @__PURE__ */ e.jsx(
                    "button",
                    {
                      onClick: z,
                      disabled: d,
                      style: {
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: "none",
                        background: d ? "#ccc" : "#667eea",
                        color: "white",
                        cursor: d ? "not-allowed" : "pointer",
                        fontSize: "14px"
                      },
                      children: d ? "🔊 Testing..." : "🔊 Test"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ e.jsxs("div", { style: { marginBottom: "12px" }, children: [
                /* @__PURE__ */ e.jsxs("label", { style: { display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }, children: [
                  "Speech Rate: ",
                  i.accessibility.speechRate,
                  "x"
                ] }),
                /* @__PURE__ */ e.jsx(
                  "input",
                  {
                    type: "range",
                    min: "0.5",
                    max: "2",
                    step: "0.1",
                    value: i.accessibility.speechRate,
                    onChange: (t) => s("accessibility", "speechRate", parseFloat(t.target.value)),
                    style: { width: "100%" }
                  }
                ),
                /* @__PURE__ */ e.jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#666" }, children: [
                  /* @__PURE__ */ e.jsx("span", { children: "Slow (0.5x)" }),
                  /* @__PURE__ */ e.jsx("span", { children: "Normal (1.0x)" }),
                  /* @__PURE__ */ e.jsx("span", { children: "Fast (2.0x)" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("section", { children: [
            /* @__PURE__ */ e.jsx("h3", { style: { margin: "0 0 12px", fontSize: "16px", color: "#555" }, children: "⌨️ Interaction" }),
            /* @__PURE__ */ e.jsxs("label", { style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", cursor: "pointer" }, children: [
              /* @__PURE__ */ e.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: i.accessibility.enableKeyboardShortcuts,
                  onChange: (t) => s("accessibility", "enableKeyboardShortcuts", t.target.checked)
                }
              ),
              /* @__PURE__ */ e.jsx("span", { children: "Enable Keyboard Shortcuts" })
            ] }),
            /* @__PURE__ */ e.jsxs("label", { style: { display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }, children: [
              /* @__PURE__ */ e.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: i.accessibility.showTooltips,
                  onChange: (t) => s("accessibility", "showTooltips", t.target.checked)
                }
              ),
              /* @__PURE__ */ e.jsx("span", { children: "Show Helpful Tooltips" })
            ] })
          ] })
        ] })
      ] }),
      o === "ai" && /* @__PURE__ */ e.jsxs("div", { children: [
        /* @__PURE__ */ e.jsx("h2", { style: { margin: "0 0 20px", fontSize: "20px", color: "#333" }, children: "🧠 AI Processing Preferences" }),
        /* @__PURE__ */ e.jsx("div", { style: { display: "grid", gap: "20px" }, children: /* @__PURE__ */ e.jsxs("section", { children: [
          /* @__PURE__ */ e.jsx("h3", { style: { margin: "0 0 12px", fontSize: "16px", color: "#555" }, children: "📝 Text Processing" }),
          /* @__PURE__ */ e.jsxs("div", { style: { marginBottom: "16px" }, children: [
            /* @__PURE__ */ e.jsx("label", { style: { display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }, children: "Default Simplification Level" }),
            /* @__PURE__ */ e.jsxs(
              "select",
              {
                value: i.aiPreferences.defaultSimplificationLevel,
                onChange: (t) => s("aiPreferences", "defaultSimplificationLevel", t.target.value),
                style: { padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px" },
                children: [
                  /* @__PURE__ */ e.jsx("option", { value: "light", children: "Light - Minor improvements" }),
                  /* @__PURE__ */ e.jsx("option", { value: "medium", children: "Medium - Balanced simplification" }),
                  /* @__PURE__ */ e.jsx("option", { value: "heavy", children: "Heavy - Maximum simplification" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ e.jsxs("div", { style: { marginBottom: "16px" }, children: [
            /* @__PURE__ */ e.jsx("label", { style: { display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }, children: "Preferred Language" }),
            /* @__PURE__ */ e.jsxs(
              "select",
              {
                value: i.aiPreferences.preferredLanguage,
                onChange: (t) => s("aiPreferences", "preferredLanguage", t.target.value),
                style: { padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px" },
                children: [
                  /* @__PURE__ */ e.jsx("option", { value: "en", children: "English" }),
                  /* @__PURE__ */ e.jsx("option", { value: "es", children: "Spanish" }),
                  /* @__PURE__ */ e.jsx("option", { value: "fr", children: "French" }),
                  /* @__PURE__ */ e.jsx("option", { value: "de", children: "German" }),
                  /* @__PURE__ */ e.jsx("option", { value: "it", children: "Italian" }),
                  /* @__PURE__ */ e.jsx("option", { value: "pt", children: "Portuguese" }),
                  /* @__PURE__ */ e.jsx("option", { value: "zh", children: "Chinese" }),
                  /* @__PURE__ */ e.jsx("option", { value: "ja", children: "Japanese" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ e.jsxs("label", { style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", cursor: "pointer" }, children: [
            /* @__PURE__ */ e.jsx(
              "input",
              {
                type: "checkbox",
                checked: i.aiPreferences.autoDetectLanguage,
                onChange: (t) => s("aiPreferences", "autoDetectLanguage", t.target.checked)
              }
            ),
            /* @__PURE__ */ e.jsx("span", { children: "Auto-detect text language" })
          ] }),
          /* @__PURE__ */ e.jsxs("label", { style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", cursor: "pointer" }, children: [
            /* @__PURE__ */ e.jsx(
              "input",
              {
                type: "checkbox",
                checked: i.aiPreferences.enableSmartSuggestions,
                onChange: (t) => s("aiPreferences", "enableSmartSuggestions", t.target.checked)
              }
            ),
            /* @__PURE__ */ e.jsx("span", { children: "Enable smart content suggestions" })
          ] }),
          /* @__PURE__ */ e.jsxs("label", { style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", cursor: "pointer" }, children: [
            /* @__PURE__ */ e.jsx(
              "input",
              {
                type: "checkbox",
                checked: i.aiPreferences.processOnSelect,
                onChange: (t) => s("aiPreferences", "processOnSelect", t.target.checked)
              }
            ),
            /* @__PURE__ */ e.jsx("span", { children: "Auto-process text when selected" })
          ] }),
          /* @__PURE__ */ e.jsxs("label", { style: { display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }, children: [
            /* @__PURE__ */ e.jsx(
              "input",
              {
                type: "checkbox",
                checked: i.aiPreferences.showConfidenceScores,
                onChange: (t) => s("aiPreferences", "showConfidenceScores", t.target.checked)
              }
            ),
            /* @__PURE__ */ e.jsx("span", { children: "Show AI confidence scores" })
          ] })
        ] }) })
      ] }),
      o === "interface" && /* @__PURE__ */ e.jsxs("div", { children: [
        /* @__PURE__ */ e.jsx("h2", { style: { margin: "0 0 20px", fontSize: "20px", color: "#333" }, children: "🎨 Interface & Experience" }),
        /* @__PURE__ */ e.jsxs("div", { style: { display: "grid", gap: "20px" }, children: [
          /* @__PURE__ */ e.jsxs("section", { children: [
            /* @__PURE__ */ e.jsx("h3", { style: { margin: "0 0 12px", fontSize: "16px", color: "#555" }, children: "🎨 Appearance" }),
            /* @__PURE__ */ e.jsxs("div", { style: { marginBottom: "16px" }, children: [
              /* @__PURE__ */ e.jsx("label", { style: { display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }, children: "Theme" }),
              /* @__PURE__ */ e.jsxs(
                "select",
                {
                  value: i.interface.theme,
                  onChange: (t) => s("interface", "theme", t.target.value),
                  style: { padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px" },
                  children: [
                    /* @__PURE__ */ e.jsx("option", { value: "light", children: "Light" }),
                    /* @__PURE__ */ e.jsx("option", { value: "dark", children: "Dark" }),
                    /* @__PURE__ */ e.jsx("option", { value: "auto", children: "Auto (Follow system)" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ e.jsxs("div", { style: { marginBottom: "16px" }, children: [
              /* @__PURE__ */ e.jsx("label", { style: { display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }, children: "Sidebar Position" }),
              /* @__PURE__ */ e.jsxs(
                "select",
                {
                  value: i.interface.sidebarPosition,
                  onChange: (t) => s("interface", "sidebarPosition", t.target.value),
                  style: { padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px" },
                  children: [
                    /* @__PURE__ */ e.jsx("option", { value: "left", children: "Left Side" }),
                    /* @__PURE__ */ e.jsx("option", { value: "right", children: "Right Side" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ e.jsxs("label", { style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", cursor: "pointer" }, children: [
              /* @__PURE__ */ e.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: i.interface.compactMode,
                  onChange: (t) => s("interface", "compactMode", t.target.checked)
                }
              ),
              /* @__PURE__ */ e.jsx("span", { children: "Compact interface mode" })
            ] }),
            /* @__PURE__ */ e.jsxs("label", { style: { display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }, children: [
              /* @__PURE__ */ e.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: i.interface.enableAnimations,
                  onChange: (t) => s("interface", "enableAnimations", t.target.checked)
                }
              ),
              /* @__PURE__ */ e.jsx("span", { children: "Enable smooth animations" })
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("section", { children: [
            /* @__PURE__ */ e.jsx("h3", { style: { margin: "0 0 12px", fontSize: "16px", color: "#555" }, children: "📢 Notifications" }),
            /* @__PURE__ */ e.jsxs("div", { style: { marginBottom: "16px" }, children: [
              /* @__PURE__ */ e.jsx("label", { style: { display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }, children: "Notification Level" }),
              /* @__PURE__ */ e.jsxs(
                "select",
                {
                  value: i.interface.notificationLevel,
                  onChange: (t) => s("interface", "notificationLevel", t.target.value),
                  style: { padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px" },
                  children: [
                    /* @__PURE__ */ e.jsx("option", { value: "all", children: "All notifications" }),
                    /* @__PURE__ */ e.jsx("option", { value: "important", children: "Important only" }),
                    /* @__PURE__ */ e.jsx("option", { value: "none", children: "No notifications" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ e.jsxs("label", { style: { display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }, children: [
              /* @__PURE__ */ e.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: i.interface.autoSaveResults,
                  onChange: (t) => s("interface", "autoSaveResults", t.target.checked)
                }
              ),
              /* @__PURE__ */ e.jsx("span", { children: "Auto-save processed results" })
            ] })
          ] })
        ] })
      ] }),
      o === "privacy" && /* @__PURE__ */ e.jsxs("div", { children: [
        /* @__PURE__ */ e.jsx("h2", { style: { margin: "0 0 20px", fontSize: "20px", color: "#333" }, children: "🔒 Privacy & Data" }),
        /* @__PURE__ */ e.jsxs("div", { style: { display: "grid", gap: "20px" }, children: [
          /* @__PURE__ */ e.jsxs("section", { children: [
            /* @__PURE__ */ e.jsx("h3", { style: { margin: "0 0 12px", fontSize: "16px", color: "#555" }, children: "📊 Data Storage" }),
            /* @__PURE__ */ e.jsxs("label", { style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", cursor: "pointer" }, children: [
              /* @__PURE__ */ e.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: i.privacy.saveHistory,
                  onChange: (t) => s("privacy", "saveHistory", t.target.checked)
                }
              ),
              /* @__PURE__ */ e.jsx("span", { children: "Save processing history" })
            ] }),
            i.privacy.saveHistory && /* @__PURE__ */ e.jsxs("div", { style: { marginBottom: "16px" }, children: [
              /* @__PURE__ */ e.jsxs("label", { style: { display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: 500 }, children: [
                "Maximum History Items: ",
                i.privacy.maxHistoryItems
              ] }),
              /* @__PURE__ */ e.jsx(
                "input",
                {
                  type: "range",
                  min: "10",
                  max: "500",
                  step: "10",
                  value: i.privacy.maxHistoryItems,
                  onChange: (t) => s("privacy", "maxHistoryItems", parseInt(t.target.value)),
                  style: { width: "100%" }
                }
              ),
              /* @__PURE__ */ e.jsxs("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#666" }, children: [
                /* @__PURE__ */ e.jsx("span", { children: "10 items" }),
                /* @__PURE__ */ e.jsx("span", { children: "500 items" })
              ] })
            ] }),
            /* @__PURE__ */ e.jsxs("label", { style: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", cursor: "pointer" }, children: [
              /* @__PURE__ */ e.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: i.privacy.enableAnalytics,
                  onChange: (t) => s("privacy", "enableAnalytics", t.target.checked)
                }
              ),
              /* @__PURE__ */ e.jsx("span", { children: "Enable usage analytics (helps improve the extension)" })
            ] }),
            /* @__PURE__ */ e.jsxs("label", { style: { display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }, children: [
              /* @__PURE__ */ e.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: i.privacy.shareUsageStats,
                  onChange: (t) => s("privacy", "shareUsageStats", t.target.checked)
                }
              ),
              /* @__PURE__ */ e.jsx("span", { children: "Share anonymous usage statistics" })
            ] })
          ] }),
          /* @__PURE__ */ e.jsxs("section", { style: { background: "#f0f7ff", padding: "16px", borderRadius: "8px", border: "1px solid #e0f0ff" }, children: [
            /* @__PURE__ */ e.jsx("h4", { style: { margin: "0 0 8px", fontSize: "14px", color: "#1e40af" }, children: "🔒 Privacy Guarantee" }),
            /* @__PURE__ */ e.jsx("p", { style: { margin: 0, fontSize: "13px", color: "#1e40af", lineHeight: "1.4" }, children: "All AI processing happens locally on your device using Chrome's Built-in AI APIs. Your text content is never sent to external servers. This extension respects your privacy completely." })
          ] })
        ] })
      ] }),
      o === "keyboard" && /* @__PURE__ */ e.jsxs("div", { children: [
        /* @__PURE__ */ e.jsx("h2", { style: { margin: "0 0 20px", fontSize: "20px", color: "#333" }, children: "⌨️ Keyboard Shortcuts" }),
        /* @__PURE__ */ e.jsxs("div", { style: { display: "grid", gap: "16px" }, children: [
          [
            { shortcut: "Alt + S", action: "Simplify selected text", description: "Makes text easier to understand" },
            { shortcut: "Alt + P", action: "Proofread selected text", description: "Corrects grammar and spelling" },
            { shortcut: "Alt + T", action: "Translate selected text", description: "Translates to your preferred language" },
            { shortcut: "Alt + R", action: "Rewrite selected text", description: "Improves clarity and tone" },
            { shortcut: "Alt + L", action: "Listen to selected text", description: "Reads text aloud using text-to-speech" },
            { shortcut: "Alt + E", action: "Explain selected text", description: "Provides detailed explanations" },
            { shortcut: "Alt + Shift + S", action: "Toggle sidebar", description: "Shows/hides the AI assistant sidebar" },
            { shortcut: "Escape", action: "Close sidebar or notifications", description: "Dismisses open interface elements" }
          ].map((t, n) => /* @__PURE__ */ e.jsxs(
            "div",
            {
              style: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px",
                background: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #e0e0e0"
              },
              children: [
                /* @__PURE__ */ e.jsxs("div", { style: { flex: 1 }, children: [
                  /* @__PURE__ */ e.jsx("div", { style: { fontWeight: 600, fontSize: "14px", marginBottom: "4px" }, children: t.action }),
                  /* @__PURE__ */ e.jsx("div", { style: { fontSize: "12px", color: "#666" }, children: t.description })
                ] }),
                /* @__PURE__ */ e.jsx("code", { style: {
                  padding: "6px 12px",
                  background: "#e0e7ff",
                  color: "#3730a3",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600
                }, children: t.shortcut })
              ]
            },
            n
          )),
          /* @__PURE__ */ e.jsxs("div", { style: { background: "#fffbeb", padding: "16px", borderRadius: "8px", border: "1px solid #fbbf24" }, children: [
            /* @__PURE__ */ e.jsx("h4", { style: { margin: "0 0 8px", fontSize: "14px", color: "#92400e" }, children: "💡 Pro Tips" }),
            /* @__PURE__ */ e.jsxs("ul", { style: { margin: 0, paddingLeft: "16px", fontSize: "13px", color: "#92400e" }, children: [
              /* @__PURE__ */ e.jsx("li", { children: "Select any text on a webpage first, then use shortcuts" }),
              /* @__PURE__ */ e.jsx("li", { children: "Shortcuts work on any website - no setup required" }),
              /* @__PURE__ */ e.jsx("li", { children: "Use Escape key to quickly close any open interface" }),
              /* @__PURE__ */ e.jsx("li", { children: "Keyboard shortcuts can be disabled in Accessibility settings" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { style: { display: "flex", gap: "12px", justifyContent: "center", marginTop: "24px", flexWrap: "wrap" }, children: [
      /* @__PURE__ */ e.jsx(
        "button",
        {
          onClick: v,
          disabled: l === "saving",
          style: {
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            background: l === "saving" ? "#ccc" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            fontSize: "14px",
            fontWeight: 600,
            cursor: l === "saving" ? "not-allowed" : "pointer",
            minWidth: "120px"
          },
          children: l === "saving" ? "💾 Saving..." : l === "saved" ? "✅ Saved!" : l === "error" ? "❌ Error" : "💾 Save Settings"
        }
      ),
      /* @__PURE__ */ e.jsx(
        "button",
        {
          onClick: C,
          style: {
            padding: "12px 24px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            background: "white",
            color: "#666",
            fontSize: "14px",
            cursor: "pointer"
          },
          children: "🔄 Reset to Defaults"
        }
      ),
      /* @__PURE__ */ e.jsx(
        "button",
        {
          onClick: w,
          style: {
            padding: "12px 24px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            background: "white",
            color: "#666",
            fontSize: "14px",
            cursor: "pointer"
          },
          children: "📥 Export Settings"
        }
      ),
      /* @__PURE__ */ e.jsxs("label", { style: {
        padding: "12px 24px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        background: "white",
        color: "#666",
        fontSize: "14px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center"
      }, children: [
        "📤 Import Settings",
        /* @__PURE__ */ e.jsx(
          "input",
          {
            type: "file",
            accept: ".json",
            onChange: I,
            style: { display: "none" }
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ e.jsx("footer", { style: { textAlign: "center", marginTop: "40px", fontSize: "12px", color: "#666" }, children: /* @__PURE__ */ e.jsx("p", { children: "Accessible Web Extension • Privacy-First AI • Made with ❤️ for everyone" }) })
  ] });
}, b = document.getElementById("options-root");
b && R(b).render(/* @__PURE__ */ e.jsx(T, {}));
