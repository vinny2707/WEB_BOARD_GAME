import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Trash2, Download, Undo2, Redo2, Eraser, Pencil, Circle, Square, Minus } from 'lucide-react';

const COLORS = [
    '#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#92400e', '#0d9488'
];

const BRUSH_SIZES = [2, 4, 8, 12, 20, 30];

const DrawingGame = () => {
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [brushSize, setBrushSize] = useState(4);
    const [tool, setTool] = useState('pencil'); // pencil, eraser, line, circle, rectangle
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = canvas.parentElement;

        // Set canvas size based on container
        const updateSize = () => {
            const rect = container.getBoundingClientRect();
            const width = Math.min(rect.width - 16, 900);
            const height = Math.min(rect.height - 16, 600);
            setCanvasSize({ width, height });
        };

        updateSize();
        window.addEventListener('resize', updateSize);

        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;

        const context = canvas.getContext('2d');
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = color;
        context.lineWidth = brushSize;
        contextRef.current = context;

        // Fill with white background
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Save initial state
        if (history.length === 0) {
            saveState();
        }
    }, [canvasSize]);

    const saveState = useCallback(() => {
        const canvas = canvasRef.current;
        const imageData = canvas.toDataURL();

        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            newHistory.push(imageData);
            return newHistory.slice(-50); // Keep last 50 states
        });
        setHistoryIndex(prev => Math.min(prev + 1, 49));
    }, [historyIndex]);

    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        if (e.touches) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY
            };
        }
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const startDrawing = (e) => {
        e.preventDefault();
        const { x, y } = getCoordinates(e);

        contextRef.current.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
        contextRef.current.lineWidth = tool === 'eraser' ? brushSize * 3 : brushSize;

        if (tool === 'pencil' || tool === 'eraser') {
            contextRef.current.beginPath();
            contextRef.current.moveTo(x, y);
        }

        setStartPos({ x, y });
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault();

        const { x, y } = getCoordinates(e);

        if (tool === 'pencil' || tool === 'eraser') {
            contextRef.current.lineTo(x, y);
            contextRef.current.stroke();
        }
    };

    const finishDrawing = (e) => {
        if (!isDrawing) return;
        e.preventDefault();

        const { x, y } = getCoordinates(e);

        if (tool === 'line') {
            contextRef.current.strokeStyle = color;
            contextRef.current.lineWidth = brushSize;
            contextRef.current.beginPath();
            contextRef.current.moveTo(startPos.x, startPos.y);
            contextRef.current.lineTo(x, y);
            contextRef.current.stroke();
        } else if (tool === 'circle') {
            const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
            contextRef.current.strokeStyle = color;
            contextRef.current.lineWidth = brushSize;
            contextRef.current.beginPath();
            contextRef.current.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
            contextRef.current.stroke();
        } else if (tool === 'rectangle') {
            contextRef.current.strokeStyle = color;
            contextRef.current.lineWidth = brushSize;
            contextRef.current.beginPath();
            contextRef.current.rect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
            contextRef.current.stroke();
        }

        contextRef.current.closePath();
        setIsDrawing(false);
        saveState();
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        saveState();
    };

    const undo = () => {
        if (historyIndex <= 0) return;

        const newIndex = historyIndex - 1;
        const img = new Image();
        img.src = history[newIndex];
        img.onload = () => {
            contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
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
            contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            contextRef.current.drawImage(img, 0, 0);
        };
        setHistoryIndex(newIndex);
    };

    const downloadImage = () => {
        const canvas = canvasRef.current;
        const link = document.createElement('a');
        link.download = `drawing_${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const ToolButton = ({ icon: Icon, toolName, label }) => (
        <button
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all
                ${tool === toolName
                    ? 'bg-teal-500 text-white shadow-lg'
                    : 'bg-secondary text-muted-foreground hover:bg-accent'}`}
            onClick={() => setTool(toolName)}
            title={label}
        >
            <Icon size={20} />
        </button>
    );

    return (
        <div className="flex flex-col flex-1 w-full h-full bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
                <button
                    className="w-10 h-10 flex items-center justify-center bg-secondary rounded-lg text-muted-foreground hover:bg-accent transition-all"
                    onClick={() => navigate('/games/drawing')}
                >
                    <Home size={20} />
                </button>
                <div className="text-lg font-bold tracking-wider text-foreground">BẢNG VẼ TỰ DO</div>
                <button
                    className="w-10 h-10 flex items-center justify-center bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all"
                    onClick={downloadImage}
                    title="Tải xuống"
                >
                    <Download size={20} />
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-center gap-2 p-2 bg-card border-b border-border flex-wrap">
                {/* Tools */}
                <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
                    <ToolButton icon={Pencil} toolName="pencil" label="Bút vẽ" />
                    <ToolButton icon={Eraser} toolName="eraser" label="Tẩy" />
                    <ToolButton icon={Minus} toolName="line" label="Đường thẳng" />
                    <ToolButton icon={Circle} toolName="circle" label="Hình tròn" />
                    <ToolButton icon={Square} toolName="rectangle" label="Hình vuông" />
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-border" />

                {/* Colors */}
                <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
                    {COLORS.map(c => (
                        <button
                            key={c}
                            className={`w-7 h-7 rounded-full border-2 transition-all
                                ${color === c ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'}`}
                            style={{ backgroundColor: c }}
                            onClick={() => setColor(c)}
                        />
                    ))}
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-border" />

                {/* Brush Size */}
                <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
                    {BRUSH_SIZES.map(size => (
                        <button
                            key={size}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all
                                ${brushSize === size
                                    ? 'bg-teal-500 text-white'
                                    : 'text-muted-foreground hover:bg-accent'}`}
                            onClick={() => setBrushSize(size)}
                        >
                            <div
                                className="rounded-full bg-current"
                                style={{ width: Math.min(size, 16), height: Math.min(size, 16) }}
                            />
                        </button>
                    ))}
                </div>

                {/* Divider */}
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

            {/* Canvas Area */}
            <div className="flex-1 flex items-center justify-center p-2 bg-muted/30 overflow-hidden">
                <div className="bg-card rounded-lg shadow-lg border-2 border-border p-2">
                    <canvas
                        ref={canvasRef}
                        className="rounded cursor-crosshair touch-none"
                        style={{
                            width: canvasSize.width,
                            height: canvasSize.height,
                            maxWidth: '100%',
                            maxHeight: '100%'
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
            </div>

            {/* Current Tool Info */}
            <div className="flex items-center justify-center gap-4 p-2 bg-card border-t border-border text-sm text-muted-foreground">
                <span>Công cụ: <strong className="text-foreground">
                    {tool === 'pencil' && 'Bút vẽ'}
                    {tool === 'eraser' && 'Tẩy'}
                    {tool === 'line' && 'Đường thẳng'}
                    {tool === 'circle' && 'Hình tròn'}
                    {tool === 'rectangle' && 'Hình vuông'}
                </strong></span>
                <span>Màu: <span className="inline-block w-4 h-4 rounded align-middle" style={{ backgroundColor: color }} /></span>
                <span>Kích thước: <strong className="text-foreground">{brushSize}px</strong></span>
            </div>
        </div>
    );
};

export default DrawingGame;
