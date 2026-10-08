DROP TABLE IF EXISTS goal_contributions;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id INT GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
);

INSERT INTO users (name, email, password_hash)
VALUES
    ('Jayden', 'jayden@example.com', 'not-a-real-hash');

CREATE TABLE categories (
    category_id INT GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    PRIMARY KEY (category_id)
);

INSERT INTO categories (name, type)
VALUES
    ('Food & Drink', 'expense'),
    ('Transport', 'expense'),
    ('Shopping', 'expense'),
    ('Entertainment', 'expense'),
    ('Bills & Utilities', 'expense'),
    ('Health & Fitness', 'expense'),
    ('Travel', 'expense'),
    ('Investing', 'expense'),
    ('Other', 'expense'),
    ('Salary', 'income'),
    ('Freelance', 'income'),
    ('Gifts', 'income'),
    ('Other Income', 'income');


CREATE TABLE transactions (
    transaction_id INT GENERATED ALWAYS AS IDENTITY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    description VARCHAR(255),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (transaction_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date)
SELECT 1, c.category_id, v.type, v.amount, v.description, CURRENT_DATE - v.days
FROM (VALUES
    ('Salary',            'income',  2400.00, 'Monthly salary',        2),
    ('Freelance',         'income',   350.00, 'Website project',       9),
    ('Food & Drink',      'expense',   45.20, 'Tesco weekly shop',     0),
    ('Transport',         'expense',   12.50, 'Uber',                  1),
    ('Entertainment',     'expense',    9.99, 'Spotify',               2),
    ('Health & Fitness',  'expense',   25.00, 'Gym membership',        3),
    ('Shopping',          'expense',   32.99, 'Amazon order',          4),
    ('Food & Drink',      'expense',    6.40, 'Pret a Manger',         5),
    ('Bills & Utilities', 'expense',   82.00, 'Electricity bill',      6),
    ('Bills & Utilities', 'expense',  820.00, 'Rent',                  7),
    ('Transport',         'expense',   18.00, 'TfL top up',            8),
    ('Investing',         'expense',  150.00, 'Index fund deposit',   10),
    ('Travel',            'expense',  120.00, 'Train tickets',        14),
    ('Food & Drink',      'expense',   58.75, 'Weekend groceries',    16),
    ('Entertainment',     'expense',   24.00, 'Cinema and dinner',    20),
    ('Salary',            'income',  2400.00, 'Monthly salary',       32),
    ('Bills & Utilities', 'expense',  820.00, 'Rent',                 37),
    ('Food & Drink',      'expense',   91.30, 'Groceries',            40),
    ('Shopping',          'expense',   64.00, 'Clothes',              45),
    ('Transport',         'expense',   35.00, 'Monthly bus pass',     48)
) AS v(category, type, amount, description, days)
JOIN categories c ON c.name = v.category;

CREATE INDEX idx_transactions_user_date ON transactions (user_id, transaction_date DESC);
CREATE INDEX idx_transactions_user_category ON transactions (user_id, category_id);


CREATE TABLE goals (
    goal_id INT GENERATED ALWAYS AS IDENTITY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    goal_type VARCHAR(10) NOT NULL DEFAULT 'savings' CHECK (goal_type IN ('savings', 'investment')),
    target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount > 0),
    target_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (goal_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
 
INSERT INTO goals (user_id, name, goal_type, target_amount, target_date)
VALUES
    (1, 'Emergency Fund', 'savings',    5000.00,  '2027-06-01'),
    (1, 'New Laptop',     'savings',    1200.00,  '2027-01-15'),
    (1, 'House Deposit',  'savings',   20000.00,  '2027-01-01'),
    (1, 'First ETF',      'investment', 1000.00,  '2026-12-31');


CREATE TABLE goal_contributions (
    contribution_id INT GENERATED ALWAYS AS IDENTITY,
    goal_id INT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (contribution_id),
    FOREIGN KEY (goal_id) REFERENCES goals(goal_id) ON DELETE CASCADE
);

INSERT INTO goal_contributions (goal_id, amount, contribution_date)
SELECT g.goal_id, v.amount, CURRENT_DATE - v.days
FROM (VALUES
    ('Emergency Fund', 1000.00, 70),
    ('Emergency Fund', 1000.00, 40),
    ('Emergency Fund',  500.00,  8),
    ('New Laptop',      150.00, 35),
    ('New Laptop',      150.00,  5),
    ('House Deposit',  1000.00, 65),
    ('House Deposit',   500.00, 37),
    ('House Deposit',   500.00,  7),
    ('First ETF',       200.00, 30),
    ('First ETF',       150.00, 10)
) AS v(goal, amount, days)
JOIN goals g ON g.name = v.goal;

CREATE INDEX idx_contributions_goal ON goal_contributions (goal_id, contribution_date DESC);