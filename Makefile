# OrderEase Docker Makefile
# Production-ready Docker commands for easy management

.PHONY: help build up down restart logs clean prod dev

# Default target
help: ## Show this help message
	@echo "OrderEase Docker Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Production commands
prod-build: ## Build production containers
	docker-compose build

prod-up: ## Start production containers
	docker-compose up -d

prod-down: ## Stop production containers
	docker-compose down

prod-restart: ## Restart production containers
	docker-compose restart

prod-logs: ## Show production logs
	docker-compose logs -f

prod-clean: ## Clean production containers and volumes
	docker-compose down -v
	docker system prune -f

# Development commands
dev-build: ## Build development containers
	docker-compose -f docker-compose.dev.yml build

dev-up: ## Start development containers with hot-reload
	docker-compose -f docker-compose.dev.yml up -d

dev-down: ## Stop development containers
	docker-compose -f docker-compose.dev.yml down

dev-restart: ## Restart development containers
	docker-compose -f docker-compose.dev.yml restart

dev-logs: ## Show development logs
	docker-compose -f docker-compose.dev.yml logs -f

dev-clean: ## Clean development containers and volumes
	docker-compose -f docker-compose.dev.yml down -v
	docker system prune -f

# Database commands
db-migrate: ## Run database migrations (production)
	docker-compose exec backend npm run prisma:migrate:prod

db-seed: ## Seed database (production)
	docker-compose exec backend npm run prisma:seed

db-studio: ## Open Prisma Studio (development)
	docker-compose -f docker-compose.dev.yml exec backend npm run prisma:studio

db-reset: ## Reset database (development)
	docker-compose -f docker-compose.dev.yml exec backend npm run prisma:migrate:reset
	docker-compose -f docker-compose.dev.yml exec backend npm run prisma:seed

# Utility commands
shell-backend: ## Open shell in backend container (production)
	docker-compose exec backend sh

shell-backend-dev: ## Open shell in backend container (development)
	docker-compose -f docker-compose.dev.yml exec backend sh

shell-db: ## Open shell in database container
	docker-compose exec database psql -U postgres -d orderease

status: ## Show container status
	docker-compose ps

health: ## Check health of all services
	@echo "=== Backend Health ==="
	docker-compose exec backend curl -f http://localhost:3000/api/public/health || echo "Backend unhealthy"
	@echo "=== Database Health ==="
	docker-compose exec database pg_isready -U postgres -d orderease || echo "Database unhealthy"
	@echo "=== NGINX Health ==="
	docker-compose exec nginx wget -q --spider http://localhost/health || echo "NGINX unhealthy"

# Quick start commands
quick-dev: ## Quick start for development (build + up + migrate + seed)
	$(MAKE) dev-build
	$(MAKE) dev-up
	sleep 10
	$(MAKE) db-migrate
	$(MAKE) db-seed
	@echo "🚀 Development environment is ready!"
	@echo "Backend: http://localhost:3000"
	@echo "API via NGINX: http://localhost/api"
	@echo "Database: localhost:5432"

quick-prod: ## Quick start for production (build + up + migrate + seed)
	$(MAKE) prod-build
	$(MAKE) prod-up
	sleep 10
	$(MAKE) db-migrate
	$(MAKE) db-seed
	@echo "🚀 Production environment is ready!"
	@echo "API via NGINX: http://localhost/api"
	@echo "Health check: http://localhost/health"
