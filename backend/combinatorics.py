"""
Combinatorics Mathematics Module
Core mathematical computations for combinatorics visualizations
"""
import numpy as np
from scipy.linalg import qr, null_space
from typing import Tuple, List


class PermutationMatrixCalculator:
    """Handle permutation matrix calculations and operations"""
    
    @staticmethod
    def get_permutation_matrix(permutation: List[int]) -> np.ndarray:
        """
        Convert a permutation to its matrix representation
        
        Args:
            permutation: List of indices representing the permutation
            
        Returns:
            n x n permutation matrix
        """
        n = len(permutation)
        matrix = np.zeros((n, n))
        for i, j in enumerate(permutation):
            matrix[i, j] = 1
        return matrix
    
    @staticmethod
    def get_random_permutation(n: int) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generate a random permutation and its matrix
        
        Args:
            n: Size of permutation
            
        Returns:
            Tuple of (permutation array, permutation matrix)
        """
        perm = np.random.permutation(n)
        matrix = PermutationMatrixCalculator.get_permutation_matrix(perm)
        return perm, matrix
    
    @staticmethod
    def apply_permutation(permutation: List[int], vector: List[float]) -> np.ndarray:
        """
        Apply permutation to a vector (shuffle elements)
        
        Args:
            permutation: Permutation indices
            vector: Input vector
            
        Returns:
            Permuted vector
        """
        perm_array = np.array(permutation)
        vec_array = np.array(vector)
        return vec_array[perm_array]
    
    @staticmethod
    def compose_permutations(perm1: List[int], perm2: List[int]) -> np.ndarray:
        """
        Compose two permutations
        
        Args:
            perm1: First permutation
            perm2: Second permutation
            
        Returns:
            Composed permutation
        """
        perm1 = np.array(perm1)
        perm2 = np.array(perm2)
        return perm1[perm2]


class CombinationProjectionCalculator:
    """Handle projection matrix and combination calculations"""
    
    @staticmethod
    def get_projection_matrix(vectors: List[List[float]]) -> Tuple[np.ndarray, int]:
        """
        Calculate the projection matrix P for given basis vectors
        
        P = A(A^T A)^(-1)A^T
        where columns of A are the basis vectors
        
        Args:
            vectors: List of basis vectors (as rows or columns)
            
        Returns:
            Tuple of (projection matrix, rank)
        """
        A = np.array(vectors).T  # Ensure column vectors
        
        # Use QR decomposition for numerical stability
        Q, R = qr(A)
        
        # Projection matrix
        rank = np.linalg.matrix_rank(A)
        P = Q[:, :rank] @ Q[:, :rank].T
        
        return P, rank
    
    @staticmethod
    def project_vector(
        basis_vectors: List[List[float]], 
        target: List[float]
    ) -> np.ndarray:
        """
        Project a target vector onto subspace spanned by basis vectors
        
        Args:
            basis_vectors: List of basis vectors
            target: Vector to project
            
        Returns:
            Projection of target vector
        """
        P, _ = CombinationProjectionCalculator.get_projection_matrix(basis_vectors)
        target_array = np.array(target)
        return P @ target_array
    
    @staticmethod
    def get_orthogonal_projection(
        basis_vectors: List[List[float]], 
        target: List[float]
    ) -> Tuple[np.ndarray, float]:
        """
        Get orthogonal projection and distance to subspace
        
        Args:
            basis_vectors: List of basis vectors
            target: Vector to project
            
        Returns:
            Tuple of (projection, distance from target to projection)
        """
        projection = CombinationProjectionCalculator.project_vector(
            basis_vectors, target
        )
        target_array = np.array(target)
        distance = np.linalg.norm(target_array - projection)
        return projection, distance
    
    @staticmethod
    def generate_random_problem(n: int, k: int) -> dict:
        """
        Generate a random projection problem for students
        
        Args:
            n: Dimension of ambient space
            k: Dimension of subspace (k < n)
            
        Returns:
            Dictionary with problem data
        """
        # Generate random basis
        basis = np.random.randn(n, k)
        basis, _ = qr(basis)  # Orthogonalize
        
        # Generate random target vector
        target = np.random.randn(n)
        
        # Calculate projection
        P, _ = CombinationProjectionCalculator.get_projection_matrix(
            basis.tolist()
        )
        projection = P @ target
        distance = np.linalg.norm(target - projection)
        
        return {
            "basis_vectors": basis.tolist(),
            "target_vector": target.tolist(),
            "projection": projection.tolist(),
            "distance": float(distance),
            "n": n,
            "k": k
        }


class GrassmannianCalculator:
    """
    Handle Grassmannian G(k,n) calculations
    G(k,n) = space of all k-dimensional subspaces in R^n
    """
    
    @staticmethod
    def random_point_on_grassmannian(k: int, n: int) -> np.ndarray:
        """
        Generate a random point on G(k,n) as a k×n matrix of rank k
        
        Args:
            k: Dimension of subspaces
            n: Dimension of ambient space
            
        Returns:
            k×n matrix representing a point on G(k,n)
        """
        # Generate random matrix and orthogonalize
        matrix = np.random.randn(k, n)
        Q, _ = qr(matrix.T)
        return Q[:, :k].T
    
    @staticmethod
    def grassmannian_distance(point1: np.ndarray, point2: np.ndarray) -> float:
        """
        Calculate distance between two points on Grassmannian
        Using canonical metric based on principal angles
        
        Args:
            point1: k×n matrix
            point2: k×n matrix
            
        Returns:
            Distance between points
        """
        # Project point1 onto point2's subspace
        P2 = point2.T @ point2
        proj_diff = point1 @ P2 @ point1.T
        
        # Eigenvalues give cosines of principal angles
        eigenvalues = np.linalg.eigvalsh(proj_diff)
        eigenvalues = np.clip(eigenvalues, 0, 1)
        
        # Distance based on principal angles
        principal_angles = np.arccos(np.sqrt(eigenvalues))
        distance = np.linalg.norm(principal_angles)
        
        return distance
