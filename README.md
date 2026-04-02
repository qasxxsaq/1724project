# Event Ticketing Application - ECE1724 Project  
## Team Information  
Charles Yu 1006718348 charlesyuzq.yu@mail.utoronto.ca  
Yuchen Xu 1006708779 yuchenzoe.xu@mail.utoronto.ca  

## Demo 
[Demo Video](https://drive.google.com/file/d/1_hg8MsQ4MOP946OMp_6zK0lUd7eAztQZ/view?usp=sharing)  If the link doesn't work, the same video is also available in the root directory of this repo.  
Try the app live at: [Event Ticketing Application](https://frontend-production-9b35.up.railway.app/)

## Motivation
Many small and medium-sized student organizations such as campus clubs rely on Google Forms, spreadsheets or emails to manage event registration. When identity verification, event payment processing, or ticket validation are required, significant manual effort is typically involved. Organizers need to verify tickets, track approvals and distribute tickets separately. As a result, the process of recording and organizing event registration and participation data becomes time-consuming and error-prone. Additionally, real-time attendance tracking and fraud prevention are rarely supported in this process.

We aim to build a platform that provides a lightweight event and ticketing management system for small and medium-sized events that supports event publishing, identity verification, ticket generation, and ticket validation. This project is worth pursuing because event and ticket management remains inefficient and error-prone for many small or mid-sized student organizations. While there are large commercial platforms(such as Eventbrite), it is relatively complex to use them and the service fees are not low for small events. Therefore, a simple, efficient and fully featured event and ticketing management platform that reduces manual workload is in demand. 

The primary target users includes:
- Student event organizers (e.g., school clubs) who want to publish events, verify participants’ identity, and manage ticketing
- Attendees who need to register events, and access digital tickets

By integrating event publishing and management, ticket generation and validation into a single platform, this project demonstrates a practical and worthwhile solution that optimizes event workflows, reduces manual errors, and enhances the overall efficiency of small-scale event management. 

## Objective
The objective of this project is to develop an event ticketing platform, which includes an organizer mode for creating events and a customer mode for users to purchase tickets and receive downloadable QR codes. Specifically, organizers should be able to create events, monitor ticket selling status, and verify user-uploaded documents for discounts. Customers should be able to register/login, view event information, make purchases, upload documents and receive their downloadable tickets (a QR code with other information).  

## Technical Stack
### Implementation approach:
Frontend: TypeScript, React  
Backend: TypeScript, Express.js  
Tailwind CSS was used for styling.  
shadcn/ui library was used for reusable UI components.  
Responsive frontend layout was implemented to adapt different screen sizes, and was made mobile device compatible. Responsive interaction designs were also implemented, such as live notifications and live dashboards. 

### Database schema and relationships:
TypeScript was used for all backend/server code, and the relational database was created using PostgreSQL.  
Database schema included tables for organizer/customer accounts, event information, ticket information, etc. Here are some examples:  
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

Database relationships included the following:  
One-to-One → One profile per user is allowed.  
One-to-Many → One event has many tickets. One customer can attend multiple events.  
Many-to-Many → Many users can attend many events and own many tickets.  

### File storage:
Supabase cloud storage was applied for stable and persistent access of user documents (e.g. student ID) and tickets (QR codes), to ensure data durability.  
Users will still be able to retrieve their documents after potential system restart (e.g. for updates or maintainances).  

### Advanced Features:
The following 2 advanced features were implemented.

- User Authentication and Authorization:  
  - All users have their own private accounts, being able to register and login.
  - The application works in 2 operation modes, customer or organizer. 
    - Role-based access control was implemented for the 2 operation modes and to manage permissions. For example, for event operations, only organizers are allowed to create/edit/close an event, and only customers are allowed to purchase tickets.  
- Real-Time Functionality:  
  - WebSocket-based updates were applied for event updates.
  - Live notifications and live dashboards were implemented for instant and synchronized information delivery, such as change of time/location/price, number of tickets available, etc. 

## Features
This section lists main features (functionality focused) of the application, followed by an explanation of technical features (design focused) that matches with course requirements.  
### Functionality Focused Features:  
- Customer mode  
  - Purchase tickets  
  - upload/view/delete documents for special offers  
  - download QR code based tickets  
- Organizer mode  
  - Create/edit/delete events  
  - Verify customer uploaded documents and grant permission for special offers  
  - Monitor sales details. E.g. tickets sold, event status (available/sold out), revenue, etc.  
- General features across two operation modes  
  - Register/Login with an account
  - Browse, filter and search for events
  - live dashboards and live notifications

### Technical Features and Fulfillment of Course Requirements:  
Here is a summary of key features which are compliant with course requirements.  
- Frontend Requirements (Core Technical Requirement 1):
  - TypeScript was used for all frontend code.
  - React was used for UI development.
  - Tailwind CSS and shadcn/ui were both used for UI and styling.
  - Responsive layouts and designs were implemented with the accommodation of additional features.
- Data Storage Requirements (Core Technical Requirement 2):
  - TypeScript was used for backend server code.
  - PostgreSQL was used for the relational database.
  - Supabase storage was used for cloud storage and file handling.
- Architecture Approach (Core Technical Requirement 3):
  - Option B was chosen (Separate Frontend & Backend), with React for frontend UI, Express.js for backend server, and RESTful API design with documentation.
- User Authentication and Authorization (Additional Feature 1):  
  - Support register/login with individual accounts.
  - 2 operation modes (customer/organizer) with roled-based functionality access control.
- Real-Time Functionality (Additional Feature 2):  
  - Live notifications for event creations/updates/cancellations.  
  - Live dashboard for ticket and event information.

These functionalities and features together form a complete and reliable system, and are sufficient to support small-scale activities such as events by student unions. Therefore, it successfully achieved our objectives.  

## User Guide
- Register: an account is required when using the app.
  1. Click `Register` on the top right corner of the page
  2. Enter your desired username and password
  3. Select your intended role, customer for purchasing, organizer for selling
- Login: enter your username and password to login.
- Browse events: click `Events` in the top menu to view.
- Event Filter
  - Type in the search box or select from the dropdown menus to filter events.
  - Click `Reset filters` to reset.
- Live notifications and dashboard
  - If event updates pop up, click "view" for the change.
- Ticket purchases (Customer mode specific)
  1. Check the discount box if you think you are qualified.
  2. Click `Buy ticket` to purchase
  3. If you choose the discount option, the actual QR code will be generated after an organizer verifies it.
  4. Once the QR code is generated, click on `My Tickets` on the top menu to view and download the tickets.
- Document uploads (Customer mode specific)  
  1. Click `My Documents` in the top menu.
  2. Select your document type.
  3. Choose your file from your computer and upload.
  4. Once uploaded, you will be able to view/download/delete your document.

- Event operations (Organizer specific)
  - Creation
    1. Click on `Create Event` in the top menu.
    2. Enter all required fields for event details.
    3. Click on `Create event` at the bottom.
  - Edit and Delete
    1. Once events are created, you will be able to view them by clicking `My Events` in the top menu.
    2. On My Events page, click `Delete` to delete an event. This action cannot be undone. 
    3. On My Events page, click `Edit` to edit an event. The edit process is similar to the creation process.
  - Monitor events
    1. Click `View/Hide sales details` to view sales information.
    2. On the top right corner of `My Events` page, there is also some revenue and status information. Check them there.
- Discount verification (Organizer specific)  
  1. Check the below to view the customers’ documents.  
`My Events`→`View sales details` on the specific event→`View ticket details`  
  2. View/Download proof
  3. Approve/Reject discount.  

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
1. Create a new project and add 3 services, frontend (hosted from the /frontend folder from GitHub), backend (the /backend folder), and PostgreSQL database.
2. Configure backend service variables. E.g. The .env variables in local development and `DATABASE_URL` from the database service.
3. Configure frontend service variables. There is just one to configure:
`VITE_API_URL=the backend service url`
4. Set Public Networking for the frontend. Be careful of the port number (using the default should be fine).

## Deployment Information
The application is deployed on Railway. It is available at: [frontend-production-9b35.up.railway.app](https://frontend-production-9b35.up.railway.app/)  

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
