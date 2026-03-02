# 1724project
## Motivation
Many small and medium-sized student organizations such as campus clubs rely on Google Forms, spreadsheets or emails to manage event registration. When identity verification, event payment processing, or ticket validation are required, significant manual effort is typically involved. Organizers need to verify tickets, track approvals and distribute tickets separately. As a result, the process of recording and organizing event registration and participation data becomes time-consuming and prone to human error. Additionally, real-time attendance tracking and fraud prevention are rarely supported in this process.

We aim to build a platform that provides a lightweight event and ticketing management system for small and medium-sized events that supports event publishing, identity verification, ticket generation, and ticket validation. This project is worth pursuing because event and ticket management remains inefficient and error-prone for many small or mid-sized student organizations. While there are large commercial platforms(such as Eventbrite), it is relatively complex to use them and the service fees are not low for small events. Therefore, a simple, efficient and fully featured event and ticketing management platform that reduces manual workload is in demand. 

The primary target users includes:
- Student event organizers (e.g., school clubs) who want to publish events, verify participants’ identity, and manage ticketing
- Attendees who need to register events, and access digital tickets

By integrating event publishing and management, ticket generation and validation into a single platform, this project demonstrates a practical and worthwhile solution that optimizes event workflows, reduces manual errors, and enhances the overall efficiency of small-scale event management. 

## Objective and Key Features
### Objective:
The objective of this project is to develop an event ticketing platform, which includes an organizer mode for managing events and a customer mode for users to purchase and manage tickets. Specifically, organizers will be able to create events, monitor ticket selling status, and verify user-uploaded documents for discounts. Customers will be able to register/login, view event information, make purchases, upload documents and receive their downloadable tickets (a QR code with other information).  

### Core Features:
#### Technical implementation approach
Frontend: TypeScript, React  
Backend: TypeScript, Express.js  
Tailwind CSS will be used for styling.  
shadcn/ui library will be used to assist development and improve efficiency.  

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
```
Note: Both the organizers and the customers are users of this application, and hence use the same table.
```ruby
-- Events table
CREATE TABLE events (
    event_id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    created_by INTEGER NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    max_tickets INTEGER NOT NULL,
    price INTEGER NOT NULL
);
-- Tickets table
CREATE TABLE tickets (
    ticket_id INTEGER PRIMARY KEY,
    event_id INTEGER NOT NULL
    belongs_to INTEGER NOT NULL
);
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

## Tentative Plan
Our project timeline is approximately four weeks from March 1 to 28. The specific assignment of team members (A and B) will be finalized during Phase 1 after further discussion and detailed planning. We mainly divide the development process into four phases:

Phase 1: System Design & Project Setup (week 1- March 1 to 7)
During the first phase, we will:
- Build system architecture(A)
- Setup development environment(A)
- Configure Express.js backend skeleton and basic routing (A)
- Design database schema and relationships(B)
- Create PostgreSQL database (B)
- Design basic UI structure for both organizer and customer mode (A&B)
- Define REST API endpoints(A&B)

Phase 2: Core Feature Development (week 2 - March 8 to 14)
In the second phase, we will implement the core features for both frontend and backend:
- Authentication
  - User registration and login feature (A)
  - Role selection (organizer or customer) (A)
  - Public event browsing homepage (B)
- Organizer Event Management
  - Organizer Home page (A)
  - Event Creation form (B)
  - Edit/delete event (B)
  - Ticket sales monitoring dashboard (A)
- Customer Ticket Purchase and Management
  - Event detail page (A)
  - Ticket purchase flow (including uploading student verification) (A)
  - Ticket tracking (B)
  - Ticket download page with QR display (B)
- Integration
  - Connect frontend pages with backend APIs (A&B)

Phase 3: Integration, Testing & Presentation Preparation (week 3 - March 15 to 21)
During the third phase, the team focuses on system integration and improvement. Both team members will collaborate on the final testing and presentation preparation. There are the following tasks:
- Full system integration and bug fixing (A&B)
- Perform end-to-end testing for all user flows (A&B)
- Prepare demo script (A&B)
- Draft presentation slides (A&B)

Phase 4: Additional Feature Development & Finalization (week 4 - March 22 to 28)
In this final phase, the team will implement additional features and conduct final testing. At least two additional features will be guaranteed to be completed, while the remaining features will be implemented if time permits. At the same time, the final deliverables will be prepared collaboratively by the team members. The following additional features work division will be:
- Additional Feature
  - Real-Time Updates (WebSocket) (A)
  - Email Notification for new events (B)
- Final testing and bug fixes (A&B)
- Prepare final report and documentation (A&B)
- Record demo video (A&B)

## Initial Independent Reasoning (Before Using AI)
Our initial decision is to use separate frontend and backend, with React for frontend, and Express for backend with REST APIs. In this way, the frontend and backend are independent which makes the code easier to understand and maintain.This also allows a better independent development. For a team project, separating frontend and backend makes parallel work easier.

For the database, we expect to have the following relational entities stored in PostgreSQL: Users, Events, Registrations, Tickets, Student Verification. The database will be processed in the backend to ensure consistency and the frontend will primarily fetch and display data through REST APIs. The client-side state will be limited to UI interactions such as form inputs. 

We will focus on building a complete workflow instead of adding many features in the beginning. Our main features include: role-based authentication (Organizer or Attendee), event creation and management, QR-based ticket generation and validation, student ID upload and verification. For additional features, we still need to decide. We will not implement real payment processing, considering the complexity of it within the limited timeline. Our aim is to build a smaller but well-integrated system instead of a larger but incomplete platform. 

Before start, we expect the following challenges: 
- We need to design a clean role-based authentication since organizers and attendees have different interfaces and permissions.
- Building system architecture and designing a feasible database schema could be challenging because it is the basement of the whole project. We need to think clearly about how to coordinate frontend and backend development.
- Secure QR validation may be a challenge because we may need to cope with multiple requests simultaneously. The backend logic needed to be carefully designed to ensure safety. 

For work division, we decided to divide responsibilities by features. We will divide the main features to each team member since this would reduce fragmentation and improve consistency. Before feature implementation, we plan to jointly design the database schema, project architecture and APIs to ensure misunderstanding and inconsistency in the later phase. 

## AI Assistance Disclosure
We did not use AI at all in part 4 and 5. We mainly use AI tools on grammar checking in part 1, 2 and 3. For example, in the motivation part, we asked AI if there are any grammar mistakes or phrases that need improvement. AI suggested that we can change “event posting and managing” to “event publishing and management”. We discussed whether the change would affect the clarity of the sentence. We decided to adopt the AI’s suggestion because it sounds more formal.
