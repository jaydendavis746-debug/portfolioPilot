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



CREATE TABLE goal_contributions (
    contribution_id INT GENERATED ALWAYS AS IDENTITY,
    goal_id INT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (contribution_id),
    FOREIGN KEY (goal_id) REFERENCES goals(goal_id) ON DELETE CASCADE
);


CREATE INDEX idx_contributions_goal ON goal_contributions (goal_id, contribution_date DESC);