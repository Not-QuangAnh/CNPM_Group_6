import pyodbc

conn = pyodbc.connect(
    'DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost;Trusted_Connection=yes;TrustServerCertificate=yes;DATABASE=GoBusDB',
    timeout=5
)
cur = conn.cursor()

# Check if columns exist
cur.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Users' AND COLUMN_NAME='student_id'")
if not cur.fetchone():
    cur.execute("ALTER TABLE dbo.Users ADD student_id NVARCHAR(50) NULL")
    cur.execute("ALTER TABLE dbo.Users ADD school NVARCHAR(200) NULL")
    cur.execute("ALTER TABLE dbo.Users ADD student_verified BIT NOT NULL DEFAULT 0")
    conn.commit()
    print('Added student columns successfully!')
else:
    print('Student columns already exist!')

conn.close()