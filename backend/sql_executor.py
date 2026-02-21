import sqlite3
from typing import Any, Dict, List


def execute_sql_problem(
    setup_sql: str, solution_sql: str, user_query: str
) -> Dict[str, Any]:
    """
    Executes a SQL problem in an in-memory SQLite database.

    Returns:
        Dict containing:
        - success: bool
        - user_result: List[Dict] (rows)
        - expected_result: List[Dict] (rows)
        - error: str (optional)
        - columns: List[str]
        - tables: Dict[str, List[Dict]] (table_name -> rows)
    """
    conn = sqlite3.connect(":memory:")
    cursor = conn.cursor()

    try:
        # 1. Run Setup SQL
        cursor.executescript(setup_sql)
        conn.commit()

        # 2. Run User Query
        # Basic security: prevent multiple statements to avoid injection of DROP/DELETE after a valid SELECT
        # though in-memory is safe, we want to enforce single query for result comparison usually.
        # For now, we allow what sqlite allows but we fetch result of the user query.

        # We might want to check for forbidden keywords if we were strict,
        # but for a learning platform, let's just try to run it.

        try:
            cursor.execute(user_query)
            user_rows = cursor.fetchall()
            user_columns = (
                [description[0] for description in cursor.description]
                if cursor.description
                else []
            )

            # Convert rows to list of dicts for JSON serialization
            user_result = [dict(zip(user_columns, row)) for row in user_rows]

        except sqlite3.Error as e:
            return {
                "success": False,
                "error": f"User Query Error: {str(e)}",
                "user_result": [],
                "expected_result": [],
                "columns": [],
                "tables": {},
            }

        # 3. Run Solution Query (on the same state? Or should we reset?)
        # Usually solution is run on the same setup.
        # If user query modified data, it might affect solution if we don't reset.
        # But usually these are SELECT problems.
        # If they are UPDATE/DELETE problems, we need to verify the STATE of the table, not the output of the query.
        # For Phase 3.5, let's assume SELECT problems first.
        # To be safe, let's use a fresh connection for expected result or rollback?
        # Actually, easiest is to run solution first or use two connections.
        # Let's use two connections to be perfectly isolated.

        conn_sol = sqlite3.connect(":memory:")
        cursor_sol = conn_sol.cursor()
        cursor_sol.executescript(setup_sql)
        conn_sol.commit()

        cursor_sol.execute(solution_sql)
        expected_rows = cursor_sol.fetchall()
        expected_columns = (
            [description[0] for description in cursor_sol.description]
            if cursor_sol.description
            else []
        )
        expected_result = [dict(zip(expected_columns, row)) for row in expected_rows]

        conn_sol.close()

        # 4. Compare
        # We compare the list of dicts. Order might matter depending on the problem.
        # For now, strict equality.
        success = user_result == expected_result

        # 5. Get Tables and Entries
        # Query sqlite_master to get all table names
        # Use the original connection which has the setup (and potential user modifications)
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables_info = cursor.fetchall()

        tables_data = {}
        for table_info in tables_info:
            table_name = table_info[0]
            # Skip internal sqlite tables if any (though usually they start with sqlite_)
            if table_name.startswith("sqlite_"):
                continue

            cursor.execute(f"SELECT * FROM {table_name}")
            rows = cursor.fetchall()
            columns = (
                [description[0] for description in cursor.description]
                if cursor.description
                else []
            )
            tables_data[table_name] = [dict(zip(columns, row)) for row in rows]

        return {
            "success": success,
            "user_result": user_result,
            "expected_result": expected_result,
            "columns": user_columns,
            "error": None,
            "tables": tables_data,
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"System Error: {str(e)}",
            "user_result": [],
            "expected_result": [],
            "columns": [],
        }
    finally:
        conn.close()


def get_tables_from_setup(setup_sql: str) -> Dict[str, List[Dict[str, Any]]]:
    """
    Executes the setup SQL and returns the tables and their content.
    """
    conn = sqlite3.connect(":memory:")
    cursor = conn.cursor()

    try:
        cursor.executescript(setup_sql)
        conn.commit()

        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables_info = cursor.fetchall()

        tables_data = {}
        for table_info in tables_info:
            table_name = table_info[0]
            if table_name.startswith("sqlite_"):
                continue

            cursor.execute(f"SELECT * FROM {table_name}")
            rows = cursor.fetchall()
            columns = (
                [description[0] for description in cursor.description]
                if cursor.description
                else []
            )
            tables_data[table_name] = [dict(zip(columns, row)) for row in rows]

        return tables_data
    except Exception as e:
        print(f"Error getting tables from setup: {e}")
        return {}
    finally:
        conn.close()
