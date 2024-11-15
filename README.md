# Planning poker notes

## [DEPLOYMENT](https://ek8-planning-poker.vercel.app)

### Step 1: Define the Requirements

#### Functional Requirements:

- User authentication (sign up, login)
- Creating and joining a planning poker session
- Adding stories/tasks to be estimated
- Voting interface for participants
- Real-time updates of votes
- Displaying results and consensus

#### Non-Functional Requirements:

- Scalability
- Security
- Usability
- Real-time performance

### Step 2: Choose the Technology Stack

- Frontend: HTML, CSS, JavaScript + framework like React, Vue, Astro or Svelte.
- Backend: Node.js with Express
- Database: MongoDB, PostgreSQL, MySQL.
- Real-time Communication: WebSockets (using libraries like Socket.io).
- Hosting: AWS, Heroku, Vercel, or any cloud service provider.

### Step 3: Design the Architecture

- Client-Server Architecture: The frontend will communicate with the backend via RESTful APIs or GraphQL.
- Real-time Layer: Implement WebSockets for real-time voting updates.
- Database Layer: Store user information, sessions, and voting results.

### Step 4: Set Up My Dev Environment

- Version Control: Set up a repository on GitHub, GitLab, or Bitbucket.
- Development Tools: Install necessary tools like Node.js, npm/yarn, frameworks.
- Environment Setup: Configure necessary variables (e.g., database connection strings, API keys).

### Step 5: Develop the Application

#### Frontend Development:

- Create components for user authentication, creating/joining sessions, and voting interface.
- Use WebSockets to handle real-time updates.
- Style the application using CSS or a framework.
- palette to consider: #073b4c #118ab2 #06d6a0 #ffd166 #ef476f
- https://coolors.co/visualizer/ef476f-ffd166-06d6a0-118ab2-073b4c

#### Backend Development:

- Set up user authentication (consider using JWT for token-based authentication).
- Develop RESTful APIs for creating sessions, adding tasks, and recording votes.
- Implement WebSocket endpoints for real-time communication.

#### Database:

- Design the schema for users, sessions, and votes.
- Set up database connections and ORM (if using one).

### Step 6: Testing

- Unit Testing: Write tests for individual components and functions.
- Integration Testing: Test how different parts of the application work together.
- End-to-End Testing: Simulate real user scenarios to ensure everything works as expected.

### Step 7: Deployment

#### Prepare for Deployment:

- Set up the environment configurations for production.
- Optimize the frontend for production (e.g., minification, bundling).
- Ensure the backend is secure (e.g., HTTPS, environment variables).

#### Deploy:

#### Deploy the backend on a cloud server.

Deploy the frontend on a static site hosting service.
Set up a CI/CD pipeline for continuous integration and deployment.

## Step 8: Monitor and Maintain

Monitoring: Use tools like Google Analytics, Sentry, or any monitoring service to track usage and errors.
Maintenance: Regularly update dependencies and fix bugs. Implement new features (optional).
