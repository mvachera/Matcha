# Database Management Makefile
# Use these commands to interact with your matchy-matchy database

DB_CONTAINER = matchy-matchy-db
DB_USER = moha
DB_NAME = matchy-matchy-db

# List all tables in the database
apply:
	docker exec -i $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) < schema.sql

tables:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "\d"

# Show all users (excludes sensitive information)
users:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "SELECT username, email, firstname, lastname, gender, profile_complete, birth_date, biography, created_at, updated_at, location_id, authorize_location FROM \"User\";"

# Show all matches
matches:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "SELECT * FROM \"Match\";"

# Show all messages
messages:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "SELECT * FROM \"Message\";"

# Show all locations
locations:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "SELECT * FROM \"Location\";"

# Show all views
views:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "SELECT * FROM \"_Views\";"

# Show user count
user-count:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "SELECT COUNT(*) FROM \"User\";"

# Show detailed table structure for User table
describe-user:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "\d \"User\""

# Show detailed table structure for Match table
describe-match:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "\d \"Match\""

# Show detailed table structure for Message table
describe-message:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "\d \"Message\""

# Show detailed table structure for Location table
describe-location:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "\d \"Location\""

# Show detailed table structure for _Views table
describe-views:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "\d \"_Views\""

# Show latest 10 users (excludes sensitive information)
latest-users:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "SELECT username, email, firstname, lastname, gender, birth_date FROM \"User\" ORDER BY created_at DESC LIMIT 10;"

# Show latest 10 matches
latest-matches:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "SELECT * FROM \"Match\" ORDER BY matched_at DESC LIMIT 10;"

# Show latest 10 messages
latest-messages:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "SELECT * FROM \"Message\" ORDER BY timestamp DESC LIMIT 10;"

# Show user matches (provide USERNAME when calling: make user-matches USERNAME=john)
user-matches:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "SELECT * FROM \"Match\" WHERE user1 = '$(USERNAME)' OR user2 = '$(USERNAME)';"

# Show user messages (provide USERNAME when calling: make user-messages USERNAME=john)
user-messages:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "SELECT * FROM \"Message\" WHERE sender = '$(USERNAME)' OR recipient = '$(USERNAME)' ORDER BY timestamp DESC;"

# Show users who viewed a specific user (provide USERNAME when calling: make user-views USERNAME=john)
user-views:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "SELECT \"B\" as viewer FROM \"_Views\" WHERE \"A\" = '$(USERNAME)';"

# Show users viewed by a specific user (provide USERNAME when calling: make viewed-by-user USERNAME=john)
viewed-by-user:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "SELECT \"A\" as viewed FROM \"_Views\" WHERE \"B\" = '$(USERNAME)';"

# Show user profile with location (provide USERNAME when calling: make user-profile USERNAME=john)
user-profile:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "SELECT u.username, u.email, u.firstname, u.lastname, u.gender, u.profile_complete, u.birth_date, u.biography, u.created_at, u.updated_at, u.authorize_location, l.city, l.country, l.latitude, l.longitude FROM \"User\" u LEFT JOIN \"Location\" l ON u.location_id = l.id WHERE u.username = '$(USERNAME)';"

# Show users by interests (provide INTEREST when calling: make users-by-interest INTEREST=music)
users-by-interest:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "SELECT username, email, firstname, lastname, gender, profile_complete, birth_date, biography, created_at, updated_at, location_id, authorize_location FROM \"User\" WHERE '$(INTEREST)' = ANY(interests);"

# Show users by sexual preference (provide PREFERENCE when calling: make users-by-preference PREFERENCE=female)
users-by-preference:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "SELECT username, email, firstname, lastname, gender, profile_complete, birth_date, biography, created_at, updated_at, location_id, authorize_location FROM \"User\" WHERE '$(PREFERENCE)' = ANY(sexual_preferences);"

# Show users by location (provide CITY when calling: make users-by-city CITY=Paris)
users-by-city:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "SELECT u.username, u.email, u.firstname, u.lastname, u.gender, u.profile_complete, u.birth_date, u.biography, u.created_at, u.updated_at, u.authorize_location, l.city, l.country FROM \"User\" u JOIN \"Location\" l ON u.location_id = l.id WHERE l.city ILIKE '%$(CITY)%';"

# Show conversation between two users (provide USER1 and USER2 when calling: make conversation USER1=john USER2=jane)
conversation:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "SELECT * FROM \"Message\" WHERE (sender = '$(USER1)' AND recipient = '$(USER2)') OR (sender = '$(USER2)' AND recipient = '$(USER1)') ORDER BY timestamp ASC;"

# Mark messages as read (provide USERNAME when calling: make mark-messages-read USERNAME=john)
mark-messages-read:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "UPDATE \"Message\" SET read = true WHERE recipient = '$(USERNAME)' AND read = false RETURNING id;"

