import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { EditableChatAnimation, calculateEditableDuration } from './compositions/EditableChatAnimation';
import { DraggableTimeline } from './components/DraggableTimeline';
import { MessageSchema, ChatSchema } from './schema';

const FPS = 30;

// Default props for the chat
const defaultProps: ChatSchema = {
  platform: 'whatsapp',
  showPhoneFrame: false,
  showEncryptionNotice: true,
  contactName: 'Alex',
  contactAvatar: '',
  myAvatar: '',
  typingSpeed: 5,
  messageSpeed: 5,
  messages: [
    { id: '1', text: 'Hey! Are you free this weekend?', isMe: false, timestamp: '10:30' },
    { id: '2', text: "Yeah! What's up?", isMe: true, timestamp: '10:32' },
    { id: '3', text: 'Want to grab coffee? ☕', isMe: false, timestamp: '10:33' },
    { id: '4', text: "Sounds great! Where should we meet?", isMe: true, timestamp: '10:35' },
    { id: '5', text: 'How about the new place downtown?', isMe: false, timestamp: '10:36' },
    { id: '6', text: 'Perfect! See you Saturday at 2pm 🙌', isMe: true, timestamp: '10:38' },
  ],
};

type TabId = 'messages' | 'settings' | 'json';

// Professional color palette
const colors = {
  bg: '#0f0f0f',
  bgPanel: '#1a1a1a',
  bgElevated: '#222222',
  bgInput: '#2a2a2a',
  border: '#333333',
  borderLight: '#3a3a3a',
  text: '#ffffff',
  textSecondary: '#999999',
  textMuted: '#666666',
  accent: '#25D366', // WhatsApp green
  accentHover: '#2ed573',
  accentMuted: 'rgba(37, 211, 102, 0.15)',
  danger: '#ef4444',
  dangerMuted: 'rgba(239, 68, 68, 0.15)',
  playhead: '#ef4444',
};

// Panel size constraints
const PANEL_CONSTRAINTS = {
  left: { min: 160, max: 350, default: 220 },
  right: { min: 280, max: 500, default: 340 },
};

// LocalStorage keys
const STORAGE_KEYS = {
  leftPanelWidth: 'timeline-editor-left-panel-width',
  rightPanelWidth: 'timeline-editor-right-panel-width',
  canvasZoom: 'timeline-editor-canvas-zoom',
};

// Load from localStorage with fallback
const loadFromStorage = (key: string, fallback: number): number => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return parseFloat(stored);
  } catch {}
  return fallback;
};

// Save to localStorage
const saveToStorage = (key: string, value: number) => {
  try {
    localStorage.setItem(key, value.toString());
  } catch {}
};

// Composition type for project panel
interface Composition {
  id: string;
  name: string;
  icon: string;
  description: string;
  aspectRatio: string;
  enabled: boolean;
}

const compositions: Composition[] = [
  { id: '1on1-chat', name: '1:1 Chat', icon: '💬', description: 'Two-person conversation', aspectRatio: '9:16', enabled: true },
  { id: 'group-chat', name: 'Group Chat', icon: '👥', description: 'Multi-person conversation', aspectRatio: '9:16', enabled: false },
  { id: 'story-reply', name: 'Story Reply', icon: '📱', description: 'Instagram story DM', aspectRatio: '9:16', enabled: false },
  { id: 'voice-note', name: 'Voice Notes', icon: '🎙️', description: 'Audio message thread', aspectRatio: '9:16', enabled: false },
];

/**
 * Professional Timeline Editor App
 * 
 * Layout:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  Logo/Title                                      Import Export  │
 * ├──────────┬───────────────────────────────────────┬──────────────┤
 * │          │                                       │              │
 * │ PROJECT  │        CENTERED VIDEO PREVIEW         │  MESSAGES    │
 * │ ──────── │           (zoomable)                  │  ──────────  │
 * │ 📱 1:1   │                                       │  [Tabs]      │
 * │   Chat   │   ─────────────────────────────       │  Props       │
 * │          │   [◀◀] [◀] [▶/❚❚] [▶] [▶▶] 100%      │  Editor      │
 * │          │                                       │              │
 * ├──────────┴───────────────────────────────────────┴──────────────┤
 * │  ═══════════════ TIMELINE WITH DRAGGABLE BLOCKS ═══════════════ │
 * └─────────────────────────────────────────────────────────────────┘
 */
