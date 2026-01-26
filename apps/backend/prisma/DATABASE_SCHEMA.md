# 🍔 Food Delivery Database Schema

This document describes the database architecture for a food delivery platform.  
The schema emphasizes **data integrity**, **historical correctness**, and **safe retries** by combining:

- **Event Sourcing** for order lifecycle tracking
- **Snapshot-based storage** for purchased items
- **Idempotency handling** for critical API operations

---

## 📊 Entity Relationship Diagram (ERD)

### Visual Diagram

```mermaid
erDiagram
    User ||--o{ Order : places
    User ||--|| Cart : owns
    Order ||--|{ OrderItem : contains
    Order ||--|{ OrderEvent : has_history
    Order ||--|{ Payment : has
    OrderItem }|--|| Food : refers_to
    Cart ||--|{ CartItem : contains
    CartItem }|--|| Food : refers_to
    Payment ||--o{ OrderEvent : triggers

    User {
        String id PK
        String email
        Role role
    }

    Order {
        String id PK
        String userId FK
        String idempotencyKey
    }

    OrderItem {
        String id PK
        String foodName "Snapshot"
        Float price "Snapshot"
        Int quantity
    }

    OrderEvent {
        String id PK
        OrderEventType type
        EventSource causedBy
        DateTime createdAt
    }

    Payment {
        String id PK
        PaymentStatus status
        Float amount
    }

    Food {
        String id PK
        String name
        Float price
        Boolean isAvailable
    }

    Cart {
        String id PK
        String userId FK
    }

    CartItem {
        String id PK
        Int quantity
    }
