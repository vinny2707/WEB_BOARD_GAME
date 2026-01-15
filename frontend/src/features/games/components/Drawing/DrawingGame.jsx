import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Home,
    Trash2,
    Download,
    Undo2,
    Redo2,
    Eraser,
    Pencil,
    Circle,
    Square,
    Minus,
    BookOpen,
    X,
    ChevronRight,
    Check,
} from "lucide-react";

const COLORS = [
    "#000000",
    "#ffffff",
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#6b7280",
    "#92400e",
    "#0d9488",
];

const BRUSH_SIZES = [2, 4, 8, 12, 20, 30];

// Tutorial templates - SVG paths for tracing
const TUTORIAL_TEMPLATES = [
    {
        id: 1,
        name: "Ngôi sao",
        path: "M200,50 L230,130 L310,130 L250,180 L270,260 L200,210 L130,260 L150,180 L90,130 L170,130 Z",
        description: "Vẽ theo hình ngôi sao",
        color: "#ef4444",
    },
    {
        id: 2,
        name: "Trái tim",
        path: "M200,280 C200,280 100,180 100,120 C100,60 150,40 200,100 C250,40 300,60 300,120 C300,180 200,280 200,280 Z",
        description: "Vẽ theo hình trái tim",
        color: "#ec4899",
    },
    {
        id: 3,
        name: "Nhà",
        path: "M100,200 L100,300 L300,300 L300,200 M50,200 L200,80 L350,200 M150,300 L150,240 L200,240 L200,300",
        description: "Vẽ theo hình ngôi nhà",
        color: "#3b82f6",
    },
];

// Tutorial steps
const TUTORIAL_STEPS = [
    {
        id: 1,
        title: "Chào mừng đến với Bảng Vẽ! 🎨",
        message:
            "Hãy học cách vẽ bằng cách tô theo các hình mẫu. Chúng ta sẽ bắt đầu với hình đơn giản!",
        action: "click_next",
        templateId: null,
    },
    {
        id: 2,
        title: "Bước 1: Chọn bút vẽ ✏️",
        message:
            "Bút vẽ đã được chọn sẵn. Hãy nhìn vào thanh công cụ phía trên - đó là nơi bạn chọn công cụ.",
        action: "click_next",
        templateId: null,
        highlightTool: "pencil",
    },
    {
        id: 3,
        title: "Bước 2: Vẽ theo hình Ngôi Sao! ⭐",
        message:
            "Một hình ngôi sao mờ đã xuất hiện. Hãy dùng ngón tay hoặc chuột vẽ theo đường viền của nó!",
        action: "draw_template",
        templateId: 1,
    },
    {
        id: 4,
        title: "Tuyệt vời! 🎉",
        message:
            "Bạn đã vẽ xong ngôi sao! Giờ hãy thử với hình khó hơn - Trái tim.",
        action: "click_next",
        templateId: null,
    },
    {
        id: 5,
        title: "Bước 3: Vẽ theo hình Trái Tim! 💖",
        message:
            "Hình trái tim cần nét cong mềm mại. Hãy vẽ chậm và cẩn thận theo đường viền!",
        action: "draw_template",
        templateId: 2,
    },
    {
        id: 6,
        title: "Đẹp quá! 💗",
        message: "Trái tim của bạn rất đẹp! Cuối cùng, hãy thử vẽ ngôi nhà.",
        action: "click_next",
        templateId: null,
    },
    {
        id: 7,
        title: "Bước 4: Vẽ theo hình Ngôi Nhà! 🏠",
        message:
            "Ngôi nhà có cả đường thẳng và đường cong. Hãy vẽ theo từng phần nhé!",
        action: "draw_template",
        templateId: 3,
    },
    {
        id: 8,
        title: "Hoàn thành xuất sắc! 🏆",
        message:
            "Bạn đã thành thạo các kỹ năng cơ bản! Giờ hãy tự do sáng tạo bức tranh của riêng mình!",
        action: "finish",
        templateId: null,
    },
];

