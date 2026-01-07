import { useState, useEffect } from "react";
export const Terminal = () => {
  const commands = ["curl https://api.doofs.tech", "curl https://bot.doofs.tech", "curl https://demo.doofs.tech"];
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const [isTyping, setIsTyping] = useState(true);

  // Reset and loop the animation
  const resetAnimation = () => {
    setDisplayedLines([]);
    setCurrentLineIndex(0);
    setCurrentText("");
    setShowResponse(false);
    setIsTyping(true);
  };
  useEffect(() => {
    if (currentLineIndex >= commands.length) {
      setTimeout(() => setShowResponse(true), 300);
      setIsTyping(false);
      // Loop after showing response for 2 seconds
      const loopTimeout = setTimeout(() => {
        resetAnimation();
      }, 2000);
      return () => clearTimeout(loopTimeout);
    }
    const command = commands[currentLineIndex];
    if (currentText.length < command.length) {
      const timeout = setTimeout(() => {
        setCurrentText(command.slice(0, currentText.length + 1));
      }, 30);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setDisplayedLines(prev => [...prev, command]);
        setCurrentText("");
        setCurrentLineIndex(prev => prev + 1);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [currentText, currentLineIndex]);
  const marqueeItems = ["FREE FOREVER", "EASY TO USE", "NO CREDIT CARD", "OPEN SOURCE", "MADE IN PH", "DEVELOPER FRIENDLY", "INSTANT SETUP", "100% FREE"];
  return <section className="pt-4 pb-12 px-4 overflow-hidden relative">
      {/* Radial Gradient Background */}
      <div className="absolute inset-0 z-0" style={{
      background: "radial-gradient(125% 125% at 50% 10%, hsl(var(--background)) 40%, hsl(var(--primary)) 100%)"
    }} />

      {/* Marquee */}
      <div className="relative z-10 mb-8 border-y-2 border-border bg-accent overflow-hidden py-[25px]">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems].map((item, index) => <span key={index} className="mx-8 text-sm md:text-base font-black uppercase text-accent-foreground" style={{
          fontFamily: "'Poppins', sans-serif"
        }}>
              {item}
            </span>)}
        </div>
      </div>

      {/* Small Terminal */}
      <div className="relative z-10 w-full px-4 md:px-12 lg:px-20">
        <div className="max-w-md mx-auto border-2 border-border bg-card shadow-xs">
          <div className="border-b border-border px-3 py-1.5 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-destructive" />
            <div className="w-2 h-2 rounded-full bg-accent" />
            <div className="w-2 h-2 rounded-full bg-chart-2" />
            <span className="ml-3 text-xs text-muted-foreground font-mono">terminal</span>
          </div>
          <div className="p-4 font-mono text-xs space-y-1 min-h-[120px]">
            {/* Already typed lines */}
            {displayedLines.map((line, index) => <div key={index} className="flex items-center gap-2">
                <span className="text-muted-foreground select-none">$</span>
                <span className="text-foreground">
                  curl https://<span className="text-chart-2">{line.split("://")[1].split(".")[0]}</span>.doofs.tech
                </span>
              </div>)}
            
            {/* Currently typing line */}
            {currentLineIndex < commands.length && <div className="flex items-center gap-2">
                <span className="text-muted-foreground select-none">$</span>
                <span className="text-foreground">
                  {currentText}
                  <span className="inline-block w-2 h-4 bg-foreground animate-pulse ml-0.5" />
                </span>
              </div>}

            {/* Response */}
            {showResponse && <div className="flex items-center gap-2 mt-2 animate-fade-in">
                <span className="text-muted-foreground select-none">→</span>
                <span className="text-chart-2 font-bold">200 OK</span>
              </div>}
          </div>
        </div>
      </div>
    </section>;
};