# Event Ticketing Application - ECE1724 Project 
## Team Information  
Charles Yu 1006718348 charlesyuzq.yu@mail.utoronto.ca  
Yuchen Xu 1006708779 yuchenzoe.xu@mail.utoronto.ca  

## Motivation
Many small and medium-sized student organizations such as campus clubs rely on Google Forms, spreadsheets or emails to manage event registration. When identity verification, event payment processing, or ticket validation are required, significant manual effort is typically involved. Organizers need to verify tickets, track approvals and distribute tickets separately. As a result, the process of recording and organizing event registration and participation data becomes time-consuming and error-prone. Additionally, real-time attendance tracking and fraud prevention are rarely supported in this process.

We aim to build a platform that provides a lightweight event and ticketing management system for small and medium-sized events that supports event publishing, identity verification, ticket generation, and ticket validation. This project is worth pursuing because event and ticket management remains inefficient and error-prone for many small or mid-sized student organizations. While there are large commercial platforms(such as Eventbrite), it is relatively complex to use them and the service fees are not low for small events. Therefore, a simple, efficient and fully featured event and ticketing management platform that reduces manual workload is in demand. 

The primary target users includes:
- Student event organizers (e.g., school clubs) who want to publish events, verify participants’ identity, and manage ticketing
- Attendees who need to register events, and access digital tickets

By integrating event publishing and management, ticket generation and validation into a single platform, this project demonstrates a practical and worthwhile solution that optimizes event workflows, reduces manual errors, and enhances the overall efficiency of small-scale event management. 

## Objective (To be edited)
The objective of this project is to develop an event ticketing platform, which includes an organizer mode for managing events and a customer mode for users to purchase and manage tickets. Specifically, organizers will be able to create events, monitor ticket selling status, and verify user-uploaded documents for discounts. Customers will be able to register/login, view event information, make purchases, upload documents and receive their downloadable tickets (a QR code with other information).  

## Technical Stack
### Core Features:

### Implementation approach:
Frontend: TypeScript, React  
Backend: TypeScript, Express.js  
Tailwind CSS was used for styling.  
shadcn/ui library was used for reusable UI components.  
Responsive frontend layout was implemented to adapt different screen sizes, and was made mobile device compatible. Responsive interaction designs were also implemented, such as live notifications and live dashboards. 


#### Database schema and relationships
TypeScript will be used for all backend/server code, and the relational database will be created using PostgreSQL.  
Database schema includes tables for organizer/customer accounts, event information, ticket information, etc. Here are some examples:  
e.g.
```ruby
CREATE SCHEMA event_ticketing_app;

-- Users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tickets table
CREATE TABLE tickets (
    ticket_id INTEGER PRIMARY KEY,
    event_id INTEGER NOT NULL
    belongs_to INTEGER NOT NULL
);

...
```

Database relationships include the following:  
One-to-One → One profile per user is allowed.  
One-to-Many → One event has many tickets. One customer can attend multiple events.  
Many-to-Many → Many users can attend many events and own many tickets.  

#### File storage
DigitalOcean object storage will be applied for stable and persistent access of tickets (QR codes) and user documents, to ensure data durability.
If potential system maintenance or upgrade happens and restart of the platform is required, users will still be able to retrieve their event and ticket information.  

#### User interface and experience design
The application’s UI design aims to provide an intuitive interface to make interactions clear and consistent. The application will feature a dashboard for both event organizers and customers. Before users log in, all events will be displayed on the homepage, and everyone will be able to search and read through them. After login, there will be a selection of organizer or customer modes. Organizers will get a dashboard where they can easily create/edit/delete events, and monitor ticket sales. Customers can make their purchases, and download their tickets containing event info and a QR-code for entry. Clear navigation, step-by-step guidance, and feedback mechanisms such as confirmation messages and error alerts, will ensure that users can understand each action.
 
#### Advanced Features
Depending on time available, the team will implement the advanced features in the following order, with at least 2 completed.  

- User Authentication and Authorization:  
  - All users will have their own private accounts, being able to register and login.
  - Role-based access control will be used to manage permissions for event operations. For example, only organizers are allowed to edit/close an event.
- Real-Time Functionality:  
  - WebSocket-based updates will be applied for event updates.
  - Live notifications and dashboards will be implemented to ensure smooth and synchronized information delivery, such as change of time/location/price, number of tickets available, etc.  
