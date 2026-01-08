import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Sparkles, Star, Trophy, RefreshCw, Award, BarChart3, Users, Download, Upload, ThumbsDown, X, Trash2, Skull, LogOut } from 'lucide-react';
import Card from './components/Card';
import ShieldEffect from './components/ShieldEffect';
import MarkTargetEffect from './components/MarkTargetEffect';
import ExpPotionEffect from './components/ExpPotionEffect';
import MassSilenceEffect from './components/MassSilenceEffect';
import DoomsdayEffect from './components/DoomsdayEffect';
import LegionGloryEffect from './components/LegionGloryEffect';
import ShadowRaidEffect from './components/ShadowRaidEffect';
import BerserkerTrialEffect from './components/BerserkerTrialEffect';
import ManaDrainEffect from './components/ManaDrainEffect';
import StealthCloakEffect from './components/StealthCloakEffect';
import SanctuaryEffect from './components/SanctuaryEffect';
import UniversalSalvationEffect from './components/UniversalSalvationEffect';
import DarkCurseEffect from './components/DarkCurseEffect';
import PurificationEffect from './components/PurificationEffect';
import AbyssalGazeEffect from './components/AbyssalGazeEffect';
import OneManGuardEffect from './components/OneManGuardEffect';
import RoyalPKEffect from './components/RoyalPKEffect';
import DestinyRouletteEffect from './components/DestinyRouletteEffect';
import ChainLightningEffect from './components/ChainLightningEffect';
import RouletteEffect from './components/RouletteEffect';
import { RARITY_CONFIG } from './constants';
import { Student, RarityLevel, Stats, ItemCard as ItemCardType, StudentItem } from './types';
import ItemCard from './components/ItemCard';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import { playSound } from './utils/sound';

