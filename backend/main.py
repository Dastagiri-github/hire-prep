import shutil

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from cpp_executor import get_gpp_path
from database import Base, engine
from routers import auth, employee_auth, employee_dashboard, problems, recommendations, sql, stats, submissions, aptitude

# Create tables
Base.metadata.create_all(bind=engine)

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from config import settings

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title=settings.PROJECT_NAME)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "*",
        "Authorization",
        "Content-Type",
        "Accept",
        "X-Requested-With",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers"
    ],
    expose_headers=["*"],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1|192\.168\.|10\.|172\.|0\.0\.0\.0)(:[0-9]+)?"  # Allow any local/ private network origin
)

app.include_router(auth.router)
app.include_router(employee_auth.router)
app.include_router(employee_dashboard.router)
app.include_router(problems.router)
app.include_router(submissions.router)
app.include_router(recommendations.router)
app.include_router(stats.router)
app.include_router(sql.router)
app.include_router(aptitude.router)


@app.on_event("startup")
async def startup_event():
    print("\n--- Environment Check ---")
    print(f"Backend Server Status: [OK] Running")
    print(f"Execution Engine ID: {settings.EXECUTION_ENGINE_URL}")
    print("-------------------------\n")


@app.get("/")
def read_root():
    return {"message": "Welcome to HirePrep API"}


@app.get("/health")
def health_check():
    return {
        "status": "online",
        "compilers": {
            "python": True,
            "cpp": True,
            "java": True,
            "javascript": True,
        },
    }
