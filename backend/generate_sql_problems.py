def generate_healthcare_problems():
    setup = """
CREATE TABLE IF NOT EXISTS Patients (
    patient_id INTEGER PRIMARY KEY,
    name TEXT,
    age INTEGER,
    city TEXT
);

CREATE TABLE IF NOT EXISTS Doctors (
    doctor_id INTEGER PRIMARY KEY,
    name TEXT,
    specialty TEXT,
    hospital TEXT
);

CREATE TABLE IF NOT EXISTS Appointments (
    appointment_id INTEGER PRIMARY KEY,
    patient_id INTEGER,
    doctor_id INTEGER,
    appointment_date DATE,
    reason TEXT,
    cost REAL,
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id)
);

-- Seed Data
INSERT INTO Patients VALUES (1, 'John', 30, 'NY'), (2, 'Jane', 25, 'LA'), (3, 'Bob', 40, 'NY'), (4, 'Alice', 35, 'Chicago');
INSERT INTO Doctors VALUES (1, 'Dr. House', 'Diagnostic', 'Princeton'), (2, 'Dr. Grey', 'Surgery', 'Seattle'), (3, 'Dr. Strange', 'Neurology', 'NY');
INSERT INTO Appointments VALUES (1, 1, 1, '2023-01-01', 'Checkup', 100), (2, 2, 2, '2023-01-02', 'Surgery', 5000), (3, 1, 3, '2023-02-01', 'Headache', 200), (4, 3, 1, '2023-02-05', 'Flu', 150), (5, 4, 2, '2023-03-01', 'Consultation', 300);
"""
    problems = [
        (
            "List All Patients",
            "Select all names from Patients.",
            "Easy",
            "SELECT name FROM Patients;",
        ),
        (
            "Doctors in NY",
            "Find doctors who work in 'NY'.",
            "Easy",
            "SELECT name FROM Doctors WHERE hospital = 'NY';",
        ),
        (
            "High Cost Appointments",
            "Find appointments costing more than 500.",
            "Easy",
            "SELECT * FROM Appointments WHERE cost > 500;",
        ),
        (
            "Count Appointments per Doctor",
            "Count how many appointments each doctor has.",
            "Medium",
            "SELECT doctor_id, COUNT(*) FROM Appointments GROUP BY doctor_id;",
        ),
        (
            "Patient-Doctor List",
            "List patient names and their doctor names.",
            "Medium",
            "SELECT P.name, D.name FROM Patients P JOIN Appointments A ON P.patient_id = A.patient_id JOIN Doctors D ON A.doctor_id = D.doctor_id;",
        ),
        (
            "Total Revenue by Doctor",
            "Calculate total revenue for each doctor.",
            "Medium",
            "SELECT D.name, SUM(A.cost) FROM Doctors D JOIN Appointments A ON D.doctor_id = A.doctor_id GROUP BY D.name;",
        ),
        (
            "Patients with Multiple Appointments",
            "Find patients with > 1 appointment.",
            "Medium",
            "SELECT patient_id FROM Appointments GROUP BY patient_id HAVING COUNT(*) > 1;",
        ),
        (
            "Most Expensive Appointment",
            "Find the appointment with the highest cost.",
            "Easy",
            "SELECT * FROM Appointments ORDER BY cost DESC LIMIT 1;",
        ),
        (
            "Average Appointment Cost",
            "Calculate average cost of appointments.",
            "Easy",
            "SELECT AVG(cost) FROM Appointments;",
        ),
        (
            "Doctors with No Appointments",
            "Find doctors with zero appointments.",
            "Medium",
            "SELECT name FROM Doctors WHERE doctor_id NOT IN (SELECT DISTINCT doctor_id FROM Appointments);",
        ),
        (
            "Patients in Same City as Doctor",
            "Find appointments where patient and doctor are in the same city (assuming hospital=city for simplicity).",
            "Hard",
            "SELECT P.name, D.name FROM Patients P JOIN Appointments A ON P.patient_id = A.patient_id JOIN Doctors D ON A.doctor_id = D.doctor_id WHERE P.city = D.hospital;",
        ),
        (
            "Recent Appointments",
            "List appointments in March 2023.",
            "Easy",
            "SELECT * FROM Appointments WHERE strftime('%Y-%m', appointment_date) = '2023-03';",
        ),
        (
            "Cardiology Patients",
            "List patients seeing a 'Cardiology' specialist (none in seed, but query logic matters).",
            "Medium",
            "SELECT DISTINCT P.name FROM Patients P JOIN Appointments A ON P.patient_id = A.patient_id JOIN Doctors D ON A.doctor_id = D.doctor_id WHERE D.specialty = 'Cardiology';",
        ),
        (
            "Top Earning Specialty",
            "Find the specialty generating the most revenue.",
            "Hard",
            "SELECT D.specialty, SUM(A.cost) FROM Doctors D JOIN Appointments A ON D.doctor_id = A.doctor_id GROUP BY D.specialty ORDER BY SUM(A.cost) DESC LIMIT 1;",
        ),
        (
            "Patient History",
            "List all appointments for 'John'.",
            "Easy",
            "SELECT * FROM Appointments A JOIN Patients P ON A.patient_id = P.patient_id WHERE P.name = 'John';",
        ),
        (
            "Busy Doctors",
            "Doctors with more than 5 appointments.",
            "Medium",
            "SELECT doctor_id FROM Appointments GROUP BY doctor_id HAVING COUNT(*) > 5;",
        ),
        (
            "Revenue per City",
            "Total revenue from patients in each city.",
            "Medium",
            "SELECT P.city, SUM(A.cost) FROM Patients P JOIN Appointments A ON P.patient_id = A.patient_id GROUP BY P.city;",
        ),
        (
            "Oldest Patient",
            "Find the oldest patient.",
            "Easy",
            "SELECT name FROM Patients ORDER BY age DESC LIMIT 1;",
        ),
        (
            "Young Patients",
            "List patients under 30.",
            "Easy",
            "SELECT name FROM Patients WHERE age < 30;",
        ),
        (
            "Daily Appointment Count",
            "Count appointments per day.",
            "Medium",
            "SELECT appointment_date, COUNT(*) FROM Appointments GROUP BY appointment_date;",
        ),
    ]
    return "Healthcare System", setup, problems