const DrawingGame = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const templateCanvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState("#000000");
    const [brushSize, setBrushSize] = useState(4);
    const [tool, setTool] = useState("pencil");
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
    const [gameStatus, setGameStatus] = useState("idle"); // 'idle', 'playing', 'tutorial'

    // Tutorial states
    const [tutorialStep, setTutorialStep] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [displayedText, setDisplayedText] = useState("");
    const [displayedTitle, setDisplayedTitle] = useState("");
    const [currentTemplate, setCurrentTemplate] = useState(null);
    const [hasDrawnOnTemplate, setHasDrawnOnTemplate] = useState(false);
    const typingRef = useRef(null);

    // Typewriter effect
    useEffect(() => {
        if (gameStatus !== "tutorial") return;
        const currentStepData = TUTORIAL_STEPS[tutorialStep];
        if (!currentStepData) return;

        if (typingRef.current) clearInterval(typingRef.current);

        setIsTyping(true);
        setDisplayedTitle("");
        setDisplayedText("");

        const fullTitle = currentStepData.title;
        const fullMessage = currentStepData.message;
        let titleIndex = 0;
        let messageIndex = 0;
        let typingPhase = "title";

        typingRef.current = setInterval(() => {
            if (typingPhase === "title") {
                if (titleIndex < fullTitle.length) {
                    setDisplayedTitle(fullTitle.slice(0, titleIndex + 1));
                    titleIndex++;
                } else {
                    typingPhase = "message";
                }
            } else {
                if (messageIndex < fullMessage.length) {
                    setDisplayedText(fullMessage.slice(0, messageIndex + 1));
                    messageIndex++;
                } else {
                    clearInterval(typingRef.current);
                    setIsTyping(false);
                }
            }
        }, 35);

        // Load template if needed
        if (currentStepData.templateId) {
            const template = TUTORIAL_TEMPLATES.find(
                (t) => t.id === currentStepData.templateId
            );
            setCurrentTemplate(template);
            setHasDrawnOnTemplate(false);
        } else {
            setCurrentTemplate(null);
        }

        return () => {
            if (typingRef.current) clearInterval(typingRef.current);
        };
    }, [tutorialStep, gameStatus]);

    // Initialize canvas - re-run when gameStatus changes (idle -> tutorial/playing)
    useEffect(() => {
        if (gameStatus === "idle") return;

        // Wait for canvas to mount
        const initCanvas = () => {
            const canvas = canvasRef.current;
            if (!canvas) {
                setTimeout(initCanvas, 50);
                return;
            }
            const container = canvas.parentElement;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const width = Math.min(rect.width - 16, 900);
            const height = Math.min(rect.height - 16, 600);
            setCanvasSize({ width, height });
        };

        initCanvas();

        const handleResize = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const container = canvas.parentElement;
            if (!container) return;
            const rect = container.getBoundingClientRect();
            const width = Math.min(rect.width - 16, 900);
            const height = Math.min(rect.height - 16, 600);
            setCanvasSize({ width, height });
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [gameStatus]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || canvasSize.width === 0 || canvasSize.height === 0) return;

        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;

        const context = canvas.getContext("2d");
        context.lineCap = "round";
        context.lineJoin = "round";
        context.strokeStyle = color;
        context.lineWidth = brushSize;
        contextRef.current = context;

        // Fill with white background
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Save initial state
        if (history.length === 0) {
            saveState();
        }
    }, [canvasSize, gameStatus]);

    const saveState = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const imageData = canvas.toDataURL();

        setHistory((prev) => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push(imageData);
            return newHistory.slice(-50);
        });
        setHistoryIndex((prev) => Math.min(prev + 1, 49));
    }, [historyIndex]);

    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        if (e.touches) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY,
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY,
        };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        const { x, y } = getCoordinates(e);

        contextRef.current.strokeStyle =
            tool === "eraser" ? "#ffffff" : color;
        contextRef.current.lineWidth =
            tool === "eraser" ? brushSize * 3 : brushSize;

        if (tool === "pencil" || tool === "eraser") {
            contextRef.current.beginPath();
            contextRef.current.moveTo(x, y);
        }

        setStartPos({ x, y });
        setIsDrawing(true);

        // Mark as drawn for tutorial
        if (gameStatus === "tutorial" && currentTemplate) {
            setHasDrawnOnTemplate(true);
        }
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();

        const { x, y } = getCoordinates(e);

        if (tool === "pencil" || tool === "eraser") {
            contextRef.current.lineTo(x, y);
            contextRef.current.stroke();
        }
    };

    const finishDrawing = (e) => {
        if (!isDrawing) return;
        e.preventDefault();

        const { x, y } = getCoordinates(e);

        if (tool === "line") {
            contextRef.current.strokeStyle = color;
            contextRef.current.lineWidth = brushSize;
            contextRef.current.beginPath();
            contextRef.current.moveTo(startPos.x, startPos.y);
            contextRef.current.lineTo(x, y);
            contextRef.current.stroke();
        } else if (tool === "circle") {
            const radius = Math.sqrt(
                Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2)
            );
            contextRef.current.strokeStyle = color;
            contextRef.current.lineWidth = brushSize;
            contextRef.current.beginPath();
            contextRef.current.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
            contextRef.current.stroke();
        } else if (tool === "rectangle") {
            contextRef.current.strokeStyle = color;
            contextRef.current.lineWidth = brushSize;
            contextRef.current.beginPath();
            contextRef.current.rect(
                startPos.x,
                startPos.y,
                x - startPos.x,
                y - startPos.y
            );
            contextRef.current.stroke();
        }

        contextRef.current.closePath();
        setIsDrawing(false);
        saveState();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        saveState();
    };

    const undo = () => {
        if (historyIndex <= 0) return;

        const newIndex = historyIndex - 1;
        const img = new Image();
        img.src = history[newIndex];
        img.onload = () => {
            contextRef.current.clearRect(
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height
            );
            contextRef.current.drawImage(img, 0, 0);
        };
        setHistoryIndex(newIndex);
    };

    const redo = () => {
        if (historyIndex >= history.length - 1) return;

        const newIndex = historyIndex + 1;
        const img = new Image();
        img.src = history[newIndex];
        img.onload = () => {
            contextRef.current.clearRect(
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height
            );
            contextRef.current.drawImage(img, 0, 0);
        };
        setHistoryIndex(newIndex);
    };

    const downloadImage = () => {
        const canvas = canvasRef.current;
        const link = document.createElement("a");
        link.download = `drawing_${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    };

    const startGame = () => {
        setGameStatus("playing");
        clearCanvas();
    };

    const startTutorial = () => {
        setGameStatus("tutorial");
        setTutorialStep(0);
        setIsTyping(false);
        setDisplayedText("");
        setDisplayedTitle("");
        setCurrentTemplate(null);
        setHasDrawnOnTemplate(false);
        clearCanvas();
    };

    const exitTutorial = () => {
        setGameStatus("idle");
        setTutorialStep(0);
        setCurrentTemplate(null);
        clearCanvas();
    };

    const nextTutorialStep = () => {
        const currentStepData = TUTORIAL_STEPS[tutorialStep];
        if (currentStepData?.action === "finish") {
            setGameStatus("playing");
            setCurrentTemplate(null);
            clearCanvas();
        } else {
            // Clear canvas for next template
            if (currentStepData?.templateId) {
                clearCanvas();
            }
            setTutorialStep((prev) => prev + 1);
        }
    };

    const confirmTemplateDrawing = () => {
        // Move to next step after drawing
        clearCanvas();
        setTutorialStep((prev) => prev + 1);
    };

    const currentTutorialStep = TUTORIAL_STEPS[tutorialStep];
    const showNextButton =
        gameStatus === "tutorial" &&
        (currentTutorialStep?.action === "click_next" ||
            currentTutorialStep?.action === "finish") &&
        !isTyping;

    const showConfirmButton =
        gameStatus === "tutorial" &&
        currentTutorialStep?.action === "draw_template" &&
        hasDrawnOnTemplate &&
        !isTyping;

    const ToolButton = ({ icon: Icon, toolName, label }) => {
        const isHighlighted =
            gameStatus === "tutorial" &&
            currentTutorialStep?.highlightTool === toolName;

        return (
            <button
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all
                ${tool === toolName
                        ? "bg-teal-500 text-white shadow-lg"
                        : "bg-secondary text-muted-foreground hover:bg-accent"
                    }
                ${isHighlighted ? "ring-2 ring-yellow-400 animate-pulse" : ""}`}
                onClick={() => setTool(toolName)}
                title={label}
            >
                <Icon size={20} />
            </button>
        );
    };

    return (
        <div className="flex flex-col flex-1 w-full h-full bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
                <button
                    className="w-10 h-10 flex items-center justify-center bg-secondary rounded-lg text-muted-foreground hover:bg-accent transition-all"
                    onClick={() => navigate("/games/drawing")}
                >
                    <Home size={20} />
                </button>
                <div className="text-lg font-bold tracking-wider text-foreground">
                    {gameStatus === "tutorial" ? "📖 HƯỚNG DẪN" : "BẢNG VẼ TỰ DO"}
                </div>
                <button
                    className="w-10 h-10 flex items-center justify-center bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all"
                    onClick={downloadImage}
                    title="Tải xuống"
                >
                    <Download size={20} />
                </button>
            </div>

            {/* Toolbar - Hide in idle */}
            {gameStatus !== "idle" && (
                <div className="flex items-center justify-center gap-2 p-2 bg-card border-b border-border flex-wrap">
                    {/* Tools */}
                    <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
                        <ToolButton icon={Pencil} toolName="pencil" label="Bút vẽ" />
                        <ToolButton icon={Eraser} toolName="eraser" label="Tẩy" />
                        <ToolButton icon={Minus} toolName="line" label="Đường thẳng" />
                        <ToolButton icon={Circle} toolName="circle" label="Hình tròn" />
                        <ToolButton icon={Square} toolName="rectangle" label="Hình vuông" />
                    </div>

                    <div className="w-px h-8 bg-border" />

                    {/* Colors */}
                    <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
                        {COLORS.slice(0, 8).map((c) => (
                            <button
                                key={c}
                                className={`w-7 h-7 rounded-full border-2 transition-all
                                ${color === c
                                        ? "border-foreground scale-110"
                                        : "border-transparent hover:scale-105"
                                    }`}
                                style={{ backgroundColor: c }}
                                onClick={() => setColor(c)}
                            />
                        ))}
                    </div>

                    <div className="w-px h-8 bg-border" />

                    {/* Brush Size */}
                    <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
                        {BRUSH_SIZES.slice(0, 4).map((size) => (
                            <button
                                key={size}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all
                                ${brushSize === size
                                        ? "bg-teal-500 text-white"
                                        : "text-muted-foreground hover:bg-accent"
                                    }`}
                                onClick={() => setBrushSize(size)}
                            >
                                <div
                                    className="rounded-full bg-current"
                                    style={{
                                        width: Math.min(size, 16),
                                        height: Math.min(size, 16),
                                    }}
                                />
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-8 bg-border" />

                    {/* Actions */}
                    <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
                        <button
                            className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent disabled:opacity-30 transition-all"
                            onClick={undo}
                            disabled={historyIndex <= 0}
                            title="Hoàn tác"
                        >
                            <Undo2 size={20} />
                        </button>
                        <button
                            className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent disabled:opacity-30 transition-all"
                            onClick={redo}
                            disabled={historyIndex >= history.length - 1}
                            title="Làm lại"
                        >
                            <Redo2 size={20} />
                        </button>
                        <button
                            className="w-10 h-10 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-500/10 transition-all"
                            onClick={clearCanvas}
                            title="Xóa tất cả"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div
                className={`flex-1 flex items-center justify-center p-2 bg-muted/30 overflow-hidden gap-4 ${gameStatus === "tutorial" ? "md:pb-2 pb-44" : ""
                    }`}
            >
                {/* Idle Screen */}
                {gameStatus === "idle" && (
                    <div className="flex flex-col items-center justify-center gap-4 p-8 bg-card rounded-2xl shadow-lg border-2 border-border">
                        <div className="text-3xl font-bold text-foreground mb-2">
                            🎨 Bảng Vẽ Tự Do 🎨
                        </div>
                        <button
                            className="flex items-center gap-2 px-6 py-3 bg-teal-500 rounded-xl text-white font-semibold hover:bg-teal-600 transition-all"
                            onClick={startGame}
                        >
                            🖌️ Bắt đầu vẽ
                        </button>
                        <button
                            className="flex items-center gap-2 px-6 py-3 bg-blue-500 rounded-xl text-white font-semibold hover:bg-blue-600 transition-all"
                            onClick={startTutorial}
                        >
                            <BookOpen size={20} /> Hướng dẫn vẽ
                        </button>
                    </div>
                )}

                {/* Canvas Area */}
                {gameStatus !== "idle" && (
                    <div className="bg-card rounded-lg shadow-lg border-2 border-border p-2 relative">
                        {/* Template overlay */}
                        {currentTemplate && (
                            <svg
                                className="absolute inset-2 pointer-events-none"
                                style={{
                                    width: canvasSize.width,
                                    height: canvasSize.height,
                                }}
                                viewBox="0 0 400 340"
                            >
                                <path
                                    d={currentTemplate.path}
                                    fill="none"
                                    stroke={currentTemplate.color}
                                    strokeWidth="3"
                                    strokeDasharray="10,5"
                                    opacity="0.4"
                                />
                            </svg>
                        )}
                        <canvas
                            ref={canvasRef}
                            className="rounded cursor-crosshair touch-none"
                            style={{
                                width: canvasSize.width,
                                height: canvasSize.height,
                                maxWidth: "100%",
                                maxHeight: "100%",
                            }}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={finishDrawing}
                            onMouseLeave={finishDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={finishDrawing}
                        />
                    </div>
                )}

                {/* Tutorial Panel - Desktop */}
                {gameStatus === "tutorial" && currentTutorialStep && (
                    <div className="hidden md:flex flex-col w-80 h-fit p-6 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border border-teal-500/30 rounded-2xl shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <BookOpen size={20} className="text-teal-400" />
                                <span className="text-sm font-semibold text-teal-400">
                                    Hướng dẫn vẽ
                                </span>
                            </div>
                            <button
                                className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-accent transition-all"
                                onClick={exitTutorial}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex gap-1 mb-4">
                            {TUTORIAL_STEPS.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`flex-1 h-1.5 rounded-full transition-colors ${idx < tutorialStep
                                        ? "bg-teal-500"
                                        : idx === tutorialStep
                                            ? "bg-teal-400 animate-pulse"
                                            : "bg-secondary"
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Step Content */}
                        <div className="mb-4">
                            <div className="text-xs text-muted-foreground mb-2">
                                Bước {tutorialStep + 1}/{TUTORIAL_STEPS.length}
                            </div>
                            <div className="text-xl font-bold text-foreground mb-3 min-h-[2rem]">
                                {displayedTitle}
                                {isTyping && displayedText.length === 0 && (
                                    <span className="animate-pulse">|</span>
                                )}
                            </div>
                            <div className="text-sm text-muted-foreground leading-relaxed min-h-[4rem]">
                                {displayedText}
                                {isTyping && displayedText.length > 0 && (
                                    <span className="animate-pulse text-teal-400">|</span>
                                )}
                            </div>
                        </div>

                        {/* Current Template Info */}
                        {currentTemplate && (
                            <div className="mb-4 p-3 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-xl border border-teal-500/50">
                                <div className="text-sm font-semibold text-foreground mb-1">
                                    🎯 Hình mẫu: {currentTemplate.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {currentTemplate.description}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {showNextButton && (
                            <button
                                className="flex items-center justify-center gap-2 w-full py-3 bg-teal-500 text-white text-sm font-semibold rounded-xl hover:bg-teal-600 transition-all shadow-md"
                                onClick={nextTutorialStep}
                            >
                                {currentTutorialStep.action === "finish" ? (
                                    <>🖌️ Bắt đầu vẽ tự do</>
                                ) : (
                                    <>
                                        Tiếp tục
                                        <ChevronRight size={18} />
                                    </>
                                )}
                            </button>
                        )}

                        {showConfirmButton && (
                            <button
                                className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-all shadow-md"
                                onClick={confirmTemplateDrawing}
                            >
                                <Check size={18} />
                                Hoàn thành hình này
                            </button>
                        )}

                        {/* Hint for drawing */}
                        {!isTyping &&
                            currentTutorialStep?.action === "draw_template" &&
                            !hasDrawnOnTemplate && (
                                <div className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-xl border border-teal-500/50">
                                    <div className="text-sm text-muted-foreground">
                                        Vẽ theo hình mờ trên canvas!
                                    </div>
                                    <div className="text-3xl animate-bounce">✏️</div>
                                </div>
                            )}

                        {/* Tips */}
                        <div className="mt-4 pt-4 border-t border-border">
                            <div className="text-xs text-muted-foreground leading-relaxed">
                                💡{" "}
                                {currentTutorialStep?.action === "draw_template" &&
                                    !isTyping &&
                                    "Vẽ theo đường nét đứt mờ"}
                                {currentTutorialStep?.action === "click_next" &&
                                    !isTyping &&
                                    "Nhấn nút Tiếp tục"}
                                {currentTutorialStep?.action === "finish" &&
                                    !isTyping &&
                                    "Bạn đã sẵn sàng!"}
                                {isTyping && "Đang hiển thị hướng dẫn..."}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tutorial Panel - Mobile */}
                {gameStatus === "tutorial" && currentTutorialStep && (
                    <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-t border-teal-500/30 shadow-lg z-50">
                        {/* Progress Bar */}
                        <div className="flex gap-1 mb-3">
                            {TUTORIAL_STEPS.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`flex-1 h-1 rounded-full transition-colors ${idx < tutorialStep
                                        ? "bg-teal-500"
                                        : idx === tutorialStep
                                            ? "bg-teal-400 animate-pulse"
                                            : "bg-secondary"
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Step Content */}
                        <div className="mb-3">
                            <div className="text-xs text-muted-foreground mb-1">
                                Bước {tutorialStep + 1}/{TUTORIAL_STEPS.length}
                            </div>
                            <div className="text-base font-bold text-foreground mb-2">
                                {displayedTitle}
                            </div>
                            <div className="text-xs text-muted-foreground leading-relaxed">
                                {displayedText}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {showNextButton && (
                            <button
                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-teal-500 text-white text-sm font-semibold rounded-xl hover:bg-teal-600 transition-all shadow-md"
                                onClick={nextTutorialStep}
                            >
                                {currentTutorialStep.action === "finish" ? (
                                    <>🖌️ Bắt đầu vẽ</>
                                ) : (
                                    <>
                                        Tiếp tục
                                        <ChevronRight size={18} />
                                    </>
                                )}
                            </button>
                        )}

                        {showConfirmButton && (
                            <button
                                className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-all shadow-md"
                                onClick={confirmTemplateDrawing}
                            >
                                <Check size={18} />
                                Hoàn thành
                            </button>
                        )}

                        {/* Hint */}
                        {!isTyping &&
                            currentTutorialStep?.action === "draw_template" &&
                            !hasDrawnOnTemplate && (
                                <div className="flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground">
                                    <span className="animate-bounce">✏️</span>
                                    <span>Vẽ theo hình mờ!</span>
                                </div>
                            )}
                    </div>
                )}
            </div>

            {/* Current Tool Info - Playing mode only */}
            {gameStatus === "playing" && (
                <div className="flex items-center justify-center gap-4 p-2 bg-card border-t border-border text-sm text-muted-foreground">
                    <span>
                        Công cụ:{" "}
                        <strong className="text-foreground">
                            {tool === "pencil" && "Bút vẽ"}
                            {tool === "eraser" && "Tẩy"}
                            {tool === "line" && "Đường thẳng"}
                            {tool === "circle" && "Hình tròn"}
                            {tool === "rectangle" && "Hình vuông"}
                        </strong>
                    </span>
                    <span>
                        Màu:{" "}
                        <span
                            className="inline-block w-4 h-4 rounded align-middle"
                            style={{ backgroundColor: color }}
                        />
                    </span>
                    <span>
                        Kích thước:{" "}
                        <strong className="text-foreground">{brushSize}px</strong>
                    </span>
                </div>
            )}

            {/* Bottom Actions */}
            {gameStatus === "tutorial" && (
                <div className="flex items-center justify-center gap-3 p-3 bg-card border-t border-border">
                    <button
                        className="flex items-center gap-2 px-5 py-3 bg-secondary rounded-xl text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                        onClick={exitTutorial}
                    >
                        <X size={18} />
                        <span>Thoát hướng dẫn</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default DrawingGame;