export const TimelineEditorApp: React.FC = () => {
  const playerRef = useRef<PlayerRef>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [props, setProps] = useState<ChatSchema>(defaultProps);
  const [activeTab, setActiveTab] = useState<TabId>('messages');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState('');
  const [selectedComposition, setSelectedComposition] = useState('1on1-chat');
  
  // Panel widths
  const [leftPanelWidth, setLeftPanelWidth] = useState(() => 
    loadFromStorage(STORAGE_KEYS.leftPanelWidth, PANEL_CONSTRAINTS.left.default)
  );
  const [rightPanelWidth, setRightPanelWidth] = useState(() => 
    loadFromStorage(STORAGE_KEYS.rightPanelWidth, PANEL_CONSTRAINTS.right.default)
  );
  
  // Canvas zoom (1 = 100%, 0.5 = 50%, 2 = 200%)
  const [canvasZoom, setCanvasZoom] = useState(() => 
    loadFromStorage(STORAGE_KEYS.canvasZoom, 1)
  );
  
  // Resizing state
  const [isResizing, setIsResizing] = useState<'left' | 'right' | null>(null);
  
  // Sync JSON text when props change (unless user is editing)
  const [isEditingJson, setIsEditingJson] = useState(false);
  
  useEffect(() => {
    if (!isEditingJson) {
      setJsonText(JSON.stringify(props, null, 2));
    }
  }, [props, isEditingJson]);
  
  // Save panel sizes to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.leftPanelWidth, leftPanelWidth);
  }, [leftPanelWidth]);
  
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.rightPanelWidth, rightPanelWidth);
  }, [rightPanelWidth]);
  
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.canvasZoom, canvasZoom);
  }, [canvasZoom]);
  
  // Calculate duration based on messages
  const duration = useMemo(() => {
    const hasManualTiming = props.messages.some(m => m.startFrame !== undefined);
    
    if (hasManualTiming) {
      let maxEndFrame = 0;
      props.messages.forEach(msg => {
        if (msg.startFrame !== undefined) {
          const endFrame = msg.startFrame + (msg.duration || 90);
          maxEndFrame = Math.max(maxEndFrame, endFrame);
        }
      });
      return Math.max(maxEndFrame + FPS * 2, FPS * 3);
    }
    
    return calculateEditableDuration(
      props.messages,
      props.typingSpeed,
      props.messageSpeed,
      FPS
    );
  }, [props.messages, props.typingSpeed, props.messageSpeed]);
  
  const handleMessagesChange = useCallback((newMessages: MessageSchema[]) => {
    setProps(prev => ({ ...prev, messages: newMessages }));
  }, []);
  
  const handleSeek = useCallback((frame: number) => {
    playerRef.current?.seekTo(frame);
    setCurrentFrame(frame);
  }, []);
  
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      playerRef.current?.pause();
    } else {
      playerRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);
  
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    
    const interval = setInterval(() => {
      const frame = player.getCurrentFrame();
      setCurrentFrame(frame);
    }, 1000 / 30);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentFrame(duration);
    };
    
    player.addEventListener('play', handlePlay);
    player.addEventListener('pause', handlePause);
    player.addEventListener('ended', handleEnded);
    
    return () => {
      player.removeEventListener('play', handlePlay);
      player.removeEventListener('pause', handlePause);
      player.removeEventListener('ended', handleEnded);
    };
  }, [duration]);
  
  const restart = useCallback(() => {
    playerRef.current?.seekTo(0);
    setCurrentFrame(0);
    playerRef.current?.play();
    setIsPlaying(true);
  }, []);
  
  const stepForward = useCallback(() => {
    const newFrame = Math.min(duration, currentFrame + 1);
    handleSeek(newFrame);
  }, [currentFrame, duration, handleSeek]);
  
  const stepBackward = useCallback(() => {
    const newFrame = Math.max(0, currentFrame - 1);
    handleSeek(newFrame);
  }, [currentFrame, handleSeek]);
  
  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setCanvasZoom(z => Math.min(3, z + 0.1));
  }, []);
  
  const handleZoomOut = useCallback(() => {
    setCanvasZoom(z => Math.max(0.25, z - 0.1));
  }, []);
  
  const handleZoomReset = useCallback(() => {
    setCanvasZoom(1);
  }, []);
  
  // Canvas scroll wheel zoom
  const handleCanvasWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setCanvasZoom(z => Math.min(3, Math.max(0.25, z + delta)));
    }
  }, []);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Ctrl/Cmd + 0 to reset zoom
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        handleZoomReset();
        return;
      }
      
      // Ctrl/Cmd + + to zoom in
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        handleZoomIn();
        return;
      }
      
      // Ctrl/Cmd + - to zoom out
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        handleZoomOut();
        return;
      }
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          stepBackward();
          break;
        case 'ArrowRight':
          e.preventDefault();
          stepForward();
          break;
        case 'Home':
          e.preventDefault();
          handleSeek(0);
          break;
        case 'End':
          e.preventDefault();
          handleSeek(duration);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, stepForward, stepBackward, handleSeek, duration, handleZoomIn, handleZoomOut, handleZoomReset]);
  
  // Panel resize handlers
  const handleResizeStart = useCallback((side: 'left' | 'right') => {
    setIsResizing(side);
  }, []);
  
  useEffect(() => {
    if (!isResizing) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing === 'left') {
        const newWidth = Math.min(
          PANEL_CONSTRAINTS.left.max,
          Math.max(PANEL_CONSTRAINTS.left.min, e.clientX)
        );
        setLeftPanelWidth(newWidth);
      } else if (isResizing === 'right') {
        const newWidth = Math.min(
          PANEL_CONSTRAINTS.right.max,
          Math.max(PANEL_CONSTRAINTS.right.min, window.innerWidth - e.clientX)
        );
        setRightPanelWidth(newWidth);
      }
    };
    
    const handleMouseUp = () => {
      setIsResizing(null);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);
  
  const exportJson = useCallback(() => {
    const json = JSON.stringify(props, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat-animator-props.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [props]);
  
  const importJson = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          if (Array.isArray(imported)) {
            setProps(prev => ({ ...prev, messages: imported }));
          } else {
            setProps(imported);
          }
          setJsonError(null);
        } catch (err) {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);
  
  const handleJsonChange = useCallback((text: string) => {
    setJsonText(text);
    setIsEditingJson(true);
    
    try {
      const parsed = JSON.parse(text);
      setProps(parsed);
      setJsonError(null);
    } catch (err) {
      setJsonError((err as Error).message);
    }
  }, []);
  
  const addMessage = useCallback(() => {
    const newId = `msg-${Date.now()}`;
    setProps(p => ({
      ...p,
      messages: [
        ...p.messages,
        { id: newId, text: 'New message', isMe: false, timestamp: '12:00' }
      ]
    }));
  }, []);
  
  const deleteMessage = useCallback((idx: number) => {
    setProps(p => ({
      ...p,
      messages: p.messages.filter((_, i) => i !== idx)
    }));
  }, []);
  
  const updateMessage = useCallback((idx: number, updates: Partial<MessageSchema>) => {
    setProps(p => ({
      ...p,
      messages: p.messages.map((msg, i) => i === idx ? { ...msg, ...updates } : msg)
    }));
  }, []);
  
  const moveMessage = useCallback((idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === props.messages.length - 1) return;
    
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    setProps(p => {
      const msgs = [...p.messages];
      [msgs[idx], msgs[newIdx]] = [msgs[newIdx], msgs[idx]];
      return { ...p, messages: msgs };
    });
  }, [props.messages.length]);
  
  const clearManualTiming = useCallback(() => {
    setProps(p => ({
      ...p,
      messages: p.messages.map(m => ({
        ...m,
        startFrame: undefined,
        duration: undefined,
      }))
    }));
  }, []);
  
  const formatTime = (frame: number) => {
    const seconds = frame / FPS;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = frame % FPS;
    return `${mins}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };
  
  // Button component for consistency
  const IconButton: React.FC<{
    onClick: () => void;
    disabled?: boolean;
    active?: boolean;
    primary?: boolean;
    danger?: boolean;
    children: React.ReactNode;
    title?: string;
    size?: 'sm' | 'md' | 'lg';
  }> = ({ onClick, disabled, active, primary, danger, children, title, size = 'md' }) => {
    const sizes = {
      sm: { w: 28, h: 28, font: 12 },
      md: { w: 36, h: 36, font: 16 },
      lg: { w: 48, h: 48, font: 20 },
    };
    const s = sizes[size];
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        style={{
          width: s.w,
          height: s.h,
          borderRadius: 6,
          backgroundColor: primary ? colors.accent : danger ? colors.danger : active ? colors.bgElevated : colors.bgInput,
          color: disabled ? colors.textMuted : colors.text,
          border: 'none',
          cursor: disabled ? 'default' : 'pointer',
          fontSize: s.font,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {children}
      </button>
    );
  };
  
  // Resize handle component
  const ResizeHandle: React.FC<{ side: 'left' | 'right' }> = ({ side }) => (
    <div
      onMouseDown={(e) => {
        e.preventDefault();
        handleResizeStart(side);
      }}
      style={{
        width: 4,
        cursor: 'col-resize',
        backgroundColor: isResizing === side ? colors.accent : 'transparent',
        transition: 'background-color 0.15s',
        position: 'relative',
        zIndex: 10,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.backgroundColor = colors.borderLight;
      }}
      onMouseLeave={(e) => {
        if (isResizing !== side) {
          (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
        }
      }}
    />
  );
  
  // Calculate player size based on zoom
  const baseWidth = 315;
  const baseHeight = 560;
  const playerWidth = baseWidth * canvasZoom;
  const playerHeight = baseHeight * canvasZoom;
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: colors.bg,
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
      color: colors.text,
    }}>
      {/* Header Bar */}
      <header style={{
        height: 52,
        padding: '0 16px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.bgPanel,
        flexShrink: 0,
      }}>
        {/* Left: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 32, 
            height: 32, 
            borderRadius: 8, 
            backgroundColor: colors.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
          }}>
            💬
          </div>
          <div>
            <h1 style={{ fontSize: 14, fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>
              Chat Animator
            </h1>
            <span style={{ fontSize: 10, color: colors.textMuted }}>Timeline Editor</span>
          </div>
        </div>
        
        {/* Right: Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={importJson}
            style={{
              padding: '8px 14px',
              backgroundColor: colors.bgInput,
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`,
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            ↓ Import
          </button>
          <button
            onClick={exportJson}
            style={{
              padding: '8px 14px',
              backgroundColor: colors.accent,
              color: colors.text,
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            ↑ Export
          </button>
        </div>
      </header>
      
      {/* Main Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        {/* Left Panel: Project/Compositions */}
        <div style={{
          width: leftPanelWidth,
          borderRight: `1px solid ${colors.border}`,
          backgroundColor: colors.bgPanel,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {/* Panel Header */}
          <div style={{
            height: 40,
            padding: '0 12px',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: colors.bg,
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Project
            </span>
          </div>
          
          {/* Compositions List */}
          <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
            <div style={{ 
              fontSize: 10, 
              color: colors.textMuted, 
              padding: '8px 8px 4px', 
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: 600,
            }}>
              Compositions
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {compositions.map(comp => (
                <button
                  key={comp.id}
                  onClick={() => comp.enabled && setSelectedComposition(comp.id)}
                  disabled={!comp.enabled}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 12px',
                    backgroundColor: selectedComposition === comp.id ? colors.accentMuted : 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    cursor: comp.enabled ? 'pointer' : 'default',
                    textAlign: 'left',
                    opacity: comp.enabled ? 1 : 0.4,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{comp.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontSize: 12, 
                      fontWeight: 500, 
                      color: selectedComposition === comp.id ? colors.accent : colors.text,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {comp.name}
                    </div>
                    <div style={{ 
                      fontSize: 10, 
                      color: colors.textMuted,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {comp.description}
                    </div>
                  </div>
                  {!comp.enabled && (
                    <span style={{ 
                      fontSize: 9, 
                      color: colors.textMuted,
                      backgroundColor: colors.bgInput,
                      padding: '2px 6px',
                      borderRadius: 4,
                    }}>
                      Soon
                    </span>
                  )}
                </button>
              ))}
            </div>
            
            {/* Aspect Ratio Info */}
            <div style={{
              marginTop: 16,
              padding: 12,
              backgroundColor: colors.bg,
              borderRadius: 8,
              border: `1px solid ${colors.border}`,
            }}>
              <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Output
              </div>
              <div style={{ fontSize: 12, color: colors.text, fontWeight: 500 }}>
                1080 × 1920
              </div>
              <div style={{ fontSize: 10, color: colors.textSecondary }}>
                9:16 Portrait • 30fps
              </div>
            </div>
          </div>
        </div>
        
        {/* Left Resize Handle */}
        <ResizeHandle side="left" />
        
        {/* Center: Video Preview + Transport */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: colors.bg,
          minWidth: 0,
          overflow: 'hidden',
        }}>
          {/* Canvas Area with Zoom */}
          <div 
            ref={canvasContainerRef}
            onWheel={handleCanvasWheel}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'auto',
              padding: 24,
              minHeight: 0,
            }}
          >
            <div style={{
              backgroundColor: '#000',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 12px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)',
              transition: 'transform 0.1s ease',
            }}>
              <Player
                ref={playerRef}
                component={EditableChatAnimation}
                inputProps={props}
                durationInFrames={duration}
                fps={FPS}
                compositionWidth={1080}
                compositionHeight={1920}
                style={{
                  width: playerWidth,
                  height: playerHeight,
                }}
                controls={false}
              />
            </div>
          </div>
          
          {/* Transport Controls - Below Canvas */}
          <div style={{
            height: 64,
            borderTop: `1px solid ${colors.border}`,
            backgroundColor: colors.bgPanel,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            flexShrink: 0,
          }}>
            {/* Left spacer for balance */}
            <div style={{ width: 120 }} />
            
            {/* Center: Main Transport + Timecode */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Main Transport */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6,
              backgroundColor: colors.bg,
              padding: '6px 10px',
              borderRadius: 8,
            }}>
              <IconButton onClick={() => handleSeek(0)} title="Go to Start (Home)" size="sm">
                ⏮
              </IconButton>
              <IconButton onClick={stepBackward} title="Previous Frame (←)" size="sm">
                ◂
              </IconButton>
              <button
                onClick={togglePlay}
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: colors.accent,
                  color: colors.text,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 2px 12px ${colors.accentMuted}`,
                  transition: 'all 0.15s ease',
                  margin: '0 4px',
                }}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <IconButton onClick={stepForward} title="Next Frame (→)" size="sm">
                ▸
              </IconButton>
              <IconButton onClick={() => handleSeek(duration)} title="Go to End (End)" size="sm">
                ⏭
              </IconButton>
            </div>
            
            {/* Timecode */}
            <div style={{ 
              fontFamily: 'SF Mono, Monaco, monospace',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              backgroundColor: colors.bg,
              padding: '8px 12px',
              borderRadius: 6,
            }}>
              <span style={{ color: colors.playhead, fontWeight: 600 }}>{formatTime(currentFrame)}</span>
              <span style={{ color: colors.textMuted }}>/</span>
              <span style={{ color: colors.textSecondary }}>{formatTime(duration)}</span>
            </div>
            </div>
            
            {/* Zoom Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              backgroundColor: colors.bg,
              padding: '4px 8px',
              borderRadius: 6,
            }}>
              <IconButton onClick={handleZoomOut} title="Zoom Out (Ctrl+-)" size="sm">
                −
              </IconButton>
              <button
                onClick={handleZoomReset}
                title="Reset Zoom (Ctrl+0)"
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'transparent',
                  color: colors.textSecondary,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontFamily: 'SF Mono, Monaco, monospace',
                  fontWeight: 500,
                  minWidth: 48,
                  textAlign: 'center',
                }}
              >
                {Math.round(canvasZoom * 100)}%
              </button>
              <IconButton onClick={handleZoomIn} title="Zoom In (Ctrl++)" size="sm">
                +
              </IconButton>
            </div>
          </div>
        </div>
        
        {/* Right Resize Handle */}
        <ResizeHandle side="right" />
        
        {/* Right Panel: Messages / Settings / JSON */}
        <div style={{
          width: rightPanelWidth,
          borderLeft: `1px solid ${colors.border}`,
          backgroundColor: colors.bgPanel,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {/* Panel Header with Tabs */}
          <div style={{
            height: 40,
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: colors.bg,
          }}>
            {[
              { id: 'messages' as const, label: '💬 Messages' },
              { id: 'settings' as const, label: '⚙️ Settings' },
              { id: 'json' as const, label: '{ } JSON' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'json') setIsEditingJson(false);
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: activeTab === tab.id ? colors.bgPanel : 'transparent',
                  color: activeTab === tab.id ? colors.text : colors.textMuted,
                  border: 'none',
                  borderBottom: activeTab === tab.id ? `2px solid ${colors.accent}` : '2px solid transparent',
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: 500,
                  marginBottom: -1,
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Panel Content */}
          <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <>
                {/* Messages Header */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}>
                  <span style={{ 
                    fontSize: 10, 
                    color: colors.textMuted,
                    backgroundColor: colors.bgInput,
                    padding: '3px 8px',
                    borderRadius: 4,
                  }}>
                    {props.messages.length} messages
                  </span>
                  {props.messages.some(m => m.startFrame !== undefined) && (
                    <button
                      onClick={clearManualTiming}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: colors.dangerMuted,
                        color: colors.danger,
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        fontSize: 10,
                      }}
                    >
                      Reset Timing
                    </button>
                  )}
                </div>
                
                {/* Messages List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {props.messages.map((msg, idx) => (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        gap: 8,
                        padding: '10px 12px',
                        backgroundColor: colors.bg,
                        borderRadius: 8,
                        alignItems: 'center',
                        border: `1px solid ${colors.border}`,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* Reorder */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <button
                          onClick={() => moveMessage(idx, 'up')}
                          disabled={idx === 0}
                          style={{
                            width: 16,
                            height: 14,
                            backgroundColor: 'transparent',
                            color: idx === 0 ? colors.border : colors.textMuted,
                            border: 'none',
                            cursor: idx === 0 ? 'default' : 'pointer',
                            fontSize: 8,
                            padding: 0,
                          }}
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveMessage(idx, 'down')}
                          disabled={idx === props.messages.length - 1}
                          style={{
                            width: 16,
                            height: 14,
                            backgroundColor: 'transparent',
                            color: idx === props.messages.length - 1 ? colors.border : colors.textMuted,
                            border: 'none',
                            cursor: idx === props.messages.length - 1 ? 'default' : 'pointer',
                            fontSize: 8,
                            padding: 0,
                          }}
                        >
                          ▼
                        </button>
                      </div>
                      
                      {/* Message Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <input
                          type="text"
                          value={msg.text}
                          onChange={(e) => updateMessage(idx, { text: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            backgroundColor: colors.bgInput,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 4,
                            color: colors.text,
                            fontSize: 12,
                          }}
                        />
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 6, 
                          marginTop: 6,
                          flexWrap: 'wrap',
                        }}>
                          <button
                            onClick={() => updateMessage(idx, { isMe: !msg.isMe })}
                            style={{
                              padding: '3px 8px',
                              backgroundColor: msg.isMe ? '#1e5a3c' : '#2a4a5a',
                              color: colors.text,
                              border: 'none',
                              borderRadius: 3,
                              cursor: 'pointer',
                              fontSize: 10,
                              fontWeight: 500,
                            }}
                          >
                            {msg.isMe ? '→ Me' : '← Them'}
                          </button>
                          <input
                            type="text"
                            value={msg.timestamp}
                            onChange={(e) => updateMessage(idx, { timestamp: e.target.value })}
                            placeholder="Time"
                            style={{
                              width: 48,
                              padding: '3px 6px',
                              backgroundColor: colors.bgInput,
                              border: `1px solid ${colors.border}`,
                              borderRadius: 3,
                              color: colors.textSecondary,
                              fontSize: 10,
                              textAlign: 'center',
                            }}
                          />
                          {msg.startFrame !== undefined && (
                            <span style={{
                              fontSize: 9,
                              color: colors.playhead,
                              backgroundColor: colors.dangerMuted,
                              padding: '2px 4px',
                              borderRadius: 2,
                              fontFamily: 'SF Mono, Monaco, monospace',
                            }}>
                              f{msg.startFrame}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Delete */}
                      <button
                        onClick={() => deleteMessage(idx)}
                        style={{
                          width: 24,
                          height: 24,
                          backgroundColor: 'transparent',
                          color: colors.textMuted,
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 14,
                          borderRadius: 4,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'color 0.15s',
                        }}
                        title="Delete message"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Add Message Button */}
                <button
                  onClick={addMessage}
                  style={{
                    width: '100%',
                    marginTop: 12,
                    padding: '10px',
                    backgroundColor: 'transparent',
                    color: colors.accent,
                    border: `1px dashed ${colors.border}`,
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 500,
                    transition: 'all 0.15s ease',
                  }}
                >
                  + Add Message
                </button>
              </>
            )}
            
            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Platform */}
                <div>
                  <label style={{ 
                    color: colors.textMuted, 
                    fontSize: 10, 
                    display: 'block', 
                    marginBottom: 6, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.5px',
                    fontWeight: 600,
                  }}>
                    Platform
                  </label>
                  <select
                    value={props.platform}
                    onChange={(e) => setProps(p => ({ ...p, platform: e.target.value as ChatSchema['platform'] }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: colors.bgInput,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 6,
                      color: colors.text,
                      fontSize: 13,
                    }}
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="imessage">iMessage</option>
                    <option value="messenger">Messenger</option>
                  </select>
                </div>
                
                {/* Contact Name */}
                <div>
                  <label style={{ 
                    color: colors.textMuted, 
                    fontSize: 10, 
                    display: 'block', 
                    marginBottom: 6, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.5px',
                    fontWeight: 600,
                  }}>
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={props.contactName}
                    onChange={(e) => setProps(p => ({ ...p, contactName: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      backgroundColor: colors.bgInput,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 6,
                      color: colors.text,
                      fontSize: 13,
                    }}
                  />
                </div>
                
                {/* Profile Picture */}
                <div>
                  <label style={{ 
                    color: colors.textMuted, 
                    fontSize: 10, 
                    display: 'block', 
                    marginBottom: 6, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.5px',
                    fontWeight: 600,
                  }}>
                    Profile Picture
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Preview */}
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: colors.bgInput,
                      border: `1px solid ${colors.border}`,
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {props.contactAvatar ? (
                        <img 
                          src={props.contactAvatar} 
                          alt="Profile" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ color: colors.textMuted, fontSize: 20 }}>👤</span>
                      )}
                    </div>
                    {/* Upload Button */}
                    <label style={{
                      flex: 1,
                      padding: '10px 12px',
                      backgroundColor: colors.bgInput,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 6,
                      color: colors.textSecondary,
                      fontSize: 12,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s ease',
                    }}>
                      {props.contactAvatar ? 'Change Image' : 'Upload Image'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProps(p => ({ ...p, contactAvatar: reader.result as string }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {/* Clear Button */}
                    {props.contactAvatar && (
                      <button
                        onClick={() => setProps(p => ({ ...p, contactAvatar: '' }))}
                        style={{
                          padding: '10px 12px',
                          backgroundColor: 'transparent',
                          border: `1px solid ${colors.border}`,
                          borderRadius: 6,
                          color: colors.textMuted,
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Typing Speed */}
                <div>
                  <label style={{ 
                    color: colors.textMuted, 
                    fontSize: 10, 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: 8, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.5px',
                    fontWeight: 600,
                  }}>
                    <span>Typing Speed</span>
                    <span style={{ color: colors.accent }}>{props.typingSpeed}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={props.typingSpeed}
                    onChange={(e) => setProps(p => ({ ...p, typingSpeed: parseInt(e.target.value) }))}
                    style={{ width: '100%', accentColor: colors.accent }}
                  />
                </div>
                
                {/* Message Speed */}
                <div>
                  <label style={{ 
                    color: colors.textMuted, 
                    fontSize: 10, 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: 8, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.5px',
                    fontWeight: 600,
                  }}>
                    <span>Message Speed</span>
                    <span style={{ color: colors.accent }}>{props.messageSpeed}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={props.messageSpeed}
                    onChange={(e) => setProps(p => ({ ...p, messageSpeed: parseInt(e.target.value) }))}
                    style={{ width: '100%', accentColor: colors.accent }}
                  />
                </div>
                
                {/* Checkboxes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                  <label style={{ 
                    color: colors.text, 
                    fontSize: 12, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 10, 
                    cursor: 'pointer' 
                  }}>
                    <input
                      type="checkbox"
                      checked={props.showEncryptionNotice}
                      onChange={(e) => setProps(p => ({ ...p, showEncryptionNotice: e.target.checked }))}
                      style={{ width: 16, height: 16, accentColor: colors.accent }}
                    />
                    Encryption notice
                  </label>
                  
                </div>
              </div>
            )}
            
            {/* JSON Tab */}
            {activeTab === 'json' && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {jsonError && (
                  <div style={{
                    padding: '8px 12px',
                    backgroundColor: colors.dangerMuted,
                    borderRadius: 4,
                    marginBottom: 12,
                    color: colors.danger,
                    fontSize: 11,
                    fontFamily: 'SF Mono, Monaco, monospace',
                  }}>
                    ⚠️ {jsonError}
                  </div>
                )}
                
                <textarea
                  value={jsonText}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  onBlur={() => setIsEditingJson(false)}
                  style={{
                    flex: 1,
                    padding: 12,
                    backgroundColor: colors.bgInput,
                    border: jsonError ? `1px solid ${colors.danger}` : `1px solid ${colors.border}`,
                    borderRadius: 8,
                    color: colors.text,
                    fontSize: 11,
                    fontFamily: 'SF Mono, Monaco, Consolas, monospace',
                    resize: 'none',
                    lineHeight: 1.5,
                    minHeight: 300,
                  }}
                  spellCheck={false}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Timeline at bottom */}
      <div style={{
        borderTop: `1px solid ${colors.border}`,
        backgroundColor: colors.bgPanel,
        flexShrink: 0,
      }}>
        <DraggableTimeline
          messages={props.messages}
          onMessagesChange={handleMessagesChange}
          totalDuration={duration}
          currentFrame={currentFrame}
          onSeek={handleSeek}
          fps={FPS}
          typingSpeed={props.typingSpeed}
          messageSpeed={props.messageSpeed}
        />
      </div>
    </div>
  );
};

export default TimelineEditorApp;
