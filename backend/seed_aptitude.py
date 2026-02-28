import database
import models
from sqlalchemy.orm import Session

def seed_aptitude_data():
    db: Session = database.SessionLocal()
    
    # Create aptitude chapters
    chapters_data = [
        {
            "title": "Quantitative Aptitude",
            "content": "Master quantitative aptitude topics including percentages, profit and loss, time and work, and more.",
            "order": 1
        },
        {
            "title": "Logical Reasoning", 
            "content": "Develop logical reasoning skills with puzzles, series, and analytical problems.",
            "order": 2
        },
        {
            "title": "Verbal Ability",
            "content": "Improve verbal ability with grammar, vocabulary, and comprehension exercises.",
            "order": 3
        }
    ]
    
    created_chapters = []
    for chapter_data in chapters_data:
        chapter = models.AptitudeChapter(**chapter_data)
        db.add(chapter)
        db.commit()
        db.refresh(chapter)
        created_chapters.append(chapter)
    
    # Create aptitude problems
    problems_data = [
        # Quantitative Aptitude Problems
        {
            "chapter_id": created_chapters[0].id,
            "title": "Percentage Calculation",
            "description": "If the price of a product is increased by 25% and then decreased by 20%, what is the net percentage change?",
            "question_type": "MCQ",
            "difficulty": "Easy",
            "options": ["5% increase", "5% decrease", "No change", "2% increase"],
            "correct_answer": "0",  # No change
            "explanation": "Let original price = 100. After 25% increase: 100 × 1.25 = 125. After 20% decrease: 125 × 0.8 = 100. Net change = 0%",
            "time_limit": 60
        },
        {
            "chapter_id": created_chapters[0].id,
            "title": "Time and Work",
            "description": "A can complete a work in 15 days and B can complete it in 20 days. If they work together, how many days will it take?",
            "question_type": "NUMERICAL",
            "difficulty": "Medium",
            "options": [],
            "correct_answer": "8.57",
            "explanation": "A's work rate = 1/15, B's work rate = 1/20. Combined rate = 1/15 + 1/20 = 7/60. Time = 60/7 = 8.57 days",
            "time_limit": 90
        },
        {
            "chapter_id": created_chapters[0].id,
            "title": "Profit and Loss",
            "description": "A shopkeeper buys an article for Rs. 800 and sells it for Rs. 950. What is his profit percentage?",
            "question_type": "NUMERICAL",
            "difficulty": "Easy",
            "options": [],
            "correct_answer": "18.75",
            "explanation": "Profit = 950 - 800 = Rs. 150. Profit percentage = (150/800) × 100 = 18.75%",
            "time_limit": 60
        },
        
        # Logical Reasoning Problems
        {
            "chapter_id": created_chapters[1].id,
            "title": "Number Series",
            "description": "Find the next number in the series: 2, 6, 12, 20, 30, ?",
            "question_type": "MCQ",
            "difficulty": "Easy",
            "options": ["40", "42", "44", "46"],
            "correct_answer": "1",  # 42
            "explanation": "The pattern is: 1×2=2, 2×3=6, 3×4=12, 4×5=20, 5×6=30, 6×7=42",
            "time_limit": 45
        },
        {
            "chapter_id": created_chapters[1].id,
            "title": "Blood Relation",
            "description": "Pointing to a photograph, a man said, 'I have no brother or sister but that man's father is my father's son.' Whose photograph was it?",
            "question_type": "MCQ",
            "difficulty": "Medium",
            "options": ["His own", "His son's", "His father's", "His nephew's"],
            "correct_answer": "1",  # His son's
            "explanation": "Since he has no brother or sister, 'my father's son' refers to himself. So 'that man's father is me', meaning the photograph is of his son.",
            "time_limit": 60
        },
        
        # Verbal Ability Problems
        {
            "chapter_id": created_chapters[2].id,
            "title": "Synonym",
            "description": "Choose the word that is most similar in meaning to 'Ephemeral':",
            "question_type": "MCQ",
            "difficulty": "Medium",
            "options": ["Permanent", "Temporary", "Eternal", "Lasting"],
            "correct_answer": "1",  # Temporary
            "explanation": "Ephemeral means lasting for a very short time, which is similar to temporary.",
            "time_limit": 30
        },
        {
            "chapter_id": created_chapters[2].id,
            "title": "Grammar Correction",
            "description": "Identify the grammatically correct sentence:",
            "question_type": "MCQ",
            "difficulty": "Easy",
            "options": [
                "Neither he nor I are going to the party.",
                "Neither he nor I is going to the party.", 
                "Neither him nor me are going to the party.",
                "Neither him nor me is going to the party."
            ],
            "correct_answer": "1",  # Neither he nor I is going to the party
            "explanation": "When using 'neither...nor', the verb agrees with the subject closer to it. Here 'I' is closer, so we use 'is'. Also, 'he' and 'I' are subject pronouns.",
            "time_limit": 45
        }
    ]
    
    for problem_data in problems_data:
        problem = models.AptitudeProblem(**problem_data)
        db.add(problem)
    
    db.commit()
    db.close()
    
    print(f"Created {len(created_chapters)} aptitude chapters and {len(problems_data)} aptitude problems")

if __name__ == "__main__":
    seed_aptitude_data()