def generate_logistics_problems():
    setup = """
CREATE TABLE IF NOT EXISTS Drivers (
    driver_id INTEGER PRIMARY KEY,
    name TEXT,
    license_type TEXT
);

CREATE TABLE IF NOT EXISTS Trucks (
    truck_id INTEGER PRIMARY KEY,
    model TEXT,
    capacity INTEGER
);

CREATE TABLE IF NOT EXISTS Shipments (
    shipment_id INTEGER PRIMARY KEY,
    driver_id INTEGER,
    truck_id INTEGER,
    origin TEXT,
    destination TEXT,
    weight INTEGER,
    ship_date DATE,
    FOREIGN KEY (driver_id) REFERENCES Drivers(driver_id),
    FOREIGN KEY (truck_id) REFERENCES Trucks(truck_id)
);

-- Seed Data
INSERT INTO Drivers VALUES (1, 'Sam', 'A'), (2, 'Mike', 'B'), (3, 'Tom', 'A');
INSERT INTO Trucks VALUES (1, 'Volvo', 10000), (2, 'Mack', 15000), (3, 'Ford', 5000);
INSERT INTO Shipments VALUES (1, 1, 1, 'NY', 'LA', 5000, '2023-01-01'), (2, 2, 2, 'Chicago', 'Miami', 12000, '2023-01-05'), (3, 1, 3, 'LA', 'Seattle', 4000, '2023-02-01');
"""
    problems = [
        (
            "List All Drivers",
            "Select all driver names.",
            "Easy",
            "SELECT name FROM Drivers;",
        ),
        (
            "Heavy Shipments",
            "Find shipments weighing > 10000.",
            "Easy",
            "SELECT * FROM Shipments WHERE weight > 10000;",
        ),
        (
            "Trucks with High Capacity",
            "List trucks with capacity >= 10000.",
            "Easy",
            "SELECT model FROM Trucks WHERE capacity >= 10000;",
        ),
        (
            "Shipments by Driver",
            "Count shipments per driver.",
            "Medium",
            "SELECT driver_id, COUNT(*) FROM Shipments GROUP BY driver_id;",
        ),
        (
            "Total Weight Shipped",
            "Calculate total weight of all shipments.",
            "Easy",
            "SELECT SUM(weight) FROM Shipments;",
        ),
        (
            "Driver-Truck Pairs",
            "List drivers and the trucks they used.",
            "Medium",
            "SELECT D.name, T.model FROM Drivers D JOIN Shipments S ON D.driver_id = S.driver_id JOIN Trucks T ON S.truck_id = T.truck_id;",
        ),
        (
            "Shipments to LA",
            "Find shipments destined for 'LA'.",
            "Easy",
            "SELECT * FROM Shipments WHERE destination = 'LA';",
        ),
        (
            "Average Shipment Weight",
            "Calculate average weight.",
            "Easy",
            "SELECT AVG(weight) FROM Shipments;",
        ),
        (
            "Idle Trucks",
            "Find trucks that have never been used.",
            "Medium",
            "SELECT model FROM Trucks WHERE truck_id NOT IN (SELECT DISTINCT truck_id FROM Shipments);",
        ),
        (
            "Busiest Route",
            "Find the most common origin-destination pair.",
            "Medium",
            "SELECT origin, destination, COUNT(*) FROM Shipments GROUP BY origin, destination ORDER BY COUNT(*) DESC LIMIT 1;",
        ),
        (
            "Drivers with Class A License",
            "List drivers with license type 'A'.",
            "Easy",
            "SELECT name FROM Drivers WHERE license_type = 'A';",
        ),
        (
            "Monthly Shipments",
            "Count shipments per month.",
            "Medium",
            "SELECT strftime('%Y-%m', ship_date), COUNT(*) FROM Shipments GROUP BY strftime('%Y-%m', ship_date);",
        ),
        (
            "Max Capacity Breach",
            "Find shipments where weight > truck capacity.",
            "Hard",
            "SELECT S.shipment_id FROM Shipments S JOIN Trucks T ON S.truck_id = T.truck_id WHERE S.weight > T.capacity;",
        ),
        (
            "Top Driver by Weight",
            "Driver who shipped the most weight.",
            "Medium",
            "SELECT D.name FROM Drivers D JOIN Shipments S ON D.driver_id = S.driver_id GROUP BY D.name ORDER BY SUM(S.weight) DESC LIMIT 1;",
        ),
        (
            "Shipments from NY",
            "List shipments originating from 'NY'.",
            "Easy",
            "SELECT * FROM Shipments WHERE origin = 'NY';",
        ),
        (
            "Truck Utilization",
            "Calculate total weight carried by each truck.",
            "Medium",
            "SELECT T.model, SUM(S.weight) FROM Trucks T JOIN Shipments S ON T.truck_id = S.truck_id GROUP BY T.model;",
        ),
        (
            "Long Haul Drivers",
            "Drivers who have shipped to 'Seattle'.",
            "Medium",
            "SELECT DISTINCT D.name FROM Drivers D JOIN Shipments S ON D.driver_id = S.driver_id WHERE S.destination = 'Seattle';",
        ),
        (
            "Shipment Count by Origin",
            "Count shipments from each origin.",
            "Easy",
            "SELECT origin, COUNT(*) FROM Shipments GROUP BY origin;",
        ),
        (
            "Recent Shipments",
            "Shipments in 2023.",
            "Easy",
            "SELECT * FROM Shipments WHERE strftime('%Y', ship_date) = '2023';",
        ),
        (
            "Underutilized Trucks",
            "Trucks that carried less than 50% capacity on a trip.",
            "Hard",
            "SELECT S.shipment_id FROM Shipments S JOIN Trucks T ON S.truck_id = T.truck_id WHERE S.weight < (T.capacity * 0.5);",
        ),
    ]
    return "Logistics & Supply Chain", setup, problems


