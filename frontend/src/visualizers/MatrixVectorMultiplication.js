import React, { useEffect, useRef } from 'react';

// Vibrant, harmonized element colors (tailwind-style 500/400 shades)
const ELEMENT_COLORS = [
  '#ef4444', // red
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#14b8a6', // teal
];

// Slight lighten of a hex color (for top of gradient)
function lighten(hex, amt) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (num >> 16) + amt * 255);
  const g = Math.min(255, ((num >> 8) & 0xff) + amt * 255);
  const b = Math.min(255, (num & 0xff) + amt * 255);
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function darken(hex, amt) {
  const num = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (num >> 16) - amt * 255);
  const g = Math.max(0, ((num >> 8) & 0xff) - amt * 255);
  const b = Math.max(0, (num & 0xff) - amt * 255);
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawCell({ ctx, x, y, w, h, color, isActive, isSelected, radius = 6, label, labelColor, labelFont }) {
  ctx.save();
  if (isActive) {
    if (isSelected) {
      ctx.shadowColor = 'rgba(250, 204, 21, 0.85)';
      ctx.shadowBlur = 22;
    } else {
      ctx.shadowColor = color + 'cc';
      ctx.shadowBlur = 10;
    }
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, lighten(color, 0.12));
    grad.addColorStop(1, darken(color, 0.1));
    ctx.fillStyle = grad;
    roundRect(ctx, x, y, w, h, radius);
    ctx.fill();
    ctx.shadowBlur = 0;

    // subtle inner highlight
    const innerGrad = ctx.createLinearGradient(x, y, x, y + h * 0.5);
    innerGrad.addColorStop(0, 'rgba(255,255,255,0.18)');
    innerGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = innerGrad;
    roundRect(ctx, x, y, w, h, radius);
    ctx.fill();
  } else {
    // dim/empty cell
    ctx.fillStyle = 'rgba(30, 41, 59, 0.55)';
    roundRect(ctx, x, y, w, h, radius);
    ctx.fill();
  }

  // border
  if (isSelected) {
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
  } else if (isActive) {
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 1;
  } else {
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
    ctx.lineWidth = 1;
  }
  roundRect(ctx, x, y, w, h, radius);
  ctx.stroke();
  ctx.restore();

  if (label !== undefined && label !== null) {
    ctx.fillStyle = labelColor;
    ctx.font = labelFont;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2);
  }
}

function drawBrackets(ctx, x, y, w, h, color = 'rgba(148, 163, 184, 0.6)') {
  const offset = 8;
  const bracketLen = Math.max(10, Math.min(16, h * 0.07));
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Left bracket
  ctx.beginPath();
  ctx.moveTo(x - offset + bracketLen, y - 2);
  ctx.lineTo(x - offset, y - 2);
  ctx.lineTo(x - offset, y + h + 2);
  ctx.lineTo(x - offset + bracketLen, y + h + 2);
  ctx.stroke();

  // Right bracket
  ctx.beginPath();
  ctx.moveTo(x + w + offset - bracketLen, y - 2);
  ctx.lineTo(x + w + offset, y - 2);
  ctx.lineTo(x + w + offset, y + h + 2);
  ctx.lineTo(x + w + offset - bracketLen, y + h + 2);
  ctx.stroke();
  ctx.restore();
}

function drawSectionTitle(ctx, text, x, y, font, color = 'rgba(148, 163, 184, 0.85)') {
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, x, y);
}

