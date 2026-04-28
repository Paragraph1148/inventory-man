# Secure Inventory, Authentication, and Referral Management System

_A modular backend architecture for transactional consistency, hierarchical data modeling, and fine-grained access control_

---

## Abstract

This work presents the design and implementation of a backend system that integrates authentication, inventory management, and hierarchical referral (multi-level) structures into a unified service. The system is built using Node.js and MySQL, with a focus on secure identity management, transactional integrity under concurrent operations, and controlled data visibility through role-based and row-level access policies.

The primary contribution of this system lies in combining three typically separate domains—authentication, inventory consistency, and hierarchical data propagation—into a cohesive architecture that ensures correctness, scalability, and maintainability. The system is structured using a layered approach (routes → services → data access) and enforces security through token-based authentication, controlled session lifecycles, and strict authorization boundaries.

---

## 1. Introduction

Modern backend systems frequently operate under three simultaneous constraints:

1. **Identity and Access Management** — ensuring that only authenticated users access system resources.
2. **Data Integrity** — maintaining correctness under concurrent operations, especially in transactional domains such as inventory.
3. **Hierarchical Relationships** — modeling and querying recursive structures such as referral trees.

Most implementations address these concerns independently. However, when combined—particularly in systems involving user hierarchies and financial or stock operations—the interaction between these layers becomes non-trivial.

This project aims to address these challenges by designing a backend system that:

- Maintains **strict consistency of inventory state under concurrent updates**
- Supports **hierarchical user relationships with efficient traversal and updates**
- Enforces **fine-grained access control using both role-based and row-level constraints**
- Implements a **secure and extensible authentication mechanism**

---

## 2. System Architecture

The system follows a modular layered architecture:

```
Routes → Services → Data Access (Database)
```

### 2.1 Routes Layer

Responsible for:

- Request validation
- Authentication enforcement
- Input sanitization
- Mapping HTTP endpoints to service operations

### 2.2 Service Layer

Encapsulates business logic:

- Inventory operations (orders, stock updates)
- Referral tree propagation
- Authorization rules
- Transaction orchestration

### 2.3 Data Access Layer

Handles:

- SQL query execution
- Transaction boundaries
- Connection pooling
- Atomic updates

This separation ensures:

- Maintainability
- Testability
- Clear responsibility boundaries

---

## 3. Authentication and Session Management

### 3.1 Token-Based Authentication

The system implements JSON Web Token (JWT) based authentication with:

- **Short-lived access tokens**
- **Rotating refresh tokens**
- **Server-side hashed storage of refresh tokens**

This design mitigates:

- Token replay attacks
- Long-lived credential exposure
- Session hijacking risks

### 3.2 OTP-Based Verification

Account verification and password recovery are implemented using:

- Time-bound one-time passwords (OTP)
- Single-use enforcement
- Database-backed validation

This ensures:

- Secure onboarding
- Controlled credential reset flows

---

## 4. Authorization Model

### 4.1 Role-Based Access Control (RBAC)

The system distinguishes between roles (e.g., admin, user) and enforces:

- Route-level restrictions
- Operation-level permissions
- Controlled access to administrative endpoints

### 4.2 Row-Level Security (RLS)

Beyond role-based checks, the system enforces **row-level access constraints**, ensuring that:

- Users can access only their own records
- Hierarchical access is restricted to their referral subtree

This is achieved using:

- Recursive queries (Common Table Expressions)
- Scoped data filtering at query level

---

## 5. Inventory Management and Transactional Integrity

### 5.1 Atomic Stock Updates

Inventory operations are executed within database transactions to guarantee:

- Atomicity of stock deductions
- Prevention of overselling
- Consistency under concurrent requests

A typical flow includes:

1. Conditional stock deduction (`UPDATE ... WHERE stock >= quantity`)
2. Verification of affected rows
3. Order creation within the same transaction
4. Commit or rollback based on outcome

### 5.2 Reservation System

A reservation mechanism is implemented to handle temporary stock allocation:

- Time-bound reservations
- Conflict resolution through aggregate availability calculation
- Prevention of race conditions during high contention

---

## 6. Hierarchical Referral System

### 6.1 Tree Structure

Users are organized in a binary-like referral structure with:

- Parent-child relationships
- Left/right leg positioning
- Depth tracking

### 6.2 Propagation Logic

When a new member is added:

- Referral chains are traversed upward
- Aggregate counters are updated incrementally
- Structural consistency is preserved

### 6.3 Recursive Queries

Subtree retrieval is implemented using recursive SQL queries, enabling:

- Efficient hierarchical traversal
- Tree visualization
- Scoped data access for authorization

---

## 7. Data Modeling

The system uses a relational schema with key entities:

- **Users** — authentication and identity
- **Members** — hierarchical relationships
- **Products** — inventory items
- **Orders** — transactional records
- **Reservations** — temporary stock allocations
- **OTP / Tokens** — authentication support

Relationships are enforced through:

- Foreign keys
- Referential constraints
- Controlled cascading operations

---

## 8. Concurrency Considerations

The system is designed to operate correctly under concurrent access:

- Transaction isolation ensures consistency
- Conditional updates prevent race conditions
- Rollbacks handle failure scenarios

Critical sections include:

- Stock updates
- Order modifications
- Referral tree restructuring

---

## 9. Security Considerations

The system incorporates multiple security layers:

- Password hashing using bcrypt
- Token signing and verification
- Input validation and sanitization
- Rate limiting for sensitive endpoints
- Separation of authentication and business logic

---

## 10. Limitations and Future Work

Current limitations include:

- Single-instance deployment assumptions
- Absence of distributed locking for multi-node environments
- Limited observability (logging/monitoring)

Future improvements may include:

- Containerization and orchestration
- Distributed transaction handling
- Event-driven architecture
- Enhanced audit logging

---

## 11. Conclusion

This system demonstrates how authentication, transactional integrity, and hierarchical data management can be integrated into a single backend architecture without compromising modularity or correctness.

The design prioritizes:

- Security through controlled identity and session management
- Consistency through transactional guarantees
- Scalability through layered architecture
- Precision through row-level access control

By combining these elements, the system provides a robust foundation for applications requiring secure, hierarchical, and transaction-sensitive operations.

---
