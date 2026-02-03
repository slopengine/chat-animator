import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { MessageSchema } from '../schema';

interface DraggableTimelineProps {
  messages: MessageSchema[];
  onMessagesChange: (messages: MessageSchema[]) => void;
  totalDuration: number;
  currentFrame: number;
  onSeek: (frame: number) => void;
  fps: number;
  typingSpeed: number;
  messageSpeed: number;
}

interface MessageBlock {
  id: string;
  text: string;
  isMe: boolean;
  startFrame: number;
  duration: number;
  originalIndex: number;
}

// Professional color palette (matching main app)
const colors = {
  bg: '#0f0f0f',
  bgPanel: '#1a1a1a',
  bgElevated: '#222222',
  bgTrack: '#141414',
  border: '#333333',
  borderLight: '#3a3a3a',
  text: '#ffffff',
  textSecondary: '#999999',
  textMuted: '#666666',
  accent: '#25D366',
  accentDark: '#1e5a3c',
  them: '#3a5068',
  themDark: '#2a4058',
  playhead: '#ef4444',
  snap: '#ef4444',
  gridMajor: '#2a2a2a',
  gridMinor: '#1e1e1e',
};

const MIN_PIXELS_PER_FRAME = 1;
const MAX_PIXELS_PER_FRAME = 10;
const DEFAULT_PIXELS_PER_FRAME = 3;
const BLOCK_HEIGHT = 48;
const TRACK_PADDING = 8;
const SNAP_THRESHOLD = 8;
const MIN_DURATION = 15;

/**
 * Professional Draggable Timeline Editor
 */
