# 🚀 Express TypeScript Boilerplate 2024

[![Build Express Application](https://github.com/edwinhern/express-typescript-2024/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/edwinhern/express-typescript-2024/actions/workflows/build.yml)
[![CodeQL](https://github.com/edwinhern/express-typescript-2024/actions/workflows/codeql.yml/badge.svg?branch=master)](https://github.com/edwinhern/express-typescript-2024/actions/workflows/codeql.yml)
[![Docker Image CI](https://github.com/edwinhern/express-typescript-2024/actions/workflows/docker-image.yml/badge.svg?branch=master)](https://github.com/edwinhern/express-typescript-2024/actions/workflows/docker-image.yml)
[![Release](https://github.com/edwinhern/express-typescript-2024/actions/workflows/release.yml/badge.svg?branch=master)](https://github.com/edwinhern/express-typescript-2024/actions/workflows/release.yml)

## 🌟 Introduction

Welcome to the Express TypeScript Boilerplate 2024 – a streamlined, efficient, and scalable foundation for building powerful backend services. This boilerplate merges modern tools and practices in Express.js and TypeScript, enhancing productivity, code quality, and performance.

## 💡 Motivation and Intentions

Developed to streamline backend development, this boilerplate is your solution for:

- ✨ Reducing setup time for new projects.
- 📊 Ensuring code consistency and quality.
- ⚡ Facilitating rapid development with cutting-edge tools.
- 🛡️ Encouraging best practices in security, testing, and performance.

## 🚀 Features

- 📁 Modular Structure: Organized by feature for easy navigation and scalability.
- 💨 Faster Execution with tsx: Rapid TypeScript execution with esbuild, complemented by tsc for type checking.
- 🌐 Stable Node Environment: Latest LTS Node version in .nvmrc.
- 🔧 Simplified Environment Variables with Envalid: Centralized and easy-to-manage configuration.
- 🔗 Path Aliases: Cleaner code with shortcut imports.
- 🔄 Dependabot Integration: Automatic updates for secure and up-to-date dependencies.
- 🔒 Security: Helmet for HTTP header security and CORS setup.
- 📊 Logging: Efficient logging with pino-http.
- 🧪 Comprehensive Testing: Robust setup with Vitest and Supertest.
- 🔑 Code Quality Assurance: Husky and lint-staged for consistent quality.
- ✅ Unified Code Style: ESLint and Prettier for a consistent coding standard.
- 📃 API Response Standardization: ServiceResponse class for consistent API responses.
- 🐳 Docker Support: Ready for containerization and deployment.
- 📝 Input Validation with Zod: Strongly typed request validation using Zod.
- 🧩 API Spec Generation: Automated OpenAPI specification generation from Zod schemas to ensure up-to-date and accurate API documentation.

## 🛠️ Getting Started

### Step 1: 🚀 Initial Setup

- Clone the repository: `git clone https://github.com/edwinhern/express-typescript-2024.git`
- Navigate: `cd express-typescript-2024`
- Install dependencies: `npm ci`

### Step 2: ⚙️ Environment Configuration

- Create `.env`: Copy `.env.template` to `.env`
- Update `.env`: Fill in necessary environment variables

### Step 3: 🏃‍♂️ Running the Project

- Development Mode: `npm run dev`
- Building: `npm run build`
- Production Mode: Set `.env` to `NODE_ENV="production"` then `npm run build && npm run start`

## 📁 Project Structure

```
.
├── api
│   ├── healthCheck
│   │   ├── __tests__
│   │   │   └── healthCheckRouter.test.ts
│   │   └── healthCheckRouter.ts
│   └── user
│       ├── __tests__
│       │   ├── userRouter.test.ts
│       │   └── userService.test.ts
│       ├── userModel.ts
│       ├── userRepository.ts
│       ├── userRouter.ts
│       └── userService.ts
├── api-docs
│   ├── __tests__
│   │   └── openAPIRouter.test.ts
│   ├── openAPIDocumentGenerator.ts
│   ├── openAPIResponseBuilders.ts
│   └── openAPIRouter.ts
├── common
│   ├── __tests__
│   │   ├── errorHandler.test.ts
│   │   └── requestLogger.test.ts
│   ├── middleware
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── requestLogger.ts
│   ├── models
│   │   └── serviceResponse.ts
│   └── utils
│       ├── commonValidation.ts
│       ├── envConfig.ts
│       └── httpHandlers.ts
├── index.ts
└── server.ts

```

### Installing `intracom-be-06-2024`

**Objective**: This SOP outlines the steps to install and set up the `intracom-be-06-2024` application.

---

#### Prerequisites:

- SSH access
- Git installed
- Node.js and npm installed
- Docker Desktop installed
- MongoDB community server image available on Docker Hub

---

### Steps:

1. **Setup SSH Key:**

   - Generate an SSH key if you don't have one: `ssh-keygen -t rsa -b 4096 -C "your_email@example.com"`
   - Add the SSH key to your SSH agent: `eval "$(ssh-agent -s)"` and `ssh-add ~/.ssh/id_rsa`
   - Add the SSH key to your GitHub account.

2. **Clone the Repository:**

   - Clone the `intracom-be-06-2024` repository:
     ```sh
     git clone https://github.com/project-ascend-io/intracom-be-06-2024
     cd intracom-be-06-2024
     ```

3. **Install Dependencies:**

   - Navigate to the project directory and run:
     ```sh
     npm install
     ```

4. **Setup Environment Variables:**

   - Create a `.env` file in the root directory of your project with the following content:

     ```
     NODE_ENV=development
     PORT=8080
     HOST=localhost

     # CORS Settings
     CORS_ORIGIN=http://localhost:*

     # Rate Limiting
     COMMON_RATE_LIMIT_WINDOW_MS=1000
     COMMON_RATE_LIMIT_MAX_REQUESTS=20

     # MongoDB Settings
     MONGO_INITDB_DATABASE=intracom_database
     MONGO_INITDB_ROOT_USERNAME=root
     MONGO_INITDB_ROOT_PASSWORD=root
     MONGODB_USER=<username>
     MONGODB_PASSWORD=<password>
     MONGODB_CONNECTION_STRING=mongodb://root:root@localhost:27017/
     ```

5. **Install Docker Desktop:**

   - Download and install Docker Desktop from [Docker's official website](https://www.docker.com/products/docker-desktop).

6. **Download MongoDB Image:**

   - Pull the MongoDB community server image from Docker Hub:
     ```sh
     docker pull mongo:latest
     ```

7. **Configure and Run MongoDB Container:**

   - Open Docker Desktop and create a new container with the following settings:
     - **Container Name**: `intracom-database`
     - **Port**: `27017`
     - **Volumes**: `/path/to/intracom-be-06-2024/database -> /data`
     - **Environment Variables**:
       - `MONGO_INITDB_DATABASE`: `intracom_database`
       - `MONGO_INITDB_ROOT_USERNAME`: `root`
       - `MONGO_INITDB_ROOT_PASSWORD`: `root`
     - Click `Run`.

8. **Run the Application:**

   - Start the application with:
     ```sh
     npm run dev
     ```

9. **Access the Application:**
   - Open your browser and navigate to `http://localhost:8080` to see the running application.

---

For further details or troubleshooting, please refer to the respective documentation of each tool used.

---
