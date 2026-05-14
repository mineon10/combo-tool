'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { MatrixVectorMultiplication } from './MatrixVectorMultiplication';
import { VectorTransformationVisualizer } from './VectorTransformationVisualizer';

// Local permutation utilities — no backend round-trip needed for resize/swap
const buildPermMatrix = (perm) => {
  const n = perm.length;
  const m = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) m[i][perm[i]] = 1;
  return m;
};

const applyPerm = (perm, vec) => perm.map((j) => vec[j]);

// Grow a permutation by appending identity entries.
const growPermutation = (perm, targetSize) => {
  const out = [...perm];
  for (let i = perm.length; i < targetSize; i++) out.push(i);
  return out;
};

// Shrink a permutation by repeatedly removing the last position,
// repairing the matrix so every row & column keeps exactly one 1.
const shrinkPermutation = (perm, targetSize) => {
  const out = [...perm];
  while (out.length > targetSize) {
    const lastIdx = out.length - 1;
    const lastVal = out[lastIdx];
    if (lastVal !== lastIdx) {
      // The 1 from the row being removed sat at column `lastVal`.
      // The 1 in column `lastIdx` (also being removed) sat at row `reroute`.
      // Re-point that row to the orphaned column.
      const reroute = out.indexOf(lastIdx);
      out[reroute] = lastVal;
    }
    out.pop();
  }
  return out;
};

