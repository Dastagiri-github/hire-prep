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
    allow_methods=["*"],
    allow_headers=["*"],
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

    java_status = "[OK] Found" if shutil.which("javac") else "[FAIL] Not Found (Install JDK)"
    python_status = "[OK] Found" if shutil.which("python") else "[FAIL] Not Found"
    cpp_status = "[OK] Found" if get_gpp_path() else "[FAIL] Not Found (Install MinGW)"

    print(f"{'Java':<10}: {java_status}")
    print(f"{'C++':<10}: {cpp_status}")
    print(f"{'Python':<10}: {python_status}")
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
            "cpp": get_gpp_path() is not None,
            "java": shutil.which("javac") is not None,
            "javascript": True,  # Node is likely installed if frontend is running
        },
    }
