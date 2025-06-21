-- =================================================================
-- Force Logout All Users
-- Version: 1
-- Description: This script increments the `token_version` for all
--              users in the database. When the application checks
--              this new version against the one stored in the user's
--              browser, it will force them to log out.
-- =================================================================

UPDATE users
SET token_version = token_version + 1;

-- Verification Query
-- You can run this to see the new token versions.
SELECT email, role, token_version FROM users; 