export default function App() {
  // --- State ---
  // Initialize from localStorage or fallback to default
  const [students, setStudents] = useState<Student[]>([]);
  const API_URL = 'http://localhost:8000';

  // Auth State
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState<string | null>(localStorage.getItem('username'));
  const [isAdmin, setIsAdmin] = useState<boolean>(localStorage.getItem('isAdmin') === 'true');

  const handleLogin = (newToken: string, username: string, admin: boolean) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', username);
    localStorage.setItem('isAdmin', String(admin));
    setToken(newToken);
    setCurrentUser(username);
    setIsAdmin(admin);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('isAdmin');
    setToken(null);
    setCurrentUser(null);
    setIsAdmin(false);
    setStudents([]);
  };

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const headers: HeadersInit = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };

    try {
      const res = await fetch(url, { ...options, headers });
      if (res.status === 401) {
        handleLogout();
        throw new Error("Unauthorized");
      }
      return res;
    } catch (e) {
      throw e;
    }
  };

  useEffect(() => {
    if (token && !isAdmin) {
      fetchStudents();
    }
  }, [token, isAdmin]);



  const fetchStudents = async () => {
    if (!token) return;
    try {
      const response = await authFetch(`${API_URL}/students`);
      if (response.ok) {
        const data = await response.json();
        const mappedStudents = data.map((s: any) => ({
          id: s.id,
          name: s.name,
          dormNumber: s.dorm_number,
          stars: s.stars,
          pickCount: s.pick_count,
          immunity: s.immunity || 0,
          isCursed: s.is_cursed || false
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
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [pendingItemId, setPendingItemId] = useState<number | null>(null);

  // Roulette State
  const [showRoulette, setShowRoulette] = useState(false);
  const [rouletteItems, setRouletteItems] = useState<ItemCardType[]>([]);
  const [pendingDrawnItem, setPendingDrawnItem] = useState<ItemCardType | null>(null);
  const [pkOpponent, setPkOpponent] = useState<Student | null>(null);

  const [chainPath, setChainPath] = useState<{ student: Student; status: 'hit' | 'miss' }[]>([]);
  const [pendingTargetStudentId, setPendingTargetStudentId] = useState<number | null>(null);

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
        pick_count: student.pickCount,
        immunity: student.immunity,
        is_cursed: student.isCursed
      };

      await authFetch(`${API_URL}/students/${student.id}`, {
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
      await authFetch(`${API_URL}/students/${id}`, {
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
      const res = await authFetch(`${API_URL}/students/${studentId}/items`);
      if (res.ok) {
        const data = await res.json();
        setStudentItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch student items:", error);
    }
  };

  const fetchAllItems = async () => {
    try {
      const res = await authFetch(`${API_URL}/items`);
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      console.error("Failed to fetch items pool:", error);
    }
    return [];
  };

  const drawItem = async (studentId: number, poolType: string = 'normal') => {
    try {
      const res = await authFetch(`${API_URL}/students/${studentId}/draw_item?pool_type=${poolType}`, { method: 'POST' });
      if (res.ok) {
        const item = await res.json();
        // Prepare Roulette
        const pool = await fetchAllItems();
        setRouletteItems(pool);
        setPendingDrawnItem(item);
        setPendingTargetStudentId(studentId);
        setShowRoulette(true);
      }
    } catch (error) {
      console.error("Failed to draw item:", error);
    }
  };

  const handleRouletteComplete = () => {
    setShowRoulette(false);
    if (!pendingDrawnItem || !pendingTargetStudentId) return;

    const item = pendingDrawnItem;
    const studentId = pendingTargetStudentId;

    if (item.name === "群体沉默") {
      setDrawnItem(item);
      setActiveEffect("mass_silence");
      fetchStudentItems(studentId);
      playSound("群体沉默");
    } else if (item.name === "末日审判") {
      setDrawnItem(item);
      setActiveEffect("doomsday");
      fetchStudentItems(studentId);
      playSound("末日审判");
    } else if (item.name === "黑暗诅咒") {
      setDrawnItem(item);
      setActiveEffect("dark_curse");
      fetchStudentItems(studentId);
      playSound("黑暗诅咒");
    } else if (item.name === "一夫当关") {
      setDrawnItem(item);
      setActiveEffect("one_man_guard");
      fetchStudentItems(studentId);
    } else if (item.name === "连锁闪电") {
      setDrawnItem(item);
      // Calculate chain immediately
      const initialTarget = students.find(s => s.id === studentId);
      if (initialTarget) {
        let currentPool = students.filter(s => s.id !== initialTarget.id);
        let path = [];
        let currentTarget = initialTarget;
        let jumps = 0;
        let isHit = false;

        // First step (Self)
        // 50% chance
        if (Math.random() < 0.5) {
          path.push({ student: currentTarget, status: 'hit' });
          isHit = true;
        } else {
          path.push({ student: currentTarget, status: 'miss' });
        }

        // Jumps
        while (!isHit && jumps < 3 && currentPool.length > 0) {
          jumps++;
          // Pick next random
          const nextIndex = Math.floor(Math.random() * currentPool.length);
          currentTarget = currentPool[nextIndex];
          // Remove from pool to avoid duplicates
          currentPool.splice(nextIndex, 1);

          if (Math.random() < 0.5) {
            path.push({ student: currentTarget, status: 'hit' as const });
            isHit = true;
          } else {
            path.push({ student: currentTarget, status: 'miss' as const });
          }
        }
        setChainPath(path);
        setActiveEffect("chain_lightning");
        playSound("连锁闪电");
      }
      fetchStudentItems(studentId);
    } else {
      setDrawnItem(item);
      setShowItemModal(true);
      fetchStudentItems(studentId);
    }

    setPendingDrawnItem(null);
    setPendingTargetStudentId(null);
  };

  const executeUseItem = async (itemId: number) => {
    try {
      const res = await authFetch(`${API_URL}/student_items/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        setStudentItems(prev => prev.filter(i => i.id !== itemId));
      }
    } catch (error) {
      console.error("Failed to use item:", error);
    }
  };

  const useItem = async (studentItem: StudentItem) => {
    console.log("Using item:", studentItem.item_card.name, "ID:", studentItem.item_card.id);
    if (!window.confirm("确认使用这张卡片吗？使用后将销毁。")) return;

    if (studentItem.item_card.name === "绝对防御") {
      setPreviewItem(null);
      setPendingItemId(studentItem.id);
      setActiveEffect("shield");
      playSound("绝对防御");
    } else if (studentItem.item_card.name === "标记目标") {
      // Logic for "Mark Target":
      // 1. Trigger Effect UI (Random Shuffle)
      // 2. Effect calls back with new student
      // 3. We REPLACE the currently drawn student with this new one
      // 4. Then we consume the item.
      setPreviewItem(null);
      setPendingItemId(studentItem.id);
      setActiveEffect("mark_target");
      playSound("标记目标");
    } else if (studentItem.item_card.name === "经验药水") {
      setPreviewItem(null);
      setPendingItemId(studentItem.id);
      setActiveEffect("exp_potion");
      playSound("经验药水");
    } else if (studentItem.item_card.name === "军团荣耀") {
      setPreviewItem(null);
      setPendingItemId(studentItem.id);
      setActiveEffect("legion_glory");
    } else if (studentItem.item_card.name === "暗影突袭") {
      setPreviewItem(null);
      setPendingItemId(studentItem.id);
      setActiveEffect("shadow_raid");
      playSound("暗影突袭");
    } else if (studentItem.item_card.name === "狂战士试炼") {
      setPreviewItem(null);
      setPendingItemId(studentItem.id);
      setActiveEffect("berserker_trial");
      playSound("狂战士试炼");
    } else if (studentItem.item_card.name === "法力汲取") {
      setPreviewItem(null);
      setPendingItemId(studentItem.id);
      setActiveEffect("mana_drain");
      playSound("法力汲取");
    } else if (studentItem.item_card.name === "潜行斗篷") {
      setPreviewItem(null);
      setPendingItemId(studentItem.id);
      setActiveEffect("stealth_cloak");
      playSound("隐身");
    } else if (studentItem.item_card.name === "结界：庇护所") {
      setPreviewItem(null);
      setPendingItemId(studentItem.id);
      setActiveEffect("sanctuary");
      playSound("结界：庇护所");
    } else if (studentItem.item_card.name === "普渡众生") {
      setPreviewItem(null);
      setPendingItemId(studentItem.id);
      setActiveEffect("universal_salvation");
      playSound("普渡众生");
    } else if (studentItem.item_card.name === "净化术") {
      setPreviewItem(null);
      setPendingItemId(studentItem.id);
      setActiveEffect("purification");
      playSound("净化术");
    } else if (studentItem.item_card.name === "生命圣水") {
      await executeUseItem(studentItem.id);
      setPreviewItem(null);
      playSound("生命圣水");
      alert("使用了生命圣水！");
    } else if (studentItem.item_card.name === "吟游诗人") {
      await executeUseItem(studentItem.id);
      setPreviewItem(null);
      playSound("吟游诗人");
      alert("使用了吟游诗人！");
    } else if (studentItem.item_card.name.toLowerCase() === "boss挑战券") {
      await executeUseItem(studentItem.id);
      setPreviewItem(null);
      playSound("boss挑战券");
      alert("使用了boss挑战券！");
    } else if (studentItem.item_card.name === "深渊凝视") {
      setPreviewItem(null);
      setPendingItemId(studentItem.id);
      setActiveEffect("abyssal_gaze");
      playSound("深渊凝视");
    } else if (studentItem.item_card.name === "皇城PK") {
      console.log("Triggering Royal PK");
      // Pick random opponent
      const otherStudents = students.filter(s => s.id !== studentItem.student_id);
      console.log("Opponent pool size:", otherStudents.length);

      if (otherStudents.length > 0) {
        const opponent = otherStudents[Math.floor(Math.random() * otherStudents.length)];
        console.log("Selected opponent:", opponent.name);
        setPkOpponent(opponent);
        setPreviewItem(null);
        setPendingItemId(studentItem.id);
        setActiveEffect("royal_pk");
        playSound("皇城PK");
      } else {
        alert("没有对手！");
      }
    } else if (studentItem.item_card.name === "命运轮盘") {
      setPreviewItem(null);
      setPendingItemId(studentItem.id);
      setActiveEffect("destiny_roulette");
    } else {
      await executeUseItem(studentItem.id);
      setPreviewItem(null);
      alert("卡片已使用！");
    }
  };

  const handleEffectComplete = async (payload?: any) => {
    if (activeEffect === "mark_target" && payload) {
      setDrawnStudent(payload);
      fetchStudentItems(payload.id);
    }

    if (activeEffect === "exp_potion") {
      if (drawnStudent) {
        handleManualStarChange(drawnStudent.id, 1);
      } else if (manualSelection) {
        handleManualStarChange(manualSelection.id, 1);
      }
    }

    if (activeEffect === "mass_silence") {
      if (drawnStudent && drawnStudent.dormNumber) {
        // Find all students in same dorm
        const dormMates = students.filter(s => s.dormNumber === drawnStudent.dormNumber);

        // Deduct 1 star for each (min 0)
        // We use loop to update backend for each
        // Note: Parallel requests might be heavy? But it's small scale.
        dormMates.forEach(mate => {
          handleManualStarChange(mate.id, -1);
        });
      }

      // Try to delete the silence card from inventory if it exists
      // We need to find the student_item id.
      // Since we refreshed inventory in drawItem, studentItems should have it?
      // Wait, handleEffectComplete is called AFTER invalidation? 
      // studentItems state might not be updated immediately in this closure if we didn't wait.
      // But for visual effect duration (3.5s) it should be enough time for state update / refetch.
      // Actually state updates are async.
      // Let's just re-fetch in drawItem and hope it is here.
      // Or we can just do a precise search.

      // Simplest strategy: Fetch items again, find "群体沉默", delete it.
      // We use the API directly to avoid state dependency issues if possible, or use current state.
      if (drawnStudent) {
        try {
          const res = await authFetch(`${API_URL}/students/${drawnStudent.id}/items`);
          if (res.ok) {
            const items: StudentItem[] = await res.json();
            const silenceItem = items.find(i => i.item_card.name === "群体沉默");
            if (silenceItem) {
              await executeUseItem(silenceItem.id);
            }
          }
        } catch (e) { console.error(e); }
      }
    }

    if (activeEffect === "doomsday") {
      // Deduct 1 star from EVERYONE
      students.forEach(s => {
        handleManualStarChange(s.id, -1);
      });

      // Try to delete item from inventory (similar logic to mass silence)
      if (drawnStudent) {
        try {
          const res = await authFetch(`${API_URL}/students/${drawnStudent.id}/items`);
          if (res.ok) {
            const items: StudentItem[] = await res.json();
            const doomItem = items.find(i => i.item_card.name === "末日审判");
            if (doomItem) {
              await executeUseItem(doomItem.id);
            }
          }
        } catch (e) { console.error(e); }
      }
    }

    if (activeEffect === "legion_glory") {
      const student = drawnStudent || manualSelection;
      if (student && student.dormNumber) {
        const dormMates = students.filter(s => s.dormNumber === student.dormNumber);
        dormMates.forEach(mate => {
          handleManualStarChange(mate.id, 1);
        });
      }
    }

    if (activeEffect === "shadow_raid" && payload) {
      // Payload is the victim student
      handleManualStarChange(payload.id, -1);
    }

    if (activeEffect === "berserker_trial" && payload) {
      // Payload is the winner student
      handleManualStarChange(payload.id, 1);
    }

    if (activeEffect === "mana_drain" && payload) {
      // Payload: { success: boolean, target: Student }
      // We also need the USER (drawnStudent or manualSelection)
      // Priority: If manual modal is open (manualSelection), use that. Otherwise use drawnStudent.
      const user = manualSelection || drawnStudent;
      if (!user) return; // Should not happen

      if (payload.success) {
        // Success: Target -2, User +2
        handleManualStarChange(payload.target.id, -2);
        handleManualStarChange(user.id, 2);
      } else {
        // Fail: User -1
        handleManualStarChange(user.id, -1);
      }
    }

    // Stealth Cloak logic
    if (activeEffect === "stealth_cloak") {
      const user = drawnStudent || manualSelection;
      if (user) {
        try {
          await authFetch(`${API_URL}/students/${user.id}/immunity?immunity=3`, { method: 'PUT' });
          // We delay fetch just a bit or assume handleDraw next time will get fresh data
        } catch (e) { console.error(e); }
      }
    }

    // Sanctuary logic
    if (activeEffect === "sanctuary") {
      const user = drawnStudent || manualSelection;
      if (user && user.dormNumber) {
        const dormMates = students.filter(s => s.dormNumber === user.dormNumber);
        for (const mate of dormMates) {
          const newImmunity = Math.max(mate.immunity || 0, 1);
          try {
            await authFetch(`${API_URL}/students/${mate.id}/immunity?immunity=${newImmunity}`, { method: 'PUT' });
          } catch (e) { console.error(e); }
        }
      }
    }


    // Universal Salvation
    if (activeEffect === "universal_salvation") {
      students.forEach(s => {
        handleManualStarChange(s.id, 1);
      });
    }

    // Dark Curse Logic
    if (activeEffect === "dark_curse") {
      const user = drawnStudent || manualSelection;
      if (user) {
        // Update local state first to feel responsive? Or wait for backend.
        // Let's optimistic update.
        setStudents(prev => prev.map(s => s.id === user.id ? { ...s, isCursed: true } : s));

        // Call Backend
        // We need a specific endpoint or just update student.
        // Using updateStudentOnBackend might check existing state? 
        // `updateStudentOnBackend` takes a `Student` object.
        // We can construct it.
        const updatedUser = { ...user, isCursed: true };
        updateStudentOnBackend(updatedUser);

        // Remove "Dark Curse" item from inventory immediately
        try {
          const res = await authFetch(`${API_URL}/students/${user.id}/items`);
          if (res.ok) {
            const items: StudentItem[] = await res.json();
            const curseItem = items.find(i => i.item_card.name === "黑暗诅咒");
            if (curseItem) {
              await executeUseItem(curseItem.id);
            }
          }
        } catch (e) { console.error(e); }
      }
    }

    // Purification Logic
    if (activeEffect === "purification") {
      const user = drawnStudent || manualSelection;
      if (user) {
        let newStars = user.stars;
        if (newStars < 0) newStars = 0;

        const updatedUser = {
          ...user,
          isCursed: false,
          stars: newStars
        };

        // Optimistic update
        setStudents(prev => prev.map(s => s.id === user.id ? updatedUser : s));
        if (drawnStudent && drawnStudent.id === user.id) setDrawnStudent(updatedUser);
        if (manualSelection && manualSelection.id === user.id) setManualSelection(updatedUser);

        updateStudentOnBackend(updatedUser);
      }
    }

    // Abyssal Gaze Logic
    if (activeEffect === "abyssal_gaze") {
      const user = drawnStudent || manualSelection;
      const isSuccess = payload === true; // payload passed from effect
      if (user) {
        if (isSuccess) {
          // Success: +3 Stars
          handleManualStarChange(user.id, 3);
        } else {
          // Fail: Reset to 0
          const updatedUser = { ...user, stars: 0 };
          setStudents(prev => prev.map(s => s.id === user.id ? updatedUser : s));
          if (drawnStudent && drawnStudent.id === user.id) setDrawnStudent(updatedUser);
          if (manualSelection && manualSelection.id === user.id) setManualSelection(updatedUser);
          updateStudentOnBackend(updatedUser);


        }
      }
    }

    // One Man Guard Logic
    if (activeEffect === "one_man_guard") {
      const user = drawnStudent || manualSelection;
      if (user) {
        // Apply single target penalty
        handleManualStarChange(user.id, -1);

        // Remove item from inventory
        try {
          const res = await authFetch(`${API_URL}/students/${user.id}/items`);
          if (res.ok) {
            const items: StudentItem[] = await res.json();
            const guardItem = items.find(i => i.item_card.name === "一夫当关");
            if (guardItem) {
              await executeUseItem(guardItem.id);
            }
          }
        } catch (e) { console.error(e); }
      }
    }

    // Royal PK Logic
    if (activeEffect === "royal_pk") {
      const user = drawnStudent || manualSelection;
      // payload is winnerId
      if (user && payload === user.id) {
        handleManualStarChange(user.id, 1);
      }
      setPkOpponent(null);
    }

    // Destiny Roulette Logic
    if (activeEffect === "destiny_roulette" && payload) {
      const user = drawnStudent || manualSelection;
      if (user) {
        if (payload === 'angel') {
          handleManualStarChange(user.id, 10);
        } else {
          handleManualStarChange(user.id, -1);
        }
      }
    }




    // Chain Lightning Logic
    if (activeEffect === "chain_lightning") {
      chainPath.forEach(step => {
        if (step.status === 'hit') {
          handleManualStarChange(step.student.id, -2);
        }
      });
      setChainPath([]);
    }

    // If item was used from inventory (pendingItemId is set)
    if (pendingItemId) {
      await executeUseItem(pendingItemId);
      setPendingItemId(null);
    }

    // Always refresh students to get backend updates (stars, immunity, inventory items if needed)
    setTimeout(fetchStudents, 500);

    setActiveEffect(null);
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

  const handleImportExcel = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await authFetch(`${API_URL}/import_excel`, {
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
    playSound('roll');

    // 1. Priority Pool: Never picked students AND NOT IMMUNE
    const neverPicked = students.filter(s => s.pickCount === 0 && (!s.immunity || s.immunity <= 0));

    let targetId: number;

    if (neverPicked.length > 0) {
      // Pure random from unpicked
      const randomIndex = Math.floor(Math.random() * neverPicked.length);
      targetId = neverPicked[randomIndex].id;
    } else {
      // 2. Weighted Pool: Lower stars = Higher weight, exclude immune
      // Weight formula: 60 / (stars + 1)
      let weightedPool: number[] = [];
      students.filter(s => !s.immunity || s.immunity <= 0).forEach(student => {
        const weight = Math.floor(60 / (Math.max(0, student.stars) + 1));
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
        // Calculate new stars
        // If student is cursed, allow negative. Else clamp at 0.
        let newStars = s.stars + starChange;
        if (!s.isCursed) {
          newStars = Math.max(0, newStars);
        }

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
      playSound('success_roll'); // Correct answer sound
      // Trigger level up animation
      setDrawnStudent(prev => prev ? ({ ...prev, stars: prev.stars + 1 }) : null);
      setShowLevelUp(true);

      // Draw Item Chance (Normal)
      if (drawnStudent) {
        setTimeout(() => {
          drawItem(drawnStudent.id, 'normal');
        }, 1000);
      }
      setIsInteractionComplete(true);
    } else {
      // Wrong Answer / Skip
      // If Wrong (starChange < 0), draw NEGATIVE card
      if (starChange < 0 && drawnStudent) {
        playSound('fail');
        setTimeout(() => {
          drawItem(drawnStudent.id, 'negative');
        }, 500);
      }
      setIsInteractionComplete(true);
    }

    // Advance Turn logic: Decrement immunity for everyone
    // We do this after interaction is complete (user response recorded)
    fetch(`${API_URL}/advance_turn`, { method: 'POST' })
      .then(() => fetchStudents()) // Refresh to get updated immunities
      .catch(err => console.error("Failed to advance turn", err));
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
        let newStars = s.stars + change;
        if (!s.isCursed) {
          newStars = Math.max(0, newStars);
        }



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

  const sortedByNegativeStars = useMemo(() =>
    [...students].filter(s => s.stars < 0).sort((a, b) => a.stars - b.stars),
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

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  if (isAdmin) {
    return <AdminPanel token={token} onLogout={handleLogout} />;
  }

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
                    <div key={student.id} className={`flex items-center gap-3 bg-slate-800/50 p-2 rounded-lg border ${student.isCursed ? 'border-purple-500/50' : 'border-slate-700/30'}`}>
                      <div className="font-bold text-sm text-slate-500 w-4">{i + 1}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${student.isCursed ? 'text-white' : 'text-slate-200'}`}>{student.name}</span>
                          {/* Rarity Label (Only for positive stars) */}
                          {student.stars >= 0 && (
                            <span className={`text-[10px] px-1 rounded border ${RARITY_CONFIG[rKey].color} ${RARITY_CONFIG[rKey].border} bg-opacity-20`}>
                              {RARITY_CONFIG[rKey].label}
                            </span>
                          )}
                          {/* Cursed Label */}
                          {student.isCursed && (
                            <span className="text-[10px] px-1 rounded border border-purple-500 text-purple-400 bg-purple-900/30">
                              CURSED
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`font-bold font-mono text-xs ${student.stars < 0 ? 'text-purple-400' : 'text-yellow-500'}`}>
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


            {/* Cursed Rank (Negative Stars) */}
            {sortedByNegativeStars.length > 0 && (
              <div className="bg-slate-900/60 backdrop-blur-md border border-purple-700/50 p-4 rounded-xl shadow-2xl animate-in slide-in-from-right duration-500 delay-200">
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Skull size={12} />
                  魔丸榜 (负分排行)
                </h3>
                <div className="space-y-2">
                  {sortedByNegativeStars.slice(0, 5).map((student, i) => (
                    <div key={student.id} className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-lg border border-purple-500/30">
                      <div className="font-bold text-sm text-purple-500 w-4">{i + 1}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{student.name}</span>
                          <span className="text-[10px] px-1 rounded border border-purple-500 text-purple-400 bg-purple-900/30">
                            CURSED
                          </span>
                        </div>
                      </div>
                      <div className="font-bold font-mono text-xs text-purple-400">
                        {student.stars} ★
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              student={drawnStudent || { id: -1, stars: 0, name: '???', pickCount: 0, immunity: 0 }}
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
            <div className="flex gap-2">
              <button onClick={handleLogout} title="退出登录" className="text-slate-500 hover:text-white"><LogOut size={16} /></button>
              <button onClick={async () => {
                if (window.confirm("确定要注销班级账号吗？所有数据将丢失！")) {
                  await authFetch(`${API_URL}/users/me`, { method: 'DELETE' });
                  handleLogout();
                }
              }} title="注销账号" className="text-slate-500 hover:text-red-500"><Trash2 size={16} /></button>
            </div>
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
              onChange={(e) => {
                if (e.target.files?.[0]) handleImportExcel(e.target.files[0]);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
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
      {
        manualSelection && (
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
        )
      }

      {/* --- Item Draw Modal --- */}
      {
        showItemModal && drawnItem && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300"
            onClick={() => setShowItemModal(false)}
          >
            <div
              className="flex flex-col items-center gap-6 animate-in zoom-in-50 duration-500"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-4xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                获得卡牌！
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
        )
      }

      {/* --- Item Preview Modal --- */}
      {
        previewItem && (
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
                      useItem(previewItem);
                    }}
                    className="px-8 py-2 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-600/30 transition-transform hover:scale-105"
                  >
                    使用 (Use)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {
        showRoulette && pendingDrawnItem && (
          <RouletteEffect
            items={rouletteItems}
            finalItem={pendingDrawnItem}
            onComplete={handleRouletteComplete}
          />
        )
      }
      {activeEffect === 'shield' && <ShieldEffect onComplete={() => handleEffectComplete()} />}
      {
        activeEffect === 'mark_target' && (
          <MarkTargetEffect
            students={students.filter(s => s.id !== drawnStudent?.id)} // Exclude current student? Or include? Usually replace means someone else.
            onComplete={(victim) => handleEffectComplete(victim)}
          />
        )
      }
      {activeEffect === 'exp_potion' && <ExpPotionEffect onComplete={() => handleEffectComplete()} />}
      {activeEffect === 'mass_silence' && <MassSilenceEffect onComplete={() => handleEffectComplete()} />}
      {activeEffect === 'doomsday' && <DoomsdayEffect onComplete={() => handleEffectComplete()} />}
      {activeEffect === 'legion_glory' && <LegionGloryEffect onComplete={() => handleEffectComplete()} />}
      {
        activeEffect === 'shadow_raid' && (
          <ShadowRaidEffect
            students={students}
            onComplete={(victim) => handleEffectComplete(victim)}
          />
        )
      }
      {
        activeEffect === 'berserker_trial' && (
          <BerserkerTrialEffect
            students={students}
            onComplete={(winner) => handleEffectComplete(winner)}
          />
        )
      }
      {
        activeEffect === 'mana_drain' && (
          <ManaDrainEffect
            user={drawnStudent || manualSelection!}
            students={students}
            onComplete={(result) => {
              handleEffectComplete(result);
            }}
          />
        )
      }
      {activeEffect === 'stealth_cloak' && <StealthCloakEffect onComplete={() => handleEffectComplete()} />}
      {activeEffect === 'sanctuary' && <SanctuaryEffect onComplete={() => handleEffectComplete()} />}
      {activeEffect === 'universal_salvation' && <UniversalSalvationEffect onComplete={() => handleEffectComplete()} />}
      {activeEffect === 'dark_curse' && <DarkCurseEffect onComplete={() => handleEffectComplete()} />}
      {activeEffect === 'purification' && <PurificationEffect onComplete={() => handleEffectComplete()} />}
      {activeEffect === 'abyssal_gaze' && <AbyssalGazeEffect onComplete={(success) => handleEffectComplete(success)} />}
      {activeEffect === 'one_man_guard' && <OneManGuardEffect onComplete={() => handleEffectComplete()} />}
      {activeEffect === 'royal_pk' && pkOpponent && (drawnStudent || manualSelection) && (
        <RoyalPKEffect
          user={drawnStudent || manualSelection!}
          opponent={pkOpponent}
          onComplete={(winnerId) => handleEffectComplete(winnerId)}
        />
      )}
      {activeEffect === 'chain_lightning' && <ChainLightningEffect chainPath={chainPath} onComplete={() => handleEffectComplete()} />}
      {activeEffect === 'destiny_roulette' && <DestinyRouletteEffect onComplete={(result) => handleEffectComplete(result)} />}
    </div >
  );
}