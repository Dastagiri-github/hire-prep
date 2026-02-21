import models
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)


def seed_db():
    db = SessionLocal()

    # Check if data exists
    if db.query(models.Problem).count() > 0:
        print("Database already seeded.")
        return

    problems = [
        {
            "title": "Two Sum",
            "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            "difficulty": "Easy",
            "tags": ["Array", "Hash Table"],
            "companies": ["Amazon", "Google", "TCS"],
            "sample_test_cases": [
                {
                    "input": "nums = [2,7,11,15], target = 9",
                    "output": "[0,1]",
                    "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1].",
                }
            ],
            "hidden_test_cases": [
                {"input": "nums = [3,2,4], target = 6", "output": "[1,2]"}
            ],
        },
        {
            "title": "Reverse String",
            "description": "Write a function that reverses a string. The input string is given as an array of characters s.",
            "difficulty": "Easy",
            "tags": ["String", "Two Pointers"],
            "companies": ["Adobe", "Cisco"],
            "sample_test_cases": [
                {
                    "input": "s = ['h','e','l','l','o']",
                    "output": "['o','l','l','e','h']",
                    "explanation": "",
                }
            ],
            "hidden_test_cases": [
                {
                    "input": "s = ['H','a','n','n','a','h']",
                    "output": "['h','a','n','n','a','H']",
                }
            ],
        },
    ]

    for p in problems:
        db_problem = models.Problem(**p)
        db.add(db_problem)

    db.commit()
    print("Database seeded successfully!")
    db.close()


if __name__ == "__main__":
    seed_db()
