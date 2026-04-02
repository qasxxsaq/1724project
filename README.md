# Event Ticketing Application - ECE1724 Project 
## Team Information  
Charles Yu 1006718348 charlesyuzq.yu@mail.utoronto.ca  
Yuchen Xu 1006708779 yuchenzoe.xu@mail.utoronto.ca  

## Motivation (to be edited)
Many small and medium-sized student organizations such as campus clubs rely on Google Forms, spreadsheets or emails to manage event registration. When identity verification, event payment processing, or ticket validation are required, significant manual effort is typically involved. Organizers need to verify tickets, track approvals and distribute tickets separately. As a result, the process of recording and organizing event registration and participation data becomes time-consuming and error-prone. Additionally, real-time attendance tracking and fraud prevention are rarely supported in this process.

We aim to build a platform that provides a lightweight event and ticketing management system for small and medium-sized events that supports event publishing, identity verification, ticket generation, and ticket validation. This project is worth pursuing because event and ticket management remains inefficient and error-prone for many small or mid-sized student organizations. While there are large commercial platforms(such as Eventbrite), it is relatively complex to use them and the service fees are not low for small events. Therefore, a simple, efficient and fully featured event and ticketing management platform that reduces manual workload is in demand. 

The primary target users includes:
- Student event organizers (e.g., school clubs) who want to publish events, verify participants’ identity, and manage ticketing
- Attendees who need to register events, and access digital tickets

By integrating event publishing and management, ticket generation and validation into a single platform, this project demonstrates a practical and worthwhile solution that optimizes event workflows, reduces manual errors, and enhances the overall efficiency of small-scale event management. 

## Objective (To be edited)
The objective of this project is to develop an event ticketing platform, which includes an organizer mode for managing events and a customer mode for users to purchase and manage tickets. Specifically, organizers will be able to create events, monitor ticket selling status, and verify user-uploaded documents for discounts. Customers will be able to register/login, view event information, make purchases, upload documents and receive their downloadable tickets (a QR code with other information).  

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
