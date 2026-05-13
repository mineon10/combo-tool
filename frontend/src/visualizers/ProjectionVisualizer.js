import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Projection3DVisualizer } from './Projection3DVisualizer';

export function ProjectionVisualizer() {
  const [dimension, setDimension] = useState(5);
  const [subspaceDim, setSubspaceDim] = useState(2);
  const [basis, setBasis] = useState([]);
  const [target, setTarget] = useState([]);
  const [projection, setProjection] = useState([]);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateRandomProblem = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getRandomProjectionProblem(dimension, subspaceDim);
      const data = response.data;
      setBasis(data.basis_vectors);
      setTarget(data.target_vector);
      setProjection(data.projection);
      setDistance(data.distance);
    } catch (err) {
      setError('Failed to generate projection problem: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateRandomProblem();
  }, [dimension, subspaceDim]);

  const formatVector = (vec) => {
    if (!Array.isArray(vec)) return '';
    return '[' + vec.map(x => x.toFixed(2)).join(', ') + ']';
  };

  return (
    <div className="visualizer-container">
      <div className="canvas-section">
        <Projection3DVisualizer
          basis={basis}
          target={target}
          projection={projection}
        />
      </div>

      <div className="controls-section">
        <h2>Projection Explorer</h2>

        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

        <div className="control-group">
          <label htmlFor="dim">Ambient Dimension</label>
          <input
            id="dim"
            type="range"
            min="2"
            max="8"
            value={dimension}
            onChange={(e) => setDimension(parseInt(e.target.value))}
          />
          <span>ℝ^{dimension}</span>
        </div>

        <div className="control-group">
          <label htmlFor="subdim">Subspace Dimension (k)</label>
          <input
            id="subdim"
            type="range"
            min="1"
            max={Math.min(dimension - 1, 5)}
            value={subspaceDim}
            onChange={(e) => setSubspaceDim(parseInt(e.target.value))}
          />
          <span>k = {subspaceDim}</span>
        </div>

        <div className="button-group">
          <button onClick={generateRandomProblem} disabled={loading}>
            {loading ? '⏳ Computing...' : '🎲 New Problem'}
          </button>
        </div>

        <div className="info-panel">
          <h3>Problem Setup</h3>
          <ul>
            <li><strong>Ambient space:</strong> ℝ^{dimension}</li>
            <li><strong>Subspace dimension:</strong> {subspaceDim}</li>
            <li><strong>Codimension:</strong> {dimension - subspaceDim}</li>
          </ul>
        </div>

        {basis.length > 0 && (
          <div className="info-panel">
            <h3>Basis Vectors</h3>
            {basis.map((vec, i) => (
              <div key={i} style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                <strong>v_{i}:</strong> {formatVector(vec.slice(0, 3))}
                {dimension > 3 && '...'}
              </div>
            ))}
          </div>
        )}

        {target.length > 0 && (
          <div className="info-panel">
            <h3>Target Vector</h3>
            <code>{formatVector(target.slice(0, 5))}{dimension > 5 && '...'}</code>
          </div>
        )}

        {projection.length > 0 && (
          <div className="info-panel">
            <h3>Projection Onto Subspace</h3>
            <code>{formatVector(projection.slice(0, 5))}{dimension > 5 && '...'}</code>
          </div>
        )}

        {distance !== null && (
          <div className="info-panel" style={{ backgroundColor: '#d5f4e6' }}>
            <h3>Distance to Subspace</h3>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#27ae60' }}>
              {distance.toFixed(3)}
            </div>
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
              This is the length of the component orthogonal to the subspace.
            </p>
          </div>
        )}

        <div className="info-panel">
          <h3>About Projections</h3>
          <ul>
            <li>Projection P maps vectors to their closest point on a subspace</li>
            <li>For basis vectors in columns of A: P = A(A^T A)^(-1)A^T</li>
            <li>P is idempotent: P² = P</li>
            <li>P is symmetric: P^T = P</li>
            <li>The distance shown is ||v - Pv||, the orthogonal distance</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
