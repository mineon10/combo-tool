"""
ComboTool Backend API
Main Flask application for combinatorics computations
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from combinatorics import (
    PermutationMatrixCalculator,
    CombinationProjectionCalculator,
)

app = Flask(__name__)

# Enable CORS for all origins
CORS(app, supports_credentials=True)

# Initialize calculators
perm_calc = PermutationMatrixCalculator()
combo_calc = CombinationProjectionCalculator()


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({"status": "ok"})


# ============= Permutation Matrix Routes =============


@app.route("/api/permutation-matrix", methods=["POST"])
def get_permutation_matrix():
    """
    Generate a permutation matrix for a given permutation
    
    Request body:
    {
        "permutation": [0, 2, 1, 3]  # permutation indices
    }
    """
    try:
        data = request.json
        permutation = data.get("permutation")
        
        if not permutation:
            return jsonify({"error": "permutation required"}), 400
        
        matrix = perm_calc.get_permutation_matrix(permutation)
        return jsonify({"matrix": matrix.tolist()})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/random-permutation", methods=["POST"])
def get_random_permutation():
    """
    Generate a random permutation
    
    Request body:
    {
        "n": 5  # size of permutation
    }
    """
    try:
        data = request.json
        n = data.get("n", 5)
        
        permutation, matrix = perm_calc.get_random_permutation(n)
        return jsonify({
            "permutation": permutation.tolist(),
            "matrix": matrix.tolist(),
            "n": n
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/apply-permutation", methods=["POST"])
def apply_permutation():
    """
    Apply a permutation to a vector
    
    Request body:
    {
        "permutation": [2, 0, 1],
        "vector": [1, 2, 3]
    }
    """
    try:
        data = request.json
        permutation = data.get("permutation")
        vector = data.get("vector")
        
        result = perm_calc.apply_permutation(permutation, vector)
        return jsonify({"result": result.tolist()})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ============= Combination Projection Routes =============


@app.route("/api/projection-matrix", methods=["POST"])
def get_projection_matrix():
    """
    Calculate projection matrix P for a given basis
    
    Request body:
    {
        "vectors": [[1, 0, 0], [0, 1, 0]]  # basis vectors
    }
    """
    try:
        data = request.json
        vectors = data.get("vectors")
        
        if not vectors:
            return jsonify({"error": "vectors required"}), 400
        
        proj_matrix, rank = combo_calc.get_projection_matrix(vectors)
        return jsonify({
            "projection_matrix": proj_matrix.tolist(),
            "rank": int(rank)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/project-vector", methods=["POST"])
def project_vector():
    """
    Project a vector onto a subspace defined by basis vectors
    
    Request body:
    {
        "vectors": [[1, 0, 0], [0, 1, 0]],  # basis vectors
        "target": [1, 1, 1]  # vector to project
    }
    """
    try:
        data = request.json
        basis_vectors = data.get("vectors")
        target = data.get("target")
        
        if not basis_vectors or not target:
            return jsonify({"error": "vectors and target required"}), 400
        
        projection = combo_calc.project_vector(basis_vectors, target)
        return jsonify({"projection": projection.tolist()})
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/orthogonal-projection", methods=["POST"])
def get_orthogonal_projection():
    """
    Get orthogonal projection of a vector
    """
    try:
        data = request.json
        basis_vectors = data.get("vectors")
        target = data.get("target")
        
        projection, distance = combo_calc.get_orthogonal_projection(
            basis_vectors, target
        )
        return jsonify({
            "projection": projection.tolist(),
            "distance": float(distance)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/api/random-projection-problem", methods=["POST"])
def random_projection_problem():
    """
    Generate a random projection problem for students
    
    Request body:
    {
        "n": 5,  # dimension of ambient space
        "k": 2   # dimension of subspace
    }
    """
    try:
        data = request.json
        n = data.get("n", 5)
        k = data.get("k", 2)
        
        problem = combo_calc.generate_random_problem(n, k)
        return jsonify(problem)
    except Exception as e:
        return jsonify({"error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5001)
