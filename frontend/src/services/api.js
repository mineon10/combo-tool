import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const api = {
  // Permutation endpoints
  getPermutationMatrix: (permutation) =>
    axios.post(`${API_BASE_URL}/permutation-matrix`, { permutation }),
  
  getRandomPermutation: (n) =>
    axios.post(`${API_BASE_URL}/random-permutation`, { n }),
  
  applyPermutation: (permutation, vector) =>
    axios.post(`${API_BASE_URL}/apply-permutation`, { permutation, vector }),

  // Projection endpoints
  getProjectionMatrix: (vectors) =>
    axios.post(`${API_BASE_URL}/projection-matrix`, { vectors }),
  
  projectVector: (vectors, target) =>
    axios.post(`${API_BASE_URL}/project-vector`, { vectors, target }),
  
  getOrthogonalProjection: (vectors, target) =>
    axios.post(`${API_BASE_URL}/orthogonal-projection`, { vectors, target }),
  
  getRandomProjectionProblem: (n, k) =>
    axios.post(`${API_BASE_URL}/random-projection-problem`, { n, k }),
};