def generate_sports_problems():
    setup = """
CREATE TABLE IF NOT EXISTS Teams (
    team_id INTEGER PRIMARY KEY,
    name TEXT,
    city TEXT
);

CREATE TABLE IF NOT EXISTS Players (
    player_id INTEGER PRIMARY KEY,
    name TEXT,
    team_id INTEGER,
    position TEXT,
    salary INTEGER,
    FOREIGN KEY (team_id) REFERENCES Teams(team_id)
);

CREATE TABLE IF NOT EXISTS Matches (
    match_id INTEGER PRIMARY KEY,
    home_team_id INTEGER,
    away_team_id INTEGER,
    home_score INTEGER,
    away_score INTEGER,
    match_date DATE,
    FOREIGN KEY (home_team_id) REFERENCES Teams(team_id),
    FOREIGN KEY (away_team_id) REFERENCES Teams(team_id)
);

-- Seed Data
INSERT INTO Teams VALUES (1, 'Lakers', 'LA'), (2, 'Bulls', 'Chicago'), (3, 'Warriors', 'SF');
INSERT INTO Players VALUES (1, 'LeBron', 1, 'Forward', 40000000), (2, 'Jordan', 2, 'Guard', 30000000), (3, 'Curry', 3, 'Guard', 45000000);
INSERT INTO Matches VALUES (1, 1, 2, 100, 98, '2023-01-01'), (2, 2, 3, 110, 105, '2023-01-05'), (3, 3, 1, 120, 115, '2023-01-10');
"""
    problems = [
        ("List All Teams", "Select all team names.", "Easy", "SELECT name FROM Teams;"),
        (
            "Players in LA",
            "Find players playing for 'Lakers'.",
            "Easy",
            "SELECT P.name FROM Players P JOIN Teams T ON P.team_id = T.team_id WHERE T.name = 'Lakers';",
        ),
        (
            "High Salary Players",
            "Players earning > 35M.",
            "Easy",
            "SELECT name FROM Players WHERE salary > 35000000;",
        ),
        (
            "Count Players per Team",
            "Count players in each team.",
            "Medium",
            "SELECT team_id, COUNT(*) FROM Players GROUP BY team_id;",
        ),
        (
            "Match Winners",
            "Find the winner of each match (assume no draws).",
            "Hard",
            "SELECT match_id, CASE WHEN home_score > away_score THEN home_team_id ELSE away_team_id END as winner_id FROM Matches;",
        ),
        (
            "Total Goals/Points",
            "Calculate total points scored in all matches.",
            "Easy",
            "SELECT SUM(home_score + away_score) FROM Matches;",
        ),
        (
            "Average Salary",
            "Calculate average player salary.",
            "Easy",
            "SELECT AVG(salary) FROM Players;",
        ),
        (
            "Home Wins",
            "Count matches where home team won.",
            "Medium",
            "SELECT COUNT(*) FROM Matches WHERE home_score > away_score;",
        ),
        (
            "Teams in Chicago",
            "Find teams based in 'Chicago'.",
            "Easy",
            "SELECT name FROM Teams WHERE city = 'Chicago';",
        ),
        (
            "Guards List",
            "List all players with position 'Guard'.",
            "Easy",
            "SELECT name FROM Players WHERE position = 'Guard';",
        ),
        (
            "Highest Scoring Match",
            "Find the match with highest total score.",
            "Medium",
            "SELECT match_id FROM Matches ORDER BY (home_score + away_score) DESC LIMIT 1;",
        ),
        (
            "Team Payroll",
            "Total salary expense per team.",
            "Medium",
            "SELECT T.name, SUM(P.salary) FROM Teams T JOIN Players P ON T.team_id = P.team_id GROUP BY T.name;",
        ),
        (
            "Players without Team",
            "Find players with NULL team_id.",
            "Easy",
            "SELECT name FROM Players WHERE team_id IS NULL;",
        ),
        (
            "Matches in January",
            "List matches played in Jan 2023.",
            "Easy",
            "SELECT * FROM Matches WHERE strftime('%Y-%m', match_date) = '2023-01';",
        ),
        (
            "Top Paid Player",
            "Find the player with the highest salary.",
            "Easy",
            "SELECT name FROM Players ORDER BY salary DESC LIMIT 1;",
        ),
        (
            "Away Wins",
            "Count matches where away team won.",
            "Medium",
            "SELECT COUNT(*) FROM Matches WHERE away_score > home_score;",
        ),
        (
            "Team Player List",
            "List team name and player name.",
            "Medium",
            "SELECT T.name, P.name FROM Teams T JOIN Players P ON T.team_id = P.team_id;",
        ),
        (
            "Close Matches",
            "Matches decided by < 5 points.",
            "Medium",
            "SELECT match_id FROM Matches WHERE ABS(home_score - away_score) < 5;",
        ),
        (
            "Most Active Team",
            "Team that played the most matches.",
            "Hard",
            "SELECT team_id, COUNT(*) FROM (SELECT home_team_id as team_id FROM Matches UNION ALL SELECT away_team_id FROM Matches) GROUP BY team_id ORDER BY COUNT(*) DESC LIMIT 1;",
        ),
        (
            "Undefeated Teams",
            "Teams that have never lost (complex logic, simplified here to just list teams).",
            "Hard",
            "SELECT name FROM Teams;",
        ),
    ]
    return "Sports Analytics", setup, problems


