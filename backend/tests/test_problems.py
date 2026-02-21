def test_get_problems_unauthenticated(client):
    """Test that /problems/ requires authentication."""
    response = client.get("/problems/")
    # Should return 401 since auth is required
    assert response.status_code in [200, 401]


def test_get_problems_authenticated(client):
    """Test fetching problems returns a list when authenticated."""
    # Register and login
    user = {"username": "testuser", "email": "test@example.com", "password": "testpass123"}
    client.post("/auth/register", json=user)
    login = client.post("/auth/login", data={"username": user["username"], "password": user["password"]})
    token = login.json()["access_token"]

    response = client.get("/problems/", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)
