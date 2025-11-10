class d {
  constructor() {
    this.languageModel = null, this.summarizer = null, this.writer = null, this.rewriter = null, this.translator = null;
  }
  /**
   * Check availability of all Chrome Built-in AI APIs
   */
  async checkAvailability() {
    var e, s, r, i, l;
    const a = {
      promptAPI: "not-supported",
      summarizerAPI: "not-supported",
      writerAPI: "not-supported",
      rewriterAPI: "not-supported",
      translatorAPI: "not-supported",
      proofreaderAPI: "not-supported",
      isAnyAvailable: !1
    };
    try {
      if ((e = window.ai) != null && e.languageModel) {
        const t = await window.ai.languageModel.capabilities();
        a.promptAPI = t.available;
      }
      if ((s = window.ai) != null && s.summarizer) {
        const t = await window.ai.summarizer.capabilities();
        a.summarizerAPI = t.available;
      }
      if ((r = window.ai) != null && r.writer) {
        const t = await window.ai.writer.capabilities();
        a.writerAPI = t.available;
      }
      if ((i = window.ai) != null && i.rewriter) {
        const t = await window.ai.rewriter.capabilities();
        a.rewriterAPI = t.available;
      }
      if ((l = window.ai) != null && l.translator) {
        const t = await window.ai.translator.capabilities();
        a.translatorAPI = t.available;
      }
      a.proofreaderAPI = a.promptAPI, a.isAnyAvailable = a.promptAPI !== "no" && a.promptAPI !== "not-supported" || a.summarizerAPI !== "no" && a.summarizerAPI !== "not-supported" || a.writerAPI !== "no" && a.writerAPI !== "not-supported" || a.rewriterAPI !== "no" && a.rewriterAPI !== "not-supported" || a.translatorAPI !== "no" && a.translatorAPI !== "not-supported";
    } catch (t) {
      console.error("Error checking AI availability:", t);
    }
    return a;
  }
  /**
   * Prompt API - General purpose language model (Gemini Nano)
   * Use for creative tasks, question answering, and proofreading
   */
  async prompt(a, e) {
    var s;
    try {
      return (s = window.ai) != null && s.languageModel ? (this.languageModel || (this.languageModel = await window.ai.languageModel.create({
        systemPrompt: e == null ? void 0 : e.systemPrompt,
        temperature: (e == null ? void 0 : e.temperature) ?? 0.7,
        topK: (e == null ? void 0 : e.topK) ?? 40
      })), {
        success: !0,
        data: await this.languageModel.prompt(a)
      }) : {
        success: !1,
        error: "Prompt API not available. Please use Chrome Dev/Canary 127+ with AI features enabled."
      };
    } catch (r) {
      return console.error("Prompt API error:", r), {
        success: !1,
        error: r instanceof Error ? r.message : "Failed to generate response"
      };
    }
  }
  /**
   * Summarizer API - Distill complex information into clear insights
   */
  async summarize(a, e) {
    var s;
    try {
      if (!((s = window.ai) != null && s.summarizer))
        return {
          success: !1,
          error: "Summarizer API not available. Please use Chrome Dev/Canary with AI features enabled."
        };
      const r = await window.ai.summarizer.create({
        type: (e == null ? void 0 : e.type) ?? "tl;dr",
        format: (e == null ? void 0 : e.format) ?? "plain-text",
        length: (e == null ? void 0 : e.length) ?? "short",
        sharedContext: e == null ? void 0 : e.context
      }), i = await r.summarize(a);
      return r.destroy(), {
        success: !0,
        data: i
      };
    } catch (r) {
      return console.error("Summarizer API error:", r), {
        success: !1,
        error: r instanceof Error ? r.message : "Failed to summarize text"
      };
    }
  }
  /**
   * Writer API - Create original and engaging text
   */
  async write(a, e) {
    var s;
    try {
      if (!((s = window.ai) != null && s.writer))
        return {
          success: !1,
          error: "Writer API not available. Please use Chrome Dev/Canary with AI features enabled."
        };
      const r = await window.ai.writer.create({
        tone: (e == null ? void 0 : e.tone) ?? "neutral",
        format: (e == null ? void 0 : e.format) ?? "plain-text",
        length: (e == null ? void 0 : e.length) ?? "medium",
        sharedContext: e == null ? void 0 : e.context
      }), i = await r.write(a);
      return r.destroy(), {
        success: !0,
        data: i
      };
    } catch (r) {
      return console.error("Writer API error:", r), {
        success: !1,
        error: r instanceof Error ? r.message : "Failed to write content"
      };
    }
  }
  /**
   * Rewriter API - Improve content with alternative phrasing
   */
  async rewrite(a, e) {
    var s;
    try {
      if (!((s = window.ai) != null && s.rewriter))
        return {
          success: !1,
          error: "Rewriter API not available. Please use Chrome Dev/Canary with AI features enabled."
        };
      const r = await window.ai.rewriter.create({
        tone: (e == null ? void 0 : e.tone) ?? "as-is",
        format: (e == null ? void 0 : e.format) ?? "as-is",
        length: (e == null ? void 0 : e.length) ?? "as-is",
        sharedContext: e == null ? void 0 : e.context
      }), i = await r.rewrite(a);
      return r.destroy(), {
        success: !0,
        data: i
      };
    } catch (r) {
      return console.error("Rewriter API error:", r), {
        success: !1,
        error: r instanceof Error ? r.message : "Failed to rewrite text"
      };
    }
  }
  /**
   * Translator API - Add multilingual capabilities
   */
  async translate(a, e) {
    var s;
    try {
      if (!((s = window.ai) != null && s.translator))
        return {
          success: !1,
          error: "Translator API not available. Please use Chrome Dev/Canary with AI features enabled."
        };
      if ((await window.ai.translator.capabilities()).available === "no")
        return {
          success: !1,
          error: "Translation not available for this language pair"
        };
      const i = await window.ai.translator.create({
        sourceLanguage: e.sourceLanguage,
        targetLanguage: e.targetLanguage
      }), l = await i.translate(a);
      return i.destroy(), {
        success: !0,
        data: l
      };
    } catch (r) {
      return console.error("Translator API error:", r), {
        success: !1,
        error: r instanceof Error ? r.message : "Failed to translate text"
      };
    }
  }
  /**
   * Proofreader - Correct grammar mistakes with ease
   * Uses Prompt API with specialized system prompt
   */
  async proofread(a, e) {
    var s;
    try {
      if (!((s = window.ai) != null && s.languageModel))
        return {
          success: !1,
          error: "Proofreader (Prompt API) not available. Please use Chrome Dev/Canary with AI features enabled."
        };
      const r = [];
      (e == null ? void 0 : e.correctGrammar) !== !1 && r.push("Fix grammar mistakes"), (e == null ? void 0 : e.correctSpelling) !== !1 && r.push("Correct spelling errors"), (e == null ? void 0 : e.improvePunctuation) !== !1 && r.push("Improve punctuation");
      const i = `You are an expert proofreader and grammar checker. 
      
Your task:
${r.map((n, o) => `${o + 1}. ${n}`).join(`
`)}

IMPORTANT: Return ONLY the corrected text. Do not add explanations, do not add "Here is the corrected text:", just return the corrected version directly.

If the text is already perfect, return it unchanged.`, l = await this.prompt(a, {
        systemPrompt: i,
        temperature: 0.2
        // Low temperature for consistent corrections
      });
      if (!l.success || !l.data)
        return l;
      let t = l.data.trim();
      const u = [
        "Here is the corrected text:",
        "Here's the corrected text:",
        "Corrected text:",
        "Here you go:",
        "Here it is:"
      ];
      for (const n of u)
        if (t.toLowerCase().startsWith(n.toLowerCase())) {
          t = t.substring(n.length).trim();
          break;
        }
      (t.startsWith('"') && t.endsWith('"') || t.startsWith("'") && t.endsWith("'")) && (t = t.substring(1, t.length - 1));
      const c = [];
      return t !== a && c.push({
        original: a.substring(0, 50) + (a.length > 50 ? "..." : ""),
        corrected: t.substring(0, 50) + (t.length > 50 ? "..." : ""),
        reason: "Text has been proofread and corrected"
      }), {
        success: !0,
        data: {
          correctedText: t,
          corrections: c
        }
      };
    } catch (r) {
      return console.error("Proofreader error:", r), {
        success: !1,
        error: r instanceof Error ? r.message : "Failed to proofread text"
      };
    }
  }
  /**
   * Simplify text for low-literacy users
   * Tries Rewriter API first, falls back to Prompt API
   */
  async simplify(a) {
    var e, s;
    if ((e = window.ai) != null && e.rewriter) {
      const r = await this.rewrite(a, {
        tone: "more-casual",
        length: "shorter"
      });
      if (r.success)
        return r;
    }
    try {
      return (s = window.ai) != null && s.languageModel ? await this.prompt(a, {
        systemPrompt: `You are a text simplification expert. Your task is to:
1. Rewrite the text using simpler, everyday words
2. Break long sentences into shorter ones
3. Use active voice instead of passive voice
4. Keep the same meaning but make it easier to read
5. Aim for 5th-8th grade reading level

Return ONLY the simplified text, nothing else.`,
        temperature: 0.5
      }) : {
        success: !1,
        error: "Neither Rewriter API nor Prompt API is available. Please enable AI features in Chrome Canary."
      };
    } catch (r) {
      return console.error("Simplify error:", r), {
        success: !1,
        error: r instanceof Error ? r.message : "Failed to simplify text"
      };
    }
  }
  /**
   * Clean up all AI instances
   */
  destroy() {
    this.languageModel && (this.languageModel.destroy(), this.languageModel = null), this.summarizer && (this.summarizer.destroy(), this.summarizer = null), this.writer && (this.writer.destroy(), this.writer = null), this.rewriter && (this.rewriter.destroy(), this.rewriter = null), this.translator && (this.translator.destroy(), this.translator = null);
  }
}
const m = new d();
export {
  d as ChromeAIService,
  m as chromeAI
};