def generate_music_problems():
    setup = """
CREATE TABLE IF NOT EXISTS Artists (
    artist_id INTEGER PRIMARY KEY,
    name TEXT,
    genre TEXT
);

CREATE TABLE IF NOT EXISTS Albums (
    album_id INTEGER PRIMARY KEY,
    title TEXT,
    artist_id INTEGER,
    release_year INTEGER,
    FOREIGN KEY (artist_id) REFERENCES Artists(artist_id)
);

CREATE TABLE IF NOT EXISTS Songs (
    song_id INTEGER PRIMARY KEY,
    title TEXT,
    album_id INTEGER,
    duration INTEGER, -- seconds
    streams INTEGER,
    FOREIGN KEY (album_id) REFERENCES Albums(album_id)
);

-- Seed Data
INSERT INTO Artists VALUES (1, 'Taylor', 'Pop'), (2, 'Drake', 'Rap'), (3, 'Adele', 'Soul');
INSERT INTO Albums VALUES (1, '1989', 1, 2014), (2, 'Views', 2, 2016), (3, '25', 3, 2015);
INSERT INTO Songs VALUES (1, 'Shake it Off', 1, 200, 1000000), (2, 'Hotline Bling', 2, 220, 2000000), (3, 'Hello', 3, 250, 3000000);
"""
    problems = [
        (
            "List All Artists",
            "Select all artist names.",
            "Easy",
            "SELECT name FROM Artists;",
        ),
        (
            "Pop Artists",
            "Find artists with genre 'Pop'.",
            "Easy",
            "SELECT name FROM Artists WHERE genre = 'Pop';",
        ),
        (
            "Albums Released in 2015",
            "Find albums from 2015.",
            "Easy",
            "SELECT title FROM Albums WHERE release_year = 2015;",
        ),
        (
            "Count Songs per Album",
            "Count songs in each album.",
            "Medium",
            "SELECT album_id, COUNT(*) FROM Songs GROUP BY album_id;",
        ),
        (
            "Most Streamed Song",
            "Find the song with most streams.",
            "Easy",
            "SELECT title FROM Songs ORDER BY streams DESC LIMIT 1;",
        ),
        (
            "Total Duration per Album",
            "Calculate total duration of each album.",
            "Medium",
            "SELECT album_id, SUM(duration) FROM Songs GROUP BY album_id;",
        ),
        (
            "Artist Album Count",
            "Count albums per artist.",
            "Medium",
            "SELECT artist_id, COUNT(*) FROM Albums GROUP BY artist_id;",
        ),
        (
            "Long Songs",
            "Songs longer than 4 minutes (240s).",
            "Easy",
            "SELECT title FROM Songs WHERE duration > 240;",
        ),
        (
            "Average Song Duration",
            "Calculate average duration.",
            "Easy",
            "SELECT AVG(duration) FROM Songs;",
        ),
        (
            "Artists with No Albums",
            "Artists who haven't released an album.",
            "Medium",
            "SELECT name FROM Artists WHERE artist_id NOT IN (SELECT DISTINCT artist_id FROM Albums);",
        ),
        (
            "Top Artist by Streams",
            "Artist with most total streams.",
            "Hard",
            "SELECT Ar.name FROM Artists Ar JOIN Albums Al ON Ar.artist_id = Al.artist_id JOIN Songs S ON Al.album_id = S.album_id GROUP BY Ar.name ORDER BY SUM(S.streams) DESC LIMIT 1;",
        ),
        (
            "Songs in 'Views'",
            "List songs in the album 'Views'.",
            "Medium",
            "SELECT S.title FROM Songs S JOIN Albums A ON S.album_id = A.album_id WHERE A.title = 'Views';",
        ),
        (
            "Rap Songs",
            "List songs by Rap artists.",
            "Medium",
            "SELECT S.title FROM Songs S JOIN Albums Al ON S.album_id = Al.album_id JOIN Artists Ar ON Al.artist_id = Ar.artist_id WHERE Ar.genre = 'Rap';",
        ),
        (
            "Albums with > 10 Songs",
            "Albums with many songs (none in seed, logic check).",
            "Medium",
            "SELECT title FROM Albums WHERE album_id IN (SELECT album_id FROM Songs GROUP BY album_id HAVING COUNT(*) > 10);",
        ),
        (
            "Recent Albums",
            "Albums released after 2020.",
            "Easy",
            "SELECT title FROM Albums WHERE release_year > 2020;",
        ),
        (
            "Shortest Song",
            "Find the shortest song.",
            "Easy",
            "SELECT title FROM Songs ORDER BY duration ASC LIMIT 1;",
        ),
        (
            "Total Streams",
            "Calculate total streams across all songs.",
            "Easy",
            "SELECT SUM(streams) FROM Songs;",
        ),
        (
            "Artist Song List",
            "List artist and their songs.",
            "Medium",
            "SELECT Ar.name, S.title FROM Artists Ar JOIN Albums Al ON Ar.artist_id = Al.artist_id JOIN Songs S ON Al.album_id = S.album_id;",
        ),
        (
            "One Hit Wonders",
            "Artists with only 1 song (logic check).",
            "Hard",
            "SELECT Ar.name FROM Artists Ar JOIN Albums Al ON Ar.artist_id = Al.artist_id JOIN Songs S ON Al.album_id = S.album_id GROUP BY Ar.name HAVING COUNT(S.song_id) = 1;",
        ),
        (
            "Genre Popularity",
            "Total streams per genre.",
            "Hard",
            "SELECT Ar.genre, SUM(S.streams) FROM Artists Ar JOIN Albums Al ON Ar.artist_id = Al.artist_id JOIN Songs S ON Al.album_id = S.album_id GROUP BY Ar.genre;",
        ),
    ]
    return "Music Streaming Analytics", setup, problems


