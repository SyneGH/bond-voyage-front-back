import { useState } from "react";
import { Languages, ArrowLeftRight, Volume2, Copy, Check } from "lucide-react";
import { ContentCard } from "../../components/ContentCard";
import { toast } from "sonner@2.0.3";

export function Translation() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("tl");
  const [copied, setCopied] = useState(false);

  const languages = [
    { code: "en", name: "English" },
    { code: "tl", name: "Tagalog" },
    { code: "ceb", name: "Cebuano" },
    { code: "ilo", name: "Ilocano" },
    { code: "hil", name: "Hiligaynon" },
    { code: "pam", name: "Kapampangan" },
    { code: "bcl", name: "Bicolano" },
    { code: "zh", name: "Chinese (Mandarin)" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" }
  ];

  const commonPhrases = [
    { en: "Hello", tl: "Kumusta" },
    { en: "Thank you", tl: "Salamat" },
    { en: "How much?", tl: "Magkano?" },
    { en: "Where is...?", tl: "Nasaan ang...?" },
    { en: "I don't understand", tl: "Hindi ko maintindihan" },
    { en: "Help!", tl: "Tulong!" },
    { en: "Good morning", tl: "Magandang umaga" },
    { en: "Good evening", tl: "Magandang gabi" },
    { en: "Delicious food", tl: "Masarap na pagkain" }
  ];

  const handleTranslate = () => {
    if (!sourceText.trim()) {
      toast.error("Empty text", {
        description: "Please enter text to translate"
      });
      return;
    }
    
    // Simulate translation
    const translations: any = {
      "hello": "kumusta",
      "thank you": "salamat",
      "good morning": "magandang umaga",
      "good evening": "magandang gabi",
      "how are you": "kumusta ka"
    };
    const result = translations[sourceText.toLowerCase()] || `${sourceText} (translated)`;
    setTranslatedText(result);
    
    toast.success("Translation complete!", {
      description: "Text has been translated successfully"
    });
  };

  const handleSwapLanguages = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
    
    if (sourceText || translatedText) {
      toast.info("Languages swapped", {
        description: "Source and target languages have been switched"
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    toast.success("Copied to clipboard!", {
      description: "Translation text has been copied"
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePhraseClick = (phrase: any) => {
    setSourceText(phrase.en);
    setTranslatedText(phrase.tl);
    toast.info("Phrase loaded", {
      description: `${phrase.en} → ${phrase.tl}`
    });
  };

  return (
    <div className="space-y-6">
      {/* Translator */}
      <ContentCard title="Translator" icon={Languages}>
        <div className="space-y-5">
          {/* Language Selection */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none transition-all"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
            <button
              onClick={handleSwapLanguages}
              className="p-3 rounded-xl hover:bg-accent border border-border hover:border-primary/50 transition-all group"
            >
              <ArrowLeftRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={2} />
            </button>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none transition-all"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          {/* Text Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Source Text</label>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Enter text to translate..."
                rows={10}
                className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{sourceText.length} characters</span>
                <button className="p-2 hover:bg-accent rounded-lg transition-colors group">
                  <Volume2 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={2} />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Translation</label>
              <div className="relative">
                <textarea
                  value={translatedText}
                  readOnly
                  placeholder="Translation will appear here..."
                  rows={10}
                  className="w-full px-4 py-3 bg-accent border border-border rounded-xl text-sm focus:outline-none resize-none"
                />
                {translatedText && (
                  <button
                    onClick={handleCopy}
                    className="absolute top-3 right-3 p-2 bg-card hover:bg-accent rounded-lg transition-all border border-border hover:border-primary/50 group"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" strokeWidth={2} />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={2} />
                    )}
                  </button>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">{translatedText.length} characters</span>
                <button className="p-2 hover:bg-accent rounded-lg transition-colors group">
                  <Volume2 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>

          {/* Translate Button */}
          <button
            onClick={handleTranslate}
            className="w-full px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
            style={{
              background: 'linear-gradient(135deg, var(--gradient-from), var(--gradient-to))',
              color: 'white'
            }}
          >
            Translate
          </button>
        </div>
      </ContentCard>

      {/* Common Phrases */}
      <ContentCard title="Common Travel Phrases" icon={Languages}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {commonPhrases.map((phrase, index) => (
            <button
              key={index}
              onClick={() => handlePhraseClick(phrase)}
              className="p-4 bg-card border border-border rounded-xl hover:shadow-md hover:border-primary/50 transition-all text-left group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm text-card-foreground group-hover:text-primary transition-colors">{phrase.en}</p>
                <ArrowLeftRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" strokeWidth={2} />
              </div>
              <p className="text-xs text-muted-foreground">{phrase.tl}</p>
            </button>
          ))}
        </div>
      </ContentCard>
    </div>
  );
}
