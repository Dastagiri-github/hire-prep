TEST_USER = {
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpassword123",
}

from unittest.mock import patch


def test_google_auth(client):
    """Test successful Google OAuth login/registration."""
    with patch("routers.auth.id_token.verify_oauth2_token") as mock_verify:
        mock_verify.return_value = {
            "email": "googleuser@example.com",
            "name": "Google User",
        }
        response = client.post("/auth/google", json={"credential": "fake_token"})
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in response.cookies


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
    """Test successful login returns access token and sets refresh cookie."""
    client.post("/auth/register", json=TEST_USER)
    response = client.post(
        "/auth/login",
        data={"username": TEST_USER["username"], "password": TEST_USER["password"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    # refresh_token should be set as an httpOnly cookie
    assert "refresh_token" in response.cookies


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


def test_refresh_issues_new_access_token(client):
    """Test /auth/refresh returns a new access token using the refresh cookie."""
    client.post("/auth/register", json=TEST_USER)
    login = client.post(
        "/auth/login",
        data={"username": TEST_USER["username"], "password": TEST_USER["password"]},
    )
    assert "refresh_token" in login.cookies

    refresh_response = client.post("/auth/refresh")
    assert refresh_response.status_code == 200
    data = refresh_response.json()
    assert "access_token" in data
    # New refresh cookie should be set (rotation)
    assert "refresh_token" in refresh_response.cookies


def test_refresh_without_cookie_fails(client):
    """Test /auth/refresh without cookie returns 401."""
    response = client.post("/auth/refresh")
    assert response.status_code == 401


def test_logout_revokes_refresh_token(client):
    """Test logout revokes the refresh token so it cannot be reused."""
    client.post("/auth/register", json=TEST_USER)
    client.post(
        "/auth/login",
        data={"username": TEST_USER["username"], "password": TEST_USER["password"]},
    )

    logout_response = client.post("/auth/logout")
    assert logout_response.status_code == 204

    # After logout the refresh cookie should be cleared
    # and calling /auth/refresh should fail
    refresh_response = client.post("/auth/refresh")
    assert refresh_response.status_code == 401
