TEST_USER = {
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpassword123",
}


def test_register_user(client):
    """Test successful user registration."""
    response = client.post("/auth/register", json=TEST_USER)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == TEST_USER["username"]
    assert data["email"] == TEST_USER["email"]
    assert "id" in data
    assert "hashed_password" not in data


def test_register_duplicate_user(client):
    """Test that registering the same username twice returns 400."""
    client.post("/auth/register", json=TEST_USER)
    response = client.post("/auth/register", json=TEST_USER)
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_login_success(client):
    """Test successful login returns a JWT token."""
    client.post("/auth/register", json=TEST_USER)
    response = client.post(
        "/auth/login",
        data={"username": TEST_USER["username"], "password": TEST_USER["password"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    """Test login with wrong password returns 401."""
    client.post("/auth/register", json=TEST_USER)
    response = client.post(
        "/auth/login",
        data={"username": TEST_USER["username"], "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_get_me_authenticated(client):
    """Test /auth/me returns the current user when authenticated."""
    client.post("/auth/register", json=TEST_USER)
    login = client.post(
        "/auth/login",
        data={"username": TEST_USER["username"], "password": TEST_USER["password"]},
    )
    token = login.json()["access_token"]
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["username"] == TEST_USER["username"]


def test_get_me_unauthenticated(client):
    """Test /auth/me returns 401 without a token."""
    response = client.get("/auth/me")
    assert response.status_code == 401
