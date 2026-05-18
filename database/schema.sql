CREATE DATABASE IF NOT EXISTS language_courses
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE language_courses;

CREATE TABLE IF NOT EXISTS members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(40) NOT NULL,
    level ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2') NOT NULL DEFAULT 'A1',
    joined_at DATE NOT NULL DEFAULT (CURRENT_DATE)
);

CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    language VARCHAR(80) NOT NULL,
    level ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2') NOT NULL,
    duration_weeks INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trainings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    trainer_name VARCHAR(120) NOT NULL,
    room VARCHAR(80) NOT NULL,
    starts_at DATETIME NOT NULL,
    ends_at DATETIME NOT NULL,
    capacity INT NOT NULL,
    CONSTRAINT fk_trainings_course
        FOREIGN KEY (course_id) REFERENCES courses(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    member_id INT NULL,
    title VARCHAR(120) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    paid BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_fees_course
        FOREIGN KEY (course_id) REFERENCES courses(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_fees_member
        FOREIGN KEY (member_id) REFERENCES members(id)
        ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    course_id INT NOT NULL,
    status ENUM('pending', 'active', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    enrolled_at DATE NOT NULL DEFAULT (CURRENT_DATE),
    CONSTRAINT fk_enrollments_member
        FOREIGN KEY (member_id) REFERENCES members(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_enrollments_course
        FOREIGN KEY (course_id) REFERENCES courses(id)
        ON DELETE CASCADE,
    CONSTRAINT unique_member_course UNIQUE (member_id, course_id)
);

DROP PROCEDURE IF EXISTS ensure_fee_member_column;
DROP PROCEDURE IF EXISTS ensure_fee_member_fk;

DELIMITER //

CREATE PROCEDURE ensure_fee_member_column()
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'fees'
          AND COLUMN_NAME = 'member_id'
    ) THEN
        ALTER TABLE fees ADD COLUMN member_id INT NULL AFTER course_id;
    END IF;
END//

CREATE PROCEDURE ensure_fee_member_fk()
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.TABLE_CONSTRAINTS
        WHERE CONSTRAINT_SCHEMA = DATABASE()
          AND TABLE_NAME = 'fees'
          AND CONSTRAINT_NAME = 'fk_fees_member'
    ) THEN
        ALTER TABLE fees
            ADD CONSTRAINT fk_fees_member
                FOREIGN KEY (member_id) REFERENCES members(id)
                ON DELETE SET NULL;
    END IF;
END//

DELIMITER ;

CALL ensure_fee_member_column();
CALL ensure_fee_member_fk();

DROP PROCEDURE ensure_fee_member_column;
DROP PROCEDURE ensure_fee_member_fk;

INSERT INTO members (full_name, email, phone, level)
SELECT 'Мария Иванова', 'maria.ivanova@example.com', '+359 888 111 222', 'A2'
WHERE NOT EXISTS (SELECT 1 FROM members WHERE email = 'maria.ivanova@example.com');

INSERT INTO members (full_name, email, phone, level)
SELECT 'Георги Петров', 'georgi.petrov@example.com', '+359 887 333 444', 'B1'
WHERE NOT EXISTS (SELECT 1 FROM members WHERE email = 'georgi.petrov@example.com');

INSERT INTO members (full_name, email, phone, level)
SELECT 'Елена Димитрова', 'elena.dimitrova@example.com', '+359 886 555 666', 'A1'
WHERE NOT EXISTS (SELECT 1 FROM members WHERE email = 'elena.dimitrova@example.com');

INSERT INTO courses (title, language, level, duration_weeks, price, description)
SELECT 'Английски за работа', 'Английски', 'B1', 10, 420.00, 'Практически курс с разговори, имейли и бизнес ситуации.'
WHERE NOT EXISTS (
    SELECT 1 FROM courses
    WHERE title = 'Английски за работа' AND language = 'Английски' AND level = 'B1'
);

INSERT INTO courses (title, language, level, duration_weeks, price, description)
SELECT 'Испански за начинаещи', 'Испански', 'A1', 8, 360.00, 'Основна граматика, произношение и ежедневни диалози.'
WHERE NOT EXISTS (
    SELECT 1 FROM courses
    WHERE title = 'Испански за начинаещи' AND language = 'Испански' AND level = 'A1'
);

INSERT INTO courses (title, language, level, duration_weeks, price, description)
SELECT 'Немски интензивен', 'Немски', 'A2', 6, 390.00, 'Интензивни занятия за бърз напредък и самостоятелна работа.'
WHERE NOT EXISTS (
    SELECT 1 FROM courses
    WHERE title = 'Немски интензивен' AND language = 'Немски' AND level = 'A2'
);

INSERT INTO trainings (course_id, trainer_name, room, starts_at, ends_at, capacity)
SELECT courses.id, 'Анна Николова', 'Зала 2', '2026-05-06 18:30:00', '2026-05-06 20:00:00', 14
FROM courses
WHERE courses.title = 'Английски за работа'
  AND NOT EXISTS (
      SELECT 1 FROM trainings
      WHERE course_id = courses.id AND starts_at = '2026-05-06 18:30:00'
  );

INSERT INTO trainings (course_id, trainer_name, room, starts_at, ends_at, capacity)
SELECT courses.id, 'Карлос Ривера', 'Зала 1', '2026-05-07 17:30:00', '2026-05-07 19:00:00', 12
FROM courses
WHERE courses.title = 'Испански за начинаещи'
  AND NOT EXISTS (
      SELECT 1 FROM trainings
      WHERE course_id = courses.id AND starts_at = '2026-05-07 17:30:00'
  );

INSERT INTO trainings (course_id, trainer_name, room, starts_at, ends_at, capacity)
SELECT courses.id, 'Мартин Келер', 'Онлайн', '2026-05-08 19:00:00', '2026-05-08 20:30:00', 16
FROM courses
WHERE courses.title = 'Немски интензивен'
  AND NOT EXISTS (
      SELECT 1 FROM trainings
      WHERE course_id = courses.id AND starts_at = '2026-05-08 19:00:00'
  );

INSERT INTO enrollments (member_id, course_id, status, enrolled_at)
SELECT members.id, courses.id, 'active', '2026-04-20'
FROM members
JOIN courses ON courses.title = 'Английски за работа'
WHERE members.email = 'maria.ivanova@example.com'
  AND NOT EXISTS (
      SELECT 1 FROM enrollments
      WHERE member_id = members.id AND course_id = courses.id
  );

INSERT INTO enrollments (member_id, course_id, status, enrolled_at)
SELECT members.id, courses.id, 'pending', '2026-04-22'
FROM members
JOIN courses ON courses.title = 'Английски за работа'
WHERE members.email = 'georgi.petrov@example.com'
  AND NOT EXISTS (
      SELECT 1 FROM enrollments
      WHERE member_id = members.id AND course_id = courses.id
  );

INSERT INTO enrollments (member_id, course_id, status, enrolled_at)
SELECT members.id, courses.id, 'active', '2026-04-24'
FROM members
JOIN courses ON courses.title = 'Испански за начинаещи'
WHERE members.email = 'elena.dimitrova@example.com'
  AND NOT EXISTS (
      SELECT 1 FROM enrollments
      WHERE member_id = members.id AND course_id = courses.id
  );

INSERT INTO fees (course_id, member_id, title, amount, due_date, paid)
SELECT courses.id, members.id, 'Първа вноска', 210.00, '2026-05-10', TRUE
FROM courses
JOIN members ON members.email = 'maria.ivanova@example.com'
WHERE courses.title = 'Английски за работа'
  AND NOT EXISTS (
      SELECT 1 FROM fees
      WHERE course_id = courses.id AND title = 'Първа вноска' AND due_date = '2026-05-10'
  );

INSERT INTO fees (course_id, member_id, title, amount, due_date, paid)
SELECT courses.id, members.id, 'Втора вноска', 210.00, '2026-06-10', FALSE
FROM courses
JOIN members ON members.email = 'georgi.petrov@example.com'
WHERE courses.title = 'Английски за работа'
  AND NOT EXISTS (
      SELECT 1 FROM fees
      WHERE course_id = courses.id AND title = 'Втора вноска' AND due_date = '2026-06-10'
  );

INSERT INTO fees (course_id, member_id, title, amount, due_date, paid)
SELECT courses.id, members.id, 'Пълна такса', 360.00, '2026-05-12', FALSE
FROM courses
JOIN members ON members.email = 'elena.dimitrova@example.com'
WHERE courses.title = 'Испански за начинаещи'
  AND NOT EXISTS (
      SELECT 1 FROM fees
      WHERE course_id = courses.id AND title = 'Пълна такса' AND due_date = '2026-05-12'
  );

UPDATE fees
JOIN courses ON courses.id = fees.course_id
JOIN members ON members.email = 'maria.ivanova@example.com'
SET fees.member_id = members.id
WHERE fees.member_id IS NULL
  AND courses.title = 'Английски за работа'
  AND fees.title = 'Първа вноска'
  AND fees.due_date = '2026-05-10';

UPDATE fees
JOIN courses ON courses.id = fees.course_id
JOIN members ON members.email = 'georgi.petrov@example.com'
SET fees.member_id = members.id
WHERE fees.member_id IS NULL
  AND courses.title = 'Английски за работа'
  AND fees.title = 'Втора вноска'
  AND fees.due_date = '2026-06-10';

UPDATE fees
JOIN courses ON courses.id = fees.course_id
JOIN members ON members.email = 'elena.dimitrova@example.com'
SET fees.member_id = members.id
WHERE fees.member_id IS NULL
  AND courses.title = 'Испански за начинаещи'
  AND fees.title = 'Пълна такса'
  AND fees.due_date = '2026-05-12';
