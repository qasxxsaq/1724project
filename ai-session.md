## Session Title: Student Discount Ticket Workflow

### Prompt (you sent to AI)

For event ticketing platform project, users can buy tickets and some events offer a student discount. We want to make sure users could not get discounted ticket immediately without any review. Could you give us some backend design suggestions? 

### AI Response (trimmed if long)

The original response was too long so we trimmed.

AI's main idea was that student discount should be reviewed first before generating any ticket. It suggested splitting the backend flow into two parts. 

First, when a user buys a discounted ticket, the backend should check whether the event supports `studentDiscount` and whether the user has already uploaded a `student_id` document. If those checks pass, the system can still create the ticket, but it should be saved as pending instead of fully finalized.

The response also suggested recording the discounted price and the review status at purchase time, while leaving the final ticket code empty until the organizer approves it. Then, in a separate organizer approval step, the organizer can review the case and the system can generate the final code only after approval.

For example:
When user creates an order, we can do the following in the backend:
1. Fetch event
2. If ticketType === STUDENT:
    - Check hasStudentDiscount
    - Query StudentVerification:
        - userId
        - eventId
        - status = APPROVED
3. If not approved → reject request
4. If approved → apply studentPrice
5. Otherwise → use basePrice

It also suggested some possible database design.

For API design, it suggested the following structures:
1. Submit student verification
```http
POST /events/:eventId/verifications
```
2. Organizer reviews requests
```http
GET /organizer/events/:eventId/verifications?status=PENDING
```
3. Approve / reject
```http
PATCH /organizer/verifications/:id
```
Addtionally, AI suggested to use helper functions.

### What Your Team Did With It

- We used the main workflow idea in our own project. In `POST /events/:id/buy`, the backend checks the event setting and the uploaded `student_id` document, then saves the discounted ticket as pending with no final code yet.
- We also used the idea for approving the ticket before generating. In `POST /tickets/:id/review/approve`, the organizer can approve the discounted ticket, and only then is the final code generated.
- We adopted the overall workflow but not the exact architecture or API. Our project does not have a separate verification resource, because for our current scope it was simpler to reuse the existing routes.
- We did not fully follow the helper-function suggestion, because our backend was small enough to keep most of the logic in the existing routes.

---

## Session Title: Replacing DigitalOcean Storage

### Prompt (you sent to AI)

We originally planned to use DigitalOcean object storage for project cloud documents storage, but it is not free. What can we use instead?

### AI Response (trimmed if long)

Yes — for a student project, there are a few good substitutes.

My top recommendation is Cloudflare R2. It has a free tier with 10 GB-month of storage, 1 million Class A operations, 10 million Class B operations, and no egress fee to the Internet for the standard tier, which makes it a strong fit for storing uploaded IDs, ticket assets, or event images. It is also S3-compatible, so the integration pattern is similar to object storage systems like DigitalOcean Spaces.

A very practical second option is Supabase Storage, especially if your project is already using Supabase for auth or database features. Supabase’s pricing page says the free plan includes 1 GB file storage, and the paid plans increase storage and bandwidth from there. For a course project with modest uploads, that can be enough.

Another option is Oracle Cloud Free Tier. Oracle says its free tier includes storage services, and its Always Free documentation states that accounts get 20 GB total of object/archive storage plus 50,000 Object Storage API requests per month. That is generous on paper, though many teams find Oracle’s setup a bit heavier than R2 or Supabase.

For your specific use case, you probably only need storage for:
- uploaded student verification documents
- event poster images
- maybe QR code images or downloadable ticket PDFs

A small design suggestion: for sensitive student ID uploads, avoid making the bucket public. Store files in a private bucket, save only the object key in your database, and serve them through a backend route that checks organizer permissions before generating a temporary access URL. That keeps the verification documents much safer.

### What Your Team Did With It

- After comparing the options, we decided to use Supabase Storage. For our project, this felt like the most practical choice. We do not expect a very large number of uploads, so the free tier should be enough for our student ID documents and other small files. It also seemed easier for us to set up and understand, so we thought it was a better fit for our course timeline. 

- We did not choose some of the other options because they either felt more complicated to set up, were less familiar to us.

---

## Session Title: Checking Potential Problems in the Project

### Prompt (you sent to AI)

Check the project files and point out possible exsiting problems. We wanted to know which issues were more serious, and which ones we should fix first.

### AI Response (trimmed if long)

The original response was too long so we trimmed.

AI pointed out the following possible issues:
1. Risk of overselling tickets in the buy route because of concurrency.
2. JWT secret was hardcoded, and token expiration was missing.
3. Frontend TypeScript problems caused by `react-router-dom` type mismatch.
4. `dotenv` was being used in the backend, but the dependency setup was incomplete.
5. The `role` field in registration was not validated strictly enough.
6. `MyEvents` used repeated polling, which could lead to unnecessary requests or repeated errors.
7. Login state in `localStorage` could become inconsistent if values like `userId` were not cleared properly on logout.

Overall, AI suggested fixing correctness and security issues first, then dealing with frontend behavior and cleanup issues after that.

### What Your Team Did With It

- We used this review to decide what to fix first. We focused on the issues that could directly affect correctness or security.
- Based on that, we fixed several of the problems AI listed. We changed the JWT secret to an environment variable, added token expiration, added the missing `dotenv` dependency, changed the ticket purchase logic to a safer conditional update, and removed the wrong `react-router-dom` type package that was causing frontend type errors.
- We did not fix everything. We left some lower-priority issues, such as stricter `role` validation and reducing polling in `MyEvents`, because those parts might still change later when we add more code. We decided to solve the more risky problems first, so they would not cause bigger issues in the project.
