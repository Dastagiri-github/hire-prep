import sys
import time
import urllib.request
import urllib.error

def check_service(url, name, retries=30, delay=2):
    print(f"Checking {name} at {url}...")
    for i in range(retries):
        try:
            with urllib.request.urlopen(url) as response:
                if response.status == 200:
                    print(f"✅ {name} is up and running!")
                    return True
        except urllib.error.URLError:
            pass
        except Exception as e:
            print(f"Error checking {name}: {e}")
            
        sys.stdout.write(f"\rWaiting for {name}... ({i+1}/{retries})")
        sys.stdout.flush()
        time.sleep(delay)
    
    print(f"\n❌ {name} failed to start after {retries * delay} seconds.")
    return False

if __name__ == "__main__":
    backend_url = "http://127.0.0.1:8000/health"
    frontend_url = "http://127.0.0.1:3000"
    
    backend_up = check_service(backend_url, "Backend")
    frontend_up = check_service(frontend_url, "Frontend")
    
    if backend_up and frontend_up:
        print("\n🚀 All services are operational! End-to-End check passed.")
        sys.exit(0)
    else:
        print("\n💥 Some services failed to start.")
        sys.exit(1)
