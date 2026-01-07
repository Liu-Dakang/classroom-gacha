import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Sparkles, Star, Trophy, RefreshCw, Award, BarChart3, Users, Download, Upload, ThumbsDown, X, Trash2 } from 'lucide-react';
import Card from './components/Card';
import { RARITY_CONFIG } from './constants';
import { Student, RarityLevel, Stats, ItemCard as ItemCardType, StudentItem } from './types';
import ItemCard from './components/ItemCard';

export default function App() {
  // --- State ---
  // Initialize from localStorage or fallback to default
  const [students, setStudents] = useState<Student[]>([]);
  const API_URL = 'http://localhost:8000';

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_URL}/students`);
      if (response.ok) {
        const data = await response.json();
        // Map backend snake_case to frontend camelCase
        const mappedStudents = data.map((s: any) => ({
          id: s.id,
          name: s.name,
          dormNumber: s.dorm_number,
          stars: s.stars,
          pickCount: s.pick_count // Map pick_count to pickCount
        }));
        setStudents(mappedStudents);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnStudent, setDrawnStudent] = useState<Student | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);

  // New state for manual adjustment modal
  const [manualSelection, setManualSelection] = useState<Student | null>(null);

  // Item State
  const [drawnItem, setDrawnItem] = useState<ItemCardType | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [studentItems, setStudentItems] = useState<StudentItem[]>([]);
  const [previewItem, setPreviewItem] = useState<StudentItem | null>(null);
  const [isInteractionComplete, setIsInteractionComplete] = useState(false);

  // File input ref for import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Persistence ---
  const updateStudentOnBackend = async (student: Student) => {
    try {
      // Map back to snake_case for backend
      const payload = {
        name: student.name,
        dorm_number: student.dormNumber,
        stars: student.stars,
        pick_count: student.pickCount
      };

      await fetch(`${API_URL}/students/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Failed to update student:", error);
    }
  };

  const deleteStudentOnBackend = async (id: number) => {
    try {
      await fetch(`${API_URL}/students/${id}`, {
        method: 'DELETE',
      });
      setStudents(prev => prev.filter(s => s.id !== id));
      if (manualSelection?.id === id) {
        setManualSelection(null);
      }
    } catch (error) {
      console.error("Failed to delete student:", error);
    }
  };

  const fetchStudentItems = async (studentId: number) => {
    try {
      const response = await fetch(`${API_URL}/students/${studentId}/items`);
      if (response.ok) {
        const data = await response.json();
        setStudentItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch student items:", error);
    }
  };

  const drawItem = async (studentId: number) => {
    try {
      const response = await fetch(`${API_URL}/students/${studentId}/draw_item`, { method: 'POST' });
      if (response.ok) {
        const item = await response.json();
        setDrawnItem(item);
        setShowItemModal(true);
        fetchStudentItems(studentId); // Refresh inventory
      }
    } catch (error) {
      console.error("Failed to draw item:", error);
    }
  };

  const useItem = async (itemId: number) => {
    if (!window.confirm("确认使用这张卡片吗？使用后将销毁。")) return;
    try {
      await fetch(`${API_URL}/student_items/${itemId}`, { method: 'DELETE' });
      setStudentItems(prev => prev.filter(i => i.id !== itemId));
      alert("卡片已使用！");
    } catch (error) {
      console.error("Failed to use item:", error);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(students, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `classroom_gacha_backup_${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (!window.confirm('确认导入该Excel文件吗？这将覆盖当前所有数据。\nConfirm import? This will overwrite all data.')) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/import_excel`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert(`导入成功！共 ${result.count} 条数据。\nImport successful!`);
        fetchStudents();
      } else {
        const err = await response.json();
        alert(`导入失败: ${err.detail}\nImport failed.`);
      }
    } catch (error) {
      console.error(error);
      alert('上传失败，请检查后端连接。\nUpload failed. Check backend connection.');
    }
  };

  // --- Logic ---

  // Gacha algorithm
  const handleDraw = () => {
    if (isDrawing) return;
    setIsDrawing(true);
    setShowResult(false);
    setShowLevelUp(false);
    setDrawnStudent(null);
    setStudentItems([]);
    setIsInteractionComplete(false);

    // 1. Priority Pool: Never picked students
    const neverPicked = students.filter(s => s.pickCount === 0);

    let targetId: number;

    if (neverPicked.length > 0) {
      // Pure random from unpicked
      const randomIndex = Math.floor(Math.random() * neverPicked.length);
      targetId = neverPicked[randomIndex].id;
    } else {
      // 2. Weighted Pool: Lower stars = Higher weight (protect high star students)
      // Weight formula: 60 / (stars + 1)
      let weightedPool: number[] = [];
      students.forEach(student => {
        const weight = Math.floor(60 / (student.stars + 1));
        for (let i = 0; i < weight; i++) {
          weightedPool.push(student.id);
        }
      });
      const randomIndex = Math.floor(Math.random() * weightedPool.length);
      targetId = weightedPool[randomIndex];
    }

    const selected = students.find(s => s.id === targetId);

    // Animation Sequence
    setTimeout(() => {
      if (selected) {
        setDrawnStudent(selected);
        fetchStudentItems(selected.id);
      }
    }, 2000);

    setTimeout(() => {
      setIsDrawing(false);
      setShowResult(true);
    }, 3500);
  };

  // Reset to initial state
  const handleReset = () => {
    setDrawnStudent(null);
    setShowResult(false);
    setShowLevelUp(false);
    setStudentItems([]);
    setIsInteractionComplete(false);
  };

  // Handle user response (Gacha flow)
  const handleUpdateStats = (starChange: number) => {
    if (!drawnStudent) return;

    setStudents(prev => prev.map(s => {
      if (s.id === drawnStudent.id) {
        // Calculate new stars, clamped min 0, no max
        const newStars = Math.max(0, s.stars + starChange);

        const updatedStudent = {
          ...s,
          pickCount: s.pickCount + 1,
          stars: newStars
        };
        updateStudentOnBackend(updatedStudent); // Sync backend
        return updatedStudent;
      }
      return s;
    }));

    if (starChange > 0) {
      // Trigger level up animation
      setDrawnStudent(prev => prev ? ({ ...prev, stars: prev.stars + 1 }) : null);
      setShowLevelUp(true);

      // Draw Item Chance (Always draw for now as per requirement "when answer correct")
      if (drawnStudent) {
        setTimeout(() => {
          drawItem(drawnStudent.id);
        }, 1000);
      }

      // Auto close result panel after 2s (will show item modal over it if needed, or close result first?)
      // User flow: Correct -> Level Up Anim -> Item Modal -> Stay on screen
      // setTimeout(() => closeResult(), 2000); // Removed auto-close
      setIsInteractionComplete(true);
    } else {
      setIsInteractionComplete(true);
    }
  };

  const closeResult = () => {
    setShowResult(false);
    setDrawnStudent(null);
    setShowLevelUp(false);
    setStudentItems([]);
  };

  // Handle manual star adjustment (Sidebar flow)
  const handleManualStarChange = (studentId: number, change: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const newStars = Math.max(0, s.stars + change);
        const updatedStudent = { ...s, stars: newStars };

        // Update the modal view as well
        if (manualSelection && manualSelection.id === studentId) {
          setManualSelection(updatedStudent);
        }
        if (drawnStudent && drawnStudent.id === studentId) {
          setDrawnStudent(updatedStudent);
        }
        updateStudentOnBackend(updatedStudent); // Sync backend
        return updatedStudent;
      }
      return s;
    }));
  };

  // Fetch items when manual selection opens
  useEffect(() => {
    if (manualSelection) {
      fetchStudentItems(manualSelection.id);
    } else {
      // Careful: if we clear items here, it might clear items for the drawn student if we are just closing the modal?
      // But drawnStudent items are fetched in handleDraw.
      // Let's safe-guard: Only clear if NO drawn student or if drawn student is not the one we just closed?
      // Actually, simplest is to just clear. The user flow "Show Left Personal Pack" implies valid Drawn Student.
      // If we are in "Manual Mode", we are likely not "Drawing" or we are inspecting.
      if (!drawnStudent) {
        setStudentItems([]);
      } else {
        // Restore drawn student items if we closed manual modal and there is an active drawn student
        fetchStudentItems(drawnStudent.id);
      }
    }
  }, [manualSelection]);

  // --- Stats ---
  const stats: Stats = useMemo(() => {
    const total = students.length;
    const picked = students.filter(s => s.pickCount > 0).length;
    return {
      progress: Math.round((picked / total) * 100),
      unpickedCount: total - picked
    };
  }, [students]);

  // Sorted Lists
  const sortedByCount = useMemo(() =>
    [...students].sort((a, b) => b.pickCount - a.pickCount || b.stars - a.stars),
    [students]);

  const sortedByStars = useMemo(() =>
    [...students].sort((a, b) => b.stars - a.stars || b.pickCount - a.pickCount),
    [students]);

  // CSS injection for keyframes
  const animationStyles = `
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(50%); }
    }
    .animate-shimmer {
      animation: shimmer 2s infinite linear;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
    .animate-holo-shine {
      background-size: 200% 200%;
      animation: bg-pan 3s linear infinite;
    }
    @keyframes summon-spin {
      0% { 
        transform: scale(0.8) rotateY(0deg);
        filter: brightness(1);
      }
      50% { 
        transform: scale(1.1) rotateY(900deg);
        filter: brightness(1.5);
      }
      100% { 
        transform: scale(1) rotateY(1800deg);
        filter: brightness(1);
      }
    }
    .animate-summon-spin {
      animation: summon-spin 3s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
    }
  `;

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-indigo-500 overflow-hidden flex flex-col md:flex-row">
      <style>{animationStyles}</style>

      {/* --- Main Area (Left/Center) --- */}
      <div className="flex-1 flex flex-col items-center justify-center relative p-4 h-screen md:h-auto">

        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[128px] opacity-20"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[128px] opacity-20"></div>
        </div>

        {/* Header */}
        <div className="z-10 absolute top-6 left-6">
          <h1 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
            <Sparkles className="text-yellow-400" />
            知识召唤阵
          </h1>
          <p className="text-slate-400 text-sm mt-1">Classroom Gacha System</p>
        </div>

        {/* Stats Summary (Mobile Top Right / Desktop Top Left below Header) */}
        <div className="z-10 absolute top-6 right-6 md:right-auto md:left-6 md:top-28 flex flex-col gap-2">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 p-3 rounded-lg text-xs">
            <div className="flex justify-between mb-1">
              <span className="text-slate-400">覆盖率</span>
              <span className="font-bold text-green-400">{stats.progress}%</span>
            </div>
            <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${stats.progress}%` }}></div>
            </div>
            <div className="mt-2 text-slate-400">
              剩余未点名: <span className="text-white font-bold">{stats.unpickedCount}</span> 人
            </div>
          </div>
        </div>

        {/* Left Side Inventory */}
        <div className="z-10 absolute left-6 bottom-6 md:top-48 md:bottom-auto flex flex-col gap-4 w-64">
          {studentItems.length > 0 && !isDrawing && (
            <div className="animate-in slide-in-from-left duration-500">
              <div className="bg-slate-800/80 backdrop-blur border border-slate-600/50 p-4 rounded-xl shadow-xl">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Award size={14} /> 个人道具包
                </h3>
                <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto custom-scrollbar pr-1">
                  {studentItems.map(si => (
                    <div key={si.id} onClick={() => setPreviewItem(si)} className="cursor-pointer hover:scale-105 transition-transform">
                      <ItemCard
                        item={si.item_card}
                        size="small"
                        showDetails={true}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side Ranks (Floating in Main Area) */}
        {!isDrawing && (
          <div className="z-10 absolute right-6 top-6 w-64 flex flex-col gap-4 animate-in slide-in-from-right duration-700">
            {/* Hard Work Rank (Pick Count) */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-4 rounded-xl shadow-2xl">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <RefreshCw size={12} />
                勤奋榜 (被点名次数)
              </h3>
              <div className="space-y-2">
                {sortedByCount.slice(0, 5).map((student, i) => (
                  <div key={student.id} className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-lg border border-slate-700/30">
                    <div className={`w-6 h-6 flex items-center justify-center rounded font-bold text-xs ${i === 0 ? 'bg-yellow-500 text-yellow-900' : 'bg-slate-700 text-slate-400'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 text-sm font-medium text-slate-300">{student.name}</div>
                    <div className="text-xs font-mono text-slate-500">{student.pickCount}次</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lucky Rank (Stars) */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 p-4 rounded-xl shadow-2xl">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Trophy size={12} />
                欧皇榜 (星级排行)
              </h3>
              <div className="space-y-2">
                {sortedByStars.filter(s => s.stars > 0).slice(0, 5).map((student, i) => {
                  const rKey = (student.stars >= 0 && student.stars <= 5 ? student.stars : 0) as RarityLevel;
                  return (
                    <div key={student.id} className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-lg border border-slate-700/30">
                      <div className="font-bold text-sm text-slate-500 w-4">{i + 1}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-200">{student.name}</span>
                          <span className={`text-[10px] px-1 rounded border ${RARITY_CONFIG[rKey].color} ${RARITY_CONFIG[rKey].border} bg-opacity-20`}>
                            {RARITY_CONFIG[rKey].label}
                          </span>
                        </div>
                      </div>
                      <div className="font-bold text-yellow-500 font-mono text-xs">
                        {student.stars} ★
                      </div>
                    </div>
                  );
                })}
                {sortedByStars.filter(s => s.stars > 0).length === 0 && (
                  <div className="text-center text-slate-600 text-xs py-2 italic opacity-50">
                    暂无数据
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Summoning Area */}
        <div className="z-20 flex flex-col items-center gap-8">

          {/* Card Slot */}
          <div
            className={`
              transition-all duration-700 transform perspective-[1000px]
              ${isDrawing ? 'animate-summon-spin' : 'animate-float'}
            `}
          >
            <Card
              student={drawnStudent || { id: -1, stars: 0, name: '???', pickCount: 0 }}
              isRevealed={showResult}
              size="large"
            />


          </div>

          {/* Action Buttons */}
          {!showResult && (
            <button
              onClick={handleDraw}
              disabled={isDrawing}
              className={`
                group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full 
                font-black text-xl tracking-widest shadow-lg shadow-indigo-500/30 
                transition-all duration-200 
                ${isDrawing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-indigo-500/50 active:scale-95'}
              `}
            >
              {isDrawing ? '召唤中...' : '开始抽卡'}
              <div className="absolute inset-0 rounded-full border border-white/20 group-hover:scale-105 transition-transform"></div>
            </button>
          )}

          {/* Result Interactions */}
          {showResult && !isInteractionComplete && (
            <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-2xl">

              {showLevelUp && (
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 whitespace-nowrap z-50">
                  <span className="text-4xl font-black text-yellow-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] animate-bounce">
                    LEVEL UP! 🌟
                  </span>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => handleUpdateStats(-1)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-bold shadow-lg shadow-red-900/20 transition-all flex items-center gap-2 transform hover:-translate-y-1"
                >
                  <ThumbsDown size={20} />
                  回答错误 (降星)
                </button>

                <button
                  onClick={() => handleUpdateStats(0)}
                  className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold transition-colors flex items-center gap-2"
                >
                  跳过 / 平局
                </button>

                <button
                  onClick={() => handleUpdateStats(1)}
                  disabled={showLevelUp}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold shadow-lg shadow-green-900/20 transition-all flex items-center gap-2 transform hover:-translate-y-1"
                >
                  <Award size={20} />
                  回答正确 (升星)
                </button>
              </div>
            </div>
          )}

          {/* Next Student Button -> Reset Button */}
          {showResult && isInteractionComplete && (
            <button
              onClick={handleReset}
              className="px-10 py-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-full font-bold text-xl shadow-lg border-2 border-slate-500 animate-in zoom-in-50 duration-300 hover:scale-105 active:scale-95 transition-transform"
            >
              重置 (Reset)
            </button>
          )}
        </div>
      </div>

      {/* --- Sidebar (Right) --- */}
      <div className="w-full md:w-80 bg-slate-800/50 border-l border-slate-700/50 backdrop-blur-xl flex flex-col h-[40vh] md:h-screen z-30">
        <div className="p-4 border-b border-slate-700/50 bg-slate-800/80 sticky top-0 z-20 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg flex items-center gap-2 text-slate-200">
              <BarChart3 className="text-indigo-400" size={20} />
              班级风云榜
            </h2>
          </div>

          {/* Data Controls */}
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-xs py-2 rounded transition-colors text-slate-300"
              title="导出当前数据"
            >
              <Download size={14} /> 导出
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-xs py-2 rounded transition-colors text-slate-300"
              title="导入数据文件"
            >
              <Upload size={14} /> 导入
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              className="hidden"
              accept=".xlsx, .xls"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">



          {/* Full List */}
          <div className="pt-4 border-t border-slate-700/50">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users size={12} />
              全班卡池状态 (点击可调整)
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {students.map(student => (
                <div
                  key={student.id}
                  onClick={() => setManualSelection(student)}
                  className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-95"
                >
                  <Card student={student} isRevealed={true} size="small" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* --- Manual Adjustment Modal --- */}
      {manualSelection && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setManualSelection(null)}
        >
          <div
            className="bg-slate-800 rounded-2xl border border-slate-600 p-6 max-w-sm w-full shadow-2xl relative flex flex-col items-center gap-6"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              onClick={() => setManualSelection(null)}
            >
              <X size={24} />
            </button>

            <h3 className="text-xl font-bold text-slate-200">手动调整</h3>

            <Card student={manualSelection} isRevealed={true} size="large" />

            {/* Inventory in Modal */}
            {studentItems.length > 0 && (
              <div className="w-full">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">我的卡包</h4>
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {studentItems.map(si => (
                    <div key={si.id} onClick={() => setPreviewItem(si)} className="cursor-pointer flex-shrink-0 transition-transform duration-300 hover:scale-105 active:scale-95">
                      <ItemCard item={si.item_card} size="small" showDetails={false} className="w-24 h-32" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 w-full justify-center">
              <button
                onClick={() => handleManualStarChange(manualSelection.id, -1)}
                className="flex-1 py-3 bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 text-red-200 rounded-xl flex items-center justify-center gap-2 font-bold transition-all hover:scale-105 active:scale-95"
              >
                <ThumbsDown size={18} /> 降星
              </button>
              <button
                onClick={() => handleManualStarChange(manualSelection.id, 1)}
                className="flex-1 py-3 bg-green-500/20 border border-green-500/50 hover:bg-green-500/30 text-green-200 rounded-xl flex items-center justify-center gap-2 font-bold transition-all hover:scale-105 active:scale-95"
              >
                <Award size={18} /> 升星
              </button>
            </div>

            <button
              onClick={() => {
                if (window.confirm(`确定要删除学生 ${manualSelection.name} 吗？此操作不可恢复。`)) {
                  deleteStudentOnBackend(manualSelection.id);
                }
              }}
              className="w-full py-2 bg-slate-700/50 hover:bg-red-900/50 text-slate-400 hover:text-red-400 rounded-lg text-sm transition-colors border border-transparent hover:border-red-900"
            >
              删除该学生
            </button>
          </div>
        </div>
      )}

      {/* --- Item Draw Modal --- */}
      {showItemModal && drawnItem && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300"
          onClick={() => setShowItemModal(false)}
        >
          <div
            className="flex flex-col items-center gap-6 animate-in zoom-in-50 duration-500"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-4xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
              ITEM GET!
            </div>

            <ItemCard item={drawnItem} size="large" showDetails={true} />

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">{drawnItem.name}</h2>
              <p className="text-indigo-200 tex-sm max-w-sm">{drawnItem.description}</p>
            </div>

            <button
              onClick={() => setShowItemModal(false)}
              className="mt-4 px-8 py-3 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-full shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
            >
              收下 (Keep)
            </button>
          </div>
        </div>
      )}

      {/* --- Item Preview Modal --- */}
      {previewItem && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300"
          onClick={() => setPreviewItem(null)}
        >
          <div className="relative animate-in zoom-in-75 duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center gap-6">
              <ItemCard item={previewItem.item_card} size="large" showDetails={true} className="shadow-2xl shadow-amber-500/20 scale-125" />

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setPreviewItem(null)}
                  className="px-6 py-2 rounded-full border border-slate-500 text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  返回 (Return)
                </button>
                <button
                  onClick={() => {
                    useItem(previewItem.id);
                    setPreviewItem(null);
                  }}
                  className="px-8 py-2 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-600/30 transition-transform hover:scale-105"
                >
                  使用 (Use)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}