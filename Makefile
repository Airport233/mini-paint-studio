.PHONY: test test-backend test-frontend build

test: test-backend test-frontend

test-backend:
	cd backend && ./mvnw test -Dspring.profiles.active=dev

test-frontend:
	cd frontend && npm run build

build:
	cd backend && ./mvnw package -DskipTests
	docker build -t hobbymix-backend ./backend
	docker build -t hobbymix-frontend ./frontend