- Integration with External Services:  
  - An endpoint will be built to automatically notify users about new events or event information updates, through email using SendGrid, if they provide their emails during registration and are willing to receive such notifications.
  - Other notifications like new discount opportunities will be optionally implemented.  

### Fulfillment of Course Requirements:  
Here is a summary of key features which are compliant with course requirements.  
- Frontend Requirements (Core Technical Requirement 1):
  - TypeScript is used for all frontend code.
  - React is used for UI development.
  - Tailwind CSS and shadcn/ui are both used for UI and styling.
  - Responsive designs are implemented with the accommodation of additional features.
- Data Storage Requirements (Core Technical Requirement 2):
  - TypeScript is used for backend server code.
  - PostgreSQL is used for relational database.
  - DigitalOcean object storage is used for cloud storage and file handling.
- Architecture Approach (Core Technical Requirement 3):
  - Option B, Separate Frontend & Backend is chosen, with React for frontend UI, Express.js for backend server and RESTful API design (with proper documentation).
- Additional Features:
  - User Authentication and Authorization: register/login, access control, etc.
  - Real-Time Functionality: live notification and dashboard updates.
  - Integration with External Services: email notifications.

### Scope:
This project focuses on full-stack web development elements. 
- The main scope of the project is to develop a web application with complete backend/frontend environments, aiming for simple event organization and small-scale ticket sales activities. Some basic additions such as cloud storage are also inside the scope to hence the reliability of the tool. Only fundamental features discussed in above sections are inside the scope.
- Sophisticated security designs and database designs are not in the scope. Real transaction mechanisms and protections are not in the scope. Performance and traffic controls are also not focused.
  - However, these are all valuable features in an event ticketing system and could be saved as potential improvements for the future. The team is interested in pursuing beyond the requirements after the course.
 
### Feasibility:
The objective and scope of the project is achievable within the course timeframe. Two user mode (organizer and customer) backend will be implemented first, with core event creation and ticketing selling mechanics. Followed by frontend UI design, features at this point will already be enough to demonstrate all course requirements. By exploring additional features (e.g. live notification, automated verification, etc), the team has flexibility to decide what to be implemented based on time availability. This ensures completion of course expectations, while also keeping the project feasible.  

Detailed plans and work distributions can be found in the below section: Tentative Plan.

## Technical Stack

## Features

## User Guide

## Development Guide
### 1. Clone the repository
Clone the project from GitHub and move into the project folder:
```bash
git clone https://github.com/qasxxsaq/1724project.git
cd 1724project
```

### 2. Install required software
Before running the project locally, install the following:
Node.js 22.12.0 or above
npm
PostgreSQL

### 3. Install project dependencies
The project manages the frontend and backend separately.

#### 3.1 Backend dependencies
```bash
cd backend
npm install
```
#### 3.2 Frontend dependencies
```bash
cd frontend
npm install
```