export function MatrixVectorMultiplication({ matrix, vector, result, permutation, selectedCell, onCellClick }) {
  const canvasRef = useRef(null);
  const layoutRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !matrix || !vector || !result) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // DPR scaling for crisp rendering on retina displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    // Background: radial gradient with subtle accent
    const bgGrad = ctx.createRadialGradient(width * 0.3, height * 0.2, 0, width * 0.5, height * 0.5, Math.max(width, height));
    bgGrad.addColorStop(0, '#1e1b4b');
    bgGrad.addColorStop(0.6, '#0f172a');
    bgGrad.addColorStop(1, '#0b1120');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const n = matrix.length;
    const padding = 28;
    const getColor = (idx) => ELEMENT_COLORS[idx % ELEMENT_COLORS.length];

    // Layout: P (matrix) · [calc column] = result vector
    // Width units of cellSize: matrix(n) + opGap(0.7) + calc(2.4n + 1.2) + opGap(0.7) + result(1) = 3.4n + 3.6
    const cellSizeByWidth = (width - 2 * padding) / (3.4 * n + 3.6);
    const cellSizeByHeight = (height - 110) / n;
    const cellSize = Math.max(22, Math.min(82, cellSizeByWidth, cellSizeByHeight));

    const termWidth = cellSize * 1.9;
    const termHeight = cellSize * 0.62;
    const plusWidth = cellSize * 0.5;
    const equalsWidth = cellSize * 0.55;
    const resultBoxWidth = cellSize * 0.95;
    const opWidth = cellSize * 0.7;

    const cellNumberFont = `700 ${Math.round(cellSize * 0.4)}px Inter, sans-serif`;
    const termFont = `600 ${Math.round(cellSize * 0.3)}px 'JetBrains Mono', monospace`;
    const opFont = `300 ${Math.round(cellSize * 0.7)}px Inter, sans-serif`;
    const smallOpFont = `500 ${Math.round(cellSize * 0.36)}px Inter, sans-serif`;
    const titleFont = `700 ${Math.round(Math.max(10, cellSize * 0.22))}px Inter, sans-serif`;

    const matrixWidth = n * cellSize;
    const calcRowWidth = n * termWidth + (n - 1) * plusWidth + equalsWidth + resultBoxWidth;
    const totalWidth = matrixWidth + opWidth + calcRowWidth + opWidth + cellSize;

    const startX = Math.max(padding, (width - totalWidth) / 2);
    const startY = Math.max(56, (height - n * cellSize) / 2);

    // ===== Permutation Matrix =====
    const matrixX = startX;
    const matrixY = startY;

    drawSectionTitle(ctx, 'PERMUTATION MATRIX P', matrixX + matrixWidth / 2, matrixY - 18, titleFont);

    layoutRef.current = { matrixX, matrixY, cellSize, n };

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const x = matrixX + j * cellSize + 3;
        const y = matrixY + i * cellSize + 3;
        const w = cellSize - 6;
        const h = cellSize - 6;
        const value = matrix[i][j];
        const isActive = value === 1;
        const isSelected = selectedCell && selectedCell.row === i && selectedCell.col === j;

        drawCell({
          ctx,
          x, y, w, h,
          color: getColor(j),
          isActive,
          isSelected,
          radius: Math.max(4, cellSize * 0.12),
          label: isActive ? '1' : '0',
          labelColor: isActive ? '#fff' : 'rgba(148, 163, 184, 0.5)',
          labelFont: cellNumberFont,
        });
      }
    }
    drawBrackets(ctx, matrixX, matrixY, matrixWidth, n * cellSize, 'rgba(148, 163, 184, 0.55)');

    // ===== · Operator =====
    const dotOpX = matrixX + matrixWidth + opWidth / 2;
    const opCenterY = matrixY + (n * cellSize) / 2;
    ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
    ctx.font = opFont;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('·', dotOpX, opCenterY - cellSize * 0.06);

    // ===== Calculation Column =====
    const calcX = matrixX + matrixWidth + opWidth;
    const calcY = matrixY;

    drawSectionTitle(ctx, 'ROW · V CALCULATION', calcX + calcRowWidth / 2, calcY - 18, titleFont);

    for (let i = 0; i < n; i++) {
      const rowCenterY = calcY + i * cellSize + cellSize / 2;
      let x = calcX;

      for (let j = 0; j < n; j++) {
        const m = matrix[i][j];
        const v = vector[j];
        const isActive = m === 1;
        const ty = rowCenterY - termHeight / 2;

        drawCell({
          ctx,
          x, y: ty, w: termWidth, h: termHeight,
          color: getColor(j),
          isActive,
          isSelected: false,
          radius: Math.max(4, termHeight * 0.25),
          label: `${m}·${Math.round(v)}`,
          labelColor: isActive ? '#fff' : 'rgba(148, 163, 184, 0.55)',
          labelFont: termFont,
        });

        x += termWidth;

        if (j < n - 1) {
          ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
          ctx.font = smallOpFont;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('+', x + plusWidth / 2, rowCenterY);
          x += plusWidth;
        }
      }

      // Equals sign
      ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
      ctx.font = smallOpFont;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('=', x + equalsWidth / 2, rowCenterY);
      x += equalsWidth;

      // Row result
      const rb_y = rowCenterY - termHeight / 2;
      drawCell({
        ctx,
        x, y: rb_y, w: resultBoxWidth, h: termHeight,
        color: getColor(permutation[i]),
        isActive: true,
        isSelected: false,
        radius: Math.max(4, termHeight * 0.25),
        label: Math.round(result[i]),
        labelColor: '#fff',
        labelFont: termFont,
      });
    }

    // ===== = Operator =====
    const equalsOpX = calcX + calcRowWidth + opWidth / 2;
    ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
    ctx.font = opFont;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('=', equalsOpX, opCenterY);

    // ===== Result Vector =====
    const resultX = calcX + calcRowWidth + opWidth;
    const resultY = matrixY;

    drawSectionTitle(ctx, 'RESULT  P · V', resultX + cellSize / 2, resultY - 18, titleFont);

    for (let i = 0; i < n; i++) {
      const x = resultX + 3;
      const y = resultY + i * cellSize + 3;
      const w = cellSize - 6;
      const h = cellSize - 6;
      drawCell({
        ctx,
        x, y, w, h,
        color: getColor(permutation[i]),
        isActive: true,
        isSelected: false,
        radius: Math.max(4, cellSize * 0.12),
        label: Math.round(result[i]),
        labelColor: '#fff',
        labelFont: cellNumberFont,
      });
    }
    drawBrackets(ctx, resultX, resultY, cellSize, n * cellSize, 'rgba(148, 163, 184, 0.55)');
  }, [matrix, vector, result, permutation, selectedCell]);

  const getCellFromEvent = (e) => {
    if (!layoutRef.current || !canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { matrixX, matrixY, cellSize, n } = layoutRef.current;
    if (x < matrixX || x >= matrixX + n * cellSize) return null;
    if (y < matrixY || y >= matrixY + n * cellSize) return null;
    return {
      row: Math.floor((y - matrixY) / cellSize),
      col: Math.floor((x - matrixX) / cellSize),
    };
  };

  const handleClick = (e) => {
    if (!onCellClick) return;
    const cell = getCellFromEvent(e);
    if (cell) onCellClick(cell.row, cell.col);
  };

  const handleMouseMove = (e) => {
    if (!canvasRef.current) return;
    const cell = getCellFromEvent(e);
    canvasRef.current.style.cursor = cell ? 'pointer' : 'default';
  };

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      style={{ width: '100%', height: '100%', flex: '1 1 0', display: 'block' }}
    />
  );
}

export { ELEMENT_COLORS };