export const DraggableTimeline: React.FC<DraggableTimelineProps> = ({
  messages,
  onMessagesChange,
  totalDuration,
  currentFrame,
  onSeek,
  fps,
  typingSpeed,
  messageSpeed,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [pixelsPerFrame, setPixelsPerFrame] = useState(DEFAULT_PIXELS_PER_FRAME);
  
  const [dragState, setDragState] = useState<{
    type: 'move' | 'resize-start' | 'resize-end';
    blockId: string;
    startX: number;
    originalStartFrame: number;
    originalDuration: number;
  } | null>(null);
  
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  const [hoverEdge, setHoverEdge] = useState<'start' | 'end' | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [snapLines, setSnapLines] = useState<number[]>([]);
  const [isScrubbing, setIsScrubbing] = useState(false);
  
  const typingDuration = Math.round(90 - (typingSpeed - 1) * 8.33);
  const messageDelay = Math.round(60 - (messageSpeed - 1) * 5);
  const initialDelay = 30;

  const blocks: MessageBlock[] = useMemo(() => {
    let autoFrame = initialDelay;
    
    return messages.map((msg, index) => {
      let defaultStart = autoFrame;
      if (!msg.isMe) {
        autoFrame += typingDuration + messageDelay;
      } else {
        autoFrame += messageDelay;
      }
      
      const defaultDuration = 90;
      
      return {
        id: msg.id,
        text: msg.text,
        isMe: msg.isMe,
        startFrame: msg.startFrame ?? defaultStart,
        duration: msg.duration ?? defaultDuration,
        originalIndex: index,
      };
    });
  }, [messages, typingDuration, messageDelay, initialDelay]);
  
  const getEffectiveDuration = useCallback((block: MessageBlock) => {
    return Math.max(block.duration, MIN_DURATION);
  }, []);
  
  const getSnapPoints = useCallback((excludeId: string): number[] => {
    const points: number[] = [0];
    
    for (let s = 0; s <= totalDuration / fps; s++) {
      points.push(s * fps);
    }
    
    blocks.forEach(block => {
      if (block.id !== excludeId) {
        points.push(block.startFrame);
        points.push(block.startFrame + getEffectiveDuration(block));
      }
    });
    
    return [...new Set(points)].sort((a, b) => a - b);
  }, [blocks, totalDuration, fps, getEffectiveDuration]);
  
  const snapToPoint = useCallback((frame: number, excludeId: string): { snapped: number; snapLine: number | null } => {
    const snapPoints = getSnapPoints(excludeId);
    
    for (const point of snapPoints) {
      if (Math.abs(frame - point) <= SNAP_THRESHOLD) {
        return { snapped: point, snapLine: point };
      }
    }
    
    return { snapped: frame, snapLine: null };
  }, [getSnapPoints]);
  
  const handleBlockMouseDown = useCallback((e: React.MouseEvent, block: MessageBlock, edge: 'start' | 'end' | null) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedBlock(block.id);
    
    const type = edge === 'start' ? 'resize-start' : edge === 'end' ? 'resize-end' : 'move';
    
    setDragState({
      type,
      blockId: block.id,
      startX: e.clientX,
      originalStartFrame: block.startFrame,
      originalDuration: block.duration || getEffectiveDuration(block),
    });
  }, [getEffectiveDuration]);
  
  useEffect(() => {
    if (!dragState) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragState.startX;
      const deltaFrames = Math.round(deltaX / pixelsPerFrame);
      
      const block = blocks.find(b => b.id === dragState.blockId);
      if (!block) return;
      
      let newStartFrame = dragState.originalStartFrame;
      let newDuration = dragState.originalDuration;
      let snapLine: number | null = null;
      
      if (dragState.type === 'move') {
        newStartFrame = Math.max(0, dragState.originalStartFrame + deltaFrames);
        const snapResult = snapToPoint(newStartFrame, block.id);
        newStartFrame = snapResult.snapped;
        snapLine = snapResult.snapLine;
        
        const endSnapResult = snapToPoint(newStartFrame + newDuration, block.id);
        if (endSnapResult.snapLine !== null && (snapLine === null || Math.abs(endSnapResult.snapped - newStartFrame - newDuration) < Math.abs(snapResult.snapped - newStartFrame))) {
          newStartFrame = endSnapResult.snapped - newDuration;
          snapLine = endSnapResult.snapLine;
        }
      } else if (dragState.type === 'resize-start') {
        const maxStart = dragState.originalStartFrame + dragState.originalDuration - MIN_DURATION;
        newStartFrame = Math.max(0, Math.min(maxStart, dragState.originalStartFrame + deltaFrames));
        const snapResult = snapToPoint(newStartFrame, block.id);
        newStartFrame = Math.min(snapResult.snapped, maxStart);
        snapLine = snapResult.snapLine;
        newDuration = dragState.originalStartFrame + dragState.originalDuration - newStartFrame;
      } else if (dragState.type === 'resize-end') {
        newDuration = Math.max(MIN_DURATION, dragState.originalDuration + deltaFrames);
        const endFrame = dragState.originalStartFrame + newDuration;
        const snapResult = snapToPoint(endFrame, block.id);
        if (snapResult.snapLine !== null) {
          newDuration = snapResult.snapped - dragState.originalStartFrame;
          snapLine = snapResult.snapLine;
        }
        newDuration = Math.max(MIN_DURATION, newDuration);
      }
      
      setSnapLines(snapLine !== null ? [snapLine] : []);
      
      const updatedMessages = messages.map((msg) => {
        if (msg.id === block.id) {
          return {
            ...msg,
            startFrame: newStartFrame,
            duration: newDuration,
          };
        }
        return msg;
      });
      
      onMessagesChange(updatedMessages);
    };
    
    const handleMouseUp = () => {
      setDragState(null);
      setSnapLines([]);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, blocks, messages, onMessagesChange, snapToPoint, pixelsPerFrame]);
  
  const handleTimelineScrub = useCallback((e: React.MouseEvent, startScrub: boolean = false) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const scrollLeft = scrollContainerRef.current?.scrollLeft || 0;
    const x = e.clientX - rect.left + scrollLeft;
    const frame = Math.max(0, Math.min(totalDuration, Math.round(x / pixelsPerFrame)));
    onSeek(frame);
    
    if (startScrub) {
      setIsScrubbing(true);
    }
  }, [totalDuration, onSeek, pixelsPerFrame]);
  
  useEffect(() => {
    if (!isScrubbing) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const scrollLeft = scrollContainerRef.current?.scrollLeft || 0;
      const x = e.clientX - rect.left + scrollLeft;
      const frame = Math.max(0, Math.min(totalDuration, Math.round(x / pixelsPerFrame)));
      onSeek(frame);
    };
    
    const handleMouseUp = () => {
      setIsScrubbing(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, totalDuration, onSeek, pixelsPerFrame]);
  
  const handleBlockMouseMove = useCallback((e: React.MouseEvent, block: MessageBlock) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    if (x < 12) {
      setHoverEdge('start');
    } else if (x > width - 12) {
      setHoverEdge('end');
    } else {
      setHoverEdge(null);
    }
    
    setHoveredBlock(block.id);
  }, []);
  
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.5 : 0.5;
      setPixelsPerFrame(prev => Math.max(MIN_PIXELS_PER_FRAME, Math.min(MAX_PIXELS_PER_FRAME, prev + delta)));
    }
  }, []);
  
  const zoomIn = useCallback(() => {
    setPixelsPerFrame(prev => Math.min(MAX_PIXELS_PER_FRAME, prev + 0.5));
  }, []);
  
  const zoomOut = useCallback(() => {
    setPixelsPerFrame(prev => Math.max(MIN_PIXELS_PER_FRAME, prev - 0.5));
  }, []);
  
  const zoomFit = useCallback(() => {
    const containerWidth = scrollContainerRef.current?.clientWidth || 800;
    const idealPpf = containerWidth / (totalDuration + 60);
    setPixelsPerFrame(Math.max(MIN_PIXELS_PER_FRAME, Math.min(MAX_PIXELS_PER_FRAME, idealPpf)));
  }, [totalDuration]);
  
  const formatTime = useCallback((frame: number, showFrames: boolean = true) => {
    const seconds = frame / fps;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = frame % fps;
    if (showFrames) {
      return `${mins}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [fps]);
  
  const timeMarkers = useMemo(() => {
    const markers: { frame: number; label: string; major: boolean }[] = [];
    
    let interval: number;
    if (pixelsPerFrame >= 6) {
      interval = fps / 2;
    } else if (pixelsPerFrame >= 3) {
      interval = fps;
    } else if (pixelsPerFrame >= 1.5) {
      interval = fps * 2;
    } else {
      interval = fps * 5;
    }
    
    for (let f = 0; f <= totalDuration; f += interval) {
      const isMajor = f % (fps * 2) === 0;
      markers.push({
        frame: f,
        label: formatTime(f, false),
        major: isMajor,
      });
    }
    
    return markers;
  }, [totalDuration, fps, pixelsPerFrame, formatTime]);
  
  const timelineWidth = Math.max((totalDuration + 60) * pixelsPerFrame, 800);
  
  useEffect(() => {
    if (!scrollContainerRef.current || dragState || isScrubbing) return;
    
    const container = scrollContainerRef.current;
    const playheadX = currentFrame * pixelsPerFrame;
    const containerWidth = container.clientWidth;
    const scrollLeft = container.scrollLeft;
    
    if (playheadX < scrollLeft + 100) {
      container.scrollTo({ left: Math.max(0, playheadX - 100), behavior: 'smooth' });
    } else if (playheadX > scrollLeft + containerWidth - 100) {
      container.scrollTo({ left: playheadX - containerWidth + 100, behavior: 'smooth' });
    }
  }, [currentFrame, pixelsPerFrame, dragState, isScrubbing]);
  
  return (
    <div 
      ref={containerRef}
      onWheel={handleWheel}
      style={{
        backgroundColor: colors.bgPanel,
        userSelect: 'none',
      }}
    >
      {/* Header with controls */}
      <div style={{
        padding: '8px 16px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.bg,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ 
            color: colors.textSecondary, 
            fontWeight: 600, 
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Timeline
          </span>
          <span style={{ 
            color: colors.playhead, 
            fontSize: 11, 
            fontFamily: 'SF Mono, Monaco, monospace',
            backgroundColor: colors.bgElevated,
            padding: '4px 8px',
            borderRadius: 4,
          }}>
            {formatTime(currentFrame)}
          </span>
        </div>
        
        {/* Zoom controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={zoomOut}
            style={{
              width: 24,
              height: 24,
              backgroundColor: colors.bgElevated,
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`,
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Zoom Out"
          >
            −
          </button>
          <span style={{ 
            color: colors.textMuted, 
            fontSize: 10, 
            minWidth: 44, 
            textAlign: 'center',
            fontFamily: 'SF Mono, Monaco, monospace',
          }}>
            {Math.round(pixelsPerFrame * 100 / DEFAULT_PIXELS_PER_FRAME)}%
          </span>
          <button
            onClick={zoomIn}
            style={{
              width: 24,
              height: 24,
              backgroundColor: colors.bgElevated,
              color: colors.textSecondary,
              border: `1px solid ${colors.border}`,
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={zoomFit}
            style={{
              padding: '4px 8px',
              backgroundColor: colors.bgElevated,
              color: colors.textMuted,
              border: `1px solid ${colors.border}`,
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 10,
              marginLeft: 4,
            }}
            title="Fit to View"
          >
            Fit
          </button>
        </div>
        
        <span style={{ color: colors.textMuted, fontSize: 10 }}>
          {messages.length} messages • {formatTime(totalDuration)}
        </span>
      </div>
      
      {/* Scrollable Timeline Area */}
      <div 
        ref={scrollContainerRef}
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
        }}
      >
        {/* Time Ruler */}
        <div 
          style={{
            height: 24,
            position: 'relative',
            width: timelineWidth,
            backgroundColor: colors.bg,
            borderBottom: `1px solid ${colors.border}`,
            cursor: 'pointer',
          }}
          onMouseDown={(e) => handleTimelineScrub(e, true)}
        >
          {timeMarkers.map(({ frame, label, major }) => (
            <div
              key={frame}
              style={{
                position: 'absolute',
                left: frame * pixelsPerFrame + 16,
                top: 0,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <span style={{ 
                color: major ? colors.textMuted : colors.border, 
                fontSize: 9, 
                marginBottom: 2,
                fontFamily: 'SF Mono, Monaco, monospace',
              }}>
                {major ? label : ''}
              </span>
              <div style={{ 
                width: 1, 
                height: major ? 8 : 5, 
                backgroundColor: major ? colors.border : colors.gridMinor,
              }} />
            </div>
          ))}
          
          {/* Ruler playhead indicator */}
          <div
            style={{
              position: 'absolute',
              left: currentFrame * pixelsPerFrame + 16,
              bottom: 0,
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderBottom: `6px solid ${colors.playhead}`,
              transform: 'translateX(-5px)',
              zIndex: 300,
            }}
          />
        </div>
        
        {/* Track */}
        <div
          ref={trackRef}
          onMouseDown={(e) => {
            if (!dragState) {
              handleTimelineScrub(e, true);
            }
          }}
          style={{
            position: 'relative',
            height: BLOCK_HEIGHT + TRACK_PADDING * 2 + 12,
            width: timelineWidth,
            paddingLeft: 16,
            paddingRight: 16,
            backgroundColor: colors.bgTrack,
            backgroundImage: `
              linear-gradient(90deg, ${colors.gridMajor} 1px, transparent 1px),
              linear-gradient(90deg, ${colors.gridMinor} 1px, transparent 1px)
            `,
            backgroundSize: `${fps * pixelsPerFrame}px 100%, ${fps * pixelsPerFrame / 2}px 100%`,
            cursor: isScrubbing ? 'grabbing' : 'pointer',
          }}
        >
          {/* Message track background */}
          <div style={{
            position: 'absolute',
            left: 16,
            right: 16,
            top: TRACK_PADDING,
            height: BLOCK_HEIGHT,
            backgroundColor: colors.bgPanel,
            borderRadius: 6,
            border: `1px solid ${colors.border}`,
          }} />
          
          {/* Message Blocks */}
          {blocks.map(block => {
            const effectiveDuration = getEffectiveDuration(block);
            const left = block.startFrame * pixelsPerFrame + 16;
            const width = Math.max(effectiveDuration * pixelsPerFrame, 50);
            const isHovered = hoveredBlock === block.id;
            const isDragging = dragState?.blockId === block.id;
            const isSelected = selectedBlock === block.id;
            
            // Muted colors for professional look
            const baseColor = block.isMe ? colors.accentDark : colors.themDark;
            const activeColor = block.isMe ? colors.accent : colors.them;
            const bgColor = isDragging || isSelected ? activeColor : baseColor;
            
            return (
              <div
                key={block.id}
                onMouseDown={(e) => {
                  const edge = isHovered ? hoverEdge : null;
                  handleBlockMouseDown(e, block, edge);
                }}
                onMouseMove={(e) => handleBlockMouseMove(e, block)}
                onMouseLeave={() => {
                  setHoveredBlock(null);
                  setHoverEdge(null);
                }}
                style={{
                  position: 'absolute',
                  left,
                  top: TRACK_PADDING,
                  width,
                  height: BLOCK_HEIGHT,
                  backgroundColor: bgColor,
                  borderRadius: 6,
                  padding: '6px 10px',
                  boxSizing: 'border-box',
                  cursor: isHovered && hoverEdge ? 'ew-resize' : isDragging ? 'grabbing' : 'grab',
                  boxShadow: isDragging 
                    ? `0 4px 20px rgba(0,0,0,0.5), 0 0 0 2px ${colors.text}` 
                    : isHovered 
                      ? '0 2px 8px rgba(0,0,0,0.3)' 
                      : 'none',
                  border: isDragging 
                    ? `2px solid ${colors.text}` 
                    : isSelected
                      ? `2px solid rgba(255,255,255,0.4)`
                      : isHovered 
                        ? `2px solid rgba(255,255,255,0.2)` 
                        : '2px solid transparent',
                  transition: isDragging ? 'none' : 'box-shadow 0.15s, border 0.15s',
                  zIndex: isDragging ? 100 : isHovered ? 50 : isSelected ? 25 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {/* Message preview text */}
                <div style={{
                  color: colors.text,
                  fontSize: 11,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  opacity: 0.95,
                }}>
                  {block.isMe ? '→ ' : '← '}{block.text.slice(0, 30)}{block.text.length > 30 ? '...' : ''}
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: 9,
                  marginTop: 2,
                  fontFamily: 'SF Mono, Monaco, monospace',
                }}>
                  f{block.startFrame} • {(effectiveDuration / fps).toFixed(1)}s
                </div>
                
                {/* Resize handles */}
                {(isHovered || isDragging) && (
                  <>
                    <div 
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: 10,
                        height: '100%',
                        cursor: 'ew-resize',
                        backgroundColor: hoverEdge === 'start' || (isDragging && dragState?.type === 'resize-start')
                          ? 'rgba(255,255,255,0.3)' 
                          : 'rgba(255,255,255,0.1)',
                        borderRadius: '6px 0 0 6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div style={{
                        width: 2,
                        height: 16,
                        backgroundColor: 'rgba(255,255,255,0.5)',
                        borderRadius: 1,
                      }} />
                    </div>
                    <div 
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        width: 10,
                        height: '100%',
                        cursor: 'ew-resize',
                        backgroundColor: hoverEdge === 'end' || (isDragging && dragState?.type === 'resize-end')
                          ? 'rgba(255,255,255,0.3)' 
                          : 'rgba(255,255,255,0.1)',
                        borderRadius: '0 6px 6px 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <div style={{
                        width: 2,
                        height: 16,
                        backgroundColor: 'rgba(255,255,255,0.5)',
                        borderRadius: 1,
                      }} />
                    </div>
                  </>
                )}
              </div>
            );
          })}
          
          {/* Snap lines */}
          {snapLines.map((frame, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: frame * pixelsPerFrame + 16,
                top: 0,
                width: 1,
                height: '100%',
                backgroundColor: colors.snap,
                boxShadow: `0 0 6px ${colors.snap}`,
                zIndex: 200,
              }}
            />
          ))}
          
          {/* Playhead */}
          <div
            style={{
              position: 'absolute',
              left: currentFrame * pixelsPerFrame + 16,
              top: -4,
              width: 2,
              height: BLOCK_HEIGHT + TRACK_PADDING * 2 + 20,
              backgroundColor: colors.playhead,
              boxShadow: `0 0 6px ${colors.playhead}50`,
              zIndex: 300,
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
      
      {/* Footer legend */}
      <div style={{
        padding: '6px 16px',
        borderTop: `1px solid ${colors.border}`,
        display: 'flex',
        gap: 16,
        fontSize: 10,
        color: colors.textMuted,
        backgroundColor: colors.bg,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ 
            display: 'inline-block', 
            width: 12, 
            height: 12, 
            backgroundColor: colors.accentDark, 
            borderRadius: 2,
          }} />
          You
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ 
            display: 'inline-block', 
            width: 12, 
            height: 12, 
            backgroundColor: colors.themDark, 
            borderRadius: 2,
          }} />
          Them
        </span>
        <span style={{ marginLeft: 'auto' }}>
          Drag to move • Edges to resize • ⌘+Scroll to zoom
        </span>
      </div>
    </div>
  );
};

export default DraggableTimeline;
