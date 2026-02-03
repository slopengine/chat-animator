import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MessageSchema } from '../schema';

interface TimelineProps {
  messages: MessageSchema[];
  onMessagesChange: (messages: MessageSchema[]) => void;
  totalDuration: number;
  currentFrame: number;
  onSeek: (frame: number) => void;
  fps: number;
}

interface MessageBlock {
  id: string;
  text: string;
  isMe: boolean;
  startFrame: number;
  duration: number;
  originalIndex: number;
}

const PIXELS_PER_FRAME = 3;
const BLOCK_HEIGHT = 48;
const TRACK_PADDING = 8;
const SNAP_THRESHOLD = 10; // frames
const MIN_DURATION = 15; // minimum frames for a message

/**
 * Visual Timeline Editor for WhatsApp Chat Animator
 * 
 * Features:
 * - Single track showing all messages in sequence
 * - Draggable blocks to adjust timing
 * - Resizable edges to adjust duration
 * - Snapping to other message edges
 * - Color coding for "me" vs "them" messages
 * - Text preview on each block
 */
export const Timeline: React.FC<TimelineProps> = ({
  messages,
  onMessagesChange,
  totalDuration,
  currentFrame,
  onSeek,
  fps,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  
  // Drag state
  const [dragState, setDragState] = useState<{
    type: 'move' | 'resize-start' | 'resize-end';
    blockId: string;
    startX: number;
    originalStartFrame: number;
    originalDuration: number;
  } | null>(null);
  
  // Hover state for resize handles
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null);
  const [hoverEdge, setHoverEdge] = useState<'start' | 'end' | null>(null);
  
  // Snap lines
  const [snapLines, setSnapLines] = useState<number[]>([]);
  
  // Convert messages to blocks with timing
  const blocks: MessageBlock[] = messages.map((msg, index) => {
    // Calculate default timing if not specified
    const defaultStart = index * 60 + 30; // 30 frame initial delay, 60 frames between
    const defaultDuration = 0; // 0 means "until end"
    
    return {
      id: msg.id,
      text: msg.text,
      isMe: msg.isMe,
      startFrame: msg.startFrame ?? defaultStart,
      duration: msg.duration ?? defaultDuration,
      originalIndex: index,
    };
  });
  
  // Get effective duration (if 0, extend to end of video)
  const getEffectiveDuration = (block: MessageBlock) => {
    if (block.duration === 0) {
      return totalDuration - block.startFrame;
    }
    return block.duration;
  };
  
  // Find snap points from other blocks
  const getSnapPoints = useCallback((excludeId: string): number[] => {
    const points: number[] = [0]; // Start of timeline
    
    blocks.forEach(block => {
      if (block.id !== excludeId) {
        points.push(block.startFrame);
        if (block.duration > 0) {
          points.push(block.startFrame + block.duration);
        }
      }
    });
    
    return points;
  }, [blocks]);
  
  // Snap a frame to nearby snap points
  const snapToPoint = useCallback((frame: number, excludeId: string): { snapped: number; snapLine: number | null } => {
    const snapPoints = getSnapPoints(excludeId);
    
    for (const point of snapPoints) {
      if (Math.abs(frame - point) <= SNAP_THRESHOLD) {
        return { snapped: point, snapLine: point };
      }
    }
    
    return { snapped: frame, snapLine: null };
  }, [getSnapPoints]);
  
  // Handle mouse down on block
  const handleBlockMouseDown = useCallback((e: React.MouseEvent, block: MessageBlock, edge: 'start' | 'end' | null) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const type = edge === 'start' ? 'resize-start' : edge === 'end' ? 'resize-end' : 'move';
    
    setDragState({
      type,
      blockId: block.id,
      startX: e.clientX,
      originalStartFrame: block.startFrame,
      originalDuration: block.duration || getEffectiveDuration(block),
    });
  }, []);
  
  // Handle mouse move for dragging
  useEffect(() => {
    if (!dragState) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragState.startX;
      const deltaFrames = Math.round(deltaX / PIXELS_PER_FRAME);
      
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
        
        // Also check end point snapping
        const endSnapResult = snapToPoint(newStartFrame + newDuration, block.id);
        if (endSnapResult.snapLine !== null && (snapLine === null || Math.abs(endSnapResult.snapped - newStartFrame - newDuration) < Math.abs(snapResult.snapped - newStartFrame))) {
          newStartFrame = endSnapResult.snapped - newDuration;
          snapLine = endSnapResult.snapLine;
        }
      } else if (dragState.type === 'resize-start') {
        newStartFrame = Math.max(0, Math.min(dragState.originalStartFrame + dragState.originalDuration - MIN_DURATION, dragState.originalStartFrame + deltaFrames));
        const snapResult = snapToPoint(newStartFrame, block.id);
        newStartFrame = Math.min(snapResult.snapped, dragState.originalStartFrame + dragState.originalDuration - MIN_DURATION);
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
      
      // Update snap lines
      setSnapLines(snapLine !== null ? [snapLine] : []);
      
      // Update messages
      const updatedMessages = messages.map((msg, idx) => {
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
  }, [dragState, blocks, messages, onMessagesChange, snapToPoint]);
  
  // Handle click on timeline track to seek
  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    if (dragState) return;
    
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const frame = Math.max(0, Math.min(totalDuration, Math.round(x / PIXELS_PER_FRAME)));
    onSeek(frame);
  }, [dragState, totalDuration, onSeek]);
  
  // Detect edge hover for resize cursor
  const handleBlockMouseMove = useCallback((e: React.MouseEvent, block: MessageBlock) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    if (x < 10) {
      setHoverEdge('start');
    } else if (x > width - 10) {
      setHoverEdge('end');
    } else {
      setHoverEdge(null);
    }
    
    setHoveredBlock(block.id);
  }, []);
  
  // Format frame as time
  const formatTime = (frame: number) => {
    const seconds = frame / fps;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = frame % fps;
    return `${mins}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };
  
  // Generate time markers
  const timeMarkers: number[] = [];
  const markerInterval = fps * 2; // Every 2 seconds
  for (let f = 0; f <= totalDuration; f += markerInterval) {
    timeMarkers.push(f);
  }
  
  const timelineWidth = totalDuration * PIXELS_PER_FRAME;
  
  return (
    <div 
      ref={containerRef}
      style={{
        backgroundColor: '#1a1a2e',
        borderRadius: 8,
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #333355',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ color: '#ffffff', fontWeight: 600, fontSize: 14 }}>
          📹 Timeline Editor
        </span>
        <span style={{ color: '#888899', fontSize: 12 }}>
          Current: {formatTime(currentFrame)} | Duration: {formatTime(totalDuration)}
        </span>
      </div>
      
      {/* Scrollable Timeline Area */}
      <div style={{
        overflowX: 'auto',
        overflowY: 'hidden',
        padding: '8px 0',
      }}>
        {/* Time Ruler */}
        <div style={{
          height: 24,
          position: 'relative',
          width: timelineWidth,
          marginLeft: 16,
          borderBottom: '1px solid #333355',
        }}>
          {timeMarkers.map(frame => (
            <div
              key={frame}
              style={{
                position: 'absolute',
                left: frame * PIXELS_PER_FRAME,
                top: 0,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div style={{ width: 1, height: 8, backgroundColor: '#555577' }} />
              <span style={{ color: '#888899', fontSize: 10, marginTop: 2 }}>
                {formatTime(frame)}
              </span>
            </div>
          ))}
        </div>
        
        {/* Track */}
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          style={{
            position: 'relative',
            height: BLOCK_HEIGHT + TRACK_PADDING * 2,
            width: timelineWidth,
            marginLeft: 16,
            backgroundColor: '#222240',
            borderRadius: 4,
            marginTop: 8,
            cursor: 'pointer',
          }}
        >
          {/* Message Blocks */}
          {blocks.map(block => {
            const effectiveDuration = getEffectiveDuration(block);
            const left = block.startFrame * PIXELS_PER_FRAME;
            const width = Math.max(effectiveDuration * PIXELS_PER_FRAME, 60);
            const isHovered = hoveredBlock === block.id;
            const isDragging = dragState?.blockId === block.id;
            
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
                  backgroundColor: block.isMe ? '#25D366' : '#075E54',
                  borderRadius: 6,
                  padding: '6px 10px',
                  boxSizing: 'border-box',
                  cursor: isHovered && hoverEdge ? 'ew-resize' : isDragging ? 'grabbing' : 'grab',
                  boxShadow: isDragging 
                    ? '0 4px 12px rgba(0,0,0,0.4)' 
                    : isHovered 
                      ? '0 2px 8px rgba(0,0,0,0.3)' 
                      : '0 1px 4px rgba(0,0,0,0.2)',
                  border: isDragging ? '2px solid #ffffff' : isHovered ? '2px solid rgba(255,255,255,0.5)' : '2px solid transparent',
                  transition: isDragging ? 'none' : 'box-shadow 0.15s, border 0.15s',
                  zIndex: isDragging ? 100 : isHovered ? 50 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {/* Message preview text */}
                <div style={{
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {block.isMe ? '→ ' : '← '}{block.text.slice(0, 30)}{block.text.length > 30 ? '...' : ''}
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: 10,
                  marginTop: 2,
                }}>
                  {formatTime(block.startFrame)} • {Math.round(effectiveDuration / fps * 10) / 10}s
                </div>
                
                {/* Resize handles */}
                {isHovered && (
                  <>
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: 10,
                      height: '100%',
                      cursor: 'ew-resize',
                      backgroundColor: hoverEdge === 'start' ? 'rgba(255,255,255,0.3)' : 'transparent',
                      borderRadius: '6px 0 0 6px',
                    }} />
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      width: 10,
                      height: '100%',
                      cursor: 'ew-resize',
                      backgroundColor: hoverEdge === 'end' ? 'rgba(255,255,255,0.3)' : 'transparent',
                      borderRadius: '0 6px 6px 0',
                    }} />
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
                left: frame * PIXELS_PER_FRAME,
                top: 0,
                width: 2,
                height: '100%',
                backgroundColor: '#ff6b6b',
                zIndex: 200,
              }}
            />
          ))}
          
          {/* Playhead */}
          <div
            style={{
              position: 'absolute',
              left: currentFrame * PIXELS_PER_FRAME,
              top: -4,
              width: 2,
              height: BLOCK_HEIGHT + TRACK_PADDING * 2 + 8,
              backgroundColor: '#ff4757',
              zIndex: 300,
              pointerEvents: 'none',
            }}
          >
            <div style={{
              position: 'absolute',
              top: -6,
              left: -4,
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: '6px solid #ff4757',
            }} />
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div style={{
        padding: '8px 16px 12px',
        borderTop: '1px solid #333355',
        display: 'flex',
        gap: 24,
        fontSize: 11,
        color: '#888899',
      }}>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: '#25D366', borderRadius: 3, marginRight: 6, verticalAlign: 'middle' }} />
          Your messages
        </span>
        <span>
          <span style={{ display: 'inline-block', width: 12, height: 12, backgroundColor: '#075E54', borderRadius: 3, marginRight: 6, verticalAlign: 'middle' }} />
          Their messages
        </span>
        <span style={{ marginLeft: 'auto' }}>
          Drag to move • Drag edges to resize • Snaps to other messages
        </span>
      </div>
    </div>
  );
};

export default Timeline;
