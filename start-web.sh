# Migrate
echo "Memulai proses migrasi sora..."
sh "/db-migrate/db-migrate-release-command.sh"

# Mulai aplikasi web 
echo "Memulai web server..."
node apps/web/server.js
