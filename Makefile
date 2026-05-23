.PHONY: test test-backend test-frontend build

test: test-backend test-frontend

test-backend:
	cd backend && JAVA_HOME="/c/Program Files/Java/jdk-21" ./mvnw test -Dspring.profiles.active=dev

test-frontend:
	cd frontend && npm run build

build:
	cd backend && JAVA_HOME="/c/Program Files/Java/jdk-21" ./mvnw package -DskipTests
	docker build -t hobbymix-backend ./backend
	docker build -t hobbymix-frontend ./frontend