### 4. Environment setup and configuration
The project requires environment variables for the backend and frontend.
#### 4.1 Backend environment variables
Create a .env file inside the backend folder.
Example:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/ticketing_db"
JWT_SECRET="your_jwt_secret_here"
# Storage mode
STORAGE_PROVIDER=local
```

### 5. Database initialization
The project uses PostgreSQL and Prisma
#### 5.1 Create the local PostgreSQL database
Create a new PostgreSQL database called ticket_app.
#### 5.2 Apply Prisma migrations
From the backend folder, run:
```bash
npx prisma migrate dev
```
If Prisma client generation is needed manually, run:
```bash
npx prisma generate
```

### 6. Cloud storage configuration
The default storage mode is set to local. For persistent cloud storage, we use Supabase Storage and you need an existing bucket in Supabase.
Change in `backend/.env`:
```env
STORAGE_PROVIDER=supabase
```
Add in `backend/.env`:
```env
…Other env variables…
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
SUPABASE_STORAGE_BUCKET="your_bucket_name"
```

### 7. Run the project locally
Start both the backend server and frontend server with two terminals:
```
cd backend
npm run dev
cd frontend
npm run dev
```
The backend should start on: http://localhost:4000.
The frontend should start on: http://localhost:5173.

### 8. (Optional) Deployment guide: 
If you also want to deploy the app, here is an example setup using Railway, used by the team.
- Create a new project and add 3 services, frontend (hosted from the /frontend folder from GitHub), backend (the /backend folder), and PostgreSQL database.
- Configure backend service variables. E.g. The .env variables in local development and `DATABASE_URL` from the database service.
- Configure frontend service variables. There is just one to configure:
`VITE_API_URL=the backend service url`
- Set Public Networking for the frontend. Be careful of the port number (using the default should be fine).

## Deploymeny Information
The application is deployed on Railway. It is available at: frontend-production-9b35.up.railway.app. 

## AI Assistance & Verification
We used AI tools mainly in the three areas: System design, debugging and conceptual / technical understanding. 

Firstly, when we want to add certain functions to the project, we use AI to help design code workflows. For example, in the first example in ai-session, we asked for suggestions on backend workflow design instead of asking for exact codes. AI suggested us to separate ticket creation and approval into different stages, and to add states like “pending” and “approved” to the ticket generation process. We adopted the general idea, but did not use the same API that AI suggested. We apply the idea using existing routes to fit our own code and backend design.

Second, we used AI for code review and debugging. Since there are too many files in our project, it is sometimes hard to define which part leads to programming issues. So we asked AI to go through the files and tell us which part could be causing problems. Apart from debugging an exact code issue, AI also helped us to identify potential issues in the project. As mentioned in ai-session file, AI helps us to find concurrency risks in ticket purchasing, insecure handling of JWT secrets and some frontend type inconsistencies. We did not directly apply all suggestions, but instead prioritized fixes based on their severity. In this way, we can avoid extra work.

Furthermore, we used AI to clarify any technical or conceptual concepts. For example, we asked about possible cloud storage applications we can use, or how to use JWT. AI saved our time on searching for the best choice and further helped us to understand selected options.
One limitation we observed in AI is that its suggestions were sometimes too generic or not fully aligned with our project scope. It may get very complex if we fully follow what AI suggested. So we need to decide ourselves if we want to follow AI’s suggestions. We also need to ensure that the AI does not generate incorrect or fabricated concepts when responding to topics we are unfamiliar with.

To ensure correctness, we verified AI-generated ideas through manual testing. This included manually testing user flows, checking backend logs and validating API behavior. In addition, we did not fully rely on AI responses. When AI suggestions were unclear or when we lacked confidence in the results, we cross-checked them with external sources such as documentation and community solutions (e.g., Stack Overflow or official guides). This helped us to confirm that the information was not fabricated.

## Individual Contribution
| Task Area | Main Work Done | Charles | Yuchen |
| --- | --- | --- | --- |
| Project setup | Set up frontend/backend structure, basic config, and repo organization | √ | √ |
| Authentication | Register/login, JWT handling, role-based access control | √ |  |
| Event management | Create, edit, delete events, organizer-side event logic |  | √ |
| Ticket system | Ticket purchase flow, QR/ticket code logic, my tickets page | √ |  |
| Student discount flow | Student ID upload, discount review logic, organizer approval flow |  | √ |
| Document storage | Upload/download document handling, storage provider integration |  | √ |
| Frontend pages/UI | Main pages, routing, form UI, dashboard layout | √ |  |
| Testing and bug fixing | Debugging, reviewing AI suggestions, fixing major issues | √ | √ |
| Deployment/config | Environment variables, package setup, deployment-related fixes | √ |  |
| Documentation/report | README, report writing, AI session record, presentation materials | √ | √ |

## Lessons Learned and Concluding Remarks
Through this project, we experienced how to build a full-stack system from scratch while making different parts work together reliably. During development, we realized that we need to consider everything carefully including: backend logic, frontend logic, database design, storage and deployment. Any small mistake may influence the whole system. It is actually hard to make sure each part is working and error-prone when we want to add some new functionalities to existing designs. Each new change is a challenge.

We also learned that project priorities are important. Within the limited course timelines, it was not realistic to perfect every part of the system. So we had to decide the more major issues. In our case, we focused more on core workflows first and then started to edit the main workflow by adding small new features. This strategy helped us to submit a complete website within time. 

Another lesson we learned was that AI can be a useful tool for brainstorming, debugging and suggesting. However, we need to check its suggestions carefully to make sure the project is working as expected as AI can make mistakes. It is still important for us to understand the concepts or logics before adopting AI’s suggestions. 

Overall, the project helped us understand the challenges and workflows of designing a real and complete web application. We not only learned conceptual knowledge, but also gained hands-on experiences and practical skills in designing, debugging and integrating different components into a cohesive application within a team setting. 
