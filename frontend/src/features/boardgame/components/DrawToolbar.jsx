/**
 * DrawToolbar Component
 * External toolbar for DrawBoard game with color picker and tool buttons
 */
import React from 'react';
import { Paintbrush, Square, Circle, Eraser, Trash2, Save } from 'lucide-react';

const TOOLS = {
  BRUSH: 'brush',
  RECT: 'rect',
  OVAL: 'oval',
  ERASER: 'eraser',
};

const DrawToolbar = ({ 
  selectedColor, 
  selectedColorIndex, 
  tool, 
  onColorChange, 
  onToolChange,
  onClear,
  onSave,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 mt-4 p-3 bg-slate-800/80 rounded-xl border border-slate-700">
      {/* Tools section */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 mr-1">Tools:</span>
        
        <button
          onClick={() => onToolChange(TOOLS.BRUSH)}
          className={`p-2 rounded-lg transition-colors ${
            tool === TOOLS.BRUSH 
              ? 'bg-cyan-500 text-white' 
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          title="Brush - click/drag để vẽ"
        >
          <Paintbrush className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => onToolChange(TOOLS.RECT)}
          className={`p-2 rounded-lg transition-colors ${
            tool === TOOLS.RECT 
              ? 'bg-cyan-500 text-white' 
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          title="Rectangle - drag để vẽ hình chữ nhật"
        >
          <Square className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => onToolChange(TOOLS.OVAL)}
          className={`p-2 rounded-lg transition-colors ${
            tool === TOOLS.OVAL 
              ? 'bg-cyan-500 text-white' 
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          title="Oval - drag để vẽ hình tròn"
        >
          <Circle className="w-5 h-5" />
        </button>
        
        <button
          onClick={() => onToolChange(TOOLS.ERASER)}
          className={`p-2 rounded-lg transition-colors ${
            tool === TOOLS.ERASER 
              ? 'bg-cyan-500 text-white' 
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
          title="Eraser - xóa"
        >
          <Eraser className="w-5 h-5" />
        </button>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-slate-600" />

      {/* Colors section */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400 mr-1">Color:</span>
        
        <div className="flex gap-1">
          {/* Note: In a real app we might import DRAW_COLORS from DrawBoardGame.js */}
          {[
            { name: 'red', hex: '#ef4444' },
            { name: 'orange', hex: '#f97316' },
            { name: 'yellow', hex: '#eab308' },
            { name: 'green', hex: '#22c55e' },
            { name: 'cyan', hex: '#06b6d4' },
            { name: 'blue', hex: '#3b82f6' },
            { name: 'purple', hex: '#a855f7' },
            { name: 'pink', hex: '#ec4899' },
            { name: 'white', hex: '#f8fafc' },
          ].map((color, index) => (
            <button
              key={color.name}
              onClick={() => onColorChange(color.hex, index)} // Pass HEX code
              className={`w-7 h-7 rounded-full transition-transform ${
                selectedColorIndex === index 
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110' 
                  : 'hover:scale-110'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-8 w-px bg-slate-600" />

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
          title="Save artwork"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
        
        <button
          onClick={onClear}
          className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
          title="Clear canvas"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </button>
      </div>
    </div>
  );
};

export default DrawToolbar;
