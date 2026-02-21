# Use Python 3.12-slim for a smaller, more secure image
FROM python:3.12-slim AS builder

WORKDIR /app

# Install build tools for psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies into a virtual env
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- Runtime stage ---
FROM python:3.12-slim AS runtime

WORKDIR /app

# Install libpq only (runtime dep for psycopg2)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy venv from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy app code (excluding __pycache__, .env, venv)
COPY . .

EXPOSE 8000

# Railway injects $PORT; run Alembic migrations then start server
CMD alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
