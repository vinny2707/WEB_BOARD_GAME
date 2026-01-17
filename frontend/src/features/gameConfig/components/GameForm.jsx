import React from "react";
import { Save } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeProvider";
import { Spinner } from "@/components/ui/spinner";

/**
 * GameForm Component - Form for creating/editing games
 */
const GameForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEdit = false,
  loading = false,
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSettingsChange = (e) => {
    const value = e.target.value;
    try {
      const parsed = JSON.parse(value);
      setFormData((prev) => ({ ...prev, settings: parsed }));
    } catch {
      // Allow invalid JSON while typing
      setFormData((prev) => ({ ...prev, settings: value }));
    }
  };

  const inputClass = `w-full px-3 py-2 rounded-lg border transition-colors ${
    isDarkMode
      ? "bg-slate-800 border-slate-700 text-white focus:border-emerald-500"
      : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
  } focus:outline-none`;

  const labelClass = `block text-sm font-medium mb-1 ${
    isDarkMode ? "text-slate-300" : "text-gray-700"
  }`;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className={labelClass}>Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className={inputClass}
            placeholder="Caro Hàng 5"
          />
        </div>

        {/* Type */}
        <div>
          <label className={labelClass}>Type (unique) *</label>
          <input
            type="text"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            required
            disabled={isEdit}
            className={`${inputClass} disabled:opacity-50`}
            placeholder="caro_5"
          />
        </div>

        {/* Icon URL */}
        <div>
          <label className={labelClass}>Icon URL</label>
          <input
            type="text"
            name="icon"
            value={formData.icon}
            onChange={handleInputChange}
            className={inputClass}
            placeholder="https://example.com/icon.png"
          />
        </div>

        {/* Rows */}
        <div>
          <label className={labelClass}>Rows *</label>
          <input
            type="number"
            name="rows"
            value={formData.rows}
            onChange={handleInputChange}
            min="1"
            required
            className={inputClass}
          />
        </div>

        {/* Cols */}
        <div>
          <label className={labelClass}>Cols *</label>
          <input
            type="number"
            name="cols"
            value={formData.cols}
            onChange={handleInputChange}
            min="1"
            required
            className={inputClass}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="2"
          className={inputClass}
          placeholder="Mô tả ngắn về game..."
        />
      </div>

      {/* Rules */}
      <div>
        <label className={labelClass}>Rules</label>
        <textarea
          name="rules"
          value={formData.rules}
          onChange={handleInputChange}
          rows="3"
          className={inputClass}
          placeholder="Luật chơi chi tiết..."
        />
      </div>

      {/* Settings (JSON) */}
      <div>
        <label className={labelClass}>Settings (JSON)</label>
        <textarea
          value={
            typeof formData.settings === "object"
              ? JSON.stringify(formData.settings, null, 2)
              : formData.settings
          }
          onChange={handleSettingsChange}
          rows="3"
          className={`${inputClass} font-mono text-sm`}
          placeholder='{"winCondition": 5}'
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
            isDarkMode
              ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
            isDarkMode
              ? "bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
              : "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          }`}
        >
          {loading ? <Spinner size="sm" /> : <Save className="w-4 h-4" />}
          {isEdit ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

export default GameForm;
