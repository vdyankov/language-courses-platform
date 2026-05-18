USE language_courses;

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