# Count unread messages (provide USERNAME when calling: make unread-messages USERNAME=john)
unread-messages:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "SELECT COUNT(*) FROM \"Message\" WHERE recipient = '$(USERNAME)' AND read = false;"

# Show incomplete profiles
incomplete-profiles:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "SELECT username, email, firstname, lastname, gender, profile_complete, birth_date, biography, created_at, updated_at, location_id, authorize_location FROM \"User\" WHERE profile_complete = false;"

# Run custom SQL (provide QUERY when calling: make query QUERY="SELECT * FROM \"User\" WHERE email LIKE '%example.com%';")
query:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "$(QUERY)"

# Show database size
db-size:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "SELECT pg_size_pretty(pg_database_size('$(DB_NAME)'));"

# Show table sizes
table-sizes:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "SELECT table_name, pg_size_pretty(pg_total_relation_size(table_name)) as size FROM information_schema.tables WHERE table_schema = 'public' ORDER BY pg_total_relation_size(table_name) DESC;"

# Add a new user (interactive)
add-user:
	@read -p "Username: " username; \
	read -p "Email: " email; \
	read -p "First name: " firstname; \
	read -p "Last name: " lastname; \
	read -p "Password: " password; \
	read -p "Gender: " gender; \
	read -p "Interests (comma-separated): " interests; \
	read -p "Sexual preferences (comma-separated): " preferences; \
	interests_array=$$(echo "$$interests" | sed "s/,/','/g"); \
	preferences_array=$$(echo "$$preferences" | sed "s/,/','/g"); \
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "INSERT INTO \"User\" (username, email, firstname, lastname, password, gender, interests, sexual_preferences) VALUES ('$$username', '$$email', '$$firstname', '$$lastname', crypt('$$password', gen_salt('bf')), '$$gender', '{''$$interests_array''}', '{''$$preferences_array''}') RETURNING username, email;"

# Add a view between users (provide VIEWER and VIEWED when calling: make add-view VIEWER=john VIEWED=jane)
add-view:
	docker exec -it $(DB_CONTAINER) psql -U $(DB_USER) -d $(DB_NAME) -c "INSERT INTO \"_Views\" (\"A\", \"B\") VALUES ('$(VIEWED)', '$(VIEWER)') ON CONFLICT DO NOTHING RETURNING *;"

delete:
	docker system prune -af
	docker stop `docker ps -q`
	docker rm `docker ps -aq`
	docker rmi `docker image -aq`
	docker volume rm `docker volume ls -q`
	docker network rm `docker network ls -q`
	docker system prune -af  

help:
	@echo "Available commands:"
	@echo "  make tables              - List all tables in the database"
	@echo "  make users               - Show all users"
	@echo "  make matches             - Show all matches"
	@echo "  make messages            - Show all messages"
	@echo "  make locations           - Show all locations"
	@echo "  make views               - Show all views"
	@echo "  make user-count          - Show total number of users"
	@echo "  make describe-user       - Show User table structure"
	@echo "  make describe-match      - Show Match table structure"
	@echo "  make describe-message    - Show Message table structure"
	@echo "  make describe-location   - Show Location table structure"
	@echo "  make describe-views      - Show _Views table structure"
	@echo "  make latest-users        - Show latest 10 users"
	@echo "  make latest-matches      - Show latest 10 matches"
	@echo "  make latest-messages     - Show latest 10 messages"
	@echo "  make user-matches USERNAME=john - Show matches for specific user"
	@echo "  make user-messages USERNAME=john - Show messages for specific user"
	@echo "  make user-views USERNAME=john - Show users who viewed a specific user"
	@echo "  make viewed-by-user USERNAME=john - Show users viewed by a specific user"
	@echo "  make user-profile USERNAME=john - Show user profile with location"
	@echo "  make users-by-interest INTEREST=music - Show users with specific interest"
	@echo "  make users-by-preference PREFERENCE=female - Show users with specific sexual preference"
	@echo "  make users-by-city CITY=Paris - Show users from specific city"
	@echo "  make conversation USER1=john USER2=jane - Show conversation between two users"
	@echo "  make mark-messages-read USERNAME=john - Mark all messages to user as read"
	@echo "  make unread-messages USERNAME=john - Count unread messages for user"
	@echo "  make incomplete-profiles - Show users with incomplete profiles"
	@echo "  make add-user - Interactive form to add a new user"
	@echo "  make add-view VIEWER=john VIEWED=jane - Record that one user viewed another"
	@echo "  make query QUERY=\"SELECT * FROM \\\"User\\\"\" - Run custom SQL query"
	@echo "  make db-size             - Show database size"
	@echo "  make table-sizes         - Show size of all tables"

.PHONY: tables users matches messages locations views user-count describe-user describe-match describe-message describe-location describe-views latest-users latest-matches latest-messages user-matches user-messages user-views viewed-by-user user-profile users-by-interest users-by-preference users-by-city conversation mark-messages-read unread-messages incomplete-profiles add-user add-view query db-size table-sizes help