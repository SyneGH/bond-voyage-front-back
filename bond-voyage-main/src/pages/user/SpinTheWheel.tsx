import { useState, useRef, useEffect } from "react";
import { RotateCw, Plus, X, Sparkles, Trash2, RefreshCw, Disc3, Zap } from "lucide-react";
import { ContentCard } from "../../components/ContentCard";
import { toast } from "sonner@2.0.3";

interface WinnerModalProps {
  winner: string;
  onClose: () => void;
  onRemove: () => void;
  eliminationMode: boolean;
}

function WinnerModal({ winner, onClose, onRemove, eliminationMode }: WinnerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card rounded-2xl shadow-2xl border border-border w-full max-w-md mx-4 overflow-hidden animate-in zoom-in duration-300">
        {/* Header */}
        <div className="relative p-8 text-center" style={{
          background: 'linear-gradient(135deg, var(--gradient-from), var(--gradient-to))'
        }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-white drop-shadow-lg animate-pulse" />
          <h2 className="text-white text-3xl mb-2">🎉 Winner! 🎉</h2>
          <p className="text-white/80 text-sm">The wheel has spoken!</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="p-6 rounded-xl bg-muted/50 border border-border text-center mb-6">
            <p className="text-muted-foreground text-sm mb-2">Winner is:</p>
            <p className="text-foreground text-2xl font-semibold">{winner}</p>
          </div>

          {eliminationMode && (
            <div className="mb-6 p-4 bg-destructive/10 rounded-xl border border-destructive/20">
              <div className="flex items-start gap-2">
                <Zap className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-destructive text-sm">
                  <span className="font-semibold">Elimination Mode:</span> This option will be automatically removed from the wheel.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {!eliminationMode && (
              <button
                onClick={onRemove}
                className="flex-1 px-6 py-3 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive font-medium transition-all flex items-center justify-center gap-2 border border-destructive/20"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            )}
            <button
              onClick={onClose}
              className={`${eliminationMode ? 'w-full' : 'flex-1'} px-6 py-3 rounded-xl text-white font-medium hover:opacity-90 transition-all shadow-lg`}
              style={{
                background: 'linear-gradient(90deg, var(--gradient-from), var(--gradient-to))',
                boxShadow: '0 4px 20px var(--shadow-color-strong)'
              }}
            >
              {eliminationMode ? 'Continue' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SpinTheWheel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [items, setItems] = useState<string[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentDeg, setCurrentDeg] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState(-1);
  const [eliminationMode, setEliminationMode] = useState(false);

  // Brand colors for wheel segments
  const segmentColors = ['#0A7AFF', '#14B8A6', '#F59E0B', '#8B5CF6', '#EC4899', '#10B981', '#F97316', '#6366F1'];

  const width = 500;
  const height = 500;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = width / 2;

  const toRad = (deg: number) => deg * (Math.PI / 180.0);

  const darkenColor = (color: string, amount: number): string => {
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - amount);
    const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - amount);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const drawWheel = (rotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Draw outer circle (background)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, toRad(0), toRad(360));
    ctx.fillStyle = '#1F2937';
    ctx.fill();

    if (items.length === 0) return;

    const step = 360 / items.length;
    let startDeg = rotation;

    // Draw segments
    for (let i = 0; i < items.length; i++) {
      const endDeg = startDeg + step;
      const color = segmentColors[i % segmentColors.length];

      // Draw outer border segment
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 2, toRad(startDeg), toRad(endDeg));
      ctx.fillStyle = darkenColor(color, 30);
      ctx.lineTo(centerX, centerY);
      ctx.fill();

      // Draw inner segment
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius - 30, toRad(startDeg), toRad(endDeg));
      ctx.fillStyle = color;
      ctx.lineTo(centerX, centerY);
      ctx.fill();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(toRad((startDeg + endDeg) / 2));
      ctx.textAlign = "center";
      ctx.fillStyle = "#FFF";
      ctx.font = items.length > 8 ? 'bold 18px sans-serif' : 'bold 22px sans-serif';
      ctx.fillText(items[i], 130, 10);
      ctx.restore();

      startDeg = endDeg;
    }
  };

  useEffect(() => {
    drawWheel(currentDeg);
  }, [items, currentDeg]);

  const detectWinner = (finalDeg: number) => {
    const normalizedDeg = (360 - (finalDeg % 360)) % 360;
    const step = 360 / items.length;

    for (let i = 0; i < items.length; i++) {
      const startDeg = i * step;
      const endDeg = (i + 1) * step;

      if (normalizedDeg >= startDeg && normalizedDeg < endDeg) {
        setWinner(items[i]);
        setWinnerIndex(i);
        setShowWinnerModal(true);
        toast.success(`Winner: ${items[i]}! 🎉`, {
          description: "Congratulations! The wheel has decided!"
        });
        
        // Auto-remove if elimination mode is on
        if (eliminationMode) {
          setTimeout(() => {
            handleRemoveWinner(i);
          }, 3000);
        }
        return;
      }
    }

    // Fallback to last item
    const lastIndex = items.length - 1;
    setWinner(items[lastIndex]);
    setWinnerIndex(lastIndex);
    setShowWinnerModal(true);
    
    if (eliminationMode) {
      setTimeout(() => {
        handleRemoveWinner(lastIndex);
      }, 3000);
    }
  };

  const handleSpin = () => {
    if (isSpinning) return;
    if (items.length < 2) {
      toast.error("Not enough options", {
        description: "Add at least 2 options to spin the wheel"
      });
      return;
    }

    setIsSpinning(true);
    setWinner(null);
    setShowWinnerModal(false);

    // Calculate random target rotation
    const minSpins = 5;
    const maxSpins = 8;
    const spins = minSpins + Math.random() * (maxSpins - minSpins);
    const randomDegree = Math.random() * 360;
    const totalRotation = spins * 360 + randomDegree;
    
    const finalDeg = currentDeg + totalRotation;
    
    // Animate the wheel
    const duration = 4000; // 4 seconds
    const startTime = Date.now();
    const startDeg = currentDeg;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic for smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const newDeg = startDeg + (totalRotation * easeProgress);
      
      setCurrentDeg(newDeg);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Spinning complete
        setCurrentDeg(finalDeg);
        setIsSpinning(false);
        detectWinner(finalDeg);
      }
    };

    requestAnimationFrame(animate);
  };

  const handleCreateWheel = () => {
    const newItems = inputText
      .split('\n')
      .map(item => item.trim())
      .filter(item => item !== '');

    if (newItems.length < 2) {
      toast.error("Not enough options", {
        description: "Enter at least 2 options (one per line)"
      });
      return;
    }

    if (newItems.length > 12) {
      toast.error("Too many options", {
        description: "Maximum 12 options allowed"
      });
      return;
    }

    setItems(newItems);
    setInputText("");
    setCurrentDeg(0);
    setWinner(null);
    toast.success("Wheel created!", {
      description: `Added ${newItems.length} options to the wheel`
    });
  };

  const handleRemoveWinner = (indexToRemove?: number) => {
    const removeIndex = indexToRemove !== undefined ? indexToRemove : winnerIndex;
    if (removeIndex === -1) return;

    const newItems = items.filter((_, index) => index !== removeIndex);
    
    if (newItems.length < 2) {
      toast.error("Minimum required", {
        description: "Wheel must have at least 2 options"
      });
      setShowWinnerModal(false);
      return;
    }

    setItems(newItems);
    setWinnerIndex(-1);
    setWinner(null);
    setShowWinnerModal(false);
    setCurrentDeg(0);
    
    toast.info("Winner removed", {
      description: "Option removed from the wheel"
    });
  };

  const handleReset = () => {
    setCurrentDeg(0);
    setWinner(null);
    setWinnerIndex(-1);
    setShowWinnerModal(false);
    toast.info("Wheel reset", {
      description: "Ready to spin again!"
    });
  };

  const handleClearAll = () => {
    setItems([]);
    setInputText("");
    setCurrentDeg(0);
    setWinner(null);
    setWinnerIndex(-1);
    setShowWinnerModal(false);
    toast.info("Wheel cleared", {
      description: "All options removed"
    });
  };

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wheel Section */}
        <ContentCard title="The Wheel" icon={Disc3}>
          <div className="flex flex-col items-center space-y-6">
            {/* Wheel Canvas Container */}
            <div className="relative">
              {/* Arrow Pointer */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-10">
                <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[32px]" 
                  style={{ 
                    borderTopColor: '#EF4444',
                    filter: 'drop-shadow(0 4px 8px rgba(239, 68, 68, 0.5))'
                  }}
                />
              </div>

              {/* Canvas */}
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={width}
                  height={height}
                  className="rounded-full shadow-2xl border-8 border-card max-w-full h-auto"
                  style={{ maxWidth: '500px', width: '100%' }}
                />
                
                {/* Center Spin Button */}
                <button
                  onClick={handleSpin}
                  disabled={isSpinning || items.length < 2}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    background: items.length < 2 ? '#9CA3AF' : 'linear-gradient(135deg, var(--gradient-from), var(--gradient-to))',
                  }}
                >
                  <RotateCw 
                    className={`w-12 h-12 text-white ${isSpinning ? 'animate-spin' : ''}`} 
                    strokeWidth={2.5}
                  />
                </button>
              </div>
            </div>

            {/* Winner Display */}
            {winner && !showWinnerModal && (
              <div 
                className="w-full p-6 rounded-xl text-white text-center shadow-lg animate-in fade-in zoom-in duration-500"
                style={{
                  background: 'linear-gradient(135deg, #10B981, #059669)'
                }}
              >
                <Sparkles className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm opacity-90 mb-2">🎉 Winner 🎉</p>
                <p className="text-2xl font-semibold">{winner}</p>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex gap-3 w-full">
              <button
                onClick={handleSpin}
                disabled={isSpinning || items.length < 2}
                className="flex-1 px-6 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-white font-medium"
                style={{
                  background: isSpinning || items.length < 2 ? '#9CA3AF' : 'linear-gradient(135deg, var(--gradient-from), var(--gradient-to))',
                }}
              >
                <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} strokeWidth={2} />
                {isSpinning ? "Spinning..." : "Spin the Wheel!"}
              </button>
              <button
                onClick={handleReset}
                disabled={isSpinning}
                className="px-6 py-4 border-2 border-border rounded-xl hover:bg-accent hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reset wheel position"
              >
                <RefreshCw className="w-5 h-5 text-foreground" strokeWidth={2} />
              </button>
            </div>

            {/* Info */}
            <div className="w-full p-4 bg-primary/10 rounded-xl border border-primary/20">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground font-medium text-sm mb-1">How to use:</p>
                  <ul className="text-muted-foreground text-sm space-y-1">
                    <li>• Add options using the input area on the right</li>
                    <li>• Click the center button or "Spin the Wheel!" to start</li>
                    <li>• The winner will be displayed after spinning</li>
                    <li>• Enable elimination mode to auto-remove winners</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </ContentCard>

        {/* Options Section */}
        <ContentCard title="Wheel Options" icon={Plus}>
          <div className="space-y-6">
            {/* Elimination Mode Toggle */}
            <div className="p-4 bg-muted/50 rounded-xl border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">Elimination Mode</p>
                    <p className="text-muted-foreground text-xs">Auto-remove winners after spin</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEliminationMode(!eliminationMode);
                    toast.info(
                      !eliminationMode ? "Elimination mode enabled" : "Elimination mode disabled",
                      {
                        description: !eliminationMode 
                          ? "Winners will be automatically removed" 
                          : "Winners will remain on the wheel"
                      }
                    );
                  }}
                  className={`relative w-14 h-8 rounded-full transition-all ${
                    eliminationMode 
                      ? 'bg-destructive' 
                      : 'bg-secondary'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${
                      eliminationMode ? 'left-7' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Input Area */}
            <div className="space-y-3">
              <label className="block text-foreground font-medium">
                Enter Options (one per line)
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="List of Options"
                className="w-full h-48 px-4 py-3 bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                style={{ fontFamily: 'monospace' }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateWheel}
                  className="flex-1 px-6 py-3 rounded-xl text-white font-medium hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(90deg, var(--gradient-from), var(--gradient-to))',
                    boxShadow: '0 4px 20px var(--shadow-color-strong)'
                  }}
                >
                  <Plus className="w-5 h-5" strokeWidth={2} />
                  Create Wheel
                </button>
                <button
                  onClick={handleClearAll}
                  className="px-6 py-3 border-2 border-border rounded-xl hover:bg-destructive/10 hover:border-destructive/50 transition-all flex items-center justify-center gap-2"
                  title="Clear all options"
                >
                  <Trash2 className="w-5 h-5 text-destructive" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Current Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-foreground font-medium">Current Options</p>
                <span className="text-xs text-muted-foreground bg-accent px-3 py-1.5 rounded-full font-medium">
                  {items.length}/12
                </span>
              </div>
              
              {items.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-card border border-border rounded-xl hover:border-primary/50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg shadow-sm flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: segmentColors[index % segmentColors.length] }}
                        >
                          {index + 1}
                        </div>
                        <span className="text-foreground font-medium">{item}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-border rounded-xl">
                  <Disc3 className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground text-sm">No options yet</p>
                  <p className="text-muted-foreground text-xs mt-1">Enter options above to get started</p>
                </div>
              )}
            </div>
          </div>
        </ContentCard>
      </div>

      {/* Winner Modal */}
      {showWinnerModal && winner && (
        <WinnerModal
          winner={winner}
          onClose={() => setShowWinnerModal(false)}
          onRemove={() => handleRemoveWinner()}
          eliminationMode={eliminationMode}
        />
      )}
    </div>
  );
}