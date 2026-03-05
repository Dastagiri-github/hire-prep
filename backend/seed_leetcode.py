import csv
import re
import random
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models

DATABASE_URL = "postgresql://neondb_owner:npg_wZQIkT3E8ixN@ep-twilight-forest-a1w8n351-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_companies():
    tier1 = ["Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix"]
    tier2 = ["Uber", "Airbnb", "LinkedIn", "Twitter", "Salesforce"]
    tier3 = ["TCS", "Infosys", "Wipro", "Accenture", "Cognizant"]
    return random.sample(tier1 + tier2 + tier3, k=random.randint(1, 3))

def parse_test_cases(description):
    test_cases = []
    # Find all Example blocks
    # Format: Example 1:\nInput: ...\nOutput: ...\nExplanation: ...
    pattern = r"Example \d+:.*?Input:(.*?)Output:(.*?)(?=Example \d+:|Constraints:|$)"
    matches = re.finditer(pattern, description, re.DOTALL | re.IGNORECASE)
    
    for match in matches:
        inp = match.group(1).strip()
        out = match.group(2).strip()
        
        # Sometimes Output includes an explanation on the same line or next line starting with Explanation
        expl = ""
        if "Explanation:" in out:
            parts = out.split("Explanation:")
            out = parts[0].strip()
            expl = parts[1].strip()
            
        test_cases.append({
            "input": inp,
            "output": out,
            "explanation": expl
        })
    return test_cases

def seed_neon_db():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    existing_titles = {p.title for p in db.query(models.Problem).all()}
    print(f"Found {len(existing_titles)} existing problems in Neon DB.")
    
    added = 0
    with open('../leetcode.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row['is_premium'] == 'True':
                continue
                
            title = row['title']
            # Clean title (e.g. "1. Two Sum" -> "Two Sum")
            title = re.sub(r'^\d+\.\s*', '', title)
            
            if title in existing_titles:
                continue
                
            desc = row['problem_description']
            difficulty = row['difficulty']
            
            # Parse tags "'Array', 'Hash Table'" -> ["Array", "Hash Table"]
            tags_str = row['topic_tags']
            tags = [t.strip().strip("'\"") for t in tags_str.split(',')] if tags_str else []
            tags = [t for t in tags if t]
            
            test_cases = parse_test_cases(desc)
            if not test_cases: # Fallback dummy
                test_cases = [{"input": "Sample Input", "output": "Sample Output", "explanation": ""}]
                
            problem = models.Problem(
                title=title,
                description=desc,
                difficulty=difficulty,
                tags=tags,
                companies=get_companies(),
                sample_test_cases=test_cases,
                hidden_test_cases=[]
            )
            db.add(problem)
            added += 1
            
    db.commit()
    db.close()
    print(f"Successfully seeded {added} problems into Neon DB!")

if __name__ == "__main__":
    seed_neon_db()