export function PermutationVisualizer() {
  const [size, setSize] = useState(5);
  const [permutation, setPermutation] = useState([0, 1, 2, 3, 4]);
  const [matrix, setMatrix] = useState(null);
  const [vector, setVector] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customVectorInput, setCustomVectorInput] = useState('');
  const [selectedCell, setSelectedCell] = useState(null);
  const skipInitRef = useRef(false);
  const hasMountedRef = useRef(false);

  // Parse vector string input
  const parseVectorInput = (input) => {
    try {
      const cleaned = input.replace(/[[\]]/g, '').trim();
      const values = cleaned.split(',').map(v => parseFloat(v.trim()));

      if (values.length < 2 || values.length > 10) {
        throw new Error('Vector must have between 2 and 10 elements');
      }
      if (values.some(isNaN)) {
        throw new Error('All values must be numbers');
      }

      return values;
    } catch (e) {
      throw new Error('Invalid vector: ' + e.message);
    }
  };

  // Apply custom vector — vector length drives the matrix size
  const applyCustomVector = async () => {
    setLoading(true);
    setError(null);
    try {
      const customVec = parseVectorInput(customVectorInput);
      const newSize = customVec.length;

      if (newSize === size) {
        // Same size — reuse current permutation
        const response = await api.applyPermutation(permutation, customVec);
        setVector(customVec);
        setResult(response.data.result);
      } else {
        // Different size — generate a fresh permutation for the new dimension
        skipInitRef.current = true;
        const permResp = await api.getRandomPermutation(newSize);
        const newPerm = permResp.data.permutation;
        const applyResp = await api.applyPermutation(newPerm, customVec);
        setPermutation(newPerm);
        setMatrix(permResp.data.matrix);
        setVector(customVec);
        setResult(applyResp.data.result);
        setSelectedCell(null);
        setSize(newSize);
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate random permutation
  const generateRandomPermutation = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getRandomPermutation(size);
      const newPerm = response.data.permutation;
      setPermutation(newPerm);
      setMatrix(response.data.matrix);
      setSelectedCell(null);

      if (vector) {
        const applyResponse = await api.applyPermutation(newPerm, vector);
        setResult(applyResponse.data.result);
      }
    } catch (err) {
      setError('Failed to generate permutation: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Apply permutation to random vector
  const applyRandomPermutation = async () => {
    setLoading(true);
    setError(null);
    try {
      const randomVector = Array.from({ length: size }, () => Math.floor(Math.random() * 10));
      setVector(randomVector);
      setCustomVectorInput('');

      const response = await api.applyPermutation(permutation, randomVector);
      setResult(response.data.result);
    } catch (err) {
      setError('Failed to apply permutation: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle clicks on matrix cells (interactive swap)
  const handleCellClick = (row, col) => {
    if (!matrix) return;

    if (!selectedCell) {
      // Nothing selected — only allow selecting a 1
      if (matrix[row][col] === 1) {
        setSelectedCell({ row, col });
      }
      return;
    }

    // Clicked same column as the selected 1 — deselect
    if (selectedCell.col === col) {
      setSelectedCell(null);
      return;
    }

    // Perform swap: move 1 at (r1, c1) to (r1, c2); the 1 at (r2, c2) moves to (r2, c1)
    const r1 = selectedCell.row;
    const c1 = selectedCell.col;
    const c2 = col;
    const r2 = permutation.indexOf(c2);

    const newPerm = [...permutation];
    newPerm[r1] = c2;
    newPerm[r2] = c1;

    const newMatrix = matrix.map(r => [...r]);
    newMatrix[r1][c1] = 0;
    newMatrix[r1][c2] = 1;
    newMatrix[r2][c2] = 0;
    newMatrix[r2][c1] = 1;

    setPermutation(newPerm);
    setMatrix(newMatrix);
    setSelectedCell(null);

    if (vector) {
      const newResult = newPerm.map(j => vector[j]);
      setResult(newResult);
    }
  };

  // Effect on size change.
  // - First mount: fetch a random permutation from the backend and seed a random vector.
  // - Later changes from the slider: grow or shrink the existing matrix in place so
  //   the user keeps the permutation they were studying.
  // - When the size change was triggered by applyCustomVector, skipInitRef tells us
  //   state is already set; bail out.
  useEffect(() => {
    if (skipInitRef.current) {
      skipInitRef.current = false;
      return;
    }

    // First mount — async fetch of an initial random permutation
    if (!hasMountedRef.current) {
      let cancelled = false;
      const initialize = async () => {
        setLoading(true);
        setError(null);
        try {
          const permResp = await api.getRandomPermutation(size);
          if (cancelled) return;
          const newPerm = permResp.data.permutation;
          const newMatrix = permResp.data.matrix;
          const newVector = Array.from({ length: size }, () => Math.floor(Math.random() * 9) + 1);
          const newResult = applyPerm(newPerm, newVector);
          setPermutation(newPerm);
          setMatrix(newMatrix);
          setVector(newVector);
          setResult(newResult);
          setSelectedCell(null);
          setCustomVectorInput('');
          hasMountedRef.current = true;
        } catch (err) {
          if (cancelled) return;
          setError('Failed to initialize: ' + err.message);
        } finally {
          if (!cancelled) setLoading(false);
        }
      };
      initialize();
      return () => {
        cancelled = true;
      };
    }

    // Slider change after mount — resize the current matrix/vector locally
    const oldSize = permutation.length;
    if (size === oldSize) return;

    let newPerm;
    let newVector;
    if (size > oldSize) {
      newPerm = growPermutation(permutation, size);
      newVector = [...vector];
      for (let i = vector.length; i < size; i++) {
        newVector.push(Math.floor(Math.random() * 9) + 1);
      }
    } else {
      newPerm = shrinkPermutation(permutation, size);
      newVector = vector.slice(0, size);
    }

    setPermutation(newPerm);
    setMatrix(buildPermMatrix(newPerm));
    setVector(newVector);
    setResult(applyPerm(newPerm, newVector));
    setSelectedCell(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  return (
    <div className="visualizer-container">
      <div className="canvas-section">
        <div className="equation-area">
          <div className="side-note">
            <div className="side-note-card">
              <h4>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                How to read this
              </h4>
              <p>
                The <strong>row</strong> of the permutation matrix represents the spot in the output vector. The <strong>column</strong> of the <strong>1</strong> in that row represents the element from the input vector placed in that spot.
              </p>
              <div className="side-note-hint">
                Click a <strong>1</strong> to select it, then click another column to move it there.
              </div>
            </div>
          </div>
          <div
            className="equation-canvas-wrap"
            style={{ '--eq-min-width': `${Math.max(720, 95 * permutation.length)}px` }}
          >
            <MatrixVectorMultiplication
              matrix={matrix}
              vector={vector}
              result={result}
              permutation={permutation}
              selectedCell={selectedCell}
              onCellClick={handleCellClick}
            />
          </div>
        </div>
        {vector && result && (
          <div className="vt-wrapper">
            <VectorTransformationVisualizer
              vector={vector}
              result={result}
              permutation={permutation}
            />
          </div>
        )}
      </div>

      <div className="controls-section">
        <h2>Permutation Explorer</h2>

        {error && <div className="error-banner">{error}</div>}

        <div className="control-group">
          <label htmlFor="size">Matrix Size (n)</label>
          <input
            id="size"
            type="range"
            min="2"
            max="10"
            value={size}
            onChange={(e) => setSize(parseInt(e.target.value))}
          />
          <span>{size}x{size}</span>
        </div>

        <div className="button-group">
          <button onClick={generateRandomPermutation} disabled={loading}>
            {loading ? '⏳ Generating...' : '🔀 Random'}
          </button>
        </div>

        <div className="info-panel">
          <h3>Current Permutation</h3>
          <code style={{ fontSize: '0.85rem' }}>
            [{permutation.join(', ')}]
          </code>
        </div>

        {/* Custom Vector Input */}
        <div className="control-group">
          <label htmlFor="vecInput">Input Vector (2–10 elements)</label>
          <input
            id="vecInput"
            type="text"
            placeholder="e.g., [3, 7, 1, 5, 9]"
            value={customVectorInput}
            onChange={(e) => setCustomVectorInput(e.target.value)}
            style={{ marginBottom: '0.5rem' }}
          />
          <div className="button-group">
            <button onClick={applyCustomVector} disabled={loading || !customVectorInput.trim()}>
              {loading ? '⏳ Computing...' : 'Apply Vector'}
            </button>
            <button onClick={applyRandomPermutation} disabled={loading} className="button-secondary">
              Random Vector
            </button>
          </div>
        </div>

        {vector && (
          <div className="info-panel">
            <h3>Input Vector</h3>
            <code>[{vector.join(', ')}]</code>
          </div>
        )}

        {result && (
          <div className="info-panel">
            <h3>Output Vector (P × v)</h3>
            <code>[{result.map(x => x.toFixed(0)).join(', ')}]</code>
          </div>
        )}

        <div className="info-panel">
          <h3>About Permutation Matrices</h3>
          <ul>
            <li>A permutation matrix P has exactly one 1 in each row and column</li>
            <li>P × v rearranges elements of vector v</li>
            <li>Multiply two permutations to compose them</li>
            <li>Every permutation matrix is orthogonal: P^T = P^(-1)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
