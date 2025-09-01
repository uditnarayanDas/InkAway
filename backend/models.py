from database import get_db

def get_user(email):
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM users WHERE email=?", (email,))
    user = c.fetchone()
    conn.close()
    return dict(user) if user else None

def add_user(email):
    conn = get_db()
    c = conn.cursor()
    c.execute("INSERT OR IGNORE INTO users (email, credits) VALUES (?, 5)", (email,))
    conn.commit()
    conn.close()

def update_credits(email, amount):
    conn = get_db()
    c = conn.cursor()
    c.execute("UPDATE users SET credits = credits + ? WHERE email=?", (amount, email))
    conn.commit()
    conn.close()

def log_payment(email, amount, status):
    conn = get_db()
    c = conn.cursor()
    c.execute("INSERT INTO payments (user_email, amount, status) VALUES (?, ?, ?)", (email, amount, status))
    conn.commit()
    conn.close()

def log_history(email, file_path):
    conn = get_db()
    c = conn.cursor()
    c.execute("INSERT INTO history (user_email, file_path) VALUES (?, ?)", (email, file_path))
    conn.commit()
    conn.close()
