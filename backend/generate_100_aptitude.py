import json
import database
import models
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://neondb_owner:npg_wZQIkT3E8ixN@ep-twilight-forest-a1w8n351-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

def generate_aptitude_questions():
    questions = []
    
    # --- Quantitative Aptitude (Chapter 1) ---
    
    # Percentages
    for i in range(1, 11):
        questions.append({
            "chapter_id": 1,
            "title": f"Percentage Problem {i}",
            "description": f"If {i*10}% of a number is {i*50}, what is the number?",
            "question_type": "MCQ",
            "difficulty": "Easy",
            "options": [str(i*500), str(i*600), str(i*400), str(i*450)],
            "correct_answer": str(i*500),
            "explanation": f"Let the number be x. {i*10}% of x = {i*50} => (x * {i*10})/100 = {i*50} => x = {i*500}",
            "time_limit": 60
        })
        
    # Profit & Loss
    for i in range(1, 11):
        cost = i * 100
        profit_percent = 20
        sp = int(cost * (1 + profit_percent/100))
        questions.append({
            "chapter_id": 1,
            "title": f"Profit Calculation {i}",
            "description": f"A merchant buys an item for Rs. {cost} and sells it at a profit of {profit_percent}%. What is the selling price?",
            "question_type": "NUMERICAL",
            "difficulty": "Easy",
            "options": [],
            "correct_answer": str(sp),
            "explanation": f"Cost Price (CP) = {cost}. Profit % = {profit_percent}%. Selling Price = CP + (Profit % of CP) = {cost} + {int(cost*0.2)} = {sp}",
            "time_limit": 60
        })
        
    # Time & Work
    for i in range(1, 11):
        questions.append({
            "chapter_id": 1,
            "title": f"Time & Work Problem {i}",
            "description": f"Worker A can finish a job in {i*2} days. Worker B can finish the same job in {i*3} days. How many days will it take them working together?",
            "question_type": "MCQ",
            "difficulty": "Medium",
            "options": [f"{(i*6)/5:.1f}", f"{(i*5)/5:.1f}", f"{(i*7)/5:.1f}", f"{(i*8)/5:.1f}"],
            "correct_answer": f"{(i*6)/5:.1f}",
            "explanation": f"A's rate = 1/{i*2}. B's rate = 1/{i*3}. Combined rate = 1/{i*2} + 1/{i*3} = 5/{i*6}. Days needed = {i*6}/5 = {(i*6)/5:.1f}",
            "time_limit": 90
        })
        
    # Simple & Compound Interest
    for i in range(1, 11):
        p = i * 1000
        r = 5
        t = 2
        si = int((p * r * t) / 100)
        questions.append({
            "chapter_id": 1,
            "title": f"Simple Interest {i}",
            "description": f"Calculate the simple interest on a principal of Rs. {p} at a rate of {r}% per annum for {t} years.",
            "question_type": "NUMERICAL",
            "difficulty": "Easy",
            "options": [],
            "correct_answer": str(si),
            "explanation": f"SI = (P × R × T) / 100 = ({p} × {r} × {t}) / 100 = {si}",
            "time_limit": 60
        })


    # --- Logical Reasoning (Chapter 2) ---
    
    # Number Series
    for i in range(1, 11):
        start = i
        series = [start, start*2, start*4, start*8]
        next_val = start*16
        questions.append({
            "chapter_id": 2,
            "title": f"Number Pattern {i}",
            "description": f"Find the next number in the series: {series[0]}, {series[1]}, {series[2]}, {series[3]}, ?",
            "question_type": "MCQ",
            "difficulty": "Easy",
            "options": [str(next_val), str(next_val+i), str(next_val-i), str(next_val*2)],
            "correct_answer": str(next_val),
            "explanation": "The pattern is multiplying the previous number by 2.",
            "time_limit": 45
        })
        
    # Coding Decoding
    for i in range(1, 11):
        words = ["APPLE", "BANANA", "CHERRY", "MANGO", "ORANGE", "GRAPE", "MELON", "PEACH", "PLUM", "KIWI"]
        word = words[i-1]
        coded = "".join(chr((ord(c) - 65 + 1) % 26 + 65) for c in word) # Shift by 1
        questions.append({
            "chapter_id": 2,
            "title": f"Coding Decoding {i}",
            "description": f"In a certain code language, if '{word}' is written as '{coded}'. How will 'WATER' be written in that code?",
            "question_type": "MCQ",
            "difficulty": "Medium",
            "options": ["XBUFS", "VZSDF", "XCVGT", "YCVTG"],
            "correct_answer": "XBUFS",
            "explanation": "Every letter is shifted forward by 1 in the English alphabet (A->B, B->C, etc.). So W->X, A->B, T->U, E->F, R->S.",
            "time_limit": 60
        })
        
    # Direction Sense
    for i in range(1, 11):
        dist1 = i * 2
        dist2 = i * 3
        questions.append({
            "chapter_id": 2,
            "title": f"Direction Sense {i}",
            "description": f"A man walks {dist1} km North, turns right and walks {dist2} km, then turns right again and walks {dist1} km. How far is he from his starting point?",
            "question_type": "MCQ",
            "difficulty": "Medium",
            "options": [f"{dist2} km", f"{dist1} km", f"{dist1+dist2} km", "0 km"],
            "correct_answer": f"{dist2} km",
            "explanation": f"He forms a rectangle. His final position is directly east of his starting point at a distance equal to his horizontal movement: {dist2} km.",
            "time_limit": 60
        })
        
    # Ages
    for i in range(1, 11):
        diff = i * 2
        age_b = 20 + i
        age_a = age_b + diff
        questions.append({
            "chapter_id": 2,
            "title": f"Problems on Ages {i}",
            "description": f"A is {diff} years older than B. If A is currently {age_a} years old, how old is B?",
            "question_type": "NUMERICAL",
            "difficulty": "Easy",
            "options": [],
            "correct_answer": str(age_b),
            "explanation": f"A's age = B's age + {diff}. So B's age = {age_a} - {diff} = {age_b}.",
            "time_limit": 45
        })


    # --- Verbal Ability (Chapter 3) ---
    
    # Synonyms
    synonyms = [
        ("Abundant", "Plentiful", "Scarce", "Rare", "Empty"),
        ("Benevolent", "Kind", "Cruel", "Spiteful", "Hostile"),
        ("Candid", "Frank", "Deceitful", "Guarded", "Hidden"),
        ("Diligent", "Hardworking", "Lazy", "Careless", "Idle"),
        ("Eloquent", "Articulate", "Speechless", "Dull", "Incoherent"),
        ("Frugal", "Thrifty", "Wasteful", "Lavish", "Greedy"),
        ("Gregarious", "Sociable", "Introverted", "Shy", "Reclusive"),
        ("Humble", "Modest", "Arrogant", "Proud", "Vain"),
        ("Inevitable", "Unavoidable", "Uncertain", "Doubtful", "Preventable"),
        ("Jocund", "Cheerful", "Sad", "Gloomy", "Depressed")
    ]
    
    for i, data in enumerate(synonyms):
        word, correct, w1, w2, w3 = data
        questions.append({
            "chapter_id": 3,
            "title": f"Synonyms {i+1}",
            "description": f"Choose the word closest in meaning to '{word}':",
            "question_type": "MCQ",
            "difficulty": "Medium",
            "options": [correct, w1, w2, w3],
            "correct_answer": correct,
            "explanation": f"The word '{word}' means {correct.lower()}. The other options are antonyms or unrelated.",
            "time_limit": 30
        })

    # Antonyms
    antonyms = [
        ("Acquit", "Convict", "Pardon", "Forgive", "Free"),
        ("Barren", "Fertile", "Empty", "Dry", "Desert"),
        ("Cautious", "Reckless", "Careful", "Guarded", "Alert"),
        ("Dwarf", "Giant", "Small", "Tiny", "Short"),
        ("Enormous", "Tiny", "Huge", "Massive", "Large"),
        ("Foreign", "Native", "Alien", "Outside", "Distant"),
        ("Genuine", "Fake", "Real", "Authentic", "True"),
        ("Harsh", "Gentle", "Rough", "Severe", "Strict"),
        ("Innocent", "Guilty", "Pure", "Clean", "Faultless"),
        ("Joy", "Sorrow", "Happiness", "Delight", "Glee")
    ]
    
    for i, data in enumerate(antonyms):
        word, correct, w1, w2, w3 = data
        questions.append({
            "chapter_id": 3,
            "title": f"Antonyms {i+1}",
            "description": f"Choose the word opposite in meaning to '{word}':",
            "question_type": "MCQ",
            "difficulty": "Easy",
            "options": [correct, w1, w2, w3],
            "correct_answer": correct,
            "explanation": f"The antonym of '{word}' is {correct.lower()}. The others are synonyms or similar in meaning.",
            "time_limit": 30
        })
        
    # Grammar - Error Spotting
    grammar_q = [
        ("He are going to the store.", "He is going to the store", "He am going to the store", "He be going to the store", "No error"),
        ("Between you and I, he is wrong.", "Between you and me, he is wrong", "Between I and you, he is wrong", "Among you and I, he is wrong", "No error"),
        ("She don't like playing tennis.", "She doesn't like playing tennis", "She didn't likes playing tennis", "She do not likes playing tennis", "No error"),
        ("I has been working here for a year.", "I have been working here for a year", "I had completely working here", "I having been working", "No error"),
        ("Much people attended the concert.", "Many people attended the concert", "A lot people attended the concert", "More people attended the concert", "No error")
    ]*2 # Duplicate to get 10 questions
    
    for i, data in enumerate(grammar_q):
        sentence, correct, w1, w2, w3 = data
        questions.append({
            "chapter_id": 3,
            "title": f"Grammar Correction {i+1}",
            "description": f"Identify the correct grammatical phrasing for: '{sentence}'",
            "question_type": "MCQ",
            "difficulty": "Medium",
            "options": [correct, w1, w2, w3],
            "correct_answer": correct,
            "explanation": "Correcting the subject-verb agreement or pronoun usage.",
            "time_limit": 45
        })

    return questions

def seed_large_aptitude():
    questions = generate_aptitude_questions()
    
    print("Connecting to Neon DB...")
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    db = SessionLocal()
    
    print(f"Generating {len(questions)} aptitude problems...")
    
    # Verify chapters exist
    chapters = db.query(models.AptitudeChapter).all()
    if len(chapters) == 0:
        print("Chapters not found! Run the basic seed first.")
        return
        
    chapter_map = {c.order: c.id for c in chapters} # Assuming order maps 1:1, 2:2, 3:3 as we set it up
    
    added = 0
    for q_data in questions:
        # Check if question already exists by title
        existing = db.query(models.AptitudeProblem).filter_by(title=q_data["title"]).first()
        if not existing:
            # Map chapter_id correctly based on the DB IDs
            q_data["chapter_id"] = chapter_map.get(q_data["chapter_id"], chapters[0].id)
            problem = models.AptitudeProblem(**q_data)
            db.add(problem)
            added += 1
            
    try:
        db.commit()
        print(f"Successfully seeded {added} NEW aptitude questions into Neon DB!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_large_aptitude()
