# Contest Participation System

A robust API-based contest management platform where users can create contests, participate in them, answer questions, and compete for prizes.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
  - [Development Mode](#development-mode)
  - [Production Mode](#production-mode)
  - [Using Docker](#using-docker)
- [Testing](#testing)
- [Security Features](#security-features)
- [API Rate Limiting](#api-rate-limiting)
- [License](#license)

## Overview

The Contest Participation System is a comprehensive platform for creating and managing online contests. It allows administrators to create different types of contests with various question formats (single-select, multi-select, true/false), while users can participate, submit answers, view leaderboards, and claim prizes.

## Features

- **User Management**
  - Registration and authentication
  - Role-based access control (admin/user)
  - Profile management

- **Contest Management**
  - Create, edit, and delete contests
  - Set contest parameters (start time, end time, access level)
  - Define prize information

- **Question Management**
  - Multiple question types (single-select, multi-select, true/false)
  - Associate questions with contests
  - Define correct answers

- **Participation System**
  - Join contests
  - Submit answers
  - Auto-scoring based on correct responses
  - Participation status tracking

- **Leaderboard**
  - View in-progress contests
  - Score calculation and display

- **Prize Management**
  - Award prizes to contest winners
  - Prize history tracking

## Tech Stack

- **Backend Framework**: Node.js with Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Security**: Helmet, Rate Limiting, CORS
- **Logging**: Morgan
- **Containerization**: Docker

## System Architecture

The application follows a modular architecture with clear separation of concerns:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Models**: Define database schema and relationships
- **Routes**: Define API endpoints
- **Middlewares**: Handle authentication, error handling, validation
- **Utils**: Contain helper functions and utilities

## Database Schema

The database consists of the following main entities:

- **Users**: Store user information and credentials
- **Contests**: Define contest details, timing, and rules
- **Questions**: Store questions associated with contests
- **Options**: Define possible answers for questions
- **Participations**: Track user participation in contests
- **Answers**: Record user's answers to questions
- **AnswerOptions**: Junction table for linking answers to selected options
- **Prizes**: Manage prizes awarded to contest winners
![Screenshot 2025-04-27 at 2 28 38 PM](https://github.com/user-attachments/assets/0f16fecf-8d72-4225-b88c-8bc06b41e72a)


## API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and receive JWT token

### User Endpoints

- `GET /api/users` - List all users (admin only)
- `PUT /api/users/:id` - Update user details

### Contest Endpoints

- `GET /api/contests` - List all contests
- `GET /api/contests/:id` - Get contest details
- `POST /api/contests` - Create a new contest (admin only)
- `PUT /api/contests/:id` - Update contest (admin only)
- `DELETE /api/contests/:id` - Delete contest (admin only)

### Participation Endpoints

- `GET /api/participations/contests/:id/score` - Get user's score for a contest
- `POST /api/participations/contests/:id/join` - Join a contest
- `PUT /api/participations/contests/:id/submit` - Submit contest answers

### Leaderboard Endpoints

- `GET /api/leaderboard/user/in-progress` - Get user's in-progress contests
- `GET /api/leaderboard/contests/:id` - Get Contest Leaderboard
- `GET /api/leaderboard/user/history` - Get User Contest History
- `GET /api/leaderboard/user/prizes` - Get User Prizes

### Prize Endpoints

- `GET /api/prizes/contest/:id` - Get contest prize details
- `POST /api/prizes/contest/:id` - Create a prize (admin only)
- `POST /api/prizes/contest/:id/award` - Award prize to user (admin only)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm
- Docker (optional)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/contest-system.git
   cd contest-system
   ```

2. Install dependencies
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=contest_system
DB_PORT=3306

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

### Database Setup

1. Run migrations
   ```bash
   npm run migrate
   ```

2. Seed the database with initial data (optional)
   ```bash
   npm run seed
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

### Using Docker

1. Build and start the containers
   ```bash
   docker-compose up -d
   ```

2. Stop the containers
   ```bash
   docker-compose down
   ```


## Security Features

- JWT for secure authentication
- Password hashing using bcrypt
- API rate limiting to prevent abuse
- Helmet for securing HTTP headers
- CORS for protecting against cross-origin attacks
- Input validation using Joi

## API Rate Limiting

The API implements rate limiting to prevent abuse. By default, limits are set to:
- 100 requests per 15-minute window

These can be configured via the `.env` file using:
- `RATE_LIMIT_WINDOW_MS` - Time window in milliseconds
- `RATE_LIMIT_MAX` - Maximum number of requests per window
