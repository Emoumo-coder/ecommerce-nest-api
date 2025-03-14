# Nestjs E-commerce

## ⭐ Intro

NestJS e-commerce API.

This is an eCommerce API (Headless Backend), built to apply my NestJS knowledge.

<br>

## ⚙️ Tools

<br>

| Category          | Tech Stack                                                                                                                                                                                                                                                                                                                                                                      |
| :------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Language      | [![](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=TypeScript&logoColor=white)]()                                                                                                                                                                                                                                                                      |
| Backend       | [![](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=Node.js&logoColor=white)]() [![](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=NestJS&logoColor=white)]() [![](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=Prisma&logoColor=white)]() [![](https://img.shields.io/badge/TypeORM-FE5F50?style=flat-square)]() |
| DB            | [![](https://img.shields.io/badge/Mysql-4479A1?style=flat-square&logo=MySql&logoColor=white)]()                                                                                                                                                                                                                                                                                |
| Testing       | [![](https://img.shields.io/badge/Jest-C21325?style=flat-square&logo=Jest&logoColor=white)]()                                                                                                                                                                                                                                                                                  |
| DevOps        | [![](https://img.shields.io/badge/github-181717?style=flat-square&logo=github&logoColor=white)]() [![](https://img.shields.io/badge/AWS-232F3E?style=flat-square&logo=amazonAWS&logoColor=white)]() [![](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=Docker&logoColor=white)]()                                                                          |
| Documentation | [![](https://img.shields.io/badge/Swagger-83B81A?style=flat-square&logo=Swagger&logoColor=white)]()                                                                                                                                                                                                                                                                            |

<br>

## 📍Installation

Follow the steps below to run the project locally. <br>


### 1. Clone the repository and install dependencies

```sh
$ git clone https://github.com/Emoumo-coder/ecommerce-nest-api.git
$ cd ecommerce-nest-api
$ npm install
```

### 2. Configure Environment Variables

Create a `.env` file based on `.env.example`.

### 3. Set up the Database

Start the MySQL container:

```sh
$ docker-compose up -d
```

Access the container and create the database:

```sh
$ docker exec -it CommerceDB bash
$ mysql -u <USERNAME> -p <PASSWORD>
$ create database commerce;
```

### 4. Apply Database Schema

```sh
$ npx prisma db push
```

### 5. Start the Server

```sh
$ npm run start

# For development mode
$ npm run start:dev
```

### 📍Swagger API Documentation

```sh
http://localhost:3000/api
```


### 📍Node.js / JS

Gained insights into the Node.js ecosystem and JavaScript fundamentals.

**Topics Covered:**

- JavaScript and Node.js
- npm and package.json
- Functional Programming (FP)
- JavaScript Data Assignment (Immutability & Mutability)
- JavaScript Variable Copying (Shallow & Deep Copy)
- JavaScript Prototype

### 📍NestJS

This is my first project using NestJS, where I learned about Dependency Injection (DI) and role separation between layers.

**Topics Covered:**

- NestJS Structure
- Applying Swagger for API Documentation
- Adding Custom Exception Filters
- Implementing Logging Interceptors

### 📍TypeScript

**Topics Covered:**

- TypeScript Basics
- TypeScript Types & Manipulation (Generics, Conditional Types, Infer)
- Utility Types
- String.prototype.split Type Inference
- DeepMerge Type Implementation
- Extends vs Implements in TypeScript
- Greater Than Type Implementation

### 📍Database

Studied database fundamentals such as transactions, indexes, and ORM concepts.

**Topics Covered:**

- Object Relational Mapping (ORM) Concepts
- Transactions and Isolation Levels
- NoSQL and Redis
- Basic SQL Syntax
- Indexing
- Normalization (Normal Forms)
- Locks and Transactions
- MySQL Locks (Auto Increment Lock)
- Why B+Tree is Used in Indexing
- Considerations for Using UUID as Primary Key in MySQL