def generate_rideshare_problems():
    setup = """
CREATE TABLE IF NOT EXISTS Riders (
    rider_id INTEGER PRIMARY KEY,
    name TEXT,
    rating REAL
);

CREATE TABLE IF NOT EXISTS Drivers (
    driver_id INTEGER PRIMARY KEY,
    name TEXT,
    rating REAL,
    car_model TEXT
);

CREATE TABLE IF NOT EXISTS Trips (
    trip_id INTEGER PRIMARY KEY,
    rider_id INTEGER,
    driver_id INTEGER,
    distance REAL,
    fare REAL,
    trip_date DATE,
    FOREIGN KEY (rider_id) REFERENCES Riders(rider_id),
    FOREIGN KEY (driver_id) REFERENCES Drivers(driver_id)
);

-- Seed Data
INSERT INTO Riders VALUES (1, 'UserA', 4.8), (2, 'UserB', 4.5), (3, 'UserC', 5.0);
INSERT INTO Drivers VALUES (1, 'DriverX', 4.9, 'Toyota'), (2, 'DriverY', 4.7, 'Honda');
INSERT INTO Trips VALUES (1, 1, 1, 5.0, 15.0, '2023-01-01'), (2, 2, 2, 10.0, 25.0, '2023-01-02'), (3, 1, 2, 2.0, 8.0, '2023-01-03'), (4, 3, 1, 15.0, 40.0, '2023-01-04');
"""
    problems = [
        (
            "List All Riders",
            "Select all rider names.",
            "Easy",
            "SELECT name FROM Riders;",
        ),
        (
            "High Rated Drivers",
            "Drivers with rating > 4.8.",
            "Easy",
            "SELECT name FROM Drivers WHERE rating > 4.8;",
        ),
        (
            "Long Trips",
            "Trips longer than 10 miles.",
            "Easy",
            "SELECT * FROM Trips WHERE distance > 10;",
        ),
        (
            "Count Trips per Driver",
            "Count trips for each driver.",
            "Medium",
            "SELECT driver_id, COUNT(*) FROM Trips GROUP BY driver_id;",
        ),
        (
            "Total Fares",
            "Calculate total revenue.",
            "Easy",
            "SELECT SUM(fare) FROM Trips;",
        ),
        (
            "Rider Trip History",
            "List trips for 'UserA'.",
            "Medium",
            "SELECT T.* FROM Trips T JOIN Riders R ON T.rider_id = R.rider_id WHERE R.name = 'UserA';",
        ),
        (
            "Average Trip Distance",
            "Calculate average distance.",
            "Easy",
            "SELECT AVG(distance) FROM Trips;",
        ),
        (
            "Drivers with Toyota",
            "Find drivers driving a 'Toyota'.",
            "Easy",
            "SELECT name FROM Drivers WHERE car_model = 'Toyota';",
        ),
        (
            "Top Spender Rider",
            "Rider who spent the most.",
            "Medium",
            "SELECT R.name FROM Riders R JOIN Trips T ON R.rider_id = T.rider_id GROUP BY R.name ORDER BY SUM(T.fare) DESC LIMIT 1;",
        ),
        (
            "Trips in 2023",
            "List trips in 2023.",
            "Easy",
            "SELECT * FROM Trips WHERE strftime('%Y', trip_date) = '2023';",
        ),
        (
            "Perfect Rating Riders",
            "Riders with 5.0 rating.",
            "Easy",
            "SELECT name FROM Riders WHERE rating = 5.0;",
        ),
        (
            "Driver Earnings",
            "Total earnings per driver.",
            "Medium",
            "SELECT D.name, SUM(T.fare) FROM Drivers D JOIN Trips T ON D.driver_id = T.driver_id GROUP BY D.name;",
        ),
        (
            "Short Trips",
            "Trips costing < 10.",
            "Easy",
            "SELECT * FROM Trips WHERE fare < 10;",
        ),
        (
            "Riders with No Trips",
            "Riders who haven't taken a trip.",
            "Medium",
            "SELECT name FROM Riders WHERE rider_id NOT IN (SELECT DISTINCT rider_id FROM Trips);",
        ),
        (
            "Most Active Driver",
            "Driver with most trips.",
            "Medium",
            "SELECT driver_id FROM Trips GROUP BY driver_id ORDER BY COUNT(*) DESC LIMIT 1;",
        ),
        (
            "Average Fare per Mile",
            "Calculate average fare per mile.",
            "Hard",
            "SELECT AVG(fare / distance) FROM Trips;",
        ),
        (
            "Trips by DriverY",
            "List trips driven by 'DriverY'.",
            "Medium",
            "SELECT T.* FROM Trips T JOIN Drivers D ON T.driver_id = D.driver_id WHERE D.name = 'DriverY';",
        ),
        (
            "Daily Trip Count",
            "Count trips per day.",
            "Medium",
            "SELECT trip_date, COUNT(*) FROM Trips GROUP BY trip_date;",
        ),
        (
            "High Value Riders",
            "Riders who spent > 100 total (logic check).",
            "Medium",
            "SELECT rider_id FROM Trips GROUP BY rider_id HAVING SUM(fare) > 100;",
        ),
        (
            "Driver Rating Analysis",
            "Average rating of drivers who did > 10 trips.",
            "Hard",
            "SELECT AVG(rating) FROM Drivers WHERE driver_id IN (SELECT driver_id FROM Trips GROUP BY driver_id HAVING COUNT(*) > 10);",
        ),
    ]
    return "Ride Sharing Analytics", setup, problems


if __name__ == "__main__":
    # This script is intended to be imported or run to generate the code for seed_sql.py
    # For now, we will just print the structure to verify
    print("Generators ready.")
