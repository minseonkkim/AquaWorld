import React, { useState } from 'react';
import { Tank } from '@/types';
import { TANK_ENVIRONMENTS, getTankCapacity, TANK_MAX_COUNT } from '@/constants';
import { playSFX } from '@/services/audio';

interface Props {
  tanks: Tank[];
  activeTankId: string | null;
  pearl: number;
  /** 다음 수조 구매 비용(Pearl). null 이면 보유 상한 도달 */
  buyCost: number | null;
  buying: boolean;
  onSwitch: (tankId: string) => void;
  onBuy: () => void;
}

/**
 * 상단 HUD 아래 가운데에 뜨는 수조 전환 pill + 드롭 패널.
 * 수조가 1개여도 항상 노출한다 — 추가 수조 구매의 진입점이기도 하다.
 */
export default function TankSwitcher({
  tanks, activeTankId, pearl, buyCost, buying, onSwitch, onBuy,
}: Props) {
  const [open, setOpen] = useState(false);
  const active = tanks.find(t => t.id === activeTankId);
  if (!active) return null;

  return (
    <div style={{
      position: 'absolute', left: '50%', transform: 'translateX(-50%)',
      top: 'calc(var(--safe-top) + 52px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      pointerEvents: 'auto', maxWidth: 'calc(100vw - 16px)',
    }}>
      <button
        onClick={() => { playSFX('click'); setOpen(v => !v); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: open ? 'rgba(77, 208, 225, 0.25)' : 'rgba(0,0,0,0.5)',
          border: `1px solid ${open ? 'rgba(77, 208, 225, 0.6)' : 'rgba(255,255,255,0.15)'}`,
          borderRadius: 20, padding: '4px 12px', cursor: 'pointer',
          color: '#fff', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
        }}
      >
        <span>{TANK_ENVIRONMENTS[active.environment].emoji}</span>
        <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>{active.name}</span>
        {tanks.length > 1 && (
          <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
            {tanks.findIndex(t => t.id === active.id) + 1}/{tanks.length}
          </span>
        )}
        <span style={{ fontSize: 9 }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 6,
          background: 'rgba(10, 22, 40, 0.95)', borderRadius: 12, padding: 10,
          border: '1px solid rgba(77, 208, 225, 0.4)', minWidth: 240,
        }}>
          {tanks.map(t => {
            const isActive = t.id === active.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setOpen(false);
                  if (!isActive) onSwitch(t.id);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: isActive ? 'rgba(77, 208, 225, 0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isActive ? 'rgba(77, 208, 225, 0.6)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 8, padding: '6px 8px', cursor: 'pointer',
                }}
              >
                <span style={{
                  width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                  background: TANK_ENVIRONMENTS[t.environment].preview,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                }}>{TANK_ENVIRONMENTS[t.environment].emoji}</span>
                <span style={{ flex: 1, textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#fff' }}>
                  {t.name}
                </span>
                <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
                  🐟 {t.fish.length}/{getTankCapacity(t.capacityLevel)}
                </span>
                {isActive && <span style={{ fontSize: 10, color: '#4dd0e1', fontWeight: 700 }}>보는 중</span>}
              </button>
            );
          })}

          {buyCost !== null ? (
            <>
              <button
                onClick={() => { setOpen(false); onBuy(); }}
                disabled={buying}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px dashed rgba(77, 208, 225, 0.5)',
                  borderRadius: 8, padding: '7px 8px',
                  color: pearl >= buyCost ? '#fff' : 'var(--color-text-secondary)',
                  fontSize: 12, fontWeight: 600,
                  cursor: buying ? 'wait' : 'pointer', opacity: buying ? 0.5 : 1,
                }}
              >
                ➕ 새 수조 <span>{buyCost} 🪙</span>
              </button>
              <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                새 수조는 하루 무료 먹이가 +2회 늘어나요
              </div>
            </>
          ) : (
            <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', textAlign: 'center' }}>
              수조는 최대 {TANK_MAX_COUNT}개까지 보유할 수 있어요
            </div>
          )}
        </div>
      )}
    </div>
  );
}
