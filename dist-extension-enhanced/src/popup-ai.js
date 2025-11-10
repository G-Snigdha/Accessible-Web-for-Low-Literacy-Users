import { c as k, j as e, r as c } from "./client-Cz3TYUeU.js";
import { chromeAI as s } from "./chromeAI.js";
/* empty css                   */
const S = () => {
  const [t, a] = c.useState({
    activeFeature: "prompt",
    inputText: "",
    outputText: "",
    isProcessing: !1,
    aiAvailability: null,
    promptSystemPrompt: "You are a helpful AI assistant.",
    promptTemperature: 0.7,
    summaryType: "tl;dr",
    summaryLength: "short",
    writerTone: "neutral",
    writerLength: "medium",
    rewriterTone: "as-is",
    rewriterLength: "as-is",
    sourceLang: "en",
    targetLang: "",
    // Start with no target language selected
    correctGrammar: !0,
    correctSpelling: !0,
    improvePunctuation: !0
  }), u = c.useRef(null);
  c.useEffect(() => {
    m(), f();
  }, []);
  const m = async () => {
    const r = await s.checkAvailability();
    a((i) => ({ ...i, aiAvailability: r })), r.isAnyAvailable || a((i) => ({
      ...i,
      outputText: `⚠️ Chrome Built-in AI APIs are not available.

Please ensure you:
1. Use Chrome Dev or Canary (v127+)
2. Enable chrome://flags/#optimization-guide-on-device-model
3. Enable chrome://flags/#prompt-api-for-gemini-nano
4. Sign up for Early Preview Program`
    }));
  }, f = () => {
    chrome.storage.local.get(["lastInputText", "lastOutputText"], (r) => {
      r.lastInputText && a((i) => ({ ...i, inputText: r.lastInputText })), r.lastOutputText && a((i) => ({ ...i, outputText: r.lastOutputText }));
    });
  }, x = (r, i) => {
    chrome.storage.local.set({
      lastInputText: r,
      lastOutputText: i
    });
  }, v = async () => {
    if (!t.inputText.trim()) {
      alert("Please enter some text to process");
      return;
    }
    a((r) => ({ ...r, isProcessing: !0, outputText: "Processing..." }));
    try {
      let r;
      switch (t.activeFeature) {
        case "prompt":
          r = await s.prompt(t.inputText, {
            systemPrompt: t.promptSystemPrompt,
            temperature: t.promptTemperature
          });
          break;
        case "summarize":
          r = await s.summarize(t.inputText, {
            type: t.summaryType,
            length: t.summaryLength,
            format: "plain-text"
          });
          break;
        case "write":
          r = await s.write(t.inputText, {
            tone: t.writerTone,
            length: t.writerLength,
            format: "plain-text"
          });
          break;
        case "rewrite":
          r = await s.rewrite(t.inputText, {
            tone: t.rewriterTone,
            length: t.rewriterLength
          });
          break;
        case "translate":
          if (!t.targetLang) {
            a((o) => ({
              ...o,
              outputText: "⚠️ Please select a target language first!",
              isProcessing: !1
            }));
            return;
          }
          if (t.sourceLang === t.targetLang) {
            a((o) => ({
              ...o,
              outputText: "⚠️ Source and target languages must be different!",
              isProcessing: !1
            }));
            return;
          }
          r = await s.translate(t.inputText, {
            sourceLanguage: t.sourceLang,
            targetLanguage: t.targetLang
          });
          break;
        case "proofread":
          const i = await s.proofread(t.inputText, {
            correctGrammar: t.correctGrammar,
            correctSpelling: t.correctSpelling,
            improvePunctuation: t.improvePunctuation
          });
          if (i.success && i.data) {
            const { correctedText: o, corrections: p } = i.data, d = p && p.length > 0 ? `

📝 Corrections made:
` + p.map(
              (n) => `• "${n.original}" → "${n.corrected}" (${n.reason})`
            ).join(`
`) : `

✅ No corrections needed! Your text looks great.`;
            a((n) => ({
              ...n,
              outputText: o + d,
              isProcessing: !1
            })), x(t.inputText, o);
            return;
          } else {
            a((o) => ({
              ...o,
              outputText: `❌ Proofreader Error: ${i.error || "Unknown error"}

💡 Note: Proofreader uses Prompt API. Make sure Prompt API is available (check the 🟢 indicator). If Prompt works but Proofreader doesn't, the AI might be having trouble with the response format. Try shorter text or simpler sentences.`,
              isProcessing: !1
            }));
            return;
          }
          break;
      }
      if (r.success && r.data) {
        const i = typeof r.data == "string" ? r.data : "No output generated";
        a((o) => ({
          ...o,
          outputText: i,
          isProcessing: !1
        })), x(t.inputText, i);
      } else
        a((i) => ({
          ...i,
          outputText: `❌ Error: ${r.error || "Unknown error occurred"}`,
          isProcessing: !1
        }));
    } catch (r) {
      a((i) => ({
        ...i,
        outputText: `❌ Error: ${r instanceof Error ? r.message : "Unknown error"}`,
        isProcessing: !1
      }));
    }
  }, y = (r) => {
    var o;
    const i = (o = r.target.files) == null ? void 0 : o[0];
    if (i)
      if (i.type === "text/plain" || i.name.endsWith(".txt")) {
        const p = new FileReader();
        p.onload = (d) => {
          var g;
          const n = (g = d.target) == null ? void 0 : g.result;
          a((T) => ({ ...T, inputText: n }));
        }, p.readAsText(i);
      } else i.type.startsWith("image/") ? alert("Image input support coming soon with multimodal Prompt API!") : alert("Please upload a text file or image");
  }, b = () => {
    navigator.clipboard.writeText(t.outputText);
    const r = document.getElementById("copy-btn");
    if (r) {
      const i = r.textContent;
      r.textContent = "✅ Copied!", setTimeout(() => {
        r.textContent = i;
      }, 1500);
    }
  }, l = (r) => {
    if (!t.aiAvailability) return null;
    const i = t.aiAvailability[r];
    if (typeof i != "string") return null;
    const o = {
      readily: "🟢",
      "after-download": "🟡",
      no: "🔴",
      "not-supported": "⚫"
    };
    return /* @__PURE__ */ e.jsx("span", { title: i, children: o[i] });
  }, j = {
    prompt: "Write a creative story about a robot learning to paint.",
    summarize: "Artificial intelligence is transforming the way we interact with technology. From voice assistants to recommendation systems, AI is becoming increasingly integrated into our daily lives. Machine learning algorithms can now process vast amounts of data to identify patterns and make predictions. Deep learning, a subset of machine learning, uses neural networks to model complex relationships in data. As AI continues to advance, it raises important questions about ethics, privacy, and the future of work. Companies are investing billions in AI research, and governments are developing policies to regulate its use. The potential applications of AI are vast, ranging from healthcare diagnostics to autonomous vehicles, and from climate modeling to personalized education.",
    write: "Write a professional email requesting a meeting with a potential client",
    rewrite: "The thing is, like, we really gotta meet up soon to talk about the project stuff, you know?",
    translate: "Hello, how are you today? I hope you are having a wonderful day!",
    proofread: "Me and my frend went to the stor yesterday. We buyed some apples and orangs. Its was a nice day out their."
  }, w = () => {
    a((r) => ({
      ...r,
      inputText: j[t.activeFeature]
    }));
  };
  return /* @__PURE__ */ e.jsxs("div", { className: "extension-popup ai-popup", style: { width: "500px", maxHeight: "600px", overflowY: "auto" }, children: [
    /* @__PURE__ */ e.jsxs("header", { style: { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white", padding: "16px", marginBottom: "16px" }, children: [
      /* @__PURE__ */ e.jsx("h1", { style: { margin: 0, fontSize: "18px", fontWeight: 600 }, children: "🧠 Chrome Built-in AI Challenge 2025" }),
      /* @__PURE__ */ e.jsx("p", { style: { margin: "4px 0 0", fontSize: "12px", opacity: 0.9 }, children: "Powered by Gemini Nano • 100% Client-Side • Privacy-First" })
    ] }),
    /* @__PURE__ */ e.jsxs("div", { style: { display: "flex", gap: "8px", padding: "0 16px", marginBottom: "16px", overflowX: "auto" }, children: [
      /* @__PURE__ */ e.jsxs(
        "button",
        {
          onClick: () => a((r) => ({ ...r, activeFeature: "prompt" })),
          className: t.activeFeature === "prompt" ? "active" : "",
          style: {
            padding: "8px 12px",
            borderRadius: "8px",
            border: "none",
            background: t.activeFeature === "prompt" ? "#667eea" : "#f0f0f0",
            color: t.activeFeature === "prompt" ? "white" : "#333",
            cursor: "pointer",
            fontSize: "13px",
            whiteSpace: "nowrap"
          },
          children: [
            "💭 Prompt ",
            l("promptAPI")
          ]
        }
      ),
      /* @__PURE__ */ e.jsxs(
        "button",
        {
          onClick: () => a((r) => ({ ...r, activeFeature: "summarize" })),
          className: t.activeFeature === "summarize" ? "active" : "",
          style: {
            padding: "8px 12px",
            borderRadius: "8px",
            border: "none",
            background: t.activeFeature === "summarize" ? "#667eea" : "#f0f0f0",
            color: t.activeFeature === "summarize" ? "white" : "#333",
            cursor: "pointer",
            fontSize: "13px",
            whiteSpace: "nowrap"
          },
          children: [
            "📄 Summarize ",
            l("summarizerAPI")
          ]
        }
      ),
      /* @__PURE__ */ e.jsxs(
        "button",
        {
          onClick: () => a((r) => ({ ...r, activeFeature: "write" })),
          className: t.activeFeature === "write" ? "active" : "",
          style: {
            padding: "8px 12px",
            borderRadius: "8px",
            border: "none",
            background: t.activeFeature === "write" ? "#667eea" : "#f0f0f0",
            color: t.activeFeature === "write" ? "white" : "#333",
            cursor: "pointer",
            fontSize: "13px",
            whiteSpace: "nowrap"
          },
          children: [
            "✏️ Write ",
            l("writerAPI")
          ]
        }
      ),
      /* @__PURE__ */ e.jsxs(
        "button",
        {
          onClick: () => a((r) => ({ ...r, activeFeature: "rewrite" })),
          className: t.activeFeature === "rewrite" ? "active" : "",
          style: {
            padding: "8px 12px",
            borderRadius: "8px",
            border: "none",
            background: t.activeFeature === "rewrite" ? "#667eea" : "#f0f0f0",
            color: t.activeFeature === "rewrite" ? "white" : "#333",
            cursor: "pointer",
            fontSize: "13px",
            whiteSpace: "nowrap"
          },
          children: [
            "🖊️ Rewrite ",
            l("rewriterAPI")
          ]
        }
      ),
      /* @__PURE__ */ e.jsxs(
        "button",
        {
          onClick: () => a((r) => ({ ...r, activeFeature: "translate" })),
          className: t.activeFeature === "translate" ? "active" : "",
          style: {
            padding: "8px 12px",
            borderRadius: "8px",
            border: "none",
            background: t.activeFeature === "translate" ? "#667eea" : "#f0f0f0",
            color: t.activeFeature === "translate" ? "white" : "#333",
            cursor: "pointer",
            fontSize: "13px",
            whiteSpace: "nowrap"
          },
          children: [
            "🌐 Translate ",
            l("translatorAPI")
          ]
        }
      ),
      /* @__PURE__ */ e.jsxs(
        "button",
        {
          onClick: () => a((r) => ({ ...r, activeFeature: "proofread" })),
          className: t.activeFeature === "proofread" ? "active" : "",
          style: {
            padding: "8px 12px",
            borderRadius: "8px",
            border: "none",
            background: t.activeFeature === "proofread" ? "#667eea" : "#f0f0f0",
            color: t.activeFeature === "proofread" ? "white" : "#333",
            cursor: "pointer",
            fontSize: "13px",
            whiteSpace: "nowrap"
          },
          children: [
            "🔤 Proofread ",
            l("proofreaderAPI")
          ]
        }
      )
    ] }),
    /* @__PURE__ */ e.jsxs("div", { style: { padding: "0 16px" }, children: [
      t.activeFeature === "prompt" && /* @__PURE__ */ e.jsxs("div", { style: { marginBottom: "12px", padding: "12px", background: "#f8f9fa", borderRadius: "8px" }, children: [
        /* @__PURE__ */ e.jsx("label", { style: { display: "block", fontSize: "12px", marginBottom: "4px", fontWeight: 500 }, children: "System Prompt:" }),
        /* @__PURE__ */ e.jsx(
          "input",
          {
            type: "text",
            value: t.promptSystemPrompt,
            onChange: (r) => a((i) => ({ ...i, promptSystemPrompt: r.target.value })),
            style: { width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "12px" }
          }
        ),
        /* @__PURE__ */ e.jsxs("label", { style: { display: "block", fontSize: "12px", marginTop: "8px", marginBottom: "4px", fontWeight: 500 }, children: [
          "Temperature: ",
          t.promptTemperature
        ] }),
        /* @__PURE__ */ e.jsx(
          "input",
          {
            type: "range",
            min: "0",
            max: "1",
            step: "0.1",
            value: t.promptTemperature,
            onChange: (r) => a((i) => ({ ...i, promptTemperature: parseFloat(r.target.value) })),
            style: { width: "100%" }
          }
        )
      ] }),
      t.activeFeature === "summarize" && /* @__PURE__ */ e.jsxs("div", { style: { marginBottom: "12px", padding: "12px", background: "#f8f9fa", borderRadius: "8px", display: "flex", gap: "12px" }, children: [
        /* @__PURE__ */ e.jsxs("div", { style: { flex: 1 }, children: [
          /* @__PURE__ */ e.jsx("label", { style: { display: "block", fontSize: "12px", marginBottom: "4px", fontWeight: 500 }, children: "Type:" }),
          /* @__PURE__ */ e.jsxs(
            "select",
            {
              value: t.summaryType,
              onChange: (r) => a((i) => ({ ...i, summaryType: r.target.value })),
              style: { width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "12px" },
              children: [
                /* @__PURE__ */ e.jsx("option", { value: "tl;dr", children: "TL;DR" }),
                /* @__PURE__ */ e.jsx("option", { value: "key-points", children: "Key Points" }),
                /* @__PURE__ */ e.jsx("option", { value: "teaser", children: "Teaser" }),
                /* @__PURE__ */ e.jsx("option", { value: "headline", children: "Headline" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ e.jsxs("div", { style: { flex: 1 }, children: [
          /* @__PURE__ */ e.jsx("label", { style: { display: "block", fontSize: "12px", marginBottom: "4px", fontWeight: 500 }, children: "Length:" }),
          /* @__PURE__ */ e.jsxs(
            "select",
            {
              value: t.summaryLength,
              onChange: (r) => a((i) => ({ ...i, summaryLength: r.target.value })),
              style: { width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "12px" },
              children: [
                /* @__PURE__ */ e.jsx("option", { value: "short", children: "Short" }),
                /* @__PURE__ */ e.jsx("option", { value: "medium", children: "Medium" }),
                /* @__PURE__ */ e.jsx("option", { value: "long", children: "Long" })
              ]
            }
          )
        ] })
      ] }),
      t.activeFeature === "write" && /* @__PURE__ */ e.jsxs("div", { style: { marginBottom: "12px", padding: "12px", background: "#f8f9fa", borderRadius: "8px", display: "flex", gap: "12px" }, children: [
        /* @__PURE__ */ e.jsxs("div", { style: { flex: 1 }, children: [
          /* @__PURE__ */ e.jsx("label", { style: { display: "block", fontSize: "12px", marginBottom: "4px", fontWeight: 500 }, children: "Tone:" }),
          /* @__PURE__ */ e.jsxs(
            "select",
            {
              value: t.writerTone,
              onChange: (r) => a((i) => ({ ...i, writerTone: r.target.value })),
              style: { width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "12px" },
              children: [
                /* @__PURE__ */ e.jsx("option", { value: "formal", children: "Formal" }),
                /* @__PURE__ */ e.jsx("option", { value: "neutral", children: "Neutral" }),
                /* @__PURE__ */ e.jsx("option", { value: "casual", children: "Casual" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ e.jsxs("div", { style: { flex: 1 }, children: [
          /* @__PURE__ */ e.jsx("label", { style: { display: "block", fontSize: "12px", marginBottom: "4px", fontWeight: 500 }, children: "Length:" }),
          /* @__PURE__ */ e.jsxs(
            "select",
            {
              value: t.writerLength,
              onChange: (r) => a((i) => ({ ...i, writerLength: r.target.value })),
              style: { width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "12px" },
              children: [
                /* @__PURE__ */ e.jsx("option", { value: "short", children: "Short" }),
                /* @__PURE__ */ e.jsx("option", { value: "medium", children: "Medium" }),
                /* @__PURE__ */ e.jsx("option", { value: "long", children: "Long" })
              ]
            }
          )
        ] })
      ] }),
      t.activeFeature === "rewrite" && /* @__PURE__ */ e.jsxs("div", { style: { marginBottom: "12px", padding: "12px", background: "#f8f9fa", borderRadius: "8px", display: "flex", gap: "12px" }, children: [
        /* @__PURE__ */ e.jsxs("div", { style: { flex: 1 }, children: [
          /* @__PURE__ */ e.jsx("label", { style: { display: "block", fontSize: "12px", marginBottom: "4px", fontWeight: 500 }, children: "Tone:" }),
          /* @__PURE__ */ e.jsxs(
            "select",
            {
              value: t.rewriterTone,
              onChange: (r) => a((i) => ({ ...i, rewriterTone: r.target.value })),
              style: { width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "12px" },
              children: [
                /* @__PURE__ */ e.jsx("option", { value: "as-is", children: "As-Is" }),
                /* @__PURE__ */ e.jsx("option", { value: "more-formal", children: "More Formal" }),
                /* @__PURE__ */ e.jsx("option", { value: "more-casual", children: "More Casual" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ e.jsxs("div", { style: { flex: 1 }, children: [
          /* @__PURE__ */ e.jsx("label", { style: { display: "block", fontSize: "12px", marginBottom: "4px", fontWeight: 500 }, children: "Length:" }),
          /* @__PURE__ */ e.jsxs(
            "select",
            {
              value: t.rewriterLength,
              onChange: (r) => a((i) => ({ ...i, rewriterLength: r.target.value })),
              style: { width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "12px" },
              children: [
                /* @__PURE__ */ e.jsx("option", { value: "as-is", children: "As-Is" }),
                /* @__PURE__ */ e.jsx("option", { value: "shorter", children: "Shorter" }),
                /* @__PURE__ */ e.jsx("option", { value: "longer", children: "Longer" })
              ]
            }
          )
        ] })
      ] }),
      t.activeFeature === "translate" && /* @__PURE__ */ e.jsxs("div", { style: { marginBottom: "12px", padding: "12px", background: "#f8f9fa", borderRadius: "8px", display: "flex", gap: "12px" }, children: [
        /* @__PURE__ */ e.jsxs("div", { style: { flex: 1 }, children: [
          /* @__PURE__ */ e.jsx("label", { style: { display: "block", fontSize: "12px", marginBottom: "4px", fontWeight: 500 }, children: "From:" }),
          /* @__PURE__ */ e.jsxs(
            "select",
            {
              value: t.sourceLang,
              onChange: (r) => a((i) => ({ ...i, sourceLang: r.target.value })),
              style: { width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "12px" },
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
        /* @__PURE__ */ e.jsxs("div", { style: { flex: 1 }, children: [
          /* @__PURE__ */ e.jsx("label", { style: { display: "block", fontSize: "12px", marginBottom: "4px", fontWeight: 500 }, children: "To:" }),
          /* @__PURE__ */ e.jsxs(
            "select",
            {
              value: t.targetLang,
              onChange: (r) => a((i) => ({ ...i, targetLang: r.target.value })),
              style: { width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #ddd", fontSize: "12px" },
              children: [
                /* @__PURE__ */ e.jsx("option", { value: "", children: "-- Select Language --" }),
                /* @__PURE__ */ e.jsx("option", { value: "en", children: "English" }),
                /* @__PURE__ */ e.jsx("option", { value: "es", children: "Spanish" }),
                /* @__PURE__ */ e.jsx("option", { value: "fr", children: "French" }),
                /* @__PURE__ */ e.jsx("option", { value: "de", children: "German" }),
                /* @__PURE__ */ e.jsx("option", { value: "it", children: "Italian" }),
                /* @__PURE__ */ e.jsx("option", { value: "pt", children: "Portuguese" }),
                /* @__PURE__ */ e.jsx("option", { value: "zh", children: "Chinese" }),
                /* @__PURE__ */ e.jsx("option", { value: "ja", children: "Japanese" }),
                /* @__PURE__ */ e.jsx("option", { value: "ko", children: "Korean" }),
                /* @__PURE__ */ e.jsx("option", { value: "ar", children: "Arabic" }),
                /* @__PURE__ */ e.jsx("option", { value: "ru", children: "Russian" }),
                /* @__PURE__ */ e.jsx("option", { value: "hi", children: "Hindi" })
              ]
            }
          )
        ] })
      ] }),
      t.activeFeature === "proofread" && /* @__PURE__ */ e.jsxs("div", { style: { marginBottom: "12px", padding: "12px", background: "#f8f9fa", borderRadius: "8px" }, children: [
        /* @__PURE__ */ e.jsxs("label", { style: { display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", marginBottom: "4px" }, children: [
          /* @__PURE__ */ e.jsx(
            "input",
            {
              type: "checkbox",
              checked: t.correctGrammar,
              onChange: (r) => a((i) => ({ ...i, correctGrammar: r.target.checked }))
            }
          ),
          "Correct Grammar"
        ] }),
        /* @__PURE__ */ e.jsxs("label", { style: { display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", marginBottom: "4px" }, children: [
          /* @__PURE__ */ e.jsx(
            "input",
            {
              type: "checkbox",
              checked: t.correctSpelling,
              onChange: (r) => a((i) => ({ ...i, correctSpelling: r.target.checked }))
            }
          ),
          "Correct Spelling"
        ] }),
        /* @__PURE__ */ e.jsxs("label", { style: { display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }, children: [
          /* @__PURE__ */ e.jsx(
            "input",
            {
              type: "checkbox",
              checked: t.improvePunctuation,
              onChange: (r) => a((i) => ({ ...i, improvePunctuation: r.target.checked }))
            }
          ),
          "Improve Punctuation"
        ] })
      ] }),
      /* @__PURE__ */ e.jsxs("div", { style: { marginBottom: "12px" }, children: [
        /* @__PURE__ */ e.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }, children: [
          /* @__PURE__ */ e.jsx("label", { style: { fontSize: "13px", fontWeight: 500 }, children: "Input:" }),
          /* @__PURE__ */ e.jsxs("div", { style: { display: "flex", gap: "8px" }, children: [
            /* @__PURE__ */ e.jsx(
              "button",
              {
                onClick: w,
                style: {
                  padding: "4px 8px",
                  fontSize: "11px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: "pointer"
                },
                children: "📝 Load Example"
              }
            ),
            /* @__PURE__ */ e.jsx(
              "input",
              {
                ref: u,
                type: "file",
                accept: "text/*,image/*",
                onChange: y,
                style: { display: "none" }
              }
            ),
            /* @__PURE__ */ e.jsx(
              "button",
              {
                onClick: () => {
                  var r;
                  return (r = u.current) == null ? void 0 : r.click();
                },
                style: {
                  padding: "4px 8px",
                  fontSize: "11px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: "pointer"
                },
                children: "📎 Upload File"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ e.jsx(
          "textarea",
          {
            value: t.inputText,
            onChange: (r) => a((i) => ({ ...i, inputText: r.target.value })),
            placeholder: `Enter text for ${t.activeFeature}...`,
            style: {
              width: "100%",
              height: "100px",
              padding: "8px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              fontSize: "13px",
              fontFamily: "inherit",
              resize: "vertical"
            }
          }
        )
      ] }),
      /* @__PURE__ */ e.jsx(
        "button",
        {
          onClick: v,
          disabled: t.isProcessing || !t.inputText.trim(),
          style: {
            width: "100%",
            padding: "12px",
            borderRadius: "8px",
            border: "none",
            background: t.isProcessing || !t.inputText.trim() ? "#ccc" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            fontSize: "14px",
            fontWeight: 600,
            cursor: t.isProcessing || !t.inputText.trim() ? "not-allowed" : "pointer",
            marginBottom: "12px"
          },
          children: t.isProcessing ? "⏳ Processing..." : `✨ ${t.activeFeature.charAt(0).toUpperCase() + t.activeFeature.slice(1)} with AI`
        }
      ),
      t.outputText && /* @__PURE__ */ e.jsxs("div", { style: { marginBottom: "16px" }, children: [
        /* @__PURE__ */ e.jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }, children: [
          /* @__PURE__ */ e.jsx("label", { style: { fontSize: "13px", fontWeight: 500 }, children: "Output:" }),
          /* @__PURE__ */ e.jsx(
            "button",
            {
              id: "copy-btn",
              onClick: b,
              style: {
                padding: "4px 8px",
                fontSize: "11px",
                borderRadius: "4px",
                border: "1px solid #ddd",
                background: "white",
                cursor: "pointer"
              },
              children: "📋 Copy"
            }
          )
        ] }),
        /* @__PURE__ */ e.jsx(
          "div",
          {
            style: {
              padding: "12px",
              borderRadius: "8px",
              background: "#f8f9fa",
              border: "1px solid #e0e0e0",
              fontSize: "13px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxHeight: "200px",
              overflowY: "auto"
            },
            children: t.outputText
          }
        )
      ] }),
      /* @__PURE__ */ e.jsxs("div", { style: {
        padding: "12px",
        background: "#f0f7ff",
        borderRadius: "8px",
        fontSize: "11px",
        color: "#1e40af",
        marginTop: "16px"
      }, children: [
        /* @__PURE__ */ e.jsx("strong", { children: "🔒 Privacy First:" }),
        " All AI processing happens locally on your device using Chrome's Built-in AI APIs. No data is sent to external servers. Works offline!"
      ] })
    ] })
  ] });
}, h = document.getElementById("popup-root");
h && k(h).render(/* @__PURE__ */ e.jsx(S, {}));
